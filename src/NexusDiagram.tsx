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
  {
    id: 'grp-ado',
    type: 'compartment',
    position: { x: -760, y: 20 },
    style: { width: 470, height: 1490, backgroundColor: 'rgba(14, 165, 233, 0.05)', border: '2px dashed #0ea5e9', borderRadius: '16px', overflow: 'hidden' },
    data: { label: 'Azure DevOps Repos', color: '#0ea5e9' },
  },
  {
    id: 'grp-oke-dev',
    type: 'compartment',
    position: { x: -180, y: 20 },
    style: { width: 460, height: 210, backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '2px dashed #eab308', borderRadius: '16px', overflow: 'hidden' },
    data: { label: 'OKE > DEV', color: '#eab308' },
  },
  {
    id: 'grp-shared',
    type: 'compartment',
    position: { x: 1080, y: 40 },
    style: { width: 420, height: 520, backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '2px dashed #3b82f6', borderRadius: '16px', overflow: 'hidden' },
    data: { label: 'cmp-shared-inv', color: '#3b82f6' },
  },
  {
    id: 'grp-barramento',
    type: 'compartment',
    position: { x: 1080, y: 620 },
    style: { width: 720, height: 240, backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '2px dashed #22c55e', borderRadius: '16px', overflow: 'hidden' },
    data: { label: 'ms-barramento', color: '#22c55e' },
  },
  {
    id: 'grp-dev-inv',
    type: 'compartment',
    position: { x: -220, y: 280 },
    style: { width: 1240, height: 1900, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '2px dashed #a855f7', borderRadius: '16px', overflow: 'visible' },
    data: { label: 'cmp-dev-inv', color: '#a855f7' },
  },
  {
    id: 'grp-nexus',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 40, y: 150 },
    style: { width: 860, height: 980, backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '2px dashed #ef4444', borderRadius: '16px', overflow: 'visible' },
    data: { label: 'cmp-dev-nexus', color: '#ef4444' },
  },
  {
    id: 'grp-buckets',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 40, y: 1170 },
    style: { width: 1120, height: 420, backgroundColor: 'rgba(20, 184, 166, 0.05)', border: '2px dashed #14b8a6', borderRadius: '16px', overflow: 'hidden' },
    data: { label: 'MFE Assets / Object Storage', color: '#14b8a6' },
  },
  {
    id: 'grp-iam-nexus',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 40, y: 1630 },
    style: { width: 1120, height: 220, backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '2px dashed #38bdf8', borderRadius: '16px', overflow: 'hidden' },
    data: { label: 'IAM / Vault / App Auth', color: '#38bdf8' },
  },

  {
    id: 'internet',
    position: { x: 260, y: -250 },
    type: 'topology',
    data: { resource: { name: 'Internet', type: 'gateway', details: 'Public traffic', status: 'active' } },
  },
  {
    id: 'cloudflare',
    position: { x: 260, y: -100 },
    type: 'topology',
    data: { resource: { name: 'Cloudflare', type: 'apigateway', details: 'DNS + WAF | *.invista.com.br', status: 'active' } },
  },

  {
    id: 'ado-platform',
    parentId: 'grp-ado',
    position: { x: 120, y: 50 },
    type: 'topology',
    data: { resource: { name: 'Azure DevOps', type: 'box', details: 'Projeto CN-Squad | pipelines separadas por repo', status: 'active' } },
  },
  {
    id: 'repo-terraform',
    parentId: 'grp-ado',
    position: { x: 40, y: 210 },
    type: 'topology',
    data: { resource: { name: 'terraform-nexus', type: 'box', details: 'Infra repo | pipeline terraform dev/teste', status: 'active' } },
  },
  {
    id: 'repo-templates',
    parentId: 'grp-ado',
    position: { x: 250, y: 210 },
    type: 'topology',
    data: { resource: { name: 'azure-pipelines-templates', type: 'box', details: 'Templates compartilhados de deploy', status: 'active' } },
  },
  {
    id: 'repo-mfe-shell',
    parentId: 'grp-ado',
    position: { x: 40, y: 360 },
    type: 'topology',
    data: { resource: { name: 'mfe-shell', type: 'box', details: 'Repo MFE shell', status: 'active' } },
  },
  {
    id: 'repo-mfe-auth',
    parentId: 'grp-ado',
    position: { x: 250, y: 360 },
    type: 'topology',
    data: { resource: { name: 'mfe-auth', type: 'box', details: 'Repo MFE auth', status: 'active' } },
  },
  {
    id: 'repo-mfe-user',
    parentId: 'grp-ado',
    position: { x: 40, y: 510 },
    type: 'topology',
    data: { resource: { name: 'mfe-user', type: 'box', details: 'Repo MFE user', status: 'active' } },
  },
  {
    id: 'repo-mfe-person',
    parentId: 'grp-ado',
    position: { x: 250, y: 510 },
    type: 'topology',
    data: { resource: { name: 'mfe-person', type: 'box', details: 'Repo MFE person', status: 'active' } },
  },
  {
    id: 'repo-mfe-formalization',
    parentId: 'grp-ado',
    position: { x: 40, y: 660 },
    type: 'topology',
    data: { resource: { name: 'mfe-formalization', type: 'box', details: 'Repo MFE formalization', status: 'active' } },
  },
  {
    id: 'repo-mfe-poc',
    parentId: 'grp-ado',
    position: { x: 250, y: 660 },
    type: 'topology',
    data: { resource: { name: 'mfe-poc', type: 'box', details: 'Repo MFE poc', status: 'active' } },
  },
  {
    id: 'repo-ms-auth-external',
    parentId: 'grp-ado',
    position: { x: 40, y: 810 },
    type: 'topology',
    data: { resource: { name: 'ms-auth-external', type: 'box', details: 'Repo MS auth external', status: 'active' } },
  },
  {
    id: 'repo-ms-auth-sso',
    parentId: 'grp-ado',
    position: { x: 250, y: 810 },
    type: 'topology',
    data: { resource: { name: 'ms-auth-sso', type: 'box', details: 'Repo MS auth sso', status: 'active' } },
  },
  {
    id: 'repo-ms-parameters',
    parentId: 'grp-ado',
    position: { x: 40, y: 960 },
    type: 'topology',
    data: { resource: { name: 'ms-parameters', type: 'box', details: 'Repo MS parameters', status: 'active' } },
  },
  {
    id: 'repo-ms-person',
    parentId: 'grp-ado',
    position: { x: 250, y: 960 },
    type: 'topology',
    data: { resource: { name: 'ms-person', type: 'box', details: 'Repo MS person', status: 'active' } },
  },
  {
    id: 'repo-ms-poc',
    parentId: 'grp-ado',
    position: { x: 40, y: 1110 },
    type: 'topology',
    data: { resource: { name: 'ms-poc', type: 'box', details: 'Repo MS poc', status: 'active' } },
  },
  {
    id: 'repo-ms-user',
    parentId: 'grp-ado',
    position: { x: 250, y: 1110 },
    type: 'topology',
    data: { resource: { name: 'ms-user', type: 'box', details: 'Repo MS user', status: 'active' } },
  },
  {
    id: 'repo-ms-barramento',
    parentId: 'grp-ado',
    position: { x: 40, y: 1260 },
    type: 'topology',
    data: { resource: { name: 'ms-barramento', type: 'box', details: 'Repo MS barramento', status: 'active' } },
  },
  {
    id: 'repo-topology',
    parentId: 'grp-ado',
    position: { x: 250, y: 1260 },
    type: 'topology',
    data: { resource: { name: 'oci-nexus-topology', type: 'box', details: 'Repo do diagrama operacional', status: 'active' } },
  },

  {
    id: 'fortigate',
    parentId: 'grp-shared',
    position: { x: 100, y: 60 },
    type: 'topology',
    data: { resource: { name: 'FortiGate', type: 'gateway', details: '129.148.17.8 | borda compartilhada', status: 'active' } },
  },
  {
    id: 'lb-crivo-dev',
    parentId: 'grp-shared',
    position: { x: 100, y: 220 },
    type: 'topology',
    data: { resource: { name: 'Test_Crivo_Dev', type: 'loadbalancer', details: '10.8.4.127 | PRIVATE | host routing para MFE/MS', status: 'active' } },
  },
  {
    id: 'drg',
    parentId: 'grp-shared',
    position: { x: 100, y: 380 },
    type: 'topology',
    data: { resource: { name: 'DRG-Invista-Shared', type: 'gateway', details: 'Hub de roteamento entre VCNs', status: 'manual' } },
  },

  {
    id: 'vcn-oke',
    parentId: 'grp-oke-dev',
    position: { x: 120, y: 45 },
    type: 'topology',
    data: { resource: { name: 'VCN vcn-oke', type: 'vcn', details: '10.110.0.0/16 | Terraform', status: 'active' } },
  },

  {
    id: 'vcn-dev',
    parentId: 'grp-dev-inv',
    position: { x: 950, y: 70 },
    type: 'topology',
    data: { resource: { name: 'VCN-DEV', type: 'vcn', details: '10.6.0.0/16 | rede compartilhada manual', status: 'manual' } },
  },
  {
    id: 'apigw-dev',
    parentId: 'grp-dev-inv',
    position: { x: 950, y: 280 },
    type: 'topology',
    data: { resource: { name: 'api-gateway-dev', type: 'apigateway', details: 'PRIVATE | cmp-dev-inv | deploy-mfe-unified-dev | rotas MFE + MS', status: 'active' } },
  },
  {
    id: 'apigw-nexus',
    parentId: 'grp-dev-inv',
    position: { x: 950, y: 520 },
    type: 'topology',
    data: { resource: { name: 'api-gateway-nexus-dev', type: 'apigateway', details: 'DELETED em 2026-03-14 | mantido apenas como legado visual', status: 'inactive' } },
  },

  {
    id: 'cls-nexus',
    parentId: 'grp-nexus',
    position: { x: 60, y: 90 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-nexus', type: 'cluster', details: 'v1.34.1 | 3 nodes | nexus-services', status: 'active' } },
  },
  {
    id: 'cls-obs',
    parentId: 'grp-nexus',
    position: { x: 320, y: 90 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-observabilidade', type: 'cluster', details: 'v1.34.1 | 3 nodes | observabilidade', status: 'active' } },
  },
  {
    id: 'lb-public-nexus',
    parentId: 'grp-nexus',
    position: { x: 580, y: 90 },
    type: 'topology',
    data: { resource: { name: 'LB Publico nexus', type: 'loadbalancer', details: '137.131.236.202 | ingress publico do cls-dev-nexus', status: 'active' } },
  },
  {
    id: 'lb-nexus-int',
    parentId: 'grp-nexus',
    position: { x: 60, y: 320 },
    type: 'topology',
    data: { resource: { name: 'LB nexus internal', type: 'loadbalancer', details: '10.110.143.54 | nginx-internal | ms core', status: 'active' } },
  },
  {
    id: 'lb-observ-node',
    parentId: 'grp-nexus',
    position: { x: 320, y: 320 },
    type: 'topology',
    data: { resource: { name: 'LB observabilidade', type: 'loadbalancer', details: '10.110.136.228 | trafego interno observabilidade', status: 'active' } },
  },
  {
    id: 'db-atp',
    parentId: 'grp-nexus',
    position: { x: 60, y: 550 },
    type: 'topology',
    data: { resource: { name: 'NEXUS_DEV (AJD)', type: 'database', details: 'Autonomous JSON DB | serverless', status: 'active' } },
  },
  {
    id: 'db-pg-nexus',
    parentId: 'grp-nexus',
    position: { x: 320, y: 550 },
    type: 'topology',
    data: { resource: { name: 'NEXUS_DEV (PostgreSQL)', type: 'database', details: 'Banco relacional dos MS nexus', status: 'active' } },
  },
  {
    id: 'db-redis',
    parentId: 'grp-nexus',
    position: { x: 580, y: 550 },
    type: 'topology',
    data: { resource: { name: 'NEXUS_DEV (Redis)', type: 'database', details: 'Cache e sessoes', status: 'active' } },
  },

  {
    id: 'cls-barramento',
    parentId: 'grp-barramento',
    position: { x: 40, y: 70 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-barramento', type: 'cluster', details: 'v1.34.1 | 3 nodes | integration-hub', status: 'active' } },
  },
  {
    id: 'lb-barramento-node',
    parentId: 'grp-barramento',
    position: { x: 270, y: 70 },
    type: 'topology',
    data: { resource: { name: 'LB barramento', type: 'loadbalancer', details: '10.110.139.53 | nginx-internal | ms-barramento', status: 'active' } },
  },
  {
    id: 'db-pg-barramento',
    parentId: 'grp-barramento',
    position: { x: 500, y: 70 },
    type: 'topology',
    data: { resource: { name: 'BARRAMENTO_DEV (PostgreSQL)', type: 'database', details: 'Banco relacional do barramento', status: 'active' } },
  },

  {
    id: 'bucket-shell',
    parentId: 'grp-buckets',
    position: { x: 60, y: 80 },
    type: 'topology',
    data: { resource: { name: 'mfe-shell-dev', type: 'bucket', details: '/mfe-shell/', status: 'active' } },
  },
  {
    id: 'bucket-auth',
    parentId: 'grp-buckets',
    position: { x: 410, y: 80 },
    type: 'topology',
    data: { resource: { name: 'mfe-auth-dev', type: 'bucket', details: '/mfe-auth/', status: 'active' } },
  },
  {
    id: 'bucket-user',
    parentId: 'grp-buckets',
    position: { x: 760, y: 80 },
    type: 'topology',
    data: { resource: { name: 'mfe-user-dev', type: 'bucket', details: '/mfe-user/', status: 'active' } },
  },
  {
    id: 'bucket-person',
    parentId: 'grp-buckets',
    position: { x: 60, y: 240 },
    type: 'topology',
    data: { resource: { name: 'mfe-person-dev', type: 'bucket', details: '/mfe-person/', status: 'active' } },
  },
  {
    id: 'bucket-poc',
    parentId: 'grp-buckets',
    position: { x: 410, y: 240 },
    type: 'topology',
    data: { resource: { name: 'mfe-poc-dev', type: 'bucket', details: '/mfe-poc/', status: 'active' } },
  },
  {
    id: 'bucket-formalization',
    parentId: 'grp-buckets',
    position: { x: 760, y: 240 },
    type: 'topology',
    data: { resource: { name: 'mfe-formalization-dev', type: 'bucket', details: '/mfe-formalization/', status: 'active' } },
  },

  {
    id: 'idomain-nexus',
    parentId: 'grp-iam-nexus',
    position: { x: 60, y: 70 },
    type: 'topology',
    data: { resource: { name: 'Identity Domain Nexus', type: 'shieldcheck', details: 'Auth confidencial do app Nexus', status: 'active' } },
  },
  {
    id: 'vault-nexus-node',
    parentId: 'grp-iam-nexus',
    position: { x: 410, y: 70 },
    type: 'topology',
    data: { resource: { name: 'Vault nexus-api-dev', type: 'shieldcheck', details: 'KMS + secrets | key-nexus-dev', status: 'active' } },
  },
  {
    id: 'sa-tf-admin',
    parentId: 'grp-iam-nexus',
    position: { x: 760, y: 70 },
    type: 'topology',
    data: { resource: { name: 'svc-terraform', type: 'box', details: 'Service account usado pelas pipelines', status: 'active' } },
  },
];

const repoIds = [
  'repo-terraform',
  'repo-templates',
  'repo-mfe-shell',
  'repo-mfe-auth',
  'repo-mfe-user',
  'repo-mfe-person',
  'repo-mfe-formalization',
  'repo-mfe-poc',
  'repo-ms-auth-external',
  'repo-ms-auth-sso',
  'repo-ms-parameters',
  'repo-ms-person',
  'repo-ms-poc',
  'repo-ms-user',
  'repo-ms-barramento',
  'repo-topology',
];

const repoEdges: Edge[] = repoIds.map((id) => ({
  id: `e-${id}-ado`,
  source: id,
  target: 'ado-platform',
  type: 'bezier',
  style: { stroke: '#38bdf8', strokeDasharray: '5 4' },
}));

const initialEdges: Edge[] = [
  { id: 'e-int-cf', source: 'internet', target: 'cloudflare', animated: true, type: 'bezier', style: { stroke: '#e4e4e7' } },
  { id: 'e-cf-fortigate', source: 'cloudflare', target: 'fortigate', label: 'proxy + hostnames', animated: true, type: 'bezier' },
  { id: 'e-fortigate-lb', source: 'fortigate', target: 'lb-crivo-dev', type: 'bezier', animated: true },
  { id: 'e-lb-apigwdev', source: 'lb-crivo-dev', target: 'apigw-dev', label: 'VIP 10.6.0.181:443', type: 'bezier', animated: true },

  { id: 'e-drg-vcnoke', source: 'drg', target: 'vcn-oke', label: 'ATT-VCN-OKE-DEV', type: 'bezier' },
  { id: 'e-drg-vcndev', source: 'drg', target: 'vcn-dev', label: 'ATT-VCN-DEV', type: 'bezier' },
  { id: 'e-vcndev-apigwdev', source: 'vcn-dev', target: 'apigw-dev', label: 'SBNT-DEV', type: 'bezier' },

  { id: 'e-apigwdev-shell', source: 'apigw-dev', target: 'bucket-shell', label: '/mfe-shell/', type: 'bezier' },
  { id: 'e-apigwdev-auth', source: 'apigw-dev', target: 'bucket-auth', label: '/mfe-auth/', type: 'bezier' },
  { id: 'e-apigwdev-user', source: 'apigw-dev', target: 'bucket-user', label: '/mfe-user/', type: 'bezier' },
  { id: 'e-apigwdev-person', source: 'apigw-dev', target: 'bucket-person', label: '/mfe-person/', type: 'bezier' },
  { id: 'e-apigwdev-poc', source: 'apigw-dev', target: 'bucket-poc', label: '/mfe-poc/', type: 'bezier' },
  { id: 'e-apigwdev-formalization', source: 'apigw-dev', target: 'bucket-formalization', label: '/mfe-formalization/', type: 'bezier' },
  { id: 'e-apigwdev-nexusint', source: 'apigw-dev', target: 'lb-nexus-int', label: '/ms-* core', type: 'bezier', animated: true, style: { stroke: '#f97316' } },
  { id: 'e-apigwdev-barramento', source: 'apigw-dev', target: 'lb-barramento-node', label: '/ms-barramento', type: 'bezier', animated: true, style: { stroke: '#22c55e' } },

  { id: 'e-lbpub-clsnexus', source: 'lb-public-nexus', target: 'cls-nexus', label: 'NodePort ingress', type: 'bezier', animated: true, style: { stroke: '#f59e0b' } },
  { id: 'e-vcnoke-clsnexus', source: 'vcn-oke', target: 'cls-nexus', type: 'bezier' },
  { id: 'e-vcnoke-clsobs', source: 'vcn-oke', target: 'cls-obs', type: 'bezier' },
  { id: 'e-vcnoke-clsbarr', source: 'vcn-oke', target: 'cls-barramento', type: 'bezier' },
  { id: 'e-lbnexus-clsnexus', source: 'lb-nexus-int', target: 'cls-nexus', label: 'nexus-services', type: 'bezier', style: { stroke: '#f97316' } },
  { id: 'e-lbobs-clsobs', source: 'lb-observ-node', target: 'cls-obs', label: 'observabilidade', type: 'bezier', style: { stroke: '#6366f1' } },
  { id: 'e-lbbarr-clsbarr', source: 'lb-barramento-node', target: 'cls-barramento', label: 'integration-hub', type: 'bezier', style: { stroke: '#22c55e' } },

  { id: 'e-clsnexus-dbatp', source: 'cls-nexus', target: 'db-atp', label: 'AJD', type: 'bezier', style: { stroke: '#84cc16' } },
  { id: 'e-clsnexus-dbpg', source: 'cls-nexus', target: 'db-pg-nexus', label: 'PostgreSQL', type: 'bezier', style: { stroke: '#84cc16' } },
  { id: 'e-clsnexus-dbredis', source: 'cls-nexus', target: 'db-redis', label: 'Redis', type: 'bezier', style: { stroke: '#84cc16' } },
  { id: 'e-clsbarr-dbpg', source: 'cls-barramento', target: 'db-pg-barramento', label: 'PostgreSQL', type: 'bezier', style: { stroke: '#84cc16' } },

  { id: 'e-ado-infra', source: 'ado-platform', target: 'apigw-dev', label: 'infra + post-apply', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-buckets', source: 'ado-platform', target: 'bucket-shell', label: 'publish MFEs', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-nexus', source: 'ado-platform', target: 'cls-nexus', label: 'deploy ms nexus', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-barramento', source: 'ado-platform', target: 'cls-barramento', label: 'deploy barramento', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-obs', source: 'ado-platform', target: 'cls-obs', label: 'deploy observabilidade', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-sa', source: 'ado-platform', target: 'sa-tf-admin', label: 'service connection', type: 'bezier', style: { stroke: '#38bdf8' } },

  { id: 'e-sa-vault', source: 'sa-tf-admin', target: 'vault-nexus-node', label: 'vault secrets', type: 'bezier', style: { stroke: '#38bdf8', strokeDasharray: '4 3' } },
  { id: 'e-domain-clsnexus', source: 'idomain-nexus', target: 'cls-nexus', label: 'app auth', type: 'bezier', style: { stroke: '#f97316', strokeDasharray: '4 3' } },
  ...repoEdges,
];

export function NexusDiagram() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'bezier' }, eds)),
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
        fitViewOptions={{ padding: 0.14 }}
        defaultEdgeOptions={{
          type: 'bezier',
          style: { stroke: '#71717a', strokeWidth: 1.6 },
          labelStyle: { fill: '#e4e4e7', fontSize: 10, fontWeight: 700 },
          labelBgStyle: { fill: 'rgba(9, 9, 11, 0.92)', fillOpacity: 1 },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 6,
        }}
      >
        <Panel position="top-left" className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white m-4 shadow-2xl max-w-[520px]">
          <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            NEXUS TOPOLOGY
          </h1>
          <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">DEV atualizado em 2026-03-14</p>

          <div className="mt-4 flex gap-2 flex-wrap">
            <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] font-bold border border-green-500/30">Clusters ativos</div>
            <div className="px-2 py-1 bg-sky-500/20 text-sky-400 rounded text-[10px] font-bold border border-sky-500/30">Repos separados</div>
            <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-[10px] font-bold border border-purple-500/30">Gateway unificado</div>
            <div className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-[10px] font-bold border border-teal-500/30">Buckets MFE</div>
            <div className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-[10px] font-bold border border-orange-500/30">Linhas curvas</div>
            <div className="px-2 py-1 bg-zinc-500/20 text-zinc-400 rounded text-[10px] font-bold border border-zinc-500/30">Legado isolado</div>
          </div>
        </Panel>

        <Panel position="bottom-left" className="bg-zinc-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white m-4 shadow-2xl max-w-[440px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">URLs de acesso - DEV</p>
          <div className="flex flex-col gap-1 font-mono text-[10px]">
            {[
              { label: 'mfe-shell-dev-oci', url: 'https://mfe-shell-dev-oci.invista.com.br', note: 'MFE Shell' },
              { label: 'api-gateway-dev', url: 'https://api-gateway-dev.invista.com.br', note: 'Gateway unificado' },
              { label: 'ms-auth-external', url: 'https://ms-auth-external-dev-oci.invista.com.br', note: 'Auth' },
              { label: 'ms-auth-sso', url: 'https://ms-auth-sso-dev-oci.invista.com.br', note: 'SSO' },
              { label: 'ms-user', url: 'https://ms-user-dev-oci.invista.com.br', note: 'User' },
              { label: 'ms-person', url: 'https://ms-person-dev-oci.invista.com.br', note: 'Person' },
              { label: 'ms-poc', url: 'https://ms-poc-dev-oci.invista.com.br', note: 'PoC' },
              { label: 'ms-belt', url: 'https://ms-belt-dev-oci.invista.com.br', note: 'Belt' },
              { label: 'ms-notify', url: 'https://ms-notify-dev-oci.invista.com.br', note: 'Notify' },
              { label: 'ms-parameters', url: 'https://ms-parameters-dev-oci.invista.com.br', note: 'Params' },
              { label: 'ms-barramento', url: 'https://ms-barramento-dev-oci.invista.com.br', note: 'Barramento' },
            ].map(({ label, url, note }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 group-hover:bg-emerald-300" />
                <span className="text-zinc-300 group-hover:text-white truncate flex-1">{label}</span>
                <span className="text-zinc-600 group-hover:text-zinc-400 shrink-0">{note}</span>
              </a>
            ))}
          </div>
          <p className="text-[9px] text-zinc-600 mt-2 font-mono">gateway: bqdgz22e5... | private | cmp-dev-inv</p>
        </Panel>

        <Panel position="bottom-right" className="bg-zinc-900/80 p-4 rounded-xl border border-white/10 text-[10px] font-mono text-zinc-500 m-4 max-w-[420px]">
          SYSTEM_REPORT_ID: OCI-DEV-NEXUS-2026.03.14-r4 | flow principal simplificado | repos separados | gateway legado isolado | curvas bezier | menos cruzamento visual
        </Panel>

        <Controls className="bg-zinc-800 border-zinc-700 !fill-white" />
        <MiniMap className="bg-zinc-900 border-zinc-800" nodeColor="#3f3f46" maskColor="rgba(0, 0, 0, 0.7)" />
        <Background color="#27272a" gap={24} />
      </ReactFlow>
    </div>
  );
}
