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
import { CompartmentNode } from './CompartmentNode';

const nodeTypes = {
  topology: TopologyNode,
  compartment: CompartmentNode,
};

const initialNodes: Node[] = [
  // ------------------- GROUPS -------------------
  {
    id: 'grp-shared',
    type: 'compartment',
    position: { x: 800, y: 100 },
    style: { width: 360, height: 420, backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '2px dashed #3b82f6', borderRadius: '12px', overflow: 'hidden' },
    data: { label: 'cmp-shared-inv', color: '#3b82f6' },
  },
  {
    id: 'grp-oke-dev',
    type: 'compartment',
    position: { x: 50, y: 50 },
    style: { width: 340, height: 120, backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '2px dashed #eab308', borderRadius: '12px', overflow: 'hidden' },
    data: { label: 'Compartment: OKE > DEV', color: '#eab308' },
  },
  {
    id: 'grp-dev-inv',
    type: 'compartment',
    position: { x: 50, y: 200 },
    style: { width: 1090, height: 1060, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '2px dashed #a855f7', borderRadius: '12px', overflow: 'visible' },
    data: { label: 'Compartment: cmp-dev-inv', color: '#a855f7' },
  },
  {
    id: 'grp-buckets',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 30, y: 800 },
    style: { width: 1020, height: 230, backgroundColor: 'rgba(20, 184, 166, 0.05)', border: '2px dashed #14b8a6', borderRadius: '12px', overflow: 'hidden' },
    data: { label: 'OCI Object Storage — MFE Assets', color: '#14b8a6' },
  },
  {
    id: 'grp-nexus',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 30, y: 150 },
    style: { width: 560, height: 620, backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '2px dashed #ef4444', borderRadius: '12px', overflow: 'visible' },
    data: { label: 'Sub-Compartment: cmp-dev-nexus', color: '#ef4444' },
  },

  // ------------------- EXTERNAL -------------------
  {
    id: 'internet',
    position: { x: 230, y: -200 },
    type: 'topology',
    data: { resource: { name: 'Internet', type: 'gateway', details: 'Public Traffic', status: 'active' } },
  },
  {
    id: 'cloudflare',
    position: { x: 230, y: -80 },
    type: 'topology',
    data: { resource: { name: 'Cloudflare', type: 'apigateway', details: 'WAF & DNS (*.invista.com.br)', status: 'active' } },
  },

  // ------------------- SHARED INV -------------------
  {
    id: 'fortigate',
    parentId: 'grp-shared',
    position: { x: 70, y: 50 },
    type: 'topology',
    data: { resource: { name: 'FortiGate', type: 'gateway', details: '129.148.17.8 | SBNT-PUBLIC-SHARED', status: 'active' } },
  },
  {
    id: 'lb-crivo-dev',
    parentId: 'grp-shared',
    position: { x: 70, y: 170 },
    type: 'topology',
    data: { resource: { name: 'Test_Crivo_Dev (LB)', type: 'loadbalancer', details: '10.8.4.127 | crivo_routes', status: 'active' } },
  },
  {
    id: 'drg',
    parentId: 'grp-shared',
    position: { x: 70, y: 300 },
    type: 'topology',
    data: { resource: { name: 'DRG-Invista-Shared', type: 'gateway', details: 'Central Routing Hub', status: 'manual' } },
  },

  // ------------------- OKE DEV -------------------
  {
    id: 'vcn-oke',
    parentId: 'grp-oke-dev',
    position: { x: 80, y: 30 },
    type: 'topology',
    data: { resource: { name: 'VCN vcn-oke', type: 'vcn', details: '10.110.0.0/16 (Terraform)', status: 'active' } },
  },
  {
    id: 'bucket-shell',
    parentId: 'grp-buckets',
    position: { x: 10, y: 80 },
    type: 'topology',
    data: { resource: { name: 'mfe-shell-dev', type: 'bucket', details: '/mfe-shell/', status: 'active' } },
  },
  {
    id: 'bucket-auth',
    parentId: 'grp-buckets',
    position: { x: 180, y: 80 },
    type: 'topology',
    data: { resource: { name: 'mfe-auth-dev', type: 'bucket', details: '/mfe-auth/', status: 'active' } },
  },
  {
    id: 'bucket-user',
    parentId: 'grp-buckets',
    position: { x: 350, y: 80 },
    type: 'topology',
    data: { resource: { name: 'mfe-user-dev', type: 'bucket', details: '/mfe-user/', status: 'active' } },
  },
  {
    id: 'bucket-person',
    parentId: 'grp-buckets',
    position: { x: 520, y: 80 },
    type: 'topology',
    data: { resource: { name: 'mfe-person-dev', type: 'bucket', details: '/mfe-person/', status: 'active' } },
  },
  {
    id: 'bucket-poc',
    parentId: 'grp-buckets',
    position: { x: 690, y: 80 },
    type: 'topology',
    data: { resource: { name: 'mfe-poc-dev', type: 'bucket', details: '/mfe-poc/', status: 'active' } },
  },
  {
    id: 'bucket-formalization',
    parentId: 'grp-buckets',
    position: { x: 860, y: 80 },
    type: 'topology',
    data: { resource: { name: 'mfe-form-dev', type: 'bucket', details: '/mfe-formalization/', status: 'active' } },
  },

  // ------------------- DEV INV -------------------
  {
    id: 'vcn-dev',
    parentId: 'grp-dev-inv',
    position: { x: 800, y: 60 },
    type: 'topology',
    data: { resource: { name: 'VCN-DEV', type: 'vcn', details: '10.6.0.0/16 (Shared/Manual)', status: 'manual' } },
  },
  {
    id: 'apigw-dev',
    parentId: 'grp-dev-inv',
    position: { x: 650, y: 200 },
    type: 'topology',
    data: { resource: { name: 'api-gateway-dev', type: 'apigateway', details: 'bqdgz22e5... (PRIVATE) | 10.6.0.181 | SBNT-DEV', status: 'active' } },
  },

  // ------------------- NEXUS -------------------
  {
    id: 'apigw-nexus',
    parentId: 'grp-nexus',
    position: { x: 180, y: 60 },
    type: 'topology',
    data: { resource: { name: 'api-gateway-nexus-dev', type: 'apigateway', details: '10.6.0.123 (PRIVATE)', status: 'manual' } },
  },
  {
    id: 'cls-nexus',
    parentId: 'grp-nexus',
    position: { x: 30, y: 190 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-nexus', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' } },
  },
  {
    id: 'cls-barramento',
    parentId: 'grp-nexus',
    position: { x: 310, y: 190 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-barramento', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' } },
  },
  {
    id: 'cls-obs',
    parentId: 'grp-nexus',
    position: { x: 170, y: 360 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-observabilidade', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' } },
  },
  {
    id: 'lb-nexus-int',
    parentId: 'grp-nexus',
    position: { x: 30, y: 490 },
    type: 'topology',
    data: { resource: { name: 'LB nexus-int', type: 'loadbalancer', details: '10.110.135.3 | nginx-internal', status: 'active' } },
  },
  {
    id: 'lb-barramento-node',
    parentId: 'grp-nexus',
    position: { x: 310, y: 490 },
    type: 'topology',
    data: { resource: { name: 'LB barramento', type: 'loadbalancer', details: '10.110.133.131 | nginx-internal', status: 'active' } },
  },
];

const initialEdges: Edge[] = [
  { id: 'e-int-cf', source: 'internet', target: 'cloudflare', animated: true, style: { stroke: '#fff' } },

  // Cloudflare → FortiGate → LB → api-gateway-dev (unificado)
  { id: 'e-cf-fortigate', source: 'cloudflare', target: 'fortigate', label: 'api-gateway-dev.invista.com.br', animated: true },
  { id: 'e-fortigate-lb', source: 'fortigate', target: 'lb-crivo-dev', animated: true },
  { id: 'e-lb-apigwdev', source: 'lb-crivo-dev', target: 'apigw-dev', label: 'bs-api-gateway-dev', animated: true },

  // api-gateway-dev → buckets MFE (deploy-mfe-unified-dev)
  { id: 'e-apigwdev-shell', source: 'apigw-dev', target: 'bucket-shell', label: '/mfe-shell/' },
  { id: 'e-apigwdev-auth', source: 'apigw-dev', target: 'bucket-auth', label: '/mfe-auth/' },
  { id: 'e-apigwdev-user', source: 'apigw-dev', target: 'bucket-user', label: '/mfe-user/' },
  { id: 'e-apigwdev-person', source: 'apigw-dev', target: 'bucket-person', label: '/mfe-person/' },
  { id: 'e-apigwdev-poc', source: 'apigw-dev', target: 'bucket-poc', label: '/mfe-poc/' },
  { id: 'e-apigwdev-formalization', source: 'apigw-dev', target: 'bucket-formalization', label: '/mfe-formalization/' },

  // api-gateway-dev → ms-* K8s services (deploy-mfe-unified-dev extended)
  { id: 'e-apigwdev-lbnexusint', source: 'apigw-dev', target: 'lb-nexus-int', label: '8 ms-* routes', animated: true, style: { stroke: '#f97316' } },
  { id: 'e-apigwdev-lbbarr', source: 'apigw-dev', target: 'lb-barramento-node', label: '/ms-barramento/', animated: true, style: { stroke: '#f97316' } },
  { id: 'e-lbnexusint-clsnexus', source: 'lb-nexus-int', target: 'cls-nexus', label: 'nexus-services', style: { stroke: '#f97316' } },
  { id: 'e-lbbarr-clsbarr', source: 'lb-barramento-node', target: 'cls-barramento', label: 'integration-hub', style: { stroke: '#f97316' } },

  // DRG attachments
  { id: 'e-drg-vcnoke', source: 'drg', target: 'vcn-oke', label: 'ATT-VCN-OKE-DEV' },
  { id: 'e-drg-vcndev', source: 'drg', target: 'vcn-dev', label: 'ATT-VCN-DEV' },

  { id: 'e-vcndev-apigwnexus', source: 'vcn-dev', target: 'apigw-nexus' },

  { id: 'e-vcnoke-clsnexus', source: 'vcn-oke', target: 'cls-nexus' },
  { id: 'e-vcnoke-clsbarr', source: 'vcn-oke', target: 'cls-barramento' },
  { id: 'e-vcnoke-clsobs', source: 'vcn-oke', target: 'cls-obs' },
];

export function NexusDiagram() {
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

          <div className="mt-4 flex gap-2 flex-wrap">
            <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] font-bold border border-green-500/30">OK: CLUSTERS</div>
            <div className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-[10px] font-bold border border-indigo-500/30">Shared Net</div>
            <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-bold border border-yellow-500/30">6 MFEs (unified)</div>
            <div className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-[10px] font-bold border border-orange-500/30">9 ms-* APIs</div>
            <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-[10px] font-bold border border-purple-500/30">api-gateway-dev</div>
          </div>
        </Panel>

        <Panel position="bottom-right" className="bg-zinc-900/80 p-4 rounded-xl border border-white/10 text-[10px] font-mono text-zinc-500 m-4">
          SYSTEM_REPORT_ID: OCI-DEV-NEXUS-2026.03.11 | unified-gw | 9-ms-integrated
        </Panel>

        <Controls className="bg-zinc-800 border-zinc-700 !fill-white" />
        <MiniMap className="bg-zinc-900 border-zinc-800" nodeColor="#3f3f46" maskColor="rgba(0, 0, 0, 0.7)" />
        <Background color="#27272a" gap={20} />
      </ReactFlow>
    </div>
  );
}
