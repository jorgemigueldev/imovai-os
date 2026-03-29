'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Bot, 
  BarChart3, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-dark-bg text-dark-text min-h-screen overflow-hidden selection:bg-primary-500/30">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary-900/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full delay-700 animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center border-b border-dark-border/50">
        <div className="text-2xl font-black bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">
          IMOVAI OS <span className="text-xs align-top font-medium ml-1 bg-primary-900/50 px-2 py-0.5 rounded border border-primary-500/30 text-primary-400">PRO</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-primary-400 transition">Funcionalidades</a>
          <a href="#" className="hover:text-primary-400 transition">IA Beatriz</a>
          <a href="#" className="hover:text-primary-400 transition">Preços</a>
        </div>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary-600/20 transition transform hover:scale-105 active:scale-95 flex items-center gap-2">
          Começar Agora <ArrowRight size={16} />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center md:text-left flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="inline-flex items-center gap-2 bg-emerald-900/30 px-4 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles size={14} /> O Futuro das Imobiliárias v3.0
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight"
          >
            Venda Imóveis com <br />
            <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-emerald-400 bg-clip-text text-transparent">Poder de IA.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-400 max-w-xl leading-relaxed"
          >
            A Beatriz é a sua assistente virtual de elite. Ela qualifica, agenda e fecha negócios enquanto você foca no que importa.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button className="bg-white text-black px-10 py-4 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition">
              Teste Grátis 14 Dias
            </button>
            <button className="glass-card px-10 py-4 rounded-xl font-bold border border-dark-border hover:bg-slate-800 transition">
              Ver Demo Local
            </button>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 w-full max-w-2xl relative"
        >
          {/* Dashboard Mockup Placeholder */}
          <div className="glass-card aspect-video rounded-2xl border border-primary-500/20 shadow-2xl shadow-primary-500/10 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-black/80" />
             <BarChart3 size={80} className="text-primary-500 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="bg-dark-card/30 py-32 border-y border-dark-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Funcionalidades de Elite</h2>
            <p className="text-slate-400">Tudo o que uma imobiliária moderna precisa para dominar o mercado.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Bot size={32} className="text-primary-400" />}
              title="IA Beatriz 3.0"
              description="A única IA treinada em SPIN Selling e DISC para qualificar leads reais."
            />
            <FeatureCard 
              icon={<Zap size={32} className="text-emerald-400" />}
              title="Workflow Automático"
              description="Dispare mensagens e crie tarefas baseadas no comportamento do lead."
            />
            <FeatureCard 
              icon={<Shield size={32} className="text-primary-600" />}
              title="Multi-tenant Enterprise"
              description="Segurança de dados e controle total para grandes imobiliárias."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="glass-card max-w-4xl mx-auto overflow-hidden rounded-3xl border border-primary-500/20 flex flex-col md:flex-row shadow-2xl">
          <div className="flex-1 p-12 bg-dark-bg/50">
            <h3 className="text-3xl font-bold mb-4">Plano Enterprise</h3>
            <p className="text-slate-400 mb-8">A solução definitiva para o seu negócio.</p>
            <ul className="space-y-4">
              <PricingItem text="Usuários Ilimitados" />
              <PricingItem text="Beatriz em todos os leads" />
              <PricingItem text="Dashboard de Alta Alta Performance" />
              <PricingItem text="Suporte 24/7 de Priority" />
            </ul>
          </div>
          <div className="w-full md:w-80 bg-primary-600 p-12 flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-black mb-2">R$ 497</div>
            <div className="text-primary-200 text-sm font-bold uppercase tracking-widest mb-8">Por Mês</div>
            <button className="w-full bg-white text-primary-600 px-6 py-4 rounded-xl font-black hover:bg-slate-100 transition">
              Quero Agora
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="glass-card p-10 rounded-3xl border border-dark-border hover:border-primary-500/50 transition transform hover:-translate-y-2 group">
      <div className="mb-6 group-hover:scale-110 transition duration-300">{icon}</div>
      <h4 className="text-xl font-bold mb-4">{title}</h4>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="bg-emerald-500/20 p-1 rounded-full"><Check size={14} className="text-emerald-400" /></div>
      <span className="text-sm text-slate-300">{text}</span>
    </li>
  );
}
