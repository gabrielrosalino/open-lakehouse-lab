# Guided troubleshooting

Use este guia quando o caminho padrao falhar. A primeira regra e sempre
inspecionar o recurso que acabou de ser criado antes de avancar.

## kind cluster already exists

Symptom:

```text
ERROR: failed to create cluster: node(s) already exist
```

Check:

```bash
kind get clusters
kubectl config current-context
```

Recover:

```bash
make cluster-status
```

Se quiser recomecar do zero:

```bash
make cluster-delete
make cluster-create
```

## Docker is not running

Symptom:

```text
Cannot connect to the Docker daemon
```

Check:

```bash
docker ps
```

Recover:

1. abra o Docker Desktop ou inicie o daemon local;
2. rode novamente o comando que falhou;
3. valide com `make cluster-status`.

## MinIO UI does not open

Symptom:

```text
localhost:9001 does not load
```

Check:

```bash
make minio-status
```

Recover:

```bash
make port-forward-minio
```

Abra `http://localhost:9001` em outra aba. Se a porta estiver ocupada, encerre o
processo antigo de port-forward e rode o comando novamente.

## Raw fixture job times out

Symptom:

```text
timed out waiting for the condition on jobs/dbt-publish-raw-fixture
```

Check:

```bash
kubectl -n data-platform get pods -l job-name=dbt-publish-raw-fixture
kubectl -n data-platform logs job/dbt-publish-raw-fixture
kubectl -n data-platform describe job dbt-publish-raw-fixture
```

Likely causes:

- a imagem dbt nao foi carregada no kind;
- MinIO ou Polaris ainda nao esta pronto;
- credenciais locais nao batem com o secret esperado;
- alguma extensao DuckDB tentou escrever em um filesystem somente leitura.

Recover:

```bash
make build-dbt-image
make load-dbt-image
make minio-status
make polaris-health
make publish-raw-fixture-parquet
```

## Polaris health is down

Symptom:

```text
curl: (22) The requested URL returned error
```

Check:

```bash
make polaris-status
kubectl -n data-platform logs deployment/polaris
kubectl -n data-platform logs job/polaris-bootstrap-catalog
```

Recover:

```bash
make deploy-polaris
make polaris-health
```

O erro HTTP `409` no job de bootstrap pode ser aceitavel quando o catalogo
`lakehouse` ja existe.

## Airflow UI returns CSRF error

Symptom:

```text
Bad Request - The CSRF session token is missing.
```

Check:

```bash
make airflow-status
```

Recover:

1. pare o `make port-forward-airflow`;
2. limpe cookies/sessao de `localhost:8080` ou use janela anonima;
3. rode `make port-forward-airflow`;
4. acesse `http://localhost:8080` novamente.

## Airflow DAG run failed

Check DAG runs:

```bash
kubectl -n data-platform exec deployment/airflow-scheduler -- \
  airflow dags list-runs open_lakehouse_lab_daily
```

Check task states:

```bash
kubectl -n data-platform exec deployment/airflow-scheduler -- \
  airflow tasks states-for-dag-run open_lakehouse_lab_daily "<run_id>"
```

Check dbt workload pods:

```bash
make airflow-dbt-pods
kubectl -n data-platform get pods -l app.kubernetes.io/component=dbt-workload
```

Common recoveries:

```bash
make build-dbt-image
make load-dbt-image
make deploy-airflow
make trigger-airflow-dbt
```

## DuckDB database is locked

Symptom:

```text
Could not set lock on file dbt/target/open_lakehouse_lab.duckdb
```

Cause:

Another DuckDB CLI, DuckDB UI or dbt process is using the same file.

Recover:

1. close the DuckDB CLI/UI tab using the database;
2. rerun the dbt command;
3. if inspecting while dbt runs, open a copy of the database file instead.

## DuckDB schema does not exist

Symptom:

```text
Catalog or schema does not exist
```

Check:

```sql
show schemas;
```

Use the `database_name` and `schema_name` returned by DuckDB. If the file was
attached as `lab`, query with:

```sql
select * from lab.main_raw_sources.generic_raw_contract limit 10;
```

If the file was opened directly, this is usually enough:

```sql
select * from main_raw_sources.generic_raw_contract limit 10;
```

