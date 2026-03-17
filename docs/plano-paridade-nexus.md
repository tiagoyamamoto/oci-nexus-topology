# Plano de Paridade OCI Nexus

Este plano descreve as etapas necessárias para equalizar o compartment `cmp-dev-nexus-teste` com o ambiente produtivo/desenvolvimento `cmp-dev-nexus`.

## Bloco 1: Infraestrutura de Base e Dados (Obrigatório)

Este bloco foca em recursos que são dependências diretas para o funcionamento das aplicações.

### 1.1 Object Storage (Buckets)
- Replicar os buckets de Micro-Frontend (MFE):
    - `mfe-auth-dev`
    - `mfe-formalization-dev`
    - `mfe-person-dev`
    - `mfe-poc-dev`
    - `mfe-shell-dev`
    - `mfe-user-dev`
- Criar buckets para estado do Terraform (`tfstate-*`).

### 1.2 Segurança (Vault & Secrets)
- O compartment de teste possui Vaults/Keys em estado `PENDING_DELETION`. É necessário:
    - Aguardar a limpeza ou provisionar novos.
    - Replicar as secrets (`SC-nexus-dev-*`) no novo Vault do teste.
    - Garantir que as chaves de criptografia (`Key`) estejam pareadas.

### 1.3 Bancos de Dados e Cache
- Provisionar instâncias equivalentes:
    - **PostgreSQL**: `NEXUS_TESTE` e `BARRAMENTO_TESTE`.
    - **Redis**: `NEXUS_TESTE`.
    - **Autonomous Database**: Versão de teste do `nexus-dev`.

## Bloco 2: Runtime e Conectividade (Infra de Execução)

Focado em disponibilizar as aplicações para acesso.

### 2.1 Clusters OKE
- Validar se os clusters `cls-teste-nexus` e `cls-teste-observabilidade` já estão operacionais.
- Configurar node pools condizentes com a carga de teste.

### 2.2 Networking (LB, DNS, IP)
- Criar Load Balancers para os serviços expostos.
- Registrar as zonas DNS correspondentes no OCI DNS.
- Associar IPs públicos reservados, se necessário.

## Bloco 3: Artefatos de Operação e Identidade (Opcional/Gestão)

Recursos para controle e automação.

### 3.1 Identidade
- Replicar usuários técnicos ou políticas de acesso se houver segregação necessária.

### 3.2 Automação (ORM Stacks)
- Criar Stacks no Resource Manager para o ambiente de teste, permitindo a gestão via IaC de forma independente.

## Próximos Passos
1. Aprovação deste plano.
2. Execução via Terraform (ORM) ou Console.
3. Validação de conectividade entre as camadas.
