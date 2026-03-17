# Comparativo de Recursos

Comparacao entre os compartments `cmp-dev-nexus` e `cmp-dev-nexus-teste` na tenancy `invistacloud`.

Data da coleta: `2026-03-16`
Regiao consultada: `sa-saopaulo-1`
Metodo: `OCI Search - structured-search`

## Escopo

- Origem: `cmp-dev-nexus`
- Destino: `cmp-dev-nexus-teste`
- Criterio de comparacao: `resource-type + display-name`

Observacoes:

- Recursos de OKE como `Instance` e `BootVolume` naturalmente diferem por nome e OCID entre ambientes.
- O documento abaixo destaca principalmente paridade funcional, nao identidade literal.
- No compartment de teste existem recursos em `PENDING_DELETION` para `Vault` e `Key`.

## Resumo Executivo

- `cmp-dev-nexus` possui `63` recursos.
- `cmp-dev-nexus-teste` possui `24` recursos.
- O ambiente `teste` nao espelha o `dev`.
- O `teste` hoje esta concentrado em `OKE + Vault/Keys`.
- O `dev` possui componentes adicionais de aplicacao, banco, cache, storage, secrets e networking.

## Inventario por Tipo

### cmp-dev-nexus

| Tipo | Quantidade |
| --- | ---: |
| ApiGatewayApi | 1 |
| App | 1 |
| AutonomousDatabase | 1 |
| BootVolume | 6 |
| Bucket | 9 |
| ClustersCluster | 2 |
| CustomerDnsZone | 6 |
| Instance | 6 |
| Key | 2 |
| LoadBalancer | 5 |
| OrmJob | 1 |
| OrmStack | 3 |
| Policy | 1 |
| PostgresqlConfiguration | 1 |
| PostgresqlDbSystem | 2 |
| PublicIp | 1 |
| RedisCluster | 1 |
| User | 2 |
| Vault | 1 |
| VaultSecret | 10 |
| Volume | 1 |

### cmp-dev-nexus-teste

| Tipo | Quantidade |
| --- | ---: |
| BootVolume | 6 |
| ClustersCluster | 2 |
| Instance | 6 |
| Key | 7 |
| Vault | 3 |

## Existe em dev e nao existe em teste

### Aplicacao e identidade

| Tipo | Nome |
| --- | --- |
| ApiGatewayApi | `pessoas-teste` |
| App | `Nexus dev` |
| User | `userteste` |
| User | `vinicius.constancio@7comm.com.br` |

### Storage

| Tipo | Nome |
| --- | --- |
| Bucket | `mfe-auth-dev` |
| Bucket | `mfe-formalization-dev` |
| Bucket | `mfe-person-dev` |
| Bucket | `mfe-poc-dev` |
| Bucket | `mfe-shell-dev` |
| Bucket | `mfe-user-dev` |
| Bucket | `tfstate-gqysee` |
| Bucket | `tfstate-inidhr` |
| Bucket | `tfstate-terraform` |

### Banco e cache

| Tipo | Nome |
| --- | --- |
| AutonomousDatabase | `nexus-dev` |
| PostgresqlDbSystem | `NEXUS_DEV` |
| PostgresqlDbSystem | `BARRAMENTO_DEV` |
| PostgresqlConfiguration | `postgresql20260218` |
| RedisCluster | `NEXUS_DEV` |

### Vault e secrets

| Tipo | Nome |
| --- | --- |
| Vault | `nexus-api-dev` |
| Key | `key-nexus-dev` |
| VaultSecret | `SC-nexus-dev` |
| VaultSecret | `SC-nexus-dev-ms-auth-external` |
| VaultSecret | `SC-nexus-dev-ms-auth-sso` |
| VaultSecret | `SC-nexus-dev-ms-belt` |
| VaultSecret | `SC-nexus-dev-ms-notify` |
| VaultSecret | `SC-nexus-dev-ms-parameter` |
| VaultSecret | `SC-nexus-dev-ms-person` |
| VaultSecret | `SC-nexus-dev-ms-poc` |
| VaultSecret | `SC-nexus-dev-ms-user` |
| VaultSecret | `SC-nexus-dev-observability` |

### Networking e runtime

| Tipo | Nome |
| --- | --- |
| ClustersCluster | `cls-dev-nexus` |
| ClustersCluster | `cls-dev-observabilidade` |
| LoadBalancer | `029cfee6-bf8a-4cfa-ba1f-465c1a519a98` |
| LoadBalancer | `177c06f0-5784-466f-b84a-32959d8222e9` |
| LoadBalancer | `1a0015b9-1b16-43ad-af98-22c79be63511` |
| LoadBalancer | `703a217f-4254-4c6f-af89-e425f77bd3c5` |
| LoadBalancer | `de91ec70-b73a-4fe2-8a28-38e17658b239` |
| PublicIp | `Floating IP for VIP public-vip on LB ocid1.loadbalancer.oc1.sa-saopaulo-1.aaaaaaaa4oguayfouzmhnpd76gthfqoy36kvsxidfrtl6tsd4owrkbkpctdq` |
| CustomerDnsZone | `381769df37fd-instance.tm3aozmydpsnsrhgvzd555llncd7aq.postgresql.sa-saopaulo-1.oci.oraclecloud.com` |
| CustomerDnsZone | `aaasks3yliahtyjjz22uc6rm2ytrrqodlmvg2mzrsdwgxwna4n65kvq-0.redis.sa-saopaulo-1.oci.oraclecloud.com` |
| CustomerDnsZone | `aaasks3yliahtyjjz22uc6rm2ytrrqodlmvg2mzrsdwgxwna4n65kvq-p.redis.sa-saopaulo-1.oci.oraclecloud.com` |
| CustomerDnsZone | `de758829cc23-instance.par43qssnhl2556qhibu4nkmqx5yhq.postgresql.sa-saopaulo-1.oci.oraclecloud.com` |
| CustomerDnsZone | `primary.par43qssnhl2556qhibu4nkmqx5yhq.postgresql.sa-saopaulo-1.oci.oraclecloud.com` |
| CustomerDnsZone | `primary.tm3aozmydpsnsrhgvzd555llncd7aq.postgresql.sa-saopaulo-1.oci.oraclecloud.com` |
| Volume | `csi-9624706d-2705-43a5-9a4d-8fd9337983e4` |

### Terraform e automacao

| Tipo | Nome |
| --- | --- |
| OrmStack | `export-cmp-dev-nexus` |
| OrmStack | `from-compartment-cmp-dev-nexus-20260226150151` |
| OrmStack | `from-compartment-cmp-dev-nexus-20260302142711` |
| OrmJob | `plan-job-20260226151804` |
| Policy | `objectstorage-lifecycle-policy` |

## Existe em teste e nao existe em dev

### Componentes especificos do teste

| Tipo | Nome |
| --- | --- |
| ClustersCluster | `cls-teste-nexus` |
| ClustersCluster | `cls-teste-observabilidade` |
| Vault | `nexus-api-teste` |
| Key | `key-nexus-teste` |

Observacao:

- O `teste` possui multiplos objetos de `Vault` e `Key` com o mesmo nome em estado `PENDING_DELETION`.
- Isso indica tentativas anteriores de recriacao ou limpeza parcial.

## Leitura Operacional

O que falta no `cmp-dev-nexus-teste` para se aproximar do `cmp-dev-nexus`:

1. Buckets de MFE e buckets de estado Terraform.
2. Secrets do Vault usados pelas aplicacoes Nexus.
3. Banco PostgreSQL, Autonomous Database e Redis.
4. Load balancers, zonas DNS e IP publico associados aos servicos expostos.
5. Objetos auxiliares de API/identidade e politicas locais.

## Recomendacao

Antes de tentar espelhar o `dev` no `teste`, validar:

1. Quais recursos devem realmente existir no `teste` e quais sao apenas artefatos temporarios do `dev`.
2. Se o ambiente `teste` deve replicar banco e cache completos ou somente clusters/servicos de execucao.
3. Se os `Vaults/Keys` em `PENDING_DELETION` devem ser removidos da analise ou limpos primeiro.

## Proximo Passo Sugerido

Gerar um plano de paridade em tres blocos:

1. `Obrigatorio`: Vault, secrets, buckets e bancos.
2. `Infra runtime`: OKE, load balancers e DNS.
3. `Opcional`: usuarios, apps, stacks ORM e artefatos de operacao.
