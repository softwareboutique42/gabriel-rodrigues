---
title: 'Campos BLOB em Bancos de Dados: Quando Armazenar Dados Binários e Quando Não'
description: 'De uma resposta de 2015 no Stack Overflow sobre tipos BLOB no MySQL e Firebird até a era do object storage em 2026 — por que a resposta para "como guardar arquivos no banco" agora é "não guarde."'
date: 2026-03-29
tags: ['banco-de-dados', 'stackoverflow', 'arquitetura', 'armazenamento']
lang: 'pt'
---

# Campos BLOB em Bancos de Dados: Quando Armazenar Dados Binários e Quando Não

Em 2015, eu respondi uma pergunta no Stack Overflow em Português sobre campos BLOB no MySQL e Firebird. A pessoa queria entender o que eram BLOBs, quais tipos existiam e quando usar cada um. Escrevi uma resposta detalhada cobrindo as variantes de BLOB, limites de tamanho, o conceito de segment size no Firebird e as limitações de colunas binárias. A resposta recebeu 14 upvotes — uma boa resposta de referência.

Naquela época, guardar arquivos diretamente no banco de dados era prática comum. Onze anos depois, quase nunca é. Aqui está o que mudou, e o que essa diferença nos ensina sobre decisões de arquitetura.

## A Resposta de 2015: Tipos BLOB e Seus Limites

BLOB significa **Binary Large Object** (Objeto Binário Grande). É um tipo de coluna projetado para armazenar dados binários brutos — imagens, PDFs, objetos serializados, qualquer coisa que não seja texto. No MySQL, existem quatro variantes:

| Tipo       | Tamanho Máximo |
| ---------- | -------------- |
| TINYBLOB   | 255 bytes      |
| BLOB       | ~64 KB         |
| MEDIUMBLOB | ~16 MB         |
| LONGBLOB   | ~4 GB          |

Cada tipo usa um número diferente de bytes para armazenar o prefixo de tamanho, e é por isso que os limites escalam dessa forma.

Para o Firebird, expliquei o conceito de **segment size** — um parâmetro que controla como os dados binários são lidos e escritos em blocos. O segment size padrão é 80 bytes, o que é absurdamente pequeno para qualquer coisa além de dados triviais. Normalmente você definiria algo como 16384 (16 KB) para ter uma performance razoável de leitura e escrita. O Firebird não tem as variantes TINY/MEDIUM/LONG; ele usa um único tipo BLOB com sub-tipos (0 para binário, 1 para texto).

Também cobri as limitações que se aplicam a BLOBs em qualquer banco:

- **Não podem ser chaves primárias.** Dados binários não podem ser indexados eficientemente para verificação de unicidade.
- **Não podem ser usados em ORDER BY ou GROUP BY.** Não dá para ordenar por um bloco de bytes.
- **Sem valores padrão.** A maioria dos bancos não permite definir um default para uma coluna BLOB.
- **Performance degrada com o tamanho.** Toda query que toca a tabela paga o custo, mesmo que você não faça SELECT na coluna BLOB (dependendo da engine de armazenamento e formato da linha).

Aquela resposta era precisa e útil. Se você estava construindo uma aplicação PHP em 2015 e precisava guardar fotos de perfil enviadas pelos usuários, colocar numa coluna MEDIUMBLOB era uma abordagem perfeitamente razoável.

## Por Que Funcionou Naquela Época

Em 2015, as alternativas ao armazenamento no banco não eram ótimas para times pequenos. O AWS S3 existia, mas exigia gerenciar credenciais IAM, configurar políticas de bucket e lidar com SDKs que pareciam pesados para um simples upload de arquivo. A maioria das hospedagens PHP nem suportava o SDK da AWS nativamente.

Guardar arquivos no banco tinha vantagens reais: tudo ficava em um lugar só, backups capturavam tudo, e garantias ACID significavam que seu arquivo e seus metadados estavam sempre consistentes. Se você deletasse um registro de usuário, o arquivo ia junto. Sem arquivos órfãos em disco, sem referências quebradas.

Para uma aplicação pequena com algumas centenas de usuários fazendo upload de fotos de perfil, funcionava bem. O banco ficava pequeno o suficiente para que ninguém notasse o overhead.

## A Realidade de 2026: Object Storage Venceu

Avançando para 2026, e a resposta para "devo guardar arquivos no banco de dados?" é quase sempre **não**. Serviços de object storage se tornaram o padrão:

- **Amazon S3** — o original, agora com dezenas de classes de armazenamento para cada padrão de acesso
- **Cloudflare R2** — zero custo de egresso, API compatível com S3
- **Google Cloud Storage**, **Azure Blob Storage**, **MinIO** para self-hosted

Esses serviços são feitos especificamente para dados binários. Eles cuidam de replicação, distribuição via CDN, controle de acesso e gerenciamento de ciclo de vida. Um banco de dados é feito para dados estruturados e consultáveis. Usar um banco para guardar blobs binários é como usar uma planilha como sistema de arquivos — funciona, mas você está lutando contra a ferramenta.

## A Economia Conta a História

Vamos colocar números nisso. Digamos que você tem 1 TB de arquivos enviados por usuários.

**Object storage (S3 Standard):** ~$23/mês pelo armazenamento. Recuperação custa centavos por mil requisições. Cloudflare R2 torna o egresso totalmente gratuito.

**Armazenamento no banco (PostgreSQL no RDS):** Esse 1 TB de BLOBs significa que seu banco tem pelo menos 1 TB. Sua instância `db.r6g.xlarge` custa ~$350/mês. Backups agora levam horas ao invés de minutos. Recovery point-in-time armazena snapshots do seu banco inteiro de 1 TB. Replicação dobra o custo de armazenamento. E cada `pg_dump` te faz prender a respiração.

Mas não é só custo. É dor operacional:

- **Tempo de backup** escala linearmente com o tamanho do banco. Um banco de 1 TB leva dramaticamente mais tempo para backup do que um banco de 50 GB com referências a arquivos.
- **Lag de replicação** aumenta porque cada INSERT com uma imagem de 5 MB é uma escrita de 5 MB no WAL que as réplicas precisam reproduzir.
- **Performance de queries** sofre mesmo em tabelas não relacionadas se a engine do banco não consegue manter o working set em memória porque BLOBs estão consumindo o buffer pool.
- **Complexidade de migração** aumenta. Tente rodar um `ALTER TABLE` numa tabela com 500 GB de dados blob.

## O Padrão Moderno

A arquitetura que venceu é simples:

1. **Fazer upload do arquivo para object storage** (S3, R2, GCS) — receber de volta uma chave ou caminho
2. **Armazenar a chave/URL no banco** — uma simples coluna VARCHAR
3. **Gerar signed URLs para controle de acesso** — URLs temporárias com expiração que concedem acesso de leitura sem expor seu bucket

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(127) NOT NULL,
  storage_key VARCHAR(512) NOT NULL,  -- "uploads/2026/03/abc123.pdf"
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

O arquivo vive no object storage. Os metadados vivem no banco. Cada sistema faz o que sabe fazer bem. Signed URLs significam que você pode servir arquivos diretamente do CDN sem passar pelo seu servidor de aplicação — melhor performance, menor custo, arquitetura mais simples.

## Quando BLOBs Ainda Fazem Sentido

Existem casos legítimos em que armazenar dados binários no banco faz sentido:

- **SQLite para apps locais/embarcados.** Se sua aplicação é uma ferramenta desktop ou um app mobile usando SQLite, guardar arquivos pequenos no banco mantém tudo em um único arquivo. Sem sistema de arquivos para gerenciar, sem problemas de sincronização.
- **Configurações binárias pequenas ou chaves criptográficas.** Uma chave de criptografia de 256 bytes ou um blob de config JSON de 2 KB é tranquilo numa coluna de banco. O overhead é desprezível e você ganha consistência transacional.
- **Thumbnails embarcados abaixo de ~100 KB.** Se você está gerando imagens de preview minúsculas e precisa que elas estejam fortemente acopladas a um registro, um BLOB pequeno evita o round-trip ao object storage.
- **Quando você precisa de garantias ACID no próprio arquivo.** Se um arquivo e seus metadados precisam ser atomicamente consistentes — atualizados juntos, revertidos juntos — um BLOB em uma transação te dá isso. Object storage é eventualmente consistente para operações cross-service.

O threshold que eu uso: se o dado binário tem menos de 100 KB e você precisa de consistência transacional, BLOB é razoável. Acima disso, object storage quase sempre vence.

## Lição Principal

Minha resposta de 2015 explicou _como_ armazenar dados binários no banco. Se eu reescrevesse hoje, começaria com _se você deveria_.

A pergunta não é "qual tipo de BLOB eu preciso?" — é "esse dado deveria viver no banco?" E para arquivos, a resposta em 2026 é quase sempre não. Use object storage, guarde uma referência, e deixe cada sistema fazer o que foi projetado para fazer.

Os tipos BLOB ainda existem. Os segment sizes e limitações que documentei não mudaram. Mas o ecossistema em torno dos bancos de dados evoluiu a ponto de a resposta certa para "como guardo arquivos no meu banco?" ser geralmente "você guarda em outro lugar e mantém um ponteiro."

Entender o porquê é o que separa escolher uma ferramenta de simplesmente usar o que estiver na sua frente.
