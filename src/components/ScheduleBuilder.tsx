import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit3, Copy, Clock, MapPin, Users, 
  ArrowUp, ArrowDown, Sparkles, Check, 
  Dumbbell, Film, HeartPulse, Award, Utensils, Plane,
  User, Activity, X, ExternalLink, Link2, Bell
} from 'lucide-react';
import { 
  ActivityType, DailyPlan, ScheduleItem, TeamMember, 
  TapedOption, MealType, LuggageOption, TargetAudience 
} from '../types';
import { ACTIVITY_DEFINITIONS, PRESET_LOCATIONS } from '../data/activityDefinitions';
import { formatDateTitleEnglish } from '../utils/whatsappGenerator';
import { IosAlarmTimePicker } from './IosAlarmTimePicker';

interface ScheduleBuilderProps {
  plan: DailyPlan;
  setPlan: React.Dispatch<React.SetStateAction<DailyPlan>>;
  members: TeamMember[];
  onGoToDispatch: () => void;
}

export const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({
  plan,
  setPlan,
  members,
  onGoToDispatch,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form State
  const [activityType, setActivityType] = useState<ActivityType>('team_practice');
  const [customTitle, setCustomTitle] = useState('');
  const [time, setTime] = useState('10:45 AM');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('Palacio de los Deportes - Main Court');
  const [locationUrl, setLocationUrl] = useState('https://maps.google.com/?q=Palacio+de+los+Deportes+Murcia');
  const [notes, setNotes] = useState('');
  const [tapedOption, setTapedOption] = useState<TapedOption>('taped');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [luggageOption, setLuggageOption] = useState<LuggageOption>('with_luggage');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('all');
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);

  const openAddModal = (presetType?: ActivityType) => {
    const type = presetType || 'team_practice';
    const def = ACTIVITY_DEFINITIONS[type];
    
    setEditingItemId(null);
    setActivityType(type);
    setCustomTitle('');
    setTime('10:45 AM');
    setEndTime('');
    setLocation(def.defaultLocation);
    setLocationUrl(def.defaultLocationUrl || '');
    setNotes('');
    setTapedOption('taped');
    setMealType('lunch');
    setLuggageOption('with_luggage');
    setTargetAudience('all');
    setAssignedMemberIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingItemId(item.id);
    setActivityType(item.type);
    setCustomTitle(item.customTitle || '');
    setTime(item.time);
    setEndTime(item.endTime || '');
    setLocation(item.location || '');
    setLocationUrl(item.locationUrl || '');
    setNotes(item.notes || '');
    setTapedOption(item.tapedOption || 'taped');
    setMealType(item.mealType || 'lunch');
    setLuggageOption(item.luggageOption || 'with_luggage');
    setTargetAudience(item.targetAudience);
    setAssignedMemberIds(item.assignedMemberIds || []);
    setIsModalOpen(true);
  };

  const handleGenerateMapsUrl = () => {
    if (location.trim()) {
      const generated = `https://maps.google.com/?q=${encodeURIComponent(location.trim() + ' Murcia')}`;
      setLocationUrl(generated);
    }
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: ScheduleItem = {
      id: editingItemId || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: activityType,
      customTitle: activityType === 'custom' ? customTitle : undefined,
      time,
      endTime: endTime.trim() ? endTime.trim() : undefined,
      location: location.trim() ? location.trim() : undefined,
      locationUrl: locationUrl.trim() ? locationUrl.trim() : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
      tapedOption: activityType === 'team_practice' ? tapedOption : undefined,
      mealType: activityType === 'team_meal' ? mealType : undefined,
      luggageOption: activityType === 'departure_time' ? luggageOption : undefined,
      targetAudience,
      assignedMemberIds: targetAudience === 'selected_members' ? assignedMemberIds : [],
    };

    if (editingItemId) {
      setPlan(prev => ({
        ...prev,
        items: prev.items.map(it => it.id === editingItemId ? newItem : it),
      }));
    } else {
      setPlan(prev => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setPlan(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id),
    }));
  };

  const handleDuplicateItem = (item: ScheduleItem) => {
    const duplicated: ScheduleItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    setPlan(prev => ({
      ...prev,
      items: [...prev.items, duplicated],
    }));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...plan.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setPlan(prev => ({ ...prev, items: newItems }));
  };

  const toggleMemberAssignment = (memberId: string) => {
    setAssignedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getActivityBadge = (item: ScheduleItem) => {
    switch (item.type) {
      case 'team_practice':
        return item.tapedOption === 'taped' ? (
          <span className="bg-red-950/80 border border-red-600/70 text-red-300 text-[11px] px-2 py-0.5 rounded font-bold">
            TAPED
          </span>
        ) : (
          <span className="bg-stone-800 border border-stone-600 text-stone-300 text-[11px] px-2 py-0.5 rounded font-medium">
            NOT TAPED
          </span>
        );
      case 'team_meal':
        const mealTexts: Record<MealType, string> = {
          breakfast: 'Breakfast',
          lunch: 'Lunch',
          dinner: 'Dinner',
          snack: 'Snack'
        };
        return (
          <span className="bg-teal-950/80 border border-teal-600/70 text-teal-300 text-[11px] px-2 py-0.5 rounded font-bold">
            {item.mealType ? mealTexts[item.mealType] : 'Meal'}
          </span>
        );
      case 'departure_time':
        return item.luggageOption === 'with_luggage' ? (
          <span className="bg-indigo-950/80 border border-indigo-600/70 text-indigo-300 text-[11px] px-2 py-0.5 rounded font-bold">
            With Luggage
          </span>
        ) : (
          <span className="bg-stone-800 border border-stone-600 text-stone-300 text-[11px] px-2 py-0.5 rounded font-medium">
            Without Luggage
          </span>
        );
      default:
        return null;
    }
  };

  const renderIcon = (type: ActivityType) => {
    switch (type) {
      case 'arrival': return <MapPin className="w-4 h-4 text-sky-400" />;
      case 'individual_workout': return <User className="w-4 h-4 text-blue-400" />;
      case 'positional_workout': return <Users className="w-4 h-4 text-purple-400" />;
      case 'team_practice': return <Dumbbell className="w-4 h-4 text-red-400" />;
      case 'taping_session': return <Activity className="w-4 h-4 text-pink-400" />;
      case 'weights': return <Dumbbell className="w-4 h-4 text-orange-400" />;
      case 'video_meeting': return <Film className="w-4 h-4 text-cyan-400" />;
      case 'recovery': return <HeartPulse className="w-4 h-4 text-emerald-400" />;
      case 'team_event': return <Award className="w-4 h-4 text-yellow-400" />;
      case 'team_meal': return <Utensils className="w-4 h-4 text-teal-400" />;
      case 'departure_time': return <Plane className="w-4 h-4 text-indigo-400" />;
      case 'custom': return <Sparkles className="w-4 h-4 text-purple-300" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Activity Buttons Bar */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-red-950/30 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="pb-4 border-b border-stone-800">
          <h2 className="text-xl font-black text-white tracking-wide">
            DAILY SCHEDULE PLANNER
          </h2>
          <p className="text-sm text-stone-400 mt-1">
            {formatDateTitleEnglish(plan.date)}
          </p>
        </div>

        {/* Quick Activity Launcher Grid */}
        <div className="pt-4">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Add Activity:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <button
              onClick={() => openAddModal('arrival')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-sky-950/60 border border-stone-800 hover:border-sky-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">Arrival</span>
            </button>

            <button
              onClick={() => openAddModal('individual_workout')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-blue-950/60 border border-stone-800 hover:border-blue-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <User className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">Individual Work Out</span>
            </button>

            <button
              onClick={() => openAddModal('positional_workout')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-purple-950/60 border border-stone-800 hover:border-purple-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate">Positional Work Out</span>
            </button>

            <button
              onClick={() => openAddModal('team_practice')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-red-950/60 border border-stone-800 hover:border-red-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <Dumbbell className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate">Team Practice (Taped)</span>
            </button>

            <button
              onClick={() => openAddModal('taping_session')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-pink-950/60 border border-stone-800 hover:border-pink-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <Activity className="w-4 h-4 text-pink-400 shrink-0" />
              <span className="truncate">Taping Session</span>
            </button>

            <button
              onClick={() => openAddModal('weights')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-orange-950/60 border border-stone-800 hover:border-orange-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <Dumbbell className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="truncate">Weights (Gym)</span>
            </button>

            <button
              onClick={() => openAddModal('video_meeting')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-cyan-950/60 border border-stone-800 hover:border-cyan-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <Film className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">Video Meeting</span>
            </button>

            <button
              onClick={() => openAddModal('recovery')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-emerald-950/60 border border-stone-800 hover:border-emerald-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Recovery (Physio)</span>
            </button>

            <button
              onClick={() => openAddModal('team_meal')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-teal-950/60 border border-stone-800 hover:border-teal-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <Utensils className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="truncate">Team Meal</span>
            </button>

            <button
              onClick={() => openAddModal('departure_time')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-indigo-950/60 border border-stone-800 hover:border-indigo-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <Plane className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate">Departure Time</span>
            </button>

            <button
              onClick={() => openAddModal('team_event')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-yellow-950/60 border border-stone-800 hover:border-yellow-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer"
            >
              <Award className="w-4 h-4 text-yellow-400 shrink-0" />
              <span className="truncate">Team Event</span>
            </button>

            <button
              onClick={() => openAddModal('custom')}
              className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/80 hover:bg-purple-950/60 border border-stone-800 hover:border-purple-700/50 text-stone-200 text-xs font-semibold transition text-left cursor-pointer col-span-2 sm:col-span-1 md:col-span-2"
            >
              <Plus className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate">+ Custom Activity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Schedule List */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
        {/* List of Items */}
        {plan.items.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-stone-800 rounded-2xl">
            <Clock className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-300">No activities scheduled for this day</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-5">
              Use the top buttons to add practice sessions, weights, video scouting, meals, or departures.
            </p>
            <button
              onClick={() => openAddModal('team_practice')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Activity</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {plan.items.map((item, index) => {
              const def = ACTIVITY_DEFINITIONS[item.type];
              const title = item.type === 'custom' && item.customTitle ? item.customTitle : def?.label;

              return (
                <div
                  key={item.id}
                  className="group bg-stone-950/90 border border-stone-800 hover:border-stone-700 rounded-xl p-4 transition shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  {/* Left: Time & Activity Title */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex flex-col items-center justify-center bg-stone-900 border border-stone-700/80 rounded-xl px-3 py-2 min-w-[95px] shrink-0">
                      <span className="text-amber-400 font-mono font-black text-sm leading-none">
                        {item.time}
                      </span>
                      {item.endTime && (
                        <span className="text-stone-400 font-mono text-[10px] mt-0.5">
                          - {item.endTime}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 font-black text-stone-100 text-sm">
                          {renderIcon(item.type)}
                          <span>{title}</span>
                        </div>
                        {getActivityBadge(item)}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-400">
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-500" />
                            {item.location}
                          </span>
                        )}

                        {item.locationUrl && (
                          <a
                            href={item.locationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Google Maps</span>
                          </a>
                        )}

                        {item.targetAudience === 'selected_members' && item.assignedMemberIds.length > 0 && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Users className="w-3.5 h-3.5" />
                            {item.assignedMemberIds.length} members assigned
                          </span>
                        )}

                        {item.targetAudience === 'basketball_coaches' && (
                          <span className="text-amber-300 font-medium">
                            Basketball Coaches
                          </span>
                        )}

                        {item.targetAudience === 'players_only' && (
                          <span className="text-purple-300 font-medium">
                            Players Only
                          </span>
                        )}

                        {item.targetAudience === 'staff_only' && (
                          <span className="text-yellow-300 font-medium">
                            Staff Only
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-stone-400 italic bg-stone-900/60 px-2.5 py-1 rounded border border-stone-800/80 inline-block mt-1">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-stone-800/80">
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === plan.items.length - 1}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicateItem(item)}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-800/50 text-blue-300 hover:text-white transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/50 text-red-300 hover:text-white transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-stone-900 border-b border-stone-800 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-950 border border-red-700/60 text-red-400">
                  {renderIcon(activityType)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingItemId ? 'Edit Activity' : 'New Activity'}
                  </h3>
                  <span className="text-xs text-stone-400">
                    Schedule time, options, Google Maps location & target members
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveActivity} className="p-6 space-y-5">
              
              {/* Activity Type Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                  Activity Type
                </label>
                <select
                  value={activityType}
                  onChange={(e) => {
                    const newType = e.target.value as ActivityType;
                    setActivityType(newType);
                    const def = ACTIVITY_DEFINITIONS[newType];
                    if (def) {
                      setLocation(def.defaultLocation);
                      setLocationUrl(def.defaultLocationUrl || '');
                    }
                  }}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-amber-400 font-semibold"
                >
                  <option value="arrival">Arrival</option>
                  <option value="individual_workout">Individual Work Out</option>
                  <option value="positional_workout">Positional Work Out</option>
                  <option value="team_practice">Team Practice (Taped / Not Taped)</option>
                  <option value="taping_session">Taping Session (Physio & Taping)</option>
                  <option value="weights">Weights (Gym Session)</option>
                  <option value="video_meeting">Video Meeting (Tactical Scouting)</option>
                  <option value="recovery">Recovery (Cryo & Hydrotherapy)</option>
                  <option value="team_event">Team Event (Club / Media)</option>
                  <option value="team_meal">Team Meal (Breakfast / Lunch / Dinner / Snack)</option>
                  <option value="departure_time">Departure Time (With / Without Luggage)</option>
                  <option value="custom">+ Custom Activity (Manual)</option>
                </select>
              </div>

              {/* Custom Title if 'custom' */}
              {activityType === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Custom Activity Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Official Liga Endesa Photo Shoot"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Specific Options based on Activity Type */}
              {activityType === 'team_practice' && (
                <div className="p-3.5 bg-red-950/30 border border-red-800/40 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-red-300 uppercase tracking-wider">
                    Taping Option (Taped / Not Taped)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-bold transition ${
                      tapedOption === 'taped'
                        ? 'bg-red-900 border-red-500 text-white'
                        : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
                    }`}>
                      <input
                        type="radio"
                        name="tapedOption"
                        checked={tapedOption === 'taped'}
                        onChange={() => setTapedOption('taped')}
                        className="hidden"
                      />
                      <span>TAPED (Mandatory Ankle/Joint Tape)</span>
                    </label>

                    <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-bold transition ${
                      tapedOption === 'not_taped'
                        ? 'bg-stone-800 border-stone-500 text-white'
                        : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
                    }`}>
                      <input
                        type="radio"
                        name="tapedOption"
                        checked={tapedOption === 'not_taped'}
                        onChange={() => setTapedOption('not_taped')}
                        className="hidden"
                      />
                      <span>NOT TAPED</span>
                    </label>
                  </div>
                </div>
              )}

              {activityType === 'team_meal' && (
                <div className="p-3.5 bg-teal-950/30 border border-teal-800/40 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider">
                    Meal Option
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'breakfast', label: 'Breakfast' },
                      { id: 'lunch', label: 'Lunch' },
                      { id: 'dinner', label: 'Dinner' },
                      { id: 'snack', label: 'Snack' }
                    ].map((meal) => (
                      <label 
                        key={meal.id} 
                        className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer text-xs font-bold text-center transition ${
                          mealType === meal.id
                            ? 'bg-teal-900 border-teal-400 text-white'
                            : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mealType"
                          checked={mealType === meal.id}
                          onChange={() => setMealType(meal.id as MealType)}
                          className="hidden"
                        />
                        <span>{meal.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activityType === 'departure_time' && (
                <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/40 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    Luggage Option
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-bold transition ${
                      luggageOption === 'with_luggage'
                        ? 'bg-indigo-900 border-indigo-500 text-white'
                        : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
                    }`}>
                      <input
                        type="radio"
                        name="luggageOption"
                        checked={luggageOption === 'with_luggage'}
                        onChange={() => setLuggageOption('with_luggage')}
                        className="hidden"
                      />
                      <span>WITH LUGGAGE</span>
                    </label>

                    <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-bold transition ${
                      luggageOption === 'without_luggage'
                        ? 'bg-stone-800 border-stone-500 text-white'
                        : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-stone-200'
                    }`}>
                      <input
                        type="radio"
                        name="luggageOption"
                        checked={luggageOption === 'without_luggage'}
                        onChange={() => setLuggageOption('without_luggage')}
                        className="hidden"
                      />
                      <span>WITHOUT LUGGAGE</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Start Time Picker */}
              <div className="space-y-3">
                <IosAlarmTimePicker
                  value={time}
                  onChange={(newTime) => setTime(newTime)}
                  label="Start Time"
                />
              </div>

              {/* Location & Google Maps Link with Requested 5 Locations */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Location</span>
                    </label>
                  </div>

                  {/* 5 Requested Location Preset Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2.5">
                    {PRESET_LOCATIONS.map((locPreset) => {
                      const isSelected = location.trim().toLowerCase() === locPreset.name.toLowerCase();
                      return (
                        <button
                          key={locPreset.id}
                          type="button"
                          onClick={() => {
                            setLocation(locPreset.name);
                          }}
                          className={`flex items-center justify-center h-10 px-2 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-950/40 ring-1 ring-amber-400'
                              : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-300 hover:bg-stone-900'
                          }`}
                        >
                          <span className="truncate">{locPreset.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Location Field */}
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Or enter custom location (e.g. Hotel Restaurant, Airport)..."
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Google Maps Link (Optional)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {locationUrl ? (
                        <button
                          type="button"
                          onClick={() => setLocationUrl('')}
                          className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer font-medium"
                        >
                          Clear link
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleGenerateMapsUrl}
                          className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        >
                          Auto-generate from Location
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="url"
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    placeholder="Leave empty for no Google Maps link..."
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-400 text-blue-300"
                  />
                  <p className="text-[11px] text-stone-400">
                    {locationUrl.trim() 
                      ? '✓ Google Maps link will be included under this activity in WhatsApp.' 
                      : 'ℹ️ No Google Maps link will appear in the message for this activity.'}
                  </p>
                </div>
              </div>

              {/* Target Audience & Assignment */}
              <div className="space-y-3 pt-2 border-t border-stone-800">
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Target Audience
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All Team' },
                    { id: 'staff_only', label: 'Staff Only' },
                    { id: 'selected_members', label: 'Specific Members' }
                  ].map((aud) => (
                    <label
                      key={aud.id}
                      className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer text-xs font-bold text-center transition ${
                        targetAudience === aud.id
                          ? 'bg-amber-500 text-stone-950 border-amber-400'
                          : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="targetAudience"
                        checked={targetAudience === aud.id}
                        onChange={() => setTargetAudience(aud.id as TargetAudience)}
                        className="hidden"
                      />
                      <span>{aud.label}</span>
                    </label>
                  ))}
                </div>

                {/* Specific Member Selector */}
                {targetAudience === 'selected_members' && (
                  <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
                    <span className="text-xs text-stone-400 block">
                      Select players or staff assigned to this individual/positional slot:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                      {members.map((m) => {
                        const isSelected = assignedMemberIds.includes(m.id);
                        return (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => toggleMemberAssignment(m.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            <span>{m.jerseyNumber !== undefined ? `#${m.jerseyNumber} ` : ''}{m.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Additional Notes (English)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra shooting workout with coach. Physio treatment before practice."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-400 hover:text-stone-200 bg-stone-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg shadow-red-950 border border-red-500/40 transition cursor-pointer"
                >
                  {editingItemId ? 'Save Changes' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
