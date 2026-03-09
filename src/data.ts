import type { OCIResource } from './types';

export const nexusTopology: OCIResource[] = [
    // Network Layer
    { id: 'vcn-oke', name: 'VCN vcn-oke', type: 'vcn', details: '10.110.0.0/16', status: 'active' },
    { id: 'vcn-dev', name: 'VCN-DEV (Shared)', type: 'vcn', details: '10.6.0.0/16', status: 'manual' },

    // Gateways
    { id: 'igw', name: 'Internet Gateway', type: 'gateway', details: 'Public Traffic', status: 'active' },
    { id: 'ngw', name: 'NAT Gateway', type: 'gateway', details: 'Private Exit', status: 'active' },
    { id: 'sgw', name: 'Service Gateway', type: 'gateway', details: 'OCI-to-OCI', status: 'active' },
    { id: 'drg', name: 'DRG-Invista-Shared', type: 'gateway', details: 'VCN Connectivity', status: 'manual' },

    // API Gateways
    { id: 'apigw-mfe', name: 'api-gateway-mfe-dev', type: 'apigateway', details: '147.15.97.158 (Public)', status: 'active' },
    { id: 'apigw-nexus', name: 'api-gateway-nexus-dev', type: 'apigateway', details: '10.6.0.123 (Private)', status: 'manual' },

    // Clusters
    { id: 'cls-nexus', name: 'cls-dev-nexus', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' },
    { id: 'cls-barramento', name: 'cls-dev-barramento', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' },
    { id: 'cls-observabilidade', name: 'cls-dev-observabilidade', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' },

    // Load Balancers
    { id: 'lb-nexus-pub', name: 'LB nexus (public)', type: 'loadbalancer', details: '137.131.236.202', status: 'active' },
    { id: 'lb-nexus-int', name: 'LB nexus (internal)', type: 'loadbalancer', details: '10.110.135.3', status: 'active' },
    { id: 'lb-barramento', name: 'LB barramento', type: 'loadbalancer', details: '10.110.133.131', status: 'active' },
    { id: 'lb-observ', name: 'LB observ.', type: 'loadbalancer', details: '10.110.129.64', status: 'active' },

    // Storage
    { id: 'bucket-mfe', name: 'mfe-*-dev', type: 'bucket', details: 'Frontend Assets', status: 'active' },
    { id: 'bucket-tfstate', name: 'tfstate-dev-*', type: 'bucket', details: 'Infrastructure State', status: 'manual' },
];
