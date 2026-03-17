# Plano de Migracao para Centralizar Consumo na SBNT-DEV

Data de referencia: `2026-03-16`

## Objetivo

Centralizar a entrada e o consumo do ambiente DEV pela `SBNT-DEV` no `cmp-dev-inv`, usando o `api-gateway-dev` como ponto de entrada principal, reduzindo dependencia de exposicoes diretas da rede OKE `10.110.0.0/16`.

## Estado atual

- `api-gateway-dev`
  - VCN: `VCN-DEV`
  - Subnet: `SBNT-DEV`
  - IP: `10.6.0.181`
  - Tipo: `PRIVATE`
- OKE / ingress atual
  - VCN: `vcn-oke`
  - LB interno atual: `10.110.143.54`
  - LB publico atual: `137.131.236.202`
- DRG compartilhado existe entre as VCNs
- Gateway ja foi ajustado para consumir `10.110.143.54`
- Parte dos `Host` headers ja foi corrigida para os hosts internos reais

## Bloqueio atual identificado

A subnet `sbn-lb-1` (`10.110.128.0/20`) usa a route table `rt-public`, que hoje tem apenas:

- `0.0.0.0/0 -> Internet Gateway`

Nao existe rota de retorno para `10.6.0.0/24` ou `10.6.0.0/16` via `DRG`.

Impacto:

- `api-gateway-dev` tenta consumir `10.110.143.54`
- o LB recebe ou tenta receber o trafego
- a volta para `10.6.0.0/24` nao esta roteada corretamente
- resultado observado: `timeout` no gateway privado

## LBs na subnet `sbn-lb-1`

Atuais:

- `177c06f0-5784-466f-b84a-32959d8222e9`
  - IP: `10.110.143.54`
  - Funcao: ingress interno `cls-dev-nexus`
- `029cfee6-bf8a-4cfa-ba1f-465c1a519a98`
  - IP: `137.131.236.202`
  - Funcao: ingress publico `cls-dev-nexus`
- `703a217f-4254-4c6f-af89-e425f77bd3c5`
  - IP: `10.110.130.171`
  - Funcao: ArgoCD `cls-dev-nexus`
- `de91ec70-b73a-4fe2-8a28-38e17658b239`
  - IP: `10.110.139.53`
  - Funcao: ArgoCD `cls-dev-observabilidade`

Legados:

- `b104dc5e-2ee8-4bcd-bc39-d6172f0ea994` -> `10.110.133.240`
- `1c8526c9-9476-48c8-8144-fcab85deb1ce` -> `10.110.138.86`
- `7f147ae1-305f-434f-892b-45813d895b4d` -> `10.110.140.112`
- `5ebed1ad-84f7-48e7-a8cb-04952985c830` -> `10.110.130.160`

## Migracao - Onda 1

### Passo 1. Corrigir retorno de rede entre VCN-DEV e vcn-oke

Adicionar na route table `rt-public` da subnet `sbn-lb-1` uma rota:

- destino: `10.6.0.0/16`
- target: `DRG-Invista-Shared`

Opcao mais restrita:

- destino: `10.6.0.0/24`
- target: `DRG-Invista-Shared`

Observacao:

- essa mudanca impacta todos os LBs de `sbn-lb-1`
- o efeito esperado e permitir retorno correto para o `api-gateway-dev`

### Passo 2. Revalidar o gateway privado

Executar a checklist de validacao:

- [checklist-validacao-api-gateway-dev.md](C:/Dev/oci-nexus-topology/docs/checklist-validacao-api-gateway-dev.md)

Critério de sucesso:

- gateway privado deixa de dar `timeout`
- rotas internas passam a responder com `2xx`, `3xx`, `401` ou `403`

### Passo 3. Consolidar rotas internas corretas

Rotas que ja estao alinhadas ou parcialmente alinhadas ao ingress interno:

- `ms-auth-external`
- `ms-belt`
- `ms-person`
- `ms-poc`
- `ms-user`

Rotas ainda pendentes de definicao:

- `ms-auth-sso`
- `ms-notify`
- `ms-parameters`

Essas tres precisam de decisao explicita:

- publicar ingress interno dedicado
- ou manter caminho externo/atual temporariamente

## Migracao - Onda 2

### Passo 4. Definir topologia final por rota

Tabela alvo:

- rotas internas -> ingress interno `10.110.143.54`
- barramento -> backend proprio validado
- rotas publicas -> somente se ainda forem necessarias em DEV

### Passo 5. Reduzir exposicao direta da rede OKE

Depois de validar o gateway:

- revisar necessidade do LB publico `137.131.236.202`
- revisar necessidade dos LBs de ArgoCD
- remover apenas o que nao tiver dependencia operacional

## Migracao - Onda 3

### Passo 6. Planejar aposentadoria da rede OKE antiga

So iniciar quando:

- todo consumo passar por `SBNT-DEV`
- nao houver dependencia direta residual dos LBs antigos
- cluster e rede alvo substitutos estiverem provisionados

## Rollback

Se a Onda 1 falhar:

1. remover a rota nova da `rt-public`
2. restaurar o backend anterior do gateway, se necessario
3. manter os LBs atuais sem remocao

## Entregas ja executadas

- LB orfao `10.110.136.228` removido
- gateway ajustado para `10.110.143.54`
- `Host` headers corrigidos para:
  - `ms-person.dev-01.interno.invista.com.br`
  - `ms-poc.dev-01.interno.invista.com.br`
  - `ms-user.dev-01.interno.invista.com.br`
- checklist de validacao criada

## Proximo comando operacional recomendado

Antes de qualquer remocao adicional, executar a mudanca de rota na subnet `sbn-lb-1` e repetir os testes do gateway.
