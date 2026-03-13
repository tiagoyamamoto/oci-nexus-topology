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

    // CI/CD — Azure DevOps (externo)
    { id: 'azuredevops', name: 'Azure DevOps', type: 'box', details: 'CN-Squad / Invista FIDC - Nexus | Pipelines: ms-* + MFEs', status: 'active' },

    // API Gateway — Nexus (DELETED — consolidado em api-gateway-dev)
    { id: 'apigw-nexus', name: 'api-gateway-nexus-dev', type: 'apigateway', details: 'DELETED — consolidado em api-gateway-dev (deploy-mfe-unified-dev)', status: 'inactive' },

    // API Gateway — Dev Unificado (Private, cmp-dev-inv, subnet SBNT-DEV 10.6.0.0/24)
    // deploy-mfe-unified-dev: 21 rotas = /mfe-shell /mfe-auth /mfe-user /mfe-person /mfe-poc /mfe-formalization
    //                                  + /ms-auth-external /ms-auth-sso /ms-belt /ms-notify /ms-parameters
    //                                  + /ms-person /ms-poc /ms-user /ms-barramento
    { id: 'apigw-dev', name: 'api-gateway-dev', type: 'apigateway', details: 'bqdgz22e5... | PRIVATE | SBNT-DEV (10.6.0.0/24) | cmp-dev-inv | 21 rotas: /mfe-*/ + /ms-*/', status: 'active' },

    // Shared — FortiGate + LB
    { id: 'fortigate', name: 'FortiGate', type: 'gateway', details: '129.148.17.8 (Public IP) | SBNT-PUBLIC-SHARED', status: 'active' },
    { id: 'lb-crivo-dev', name: 'Test_Crivo_Dev (LB)', type: 'loadbalancer', details: '10.8.4.127 | PRIVATE | cmp-shared-inv | crivo_routes: mfe-shell-dev-oci + api-gateway-dev + ms-* → 10.6.0.181', status: 'active' },

    // Clusters OKE (cmp-dev-nexus) — todos v1.34.1 | 3 nodes
    { id: 'cls-nexus', name: 'cls-dev-nexus', type: 'cluster', details: 'v1.34.1 | 3 Nodes | nexus-services namespace', status: 'active' },
    { id: 'cls-barramento', name: 'cls-dev-barramento', type: 'cluster', details: 'v1.34.1 | 3 Nodes | integration-hub namespace', status: 'active' },
    { id: 'cls-observabilidade', name: 'cls-dev-observabilidade', type: 'cluster', details: 'v1.34.1 | 3 Nodes | monitoring/logging', status: 'active' },

    // Load Balancers (cmp-dev-nexus) — dados confirmados via OCI CLI
    { id: 'lb-nexus-pub', name: 'LB nexus (public)', type: 'loadbalancer', details: '137.131.236.202 | PUBLIC | cls-dev-nexus → nginx', status: 'active' },
    { id: 'lb-nexus-int', name: 'LB nexus (nginx-int)', type: 'loadbalancer', details: '10.110.143.54 | PRIVATE | nginx-internal | ms-* services', status: 'active' },
    { id: 'lb-nexus-ext', name: 'LB nexus (nginx-ext)', type: 'loadbalancer', details: '10.110.130.171 | PRIVATE | nginx-external | cls-dev-nexus', status: 'active' },
    { id: 'lb-barramento', name: 'LB barramento', type: 'loadbalancer', details: '10.110.139.53 | PRIVATE | nginx-internal | ms-barramento', status: 'active' },
    { id: 'lb-observ', name: 'LB observabilidade', type: 'loadbalancer', details: '10.110.136.228 | PRIVATE | cls-dev-observabilidade', status: 'active' },

    // Databases (cmp-dev-nexus) — todos MANUAIS | padrao nomenclatura: NOME_AMBIENTE | verificado 2026-03-13
    { id: 'db-atp', name: 'NEXUS_DEV (AJD)', type: 'database', details: 'Autonomous JSON DB | AVAILABLE | serverless auto-scaling | db-name: nexusdbdev | cmp-dev-nexus', status: 'active' },
    { id: 'db-pg-nexus', name: 'NEXUS_DEV (PostgreSQL)', type: 'database', details: 'PostgreSQL | ACTIVE | banco relacional ms-nexus | cmp-dev-nexus', status: 'active' },
    { id: 'db-pg-barramento', name: 'BARRAMENTO_DEV (PostgreSQL)', type: 'database', details: 'PostgreSQL | ACTIVE | banco relacional ms-barramento | cmp-dev-nexus', status: 'active' },
    { id: 'db-redis', name: 'NEXUS_DEV (Redis)', type: 'database', details: 'OCI Cache (Redis) | ACTIVE | cmp-dev-nexus', status: 'active' },

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

    // Storage — MFE Buckets (OCI Object Storage, cmp-dev-nexus, public read)
    { id: 'bucket-shell', name: 'mfe-shell-dev', type: 'bucket', details: 'Shell (host app) assets', status: 'active' },
    { id: 'bucket-auth', name: 'mfe-auth-dev', type: 'bucket', details: 'Auth MFE assets', status: 'active' },
    { id: 'bucket-user', name: 'mfe-user-dev', type: 'bucket', details: 'User MFE assets', status: 'active' },
    { id: 'bucket-person', name: 'mfe-person-dev', type: 'bucket', details: 'Person MFE assets', status: 'active' },
    { id: 'bucket-poc', name: 'mfe-poc-dev', type: 'bucket', details: 'PoC MFE assets', status: 'active' },
    { id: 'bucket-formalization', name: 'mfe-formalization-dev', type: 'bucket', details: 'Formalization MFE assets', status: 'active' },

    // Storage — Terraform State (cmp-dev-nexus, 3 buckets)
    { id: 'bucket-tfstate', name: 'tfstate-* (3 buckets)', type: 'bucket', details: 'tfstate-terraform | tfstate-gqysee | tfstate-inidhr', status: 'manual' },
];
