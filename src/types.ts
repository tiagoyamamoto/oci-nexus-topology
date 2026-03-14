export type ResourceType = 'cluster' | 'vcn' | 'subnet' | 'gateway' | 'bucket' | 'apigateway' | 'loadbalancer' | 'shieldcheck' | 'database' | 'box';

export interface OCIResource {
    id?: string;
    name: string;
    shortName?: string;
    type: ResourceType;
    summary?: string;
    details: string;
    tooltip?: string;
    status: 'active' | 'warning' | 'pending' | 'manual' | 'inactive';
    metrics?: {
        label: string;
        value: string;
    }[];
}

export interface TopologyNodeData {
    resource: OCIResource;
    isParent?: boolean;
}
