---
name: observability-monitoring
description: Use this skill for Prometheus, Grafana, kube-prometheus-stack, Airflow metrics, pipeline metrics, Iceberg health metrics, and operational observability.
---

# Observability Monitoring Skill

## Scope

Use this skill when working under:

```text
k8s/monitoring/
metadata/
scripts/
airflow/
```

or when changing metrics, alerts, Prometheus, Grafana or operational health checks.

## Observability boundaries

Prometheus and Grafana are for operational observability, not business/product dashboards.

Monitor:

- Kubernetes pod health;
- container restarts;
- CPU and memory;
- Airflow DAG and task status;
- pipeline duration;
- records ingested and rejected;
- source freshness;
- Iceberg snapshot and table health;
- MinIO and Polaris availability.

## Preferred components

- kube-prometheus-stack;
- Prometheus;
- Grafana;
- kube-state-metrics;
- Node Exporter;
- StatsD Exporter for Airflow metrics.

## Metric design

Prefer low-cardinality labels:

- `source`;
- `dataset`;
- `layer`;
- `table`;
- `status`.

Avoid high-cardinality labels such as full file paths, raw error messages or run-specific UUIDs in Prometheus metrics.

## Validation

Run or document:

```bash
make lint-yaml
make validate-k8s
```

When dashboards or rules are added, document how to port-forward and inspect them.

## Do not

- Do not add SaaS observability dependencies.
- Do not expose local services publicly.
- Do not store Grafana admin passwords as real credentials in git.
