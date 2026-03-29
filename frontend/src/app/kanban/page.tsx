'use client';

import React from 'react';
import { trpc } from '../../utils/trpc';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal } from 'lucide-react';

export default function KanbanPage() {
  const stages = trpc.pipeline.getStages.useQuery();

  if (stages.isLoading) return <div className="p-10 text-white text-center">Carregando Funil...</div>;

  return (
    <div className="p-8 h-screen overflow-x-auto flex gap-6 bg-dark-bg">
      {stages.data?.map((stage) => (
        <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-slate-300 uppercase text-xs tracking-widest">{stage.name}</h3>
            <span className="bg-dark-card px-2 py-0.5 rounded text-[10px] text-slate-500 border border-dark-border">{stage.cards.length}</span>
          </div>

          <div className="flex-1 bg-slate-900/40 rounded-xl p-2 border border-dark-border/50 min-h-[500px]">
            {stage.cards.map((card) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-card p-4 rounded-lg border border-dark-border mb-3 shadow-md hover:border-primary-500/50 cursor-grab active:cursor-grabbing transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm text-slate-200">{card.title}</p>
                  <MoreHorizontal size={14} className="text-slate-600" />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[10px] bg-primary-900/30 text-primary-400 px-2 py-0.5 rounded border border-primary-500/20">
                    R$ {card.value.toLocaleString()}
                  </span>
                  <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full bg-slate-700 border border-dark-bg flex items-center justify-center text-[10px]">
                       {card.lead.name.charAt(0)}
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <button className="w-full py-2 border border-dashed border-dark-border rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition flex items-center justify-center gap-2">
              <Plus size={12} /> Novo Card
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
