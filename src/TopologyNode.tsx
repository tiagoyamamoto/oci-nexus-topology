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
  Layers3,
} from 'lucide-react';
import type { ResourceOrigin, TopologyNodeData, ResourceType } from './types';
import { cn } from './lib/utils';

const iconMap: Record<ResourceType, React.ElementType> = {
  vcn: Network,
  cluster: Cloud,
  subnet: Layers3,
  gateway: Globe,
  bucket: Database,
  apigateway: ShieldCheck,
  loadbalancer: Activity,
  shieldcheck: ShieldCheck,
  database: Database,
  box: Box,
};

const statusColors = {
  active: 'border-emerald-500/70 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300',
  warning: 'border-amber-500/70 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300',
  pending: 'border-sky-500/70 bg-sky-50 text-sky-800 dark:bg-sky-950/20 dark:text-sky-300',
  manual: 'border-orange-500/70 bg-orange-50 text-orange-800 dark:bg-orange-950/20 dark:text-orange-300',
  inactive: 'border-zinc-600 bg-zinc-50 text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-500 opacity-65',
};

const originStyles: Record<ResourceOrigin, string> = {
  terraform: 'bg-emerald-500/18 text-emerald-300 border border-emerald-400/30',
  manual: 'bg-orange-500/18 text-orange-300 border border-orange-400/30',
  hybrid: 'bg-sky-500/18 text-sky-300 border border-sky-400/30',
};

const originLabels: Record<ResourceOrigin, string> = {
  terraform: 'Terraform',
  manual: 'Manual',
  hybrid: 'Misto',
};

const shortNameMap: Record<string, string> = {
  Internet: 'INTERNET',
  Cloudflare: 'CLOUDFLARE',
  FortiGate: 'FORTIGATE',
  'Test_Crivo_Dev': 'LB CRIVO',
  'api-gateway-dev': 'GW DEV',
  'VCN-DEV': 'VCN DEV',
  'VCN vcn-oke': 'VCN OKE',
  'DRG-Invista-Shared': 'DRG',
  'Azure DevOps': 'AZURE DEVOPS',
  'tf_oci_clusters': 'TF OCI',
  'pipeline-templates': 'PIPE TPL',
  'Identity Domain Nexus': 'IDENTITY',
  'Vault / KMS Nexus': 'VAULT / KMS',
  'cls-dev-nexus': 'CLS NEXUS',
  'cls-dev-observabilidade': 'CLS OBS',
  'np-dev-1': 'NP NEXUS',
  'np-dev-3': 'NP OBS',
  'NEXUS_DEV (PostgreSQL)': 'PG NEXUS',
  'BARRAMENTO_DEV (PostgreSQL)': 'PG BARR',
  'NEXUS_DEV (Redis)': 'REDIS',
  'NEXUS_DEV (AJD)': 'AJD',
  'Buckets MFE DEV': 'MFE BUCKETS',
  'nexus-terraform-tfstate': 'TFSTATE NOVO',
  'tfstate-terraform': 'TFSTATE LEGADO',
  'Legacy Load Balancers': 'LBS LEGADOS',
  'api-gateway-nexus-dev': 'GW LEGACY',
};

function autoShortName(name: string) {
  if (shortNameMap[name]) {
    return shortNameMap[name];
  }

  return name
    .replace(/^(mfe|ms)-/i, '$1 ')
    .replace(/-dev$/i, '')
    .replace(/-/g, ' ')
    .toUpperCase();
}

function summarize(text: string) {
  const clean = text.split('|')[0].trim();
  return clean.length > 44 ? `${clean.slice(0, 41)}...` : clean;
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
        'group relative px-4 py-3 rounded-2xl border-2 shadow-xl min-w-[196px] max-w-[196px] bg-white/95 dark:bg-zinc-950/95 transition-all backdrop-blur-sm',
        statusColors[resource.status],
      )}
      title={tooltip}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />

      {resource.managedBy && (
        <div className={cn('absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em]', originStyles[resource.managedBy])}>
          {originLabels[resource.managedBy]}
        </div>
      )}

      <div className="flex items-start gap-3 pr-16">
        <div className={cn('p-2.5 rounded-xl bg-white/60 dark:bg-white/5 shadow-inner shrink-0')}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-60">{resource.type}</p>
          <h3 className="text-sm font-extrabold leading-tight mt-1 break-words">{shortName}</h3>
          <p className="mt-2 text-[10px] font-semibold leading-relaxed opacity-80 break-words">{summary}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-72 -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-950/96 p-3 text-[10px] leading-relaxed text-zinc-200 shadow-2xl group-hover:block">
        <p className="font-bold uppercase tracking-[0.18em] text-zinc-400">{resource.name}</p>
        <p className="mt-2">{resource.details}</p>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
};
