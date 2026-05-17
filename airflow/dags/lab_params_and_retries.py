"""Educational DAG showing Airflow params and retries."""

# ruff: noqa: I001

from __future__ import annotations

from datetime import timedelta

import pendulum

try:
    from airflow.sdk import DAG
except ImportError:  # pragma: no cover - Airflow 2 compatibility.
    from airflow import DAG
try:
    from airflow.providers.standard.operators.bash import BashOperator
except ImportError:  # pragma: no cover - Airflow 2 compatibility.
    from airflow.operators.bash import BashOperator


with DAG(
    dag_id="lab_params_and_retries",
    description="Study DAG params, task retries and templated commands.",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    params={
        "source": "fixture",
        "dataset": "generic_raw_contract",
        "ingestion_date": "2026-01-01",
    },
    tags=["open-lakehouse-lab", "stage-14", "learning", "params"],
) as dag:
    BashOperator(
        task_id="print_runtime_params",
        bash_command=(
            "echo '[goal] inspect runtime params'; "
            "echo 'source={{ params.source }}'; "
            "echo 'dataset={{ params.dataset }}'; "
            "echo 'ingestion_date={{ params.ingestion_date }}'; "
            "echo '[why] params let the same DAG run with different inputs'"
        ),
        retries=2,
        retry_delay=timedelta(minutes=1),
    )
