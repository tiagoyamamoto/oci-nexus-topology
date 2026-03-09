import type { OCIResource } from './types';

export const terraformTopology: OCIResource[] = [
    // Storage & Support Services
    { id: 'tf_vault', name: 'OCI Vault (KMS)', type: 'shieldcheck', details: 'vault.tf - AES-256 Encryption', status: 'active' },
    { id: 'tf_bucket', name: 'Object Storage Bucket', type: 'bucket', details: 'bucket.tf - Versioned Artifacts', status: 'active' },

    // DatabasesLayer
    { id: 'tf_postgresql', name: 'PostgreSQL', type: 'database', details: 'postgresql.tf - Managed DB', status: 'active' },
    { id: 'tf_redis', name: 'Redis Cluster', type: 'database', details: 'redis.tf - Distributed Cache', status: 'active' },
    { id: 'tf_adj', name: 'Autonomous JSON DB', type: 'database', details: 'autonomous_json.tf', status: 'active' },

    // OKE Clusters Layer
    { id: 'tf_cls_nexus', name: 'OKE Nexus', type: 'cluster', details: 'oke_cluster.tf - Main Workloads', status: 'active' },
    { id: 'tf_cls_bus', name: 'OKE Bus', type: 'cluster', details: 'oke_cluster.tf - Integration/Events', status: 'active' },
    { id: 'tf_cls_obs', name: 'OKE Observability', type: 'cluster', details: 'oke_cluster.tf - Telemetry', status: 'active' },

    // Service Accounts associated with Clusters
    { id: 'sa_nexus', name: 'cicd-admin-sa (Nexus)', type: 'box', details: 'oke_service_account.tf', status: 'pending' },
    { id: 'sa_bus', name: 'cicd-admin-sa (Bus)', type: 'box', details: 'oke_service_account.tf', status: 'pending' },
    { id: 'sa_obs', name: 'cicd-admin-sa (Obs)', type: 'box', details: 'oke_service_account.tf', status: 'pending' },
];
