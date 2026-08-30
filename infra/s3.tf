# Sufixo aleatório para garantir que o nome do bucket seja único globalmente
# (nomes de bucket S3 competem com o mundo inteiro, não só sua conta).
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "aws_s3_bucket" "site" {
  bucket = "${var.project_name}-site-${random_string.suffix.result}"

  # Permite "terraform destroy" remover o bucket mesmo com arquivos dentro.
  # O conteúdo é só o site estático (também versionado no repositório),
  # então não há risco de perda de dado único.
  force_destroy = true
}

# Sem "gateway" e sem hospedagem pública de website no S3: o bucket fica
# 100% privado. Só o CloudFront (via Origin Access Control, abaixo) tem
# permissão para ler os objetos. Os 4 bloqueios ficam "true" — a policy
# abaixo concede acesso a um Service Principal específico (CloudFront),
# não a "*"/público, então o Block Public Access não a afeta.
resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Política do bucket: só a distribution do CloudFront abaixo pode fazer
# GetObject (amarrado via aws:SourceArn — nenhum outro CloudFront, nem
# acesso público direto ao S3, consegue ler os arquivos).
data "aws_iam_policy_document" "site" {
  statement {
    sid       = "AllowCloudFrontServicePrincipalReadOnly"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site.json
}
