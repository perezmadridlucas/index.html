import React from 'react';
import { CheckCircle2, ListChecks, Sparkles } from 'lucide-react';
import { UcamLogo } from './UcamLogo';

export const ProgressViewer: React.FC = () => {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div className="flex items-center gap-3.5">
          <UcamLogo size={48} showText={false} glow={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded uppercase font-sans">
                PROGRESS.md
              </span>
              <h2 className="text-xl font-black text-white tracking-wide">
                Progress & Workflow Guide
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Delegado Hub architecture specifications, features matrix, and implementation status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          <span>Fase Actualizada</span>
        </div>
      </div>

      {/* Progress Matrix */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <ListChecks className="w-4 h-4" />
          <span>Matriz de Requisitos y Estado de Implementación</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Tipos de Actividades */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-xs">1. Tipos de Actividades Solicitadas</span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-bold">100% OK</span>
            </div>
            <ul className="text-xs text-stone-300 space-y-1">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Individual Work Out</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Positional Work Out</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Team Practice (Opciones: *Taped* / *Not Taped*)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Taping Session (Fisioterapia & Vendajes)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Weights (Gimnasio / Fuerza)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Video Meeting (Scouting táctico)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Recovery (Crioterapia / Descanso)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Team Event (Compromisos institucionales)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Team Meal (Breakfast, Lunch, Dinner, Snack)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Departure Time (Opciones: *With luggage* / *Without luggage*)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> + Actividad Personalizada Manual</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Enlaces directos a Google Maps para cada ubicación</li>
            </ul>
          </div>

          {/* Card 2: Destinatarios & Canales WhatsApp */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-xs">2. Canales de Envío WhatsApp</span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-bold">100% OK</span>
            </div>
            <ul className="text-xs text-stone-300 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <span><strong>All Team Members:</strong> Plan íntegro en inglés para todo el club.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <span><strong>Collective Staff:</strong> Envío directo al grupo WhatsApp del cuerpo técnico.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <span><strong>Individual Players:</strong> Mensajes 1 a 1 en inglés con sesiones individuales destacadas.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <span><strong>Individual Staff:</strong> Mensajes 1 a 1 para miembros del cuerpo técnico.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Formato Estricto de Mensajes */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-xs">3. Reglas Estrictas de Redacción</span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-bold">100% OK</span>
            </div>
            <ul className="text-xs text-stone-300 space-y-1">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Redacción 100% en inglés.</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Sin emojis en ningún mensaje saliente.</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Sin líneas horizontales separadoras.</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Sin título de jornada/partido en el encabezado.</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Eliminado el campo de indumentaria.</li>
            </ul>
          </div>

          {/* Card 4: Plantilla Oficial Actualizada */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-xs">4. Plantilla y Staff Oficiales</span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-bold">100% OK</span>
            </div>
            <ul className="text-xs text-stone-300 space-y-1">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> 17 Jugadores oficiales (Juani Marcos, Dylan Ennis, Ennis, Cate, Sant-Ross...).</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> 15 Miembros del staff técnico y médico (Sito Alonso, Lucas Pérez, etc.).</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Escudo oficial UCAM Murcia Club de Baloncesto.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Roadmap Note */}
      <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-stone-300 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-200 block mb-0.5">
            Archivo de seguimiento: <code>PROGRESS.md</code>
          </span>
          <p className="text-stone-400 leading-relaxed">
            Se ha actualizado el archivo <code>PROGRESS.md</code> en la raíz del proyecto para registrar las nuevas especificaciones de idioma inglés, ausencia de emojis, eliminación de indumentaria y plantilla oficial completa.
          </p>
        </div>
      </div>
    </div>
  );
};
