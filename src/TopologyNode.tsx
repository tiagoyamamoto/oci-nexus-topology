import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Network,
  Cloud,
  Database,
  Globe,
  ShieldCheck,
  Activity,
  Box,
} from 'lucide-react';
import type { TopologyNodeData, ResourceType } from './types';
import { cn } from './lib/utils';

const iconMap: Record<ResourceType, React.ElementType> = {
  vcn: Network,
  cluster: Cloud,
  subnet: Box,
  gateway: Globe,
  bucket: Database,
  apigateway: ShieldCheck,
  loadbalancer: Activity,
  shieldcheck: ShieldCheck,
  database: Database,
  box: Box,
};

const statusColors = {
  active: 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400',
  warning: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
  pending: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
  manual: 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400',
  inactive: 'border-zinc-500 bg-zinc-50 text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-500 opacity-60',
};

const shortNameMap: Record<string, string> = {
  Internet: 'WEB',
  Cloudflare: 'WAF / DNS',
  'Azure DevOps': 'ADO',
  'api-gateway-dev': 'GW DEV',
  'api-gateway-nexus-dev': 'GW LEGACY',
  'cls-dev-nexus': 'CLS NEXUS',
  'cls-dev-observabilidade': 'CLS OBS',
  'cls-dev-barramento': 'CLS BARR',
  'LB Publico nexus': 'LB PUB',
  'LB nexus internal': 'LB INT',
  'LB observabilidade': 'LB OBS',
  'LB barramento': 'LB BARR',
  'Identity Domain Nexus': 'ID DOMAIN',
  'Vault nexus-api-dev': 'VAULT',
  'svc-terraform': 'SVC TF',
  'terraform-nexus': 'TF NEXUS',
  'azure-pipelines-templates': 'TPL PIPE',
  'oci-nexus-topology': 'TOPOLOGY',
  'MFE routes': 'ROTAS MFE',
  'MS routes': 'ROTAS MS',
  FortiGate: 'FORTIGATE',
  'Test_Crivo_Dev': 'LB CRIVO',
  'DRG-Invista-Shared': 'DRG',
  'VCN-DEV': 'VCN DEV',
  'VCN vcn-oke': 'VCN OKE',
  'NEXUS_DEV (AJD)': 'DB AJD',
  'NEXUS_DEV (PostgreSQL)': 'DB PG',
  'NEXUS_DEV (Redis)': 'REDIS',
  'BARRAMENTO_DEV (PostgreSQL)': 'PG BARR',
};

function autoShortName(name: string) {
  if (shortNameMap[name]) {
    return shortNameMap[name];
  }

  return name
    .replace(/^mfe-/, 'MFE ')
    .replace(/^ms-/, 'MS ')
    .replace(/-dev$/i, '')
    .replace(/-/g, ' ')
    .toUpperCase();
}

function summarize(text: string) {
  const clean = text.split('|')[0].trim();
  return clean.length > 34 ? `${clean.slice(0, 31)}...` : clean;
}

export const TopologyNode = ({ data }: { data: TopologyNodeData }) => {
  const { resource } = data;
  const Icon = iconMap[resource.type] || Box;
  const shortName = resource.shortName || autoShortName(resource.name);
  const summary = resource.summary || summarize(resource.details);
  const tooltip = resource.tooltip || `${resource.name}\n${resource.details}`;

  return (
    <div
      className={cn(
        'group relative px-4 py-3 rounded-2xl border-2 shadow-xl min-w-[188px] max-w-[188px] bg-white dark:bg-zinc-900 transition-all',
        statusColors[resource.status],
      )}
      title={tooltip}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />

      <div className="flex items-start gap-3">
        <div className={cn('p-2.5 rounded-xl', 'bg-white/50 dark:bg-white/5 shadow-inner shrink-0')}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-60">{resource.type}</p>
          <h3 className="text-sm font-extrabold leading-tight mt-1 break-words">{shortName}</h3>
          <p className="mt-2 text-[10px] font-semibold leading-relaxed opacity-80 break-words">{summary}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-950/96 p-3 text-[10px] leading-relaxed text-zinc-200 shadow-2xl group-hover:block">
        <p className="font-bold uppercase tracking-[0.18em] text-zinc-400">{resource.name}</p>
        <p className="mt-2">{resource.details}</p>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
};
