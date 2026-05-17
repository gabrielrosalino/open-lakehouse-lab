# Lesson 02 - MinIO Raw storage

## Goal

Subir o object storage local e entender onde a Raw Parquet fica armazenada.

## Shortcut

```bash
make deploy-minio
```

Para estudar o atalho:

```bash
make explain-deploy-minio
```

## Manual Commands

```bash
kubectl apply -f k8s/minio/secret.yaml
kubectl apply -f k8s/minio/deployment.yaml
kubectl apply -f k8s/minio/service.yaml
kubectl -n data-platform rollout status deployment/minio --timeout=180s
kubectl -n data-platform delete job minio-create-bucket --ignore-not-found
kubectl apply -f k8s/minio/job-create-bucket.yaml
kubectl -n data-platform wait --for=condition=complete job/minio-create-bucket --timeout=180s
```

## What Happens

- O `Secret` cria credenciais locais de desenvolvimento.
- O `Deployment` inicia o servidor MinIO.
- O `Service` expoe as portas internas `9000` e `9001`.
- O job `minio-create-bucket` cria o bucket `lakehouse`.

## Inspect

```bash
make minio-status
kubectl -n data-platform logs job/minio-create-bucket
```

Para abrir a UI:

```bash
make port-forward-minio
```

Use `http://localhost:9001` com `minioadmin / minioadmin123`.

## Raw Path

O contrato Raw canonico inicial usa:

```text
s3://lakehouse/raw/source=<source>/dataset=<dataset>/ingestion_date=YYYY-MM-DD/*.parquet
```

Publique a fixture deterministica:

```bash
make publish-raw-fixture-parquet
```

Liste os arquivos:

```bash
kubectl -n data-platform run minio-list --rm -i --restart=Never \
  --image=minio/mc:RELEASE.2025-04-16T18-13-26Z \
  -- sh -c 'mc alias set local http://minio:9000 minioadmin minioadmin123 && mc find local/lakehouse/raw'
```

## Customize

Para estudar novos dados, grave Parquet sob `lakehouse/raw/` seguindo o contrato
de paths e colunas descrito em `docs/user-customization-guide.md`.

