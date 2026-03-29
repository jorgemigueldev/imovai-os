'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { trpc } from '../../../../utils/trpc';
import { Save, Play, Plus } from 'lucide-react';

const initialNodes = [
  { id: '1', type: 'input', data: { label: 'Gatilho: Novo Lead' }, position: { x: 250, y: 5 }, style: { background: '#4f46e5', color: '#fff' } },
];

const initialEdges: any[] = [];

export default function AutomationBuilder({ params }: { params: { id: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const updateWorkflow = trpc.workflow.updateNodes.useMutation();

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onSave = async () => {
     await updateWorkflow.mutateAsync({
       workflowId: params.id,
       nodes: nodes.map(n => ({ id: n.id, type: n.type || 'default', x: n.position.x, y: n.position.y }))
     });
     alert('Automação salva com sucesso!');
  };

  const addNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      data: { label: `Ação: Enviar WhatsApp` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      style: { background: '#10b981', color: '#fff' }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="h-screen w-full bg-dark-bg flex flex-col">
      <header className="h-16 border-b border-dark-border flex items-center justify-between px-8 bg-dark-card">
        <h1 className="text-xl font-bold text-slate-200">Construtor de Automação Low-Code</h1>
        <div className="flex gap-4">
          <button onClick={addNode} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm">
            <Plus size={16} /> Adicionar Ação
          </button>
          <button onClick={onSave} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-lg text-sm text-white">
            <Save size={16} /> Salvar Fluxo
          </button>
        </div>
      </header>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="dark"
        >
          <Background color="#1e293b" gap={20} />
          <Controls />
          <MiniMap style={{ background: '#0f172a' }} nodeColor={() => '#4f46e5'} />
          <Panel position="top-left" className="bg-dark-card/80 p-4 rounded-lg border border-dark-border text-xs text-slate-400">
            Arraste os nós para desenhar a automação.<br/>Conecte os pontos para definir a sequência.
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
