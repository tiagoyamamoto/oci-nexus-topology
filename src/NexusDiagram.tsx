import { useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Panel,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TopologyNode } from './TopologyNode';
import { CompartmentNode } from './CompartmentNode';

type ViewMode = 'executive' | 'technical';

const nodeTypes = {
  topology: TopologyNode,
  compartment: CompartmentNode,
};

const initialNodes: Node[] = [
  {
    id: 'grp-ado',
    type: 'compartment',
    position: { x: -760, y: 20 },
    style: { width: 520, height: 1610, backgroundColor: 'rgba(14, 165, 233, 0.05)', border: '2px dashed #0ea5e9', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'Azure DevOps', color: '#0ea5e9' },
  },
  {
    id: 'grp-ado-infra',
    type: 'compartment',
    parentId: 'grp-ado',
    position: { x: 24, y: 120 },
    style: { width: 470, height: 240, backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px dashed #38bdf8', borderRadius: '14px', overflow: 'visible' },
    data: { label: 'Infra / Templates', color: '#38bdf8' },
  },
  {
    id: 'grp-ado-mfe',
    type: 'compartment',
    parentId: 'grp-ado',
    position: { x: 24, y: 390 },
    style: { width: 470, height: 480, backgroundColor: 'rgba(20, 184, 166, 0.05)', border: '1px dashed #14b8a6', borderRadius: '14px', overflow: 'visible' },
    data: { label: 'Repos MFE', color: '#14b8a6' },
  },
  {
    id: 'grp-ado-ms',
    type: 'compartment',
    parentId: 'grp-ado',
    position: { x: 24, y: 900 },
    style: { width: 470, height: 450, backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px dashed #22c55e', borderRadius: '14px', overflow: 'visible' },
    data: { label: 'Repos MS', color: '#22c55e' },
  },
  {
    id: 'grp-ado-vis',
    type: 'compartment',
    parentId: 'grp-ado',
    position: { x: 24, y: 1380 },
    style: { width: 470, height: 140, backgroundColor: 'rgba(244, 114, 182, 0.05)', border: '1px dashed #f472b6', borderRadius: '14px', overflow: 'visible' },
    data: { label: 'Visualizacao', color: '#f472b6' },
  },
  {
    id: 'grp-oke-dev',
    type: 'compartment',
    position: { x: -160, y: 20 },
    style: { width: 430, height: 210, backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '2px dashed #eab308', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'OKE > DEV', color: '#eab308' },
  },
  {
    id: 'grp-dev-inv',
    type: 'compartment',
    position: { x: -210, y: 280 },
    style: { width: 1280, height: 1910, backgroundColor: 'rgba(168, 85, 247, 0.05)', border: '2px dashed #a855f7', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'cmp-dev-inv', color: '#a855f7' },
  },
  {
    id: 'grp-nexus',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 30, y: 150 },
    style: { width: 860, height: 980, backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '2px dashed #ef4444', borderRadius: '16px', overflow: 'visible' },
    data: { label: 'cmp-dev-nexus', color: '#ef4444' },
  },
  {
    id: 'grp-buckets',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 30, y: 1170 },
    style: { width: 1160, height: 420, backgroundColor: 'rgba(20, 184, 166, 0.05)', border: '2px dashed #14b8a6', borderRadius: '16px', overflow: 'visible' },
    data: { label: 'Object Storage / MFE Assets', color: '#14b8a6' },
  },
  {
    id: 'grp-iam-nexus',
    type: 'compartment',
    parentId: 'grp-dev-inv',
    position: { x: 30, y: 1630 },
    style: { width: 1160, height: 220, backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '2px dashed #38bdf8', borderRadius: '16px', overflow: 'visible' },
    data: { label: 'IAM / Vault / App Auth', color: '#38bdf8' },
  },
  {
    id: 'grp-shared',
    type: 'compartment',
    position: { x: 1120, y: 40 },
    style: { width: 430, height: 520, backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '2px dashed #3b82f6', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'cmp-shared-inv', color: '#3b82f6' },
  },
  {
    id: 'grp-barramento',
    type: 'compartment',
    position: { x: 1120, y: 620 },
    style: { width: 720, height: 250, backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '2px dashed #22c55e', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'ms-barramento', color: '#22c55e' },
  },
  {
    id: 'grp-legacy',
    type: 'compartment',
    position: { x: 1120, y: 930 },
    style: { width: 430, height: 220, backgroundColor: 'rgba(113, 113, 122, 0.08)', border: '2px dashed #71717a', borderRadius: '18px', overflow: 'visible' },
    data: { label: 'Legacy / Desativado', color: '#71717a' },
  },

  { id: 'internet', position: { x: 290, y: -250 }, type: 'topology', data: { resource: { name: 'Internet', type: 'gateway', details: 'Entrada publica', status: 'active' } } },
  { id: 'cloudflare', position: { x: 290, y: -90 }, type: 'topology', data: { resource: { name: 'Cloudflare', type: 'apigateway', details: 'DNS + WAF | *.invista.com.br', status: 'active' } } },

  { id: 'ado-platform', parentId: 'grp-ado', position: { x: 140, y: 40 }, type: 'topology', data: { resource: { name: 'Azure DevOps', type: 'box', details: 'Pipelines separadas por repositorio e por dominio', status: 'active' } } },
  { id: 'repo-terraform', parentId: 'grp-ado-infra', position: { x: 20, y: 60 }, type: 'topology', data: { resource: { name: 'terraform-nexus', type: 'box', details: 'Infra repo', status: 'active' } } },
  { id: 'repo-templates', parentId: 'grp-ado-infra', position: { x: 245, y: 60 }, type: 'topology', data: { resource: { name: 'azure-pipelines-templates', type: 'box', details: 'Templates de pipeline', status: 'active' } } },
  { id: 'repo-infra-summary', parentId: 'grp-ado-infra', position: { x: 140, y: 78 }, type: 'topology', data: { resource: { name: 'Repos Infra', shortName: 'INFRA', summary: 'Terraform + templates', type: 'box', details: 'terraform-nexus e azure-pipelines-templates', status: 'active' } } },
  { id: 'repo-shell', parentId: 'grp-ado-mfe', position: { x: 20, y: 60 }, type: 'topology', data: { resource: { name: 'mfe-shell', type: 'box', details: 'Repo shell', status: 'active' } } },
  { id: 'repo-auth', parentId: 'grp-ado-mfe', position: { x: 245, y: 60 }, type: 'topology', data: { resource: { name: 'mfe-auth', type: 'box', details: 'Repo auth', status: 'active' } } },
  { id: 'repo-user', parentId: 'grp-ado-mfe', position: { x: 20, y: 205 }, type: 'topology', data: { resource: { name: 'mfe-user', type: 'box', details: 'Repo user', status: 'active' } } },
  { id: 'repo-person', parentId: 'grp-ado-mfe', position: { x: 245, y: 205 }, type: 'topology', data: { resource: { name: 'mfe-person', type: 'box', details: 'Repo person', status: 'active' } } },
  { id: 'repo-formalization', parentId: 'grp-ado-mfe', position: { x: 20, y: 350 }, type: 'topology', data: { resource: { name: 'mfe-formalization', type: 'box', details: 'Repo formalization', status: 'active' } } },
  { id: 'repo-poc', parentId: 'grp-ado-mfe', position: { x: 245, y: 350 }, type: 'topology', data: { resource: { name: 'mfe-poc', type: 'box', details: 'Repo poc', status: 'active' } } },
  { id: 'repo-mfe-summary', parentId: 'grp-ado-mfe', position: { x: 140, y: 180 }, type: 'topology', data: { resource: { name: 'Repos MFE', shortName: 'MFE', summary: '6 frontends', type: 'box', details: 'shell, auth, user, person, formalization e poc', status: 'active' } } },
  { id: 'repo-ms-auth-external', parentId: 'grp-ado-ms', position: { x: 20, y: 60 }, type: 'topology', data: { resource: { name: 'ms-auth-external', type: 'box', details: 'Repo auth external', status: 'active' } } },
  { id: 'repo-ms-auth-sso', parentId: 'grp-ado-ms', position: { x: 245, y: 60 }, type: 'topology', data: { resource: { name: 'ms-auth-sso', type: 'box', details: 'Repo auth sso', status: 'active' } } },
  { id: 'repo-ms-parameters', parentId: 'grp-ado-ms', position: { x: 20, y: 205 }, type: 'topology', data: { resource: { name: 'ms-parameters', type: 'box', details: 'Repo parameters', status: 'active' } } },
  { id: 'repo-ms-person', parentId: 'grp-ado-ms', position: { x: 245, y: 205 }, type: 'topology', data: { resource: { name: 'ms-person', type: 'box', details: 'Repo person', status: 'active' } } },
  { id: 'repo-ms-poc', parentId: 'grp-ado-ms', position: { x: 20, y: 350 }, type: 'topology', data: { resource: { name: 'ms-poc', type: 'box', details: 'Repo poc', status: 'active' } } },
  { id: 'repo-ms-user', parentId: 'grp-ado-ms', position: { x: 245, y: 350 }, type: 'topology', data: { resource: { name: 'ms-user', type: 'box', details: 'Repo user', status: 'active' } } },
  { id: 'repo-ms-summary', parentId: 'grp-ado-ms', position: { x: 140, y: 165 }, type: 'topology', data: { resource: { name: 'Repos MS', shortName: 'MS', summary: '6 servicos', type: 'box', details: 'auth-external, auth-sso, parameters, person, poc e user', status: 'active' } } },
  { id: 'repo-ms-barramento', parentId: 'grp-ado-vis', position: { x: 20, y: 45 }, type: 'topology', data: { resource: { name: 'ms-barramento', type: 'box', details: 'Repo barramento', status: 'active' } } },
  { id: 'repo-topology', parentId: 'grp-ado-vis', position: { x: 245, y: 45 }, type: 'topology', data: { resource: { name: 'oci-nexus-topology', type: 'box', details: 'Repo do diagrama', status: 'active' } } },
  { id: 'repo-vis-summary', parentId: 'grp-ado-vis', position: { x: 140, y: 18 }, type: 'topology', data: { resource: { name: 'Visualizacao', shortName: 'VIS', summary: 'barramento + diagrama', type: 'box', details: 'ms-barramento e oci-nexus-topology', status: 'active' } } },

  { id: 'vcn-oke', parentId: 'grp-oke-dev', position: { x: 105, y: 48 }, type: 'topology', data: { resource: { name: 'VCN vcn-oke', type: 'vcn', details: '10.110.0.0/16 | Terraform', status: 'active' } } },
  { id: 'fortigate', parentId: 'grp-shared', position: { x: 105, y: 60 }, type: 'topology', data: { resource: { name: 'FortiGate', type: 'gateway', details: '129.148.17.8 | borda compartilhada', status: 'active' } } },
  { id: 'lb-crivo-dev', parentId: 'grp-shared', position: { x: 105, y: 220 }, type: 'topology', data: { resource: { name: 'Test_Crivo_Dev', type: 'loadbalancer', details: '10.8.4.127 | VIP / host routing MFE e MS', status: 'active' } } },
  { id: 'drg', parentId: 'grp-shared', position: { x: 105, y: 380 }, type: 'topology', data: { resource: { name: 'DRG-Invista-Shared', type: 'gateway', details: 'Hub entre VCN-DEV e vcn-oke', status: 'manual' } } },

  { id: 'vcn-dev', parentId: 'grp-dev-inv', position: { x: 950, y: 70 }, type: 'topology', data: { resource: { name: 'VCN-DEV', type: 'vcn', details: '10.6.0.0/16 | rede compartilhada', status: 'manual' } } },
  { id: 'apigw-dev', parentId: 'grp-dev-inv', position: { x: 950, y: 270 }, type: 'topology', data: { resource: { name: 'api-gateway-dev', type: 'apigateway', details: 'PRIVATE | cmp-dev-inv | gateway unificado DEV', status: 'active' } } },
  { id: 'mfe-routes', parentId: 'grp-dev-inv', position: { x: 950, y: 500 }, type: 'topology', data: { resource: { name: 'MFE routes', type: 'box', details: 'deploy-mfe-unified-dev | /mfe-shell /mfe-auth /mfe-user /mfe-person /mfe-poc /mfe-formalization', status: 'active' } } },
  { id: 'ms-routes', parentId: 'grp-dev-inv', position: { x: 950, y: 690 }, type: 'topology', data: { resource: { name: 'MS routes', type: 'box', details: '/ms-auth-external /ms-auth-sso /ms-user /ms-person /ms-poc /ms-parameters /ms-belt /ms-notify /ms-barramento', status: 'active' } } },

  { id: 'cls-nexus', parentId: 'grp-nexus', position: { x: 60, y: 90 }, type: 'topology', data: { resource: { name: 'cls-dev-nexus', type: 'cluster', details: 'v1.34.1 | 3 nodes | nexus-services', status: 'active' } } },
  { id: 'cls-obs', parentId: 'grp-nexus', position: { x: 320, y: 90 }, type: 'topology', data: { resource: { name: 'cls-dev-observabilidade', type: 'cluster', details: 'v1.34.1 | 3 nodes | observabilidade', status: 'active' } } },
  { id: 'lb-public-nexus', parentId: 'grp-nexus', position: { x: 580, y: 90 }, type: 'topology', data: { resource: { name: 'LB Publico nexus', type: 'loadbalancer', details: '137.131.236.202 | ingress publico do cluster', status: 'active' } } },
  { id: 'lb-nexus-int', parentId: 'grp-nexus', position: { x: 60, y: 330 }, type: 'topology', data: { resource: { name: 'LB nexus internal', type: 'loadbalancer', details: '10.110.143.54 | trafego ms core', status: 'active' } } },
  { id: 'lb-observ-node', parentId: 'grp-nexus', position: { x: 320, y: 330 }, type: 'topology', data: { resource: { name: 'LB observabilidade', type: 'loadbalancer', details: '10.110.136.228 | trafego interno observabilidade', status: 'active' } } },
  { id: 'db-atp', parentId: 'grp-nexus', position: { x: 60, y: 570 }, type: 'topology', data: { resource: { name: 'NEXUS_DEV (AJD)', type: 'database', details: 'Autonomous JSON DB', status: 'active' } } },
  { id: 'db-pg-nexus', parentId: 'grp-nexus', position: { x: 320, y: 570 }, type: 'topology', data: { resource: { name: 'NEXUS_DEV (PostgreSQL)', type: 'database', details: 'Banco relacional dos MS nexus', status: 'active' } } },
  { id: 'db-redis', parentId: 'grp-nexus', position: { x: 580, y: 570 }, type: 'topology', data: { resource: { name: 'NEXUS_DEV (Redis)', type: 'database', details: 'Cache e sessoes', status: 'active' } } },
  { id: 'nexus-platform-summary', parentId: 'grp-nexus', position: { x: 170, y: 220 }, type: 'topology', data: { resource: { name: 'Plataforma Nexus', shortName: 'RUNTIME', summary: 'cluster + ingress + obs', type: 'cluster', details: 'cls-dev-nexus, cls-dev-observabilidade e LBs internos/publicos', status: 'active' } } },
  { id: 'nexus-data-summary', parentId: 'grp-nexus', position: { x: 430, y: 470 }, type: 'topology', data: { resource: { name: 'Dados Nexus', shortName: 'DADOS', summary: 'AJD + PostgreSQL + Redis', type: 'database', details: 'Autonomous JSON DB, PostgreSQL e Redis do ecossistema nexus', status: 'active' } } },

  { id: 'cls-barramento', parentId: 'grp-barramento', position: { x: 40, y: 75 }, type: 'topology', data: { resource: { name: 'cls-dev-barramento', type: 'cluster', details: 'v1.34.1 | 3 nodes | integration-hub', status: 'active' } } },
  { id: 'lb-barramento-node', parentId: 'grp-barramento', position: { x: 270, y: 75 }, type: 'topology', data: { resource: { name: 'LB barramento', type: 'loadbalancer', details: '10.110.139.53 | nginx-internal', status: 'active' } } },
  { id: 'db-pg-barramento', parentId: 'grp-barramento', position: { x: 500, y: 75 }, type: 'topology', data: { resource: { name: 'BARRAMENTO_DEV (PostgreSQL)', type: 'database', details: 'Banco relacional do barramento', status: 'active' } } },
  { id: 'barramento-summary', parentId: 'grp-barramento', position: { x: 255, y: 75 }, type: 'topology', data: { resource: { name: 'Barramento', shortName: 'BARRAMENTO', summary: 'cluster + lb + postgres', type: 'cluster', details: 'cls-dev-barramento, nginx-internal e PostgreSQL do barramento', status: 'active' } } },

  { id: 'bucket-shell', parentId: 'grp-buckets', position: { x: 60, y: 95 }, type: 'topology', data: { resource: { name: 'mfe-shell-dev', type: 'bucket', details: '/mfe-shell/', status: 'active' } } },
  { id: 'bucket-auth', parentId: 'grp-buckets', position: { x: 430, y: 95 }, type: 'topology', data: { resource: { name: 'mfe-auth-dev', type: 'bucket', details: '/mfe-auth/', status: 'active' } } },
  { id: 'bucket-user', parentId: 'grp-buckets', position: { x: 800, y: 95 }, type: 'topology', data: { resource: { name: 'mfe-user-dev', type: 'bucket', details: '/mfe-user/', status: 'active' } } },
  { id: 'bucket-person', parentId: 'grp-buckets', position: { x: 60, y: 255 }, type: 'topology', data: { resource: { name: 'mfe-person-dev', type: 'bucket', details: '/mfe-person/', status: 'active' } } },
  { id: 'bucket-poc', parentId: 'grp-buckets', position: { x: 430, y: 255 }, type: 'topology', data: { resource: { name: 'mfe-poc-dev', type: 'bucket', details: '/mfe-poc/', status: 'active' } } },
  { id: 'bucket-formalization', parentId: 'grp-buckets', position: { x: 800, y: 255 }, type: 'topology', data: { resource: { name: 'mfe-formalization-dev', type: 'bucket', details: '/mfe-formalization/', status: 'active' } } },
  { id: 'storage-summary', parentId: 'grp-buckets', position: { x: 470, y: 165 }, type: 'topology', data: { resource: { name: 'Buckets MFE', shortName: 'BUCKETS', summary: '6 assets buckets', type: 'bucket', details: 'shell, auth, user, person, poc e formalization', status: 'active' } } },

  { id: 'idomain-nexus', parentId: 'grp-iam-nexus', position: { x: 60, y: 70 }, type: 'topology', data: { resource: { name: 'Identity Domain Nexus', type: 'shieldcheck', details: 'App auth do ecossistema nexus', status: 'active' } } },
  { id: 'vault-nexus-node', parentId: 'grp-iam-nexus', position: { x: 430, y: 70 }, type: 'topology', data: { resource: { name: 'Vault nexus-api-dev', type: 'shieldcheck', details: 'KMS + secrets | key-nexus-dev', status: 'active' } } },
  { id: 'sa-tf-admin', parentId: 'grp-iam-nexus', position: { x: 800, y: 70 }, type: 'topology', data: { resource: { name: 'svc-terraform', type: 'box', details: 'Service connection das pipelines', status: 'active' } } },
  { id: 'iam-summary', parentId: 'grp-iam-nexus', position: { x: 470, y: 70 }, type: 'topology', data: { resource: { name: 'IAM Nexus', shortName: 'IAM / VAULT', summary: 'auth + secrets + svc tf', type: 'shieldcheck', details: 'Identity Domain, Vault e service connection do Terraform', status: 'active' } } },

  { id: 'apigw-nexus', parentId: 'grp-legacy', position: { x: 105, y: 70 }, type: 'topology', data: { resource: { name: 'api-gateway-nexus-dev', type: 'apigateway', details: 'DELETED em 2026-03-14 | removido do fluxo principal', status: 'inactive' } } },
];

const initialEdges: Edge[] = [
  { id: 'e-int-cf', source: 'internet', target: 'cloudflare', animated: true, type: 'bezier', style: { stroke: '#e4e4e7' } },
  { id: 'e-cf-fortigate', source: 'cloudflare', target: 'fortigate', label: 'proxy + hostnames', animated: true, type: 'bezier' },
  { id: 'e-fortigate-lb', source: 'fortigate', target: 'lb-crivo-dev', type: 'bezier', animated: true },
  { id: 'e-lb-apigwdev', source: 'lb-crivo-dev', target: 'apigw-dev', label: 'VIP 10.6.0.181:443', type: 'bezier', animated: true },
  { id: 'e-drg-vcnoke', source: 'drg', target: 'vcn-oke', label: 'ATT-VCN-OKE-DEV', type: 'bezier' },
  { id: 'e-drg-vcndev', source: 'drg', target: 'vcn-dev', label: 'ATT-VCN-DEV', type: 'bezier' },
  { id: 'e-vcndev-apigwdev', source: 'vcn-dev', target: 'apigw-dev', label: 'SBNT-DEV', type: 'bezier' },
  { id: 'e-apigwdev-mferoutes', source: 'apigw-dev', target: 'mfe-routes', label: 'rotas MFE', type: 'bezier', animated: true, style: { stroke: '#14b8a6' } },
  { id: 'e-apigwdev-msroutes', source: 'apigw-dev', target: 'ms-routes', label: 'rotas MS', type: 'bezier', animated: true, style: { stroke: '#f97316' } },
  { id: 'e-mferoutes-shell', source: 'mfe-routes', target: 'bucket-shell', label: 'shell', type: 'bezier', style: { stroke: '#14b8a6' } },
  { id: 'e-mferoutes-auth', source: 'mfe-routes', target: 'bucket-auth', label: 'auth', type: 'bezier', style: { stroke: '#14b8a6' } },
  { id: 'e-mferoutes-user', source: 'mfe-routes', target: 'bucket-user', label: 'user', type: 'bezier', style: { stroke: '#14b8a6' } },
  { id: 'e-mferoutes-person', source: 'mfe-routes', target: 'bucket-person', label: 'person', type: 'bezier', style: { stroke: '#14b8a6' } },
  { id: 'e-mferoutes-poc', source: 'mfe-routes', target: 'bucket-poc', label: 'poc', type: 'bezier', style: { stroke: '#14b8a6' } },
  { id: 'e-mferoutes-form', source: 'mfe-routes', target: 'bucket-formalization', label: 'formalization', type: 'bezier', style: { stroke: '#14b8a6' } },
  { id: 'e-mferoutes-storage', source: 'mfe-routes', target: 'storage-summary', label: 'assets MFE', type: 'bezier', style: { stroke: '#14b8a6' } },
  { id: 'e-msroutes-nexus', source: 'ms-routes', target: 'lb-nexus-int', label: 'ms core', type: 'bezier', animated: true, style: { stroke: '#f97316' } },
  { id: 'e-msroutes-barr', source: 'ms-routes', target: 'lb-barramento-node', label: 'ms-barramento', type: 'bezier', animated: true, style: { stroke: '#22c55e' } },
  { id: 'e-msroutes-nexus-summary', source: 'ms-routes', target: 'nexus-platform-summary', label: 'servicos nexus', type: 'bezier', animated: true, style: { stroke: '#f97316' } },
  { id: 'e-msroutes-barr-summary', source: 'ms-routes', target: 'barramento-summary', label: 'barramento', type: 'bezier', animated: true, style: { stroke: '#22c55e' } },
  { id: 'e-lbpub-clsnexus', source: 'lb-public-nexus', target: 'cls-nexus', label: 'NodePort ingress', type: 'bezier', animated: true, style: { stroke: '#f59e0b' } },
  { id: 'e-vcnoke-clsnexus', source: 'vcn-oke', target: 'cls-nexus', type: 'bezier' },
  { id: 'e-vcnoke-clsobs', source: 'vcn-oke', target: 'cls-obs', type: 'bezier' },
  { id: 'e-vcnoke-clsbarr', source: 'vcn-oke', target: 'cls-barramento', type: 'bezier' },
  { id: 'e-vcnoke-nexus-summary', source: 'vcn-oke', target: 'nexus-platform-summary', type: 'bezier' },
  { id: 'e-vcnoke-barr-summary', source: 'vcn-oke', target: 'barramento-summary', type: 'bezier' },
  { id: 'e-lbnexus-clsnexus', source: 'lb-nexus-int', target: 'cls-nexus', label: 'nexus-services', type: 'bezier', style: { stroke: '#f97316' } },
  { id: 'e-lbobs-clsobs', source: 'lb-observ-node', target: 'cls-obs', label: 'observabilidade', type: 'bezier', style: { stroke: '#6366f1' } },
  { id: 'e-lbbarr-clsbarr', source: 'lb-barramento-node', target: 'cls-barramento', label: 'integration-hub', type: 'bezier', style: { stroke: '#22c55e' } },
  { id: 'e-clsnexus-dbatp', source: 'cls-nexus', target: 'db-atp', label: 'AJD', type: 'bezier', style: { stroke: '#84cc16' } },
  { id: 'e-clsnexus-dbpg', source: 'cls-nexus', target: 'db-pg-nexus', label: 'PostgreSQL', type: 'bezier', style: { stroke: '#84cc16' } },
  { id: 'e-clsnexus-dbredis', source: 'cls-nexus', target: 'db-redis', label: 'Redis', type: 'bezier', style: { stroke: '#84cc16' } },
  { id: 'e-platform-data-summary', source: 'nexus-platform-summary', target: 'nexus-data-summary', label: 'persistencia', type: 'bezier', style: { stroke: '#84cc16' } },
  { id: 'e-clsbarr-dbpg', source: 'cls-barramento', target: 'db-pg-barramento', label: 'PostgreSQL', type: 'bezier', style: { stroke: '#84cc16' } },
  { id: 'e-ado-infra', source: 'ado-platform', target: 'apigw-dev', label: 'infra + post-apply', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-buckets', source: 'ado-platform', target: 'mfe-routes', label: 'publish MFEs', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-nexus', source: 'ado-platform', target: 'cls-nexus', label: 'deploy ms nexus', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-barramento', source: 'ado-platform', target: 'cls-barramento', label: 'deploy barramento', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-obs', source: 'ado-platform', target: 'cls-obs', label: 'deploy observabilidade', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-nexus-summary', source: 'ado-platform', target: 'nexus-platform-summary', label: 'deploy runtime', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-barramento-summary', source: 'ado-platform', target: 'barramento-summary', label: 'deploy barramento', type: 'bezier', animated: true, style: { stroke: '#0ea5e9', strokeDasharray: '7 4' } },
  { id: 'e-ado-iam-summary', source: 'ado-platform', target: 'iam-summary', label: 'segredos + conexao', type: 'bezier', style: { stroke: '#38bdf8' } },
  { id: 'e-ado-sa', source: 'ado-platform', target: 'sa-tf-admin', label: 'service connection', type: 'bezier', style: { stroke: '#38bdf8' } },
  { id: 'e-sa-vault', source: 'sa-tf-admin', target: 'vault-nexus-node', label: 'vault secrets', type: 'bezier', style: { stroke: '#38bdf8', strokeDasharray: '4 3' } },
  { id: 'e-domain-clsnexus', source: 'idomain-nexus', target: 'cls-nexus', label: 'app auth', type: 'bezier', style: { stroke: '#f97316', strokeDasharray: '4 3' } },
];

const technicalOnlyNodeIds = new Set([
  'cls-nexus',
  'cls-obs',
  'lb-public-nexus',
  'lb-nexus-int',
  'lb-observ-node',
  'db-atp',
  'db-pg-nexus',
  'db-redis',
  'cls-barramento',
  'lb-barramento-node',
  'db-pg-barramento',
  'bucket-shell',
  'bucket-auth',
  'bucket-user',
  'bucket-person',
  'bucket-poc',
  'bucket-formalization',
  'idomain-nexus',
  'vault-nexus-node',
  'sa-tf-admin',
]);

const executiveOnlyNodeIds = new Set([
  'repo-infra-summary',
  'repo-mfe-summary',
  'repo-ms-summary',
  'repo-vis-summary',
  'nexus-platform-summary',
  'nexus-data-summary',
  'barramento-summary',
  'storage-summary',
  'iam-summary',
]);

function isRepoNode(id: string) {
  return id.startsWith('repo-') && !executiveOnlyNodeIds.has(id);
}

export function NexusDiagram() {
  const [viewMode, setViewMode] = useState<ViewMode>('executive');

  const nodes = useMemo(() => {
    return initialNodes.filter((node) => {
      if (viewMode === 'technical') {
        return !executiveOnlyNodeIds.has(node.id);
      }

      if (isRepoNode(node.id)) {
        return false;
      }

      if (technicalOnlyNodeIds.has(node.id)) {
        return false;
      }

      return true;
    });
  }, [viewMode]);

  const edges = useMemo(() => {
    const visibleNodeIds = new Set(nodes.map((node) => node.id));
    return initialEdges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  }, [nodes]);

  return (
    <div className="h-screen w-screen bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.16 }}
        defaultEdgeOptions={{
          type: 'bezier',
          style: { stroke: '#71717a', strokeWidth: 1.6 },
          labelStyle: { fill: '#e4e4e7', fontSize: 10, fontWeight: 700 },
          labelBgStyle: { fill: 'rgba(9, 9, 11, 0.92)', fillOpacity: 1 },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 6,
        }}
      >
        <Panel position="top-left" className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white m-4 shadow-2xl max-w-[620px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                NEXUS TOPOLOGY
              </h1>
              <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">DEV atualizado em 2026-03-14 | layout v3</p>
            </div>
            <div className="flex rounded-xl border border-white/10 bg-zinc-950/70 p-1">
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
                Tecnica
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-zinc-300">
            Nos padronizados com rótulos curtos. Os detalhes completos ficaram no tooltip ao passar o mouse.
          </p>

          <div className="mt-4 flex gap-2 flex-wrap">
            <div className="px-2 py-1 bg-sky-500/20 text-sky-400 rounded text-[10px] font-bold border border-sky-500/30">Repos por dominio</div>
            <div className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-[10px] font-bold border border-teal-500/30">Rotas MFE agrupadas</div>
            <div className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-[10px] font-bold border border-orange-500/30">Rotas MS agrupadas</div>
            <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-[10px] font-bold border border-purple-500/30">Gateway unificado</div>
            <div className="px-2 py-1 bg-zinc-500/20 text-zinc-400 rounded text-[10px] font-bold border border-zinc-500/30">Legacy isolado</div>
            <div className="px-2 py-1 bg-lime-500/20 text-lime-400 rounded text-[10px] font-bold border border-lime-500/30">Visao {viewMode === 'executive' ? 'executiva' : 'tecnica'}</div>
          </div>
        </Panel>

        <Panel position="bottom-left" className="bg-zinc-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white m-4 shadow-2xl max-w-[460px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Leitura do diagrama</p>
          <div className="text-[10px] text-zinc-300 leading-relaxed space-y-1">
            <p><span className="text-teal-400 font-bold">Rotas MFE</span>: fan-out dos buckets sem poluir a borda do gateway.</p>
            <p><span className="text-orange-400 font-bold">Rotas MS</span>: agrega o trafego antes de distribuir para Nexus e Barramento.</p>
            <p><span className="text-zinc-400 font-bold">Tooltip</span>: o nome curto fica no canvas; o detalhe completo fica no hover.</p>
            <p><span className="text-sky-400 font-bold">Executiva</span>: mostra dominios e agrupamentos. <span className="text-white font-bold">Tecnica</span>: volta aos componentes detalhados.</p>
          </div>
          <p className="text-[9px] text-zinc-600 mt-3 font-mono">gateway: bqdgz22e5... | private | cmp-dev-inv</p>
        </Panel>

        <Panel position="bottom-right" className="bg-zinc-900/80 p-4 rounded-xl border border-white/10 text-[10px] font-mono text-zinc-500 m-4 max-w-[440px]">
          SYSTEM_REPORT_ID: OCI-DEV-NEXUS-2026.03.14-r6 | labels compactos | tooltip hover | visao executiva/tecnica
        </Panel>

        <Controls className="bg-zinc-800 border-zinc-700 !fill-white" />
        <MiniMap className="bg-zinc-900 border-zinc-800" nodeColor="#3f3f46" maskColor="rgba(0, 0, 0, 0.7)" />
        <Background color="#27272a" gap={24} />
      </ReactFlow>
    </div>
  );
}


