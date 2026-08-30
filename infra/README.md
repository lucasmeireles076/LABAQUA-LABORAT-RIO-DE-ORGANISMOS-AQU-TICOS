# Infraestrutura do site (Terraform)

Isso sobe o site estático da RESTAURAÇÃO (LabAqua) na AWS assim:

```
Visitante ──HTTPS──> CloudFront (+ WAF) ──OAC──> S3 (bucket privado)
```

- **S3**: guarda os arquivos do site (HTML/CSS/imagens/PDFs). Fica **privado**
  — sem "S3 Website Hosting" público e sem gateway/API na frente.
- **CloudFront**: CDN da AWS na frente do bucket, HTTPS, cache e distribuição
  global. É o único que enxerga o bucket (via Origin Access Control).
- **WAF (Web Application Firewall)**: associado ao CloudFront — bloqueia
  ataques comuns (regras gerenciadas da própria AWS) e limita quantas
  requisições um mesmo IP pode fazer em 5 minutos.
- **ACM + Route 53**: opcionais, só entram em ação se você configurar um
  domínio próprio (ex. `labaqua.ufma.br`) em vez de usar o endereço padrão
  do CloudFront.

Nenhum destes recursos foi criado ainda — este é só o código. Quem aplica
(`terraform apply`) precisa ter uma conta AWS e credenciais próprias.

---

## 1. Instalar as ferramentas (Windows)

```powershell
winget install Hashicorp.Terraform
winget install Amazon.AWSCLI
```

Feche e reabra o terminal depois, e confira:

```powershell
terraform -version
aws --version
```

## 2. Criar um usuário AWS para isso (recomendado)

Não use a conta root da AWS. No console AWS, crie um usuário IAM (ou peça
para quem administra a conta) com permissão para gerenciar: **S3,
CloudFront, WAFv2, ACM e Route 53** (só os 4 serviços usados aqui — evite
dar `AdministratorAccess` de vez).

Gere uma **Access Key** para esse usuário e rode:

```powershell
aws configure
```

Vai pedir: Access Key ID, Secret Access Key, região padrão (use `sa-east-1`)
e formato de saída (pode deixar `json`).

## 3. Configurar as variáveis do projeto

Dentro da pasta `infra/`:

```powershell
copy terraform.tfvars.example terraform.tfvars
```

Abra `terraform.tfvars` e ajuste:

- `project_name` — prefixo dos recursos (ex. `labaqua`).
- `domain_name` / `hosted_zone_id` — só preencha se já tiver domínio próprio
  e Hosted Zone no Route 53. Se o domínio for gerenciado fora da AWS (ex.
  registro.br), veja a seção **"Domínio próprio fora da AWS"** abaixo.

## 4. Criar a infraestrutura

```powershell
cd infra
terraform init
terraform plan
```

Revise o plano (ele mostra tudo que **será criado** — nada é aplicado
ainda). Se estiver de acordo:

```powershell
terraform apply
```

Confirme digitando `yes`. Isso demora de 5 a 15 minutos (CloudFront é lento
pra propagar por natureza).

⚠️ **Isso cria recursos reais e cobrados na sua conta AWS.** Ver seção de
custos abaixo antes de aplicar.

## 5. Publicar o site

Depois do `apply` bem-sucedido:

```powershell
bash deploy.sh
```

(Windows: rode pelo Git Bash, que já vem com este projeto/ambiente.)

O script sobe todos os arquivos do site para o S3 e invalida o cache do
CloudFront. Rode de novo sempre que atualizar qualquer página.

No fim ele imprime a URL final do site (`terraform output site_url`).

---

## Domínio próprio fora da AWS (ex. registro.br)

Se seu domínio **não** está no Route 53:

1. Deixe `hosted_zone_id` em branco e preencha só `domain_name`.
2. Rode `terraform apply` — ele cria o certificado ACM, mas fica
   **pendente de validação** (a distribution do CloudFront só é criada
   depois do certificado validado, então o primeiro apply pode falhar
   nesse ponto — é esperado).
3. No console da AWS (Certificate Manager, região **us-east-1**), copie o
   registro CNAME de validação que aparece.
4. Cadastre esse CNAME no painel do seu provedor de domínio (registro.br,
   etc.).
5. Espere a validação (minutos a poucas horas) e rode `terraform apply`
   de novo — agora ele completa e cria o CloudFront.
6. No seu provedor de domínio, aponte o domínio (CNAME ou o que ele
   chamar de "ALIAS"/"ANAME") para o valor do output
   `cloudfront_domain_name`.

## Custos aproximados (não é cobrança fixa, é por uso)

- **S3**: centavos de dólar por GB armazenado/mês — para um site desse
  tamanho, irrelevante.
- **CloudFront**: primeiros 1 TB de saída/mês costuma ficar na faixa de
  poucos dólares para tráfego baixo/médio (tem free tier de 1 TB/mês nos
  primeiros 12 meses de conta nova).
- **WAF**: ~US$ 5/mês de taxa fixa pelo Web ACL + ~US$ 1/mês por regra
  gerenciada (temos 3 regras) + uma fração de centavo por milhão de
  requisições. Total: geralmente US$ 8–10/mês.
- **ACM**: certificado é grátis quando usado com CloudFront.
- **Route 53**: ~US$ 0,50/mês por Hosted Zone (só se você usar).

Se o orçamento for zero, dá para setar `enable_waf = false` em
`terraform.tfvars` e reaplicar — o site continua no ar, só sem a camada de
WAF.

## Removendo tudo

```powershell
terraform destroy
```

Remove todos os recursos criados (o bucket S3 tem `force_destroy = true`,
então some junto mesmo com arquivos dentro — o conteúdo do site continua
seguro no seu repositório local).
