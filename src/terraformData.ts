import type { OCIResource } from './types';

export const terraformTopology: OCIResource[] = [
    // Security & Storage Layer
    { id: 'tf_vault', name: 'OCI Vault (KMS)', type: 'shieldcheck', details: 'vault.tf - AES-256 Encryption', status: 'active' },
    { id: 'tf_bucket', name: 'MFE Buckets', type: 'bucket', details: 'bucket.tf - Frontend Assets', status: 'active' },

    // API Gateway Layer
    { id: 'tf_apigw', name: 'API Gateway (Shared)', type: 'apigateway', details: 'api_gateway_mfe.tf', status: 'active' },

    // Databases Layer — todos MANUAIS (criados via console OCI, não provisionados pelo Terraform)
    { id: 'tf_postgresql', name: 'PostgreSQL', type: 'database', details: 'postgresql.tf | MANUAL — NEXUS_DEV + BARRAMENTO_DEV | cmp-dev-nexus', status: 'manual' },
    { id: 'tf_redis', name: 'Redis Cluster', type: 'database', details: 'redis.tf | MANUAL — NEXUS_DEV (OCI Cache) | cmp-dev-nexus', status: 'manual' },
    { id: 'tf_adj', name: 'Autonomous JSON DB', type: 'database', details: 'autonomous_json.tf | MANUAL — NEXUS_DEV (AJD) | db-name: nexusdbdev', status: 'manual' },

    // OKE Clusters Layer
    { id: 'tf_cls_nexus', name: 'OKE Nexus', type: 'cluster', details: 'oke_cluster.tf - Main Workloads', status: 'active' },
    { id: 'tf_cls_bus', name: 'OKE Bus', type: 'cluster', details: 'oke_cluster.tf - Integration/Events', status: 'active' },
    { id: 'tf_cls_obs', name: 'OKE Observability', type: 'cluster', details: 'oke_cluster.tf - Telemetry', status: 'active' },

    // Service Accounts associated with Clusters
    { id: 'sa_nexus', name: 'cicd-admin-sa (Nexus)', type: 'box', details: 'oke_service_account.tf', status: 'pending' },
    { id: 'sa_bus', name: 'cicd-admin-sa (Bus)', type: 'box', details: 'oke_service_account.tf', status: 'pending' },
    { id: 'sa_obs', name: 'cicd-admin-sa (Obs)', type: 'box', details: 'oke_service_account.tf', status: 'pending' },
];
