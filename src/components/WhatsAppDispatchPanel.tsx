import React, { useState, useEffect } from 'react';
import { 
  Send, Users, User, Check, Copy, ExternalLink, 
  CheckCircle2, MessageSquare, 
  Sparkles, Smartphone, Play, SkipForward,
  Link2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyPlan, DispatchChannel, DispatchLog, TeamMember } from '../types';
import { buildWhatsAppUrl, generateWhatsAppMessage, formatDateEnglish } from '../utils/whatsappGenerator';
import { safeStorage } from '../utils/safeStorage';

interface WhatsAppDispatchPanelProps {
  plan: DailyPlan;
  setPlan: React.Dispatch<React.SetStateAction<DailyPlan>>;
  members: TeamMember[];
  onAddLog: (log: Omit<DispatchLog, 'id' | 'timestamp'>) => void;
}

export const WhatsAppDispatchPanel: React.FC<WhatsAppDispatchPanelProps> = ({
  plan,
  setPlan,
  members,
  onAddLog,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<DispatchChannel>('all_team');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  // Group URLs state with permanent persistence
  const [staffGroupUrl, setStaffGroupUrl] = useState<string>(() => {
    return safeStorage.getItem('ucam_permanent_link_collective_staff') || plan.staffGroupUrl || '';
  });
  const [allTeamGroupUrl, setAllTeamGroupUrl] = useState<string>(() => {
    return safeStorage.getItem('ucam_permanent_link_all_team') || plan.allTeamGroupUrl || '';
  });

  // Sync with server file on mount
  useEffect(() => {
    fetch('/api/group-links')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          if (data.staffGroupUrl) {
            setStaffGroupUrl(data.staffGroupUrl);
            safeStorage.setItem('ucam_permanent_link_collective_staff', data.staffGroupUrl);
            setPlan(p => ({ ...p, staffGroupUrl: data.staffGroupUrl }));
          }
          if (data.allTeamGroupUrl) {
            setAllTeamGroupUrl(data.allTeamGroupUrl);
            safeStorage.setItem('ucam_permanent_link_all_team', data.allTeamGroupUrl);
            setPlan(p => ({ ...p, allTeamGroupUrl: data.allTeamGroupUrl }));
          }
        }
      })
      .catch(() => {
        // Safe failover
      });
  }, []);

  // Update handlers with multi-layer persistence
  const updateStaffGroupUrl = (val: string) => {
    setStaffGroupUrl(val);
    safeStorage.setItem('ucam_permanent_link_collective_staff', val);
    safeStorage.setItem('ucam_group_link_staff_v2', val);
    setPlan(p => ({ ...p, staffGroupUrl: val }));

    try {
      fetch('/api/group-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffGroupUrl: val, allTeamGroupUrl }),
      }).catch(() => {});
    } catch {
      // Ignore
    }
  };

  const updateAllTeamGroupUrl = (val: string) => {
    setAllTeamGroupUrl(val);
    safeStorage.setItem('ucam_permanent_link_all_team', val);
    safeStorage.setItem('ucam_group_link_all_team_v2', val);
    setPlan(p => ({ ...p, allTeamGroupUrl: val }));

    try {
      fetch('/api/group-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffGroupUrl, allTeamGroupUrl: val }),
      }).catch(() => {});
    } catch {
      // Ignore
    }
  };

  // Keep plan updated if permanent URLs exist
  useEffect(() => {
    if (staffGroupUrl && plan.staffGroupUrl !== staffGroupUrl) {
      setPlan(p => ({ ...p, staffGroupUrl }));
    }
    if (allTeamGroupUrl && plan.allTeamGroupUrl !== allTeamGroupUrl) {
      setPlan(p => ({ ...p, allTeamGroupUrl }));
    }
  }, [plan.date]);

  // Sequential Queue State for 1-by-1 sending
  const [isQueueActive, setIsQueueActive] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);

  const players = members.filter(m => m.role === 'player' && m.isActive);
  const staff = members.filter(m => (m.role === 'staff' || m.role === 'medical') && m.isActive);

  // Set default selected member when channel changes
  useEffect(() => {
    if (selectedChannel === 'individual_players' && players.length > 0) {
      if (!selectedMemberId || !players.some(p => p.id === selectedMemberId)) {
        setSelectedMemberId(players[0].id);
      }
    } else if (selectedChannel === 'individual_staff' && staff.length > 0) {
      if (!selectedMemberId || !staff.some(s => s.id === selectedMemberId)) {
        setSelectedMemberId(staff[0].id);
      }
    }
  }, [selectedChannel, members]);

  // Current recipient for preview
  const currentRecipient = (selectedChannel === 'individual_players' || selectedChannel === 'individual_staff')
    ? members.find(m => m.id === selectedMemberId)
    : undefined;

  // Generated message text in English
  const messageText = generateWhatsAppMessage(plan, selectedChannel, members, currentRecipient);

  // Handlers
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2500);

    onAddLog({
      planId: plan.id,
      planDate: plan.date,
      channel: selectedChannel,
      recipientName: currentRecipient ? currentRecipient.name : getChannelLabel(selectedChannel),
      recipientPhone: currentRecipient?.phone,
      status: 'copied',
      messageSnippet: messageText.substring(0, 100) + '...',
    });
  };

  const handleOpenWhatsApp = (phone?: string, recipientName?: string) => {
    const targetPhone = phone || currentRecipient?.phone;
    if (!targetPhone) {
      alert('Please select or specify a valid WhatsApp phone number.');
      return;
    }

    // Always copy message text to clipboard for safety
    navigator.clipboard.writeText(messageText);

    const url = buildWhatsAppUrl(targetPhone, messageText);
    showToast(`🚀 Abriendo WhatsApp para ${recipientName || currentRecipient?.name || 'contacto'}... Mensaje listo.`);
    window.open(url, '_blank', 'noopener,noreferrer');

    const key = `${selectedChannel}-${recipientName || currentRecipient?.id || 'group'}`;
    setSentMap(prev => ({ ...prev, [key]: true }));

    onAddLog({
      planId: plan.id,
      planDate: plan.date,
      channel: selectedChannel,
      recipientName: recipientName || currentRecipient?.name || getChannelLabel(selectedChannel),
      recipientPhone: targetPhone,
      status: 'sent',
      messageSnippet: messageText.substring(0, 100) + '...',
    });
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenGroupWhatsApp = () => {
    let groupLink = '';
    if (selectedChannel === 'collective_staff') groupLink = staffGroupUrl;
    else if (selectedChannel === 'all_team') groupLink = allTeamGroupUrl;

    // Always copy message text to clipboard
    navigator.clipboard.writeText(messageText);

    if (groupLink && groupLink.trim().startsWith('http')) {
      showToast('📋 ¡Texto copiado al portapapeles! Abriendo el grupo de WhatsApp...');
      window.open(groupLink.trim(), '_blank', 'noopener,noreferrer');
    } else {
      showToast('📋 ¡Texto copiado! Introduce el enlace del grupo en la casilla superior para acceder directamente.');
      window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
    }

    onAddLog({
      planId: plan.id,
      planDate: plan.date,
      channel: selectedChannel,
      recipientName: getChannelLabel(selectedChannel),
      status: 'sent',
      messageSnippet: messageText.substring(0, 100) + '...',
    });
  };

  function getChannelLabel(ch: DispatchChannel): string {
    switch (ch) {
      case 'individual_players': return 'Individual Players (1-on-1)';
      case 'individual_staff': return 'Individual Staff (1-on-1)';
      case 'collective_staff': return 'Coaching Staff Collective (Group)';
      case 'all_team': return 'Full Team (All Members Group)';
    }
  }

  // Queue list for sequential sending
  const currentQueueList = selectedChannel === 'individual_players' ? players : staff;
  const currentQueueMember = currentQueueList[queueIndex];

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] px-4 animate-in slide-in-from-top-4 duration-200">
          <div className="bg-stone-900/95 border-2 border-amber-400 text-stone-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <p className="text-xs font-semibold leading-snug">{toastMessage}</p>
          </div>
        </div>
      )}
      
      {/* Target Channels Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="pb-2 border-b border-stone-800">
          <h2 className="text-xl font-black text-white tracking-wide">
            DISPATCH CHANNELS & SCHEDULE BROADCAST
          </h2>
        </div>

        {/* 4 Channel Selection Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          {/* 1. All Team Group */}
          <button
            onClick={() => { setSelectedChannel('all_team'); setIsQueueActive(false); }}
            className={`flex flex-col p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedChannel === 'all_team'
                ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950 ring-1 ring-red-500'
                : 'bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] bg-amber-950 border border-amber-700/60 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                All Club
              </span>
            </div>
            <span className="font-bold text-xs mt-2 text-white">All Team Members</span>
            <span className="text-[10px] text-stone-400 mt-0.5">Complete schedule for all team members</span>
          </button>

          {/* 2. Collective Staff Group */}
          <button
            onClick={() => { setSelectedChannel('collective_staff'); setIsQueueActive(false); }}
            className={`flex flex-col p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedChannel === 'collective_staff'
                ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950 ring-1 ring-red-500'
                : 'bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] bg-purple-950 border border-purple-700/60 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                Group
              </span>
            </div>
            <span className="font-bold text-xs mt-2 text-white">Collective Staff</span>
            <span className="text-[10px] text-stone-400 mt-0.5">Direct dispatch to Coaching Staff Group</span>
          </button>

          {/* 3. Individual Players */}
          <button
            onClick={() => { setSelectedChannel('individual_players'); setIsQueueActive(false); }}
            className={`flex flex-col p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedChannel === 'individual_players'
                ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950 ring-1 ring-red-500'
                : 'bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <User className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] bg-red-900/60 text-red-200 px-1.5 py-0.5 rounded font-mono font-bold">
                {players.length} Players
              </span>
            </div>
            <span className="font-bold text-xs mt-2 text-white">Individual Players</span>
            <span className="text-[10px] text-stone-400 mt-0.5">1-on-1 personalized schedule</span>
          </button>

          {/* 4. Individual Staff */}
          <button
            onClick={() => { setSelectedChannel('individual_staff'); setIsQueueActive(false); }}
            className={`flex flex-col p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedChannel === 'individual_staff'
                ? 'bg-red-950/80 border-red-500 text-white shadow-lg shadow-red-950 ring-1 ring-red-500'
                : 'bg-stone-950/70 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded font-mono font-bold">
                {staff.length} Staff
              </span>
            </div>
            <span className="font-bold text-xs mt-2 text-white">Individual Staff</span>
            <span className="text-[10px] text-stone-400 mt-0.5">1-on-1 message for staff members</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Recipient Selector / Queue & Right Phone Mockup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Member list & Actions */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Individual Recipient Selector */}
          {(selectedChannel === 'individual_players' || selectedChannel === 'individual_staff') && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    {selectedChannel === 'individual_players' ? 'Player Roster' : 'Coaching & Medical Staff'}
                  </h3>
                </div>

                <button
                  onClick={() => setIsQueueActive(!isQueueActive)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    isQueueActive
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isQueueActive ? 'Exit Queue Mode' : 'Sequential Queue'}</span>
                </button>
              </div>

              {/* Sequential Queue Assistant View */}
              {isQueueActive && currentQueueMember && (
                <div className="p-4 bg-stone-950 border border-amber-500/40 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">
                      Queue Progress ({queueIndex + 1} of {currentQueueList.length})
                    </span>
                    <span className="font-mono text-stone-400">
                      {Math.round(((queueIndex + 1) / currentQueueList.length) * 100)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${((queueIndex + 1) / currentQueueList.length) * 100}%` }}
                    />
                  </div>

                  <div className="p-3 bg-stone-900 rounded-lg border border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">
                        {currentQueueMember.jerseyNumber !== undefined ? `#${currentQueueMember.jerseyNumber} ` : ''}
                        {currentQueueMember.name}
                      </div>
                      <div className="text-xs text-stone-400 font-mono">
                        WhatsApp: {currentQueueMember.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleOpenWhatsApp(currentQueueMember.phone, currentQueueMember.name);
                        if (queueIndex < currentQueueList.length - 1) {
                          setQueueIndex(queueIndex + 1);
                          setSelectedMemberId(currentQueueList[queueIndex + 1].id);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send & Next ➔</span>
                    </button>

                    <button
                      onClick={() => {
                        if (queueIndex < currentQueueList.length - 1) {
                          setQueueIndex(queueIndex + 1);
                          setSelectedMemberId(currentQueueList[queueIndex + 1].id);
                        }
                      }}
                      disabled={queueIndex === currentQueueList.length - 1}
                      className="p-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 rounded-lg transition cursor-pointer"
                      title="Skip to next"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Member Selector Chips/List */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {(selectedChannel === 'individual_players' ? players : staff).map((member) => {
                  const isSelected = member.id === selectedMemberId;
                  const isSent = sentMap[`${selectedChannel}-${member.id}`];

                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-red-950/70 border-amber-500 text-white shadow-md'
                          : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {member.jerseyNumber !== undefined && (
                          <span className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-700 text-amber-400 font-mono font-black text-xs flex items-center justify-center shrink-0">
                            {member.jerseyNumber}
                          </span>
                        )}
                        <div>
                          <div className="font-bold text-xs text-stone-100 flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {isSent && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono">
                            {member.phone} · <span className="text-stone-500">{member.position}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMemberId(member.id);
                          handleOpenWhatsApp(member.phone, member.name);
                        }}
                        className="p-2 rounded-lg bg-green-950/80 hover:bg-green-900 border border-green-700/60 text-green-300 hover:text-white transition cursor-pointer"
                        title="Send direct WhatsApp to this contact"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collective Group Dispatch Card */}
          {(selectedChannel === 'collective_staff' || selectedChannel === 'all_team') && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-bold text-white">
                  WhatsApp Group Dispatch
                </h3>
              </div>

              {/* Group Link configuration */}
              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
                <label className="text-xs font-bold text-stone-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {selectedChannel === 'collective_staff' && 'Enlace permanente al Grupo WhatsApp Staff'}
                      {selectedChannel === 'all_team' && 'Enlace permanente al Grupo WhatsApp All Team'}
                    </span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Guardado permanente automático
                  </span>
                </label>
                <input
                  type="url"
                  value={selectedChannel === 'collective_staff' ? staffGroupUrl : allTeamGroupUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (selectedChannel === 'collective_staff') {
                      updateStaffGroupUrl(val);
                    } else {
                      updateAllTeamGroupUrl(val);
                    }
                  }}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg text-[11px] text-stone-300 space-y-1">
                  <p className="font-bold text-green-400 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Envío a Grupo WhatsApp:
                  </p>
                  <p className="text-stone-400 leading-snug">
                    Al pulsar el botón verde, la app <b>copia automáticamente el texto completo al portapapeles</b> y <b>abre el enlace directo al grupo</b> listo para pegar (Ctrl+V o Pegar) y enviar.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {/* 1. Direct Group link button in green */}
                <button
                  onClick={handleOpenGroupWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-green-950/80 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir enlace directo al grupo con el texto copiado</span>
                </button>

                {/* 2. Copy message */}
                <button
                  onClick={handleCopyMessage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 font-medium text-xs rounded-xl border border-stone-800 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Texto Copiado al Portapapeles!' : 'Copiar Texto al Portapapeles'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Interactive WhatsApp Phone Mockup Preview */}
        <div className="lg:col-span-7">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-2xl space-y-4">
            
            {/* Preview Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    WhatsApp Message Preview
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    {currentRecipient ? `Recipient: ${currentRecipient.name}` : getChannelLabel(selectedChannel)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => {
                    if (currentRecipient) {
                      handleOpenWhatsApp();
                    } else {
                      handleOpenGroupWhatsApp();
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-green-700 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-950 border border-green-500/50 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Simulated Phone Screen */}
            <div className="bg-[#0b141a] border border-stone-800 rounded-2xl overflow-hidden shadow-2xl relative font-sans">
              
              {/* WhatsApp Chat Header */}
              <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-stone-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-950 border border-red-700/60 flex items-center justify-center text-amber-400 font-black text-xs shrink-0 shadow-inner">
                    UCAM
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>
                        {currentRecipient 
                          ? currentRecipient.name 
                          : selectedChannel === 'collective_staff'
                          ? 'UCAM Murcia CB - Staff Group'
                          : selectedChannel === 'all_team'
                          ? 'UCAM Murcia CB - All Team Group'
                          : 'UCAM Murcia CB - Official'}
                      </span>
                      <span className="text-[9px] bg-red-800 text-amber-300 px-1 py-0.2 rounded font-bold">
                        OFFICIAL
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {currentRecipient 
                        ? (currentRecipient.phone || 'online') 
                        : selectedChannel === 'collective_staff'
                        ? 'Coaching Staff WhatsApp Channel'
                        : 'Team WhatsApp Channel'}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-stone-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Chat Canvas with Wallpaper pattern */}
              <div 
                className="p-4 sm:p-5 max-h-[520px] overflow-y-auto space-y-3"
                style={{
                  backgroundImage: 'radial-gradient(#202c33 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  backgroundColor: '#0b141a'
                }}
              >
                {/* Date bubble badge */}
                <div className="flex justify-center">
                  <span className="bg-[#182229] text-stone-400 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow font-mono">
                    {formatDateEnglish(plan.date)}
                  </span>
                </div>

                {/* Sent WhatsApp Message Bubble */}
                <div className="flex justify-end">
                  <div className="bg-[#005c4b] text-stone-100 rounded-2xl rounded-tr-sm p-4 max-w-xl text-xs sm:text-[13px] leading-relaxed shadow-lg relative border border-emerald-700/20">
                    
                    {/* Render Formatted Text */}
                    <div className="whitespace-pre-wrap font-sans space-y-1">
                      {messageText.split('\n').map((line, idx) => {
                        const isMainHeader = line === 'UCAM MURCIA CB';
                        const isDateHeader = line.includes('202') && line === line.toUpperCase();
                        const isSectionHeader = line.startsWith('YOUR INDIVIDUAL SESSIONS') || line.startsWith('TEAM SCHEDULE') || line.startsWith('PLAYERS SCHEDULE') || line.startsWith('COACHING') || line.startsWith('OFFICIAL');
                        const isTimeLine = line.startsWith('*');

                        if (isMainHeader) {
                          return <div key={idx} className="font-extrabold text-amber-300 text-sm tracking-wide">{line}</div>;
                        }

                        if (isDateHeader) {
                          return <div key={idx} className="font-bold text-emerald-200 text-xs tracking-wider">{line}</div>;
                        }

                        if (isSectionHeader) {
                          return <div key={idx} className="font-bold text-amber-200 text-xs pt-1 uppercase tracking-wide">{line}</div>;
                        }

                        if (isTimeLine) {
                          return <div key={idx} className="font-bold text-white pt-1">{line}</div>;
                        }

                        if (line.startsWith('Google Maps:')) {
                          const url = line.replace('Google Maps:', '').trim();
                          return (
                            <div key={idx} className="text-blue-200 text-xs">
                              Google Maps: <span className="underline">{url}</span>
                            </div>
                          );
                        }

                        return <div key={idx}>{line}</div>;
                      })}
                    </div>

                    {/* WhatsApp Timestamp & double check mark */}
                    <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-300/70 mt-2">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-cyan-300 font-bold">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp bottom input bar mockup */}
              <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center justify-between border-t border-stone-800">
                <span className="text-xs text-stone-400 italic">
                  Ready to dispatch via WhatsApp Web API...
                </span>
                <button
                  onClick={() => {
                    if (currentRecipient) handleOpenWhatsApp();
                    else handleOpenGroupWhatsApp();
                  }}
                  className="p-2 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white shadow transition cursor-pointer"
                  title="Open and Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
