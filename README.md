# open-lakehouse-lab

Open Lakehouse Lab is a 100% open source study project for modern data lakehouse engineering.

## Fast Path

Use o Fast Path para subir o caminho padrao do laboratorio em um ambiente local.
O comando imprime o objetivo, o motivo, os comandos executados e as inspecoes
recomendadas para cada etapa.

```bash
make lab-fast-path
```

Esse caminho cria o cluster kind, sobe MinIO, Polaris e Airflow, publica uma
fixture Raw em Parquet, dispara a DAG principal e valida a coluna dorsal:

```text
MinIO Raw Parquet -> dbt + DuckDB -> Polaris/Iceberg -> Airflow Kubernetes pods
```

## Learning Path

Use o Learning Path para estudar cada camada passo a passo antes de customizar o
pipeline.

```bash
make lab-learning-path
```

Documentacao principal:

- `docs/learning-path.md`: trilha guiada, Fast Path, Learning Path e interfaces;
- `docs/user-customization-guide.md`: como criar pipelines proprios;
- `docs/troubleshooting/guided-troubleshooting.md`: erros comuns e recuperacao;
- `docs/lessons/`: licoes incrementais do cluster ao pipeline ponta a ponta.

Os atalhos tambem podem ser explicados sem alterar o ambiente:

```bash
make explain-cluster
make explain-deploy-minio
make explain-deploy-polaris
make explain-deploy-airflow
make explain-dbt-orchestration
```

## Project structure

The Stage 01 layout separates the local lakehouse into explicit implementation areas:

```text
airflow/              Astro CLI Airflow project scaffold.
airflow/dags/         Airflow DAG definitions.
ingestion/common/     Shared ingestion utilities.
ingestion/open_meteo/ Open-Meteo extractor code.
ingestion/usgs/       USGS earthquake extractor code.
ingestion/bcb/        Banco Central do Brasil SGS extractor code.
dbt/                  dbt Core project initialized with dbt init.
dbt/models/           Raw source, staging, Silver, intermediate and marts models.
docker/               Local runtime Dockerfiles.
k8s/                  kind, MinIO, Polaris, Airflow, monitoring and RBAC manifests.
metadata/             Pipeline, quality, catalog, Iceberg and freshness artifacts.
docs/adr/             Architecture decision records.
docs/runbooks/        Operational runbooks.
docs/architecture/    Architecture documentation.
docs/lessons/         Guided learning lessons.
docs/troubleshooting/ Guided troubleshooting docs.
```

The Airflow scaffold is managed with Astro CLI. The Airflow runtime requirements include Astronomer Cosmos with the dbt DuckDB extra so later stages can orchestrate dbt models from Airflow without hand-wiring each model as a custom task.

## Implementation order

The lakehouse foundation is intentionally implemented before concrete source
adapters. The current architectural order is:

```text
MinIO -> Polaris -> Airflow -> dbt + DuckDB + Polaris -> Raw contract
  -> generic source adapters -> public API adapters -> Silver -> Gold
```

This keeps the core lakehouse independent from Open-Meteo, USGS, Banco Central
or any other specific source. Source adapters write to a generic Raw contract
that dbt can consume, and the dbt foundation must compile with local fixtures
before real ingestion is required.

## Local Kubernetes cluster

Stage 02 provisions a local kind cluster and the base `data-platform` namespace.
See `docs/runbooks/local-kind-cluster.md` for prerequisites, lifecycle commands
and validation steps.

## Local Object Storage

Stage 03 deploys MinIO in the local Kubernetes cluster and initializes the
`lakehouse` bucket. See `docs/runbooks/minio-object-storage.md` for deployment,
port-forward and path conventions.

## Local Iceberg REST Catalog

Stage 04 deploys Apache Polaris as the local Iceberg REST Catalog and bootstraps
the `lakehouse` catalog backed by the MinIO warehouse path.
See `docs/runbooks/polaris-rest-catalog.md` for credentials, deployment,
health checks and endpoint conventions.

## Local Airflow Orchestration

Stage 05 deploys Airflow with the Apache Airflow Helm chart and validates
`KubernetesPodOperator` pod launching in the local `data-platform` namespace.
See `docs/runbooks/airflow-kubernetes-pod-operator.md` for image build, deploy,
UI access and smoke DAG validation steps.

Stage 12 adds the main `open_lakehouse_lab_daily` DAG. It runs dbt workloads in
ephemeral Kubernetes pods using the local `dbt + duckdb` image and keeps the
DuckDB target state in a small local PVC. See
`docs/runbooks/airflow-dbt-orchestration.md` for the full local test flow.

Stage 14 adds didactic DAGs named `airflow/dags/lab_*.py` so users can explore
Airflow features such as `KubernetesPodOperator`, params and retries without
changing the stable example DAG.

## dbt + DuckDB foundation

Stage 08 configures dbt with DuckDB and prepares integration points for Apache
Polaris and Apache Iceberg without depending on public API ingestion. See
`docs/runbooks/dbt-duckdb-polaris.md` for the generic Raw contract, dbt commands,
Docker runtime and known limitations.

## Silver layer

Stage 10 builds generic Silver dbt models from the canonical staging contract.
The Silver layer currently provides deduplicated source events, metric
observations and dataset freshness metrics without depending on public API
adapters. See `docs/runbooks/silver-layer.md` for execution and validation.

Stage 13 connects the dbt/DuckDB backbone to MinIO and Polaris so the example
path can read Raw Parquet and publish Iceberg tables locally. Stage 14 explains
that path through guided docs and explainable shortcuts.

## Local interfaces

MinIO:

```bash
make port-forward-minio
```

Open `http://localhost:9001` with `minioadmin / minioadmin123`.

Airflow:

```bash
make port-forward-airflow
```

Open `http://localhost:8080` with `admin / admin`.

Polaris health API:

```bash
make port-forward-polaris
curl -fsS http://localhost:8182/q/health/ready
```

dbt is used through the CLI and Airflow logs. DuckDB can be opened with:

```bash
duckdb dbt/target/open_lakehouse_lab.duckdb
```

## Development quality checks

Install development dependencies:

```bash
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
```

Install Git hooks:

```bash
pre-commit install --install-hooks
pre-commit install --hook-type pre-push
```

Run the same checks used by GitHub Actions:

```bash
make ci-pr
```

Run the pre-push check manually:

```bash
make pre-push
```

The initial quality gate includes:

- Python lint with Ruff;
- Python tests with pytest, when `tests/` exists;
- YAML lint with yamllint;
- dbt/SQL checks with SQLFluff, when `dbt/` exists;
- dbt parse and compile, when `dbt/` exists;
- Kubernetes manifest validation with kubeconform, when `k8s/` exists;
- Dockerfile lint with Hadolint, when Dockerfiles exist;
- security checks with Bandit and optional Trivy;
- documentation structure check.
