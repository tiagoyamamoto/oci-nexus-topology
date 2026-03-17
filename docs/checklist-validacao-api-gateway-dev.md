# Checklist de Validacao do API Gateway Dev

Data de referencia: `2026-03-16`

## Objetivo

Validar a mudanca aplicada no deployment `deploy-mfe-unified-dev` do `api-gateway-dev`, onde as rotas `/ms-*` do Nexus passaram de `10.110.135.3` para `10.110.143.54`, mantendo `ms-barramento` em `10.110.133.131`.

## Estado esperado

- Rotas Nexus no gateway apontando para `10.110.143.54`
- Rota `ms-barramento` apontando para `10.110.133.131`
- `ingress-nginx-controller` do `cls-dev-nexus` ativo em `10.110.143.54`
- Gateway `api-gateway-dev` ativo e acessivel a partir de uma maquina com acesso a VCN

## Pre-requisito

Executar os testes a partir de uma maquina com conectividade para a VCN onde o gateway privado esta publicado.

Gateway:

```text
https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com
```

## Testes do Gateway

### 1. Validar MFE

```powershell
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/mfe-shell/
```

Esperado:

- `200`, `301`, `302` ou outro retorno coerente de frontend
- sem timeout
- sem `502` ou `504`

### 2. Validar rotas Nexus

```powershell
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/ms-user/
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/ms-person/
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/ms-auth-external/
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/ms-auth-sso/
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/ms-parameters/
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/ms-poc/
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/ms-notify/
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/ms-belt/
```

Esperado:

- `2xx`, `3xx` ou `401/403` controlado
- sem timeout
- sem `502` ou `504`

### 3. Validar barramento

```powershell
curl.exe -k -I https://bqdgz22e5haqac4vdb54isxrqm.apigateway.sa-saopaulo-1.oci.customer-oci.com/ms-barramento/
```

Esperado:

- `2xx`, `3xx` ou `401/403` controlado
- sem timeout
- sem `502` ou `504`

## Testes diretos no ingress interno

Executar para confirmar que o LB interno `10.110.143.54` esta roteando pelos `Host` headers esperados:

```powershell
curl.exe -I -H "Host: ms-auth-external.dev-01.interno.invista.com.br" http://10.110.143.54/
curl.exe -I -H "Host: ms-belt.dev-01.interno.invista.com.br" http://10.110.143.54/
curl.exe -I -H "Host: ms-notify.dev-01.interno.invista.com.br" http://10.110.143.54/
curl.exe -I -H "Host: ms-user.dev.invista.com.br" http://10.110.143.54/
curl.exe -I -H "Host: ms-person.dev.invista.com.br" http://10.110.143.54/
curl.exe -I -H "Host: ms-auth-sso.dev.invista.com.br" http://10.110.143.54/
curl.exe -I -H "Host: ms-parameters.dev.invista.com.br" http://10.110.143.54/
curl.exe -I -H "Host: ms-poc.dev.invista.com.br" http://10.110.143.54/
```

Esperado:

- resposta HTTP coerente
- sem timeout
- sem `404` sistematico para todos os hosts

## Interpretacao rapida

- `200/204`: rota funcional
- `301/302`: rota funcional com redirect
- `401/403`: backend acessivel, mas protegido
- `404`: host nao roteado ou path inadequado
- `502/504`: problema entre gateway e backend
- timeout: problema de rede, NSG, subnet, LB ou backend indisponivel

## Evidencias ja confirmadas

- Deployment `deploy-mfe-unified-dev` atualizado com sucesso em `2026-03-16T20:24:46Z`
- Rotas `/ms-*` do Nexus agora apontam para `10.110.143.54`
- `ms-barramento` continua apontando para `10.110.133.131`
- `ingress-nginx-controller` do `cls-dev-nexus` segue ativo com IP `10.110.143.54`

## Observacao

Da maquina usada nesta analise, o gateway privado nao era acessivel diretamente. Portanto, a mudanca de configuracao foi validada, mas o teste funcional ponta a ponta precisa ser executado de dentro da rede com acesso a VCN.
