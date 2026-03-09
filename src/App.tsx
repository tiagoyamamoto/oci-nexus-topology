import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TopologyNode } from './TopologyNode';
import { nexusTopology } from './data';

const nodeTypes = {
  topology: TopologyNode,
};

// Initial state for demonstration - creating a hierarchy
const initialNodes: Node[] = [
  {
    id: 'internet',
    position: { x: 400, y: 0 },
    data: { resource: { name: 'Internet Traffic', type: 'gateway', details: 'External Access', status: 'active' } },
    type: 'topology',
  },
  {
    id: 'cloudflare',
    position: { x: 400, y: 120 },
    data: { resource: { name: 'Cloudflare WAF', type: 'apigateway', details: '*.invista.com.br', status: 'active' } },
    type: 'topology',
  },
  // OKE Layer
  {
    id: 'vcn-oke',
    position: { x: 200, y: 250 },
    data: { resource: nexusTopology.find(r => r.id === 'vcn-oke') },
    type: 'topology',
  },
  {
    id: 'cls-nexus',
    position: { x: 100, y: 400 },
    data: { resource: nexusTopology.find(r => r.id === 'cls-nexus') },
    type: 'topology',
  },
  {
    id: 'cls-barramento',
    position: { x: 300, y: 400 },
    data: { resource: nexusTopology.find(r => r.id === 'cls-barramento') },
    type: 'topology',
  },
  // Shared Layer
  {
    id: 'drg',
    position: { x: 600, y: 250 },
    data: { resource: nexusTopology.find(r => r.id === 'drg') },
    type: 'topology',
  },
  {
    id: 'vcn-dev',
    position: { x: 600, y: 400 },
    data: { resource: nexusTopology.find(r => r.id === 'vcn-dev') },
    type: 'topology',
  },
];

const initialEdges: Edge[] = [
  { id: 'e-int-cf', source: 'internet', target: 'cloudflare', animated: true },
  { id: 'e-cf-oke', source: 'cloudflare', target: 'vcn-oke' },
  { id: 'e-cf-drg', source: 'cloudflare', target: 'drg' },
  { id: 'e-oke-nexus', source: 'vcn-oke', target: 'cls-nexus' },
  { id: 'e-oke-bar', source: 'vcn-oke', target: 'cls-barramento' },
  { id: 'e-drg-dev', source: 'drg', target: 'vcn-dev' },
];

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-screen w-screen bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Panel position="top-left" className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white m-4 shadow-2xl">
          <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            NEXUS TOPOLOGY
          </h1>
          <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">OCI Compartment: cmp-dev-nexus</p>

          <div className="mt-4 flex gap-2">
            <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] font-bold border border-green-500/30">OK: CLUSTERS</div>
            <div className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-[10px] font-bold border border-indigo-500/30">Shared Net</div>
          </div>
        </Panel>

        <Panel position="bottom-right" className="bg-zinc-900/80 p-4 rounded-xl border border-white/10 text-[10px] font-mono text-zinc-500 m-4">
          SYSTEM_REPORT_ID: OCI-DEV-NEXUS-2026.03.09
        </Panel>

        <Controls className="bg-zinc-800 border-zinc-700 !fill-white" />
        <MiniMap className="bg-zinc-900 border-zinc-800" nodeColor="#3f3f46" maskColor="rgba(0, 0, 0, 0.7)" />
        <Background color="#27272a" gap={20} />
      </ReactFlow>
    </div>
  );
}
