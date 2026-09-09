import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScheduleBuilder } from './components/ScheduleBuilder';
import { WhatsAppDispatchPanel } from './components/WhatsAppDispatchPanel';
import { RosterManager } from './components/RosterManager';
import { TripPlanner } from './components/TripPlanner';
import { DispatchHistory } from './components/DispatchHistory';
import { ProgressViewer } from './components/ProgressViewer';
import { DailyPlan, DispatchLog, TeamMember } from './types';
import { DEFAULT_ROSTER } from './data/defaultRoster';
import { PRESET_TEMPLATES } from './data/activityDefinitions';
import { safeStorage } from './utils/safeStorage';

// Helper to get tomorrow's date formatted as YYYY-MM-DD
function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'schedule' | 'dispatch' | 'roster' | 'trip' | 'history' | 'progress'>('schedule');

  // Load roster from safeStorage or default with multi-key permanent fallback
  const [members, setMembers] = useState<TeamMember[]>(() => {
    const candidateKeys = [
      'ucam_roster_v6',
      'ucam_roster_v5',
      'ucam_roster_permanent',
      'ucam_roster_v4',
      'ucam_roster_v3',
      'ucam_roster_v2',
      'ucam_roster',
      'ucam_roster_backup'
    ];

    const isPlaceholderPhone = (phone?: string) => {
      if (!phone) return true;
      return /^\+346(001122|112233|223344)\d{2}$/.test(phone);
    };

    for (const key of candidateKeys) {
      const saved = safeStorage.getItem(key);
      if (saved) {
        try {
          const parsed: TeamMember[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Keep all user customizations (phone, position/cargo, name, notes, custom members)
            const savedMap = new Map(parsed.map(m => [m.id, m]));
            // Merge defaults with saved customizations to ensure full coverage
            const defaultMap = new Map(DEFAULT_ROSTER.map(d => [d.id, d]));
            const merged: TeamMember[] = parsed.map(m => {
              // Ensure medical is migrated to staff if old format
              const normalizedRole = m.role === ('medical' as any) ? ('staff' as const) : m.role;
              const def = defaultMap.get(m.id);
              const license = m.role === 'player' 
                ? (m.license || def?.license || 'Foreign player')
                : undefined;
              
              // If the saved phone is an old placeholder, upgrade to the real phone in DEFAULT_ROSTER
              const phone = isPlaceholderPhone(m.phone) && def?.phone ? def.phone : m.phone;
              // If the saved position is empty or old placeholder, upgrade
              const position = m.position || def?.position;
              // If jerseyNumber is missing, take from def
              const jerseyNumber = m.jerseyNumber !== undefined ? m.jerseyNumber : def?.jerseyNumber;

              return { 
                ...m, 
                role: normalizedRole,
                phone,
                position,
                jerseyNumber,
                ...(license ? { license } : {})
              };
            });

            // Insert or append any official members that might not be in the saved list
            for (const def of DEFAULT_ROSTER) {
              if (!savedMap.has(def.id)) {
                if (def.role === 'player') {
                  const lastPlayerIdx = merged.map(m => m.role).lastIndexOf('player');
                  if (lastPlayerIdx !== -1) {
                    merged.splice(lastPlayerIdx + 1, 0, def);
                  } else {
                    merged.unshift(def);
                  }
                } else {
                  merged.push(def);
                }
              }
            }
            return merged;
          }
        } catch (e) {
          console.error(`Failed to parse saved roster from ${key}`, e);
        }
      }
    }
    return DEFAULT_ROSTER;
  });

  // Save roster to safeStorage across multiple permanent keys + sync to server disk
  useEffect(() => {
    if (!members || members.length === 0) return;
    const json = JSON.stringify(members);
    safeStorage.setItem('ucam_roster_v6', json);
    safeStorage.setItem('ucam_roster_v5', json);
    safeStorage.setItem('ucam_roster_permanent', json);
    safeStorage.setItem('ucam_roster_v4', json);
    safeStorage.setItem('ucam_roster_v3', json);
    safeStorage.setItem('ucam_roster_backup', json);

    // Also persist to server disk endpoint asynchronously
    try {
      fetch('/api/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
      }).catch(() => {
        // Safe failover if offline or standalone
      });
    } catch {
      // Ignore
    }
  }, [members]);

  // On mount, check if server has saved roster (e.g. across different devices or browsers)
  useEffect(() => {
    fetch('/api/roster')
      .then(res => res.ok ? res.json() : null)
      .then(serverRoster => {
        if (Array.isArray(serverRoster) && serverRoster.length > 0) {
          setMembers(prev => {
            // If local storage only has default unmodified values, adopt server values
            const hasLocalCustom = safeStorage.getItem('ucam_roster_permanent') || safeStorage.getItem('ucam_roster_v3');
            if (!hasLocalCustom) {
              return serverRoster;
            }
            return prev;
          });
        }
      })
      .catch(() => {
        // Safe failover
      });

    // Also fetch permanent WhatsApp group links from server
    fetch('/api/group-links')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          if (data.staffGroupUrl) {
            safeStorage.setItem('ucam_permanent_link_collective_staff', data.staffGroupUrl);
            setPlan(p => ({ ...p, staffGroupUrl: p.staffGroupUrl || data.staffGroupUrl }));
          }
          if (data.allTeamGroupUrl) {
            safeStorage.setItem('ucam_permanent_link_all_team', data.allTeamGroupUrl);
            setPlan(p => ({ ...p, allTeamGroupUrl: p.allTeamGroupUrl || data.allTeamGroupUrl }));
          }
        }
      })
      .catch(() => {
        // Safe failover
      });
  }, []);

  // Initial Default Plan (Preset with Game Day / Work Plan for tomorrow)
  const [plan, setPlan] = useState<DailyPlan>(() => {
    const tomorrowStr = getTomorrowDateString();
    const saved = safeStorage.getItem(`ucam_plan_v4_${tomorrowStr}`) ||
                  safeStorage.getItem(`ucam_plan_v3_${tomorrowStr}`) ||
                  safeStorage.getItem(`ucam_plan_${tomorrowStr}`);

    const permanentStaffUrl = safeStorage.getItem('ucam_permanent_link_collective_staff') || '';
    const permanentAllTeamUrl = safeStorage.getItem('ucam_permanent_link_all_team') || '';

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          staffGroupUrl: parsed.staffGroupUrl || permanentStaffUrl,
          allTeamGroupUrl: parsed.allTeamGroupUrl || permanentAllTeamUrl,
        };
      } catch (e) {
        console.error('Failed to parse saved plan', e);
      }
    }

    // Default to double session / clean schedule for tomorrow
    const template = PRESET_TEMPLATES[1]; // Double session
    return {
      id: `plan-${tomorrowStr}`,
      date: tomorrowStr,
      title: 'Plan de Trabajo - Previa vs Valencia Basket (Liga Endesa)',
      notesForTeam: '',
      staffGroupUrl: permanentStaffUrl,
      allTeamGroupUrl: permanentAllTeamUrl,
      items: template.items.map((it, idx) => ({
        ...it,
        id: `item-${Date.now()}-${idx}`,
        targetAudience: it.targetAudience as any,
        tapedOption: (it as any).tapedOption,
        mealType: (it as any).mealType,
        luggageOption: (it as any).luggageOption,
      })),
      isScheduled: false,
    };
  });

  // Save active plan & permanent group links to safeStorage
  useEffect(() => {
    if (plan && plan.date) {
      safeStorage.setItem(`ucam_plan_v4_${plan.date}`, JSON.stringify(plan));
      if (plan.staffGroupUrl) {
        safeStorage.setItem('ucam_permanent_link_collective_staff', plan.staffGroupUrl);
      }
      if (plan.allTeamGroupUrl) {
        safeStorage.setItem('ucam_permanent_link_all_team', plan.allTeamGroupUrl);
      }
    }
  }, [plan]);

  // Dispatch logs
  const [logs, setLogs] = useState<DispatchLog[]>(() => {
    const saved = safeStorage.getItem('ucam_dispatch_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse logs', e);
      }
    }
    return [
      {
        id: 'log-1',
        planId: 'initial',
        planDate: getTomorrowDateString(),
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        channel: 'collective_players',
        recipientName: 'Grupo Jugadores UCAM Murcia',
        status: 'copied',
        messageSnippet: '🏀 UCAM MURCIA CLUB DE BALONCESTO - PLAN DE TRABAJO...',
      }
    ];
  });

  // Save logs to safeStorage
  useEffect(() => {
    safeStorage.setItem('ucam_dispatch_logs', JSON.stringify(logs));
  }, [logs]);

  const handleAddLog = (newLog: Omit<DispatchLog, 'id' | 'timestamp'>) => {
    const entry: DispatchLog = {
      ...newLog,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [entry, ...prev]);
  };

  const handleClearLogs = () => {
    setLogs([]);
    safeStorage.removeItem('ucam_dispatch_logs');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      
      {/* App Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        plan={plan}
        setPlan={setPlan}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'schedule' && (
          <ScheduleBuilder
            plan={plan}
            setPlan={setPlan}
            members={members}
            onGoToDispatch={() => setCurrentTab('dispatch')}
          />
        )}

        {currentTab === 'dispatch' && (
          <WhatsAppDispatchPanel
            plan={plan}
            setPlan={setPlan}
            members={members}
            onAddLog={handleAddLog}
          />
        )}

        {currentTab === 'roster' && (
          <RosterManager
            members={members}
            setMembers={setMembers}
          />
        )}

        {currentTab === 'trip' && (
          <TripPlanner
            members={members}
          />
        )}

        {currentTab === 'history' && (
          <DispatchHistory
            logs={logs}
            onClearLogs={handleClearLogs}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressViewer />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span className="font-semibold text-stone-400">UCAM Murcia CB · Delegado Hub v1.0</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Liga Endesa / Basketball Champions League</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
