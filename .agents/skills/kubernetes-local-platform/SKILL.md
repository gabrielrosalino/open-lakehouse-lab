---
name: kubernetes-local-platform
description: Use this skill for changes involving kind, Kubernetes manifests, RBAC, Helm values, local services, MinIO, Polaris, Airflow deployment, Prometheus, or Grafana.
---

# Kubernetes Local Platform Skill

## Scope

Use this skill when working under:

```text
k8s/
docker/
airflow/
```

or when adding Makefile commands that deploy local platform components.

## Principles

- Keep the platform local-first and reproducible.
- Prefer plain manifests or documented Helm values.
- Use namespace `data-platform` for core services unless a stage specifies otherwise.
- Use namespace `monitoring` for Prometheus/Grafana when deployed via kube-prometheus-stack.
- Keep secrets local-development only and avoid committing real credentials.
- Add port-forward commands for developer access.

## Validation

Run or document:

```bash
make lint-yaml
make validate-k8s
```

When Dockerfiles change:

```bash
make lint-docker
make docker-build
```

## Manifest checklist

- Namespace is explicit.
- Resource names are consistent.
- Labels are meaningful.
- Services expose only what is needed locally.
- RBAC is least-privilege for the stage.
- Storage paths and environment variables are documented.

## Do not

- Do not commit kubeconfig files.
- Do not introduce cloud-specific Kubernetes dependencies.
- Do not expose services externally beyond local port-forward instructions.
