terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# Provider "principal": onde o bucket S3 é criado (região do Brasil).
provider "aws" {
  region = var.aws_region
}

# CloudFront, ACM (para o certificado usado pelo CloudFront) e WAF na scope
# CLOUDFRONT só podem ser criados/lidos a partir de us-east-1 — é uma
# exigência da AWS, não uma escolha deste projeto.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
