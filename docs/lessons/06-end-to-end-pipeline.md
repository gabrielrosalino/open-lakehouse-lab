# Lesson 06 - End-to-end pipeline

## Goal

Executar o caminho completo do laboratorio: Raw Parquet no MinIO, dbt + DuckDB,
Iceberg via Polaris e orquestracao pelo Airflow.

## Fast Path

```bash
make lab-fast-path
```

Esse comando e ideal para uma primeira validacao em um ambiente limpo.

## Step-by-Step Path

```bash
make cluster-create
make deploy-minio
make build-dbt-image
make load-dbt-image
make deploy-polaris
make polaris-health
make publish-raw-fixture-parquet
make build-airflow-image
make load-airflow-image
make deploy-airflow
make trigger-airflow-dbt
```

## Inspect

Kubernetes:

```bash
make cluster-status
kubectl -n data-platform get pods
```

MinIO:

```bash
make port-forward-minio
```

Abra `http://localhost:9001` e confira `lakehouse/raw`.

Polaris:

```bash
make polaris-health
```

Airflow:

```bash
make port-forward-airflow
```

Abra `http://localhost:8080`, confira a DAG `open_lakehouse_lab_daily` e veja os
logs das tasks.

CLI Airflow:

```bash
kubectl -n data-platform exec deployment/airflow-scheduler -- \
  airflow dags list-runs open_lakehouse_lab_daily
```

DuckDB:

```bash
duckdb dbt/target/open_lakehouse_lab.duckdb
```

```sql
show schemas;
select count(*) from main_raw_sources.generic_raw_contract;
select count(*) from main_staging.stg_raw_source_events;
```

## Customize

Depois que o exemplo funcionar:

1. adicione novos Parquet na Raw;
2. crie modelos dbt de staging e Silver;
3. crie marts quando precisar de tabelas finais;
4. rode `make dbt-compile` e testes dbt;
5. use Airflow apenas para orquestrar novas etapas ou mudar agenda.

