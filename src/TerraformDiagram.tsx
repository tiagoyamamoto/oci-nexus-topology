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
        id: 'grp-data',
        type: 'compartment',
        position: { x: 50, y: 50 },
        style: { width: 550, height: 400, backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '2px dashed #38bdf8', borderRadius: '12px' },
        data: { label: 'Data Services (Privados)', color: '#38bdf8' },
    },
    {
        id: 'grp-security',
        type: 'compartment',
        position: { x: 650, y: 50 },
        style: { width: 350, height: 400, backgroundColor: 'rgba(250, 204, 21, 0.05)', border: '2px dashed #facc15', borderRadius: '12px' },
        data: { label: 'Security & Storage', color: '#facc15' },
    },
    {
        id: 'grp-shared',
        type: 'compartment',
        position: { x: 350, y: 500 },
        style: { width: 300, height: 200, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '2px dashed #a855f7', borderRadius: '12px' },
        data: { label: 'Shared Networking', color: '#a855f7' },
    },
    {
        id: 'grp-oke',
        type: 'compartment',
        position: { x: 50, y: 750 },
        style: { width: 950, height: 400, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '2px dashed #a855f7', borderRadius: '12px' },
        data: { label: 'OKE Clusters (Nexus/Bus/O11y)', color: '#a855f7' },
    },

    // DATA SERVICES
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
        position: { x: 170, y: 240 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_adj') },
    },

    // SECURITY & STORAGE
    {
        id: 'tf_vault',
        parentId: 'grp-security',
        position: { x: 40, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_vault') },
    },
    {
        id: 'tf_bucket',
        parentId: 'grp-security',
        position: { x: 40, y: 240 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_bucket') },
    },

    // SHARED NETWORKING
    {
        id: 'tf_apigw',
        parentId: 'grp-shared',
        position: { x: 40, y: 60 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_apigw') },
    },

    // OKE CLUSTERS
    {
        id: 'tf_cls_nexus',
        parentId: 'grp-oke',
        position: { x: 40, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_cls_nexus') },
    },
    {
        id: 'tf_cls_bus',
        parentId: 'grp-oke',
        position: { x: 360, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_cls_bus') },
    },
    {
        id: 'tf_cls_obs',
        parentId: 'grp-oke',
        position: { x: 680, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_cls_obs') },
    },

    // SERVICE ACCOUNTS
    {
        id: 'sa_nexus',
        parentId: 'grp-oke',
        position: { x: 40, y: 260 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'sa_nexus') },
    },
    {
        id: 'sa_bus',
        parentId: 'grp-oke',
        position: { x: 360, y: 260 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'sa_bus') },
    },
    {
        id: 'sa_obs',
        parentId: 'grp-oke',
        position: { x: 680, y: 260 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'sa_obs') },
    },
];

const initialEdges: Edge[] = [
    // API GW Connections
    { id: 'e-apigw-nex', source: 'tf_apigw', target: 'tf_cls_nexus', label: 'Route', type: 'smoothstep' },
    { id: 'e-apigw-bus', source: 'tf_apigw', target: 'tf_cls_bus', label: 'Route', type: 'smoothstep' },
    { id: 'e-apigw-obs', source: 'tf_apigw', target: 'tf_cls_obs', label: 'Route', type: 'smoothstep' },

    // Clusters -> Databases
    { id: 'e-nex-pg', source: 'tf_cls_nexus', target: 'tf_postgresql', label: 'PgSQL (Port 5432)', animated: true, type: 'smoothstep' },
    { id: 'e-nex-rd', source: 'tf_cls_nexus', target: 'tf_redis', label: 'Redis (Port 6379)', animated: true, type: 'smoothstep' },
    { id: 'e-nex-adj', source: 'tf_cls_nexus', target: 'tf_adj', type: 'smoothstep' },

    { id: 'e-bus-pg', source: 'tf_cls_bus', target: 'tf_postgresql', animated: true, type: 'smoothstep' },
    { id: 'e-obs-pg', source: 'tf_cls_obs', target: 'tf_postgresql', animated: true, type: 'smoothstep' },

    // Vault Interactions (secrets injection)
    { id: 'e-vault-pg', source: 'tf_vault', target: 'tf_postgresql', label: 'Inject KMS', animated: true, style: { stroke: '#facc15' }, type: 'smoothstep' },
    { id: 'e-vault-rd', source: 'tf_vault', target: 'tf_redis', label: 'Inject KMS', animated: true, style: { stroke: '#facc15' }, type: 'smoothstep' },
    { id: 'e-vault-adj', source: 'tf_vault', target: 'tf_adj', label: 'Inject KMS', animated: true, style: { stroke: '#facc15' }, type: 'smoothstep' },

    // Buckets
    { id: 'e-nex-bkt', source: 'tf_cls_nexus', target: 'tf_bucket', label: 'MFE Assets', type: 'smoothstep' },

    // Service accounts (Internal ties)
    { id: 'e-sa-nex', source: 'sa_nexus', target: 'tf_cls_nexus', label: 'cicd auth' },
    { id: 'e-sa-bus', source: 'sa_bus', target: 'tf_cls_bus', label: 'cicd auth' },
    { id: 'e-sa-obs', source: 'sa_obs', target: 'tf_cls_obs', label: 'cicd auth' },
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
                    <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest flex flex-col gap-1">
                        <span>Source: invista-nexus_Fix-Unauthorized</span>
                        <a href="https://inventcloud.com.br/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors mt-2">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            inventcloud.com.br
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
