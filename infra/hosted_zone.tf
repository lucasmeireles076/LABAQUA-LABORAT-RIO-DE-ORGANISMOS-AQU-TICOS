# Só criada se "manage_dns_in_route53 = true" — nesse modo a AWS passa a
# ser a fonte de verdade do DNS do domínio (registro.br deixa de ser usado
# pra DNS, só continua como registrador). Depois do apply, troque os
# nameservers do domínio no registro.br pelos 4 valores do output
# "route53_name_servers".
resource "aws_route53_zone" "site" {
  count = var.domain_name != "" && var.manage_dns_in_route53 ? 1 : 0

  name = var.domain_name
}

# "has_hosted_zone" só depende de variáveis (não de atributos de recurso),
# então pode ser usado com segurança em count/for_each — diferente de
# "hosted_zone_id", cujo valor (quando vem da zona recém-criada) só é
# conhecido depois do apply.
locals {
  has_hosted_zone = var.manage_dns_in_route53 || var.hosted_zone_id != ""
  hosted_zone_id  = var.manage_dns_in_route53 ? try(aws_route53_zone.site[0].zone_id, "") : var.hosted_zone_id
}

# Registros "sem e-mail" (MX nulo + SPF -all) — mantêm o mesmo comportamento
# que o registro.br já publicava por padrão (domínio não envia/recebe
# e-mail), evitando abrir brecha de spoofing só por causa da migração de
# DNS. Só faz sentido enquanto o domínio realmente não tiver e-mail próprio.
resource "aws_route53_record" "no_mail_mx" {
  count = var.domain_name != "" && var.manage_dns_in_route53 ? 1 : 0

  zone_id = local.hosted_zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = 3600
  records = ["0 ."]
}

resource "aws_route53_record" "no_mail_spf" {
  count = var.domain_name != "" && var.manage_dns_in_route53 ? 1 : 0

  zone_id = local.hosted_zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 3600
  records = ["v=spf1 -all"]
}
