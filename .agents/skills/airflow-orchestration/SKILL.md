---
name: airflow-orchestration
description: Use this skill for Airflow DAGs, KubernetesPodOperator tasks, orchestration dependencies, scheduling, retries, task metadata, and pipeline execution design.
---

# Airflow Orchestration Skill

## Scope

Use this skill when working under:

```text
airflow/
ingestion/
dbt/
k8s/airflow/
```

or when changing DAG dependencies or task execution behavior.

## DAG principles

- Keep DAGs small, explicit and stage-aligned.
- Use `KubernetesPodOperator` for workload execution.
- Prefer pods that are stateless and write persistent outputs to MinIO or Iceberg tables.
- Use clear task ids, such as `extract_open_meteo`, `dbt_run_staging_silver` and `collect_iceberg_metadata`.
- Add retries for external API tasks.
- Keep schedule definitions explicit and documented.
- Avoid hidden side effects between tasks.

## Expected main flow

```text
extract APIs
  -> dbt staging and silver
  -> dbt intermediate and gold
  -> collect metadata
  -> publish operational metrics
```

## Validation

When possible, validate DAG imports and syntax before proposing completion.

Useful checks:

```bash
python -m compileall airflow
make lint-python
```

## Operational metadata

Pipeline tasks should record or enable collection of:

- run id;
- source;
- task status;
- start and finish timestamps;
- duration;
- records ingested;
- records rejected;
- error message when applicable.

## Do not

- Do not run long-lived business logic inside the Airflow scheduler or webserver.
- Do not store data in Airflow local disk as the system of record.
- Do not add cloud-only operators in the MVP.
