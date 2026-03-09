export type ResourceType = 'cluster' | 'vcn' | 'subnet' | 'gateway' | 'bucket' | 'apigateway' | 'loadbalancer';

export interface OCIResource {
    id: string;
    name: string;
    type: ResourceType;
    details: string;
    status: 'active' | 'warning' | 'pending' | 'manual';
    metrics?: {
        label: string;
        value: string;
    }[];
}

export interface TopologyNodeData {
    resource: OCIResource;
    isParent?: boolean;
}
