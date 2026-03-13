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

// ─── Grid constants ───────────────────────────────────────────────────────────
// grp-nexus: 3 colunas (c0=50, c1=280, c2=510), espaçamento 230px
// Nós: min-w 180px → spans: 50→230, 280→460, 510→690 | gap ~50px entre colunas
// Linhas: r0=60, r1=210, r2=360, r3=510, r4=660 (ROW_GAP=150px)
// grp-buckets: 3 colunas (c0=60, c1=390, c2=720), 2 linhas (r0=70, r1=210)
// grp-shared: coluna única x=90, linhas: y=60, 210, 360

const initialNodes: Node[] = [
  // ─── GRUPOS ───────────────────────────────────────────────────────────────
  {
    id: 'grp-shared',
    type: 'compartment',
    position: { x: 820, y: 80 },
    style: { width: 360, height: 470, backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '2px dashed #3b82f6', borderRadius: '12px', overflow: 'hidden' },
    data: { label: 'cmp-shared-inv', color: '#3b82f6' },
  },
  {
    id: 'grp-barramento',
    type: 'compartment',
    position: { x: 820, y: 620 },
    style: { width: 360, height: 200, backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '2px dashed #22c55e', borderRadius: '12px', overflow: 'hidden' },
    data: { label: 'cmp-dev-barramento', color: '#22c55e' },
  },
  {
    id: 'grp-oke-dev',
    type: 'compartment',
    position: { x: 50, y: 50 },
    style: { width: 340, height: 145, backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '2px dashed #eab308', borderRadius: '12px', overflow: 'hidden' },
    data: { label: 'Compartment: OKE > DEV', color: '#eab308' },
  },
  {
    id: 'grp-dev-inv',
    type: 'compartment',
    position: { x: 50, y: 220 },
    style: { width: 1090, height: 1550, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '2px dashed #a855f7', borderRadius: '12px', overflow: 'visible' },
    data: { label: 'Compartment: cmp-dev-inv', color: '#a855f7' },
  },
  {
    // grp-buckets: 2 linhas × 3 colunas | col-gap=330px | row-gap=140px | padding=60px
    id: 'grp-buckets',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 30, y: 1130 },
    style: { width: 980, height: 360, backgroundColor: 'rgba(20, 184, 166, 0.05)', border: '2px dashed #14b8a6', borderRadius: '12px', overflow: 'hidden' },
    data: { label: 'OCI Object Storage — MFE Assets (cmp-dev-nexus)', color: '#14b8a6' },
  },
  {
    // grp-nexus: 3 colunas × 5 linhas | col-gap=230px | row-gap=150px | padding=50px
    id: 'grp-nexus',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 30, y: 150 },
    style: { width: 760, height: 970, backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '2px dashed #ef4444', borderRadius: '12px', overflow: 'visible' },
    data: { label: 'Sub-Compartment: cmp-dev-nexus', color: '#ef4444' },
  },
  {
    // grp-iam-nexus: 2 colunas × 2 linhas | col-gap=330px | row-gap=140px
    id: 'grp-iam-nexus',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 30, y: 1510 },
    style: { width: 980, height: 360, backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '2px dashed #38bdf8', borderRadius: '12px', overflow: 'hidden' },
    data: { label: 'IAM & Security — cmp-dev-nexus (Vault / App Auth)', color: '#38bdf8' },
  },

  // ─── EXTERNOS ─────────────────────────────────────────────────────────────

  // Coluna única x=90 | linhas: y=60, y=200, y=340, y=480
  {
    id: 'grp-iam-root',
    type: 'compartment',
    position: { x: 1220, y: 80 },
    style: { width: 360, height: 560, backgroundColor: 'rgba(249, 115, 22, 0.05)', border: '2px dashed #f97316', borderRadius: '12px', overflow: 'hidden' },
    data: { label: 'IAM — Tenancy Root (SSO / Federation)', color: '#f97316' },
  },
  {
    id: 'azure-ad',
    parentId: 'grp-iam-root',
    position: { x: 90, y: 60 },
    type: 'topology',
    data: { resource: { name: 'Azure Active Directory', type: 'shieldcheck', details: '[externo] IdP SAML2 | SSO corporativo para console OCI', status: 'active' } },
  },
  {
    id: 'idomain-default',
    parentId: 'grp-iam-root',
    position: { x: 90, y: 200 },
    type: 'topology',
    data: { resource: { name: 'Domain Default', type: 'shieldcheck', details: '[root tenancy] SAML2 + JIT Provisioning | idcs-6d98b1a3...', status: 'active' } },
  },
  {
    id: 'oke-groups',
    parentId: 'grp-iam-root',
    position: { x: 90, y: 340 },
    type: 'topology',
    data: { resource: { name: 'Grupos OKE', type: 'box', details: '[root tenancy] invista-oke-admin (manage) | invista-oke-dev (use) | invista-oke-readonly (read) — todos os clusters', status: 'active' } },
  },
  {
    id: 'svc-nexus-deploy',
    parentId: 'grp-iam-root',
    position: { x: 90, y: 480 },
    type: 'topology',
    data: { resource: { name: 'user_azurenexus_dev', type: 'box', details: '[root tenancy] Service Account — Azure Pipelines DEV | chave API OCI', status: 'active' } },
  },

  // ─── EXTERNOS ─────────────────────────────────────────────────────────────
  {
    id: 'internet',
    position: { x: 230, y: -230 },
    type: 'topology',
    data: { resource: { name: 'Internet', type: 'gateway', details: 'Public Traffic', status: 'active' } },
  },
  {
    id: 'cloudflare',
    position: { x: 230, y: -100 },
    type: 'topology',
    data: { resource: { name: 'Cloudflare', type: 'apigateway', details: 'WAF & DNS (*.invista.com.br)', status: 'active' } },
  },
  {
    id: 'azuredevops',
    position: { x: -400, y: 350 },
    type: 'topology',
    data: { resource: { name: 'Azure DevOps', type: 'box', details: 'CN-Squad / Invista FIDC - Nexus | Pipelines: ms-* + MFEs + infra', status: 'active' } },
  },

  // ─── cmp-shared-inv ───────────────────────────────────────────────────────
  // Coluna única x=90 | linhas: y=60, y=210, y=360
  {
    id: 'fortigate',
    parentId: 'grp-shared',
    position: { x: 90, y: 60 },
    type: 'topology',
    data: { resource: { name: 'FortiGate', type: 'gateway', details: '129.148.17.8 | SBNT-PUBLIC-SHARED', status: 'active' } },
  },
  {
    id: 'lb-crivo-dev',
    parentId: 'grp-shared',
    position: { x: 90, y: 210 },
    type: 'topology',
    data: { resource: { name: 'Test_Crivo_Dev (LB)', type: 'loadbalancer', details: '10.8.4.127 | PRIVATE | routing: mfe-shell-dev-oci + api-gateway-dev + ms-* → 10.6.0.181', status: 'active' } },
  },
  {
    id: 'drg',
    parentId: 'grp-shared',
    position: { x: 90, y: 360 },
    type: 'topology',
    data: { resource: { name: 'DRG-Invista-Shared', type: 'gateway', details: 'Central Routing Hub', status: 'manual' } },
  },

  // ─── OKE > DEV ────────────────────────────────────────────────────────────
  {
    id: 'vcn-oke',
    parentId: 'grp-oke-dev',
    position: { x: 80, y: 35 },
    type: 'topology',
    data: { resource: { name: 'VCN vcn-oke', type: 'vcn', details: '10.110.0.0/16 (Terraform)', status: 'active' } },
  },

  // ─── grp-buckets: linha 0 (y=70) cols x=60,390,720 ───────────────────────
  {
    id: 'bucket-shell',
    parentId: 'grp-buckets',
    position: { x: 60, y: 70 },
    type: 'topology',
    data: { resource: { name: 'mfe-shell-dev', type: 'bucket', details: '/mfe-shell/', status: 'active' } },
  },
  {
    id: 'bucket-auth',
    parentId: 'grp-buckets',
    position: { x: 390, y: 70 },
    type: 'topology',
    data: { resource: { name: 'mfe-auth-dev', type: 'bucket', details: '/mfe-auth/', status: 'active' } },
  },
  {
    id: 'bucket-user',
    parentId: 'grp-buckets',
    position: { x: 720, y: 70 },
    type: 'topology',
    data: { resource: { name: 'mfe-user-dev', type: 'bucket', details: '/mfe-user/', status: 'active' } },
  },
  // ─── grp-buckets: linha 1 (y=210) ────────────────────────────────────────
  {
    id: 'bucket-person',
    parentId: 'grp-buckets',
    position: { x: 60, y: 210 },
    type: 'topology',
    data: { resource: { name: 'mfe-person-dev', type: 'bucket', details: '/mfe-person/', status: 'active' } },
  },
  {
    id: 'bucket-poc',
    parentId: 'grp-buckets',
    position: { x: 390, y: 210 },
    type: 'topology',
    data: { resource: { name: 'mfe-poc-dev', type: 'bucket', details: '/mfe-poc/', status: 'active' } },
  },
  {
    id: 'bucket-formalization',
    parentId: 'grp-buckets',
    position: { x: 720, y: 210 },
    type: 'topology',
    data: { resource: { name: 'mfe-form-dev', type: 'bucket', details: '/mfe-formalization/', status: 'active' } },
  },

  // ─── cmp-dev-inv (diretos, fora dos sub-grupos) ───────────────────────────
  {
    id: 'vcn-dev',
    parentId: 'grp-dev-inv',
    position: { x: 840, y: 60 },
    type: 'topology',
    data: { resource: { name: 'VCN-DEV', type: 'vcn', details: '10.6.0.0/16 (Shared/Manual)', status: 'manual' } },
  },
  {
    id: 'apigw-dev',
    parentId: 'grp-dev-inv',
    position: { x: 840, y: 280 },
    type: 'topology',
    data: { resource: { name: 'api-gateway-dev', type: 'apigateway', details: 'bqdgz22e5haqac4vdb54isxrqm | PRIVATE | SBNT-DEV (10.6.0.0/24) | cmp-dev-inv | 1 deployment: deploy-mfe-unified-dev (/) → 6 MFE buckets Object Storage', status: 'active' } },
  },

  // ─── cmp-dev-nexus (grp-nexus) ────────────────────────────────────────────
  // Grid: c0=50 | c1=280 | c2=510  ·  r0=60 | r1=210 | r2=360 | r3=510 | r4=660
  // Spans: c0→230px, c1→460px, c2→690px | gaps ≥50px entre colunas
  {
    // r0 — centrado em c1 (280) — ACTIVE: gateway unificado MFEs + ms-*
    id: 'apigw-nexus',
    parentId: 'grp-nexus',
    position: { x: 280, y: 60 },
    type: 'topology',
    data: { resource: { name: 'api-gateway-nexus-dev', type: 'apigateway', details: 'dnqe6ufrommkqxtfp7k2ehrbmu | PRIVATE | SBNT-DEV (10.6.0.0/24) | 11 rotas: /mfe-shell + /api/auth,user,person,poc,sso,role,cache,commercial-manager,user-ext,user-int | MANUAL', status: 'active' } },
  },
  {
    // r1 — c0
    id: 'cls-nexus',
    parentId: 'grp-nexus',
    position: { x: 50, y: 210 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-nexus', type: 'cluster', details: 'v1.34.1 | 3 Nodes | nexus-services | ArgoCD: 10.110.130.171', status: 'active' } },
  },
  {
    id: 'cls-barramento',
    parentId: 'grp-barramento',
    position: { x: 90, y: 70 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-barramento', type: 'cluster', details: 'v1.34.1 | 3 Nodes | integration-hub | Movido 2026-03-13', status: 'active' } },
  },
  {
    // r2 — c1 (centrado)
    id: 'cls-obs',
    parentId: 'grp-nexus',
    position: { x: 280, y: 360 },
    type: 'topology',
    data: { resource: { name: 'cls-dev-observabilidade', type: 'cluster', details: 'v1.34.1 | 3 Nodes | monitoring | ArgoCD: 10.110.139.53', status: 'active' } },
  },
  {
    // r3 — c0 (abaixo de cls-nexus)
    id: 'lb-nexus-int',
    parentId: 'grp-nexus',
    position: { x: 50, y: 510 },
    type: 'topology',
    data: { resource: { name: 'LB nexus (nginx-int)', type: 'loadbalancer', details: '10.110.143.54 | nginx-internal | ms-* services', status: 'active' } },
  },
  {
    // r3 — c1 (abaixo de cls-obs)
    id: 'lb-observ-node',
    parentId: 'grp-nexus',
    position: { x: 280, y: 510 },
    type: 'topology',
    data: { resource: { name: 'LB observ.', type: 'loadbalancer', details: '10.110.136.228 | cls-dev-observabilidade', status: 'active' } },
  },
  {
    // r3 — c2 (abaixo de cls-barramento)
    id: 'lb-barramento-node',
    parentId: 'grp-nexus',
    position: { x: 510, y: 510 },
    type: 'topology',
    data: { resource: { name: 'LB barramento', type: 'loadbalancer', details: '10.110.139.53 | nginx-internal | ms-barramento', status: 'active' } },
  },
  {
    // r3.5 — c2 — LB público (nginx-ingress do cls-dev-nexus via NodePort)
    id: 'lb-public-nexus',
    parentId: 'grp-nexus',
    position: { x: 510, y: 130 },
    type: 'topology',
    data: { resource: { name: 'LB Público nexus', type: 'loadbalancer', details: '137.131.236.202 | PUBLIC | OKE-created (nginx-ingress) | NodePort 32283 (HTTPS) / 30236 (HTTP) → cls-dev-nexus', status: 'active' } },
  },
  {
    // r4 — c0 — Autonomous JSON DB
    id: 'db-atp',
    parentId: 'grp-nexus',
    position: { x: 50, y: 660 },
    type: 'topology',
    data: { resource: { name: 'NEXUS_DEV (AJD)', type: 'database', details: 'Autonomous JSON DB | AVAILABLE | serverless | db-name: nexusdbdev', status: 'active' } },
  },
  {
    // r4 — c1 — PostgreSQL ms-nexus
    id: 'db-pg-nexus',
    parentId: 'grp-nexus',
    position: { x: 280, y: 660 },
    type: 'topology',
    data: { resource: { name: 'NEXUS_DEV (PostgreSQL)', type: 'database', details: 'PostgreSQL | ACTIVE | banco relacional ms-nexus | MANUAL', status: 'active' } },
  },
  {
    // r4 — c2 — PostgreSQL ms-barramento
    id: 'db-pg-barramento',
    parentId: 'grp-nexus',
    position: { x: 510, y: 660 },
    type: 'topology',
    data: { resource: { name: 'BARRAMENTO_DEV (PostgreSQL)', type: 'database', details: 'PostgreSQL | ACTIVE | banco relacional ms-barramento | MANUAL', status: 'active' } },
  },
  {
    // r5 — c1 centrado — Redis
    id: 'db-redis',
    parentId: 'grp-nexus',
    position: { x: 280, y: 810 },
    type: 'topology',
    data: { resource: { name: 'NEXUS_DEV (Redis)', type: 'database', details: 'OCI Cache (Redis) | ACTIVE | sessoes e cache | MANUAL', status: 'active' } },
  },

  // ─── grp-iam-nexus: linha 0 (y=70) cols x=60,390,720 ──────────────────
  {
    id: 'idomain-nexus',
    parentId: 'grp-iam-nexus',
    position: { x: 60, y: 70 },
    type: 'topology',
    data: { resource: { name: 'Identity Domain (Nexus)', type: 'shieldcheck', details: '[cmp-dev-nexus] App Auth (Confidential) | Usuarios: vinicius, userteste', status: 'active' } },
  },
  {
    id: 'vault-nexus-node',
    parentId: 'grp-iam-nexus',
    position: { x: 390, y: 70 },
    type: 'topology',
    data: { resource: { name: 'Vault (nexus-api-dev)', type: 'shieldcheck', details: '[cmp-dev-nexus] KMS | key-nexus-dev | manage secrets/bundles', status: 'active' } },
  },
  {
    id: 'sa-tf-admin',
    parentId: 'grp-iam-nexus',
    position: { x: 720, y: 70 },
    type: 'topology',
    data: { resource: { name: 'svc-terraform', type: 'box', details: '[root tenancy] IAM Service Account | manage all-resources in tenancy | Admin Policy', status: 'active' } },
  },
];

const initialEdges: Edge[] = [
  // Internet → Cloudflare
  { id: 'e-int-cf', source: 'internet', target: 'cloudflare', animated: true, type: 'smoothstep', style: { stroke: '#fff' } },

  // Cloudflare → FortiGate → Test_Crivo_Dev (routing por Host header) → api-gateway-dev
  // mfe-shell-dev-oci + api-gateway-dev + ms-* (CNAME proxied → bqdgz22e5...)
  { id: 'e-cf-fortigate', source: 'cloudflare', target: 'fortigate', label: 'CNAME proxied (mfe/ms-*)', animated: true, type: 'smoothstep' },
  { id: 'e-fortigate-lb', source: 'fortigate', target: 'lb-crivo-dev', animated: true, type: 'smoothstep' },
  { id: 'e-lb-apigwdev', source: 'lb-crivo-dev', target: 'apigw-dev', label: 'crivo_routes → 10.6.0.181:443', animated: true, type: 'smoothstep' },

  // LB público → cls-dev-nexus (nginx-ingress NodePort 32283/30236)
  { id: 'e-lbpub-clsnexus', source: 'lb-public-nexus', target: 'cls-nexus', label: 'NodePort 32283/30236 (nginx-ingress)', animated: true, type: 'smoothstep', style: { stroke: '#f59e0b' } },

  // api-gateway-nexus-dev → bucket-shell (deployment /mfe-shell)
  { id: 'e-apigwnexus-shell', source: 'apigw-nexus', target: 'bucket-shell', label: '/mfe-shell', type: 'smoothstep', style: { stroke: '#f97316', strokeDasharray: '4 2' } },

  // api-gateway-dev → 6 MFE buckets (deploy-mfe-unified-dev)
  // smoothstep evita sobreposição de linhas paralelas
  { id: 'e-apigwdev-shell', source: 'apigw-dev', target: 'bucket-shell', label: '/mfe-shell/', type: 'smoothstep' },
  { id: 'e-apigwdev-auth', source: 'apigw-dev', target: 'bucket-auth', label: '/mfe-auth/', type: 'smoothstep' },
  { id: 'e-apigwdev-user', source: 'apigw-dev', target: 'bucket-user', label: '/mfe-user/', type: 'smoothstep' },
  { id: 'e-apigwdev-person', source: 'apigw-dev', target: 'bucket-person', label: '/mfe-person/', type: 'smoothstep' },
  { id: 'e-apigwdev-poc', source: 'apigw-dev', target: 'bucket-poc', label: '/mfe-poc/', type: 'smoothstep' },
  { id: 'e-apigwdev-formalization', source: 'apigw-dev', target: 'bucket-formalization', label: '/mfe-formalization/', type: 'smoothstep' },

  // api-gateway-nexus-dev → LBs internos → clusters (ms-* routes — 10 rotas /api/*)
  { id: 'e-apigwnexus-lbnexusint', source: 'apigw-nexus', target: 'lb-nexus-int', label: '/api/* (10 rotas ms-*)', animated: true, type: 'smoothstep', style: { stroke: '#f97316' } },
  { id: 'e-apigwnexus-lbbarr', source: 'apigw-nexus', target: 'lb-barramento-node', label: '/api/commercial-manager', animated: true, type: 'smoothstep', style: { stroke: '#f97316' } },
  { id: 'e-lbnexusint-clsnexus', source: 'lb-nexus-int', target: 'cls-nexus', label: 'nexus-services', type: 'smoothstep', style: { stroke: '#f97316' } },
  { id: 'e-lbbarr-clsbarr', source: 'lb-barramento-node', target: 'cls-barramento', label: 'integration-hub', type: 'smoothstep', style: { stroke: '#f97316' } },
  { id: 'e-lbobserv-clsobs', source: 'lb-observ-node', target: 'cls-obs', label: 'observ.', type: 'smoothstep', style: { stroke: '#6366f1' } },

  // cls-dev-nexus → Databases (AJD + PostgreSQL + Redis)
  { id: 'e-clsnexus-dbatp', source: 'cls-nexus', target: 'db-atp', label: 'AJD', type: 'smoothstep', style: { stroke: '#84cc16' } },
  { id: 'e-clsnexus-dbpg', source: 'cls-nexus', target: 'db-pg-nexus', label: 'PgSQL', type: 'smoothstep', style: { stroke: '#84cc16' } },
  { id: 'e-clsnexus-dbredis', source: 'cls-nexus', target: 'db-redis', label: 'Redis', type: 'smoothstep', style: { stroke: '#84cc16' } },
  // cls-dev-barramento → PostgreSQL barramento
  { id: 'e-clsbarr-dbpgbarr', source: 'cls-barramento', target: 'db-pg-barramento', label: 'PgSQL', type: 'smoothstep', style: { stroke: '#84cc16' } },

  // DRG → VCNs
  { id: 'e-drg-vcnoke', source: 'drg', target: 'vcn-oke', label: 'ATT-VCN-OKE-DEV', type: 'smoothstep' },
  { id: 'e-drg-vcndev', source: 'drg', target: 'vcn-dev', label: 'ATT-VCN-DEV', type: 'smoothstep' },

  // VCN-DEV (SBNT-DEV) → api-gateway-dev (unificado: MFEs + ms-*)
  { id: 'e-vcndev-apigwdev', source: 'vcn-dev', target: 'apigw-dev', label: 'SBNT-DEV', type: 'smoothstep' },

  // VCN OKE → clusters
  { id: 'e-vcnoke-clsnexus', source: 'vcn-oke', target: 'cls-nexus', type: 'smoothstep' },
  { id: 'e-vcnoke-clsbarr', source: 'vcn-oke', target: 'cls-barramento', type: 'smoothstep' },
  { id: 'e-vcnoke-clsobs', source: 'vcn-oke', target: 'cls-obs', type: 'smoothstep' },

  // Azure DevOps CI/CD → clusters
  { id: 'e-ado-clsnexus', source: 'azuredevops', target: 'cls-nexus', label: 'deploy ms-*', animated: true, type: 'smoothstep', style: { stroke: '#0ea5e9', strokeDasharray: '6 3' } },
  { id: 'e-ado-clsbarr', source: 'azuredevops', target: 'cls-barramento', label: 'deploy ms-barramento', animated: true, type: 'smoothstep', style: { stroke: '#0ea5e9', strokeDasharray: '6 3' } },
  { id: 'e-ado-clsobs', source: 'azuredevops', target: 'cls-obs', label: 'deploy observ.', animated: true, type: 'smoothstep', style: { stroke: '#0ea5e9', strokeDasharray: '6 3' } },
  // Azure DevOps → buckets (upload MFE assets)
  { id: 'e-ado-bucketshell', source: 'azuredevops', target: 'bucket-shell', label: 'upload 6 MFEs', type: 'smoothstep', style: { stroke: '#0ea5e9', strokeDasharray: '6 3' } },

  // IAM — federacao e controle de acesso
  { id: 'e-azad-idomaindefault', source: 'azure-ad', target: 'idomain-default', label: 'SAML2 IdP', animated: true, type: 'smoothstep', style: { stroke: '#f97316' } },
  { id: 'e-idomaindefault-okegroups', source: 'idomain-default', target: 'oke-groups', label: 'SSO → grupos OCI', type: 'smoothstep', style: { stroke: '#f97316' } },
  { id: 'e-okegroups-clsnexus', source: 'oke-groups', target: 'cls-nexus', label: 'RBAC', type: 'smoothstep', style: { stroke: '#f97316', strokeDasharray: '4 2' } },
  { id: 'e-svcnexus-ado', source: 'svc-nexus-deploy', target: 'azuredevops', label: 'API Key', type: 'smoothstep', style: { stroke: '#f97316', strokeDasharray: '4 2' } },
  { id: 'e-idomnexus-clsnexus', source: 'idomain-nexus', target: 'cls-nexus', label: 'Nexus Dev auth', type: 'smoothstep', style: { stroke: '#f97316', strokeDasharray: '4 2' } },
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
            <div className="px-2 py-1 bg-lime-500/20 text-lime-400 rounded text-[10px] font-bold border border-lime-500/30">4 DBs (AJD+PgSQL×2+Redis)</div>
            <div className="px-2 py-1 bg-sky-500/20 text-sky-400 rounded text-[10px] font-bold border border-sky-500/30">Azure DevOps CI/CD</div>
            <div className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-[10px] font-bold border border-orange-500/30">IAM + SAML2 + SSO</div>
          </div>
        </Panel>

        <Panel position="bottom-left" className="bg-zinc-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white m-4 shadow-2xl max-w-[420px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">URLs de Acesso — DEV</p>
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
          <p className="text-[9px] text-zinc-600 mt-2 font-mono">gateway: bqdgz22e5... | SBNT-DEV 10.6.0.181</p>

          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-3 mb-2">ArgoCD — DEV (VPN/Privado)</p>
          <div className="flex flex-col gap-1 font-mono text-[10px]">
            {[
              { cluster: 'cls-dev-nexus', ip: '10.110.130.171', user: 'admin', pass: '-9WqS9LBnutB-LWC' },
              { cluster: 'cls-dev-observabilidade', ip: '10.110.139.53', user: 'admin', pass: 'yUhkPqPB6ipp2Waj' },
            ].map(({ cluster, ip, user, pass }) => (
              <div key={cluster} className="px-2 py-1 rounded bg-white/5 flex flex-col gap-0.5">
                <span className="text-emerald-400 font-bold">{cluster}</span>
                <span className="text-zinc-400">https://{ip} &nbsp; user: <span className="text-white">{user}</span> &nbsp; pass: <span className="text-yellow-300">{pass}</span></span>
              </div>
            ))}
            <div className="px-2 py-1 rounded bg-white/5 flex flex-col gap-0.5">
              <span className="text-zinc-500 font-bold">cls-dev-barramento</span>
              <span className="text-zinc-600">ArgoCD não instalado (cluster recriado 2026-03-13)</span>
            </div>
          </div>
        </Panel>

        <Panel position="bottom-right" className="bg-zinc-900/80 p-4 rounded-xl border border-white/10 text-[10px] font-mono text-zinc-500 m-4">
          SYSTEM_REPORT_ID: OCI-DEV-NEXUS-2026.03.13-r3 | 2-apigw: nexus-dev(11routes/ms+mfe-shell) + dev(mfe-unified) | lb-pub-137.131.236.202→cls-nexus-NodePort | oke-clusters-2-fixed | 4-dbs | ArgoCD: nexus+obs
        </Panel>

        <Controls className="bg-zinc-800 border-zinc-700 !fill-white" />
        <MiniMap className="bg-zinc-900 border-zinc-800" nodeColor="#3f3f46" maskColor="rgba(0, 0, 0, 0.7)" />
        <Background color="#27272a" gap={20} />
      </ReactFlow>
    </div>
  );
}
