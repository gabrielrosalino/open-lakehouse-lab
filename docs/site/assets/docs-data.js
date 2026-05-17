window.OPEN_LAKEHOUSE_DOCS = {
  overview: {
    title: "Visao geral do projeto",
    category: "Introducao",
    summary:
      "Resumo do Open Lakehouse Lab, seus objetivos e a ordem de implementacao da plataforma local.",
    tags: ["lakehouse", "estudo", "open source"],
    sections: [
      {
        title: "Objetivo",
        body:
          "O Open Lakehouse Lab e um laboratorio 100% open source para estudar engenharia de dados moderna localmente, sem custos de cloud. O projeto usa kind, Kubernetes, Airflow, MinIO, Apache Iceberg, Apache Polaris, DuckDB, dbt, Prometheus e Grafana.",
      },
      {
        title: "Caminho padrao",
        body:
          "A coluna dorsal atual valida Raw Parquet no MinIO, transformacoes com dbt + DuckDB, tabelas Iceberg via Polaris e orquestracao por Airflow usando pods Kubernetes.",
      },
      {
        title: "Como estudar",
        body:
          "Comece pelo Caminho Rapido para validar o ambiente. Depois siga a Trilha de Aprendizado para reproduzir cada etapa manualmente e entender o que acontece por baixo dos atalhos.",
      },
    ],
    commands: ["make lab-fast-path", "make lab-learning-path", "make explain-dbt-orchestration"],
  },
  "project-plan": {
    title: "Plano do projeto",
    category: "Arquitetura",
    summary:
      "Plano de evolucao do laboratorio, fases da arquitetura e responsabilidades das camadas Raw, Silver e Gold.",
    tags: ["planejamento", "arquitetura", "fases"],
    sections: [
      {
        title: "Arquitetura alvo",
        body:
          "Adapters de fonte escrevem dados na Raw. dbt + DuckDB le esses dados, transforma para Silver e Gold, publica tabelas Iceberg e registra metadados no Polaris. Airflow orquestra a execucao em pods no kind.",
      },
      {
        title: "Ordem de implementacao",
        body:
          "A fundacao local vem antes das fontes concretas: kind, MinIO, Polaris, Airflow, dbt + DuckDB, contrato Raw, adapters, Silver, Gold, observabilidade e documentacao final.",
      },
      {
        title: "Limites do MVP",
        body:
          "O MVP evita MERGE, UPDATE, DELETE e ALTER TABLE em Iceberg. O comportamento inicial prefere full-refresh idempotente para facilitar estudo e revisao.",
      },
    ],
    commands: ["make cluster-create", "make deploy-minio", "make deploy-polaris"],
  },
  "learning-path": {
    title: "Trilha de aprendizado",
    category: "Estudo guiado",
    summary:
      "Guia para seguir o laboratorio em modo rapido ou por licoes incrementais.",
    tags: ["trilha", "licoes", "atalhos"],
    sections: [
      {
        title: "Caminho Rapido",
        body:
          "Use o Caminho Rapido para subir o exemplo completo e provar que a coluna dorsal esta funcional.",
      },
      {
        title: "Trilha de Aprendizado",
        body:
          "Use a trilha para entender cluster, storage, catalogo, dbt, Airflow e pipeline ponta a ponta separadamente.",
      },
      {
        title: "Comandos de explicacao",
        body:
          "Os alvos explain-* mostram objetivo, motivo, comandos, inspecoes e proximo passo sem alterar o ambiente.",
      },
    ],
    commands: [
      "make lab-fast-path",
      "make lab-learning-path",
      "make explain-cluster",
      "make explain-deploy-minio",
      "make explain-dbt-orchestration",
    ],
  },
  customization: {
    title: "Guia de customizacao",
    category: "Pipelines proprios",
    summary:
      "Como adicionar dados Raw, criar modelos dbt e decidir quando alterar DAGs do Airflow.",
    tags: ["customizacao", "raw", "dbt", "airflow"],
    sections: [
      {
        title: "Dados Raw",
        body:
          "Grave Parquet no caminho s3://lakehouse/raw/source=<source>/dataset=<dataset>/ingestion_date=YYYY-MM-DD/*.parquet. Mantenha colunas tecnicas como source, dataset, ingestion_date, loaded_at, record_hash e raw_payload.",
      },
      {
        title: "Modelos dbt",
        body:
          "Crie modelos em raw_sources, staging, silver, intermediate e marts. Documente colunas e testes nos schema.yml correspondentes.",
      },
      {
        title: "Airflow",
        body:
          "Nao edite a DAG principal apenas para adicionar modelos dbt nas pastas existentes. Edite ou crie DAGs quando precisar de novas tasks, schedule, parametros ou experimentos.",
      },
    ],
    commands: ["make dbt-parse", "make dbt-compile", "make trigger-airflow-dbt"],
  },
  troubleshooting: {
    title: "Troubleshooting guiado",
    category: "Diagnostico",
    summary:
      "Erros comuns do laboratorio local e comandos para diagnosticar e recuperar o ambiente.",
    tags: ["debug", "local", "kubernetes"],
    sections: [
      {
        title: "Cluster kind ja existe",
        body:
          "Verifique clusters existentes com kind get clusters e valide o contexto atual antes de recriar o ambiente.",
      },
      {
        title: "Fixture Raw com timeout",
        body:
          "Inspecione pods, logs e describe do job dbt-publish-raw-fixture. Confirme que a imagem dbt foi carregada no kind e que MinIO e Polaris estao saudaveis.",
      },
      {
        title: "DuckDB bloqueado",
        body:
          "Feche DuckDB CLI, DuckDB UI ou extensoes conectadas ao mesmo arquivo antes de rodar dbt. DuckDB permite apenas um processo de escrita por arquivo.",
      },
    ],
    commands: [
      "kubectl -n data-platform logs job/dbt-publish-raw-fixture",
      "make polaris-health",
      "make airflow-status",
    ],
  },
  "lesson-kind": {
    title: "Licao 01 - Kubernetes local com kind",
    category: "Licao",
    summary: "Cria o cluster Kubernetes local e o namespace base do laboratorio.",
    tags: ["kind", "kubernetes"],
    sections: [
      {
        title: "O que voce aprende",
        body:
          "Como criar um cluster kind, aplicar o namespace data-platform e validar conectividade com kubectl.",
      },
      {
        title: "Quando alterar",
        body:
          "Edite k8s/kind/kind-config.yaml apenas para estudar portas, versao da imagem do node ou mounts locais.",
      },
    ],
    commands: ["make cluster-create", "make kubectl-context", "make cluster-status"],
  },
  "lesson-minio": {
    title: "Licao 02 - Storage Raw com MinIO",
    category: "Licao",
    summary: "Sobe MinIO, cria o bucket lakehouse e recebe arquivos Raw Parquet.",
    tags: ["minio", "raw", "parquet"],
    sections: [
      {
        title: "O que voce aprende",
        body:
          "Como MinIO simula S3 localmente, como o bucket lakehouse e criado e onde os arquivos Raw ficam armazenados.",
      },
      {
        title: "Path Raw",
        body:
          "O contrato canonico usa s3://lakehouse/raw/source=<source>/dataset=<dataset>/ingestion_date=YYYY-MM-DD/*.parquet.",
      },
    ],
    commands: ["make deploy-minio", "make minio-status", "make publish-raw-fixture-parquet"],
  },
  "lesson-polaris": {
    title: "Licao 03 - Catalogo Iceberg com Polaris",
    category: "Licao",
    summary: "Sobe Polaris como catalogo REST Iceberg apontando para o MinIO.",
    tags: ["polaris", "iceberg", "catalogo"],
    sections: [
      {
        title: "O que voce aprende",
        body:
          "Como o catalogo lakehouse e criado e como Polaris conecta tabelas Iceberg ao armazenamento no MinIO.",
      },
      {
        title: "Validacao",
        body:
          "Use polaris-status, polaris-health e os logs do job polaris-bootstrap-catalog para confirmar o bootstrap.",
      },
    ],
    commands: ["make deploy-polaris", "make polaris-status", "make polaris-health"],
  },
  "lesson-dbt": {
    title: "Licao 04 - Transformacoes com dbt e DuckDB",
    category: "Licao",
    summary: "Compila, executa e testa modelos dbt usando DuckDB como engine SQL.",
    tags: ["dbt", "duckdb", "sql"],
    sections: [
      {
        title: "O que voce aprende",
        body:
          "Como dbt le Raw Parquet, cria staging, publica Silver e Gold como Iceberg e permite inspecao local pelo DuckDB.",
      },
      {
        title: "Fluxo de modelos",
        body:
          "O fluxo atual e raw_sources -> staging -> silver -> intermediate -> marts.",
      },
    ],
    commands: ["make dbt-parse", "make dbt-compile", "make dbt-run-silver", "make dbt-test-gold"],
  },
  "lesson-airflow": {
    title: "Licao 05 - Airflow e pods Kubernetes",
    category: "Licao",
    summary: "Explora Airflow, KubernetesPodOperator, params e retries.",
    tags: ["airflow", "kubernetes", "dag"],
    sections: [
      {
        title: "O que voce aprende",
        body:
          "Como o Airflow cria pods efemeros para workloads e como usar DAGs didaticas sem mexer na DAG principal.",
      },
      {
        title: "DAGs de estudo",
        body:
          "lab_kubernetes_pod_operator mostra criacao de pods. lab_params_and_retries mostra params, templates e retries.",
      },
    ],
    commands: ["make deploy-airflow", "make airflow-status", "make trigger-airflow-hello"],
  },
  "lesson-e2e": {
    title: "Licao 06 - Pipeline ponta a ponta",
    category: "Licao",
    summary:
      "Executa o caminho completo: MinIO, Polaris, dbt, DuckDB, Iceberg e Airflow.",
    tags: ["pipeline", "ponta a ponta"],
    sections: [
      {
        title: "O que voce aprende",
        body:
          "Como validar a plataforma inteira e depois acessar MinIO, Airflow, Polaris e DuckDB para inspecionar resultados.",
      },
      {
        title: "Depois do exemplo",
        body:
          "Adicione novos Parquet na Raw, crie modelos dbt e use Airflow para orquestrar novas etapas quando necessario.",
      },
    ],
    commands: ["make lab-fast-path", "make trigger-airflow-dbt", "make airflow-status"],
  },
  "runbook-kind": {
    title: "Runbook - Cluster kind local",
    category: "Runbook",
    summary: "Comandos de ciclo de vida do cluster local.",
    tags: ["kind", "cluster"],
    sections: [
      { title: "Criar", body: "Use make cluster-create para criar o cluster e aplicar o namespace base." },
      { title: "Remover", body: "Use make cluster-delete para remover o cluster inteiro." },
    ],
    commands: ["make cluster-create", "make cluster-status", "make cluster-delete"],
  },
  "runbook-minio": {
    title: "Runbook - Armazenamento MinIO",
    category: "Runbook",
    summary: "Deploy, status, acesso local e paths do bucket lakehouse.",
    tags: ["minio", "storage"],
    sections: [
      { title: "Deploy", body: "make deploy-minio aplica Secret, Deployment, Service e job de criacao do bucket." },
      { title: "Acesso", body: "Use make port-forward-minio e abra http://localhost:9001." },
    ],
    commands: ["make deploy-minio", "make minio-status", "make port-forward-minio"],
  },
  "runbook-polaris": {
    title: "Runbook - Catalogo Polaris",
    category: "Runbook",
    summary: "Deploy, credenciais locais, catalogo lakehouse e endpoints Polaris.",
    tags: ["polaris", "catalogo"],
    sections: [
      { title: "Deploy", body: "make deploy-polaris cria secret local, sobe Polaris e executa bootstrap do catalogo." },
      { title: "Saude", body: "make polaris-health valida o endpoint de readiness do servico." },
    ],
    commands: ["make deploy-polaris", "make polaris-status", "make polaris-health"],
  },
  "runbook-airflow-kpo": {
    title: "Runbook - Airflow com KubernetesPodOperator",
    category: "Runbook",
    summary: "Build da imagem Airflow, deploy pelo Helm e DAG de smoke test.",
    tags: ["airflow", "kubernetespodoperator"],
    sections: [
      { title: "Imagem", body: "Construa e carregue a imagem local antes de subir o chart." },
      { title: "Smoke test", body: "A DAG hello_kubernetes_pod valida criacao e remocao de pod efemero." },
    ],
    commands: ["make build-airflow-image", "make load-airflow-image", "make deploy-airflow"],
  },
  "runbook-dbt-foundation": {
    title: "Runbook - Fundacao dbt + DuckDB + Polaris",
    category: "Runbook",
    summary: "Projeto dbt, contrato Raw, macro Polaris e materializacao Iceberg.",
    tags: ["dbt", "duckdb", "polaris"],
    sections: [
      { title: "Contrato Raw", body: "Define colunas tecnicas minimas e formato canonico em Parquet." },
      { title: "Materializacao", body: "A materializacao iceberg_table e conservadora e orientada a full-refresh." },
    ],
    commands: ["make dbt-parse", "make dbt-compile", "make build-dbt-image"],
  },
  "runbook-raw-staging": {
    title: "Runbook - Fontes Raw e staging",
    category: "Runbook",
    summary: "Como dbt le o contrato Raw e cria o staging inicial.",
    tags: ["raw", "staging"],
    sections: [
      { title: "Fixture", body: "publish_raw_fixture_parquet cria dados deterministicos para validar casts e testes." },
      { title: "Staging", body: "stg_raw_source_events normaliza nomes, tipos e campos estruturados." },
    ],
    commands: ["make dbt-publish-raw-fixture", "make dbt-run-foundation", "make dbt-run-staging"],
  },
  "runbook-silver": {
    title: "Runbook - Camada Silver",
    category: "Runbook",
    summary: "Modelos Silver genericos para eventos, metricas e freshness.",
    tags: ["silver", "dbt"],
    sections: [
      { title: "Modelos", body: "silver_source_events, silver_metric_observations e silver_dataset_freshness." },
      { title: "Decisao", body: "Silver e generica primeiro; modelos especificos ficam para adapters reais." },
    ],
    commands: ["make dbt-run-silver", "make dbt-test-silver"],
  },
  "runbook-backbone": {
    title: "Runbook - Coluna dorsal dbt MinIO Polaris",
    category: "Runbook",
    summary: "Caminho completo de Raw Parquet, Iceberg, Polaris e Airflow.",
    tags: ["backbone", "iceberg", "airflow"],
    sections: [
      { title: "Caminho completo", body: "Airflow publica Raw, roda dbt Silver/Gold e registra tabelas Iceberg no Polaris." },
      { title: "Inspecao", body: "Use MinIO para objetos, Airflow para DAGs e DuckDB para consultas SQL." },
    ],
    commands: ["make publish-raw-fixture-parquet", "make trigger-airflow-dbt"],
  },
  "runbook-airflow-dbt": {
    title: "Runbook - Orquestracao dbt com Airflow",
    category: "Runbook",
    summary: "DAG principal open_lakehouse_lab_daily e execucao dbt em pods.",
    tags: ["airflow", "dbt", "pods"],
    sections: [
      { title: "DAG atual", body: "start -> dbt_workloads -> end, com tasks para fixture, run e tests." },
      { title: "Estado DuckDB", body: "O PVC dbt-workload-target preserva artifacts e estado temporario entre pods." },
    ],
    commands: ["make trigger-airflow-dbt", "make airflow-dbt-pods"],
  },
};
