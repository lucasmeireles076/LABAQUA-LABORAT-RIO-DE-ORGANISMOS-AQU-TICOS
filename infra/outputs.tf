output "s3_bucket_name" {
  description = "Nome do bucket S3 — usado pelo deploy.sh para subir os arquivos do site."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "ID da distribution — usado pelo deploy.sh para invalidar o cache após cada atualização do site."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "Domínio padrão do CloudFront (ex.: d111111abcdef8.cloudfront.net). Se não usar domínio próprio, é o endereço final do site."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "route53_name_servers" {
  description = <<-EOT
    Nameservers da Hosted Zone criada no Route 53 (só existe se
    manage_dns_in_route53 = true). Cadastre estes 4 valores como
    nameservers do domínio no painel do registro.br para migrar o DNS
    para a AWS.
  EOT
  value       = var.manage_dns_in_route53 ? aws_route53_zone.site[0].name_servers : []
}

output "site_url" {
  description = "URL final do site (domínio próprio se configurado, senão o domínio do CloudFront)."
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"
}
