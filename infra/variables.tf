variable "project_name" {
  description = "Prefixo usado no nome dos recursos (bucket, WAF, etc.)."
  type        = string
  default     = "labaqua"
}

variable "aws_region" {
  description = "Região AWS onde o bucket S3 é criado (o CloudFront é global)."
  type        = string
  default     = "sa-east-1" # São Paulo
}

variable "domain_name" {
  description = <<-EOT
    Domínio customizado do site (ex.: "labaqua.ufma.br"). Deixe em branco
    ("") para usar apenas o domínio padrão do CloudFront
    (algo como d111111abcdef8.cloudfront.net) — nesse caso nenhum
    certificado ACM nem registro Route 53 é criado.
  EOT
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = <<-EOT
    ID da Hosted Zone no Route 53 que já contém (ou vai conter) o domínio
    acima. Obrigatório só se "domain_name" for preenchido. Se o domínio for
    gerenciado fora da AWS (ex.: registro.br sem Route 53), deixe em branco
    e aponte um CNAME/ALIAS manualmente no seu provedor de DNS para o
    domínio do CloudFront (ver output "cloudfront_domain_name").
  EOT
  type        = string
  default     = ""
}

variable "price_class" {
  description = <<-EOT
    Cobertura de edge locations do CloudFront:
      PriceClass_100 -> EUA, Canadá, Europa (mais barato)
      PriceClass_200 -> PriceClass_100 + América do Sul, Ásia, Oriente Médio
      PriceClass_All -> todas as edge locations do mundo
    Para um público majoritariamente no Brasil, PriceClass_200 é o menor
    nível que já inclui edges na América do Sul.
  EOT
  type        = string
  default     = "PriceClass_200"
}

variable "enable_waf" {
  description = "Se true, cria um AWS WAF (WebACL) e associa ao CloudFront."
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "Máximo de requisições por IP a cada 5 minutos antes do WAF bloquear (proteção básica contra abuso/DoS de baixo volume)."
  type        = number
  default     = 2000
}
