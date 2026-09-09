import React from 'react';
import { History, Send, Copy, Clock, Trash2, CheckCircle2, User, Users } from 'lucide-react';
import { DispatchLog } from '../types';

interface DispatchHistoryProps {
  logs: DispatchLog[];
  onClearLogs: () => void;
}

export const DispatchHistory: React.FC<DispatchHistoryProps> = ({
  logs,
  onClearLogs,
}) => {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-950 text-purple-400 border border-purple-700/50 text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              DISPATCH AUDIT LOG
            </span>
            <h2 className="text-xl font-black text-white tracking-wide">
              WhatsApp Dispatch History
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Complete audit trail of schedules sent to players, staff, and team groups.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/50 border border-red-800/40 rounded-xl transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Borrar Historial</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed border-stone-800 rounded-2xl">
          <History className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-300">No hay registros de envíos todavía</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Cada vez que abras un chat de WhatsApp o copies un itinerario, quedará registrado aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className={`p-2 rounded-xl border shrink-0 ${
                  log.status === 'sent'
                    ? 'bg-green-950 border-green-700/60 text-green-400'
                    : 'bg-amber-950 border-amber-700/60 text-amber-400'
                }`}>
                  {log.status === 'sent' ? <Send className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{log.recipientName}</span>
                    <span className="text-[10px] bg-stone-900 border border-stone-700 px-1.5 py-0.2 rounded text-stone-400 font-mono">
                      {log.planDate}
                    </span>
                  </div>

                  <div className="text-stone-400 text-[11px] font-mono mt-0.5">
                    {log.recipientPhone && <span>WhatsApp: {log.recipientPhone} · </span>}
                    <span className="text-stone-500">{log.messageSnippet}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-stone-400 text-[11px] shrink-0">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>{new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span className="text-green-400 flex items-center gap-1 font-bold ml-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {log.status === 'sent' ? 'Enviado' : 'Copiado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
