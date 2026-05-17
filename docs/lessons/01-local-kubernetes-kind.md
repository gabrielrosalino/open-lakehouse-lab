# Lesson 01 - Local Kubernetes with kind

## Goal

Criar o cluster Kubernetes local que recebe todos os servicos do laboratorio.

## Shortcut

```bash
make cluster-create
```

Para ver o que o atalho faz antes de executar:

```bash
make explain-cluster
```

## Manual Commands

```bash
kind create cluster --name open-lakehouse-lab --config k8s/kind/kind-config.yaml
kubectl apply -f k8s/namespaces/data-platform.yaml
```

## What Happens

- `kind` cria um cluster Kubernetes dentro do Docker local.
- `k8s/kind/kind-config.yaml` define a configuracao do cluster.
- `data-platform` e o namespace usado por MinIO, Polaris, Airflow e workloads dbt.

## Inspect

```bash
kubectl get nodes
kubectl get namespace data-platform
kubectl cluster-info --context kind-open-lakehouse-lab
```

## Customize

Edite `k8s/kind/kind-config.yaml` somente quando quiser estudar configuracoes do
cluster local, como portas expostas, versao da imagem do node ou mounts.

## Cleanup

```bash
make cluster-delete
```

