# Só existe se um domínio próprio for configurado (var.domain_name != "").
# O CloudFront exige que o certificado esteja em us-east-1, não importa em
# qual região o resto da infra vive — por isso o provider alias.
resource "aws_acm_certificate" "site" {
  count = var.domain_name != "" ? 1 : 0

  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Validação automática via Route 53 — só roda se você também informou
# hosted_zone_id (ou seja, o domínio é gerenciado dentro da própria AWS).
resource "aws_route53_record" "cert_validation" {
  for_each = var.domain_name != "" && var.hosted_zone_id != "" ? {
    for dvo in aws_acm_certificate.site[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "site" {
  count = var.domain_name != "" && var.hosted_zone_id != "" ? 1 : 0

  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}
