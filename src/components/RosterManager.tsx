import React, { useState } from 'react';
import { 
  Users, UserPlus, Phone, Edit2, Trash2, Check, 
  Send, Search, X, Award, Info
} from 'lucide-react';
import { TeamMember, MemberRole, PlayerLicense } from '../types';
import { buildWhatsAppUrl } from '../utils/whatsappGenerator';
import { LICENSE_OPTIONS, getLicenseVisual, normalizeLicense } from '../utils/licenseHelper';

interface RosterManagerProps {
  members: TeamMember[];
  setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
}

type FilterTab = 'all' | 'player' | 'staff' | 'licenses';

export const RosterManager: React.FC<RosterManagerProps> = ({
  members,
  setMembers,
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [filterLicense, setFilterLicense] = useState<'all' | PlayerLicense>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<MemberRole>('player');
  const [position, setPosition] = useState('Escolta');
  const [jerseyNumber, setJerseyNumber] = useState<string>('');
  const [license, setLicense] = useState<PlayerLicense>('EXT');
  const [phone, setPhone] = useState('+34');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setRole('player');
    setPosition('Base');
    setJerseyNumber('');
    setLicense('EXT');
    setPhone('+34600000000');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setPosition(member.position || '');
    setJerseyNumber(member.jerseyNumber !== undefined ? String(member.jerseyNumber) : '');
    setLicense(normalizeLicense(member.license));
    setPhone(member.phone);
    setNotes(member.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedMember: TeamMember = {
      id: editingMember ? editingMember.id : `m-${Date.now()}`,
      name: name.trim(),
      role,
      position: position.trim() || undefined,
      jerseyNumber: jerseyNumber.trim() ? Number(jerseyNumber) : undefined,
      license: role === 'player' ? license : undefined,
      phone: phone.trim(),
      isActive: true,
      notes: notes.trim() || undefined,
    };

    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? updatedMember : m));
    } else {
      setMembers(prev => [...prev, updatedMember]);
    }

    setIsModalOpen(false);
  };

  const handleQuickChangeLicense = (memberId: string, newLicense: PlayerLicense) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, license: newLicense } : m));
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar a este miembro de la plantilla?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const allPlayers = members.filter(m => m.role === 'player');
  const allStaff = members.filter(m => m.role === 'staff' || (m.role as any) === 'medical');

  // Count licenses among players
  const countJfl = allPlayers.filter(p => normalizeLicense(p.license) === 'JFL').length;
  const countEur = allPlayers.filter(p => normalizeLicense(p.license) === 'EUR').length;
  const countExt = allPlayers.filter(p => normalizeLicense(p.license) === 'EXT').length;
  const countJflBcl = allPlayers.filter(p => normalizeLicense(p.license) === 'JFL BCL').length;

  const filteredMembers = members.filter(m => {
    // Tab filter
    if (filterTab === 'player' && m.role !== 'player') return false;
    if (filterTab === 'staff' && m.role !== 'staff' && (m.role as any) !== 'medical') return false;
    if (filterTab === 'licenses' && m.role !== 'player') return false;

    // License sub-filter (applicable in licenses tab or player tab)
    if ((filterTab === 'licenses' || filterTab === 'player') && filterLicense !== 'all') {
      const currentLicense = normalizeLicense(m.license);
      if (currentLicense !== filterLicense) return false;
    }

    // Search query filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(searchLower) ||
      (m.position && m.position.toLowerCase().includes(searchLower)) ||
      m.phone.includes(searchTerm) ||
      (m.license && m.license.toLowerCase().includes(searchLower));

    return matchesSearch;
  });

  const sendTestPing = (m: TeamMember) => {
    const text = `🏀 *UCAM MURCIA CB* - Prueba de conexión de WhatsApp con el Delegado del equipo para ${m.name}. ¡Todo listo para recibir los horarios oficiales!`;
    const url = buildWhatsAppUrl(m.phone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Navigation */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              <span>Roster, Contacts & Licenses</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Gestión de jugadores, cuerpo técnico, teléfonos de WhatsApp y licencias de competición (ACB / BCL).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 rounded-xl shadow-lg shadow-red-950 border border-red-500/40 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Añadir Miembro</span>
            </button>
          </div>
        </div>

        {/* Main Tabs (Pestañas) & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800 overflow-x-auto">
            <button
              onClick={() => { setFilterTab('all'); setFilterLicense('all'); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === 'all' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900/60 font-mono">
                {members.length}
              </span>
            </button>

            <button
              onClick={() => { setFilterTab('player'); setFilterLicense('all'); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === 'player' ? 'bg-red-800 text-white shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>🏀 Jugadores</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900/60 font-mono">
                {allPlayers.length}
              </span>
            </button>

            <button
              onClick={() => { setFilterTab('licenses'); setFilterLicense('all'); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === 'licenses' ? 'bg-amber-400 text-stone-950 font-black shadow' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>🏷️ Licencias / Licenses</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900/80 text-amber-300 font-mono">
                {allPlayers.length}
              </span>
            </button>

            <button
              onClick={() => { setFilterTab('staff'); setFilterLicense('all'); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === 'staff' ? 'bg-blue-800 text-white shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>📋 Cuerpo Técnico</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900/60 font-mono">
                {allStaff.length}
              </span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar jugador, dorsal o licencia..."
              className="bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Dedicated License Summary & Sub-tabs (Visible in Licencias or Jugadores view) */}
        {(filterTab === 'licenses' || filterTab === 'player') && (
          <div className="pt-3 border-t border-stone-800 space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Filtro por Licencia:
                </span>
                <span className="text-[11px] text-stone-400">
                  (Haz clic para filtrar o cambia la licencia directamente en cada jugador)
                </span>
              </div>
            </div>

            {/* License Sub-tabs with Quota Counters & Official Color Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setFilterLicense('all')}
                className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  filterLicense === 'all'
                    ? 'border-amber-400 bg-stone-950 ring-1 ring-amber-400/40 text-white'
                    : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span className="text-xs font-bold">Todas las licencias</span>
                <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-stone-800 text-stone-200">
                  {allPlayers.length}
                </span>
              </button>

              {/* 1. JFL: red */}
              <button
                type="button"
                onClick={() => setFilterLicense('JFL')}
                className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  filterLicense === 'JFL'
                    ? 'border-red-400 bg-stone-950 ring-1 ring-red-400/40 text-white'
                    : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded font-extrabold text-[10px] flex items-center justify-center shrink-0 bg-red-600 text-white border border-red-500">
                    #
                  </span>
                  <span className="text-xs font-bold">JFL</span>
                </div>
                <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-red-950 text-red-200 border border-red-500/50">
                  {countJfl}
                </span>
              </button>

              {/* 2. EUR (EUR y COT): blue */}
              <button
                type="button"
                onClick={() => setFilterLicense('EUR')}
                className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  filterLicense === 'EUR'
                    ? 'border-blue-400 bg-stone-950 ring-1 ring-blue-400/40 text-white'
                    : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded font-extrabold text-[10px] flex items-center justify-center shrink-0 bg-blue-600 text-white border border-blue-500">
                    #
                  </span>
                  <span className="text-xs font-bold">EUR</span>
                </div>
                <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-500/50">
                  {countEur}
                </span>
              </button>

              {/* 3. EXT: dark blue */}
              <button
                type="button"
                onClick={() => setFilterLicense('EXT')}
                className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  filterLicense === 'EXT'
                    ? 'border-blue-700 bg-stone-950 ring-1 ring-blue-700/40 text-white'
                    : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded font-extrabold text-[10px] flex items-center justify-center shrink-0 bg-blue-950 text-white border border-blue-800">
                    #
                  </span>
                  <span className="text-xs font-bold">EXT</span>
                </div>
                <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-blue-900">
                  {countExt}
                </span>
              </button>

              {/* 4. JFL BCL: diagonal red/blue */}
              <button
                type="button"
                onClick={() => setFilterLicense('JFL BCL')}
                className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  filterLicense === 'JFL BCL'
                    ? 'border-amber-400 bg-stone-950 ring-1 ring-amber-400/40 text-white'
                    : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-5 h-5 rounded font-extrabold text-[10px] flex items-center justify-center shrink-0 text-white border border-amber-400"
                    style={{ backgroundImage: 'linear-gradient(135deg, #dc2626 50%, #2563eb 50%)', textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
                  >
                    #
                  </span>
                  <span className="text-xs font-bold">JFL BCL</span>
                </div>
                <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded text-white border border-amber-400/60"
                  style={{ backgroundImage: 'linear-gradient(135deg, #991b1b 50%, #1e40af 50%)' }}
                >
                  {countJflBcl}
                </span>
              </button>
            </div>

            {/* Information Callout */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] text-stone-400">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Colores asignados en el dorsal: 
                <span className="text-red-400 font-bold ml-1">Rojo (JFL)</span>, 
                <span className="text-blue-400 font-bold ml-1">Azul (EUR / COT)</span>, 
                <span className="text-blue-200 font-bold ml-1">Azul Oscuro (EXT)</span> y 
                <span className="text-amber-300 font-bold ml-1">Mitad rojo, mitad azul diagonal (JFL BCL - Marcis Steinbergs)</span>.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const isPlayer = member.role === 'player';
          const visual = isPlayer ? getLicenseVisual(member.license) : null;

          return (
            <div
              key={member.id}
              className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 shadow-lg flex flex-col justify-between gap-3 transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {member.jerseyNumber !== undefined ? (
                      <span 
                        className="w-10 h-10 rounded-xl font-mono font-black text-sm flex items-center justify-center shadow border"
                        style={isPlayer && visual ? visual.pdfBadgeStyle : {
                          backgroundColor: '#1c1917',
                          color: '#fbbf24',
                          borderColor: '#78350f'
                        }}
                      >
                        #{member.jerseyNumber}
                      </span>
                    ) : (
                      <span className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-700 text-stone-300 font-bold text-xs flex items-center justify-center shadow">
                        📋
                      </span>
                    )}

                    <div>
                      <h3 className="font-extrabold text-sm text-white leading-tight">
                        {member.name}
                      </h3>
                      <span className="text-xs text-amber-400 font-medium">
                        {member.position || (isPlayer ? 'Jugador' : 'Cuerpo Técnico')}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    isPlayer
                      ? 'bg-red-950 text-red-300 border-red-800'
                      : 'bg-blue-950 text-blue-300 border-blue-800'
                  }`}>
                    {isPlayer ? 'Jugador' : 'Staff'}
                  </span>
                </div>

                {/* Player License Selector Tabs directly on card */}
                {isPlayer && (
                  <div className="mt-3 p-2.5 rounded-xl bg-stone-950 border border-stone-850 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Licencia / License</span>
                      </span>
                      {visual && (
                        <span 
                          className="text-[9.5px] font-black px-2 py-0.5 rounded border"
                          style={visual.pdfBadgeStyle}
                        >
                          #{member.jerseyNumber !== undefined ? member.jerseyNumber : '•'} {visual.shortLabel}
                        </span>
                      )}
                    </div>

                    {/* 4 Clickable License Tabs */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      {LICENSE_OPTIONS.map((opt) => {
                        const isSelected = normalizeLicense(member.license) === opt.id;
                        const optVisual = getLicenseVisual(opt.id);

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleQuickChangeLicense(member.id, opt.id)}
                            title={`${opt.label}: ${opt.description}`}
                            className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border transition text-left cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'border-amber-400 bg-stone-900 ring-1 ring-amber-400/40 text-white shadow-sm'
                                : 'border-stone-800 bg-stone-900/60 hover:bg-stone-850 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            <span 
                              className="w-3.5 h-3.5 rounded-xs shrink-0 inline-block border border-stone-700/50"
                              style={optVisual.pdfBadgeStyle}
                            />
                            <span className="truncate">{opt.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Phone info */}
                <div className="mt-3 p-2 rounded-xl bg-stone-950 border border-stone-850 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-stone-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-green-400" />
                    <span className="font-bold">{member.phone}</span>
                  </div>

                  <button
                    onClick={() => sendTestPing(member)}
                    className="text-[10px] text-green-400 hover:text-green-300 hover:underline flex items-center gap-1 cursor-pointer"
                    title="Enviar ping de prueba por WhatsApp"
                  >
                    <Send className="w-3 h-3" />
                    <span>Probar Chat</span>
                  </button>
                </div>

                {member.notes && (
                  <p className="text-[11px] text-stone-400 italic mt-2 bg-stone-950/60 p-2 rounded-lg border border-stone-850">
                    {member.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800/80">
                <button
                  onClick={() => openEditModal(member)}
                  className="px-2.5 py-1 text-xs font-bold text-blue-300 hover:text-white bg-blue-950/40 hover:bg-blue-900 border border-blue-800/40 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="p-8 text-center bg-stone-900 border border-stone-800 rounded-2xl">
          <p className="text-stone-400 text-sm">
            No se encontraron miembros con los filtros seleccionados.
          </p>
        </div>
      )}

      {/* Member Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950 shrink-0">
              <h3 className="font-bold text-white text-base">
                {editingMember ? 'Editar Miembro de la Plantilla' : 'Añadir Nuevo Miembro'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Juani Marcos"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                    Rol
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as MemberRole)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="player">Jugador</option>
                    <option value="staff">Cuerpo Técnico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                    Dorsal (Opcional)
                  </label>
                  <input
                    type="number"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    placeholder="Ej: 2"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* License Selection Tabs in Modal (for Players) */}
              {role === 'player' && (
                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Licencia / License</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      Regulación ACB / BCL
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LICENSE_OPTIONS.map((opt) => {
                      const isSelected = normalizeLicense(license) === opt.id;
                      const optVisual = getLicenseVisual(opt.id);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLicense(opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'border-amber-400 bg-stone-900 ring-1 ring-amber-400/40 text-white shadow-md'
                              : 'border-stone-800 bg-stone-900/50 hover:bg-stone-900 text-stone-400'
                          }`}
                        >
                          <span
                            className="w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border border-stone-700/50 shadow"
                            style={optVisual.pdfBadgeStyle}
                          >
                            #{jerseyNumber || '•'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                                {opt.label}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                            </div>
                            <span className="text-[10px] text-stone-400 block truncate leading-tight">
                              {opt.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Puesto / Cargo
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ej: Base / Entrenador Principal / Fisioterapeuta"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Teléfono WhatsApp (Con prefijo internacional +34)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34600112233"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-400 font-mono font-bold text-green-400"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Formato directo para abrir WhatsApp Web / App.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Notas / Observaciones Específicas
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Vendaje especial, sesión de tiro extra..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-stone-400 hover:text-stone-200 bg-stone-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-800 hover:bg-red-700 rounded-xl shadow cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
