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
import { terraformTopology } from './terraformData';

const nodeTypes = {
    topology: TopologyNode,
    compartment: CompartmentNode,
};

const initialNodes: Node[] = [
    // GROUPS
    {
        id: 'grp-nexus',
        type: 'compartment',
        position: { x: 50, y: 400 },
        style: { width: 1400, height: 750, backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '2px dashed #ef4444', borderRadius: '12px' },
        data: { label: 'Compartment: cmp-dev-nexus', color: '#ef4444' },
    },
    {
        id: 'grp-data',
        type: 'compartment',
        parentId: 'grp-nexus',
        position: { x: 40, y: 60 },
        style: { width: 850, height: 300, backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px dashed #38bdf8', borderRadius: '12px' },
        data: { label: 'Data Services (Privados)', color: '#38bdf8' },
    },
    {
        id: 'grp-security',
        type: 'compartment',
        parentId: 'grp-nexus',
        position: { x: 950, y: 60 },
        style: { width: 400, height: 300, backgroundColor: 'rgba(250, 204, 21, 0.05)', border: '1px dashed #facc15', borderRadius: '12px' },
        data: { label: 'Security & Storage', color: '#facc15' },
    },
    {
        id: 'grp-oke',
        type: 'compartment',
        parentId: 'grp-nexus',
        position: { x: 40, y: 400 },
        style: { width: 1310, height: 300, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '1px dashed #a855f7', borderRadius: '12px' },
        data: { label: 'OKE Clusters (Nexus/Bus/O11y)', color: '#a855f7' },
    },

    // DATA SERVICES (Top Left Wide)
    {
        id: 'tf_postgresql',
        parentId: 'grp-data',
        position: { x: 40, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_postgresql') },
    },
    {
        id: 'tf_redis',
        parentId: 'grp-data',
        position: { x: 300, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_redis') },
    },
    {
        id: 'tf_adj',
        parentId: 'grp-data',
        position: { x: 570, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_adj') },
    },

    // SECURITY & STORAGE (Top Right Tall)
    {
        id: 'tf_vault',
        parentId: 'grp-security',
        position: { x: 60, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_vault') },
    },
    {
        id: 'tf_bucket',
        parentId: 'grp-security',
        position: { x: 60, y: 190 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_bucket') },
    },

    // SHARED NETWORKING (External to Nexus)
    {
        id: 'grp-shared',
        type: 'compartment',
        position: { x: 620, y: 50 },
        style: { width: 330, height: 200, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '2px dashed #a855f7', borderRadius: '12px' },
        data: { label: 'cmp-shared-inv', color: '#a855f7' },
    },
    {
        id: 'tf_apigw',
        parentId: 'grp-shared',
        position: { x: 40, y: 70 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_apigw') },
    },

    // OKE CLUSTERS (Bottom Row 1)
    {
        id: 'tf_cls_nexus',
        parentId: 'grp-oke',
        position: { x: 60, y: 60 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_cls_nexus') },
    },
    {
        id: 'tf_cls_bus',
        parentId: 'grp-oke',
        position: { x: 530, y: 60 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_cls_bus') },
    },
    {
        id: 'tf_cls_obs',
        parentId: 'grp-oke',
        position: { x: 1000, y: 60 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_cls_obs') },
    },

    // SERVICE ACCOUNTS (Bottom Row 2)
    {
        id: 'sa_nexus',
        parentId: 'grp-oke',
        position: { x: 60, y: 190 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'sa_nexus') },
    },
    {
        id: 'sa_bus',
        parentId: 'grp-oke',
        position: { x: 530, y: 190 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'sa_bus') },
    },
    {
        id: 'sa_obs',
        parentId: 'grp-oke',
        position: { x: 1000, y: 190 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'sa_obs') },
    },
];

const initialEdges: Edge[] = [
    // API GW Connections
    { id: 'e-apigw-nex', source: 'tf_apigw', target: 'tf_cls_nexus', label: 'Route', type: 'smoothstep' },
    { id: 'e-apigw-bus', source: 'tf_apigw', target: 'tf_cls_bus', label: 'Route', type: 'smoothstep' },
    { id: 'e-apigw-obs', source: 'tf_apigw', target: 'tf_cls_obs', label: 'Route', type: 'smoothstep' },

    // Clusters -> Databases (Using step to avoid diagonal crossing chaos)
    { id: 'e-nex-pg', source: 'tf_cls_nexus', target: 'tf_postgresql', label: 'PgSQL (Port 5432)', animated: true, type: 'step' },
    { id: 'e-nex-rd', source: 'tf_cls_nexus', target: 'tf_redis', label: 'Redis (Port 6379)', animated: true, type: 'step' },
    { id: 'e-nex-adj', source: 'tf_cls_nexus', target: 'tf_adj', animated: true, type: 'step' },

    { id: 'e-bus-pg', source: 'tf_cls_bus', target: 'tf_postgresql', animated: true, type: 'step' },
    { id: 'e-obs-pg', source: 'tf_cls_obs', target: 'tf_postgresql', animated: true, type: 'step' },

    // Vault Interactions (secrets injection)
    { id: 'e-vault-pg', source: 'tf_vault', target: 'tf_postgresql', label: 'Inject KMS', animated: true, style: { stroke: '#facc15' }, type: 'smoothstep' },
    { id: 'e-vault-rd', source: 'tf_vault', target: 'tf_redis', label: 'Inject KMS', animated: true, style: { stroke: '#facc15' }, type: 'smoothstep' },
    { id: 'e-vault-adj', source: 'tf_vault', target: 'tf_adj', label: 'Inject KMS', animated: true, style: { stroke: '#facc15' }, type: 'smoothstep' },

    // Buckets
    { id: 'e-nex-bkt', source: 'tf_cls_nexus', target: 'tf_bucket', label: 'MFE Assets', type: 'smoothstep', style: { stroke: '#4ade80' } },

    // Service accounts (Internal ties)
    { id: 'e-sa-nex', source: 'sa_nexus', target: 'tf_cls_nexus', label: 'cicd auth', type: 'smoothstep' },
    { id: 'e-sa-bus', source: 'sa_bus', target: 'tf_cls_bus', label: 'cicd auth', type: 'smoothstep' },
    { id: 'e-sa-obs', source: 'sa_obs', target: 'tf_cls_obs', label: 'cicd auth', type: 'smoothstep' },
];

export function TerraformDiagram() {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    return (
        <div className="h-full w-full relative">
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
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                        TERRAFORM TOPOLOGY
                    </h1>
                    <p className="text-xs font-bold text-zinc-400 mt-3 uppercase tracking-widest flex flex-col gap-2">
                        <span>Source: invista-nexus_Fix-Unauthorized</span>
                        <a href="https://inventcloud.com.br/" target="_blank" rel="noreferrer" className="mt-2 block w-[140px] opacity-80 hover:opacity-100 transition-opacity">
                            <img src="/inventCloud_modelo-color-horiz-1.svg" alt="Inventcloud" className="w-full h-auto object-contain" />
                        </a>
                    </p>

                    <div className="mt-4 flex gap-2">
                        <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-bold border border-yellow-500/30">Vault Injection</div>
                        <div className="px-2 py-1 bg-sky-500/20 text-sky-400 rounded text-[10px] font-bold border border-sky-500/30">Managed DBs</div>
                    </div>
                </Panel>

                <Controls className="bg-zinc-800 border-zinc-700 !fill-white" />
                <MiniMap className="bg-zinc-900 border-zinc-800" nodeColor="#3f3f46" maskColor="rgba(0, 0, 0, 0.7)" />
                <Background color="#27272a" gap={20} />
            </ReactFlow>
        </div>
    );
}
