# Só criado se o domínio for gerenciado dentro do Route 53 (hosted_zone_id
# preenchido). Se o domínio estiver em outro provedor (ex.: registro.br),
# aponte manualmente um CNAME/ALIAS para o valor do output
# "cloudfront_domain_name" — ver README.md.
resource "aws_route53_record" "site" {
  count = var.domain_name != "" && var.hosted_zone_id != "" ? 1 : 0

  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
