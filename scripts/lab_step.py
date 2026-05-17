"""Print educational explanations for Open Lakehouse Lab shortcuts."""

from __future__ import annotations

import argparse
from collections.abc import Iterable
from dataclasses import dataclass


@dataclass(frozen=True)
class LabStep:
    goal: str
    why: str
    run: tuple[str, ...]
    inspect: tuple[str, ...]
    next_step: str


STEPS: dict[str, LabStep] = {
    "cluster-create": LabStep(
        goal="Create the local kind Kubernetes cluster and the data-platform namespace.",
        why=(
            "The lab runs MinIO, Polaris, Airflow and dbt workloads as local "
            "Kubernetes resources, so every later step needs this cluster."
        ),
        run=(
            "kind create cluster --name open-lakehouse-lab --config k8s/kind/kind-config.yaml",
            "kubectl apply -f k8s/namespaces/data-platform.yaml",
        ),
        inspect=(
            "kubectl get nodes",
            "kubectl get namespace data-platform",
            "kubectl cluster-info --context kind-open-lakehouse-lab",
        ),
        next_step="Deploy MinIO with make deploy-minio.",
    ),
    "deploy-minio": LabStep(
        goal="Deploy MinIO and create the local lakehouse bucket.",
        why=(
            "MinIO is the local S3-compatible object store. The Raw Parquet files "
            "and Iceberg warehouse data are written under the lakehouse bucket."
        ),
        run=(
            "kubectl apply -f k8s/minio/secret.yaml",
            "kubectl apply -f k8s/minio/deployment.yaml",
            "kubectl apply -f k8s/minio/service.yaml",
            "kubectl apply -f k8s/minio/job-create-bucket.yaml",
        ),
        inspect=(
            "make minio-status",
            "make port-forward-minio",
            "open http://localhost:9001 and login with minioadmin / minioadmin123",
        ),
        next_step="Build and load the dbt image, then deploy Polaris.",
    ),
    "build-dbt-image": LabStep(
        goal="Build the dbt + DuckDB image used by Kubernetes workloads.",
        why=(
            "Airflow and fixture jobs run dbt in ephemeral pods, so kind must have "
            "a local image with dbt, dbt-duckdb and required DuckDB extensions."
        ),
        run=(
            "docker build -f docker/dbt-duckdb-polaris.Dockerfile "
            "-t open-lakehouse-lab-dbt-duckdb-polaris:local .",
        ),
        inspect=("docker images open-lakehouse-lab-dbt-duckdb-polaris:local",),
        next_step="Load the image into kind with make load-dbt-image.",
    ),
    "load-dbt-image": LabStep(
        goal="Load the local dbt image into the kind node.",
        why=(
            "kind runs its own container runtime. Loading the image lets pods use "
            "imagePullPolicy=Never without pulling from a registry."
        ),
        run=(
            "kind load docker-image open-lakehouse-lab-dbt-duckdb-polaris:local "
            "--name open-lakehouse-lab",
        ),
        inspect=("docker exec open-lakehouse-lab-control-plane crictl images | grep dbt",),
        next_step="Deploy Polaris with make deploy-polaris.",
    ),
    "deploy-polaris": LabStep(
        goal="Deploy Apache Polaris and bootstrap the lakehouse Iceberg catalog.",
        why=(
            "Polaris is the Iceberg REST Catalog. dbt + DuckDB uses it to publish "
            "Silver and Gold Iceberg tables backed by MinIO."
        ),
        run=(
            "export POLARIS_ROOT_CLIENT_ID=root",
            "export POLARIS_ROOT_CLIENT_SECRET=local-polaris-secret",
            "export POLARIS_MINIO_ACCESS_KEY=minioadmin",
            "export POLARIS_MINIO_SECRET_KEY=minioadmin123",
            "kubectl apply -f k8s/polaris/deployment.yaml",
            "kubectl apply -f k8s/polaris/service.yaml",
            "kubectl apply -f k8s/polaris/catalog-bootstrap-job.yaml",
        ),
        inspect=(
            "make polaris-status",
            "make polaris-health",
            "make port-forward-polaris",
        ),
        next_step="Publish the Raw fixture and deploy Airflow.",
    ),
    "publish-raw-fixture-parquet": LabStep(
        goal="Publish deterministic Raw Parquet fixture files to MinIO.",
        why=(
            "The fixture gives dbt a stable Raw dataset before real source adapters "
            "exist, keeping the backbone testable without external APIs."
        ),
        run=(
            "kubectl apply -f k8s/dbt/publish-raw-fixture-job.yaml",
            "dbt run-operation publish_raw_fixture_parquet --profiles-dir .",
        ),
        inspect=(
            "kubectl -n data-platform logs job/dbt-publish-raw-fixture",
            "kubectl -n data-platform run minio-list --rm -i --restart=Never "
            "--image=minio/mc:RELEASE.2025-04-16T18-13-26Z -- sh -c "
            "'mc alias set local http://minio:9000 minioadmin minioadmin123 "
            "&& mc find local/lakehouse/raw'",
        ),
        next_step="Run dbt locally or trigger the Airflow dbt DAG.",
    ),
    "deploy-airflow": LabStep(
        goal="Deploy Airflow in Kubernetes with permissions to launch workload pods.",
        why=(
            "Airflow is the orchestration surface. It schedules the example dbt "
            "pipeline and lets users study KubernetesPodOperator behavior."
        ),
        run=(
            "helm repo add apache-airflow https://airflow.apache.org --force-update",
            "kubectl apply -f k8s/airflow/pod-launcher-rbac.yaml",
            "kubectl apply -f k8s/airflow/dbt-workload-pvc.yaml",
            "helm upgrade --install airflow apache-airflow/airflow "
            "--namespace data-platform --values k8s/airflow/values.yaml",
        ),
        inspect=(
            "make airflow-status",
            "make port-forward-airflow",
            "open http://localhost:8080 and login with admin / admin",
        ),
        next_step="Trigger open_lakehouse_lab_daily with make trigger-airflow-dbt.",
    ),
    "trigger-airflow-dbt": LabStep(
        goal="Trigger the standard end-to-end dbt pipeline through Airflow.",
        why=(
            "This validates the backbone: Airflow creates dbt pods, dbt reads Raw "
            "Parquet from MinIO, DuckDB transforms data, and Polaris catalogs Iceberg tables."
        ),
        run=(
            "kubectl -n data-platform exec deployment/airflow-scheduler -- "
            "airflow dags trigger open_lakehouse_lab_daily",
        ),
        inspect=(
            "kubectl -n data-platform exec deployment/airflow-scheduler -- "
            "airflow dags list-runs open_lakehouse_lab_daily",
            "kubectl -n data-platform get pods -l app.kubernetes.io/component=dbt-workload",
            "kubectl -n data-platform logs job/dbt-publish-raw-fixture",
        ),
        next_step="Inspect Airflow, MinIO, Polaris and DuckDB outputs.",
    ),
    "lab-fast-path": LabStep(
        goal="Run the executable reference path for the whole local lab.",
        why=(
            "This is the fastest way to prove the standard example works before "
            "studying or customizing individual layers."
        ),
        run=(
            "make cluster-create",
            "make deploy-minio",
            "make build-dbt-image",
            "make load-dbt-image",
            "make deploy-polaris",
            "make publish-raw-fixture-parquet",
            "make build-airflow-image",
            "make load-airflow-image",
            "make deploy-airflow",
            "make trigger-airflow-dbt",
        ),
        inspect=(
            "make minio-status",
            "make polaris-health",
            "make airflow-status",
            "make airflow-dbt-pods",
        ),
        next_step="Open docs/learning-path.md and repeat each lesson manually.",
    ),
    "lab-learning-path": LabStep(
        goal="Follow the guided learning path one layer at a time.",
        why=(
            "The learning path shows the same architecture as lessons, including "
            "manual commands, shortcut equivalents, validation and troubleshooting."
        ),
        run=(
            "docs/lessons/01-local-kubernetes-kind.md",
            "docs/lessons/02-minio-raw-storage.md",
            "docs/lessons/03-polaris-iceberg-catalog.md",
            "docs/lessons/04-dbt-duckdb-transformations.md",
            "docs/lessons/05-airflow-kubernetes-pods.md",
            "docs/lessons/06-end-to-end-pipeline.md",
        ),
        inspect=(
            "make explain-cluster",
            "make explain-deploy-minio",
            "make explain-deploy-polaris",
            "make explain-deploy-airflow",
            "make explain-dbt-orchestration",
        ),
        next_step="Use docs/user-customization-guide.md to build your own pipeline.",
    ),
}


def print_lines(label: str, lines: Iterable[str]) -> None:
    for line in lines:
        print(f"[{label}] {line}")


def print_step(name: str) -> None:
    step = STEPS[name]
    print(f"[goal] {step.goal}")
    print(f"[why] {step.why}")
    print_lines("run", step.run)
    print_lines("inspect", step.inspect)
    print(f"[next] {step.next_step}")


def print_index() -> None:
    for name in sorted(STEPS):
        print(name)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Explain Open Lakehouse Lab shortcuts with educational logs."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    explain = subparsers.add_parser("explain", help="print the explanation for one lab step")
    explain.add_argument("step", choices=sorted(STEPS))

    subparsers.add_parser("list", help="list available lab steps")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "explain":
        print_step(args.step)
        return

    if args.command == "list":
        print_index()


if __name__ == "__main__":
    main()
