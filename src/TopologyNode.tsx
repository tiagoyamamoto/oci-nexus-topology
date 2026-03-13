import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
    Network,
    Cloud,
    Database,
    Globe,
    ShieldCheck,
    Activity,
    Box
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
    box: Box
};

const statusColors = {
    active: 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400',
    warning: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
    pending: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
    manual: 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400',
    inactive: 'border-zinc-500 bg-zinc-50 text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-500 opacity-50',
};

export const TopologyNode = ({ data }: { data: TopologyNodeData }) => {
    const { resource } = data;
    const Icon = iconMap[resource.type] || Box;

    return (
        <div className={cn(
            "px-4 py-3 rounded-xl border-2 shadow-lg min-w-[180px] bg-white dark:bg-zinc-900 transition-all",
            statusColors[resource.status]
        )}>
            <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />

            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-lg",
                    "bg-white/50 dark:bg-white/5 shadow-inner"
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">{resource.type}</p>
                    <h3 className="text-sm font-extrabold leading-none mt-1">{resource.name}</h3>
                </div>
            </div>

            <div className="mt-3 pt-2 border-t border-current/10">
                <p className="text-[10px] font-medium leading-relaxed opacity-80">{resource.details}</p>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
        </div>
    );
};
