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

    // OCI Object Storage Buckets — MFE assets (acessados via api-gateway-dev unificado)
    // DELETADOS: 6 API Gateways MFE públicos individuais (migrados para api-gateway-dev)

    // API Gateway — Nexus (Private, cmp-dev-nexus compartment)
    { id: 'apigw-nexus', name: 'api-gateway-nexus-dev', type: 'apigateway', details: '10.6.0.123 (Private)', status: 'manual' },

    // API Gateway — Dev (Private, cmp-dev-inv, SBNT-DEV 10.6.0.0/24)
    { id: 'apigw-dev', name: 'api-gateway-dev', type: 'apigateway', details: 'bqdgz22e5... (PRIVATE) | 10.6.0.181 | SBNT-DEV', status: 'active' },

    // Shared — FortiGate + LB
    { id: 'fortigate', name: 'FortiGate', type: 'gateway', details: '129.148.17.8 (Public IP) | SBNT-PUBLIC-SHARED', status: 'active' },
    { id: 'lb-crivo-dev', name: 'Test_Crivo_Dev (LB)', type: 'loadbalancer', details: '10.8.4.127 (Private) | SBNT-LB-SHARED | crivo_routes', status: 'active' },

    // Clusters
    { id: 'cls-nexus', name: 'cls-dev-nexus', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' },
    { id: 'cls-barramento', name: 'cls-dev-barramento', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' },
    { id: 'cls-observabilidade', name: 'cls-dev-observabilidade', type: 'cluster', details: 'v1.34.1 | 3 Nodes', status: 'active' },

    // Load Balancers
    { id: 'lb-nexus-pub', name: 'LB nexus (public)', type: 'loadbalancer', details: '137.131.236.202', status: 'active' },
    { id: 'lb-nexus-int', name: 'LB nexus (internal)', type: 'loadbalancer', details: '10.110.135.3 | nginx-internal | 8 ms-* services', status: 'active' },
    { id: 'lb-barramento', name: 'LB barramento', type: 'loadbalancer', details: '10.110.133.131 | nginx-internal | ms-barramento', status: 'active' },
    { id: 'lb-observ', name: 'LB observ.', type: 'loadbalancer', details: '10.110.129.64', status: 'active' },

    // ms-* API Services (OKE, routed via api-gateway-dev unified deployment)
    { id: 'ms-auth-external', name: 'ms-auth-external', type: 'cluster', details: '/ms-auth-external/ | nexus-services | cls-dev-nexus', status: 'active' },
    { id: 'ms-auth-sso', name: 'ms-auth-sso', type: 'cluster', details: '/ms-auth-sso/ | nexus-services | cls-dev-nexus', status: 'active' },
    { id: 'ms-belt', name: 'ms-belt', type: 'cluster', details: '/ms-belt/ | nexus-services | cls-dev-nexus', status: 'active' },
    { id: 'ms-notify', name: 'ms-notify', type: 'cluster', details: '/ms-notify/ | nexus-services | cls-dev-nexus', status: 'active' },
    { id: 'ms-parameters', name: 'ms-parameters', type: 'cluster', details: '/ms-parameters/ | nexus-services | cls-dev-nexus', status: 'active' },
    { id: 'ms-person', name: 'ms-person', type: 'cluster', details: '/ms-person/ | nexus-services | cls-dev-nexus', status: 'active' },
    { id: 'ms-poc', name: 'ms-poc', type: 'cluster', details: '/ms-poc/ | nexus-services | cls-dev-nexus', status: 'active' },
    { id: 'ms-user', name: 'ms-user', type: 'cluster', details: '/ms-user/ | nexus-services | cls-dev-nexus', status: 'active' },
    { id: 'ms-barramento', name: 'ms-barramento', type: 'cluster', details: '/ms-barramento/ | integration-hub | cls-dev-barramento', status: 'active' },

    // Storage — MFE Buckets (OCI Object Storage, public read)
    { id: 'bucket-shell', name: 'mfe-shell-dev', type: 'bucket', details: 'Shell (host app) assets', status: 'active' },
    { id: 'bucket-auth', name: 'mfe-auth-dev', type: 'bucket', details: 'Auth MFE assets', status: 'active' },
    { id: 'bucket-user', name: 'mfe-user-dev', type: 'bucket', details: 'User MFE assets', status: 'active' },
    { id: 'bucket-person', name: 'mfe-person-dev', type: 'bucket', details: 'Person MFE assets', status: 'active' },
    { id: 'bucket-poc', name: 'mfe-poc-dev', type: 'bucket', details: 'PoC MFE assets', status: 'active' },
    { id: 'bucket-formalization', name: 'mfe-formalization-dev', type: 'bucket', details: 'Formalization MFE assets', status: 'active' },

    // Storage — Infra
    { id: 'bucket-tfstate', name: 'tfstate-dev-*', type: 'bucket', details: 'Infrastructure State', status: 'manual' },
];
