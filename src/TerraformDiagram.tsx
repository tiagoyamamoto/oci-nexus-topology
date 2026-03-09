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
        style: { width: 500, height: 350, backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '2px dashed #38bdf8', borderRadius: '12px' },
        data: { label: 'Data Services (Privados)', color: '#38bdf8' },
    },
    {
        id: 'grp-security',
        type: 'compartment',
        position: { x: 600, y: 50 },
        style: { width: 300, height: 350, backgroundColor: 'rgba(250, 204, 21, 0.05)', border: '2px dashed #facc15', borderRadius: '12px' },
        data: { label: 'Security & Storage', color: '#facc15' },
    },
    {
        id: 'grp-oke',
        type: 'compartment',
        position: { x: 50, y: 450 },
        style: { width: 850, height: 400, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '2px dashed #a855f7', borderRadius: '12px' },
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
        position: { x: 260, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_redis') },
    },
    {
        id: 'tf_adj',
        parentId: 'grp-data',
        position: { x: 150, y: 220 },
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
        position: { x: 40, y: 220 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_bucket') },
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
        position: { x: 320, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_cls_bus') },
    },
    {
        id: 'tf_cls_obs',
        parentId: 'grp-oke',
        position: { x: 600, y: 80 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'tf_cls_obs') },
    },

    // SERVICE ACCOUNTS
    {
        id: 'sa_nexus',
        parentId: 'grp-oke',
        position: { x: 40, y: 240 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'sa_nexus') },
    },
    {
        id: 'sa_bus',
        parentId: 'grp-oke',
        position: { x: 320, y: 240 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'sa_bus') },
    },
    {
        id: 'sa_obs',
        parentId: 'grp-oke',
        position: { x: 600, y: 240 },
        type: 'topology',
        data: { resource: terraformTopology.find(r => r.id === 'sa_obs') },
    },
];

const initialEdges: Edge[] = [
    // Clusters -> Databases
    { id: 'e-nex-pg', source: 'tf_cls_nexus', target: 'tf_postgresql', label: 'Conexão DB', animated: true },
    { id: 'e-nex-rd', source: 'tf_cls_nexus', target: 'tf_redis', label: 'Cache', animated: true },
    { id: 'e-nex-adj', source: 'tf_cls_nexus', target: 'tf_adj' },

    // Vault Interactions (secrets injection)
    { id: 'e-vault-pg', source: 'tf_vault', target: 'tf_postgresql', label: 'Inject KMS', animated: true, style: { stroke: '#facc15' } },
    { id: 'e-vault-rd', source: 'tf_vault', target: 'tf_redis', label: 'Inject KMS', animated: true, style: { stroke: '#facc15' } },
    { id: 'e-vault-adj', source: 'tf_vault', target: 'tf_adj', label: 'Inject KMS', animated: true, style: { stroke: '#facc15' } },

    // Service accounts
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
                    <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">
                        Source: invista-nexus_Fix-Unauthorized
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
