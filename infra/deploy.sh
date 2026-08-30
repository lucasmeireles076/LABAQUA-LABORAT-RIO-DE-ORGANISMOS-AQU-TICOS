#!/usr/bin/env bash
# Sobe o conteúdo atual do site para o S3 e invalida o cache do CloudFront.
# Rode depois de "terraform apply" (e sempre que atualizar o site).
#
# uso: ./deploy.sh   (execute de dentro da pasta infra/)
set -euo pipefail

cd "$(dirname "$0")"

BUCKET=$(terraform output -raw s3_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
SITE_DIR="../"

echo "Bucket:        $BUCKET"
echo "Distribution:  $DISTRIBUTION_ID"
echo

echo "Enviando arquivos do site para o S3..."
aws s3 sync "$SITE_DIR" "s3://$BUCKET" \
  --delete \
  --exclude "infra/*" \
  --exclude ".git/*" \
  --exclude ".claude/*" \
  --exclude "*.tf" \
  --exclude "*.tfvars*"

echo
echo "Invalidando cache do CloudFront (pode levar alguns minutos para propagar)..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" > /dev/null

echo
echo "Pronto. Site publicado em:"
terraform output -raw site_url
echo
