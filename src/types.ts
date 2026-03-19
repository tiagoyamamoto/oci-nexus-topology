export type ResourceType = 'cluster' | 'vcn' | 'subnet' | 'gateway' | 'bucket' | 'apigateway' | 'loadbalancer' | 'shieldcheck' | 'database' | 'box';

export type ResourceStatus = 'active' | 'warning' | 'pending' | 'manual' | 'inactive';
export type ResourceOrigin = 'terraform' | 'manual' | 'hybrid';

export interface OCIResource {
    id?: string;
    name: string;
    shortName?: string;
    type: ResourceType;
    summary?: string;
    details: string;
    tooltip?: string;
    status: ResourceStatus;
    managedBy?: ResourceOrigin;
    metrics?: {
        label: string;
        value: string;
    }[];
}

export interface TopologyNodeData {
    resource: OCIResource;
    isParent?: boolean;
}
