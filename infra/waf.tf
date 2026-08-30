# AWS WAF (WebACL) associado ao CloudFront — o "ws light"/proteção pedida
# pelo cliente. Usa só regras gerenciadas pela própria AWS (sem custo
# adicional de "regra customizada"), mais um limite de taxa por IP.
# scope = "CLOUDFRONT" só pode ser criado a partir de us-east-1.
resource "aws_wafv2_web_acl" "site" {
  count = var.enable_waf ? 1 : 0

  provider    = aws.us_east_1
  name        = "${var.project_name}-waf"
  description = "Protecao basica do site ${var.project_name} - regras gerenciadas AWS + rate limit."
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Conjunto de regras "Core" da AWS: cobre os ataques mais comuns
  # (XSS, LFI, etc.) sem precisar escrever regra nenhuma na mão.
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 0

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-common-rules"
      sampled_requests_enabled   = true
    }
  }

  # Bloqueia payloads conhecidos por explorar vulnerabilidades (SQLi, etc.).
  rule {
    name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-known-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  # Proteção de baixo custo contra abuso/scraping/DoS de pequena escala:
  # bloqueia um IP se ele passar de var.waf_rate_limit requisições em 5 min.
  rule {
    name     = "RateLimitPerIP"
    priority = 2

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = var.waf_rate_limit
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-waf"
    sampled_requests_enabled   = true
  }
}
