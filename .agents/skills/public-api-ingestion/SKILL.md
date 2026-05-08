---
name: public-api-ingestion
description: Use this skill for Python extractors that consume public APIs, write Raw data to MinIO, handle retries, and record ingestion metadata.
---

# Public API Ingestion Skill

## Scope

Use this skill when working under:

```text
ingestion/
tests/
airflow/dags/
```

or when adding or changing data source extraction logic.

## Source rules

- Use public APIs only.
- Do not use private datasets or credentials.
- Prefer deterministic fixtures in tests.
- Do not let unstable public APIs break ordinary PR checks.
- Use real APIs in scheduled/nightly workflows, not in fast unit tests.

## Extractor requirements

Each extractor should include:

- timeout;
- retry with backoff;
- clear user agent when appropriate;
- structured result object;
- Raw path generation;
- metadata recording;
- no heavy transformation beyond safe payload wrapping.

## Raw path convention

```text
s3://lakehouse/raw/source=<source_name>/ingestion_date=YYYY-MM-DD/data.json
```

## Testing expectations

- Unit test URL construction.
- Unit test parsing of fixture responses.
- Unit test Raw path generation.
- Unit test metadata result creation.
- Mock HTTP calls in unit tests.

## Do not

- Do not write normalized data in Raw.
- Do not store secrets in code.
- Do not make network calls in unit tests.
- Do not introduce source domains unrelated to the project without updating documentation.
