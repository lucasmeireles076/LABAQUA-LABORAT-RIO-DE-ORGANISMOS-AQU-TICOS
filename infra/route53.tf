# Só criados se o domínio for gerenciado dentro do Route 53 — via zona
# própria (manage_dns_in_route53 = true) ou uma hosted zone existente
# informada em "hosted_zone_id". Se o domínio estiver em outro provedor
# (ex.: registro.br sem migrar o DNS), aponte manualmente um CNAME/ALIAS
# para o valor do output "cloudfront_domain_name" — ver README.md.
resource "aws_route53_record" "site" {
  count = var.domain_name != "" && local.has_hosted_zone ? 1 : 0

  zone_id = local.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "site_www" {
  count = var.domain_name != "" && local.has_hosted_zone ? 1 : 0

  zone_id = local.hosted_zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
