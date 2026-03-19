import { useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
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

type ViewMode = 'executive' | 'technical';

const initialNodes: Node[] = [
  {
    id: 'grp-edge',
    type: 'compartment',
    position: { x: -640, y: 30 },
    style: { width: 520, height: 560, backgroundColor: 'rgba(14, 165, 233, 0.05)', border: '2px dashed #0ea5e9', borderRadius: '20px', overflow: 'visible' },
    data: { label: 'Acesso e Entrega', color: '#0ea5e9' },
  },
  {
    id: 'grp-network',
    type: 'compartment',
    position: { x: -640, y: 640 },
    style: { width: 520, height: 360, backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '2px dashed #eab308', borderRadius: '20px', overflow: 'visible' },
    data: { label: 'Rede Compartilhada', color: '#eab308' },
  },
  {
    id: 'grp-automation',
    type: 'compartment',
    position: { x: 1760, y: 30 },
    style: { width: 540, height: 930, backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '2px dashed #6366f1', borderRadius: '20px', overflow: 'visible' },
    data: { label: 'Governança e Automação', color: '#6366f1' },
  },
  {
    id: 'grp-nexus',
    type: 'compartment',
    position: { x: -40, y: 30 },
    style: { width: 1720, height: 1380, backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '2px dashed #ef4444', borderRadius: '24px', overflow: 'visible' },
    data: { label: 'cmp-dev-nexus | Runtime unificado', color: '#ef4444' },
  },
  {
    id: 'grp-platform',
    type: 'compartment',
    parentId: 'grp-nexus',
    position: { x: 36, y: 90 },
    style: { width: 780, height: 430, backgroundColor: 'rgba(168, 85, 247, 0.06)', border: '1px dashed #a855f7', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'Plataforma OKE Atual', color: '#a855f7' },
  },
  {
    id: 'grp-data',
    type: 'compartment',
    parentId: 'grp-nexus',
    position: { x: 840, y: 90 },
    style: { width: 840, height: 430, backgroundColor: 'rgba(34, 197, 94, 0.06)', border: '1px dashed #22c55e', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'Dados Persistentes', color: '#22c55e' },
  },
  {
    id: 'grp-storage',
    type: 'compartment',
    parentId: 'grp-nexus',
    position: { x: 36, y: 560 },
    style: { width: 1644, height: 360, backgroundColor: 'rgba(20, 184, 166, 0.06)', border: '1px dashed #14b8a6', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'Buckets e Estado Terraform', color: '#14b8a6' },
  },
  {
    id: 'grp-legacy',
    type: 'compartment',
    parentId: 'grp-nexus',
    position: { x: 36, y: 960 },
    style: { width: 1644, height: 210, backgroundColor: 'rgba(113, 113, 122, 0.08)', border: '1px dashed #71717a', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'Legado e Resíduos Operacionais', color: '#71717a' },
  },

  { id: 'internet', parentId: 'grp-edge', position: { x: 150, y: 52 }, type: 'topology', data: { resource: { name: 'Internet', type: 'gateway', details: 'Entrada pública dos consumidores e parceiros', status: 'active', managedBy: 'manual' } } },
  { id: 'cloudflare', parentId: 'grp-edge', position: { x: 150, y: 176 }, type: 'topology', data: { resource: { name: 'Cloudflare', type: 'apigateway', details: 'DNS, proxy e camada WAF na borda', status: 'active', managedBy: 'manual' } } },
  { id: 'fortigate', parentId: 'grp-edge', position: { x: 150, y: 300 }, type: 'topology', data: { resource: { name: 'FortiGate', type: 'gateway', details: 'Borda compartilhada | rede corporativa', status: 'active', managedBy: 'manual' } } },
  { id: 'lb-crivo-dev', parentId: 'grp-edge', position: { x: 150, y: 424 }, type: 'topology', data: { resource: { name: 'Test_Crivo_Dev', type: 'loadbalancer', details: 'VIP privado que recebe host routing antes do API Gateway DEV', status: 'active', managedBy: 'manual' } } },
  { id: 'apigw-dev', parentId: 'grp-edge', position: { x: 150, y: 548 }, type: 'topology', data: { resource: { name: 'api-gateway-dev', type: 'apigateway', details: 'Gateway unificado DEV fora do compartment nexus; distribui MFE e MS para o runtime atual', status: 'active', managedBy: 'terraform' } } },

  { id: 'vcn-dev', parentId: 'grp-network', position: { x: 40, y: 110 }, type: 'topology', data: { resource: { name: 'VCN-DEV', type: 'vcn', details: 'Rede compartilhada onde o API Gateway DEV está conectado', status: 'active', managedBy: 'manual' } } },
  { id: 'drg', parentId: 'grp-network', position: { x: 180, y: 220 }, type: 'topology', data: { resource: { name: 'DRG-Invista-Shared', type: 'gateway', details: 'Hub de conectividade entre VCN-DEV e VCN OKE', status: 'active', managedBy: 'manual' } } },
  { id: 'vcn-oke', parentId: 'grp-network', position: { x: 320, y: 110 }, type: 'topology', data: { resource: { name: 'VCN vcn-oke', type: 'vcn', details: 'Rede 10.110.0.0/16 que sustenta os clusters atuais de Nexus e Observabilidade', status: 'active', managedBy: 'terraform' } } },

  { id: 'azuredevops', parentId: 'grp-automation', position: { x: 170, y: 54 }, type: 'topology', data: { resource: { name: 'Azure DevOps', type: 'box', details: 'Pipelines de infraestrutura e deploy de aplicações; opera os componentes Terraform e os pós-deploys', status: 'active', managedBy: 'hybrid' } } },
  { id: 'repo-tf', parentId: 'grp-automation', position: { x: 40, y: 220 }, type: 'topology', data: { resource: { name: 'tf_oci_clusters', type: 'box', details: 'Repositório Terraform principal do ambiente OCI Nexus', status: 'active', managedBy: 'terraform' } } },
  { id: 'repo-templates', parentId: 'grp-automation', position: { x: 300, y: 220 }, type: 'topology', data: { resource: { name: 'pipeline-templates', type: 'box', details: 'Templates compartilhados de pipeline usados nos deploys', status: 'active', managedBy: 'terraform' } } },
  { id: 'domain-nexus', parentId: 'grp-automation', position: { x: 40, y: 404 }, type: 'topology', data: { resource: { name: 'Identity Domain Nexus', type: 'shieldcheck', details: 'Domínio de identidade usado pela aplicação; não aparece como recurso operacional dentro do compartment', status: 'active', managedBy: 'manual' } } },
  { id: 'vault-nexus', parentId: 'grp-automation', position: { x: 300, y: 404 }, type: 'topology', data: { resource: { name: 'Vault / KMS Nexus', type: 'shieldcheck', details: 'Cofre e chaves para segredos e integração com bancos; consumido pelo runtime e pela automação', status: 'active', managedBy: 'hybrid' } } },
  { id: 'state-current', parentId: 'grp-automation', position: { x: 40, y: 588 }, type: 'topology', data: { resource: { name: 'nexus-terraform-tfstate', type: 'bucket', details: 'Bucket criado em 19/03/2026 para o estado atual do Terraform deste ambiente', status: 'active', managedBy: 'terraform' } } },
  { id: 'state-legacy', parentId: 'grp-automation', position: { x: 300, y: 588 }, type: 'topology', data: { resource: { name: 'tfstate-terraform', type: 'bucket', details: 'Bucket de estado legado ainda existente no compartment; manter sob revisão antes de remover', status: 'warning', managedBy: 'terraform' } } },

  { id: 'cls-nexus', parentId: 'grp-platform', position: { x: 70, y: 96 }, type: 'topology', data: { resource: { name: 'cls-dev-nexus', type: 'cluster', details: 'Cluster OKE ativo do domínio Nexus; recriado em 19/03/2026', status: 'active', managedBy: 'terraform' } } },
  { id: 'np-nexus', parentId: 'grp-platform', position: { x: 70, y: 248 }, type: 'topology', data: { resource: { name: 'np-dev-1', type: 'subnet', details: 'Node pool ativo do cluster Nexus | 3 nós | VM.Standard.E4.Flex | 2 OCPU / 16 GB', status: 'active', managedBy: 'terraform' } } },
  { id: 'cls-obs', parentId: 'grp-platform', position: { x: 330, y: 96 }, type: 'topology', data: { resource: { name: 'cls-dev-observabilidade', type: 'cluster', details: 'Cluster OKE ativo de observabilidade; recriado em 19/03/2026', status: 'active', managedBy: 'terraform' } } },
  { id: 'np-obs', parentId: 'grp-platform', position: { x: 330, y: 248 }, type: 'topology', data: { resource: { name: 'np-dev-3', type: 'subnet', details: 'Node pool ativo do cluster de observabilidade | 3 nós | VM.Standard.E4.Flex | 2 OCPU / 16 GB', status: 'active', managedBy: 'terraform' } } },
  { id: 'runtime-summary', parentId: 'grp-platform', position: { x: 560, y: 170 }, type: 'topology', data: { resource: { name: 'Runtime Atual Nexus', shortName: 'RUNTIME', summary: '2 clusters OKE ativos', type: 'cluster', details: 'Hoje o cmp-dev-nexus opera com 2 clusters: cls-dev-nexus e cls-dev-observabilidade. O barramento não aparece mais como cluster ativo neste compartment.', status: 'active', managedBy: 'terraform' } } },

  { id: 'db-pg-nexus', parentId: 'grp-data', position: { x: 70, y: 98 }, type: 'topology', data: { resource: { name: 'NEXUS_DEV (PostgreSQL)', type: 'database', details: 'DB System PostgreSQL criado via console OCI; base operacional dos microsserviços Nexus', status: 'active', managedBy: 'manual' } } },
  { id: 'db-pg-barramento', parentId: 'grp-data', position: { x: 330, y: 98 }, type: 'topology', data: { resource: { name: 'BARRAMENTO_DEV (PostgreSQL)', type: 'database', details: 'DB System PostgreSQL do barramento; existe no compartment, mas o cluster OKE correspondente não está ativo aqui hoje', status: 'warning', managedBy: 'manual' } } },
  { id: 'db-redis', parentId: 'grp-data', position: { x: 590, y: 98 }, type: 'topology', data: { resource: { name: 'NEXUS_DEV (Redis)', type: 'database', details: 'Redis Cluster ativo criado manualmente no OCI; usado para cache e sessão', status: 'active', managedBy: 'manual' } } },
  { id: 'db-ajd', parentId: 'grp-data', position: { x: 200, y: 250 }, type: 'topology', data: { resource: { name: 'NEXUS_DEV (AJD)', type: 'database', details: 'Autonomous JSON Database (AJD) ativo no compartment desde 21/01/2026', status: 'active', managedBy: 'manual' } } },
  { id: 'data-summary', parentId: 'grp-data', position: { x: 470, y: 250 }, type: 'topology', data: { resource: { name: 'Dados Operacionais', shortName: 'DADOS', summary: '4 serviços de dados', type: 'database', details: 'O ambiente atual mistura clusters Terraform com bancos e cache provisionados manualmente no OCI.', status: 'active', managedBy: 'hybrid' } } },

  { id: 'mfe-summary', parentId: 'grp-storage', position: { x: 70, y: 104 }, type: 'topology', data: { resource: { name: 'Buckets MFE DEV', shortName: 'MFE BUCKETS', summary: '6 buckets de frontends', type: 'bucket', details: 'Buckets criados em 19/03/2026: mfe-auth-dev, mfe-formalization-dev, mfe-person-dev, mfe-poc-dev, mfe-shell-dev e mfe-user-dev.', status: 'active', managedBy: 'terraform' } } },
  { id: 'bucket-shell', parentId: 'grp-storage', position: { x: 340, y: 44 }, type: 'topology', data: { resource: { name: 'mfe-shell-dev', type: 'bucket', details: 'Assets do shell frontend', status: 'active', managedBy: 'terraform' } } },
  { id: 'bucket-auth', parentId: 'grp-storage', position: { x: 580, y: 44 }, type: 'topology', data: { resource: { name: 'mfe-auth-dev', type: 'bucket', details: 'Assets do auth frontend', status: 'active', managedBy: 'terraform' } } },
  { id: 'bucket-user', parentId: 'grp-storage', position: { x: 820, y: 44 }, type: 'topology', data: { resource: { name: 'mfe-user-dev', type: 'bucket', details: 'Assets do user frontend', status: 'active', managedBy: 'terraform' } } },
  { id: 'bucket-person', parentId: 'grp-storage', position: { x: 340, y: 204 }, type: 'topology', data: { resource: { name: 'mfe-person-dev', type: 'bucket', details: 'Assets do person frontend', status: 'active', managedBy: 'terraform' } } },
  { id: 'bucket-poc', parentId: 'grp-storage', position: { x: 580, y: 204 }, type: 'topology', data: { resource: { name: 'mfe-poc-dev', type: 'bucket', details: 'Assets do poc frontend', status: 'active', managedBy: 'terraform' } } },
  { id: 'bucket-formalization', parentId: 'grp-storage', position: { x: 820, y: 204 }, type: 'topology', data: { resource: { name: 'mfe-formalization-dev', type: 'bucket', details: 'Assets do formalization frontend', status: 'active', managedBy: 'terraform' } } },
  { id: 'storage-state-summary', parentId: 'grp-storage', position: { x: 1120, y: 104 }, type: 'topology', data: { resource: { name: 'Terraform State', shortName: 'STATE', summary: 'bucket atual + bucket legado', type: 'bucket', details: 'O compartment mantém o novo bucket nexus-terraform-tfstate e também o tfstate-terraform herdado.', status: 'warning', managedBy: 'terraform' } } },

  { id: 'legacy-lbs', parentId: 'grp-legacy', position: { x: 90, y: 78 }, type: 'topology', data: { resource: { name: 'Legacy Load Balancers', type: 'loadbalancer', details: 'Existem 4 load balancers ativos associados a clusters antigos/deletados. Devem ser tratados como resíduo operacional até validação e limpeza.', status: 'warning', managedBy: 'manual' } } },
  { id: 'legacy-gw', parentId: 'grp-legacy', position: { x: 380, y: 78 }, type: 'topology', data: { resource: { name: 'api-gateway-nexus-dev', type: 'apigateway', details: 'Gateway legado já removido do fluxo principal; permanece apenas como referência histórica.', status: 'inactive', managedBy: 'manual' } } },
  { id: 'legacy-note', parentId: 'grp-legacy', position: { x: 670, y: 78 }, type: 'topology', data: { resource: { name: 'Leitura Operacional', shortName: 'LEGADO', summary: 'não confundir com runtime atual', type: 'box', details: 'O desenho principal considera apenas os 2 clusters OKE atuais. Componentes órfãos ou deletados foram isolados aqui para evitar leitura incorreta.', status: 'warning', managedBy: 'hybrid' } } },
];

const initialEdges: Edge[] = [
  { id: 'e-internet-cf', source: 'internet', target: 'cloudflare', label: 'DNS / proxy', animated: true, type: 'smoothstep', style: { stroke: '#0ea5e9' } },
  { id: 'e-cf-forti', source: 'cloudflare', target: 'fortigate', label: 'borda', animated: true, type: 'smoothstep', style: { stroke: '#0ea5e9' } },
  { id: 'e-forti-lb', source: 'fortigate', target: 'lb-crivo-dev', label: 'entrada privada', animated: true, type: 'smoothstep', style: { stroke: '#0ea5e9' } },
  { id: 'e-lb-apigw', source: 'lb-crivo-dev', target: 'apigw-dev', label: 'host routing', animated: true, type: 'smoothstep', style: { stroke: '#0ea5e9' } },

  { id: 'e-vcndev-drg', source: 'vcn-dev', target: 'drg', label: 'trânsito', type: 'smoothstep', style: { stroke: '#eab308' } },
  { id: 'e-drg-vcnoke', source: 'drg', target: 'vcn-oke', label: 'ATT-VCN-OKE-DEV', type: 'smoothstep', style: { stroke: '#eab308' } },

  { id: 'e-apigw-runtime', source: 'apigw-dev', target: 'runtime-summary', label: 'rotas MS', animated: true, type: 'bezier', style: { stroke: '#f97316' } },
  { id: 'e-apigw-buckets', source: 'apigw-dev', target: 'mfe-summary', label: 'rotas MFE', animated: true, type: 'bezier', style: { stroke: '#14b8a6' } },

  { id: 'e-vcnoke-nexus', source: 'vcn-oke', target: 'cls-nexus', label: 'rede OKE', type: 'bezier', style: { stroke: '#a855f7' } },
  { id: 'e-vcnoke-obs', source: 'vcn-oke', target: 'cls-obs', label: 'rede OKE', type: 'bezier', style: { stroke: '#a855f7' } },
  { id: 'e-cls-np-nexus', source: 'cls-nexus', target: 'np-nexus', label: 'node pool', type: 'smoothstep', style: { stroke: '#a855f7', strokeDasharray: '4 3' } },
  { id: 'e-cls-np-obs', source: 'cls-obs', target: 'np-obs', label: 'node pool', type: 'smoothstep', style: { stroke: '#a855f7', strokeDasharray: '4 3' } },
  { id: 'e-runtime-clusters-1', source: 'runtime-summary', target: 'cls-nexus', type: 'smoothstep', style: { stroke: '#a855f7' } },
  { id: 'e-runtime-clusters-2', source: 'runtime-summary', target: 'cls-obs', type: 'smoothstep', style: { stroke: '#a855f7' } },

  { id: 'e-nexus-pg', source: 'cls-nexus', target: 'db-pg-nexus', label: '5432', animated: true, type: 'bezier', style: { stroke: '#22c55e' } },
  { id: 'e-nexus-redis', source: 'cls-nexus', target: 'db-redis', label: '6379', animated: true, type: 'bezier', style: { stroke: '#22c55e' } },
  { id: 'e-nexus-ajd', source: 'cls-nexus', target: 'db-ajd', label: 'JSON', animated: true, type: 'bezier', style: { stroke: '#22c55e' } },
  { id: 'e-obs-pg', source: 'cls-obs', target: 'db-pg-nexus', label: 'telemetria', type: 'bezier', style: { stroke: '#22c55e', strokeDasharray: '4 3' } },
  { id: 'e-data-summary-pg1', source: 'data-summary', target: 'db-pg-nexus', type: 'smoothstep', style: { stroke: '#22c55e' } },
  { id: 'e-data-summary-pg2', source: 'data-summary', target: 'db-pg-barramento', type: 'smoothstep', style: { stroke: '#f59e0b' } },
  { id: 'e-data-summary-redis', source: 'data-summary', target: 'db-redis', type: 'smoothstep', style: { stroke: '#22c55e' } },
  { id: 'e-data-summary-ajd', source: 'data-summary', target: 'db-ajd', type: 'smoothstep', style: { stroke: '#22c55e' } },

  { id: 'e-mfe-shell', source: 'mfe-summary', target: 'bucket-shell', type: 'smoothstep', style: { stroke: '#14b8a6' } },
  { id: 'e-mfe-auth', source: 'mfe-summary', target: 'bucket-auth', type: 'smoothstep', style: { stroke: '#14b8a6' } },
  { id: 'e-mfe-user', source: 'mfe-summary', target: 'bucket-user', type: 'smoothstep', style: { stroke: '#14b8a6' } },
  { id: 'e-mfe-person', source: 'mfe-summary', target: 'bucket-person', type: 'smoothstep', style: { stroke: '#14b8a6' } },
  { id: 'e-mfe-poc', source: 'mfe-summary', target: 'bucket-poc', type: 'smoothstep', style: { stroke: '#14b8a6' } },
  { id: 'e-mfe-form', source: 'mfe-summary', target: 'bucket-formalization', type: 'smoothstep', style: { stroke: '#14b8a6' } },
  { id: 'e-state-current', source: 'storage-state-summary', target: 'state-current', type: 'smoothstep', style: { stroke: '#14b8a6' } },
  { id: 'e-state-legacy', source: 'storage-state-summary', target: 'state-legacy', type: 'smoothstep', style: { stroke: '#f59e0b' } },

  { id: 'e-ado-repo', source: 'azuredevops', target: 'repo-tf', label: 'infra', type: 'smoothstep', style: { stroke: '#6366f1' } },
  { id: 'e-ado-templates', source: 'azuredevops', target: 'repo-templates', label: 'templates', type: 'smoothstep', style: { stroke: '#6366f1' } },
  { id: 'e-ado-gw', source: 'azuredevops', target: 'apigw-dev', label: 'apply / publish', animated: true, type: 'bezier', style: { stroke: '#6366f1', strokeDasharray: '6 4' } },
  { id: 'e-ado-runtime', source: 'azuredevops', target: 'runtime-summary', label: 'deploys', animated: true, type: 'bezier', style: { stroke: '#6366f1', strokeDasharray: '6 4' } },
  { id: 'e-ado-storage', source: 'azuredevops', target: 'mfe-summary', label: 'frontend assets', animated: true, type: 'bezier', style: { stroke: '#6366f1', strokeDasharray: '6 4' } },
  { id: 'e-ado-state', source: 'repo-tf', target: 'state-current', label: 'remote state', type: 'bezier', style: { stroke: '#10b981', strokeDasharray: '6 4' } },
  { id: 'e-vault-data', source: 'vault-nexus', target: 'data-summary', label: 'segredos', type: 'bezier', style: { stroke: '#facc15', strokeDasharray: '4 3' } },
  { id: 'e-domain-runtime', source: 'domain-nexus', target: 'cls-nexus', label: 'auth app', type: 'bezier', style: { stroke: '#f97316', strokeDasharray: '4 3' } },
];

const executiveOnlyNodeIds = new Set(['runtime-summary', 'data-summary', 'mfe-summary', 'storage-state-summary', 'legacy-note']);
const technicalOnlyNodeIds = new Set([
  'np-nexus',
  'np-obs',
  'bucket-shell',
  'bucket-auth',
  'bucket-user',
  'bucket-person',
  'bucket-poc',
  'bucket-formalization',
  'state-current',
  'state-legacy',
]);

export function NexusDiagram() {
  const [viewMode, setViewMode] = useState<ViewMode>('executive');

  const nodes = useMemo(() => {
    return initialNodes.filter((node) => {
      if (viewMode === 'executive') {
        return !technicalOnlyNodeIds.has(node.id);
      }

      return !executiveOnlyNodeIds.has(node.id);
    });
  }, [viewMode]);

  const edges = useMemo(() => {
    const visible = new Set(nodes.map((node) => node.id));
    return initialEdges.filter((edge) => visible.has(edge.source) && visible.has(edge.target));
  }, [nodes]);

  return (
    <div className="h-screen w-screen bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.14, minZoom: 0.3, maxZoom: 1.2 }}
        defaultEdgeOptions={{
          type: 'bezier',
          style: { stroke: '#71717a', strokeWidth: 1.7 },
          labelStyle: { fill: '#f4f4f5', fontSize: 10, fontWeight: 700 },
          labelBgStyle: { fill: 'rgba(9, 9, 11, 0.92)', fillOpacity: 1 },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 8,
        }}
      >
        <Panel position="top-left" className="bg-zinc-950/82 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-white m-4 shadow-2xl max-w-[700px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight">OCI Nexus DEV</h1>
              <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-[0.24em]">Topologia unificada | atualizada em 19/03/2026</p>
            </div>
            <div className="flex rounded-xl border border-white/10 bg-zinc-900/80 p-1">
              <button
                onClick={() => setViewMode('executive')}
                className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${viewMode === 'executive' ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
              >
                Executiva
              </button>
              <button
                onClick={() => setViewMode('technical')}
                className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${viewMode === 'technical' ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
              >
                Técnica
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-300">
            O desenho agora junta a visão operacional da OCI com a visão de automação. Cada nó mostra explicitamente se o recurso é <span className="text-emerald-300 font-bold">Terraform</span>, <span className="text-orange-300 font-bold">Manual</span> ou <span className="text-sky-300 font-bold">Misto</span>.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-emerald-300">Terraform</div>
            <div className="rounded-xl border border-orange-400/30 bg-orange-500/15 px-3 py-2 text-orange-300">Manual</div>
            <div className="rounded-xl border border-sky-400/30 bg-sky-500/15 px-3 py-2 text-sky-300">Misto</div>
          </div>
        </Panel>

        <Panel position="bottom-left" className="bg-zinc-950/84 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white m-4 shadow-2xl max-w-[560px]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Leitura Operacional</p>
          <div className="space-y-1.5 text-[11px] leading-relaxed text-zinc-300">
            <p>O runtime atual do `cmp-dev-nexus` tem <span className="font-bold text-white">2 clusters OKE ativos</span>: `cls-dev-nexus` e `cls-dev-observabilidade`.</p>
            <p>Os <span className="font-bold text-white">serviços de dados</span> continuam majoritariamente fora do Terraform: PostgreSQL, Redis e AJD seguem como provisionamento manual.</p>
            <p>Os <span className="font-bold text-white">buckets MFE</span> e o novo bucket `nexus-terraform-tfstate` foram criados em `19/03/2026`.</p>
            <p>Os <span className="font-bold text-amber-300">load balancers legados</span> permanecem isolados no layout para não serem confundidos com o runtime atual.</p>
          </div>
        </Panel>

        <Panel position="bottom-right" className="bg-zinc-950/80 p-4 rounded-2xl border border-white/10 text-[10px] font-mono text-zinc-500 m-4 max-w-[440px]">
          SOURCE: OCI CLI + cmp-dev-nexus inventory | unified-layout-v2026.03.19 | route /terraform mantida apenas como alias
        </Panel>

        <Controls className="bg-zinc-900 border-zinc-700 !fill-white" />
        <MiniMap className="bg-zinc-950 border-zinc-800" nodeColor="#3f3f46" maskColor="rgba(0, 0, 0, 0.72)" />
        <Background color="#27272a" gap={24} />
      </ReactFlow>
    </div>
  );
}
