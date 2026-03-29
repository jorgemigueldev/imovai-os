'use client';

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  MessageSquare, 
  Home, 
  Layers,
  Zap,
  Target
} from 'lucide-react';
import { trpc } from '../utils/trpc';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const stats = trpc.dashboard.getStats.useQuery();

  if (stats.isLoading) return <div className="p-10 text-white">Carregando métricas...</div>;

  return (
    <div className="flex bg-dark-bg text-dark-text min-h-screen">
      {/* Sidebar Placeholder (Componentizing would be better but keeping it cohesive) */}
      <aside className="w-64 bg-dark-card border-r border-dark-border min-h-screen p-6 hidden md:block">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent mb-10">IMOVAI OS v3.0 PRO</h1>
        <nav className="space-y-4">
          <SidebarLink icon={<Home size={18}/>} label="Dashboard" active />
          <SidebarLink icon={<Users size={18}/>} label="CRM" />
          <SidebarLink icon={<Layers size={18}/>} label="Pipeline" />
          <SidebarLink icon={<MessageSquare size={18}/>} label="IA Beatriz" />
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <header className="mb-10">
          <h2 className="text-3xl font-bold">Dashboard Executivo</h2>
          <p className="text-slate-400">Visão geral da sua imobiliária em tempo real.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard 
            title="Total de Leads" 
            value={stats.data?.leadCount || 0} 
            icon={<Users className="text-primary-400" />} 
          />
          <KpiCard 
            title="Negócios Ativos" 
            value={stats.data?.cardCount || 0} 
            icon={<Layers className="text-orange-400" />} 
          />
          <KpiCard 
            title="VGV Total" 
            value={`R$ ${((stats.data?.vgv || 0) / 1000000).toFixed(1)}M`} 
            icon={<TrendingUp className="text-emerald-400" />} 
          />
          <KpiCard 
            title="Taxa de Conversão" 
            value={`${stats.data?.conversionRate || 0}%`} 
            icon={<Target className="text-rose-400" />} 
          />
          <KpiCard 
            title="Lead Velocity" 
            value={stats.data?.leadVelocity || 'Estável'} 
            icon={<Zap className="text-yellow-400" />} 
          />
        </div>

        <section className="mt-12 glass-card p-8">
          <h3 className="text-xl font-semibold mb-6">Performance de Conversão</h3>
          <div className="h-64 flex items-center justify-center border border-dashed border-dark-border rounded-xl">
            <span className="text-slate-500 italic">Gráficos tRPC integrados com Recharts (Placeholder)</span>
          </div>
        </section>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: any) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition ${active ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
      {icon} <span>{label}</span>
    </div>
  );
}

function KpiCard({ title, value, icon }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6 border-l-4 border-l-primary-500"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-slate-400 text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </motion.div>
  );
}
