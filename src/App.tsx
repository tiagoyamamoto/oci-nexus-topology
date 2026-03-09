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

const nodeTypes = {
  topology: TopologyNode,
};

const initialNodes: Node[] = [
  // ------------------- GROUPS -------------------
  {
    id: 'grp-shared',
    type: 'group',
    position: { x: 800, y: 100 },
    style: { width: 280, height: 180, backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '2px dashed #3b82f6', borderRadius: '12px' },
    className: 'text-blue-300 font-extrabold p-2 text-sm',
    data: { label: 'cmp-shared-inv' },
  },
  {
    id: 'grp-oke-dev',
    type: 'group',
    position: { x: 50, y: 100 },
    style: { width: 650, height: 260, backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '2px dashed #eab308', borderRadius: '12px' },
    className: 'text-yellow-300 font-extrabold p-2 text-sm',
    data: { label: 'OKE > DEV' },
  },
  {
    id: 'grp-dev-inv',
    type: 'group',
    position: { x: 50, y: 400 },
    style: { width: 1030, height: 520, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '2px dashed #a855f7', borderRadius: '12px' },
    className: 'text-purple-300 font-extrabold p-2 text-sm',
    data: { label: 'cmp-dev-inv' },
  },
  {
    id: 'grp-nexus',
    type: 'group',
    parentId: 'grp-dev-inv',
    position: { x: 20, y: 150 },
    style: { width: 480, height: 350, backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '2px dashed #ef4444', borderRadius: '12px' },
    className: 'text-red-300 font-extrabold p-2 text-sm',
    data: { label: 'cmp-dev-nexus (Sub-Compartment)' },
  },

  // ------------------- EXTERNAL -------------------
  {
    id: 'internet',
    position: { x: 380, y: -160 },
    type: 'topology',
    data: { resource: { name: 'Internet', type: 'gateway', details: 'Public Traffic', status: 'active' } },
  },
  {
    id: 'cloudflare',
    position: { x: 380, y: -40 },
    type: 'topology',
    data: { resource: { name: 'Cloudflare', type: 'apigateway', details: 'WAF & DNS (*.invista.com.br)', status: 'active' } },
  },

  // ------------------- SHARED INV -------------------
  {
    id: 'drg',
    parentId: 'grp-shared',
    position: { x: 40, y: 60 },
    type: 'topology',
    data: { resource: { name: 'DRG-Invista-Shared', type: 'gateway', details: 'Central Routing Hub', status: 'manual' } },
  },

  // ------------------- OKE DEV -------------------
  {
    id: 'vcn-oke',
    parentId: 'grp-oke-dev',
    position: { x: 230, y: 50 },
    type: 'topology',
    data: { resource: { name: 'VCN vcn-oke', type: 'vcn', details: '10.110.0.0/16 (Terraform)', status: 'active' } },
  },
  {
    id: 'apigw-mfe',
    parentId: 'grp-oke-dev',
    position: { x: 100, y: 160 },
    type: 'topology',
    data: { resource: { name: 'api-gateway-mfe-dev', type: 'apigateway', details: '147.15.97.158 (PUBLIC)', status: 'active' } },
  },
  {
    id: 'bucket-mfe',
    parentId: 'grp-oke-dev',
    position: { x: 350, y: 160 },
    type: 'topology',
    data: { resource: { name: 'mfe-*-dev Buckets', type: 'bucket', details: 'Frontend Assets', status: 'active' } },
  },

  // ------------------- DEV INV -------------------
  {
    id: 'vcn-dev',
    parentId: 'grp-dev-inv',
    position: { x: 750, y: 50 },
    type: 'topology',
    data: { resource: { name: 'VCN-DEV', type: 'vcn', details: '10.6.0.0/16 (Shared/Manual)', status: 'manual' } },
  },

  // ------------------- NEXUS -------------------
  {
    id: 'apigw-nexus',
    parentId: 'grp-nexus',
    position: { x: 120, y: 40 },
    type: 'topology',
    data: { resource: { name: 'api-gateway-nexus-dev', type: 'apigateway', details: '10.6.0.123 (PRIVATE)', status: 'manual' } },
  },
  {
    id: 'cls-nexus',
    parentId: 'grp-nexus',
    position: { x: 20, y: 150 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-nexus', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' } },
  },
  {
    id: 'cls-barramento',
    parentId: 'grp-nexus',
    position: { x: 250, y: 150 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-barramento', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' } },
  },
  {
    id: 'cls-obs',
    parentId: 'grp-nexus',
    position: { x: 135, y: 250 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-observabilidade', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' } },
  },
];

const initialEdges: Edge[] = [
  { id: 'e-int-cf', source: 'internet', target: 'cloudflare', animated: true, style: { stroke: '#fff' } },
  { id: 'e-cf-apimfe', source: 'cloudflare', target: 'apigw-mfe', label: 'MFEs (Host)', animated: true },
  { id: 'e-cf-drg', source: 'cloudflare', target: 'drg', label: 'API/Backend', animated: true },
  { id: 'e-apimfe-bucket', source: 'apigw-mfe', target: 'bucket-mfe' },

  { id: 'e-drg-vcnoke', source: 'drg', target: 'vcn-oke', label: 'ATT-VCN-OKE-DEV' },
  { id: 'e-drg-vcndev', source: 'drg', target: 'vcn-dev', label: 'ATT-VCN-DEV' },

  { id: 'e-vcndev-apigwnexus', source: 'vcn-dev', target: 'apigw-nexus' },

  { id: 'e-vcnoke-clsnexus', source: 'vcn-oke', target: 'cls-nexus' },
  { id: 'e-vcnoke-clsbarr', source: 'vcn-oke', target: 'cls-barramento' },
  { id: 'e-vcnoke-clsobs', source: 'vcn-oke', target: 'cls-obs' },
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
