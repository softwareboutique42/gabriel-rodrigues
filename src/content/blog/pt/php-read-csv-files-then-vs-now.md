---
title: 'Ler CSV em PHP: De fgetcsv() com Dor de Cabeca a Bibliotecas Modernas'
description: 'Minha resposta no Stack Overflow de 2015 mostrava como ler CSV em PHP com fgetcsv(). Em 2026, League\Csv e generators resolvem os casos que funcoes brutas nao cobrem.'
date: 2026-03-29
tags: ['php', 'csv', 'stackoverflow', 'dados']
lang: 'pt'
---

# Ler CSV em PHP: De fgetcsv() com Dor de Cabeca a Bibliotecas Modernas

Em 2015, respondi uma [pergunta no Stack Overflow em Portugues](https://pt.stackoverflow.com/questions/89516) sobre como ler arquivos CSV em PHP. Recebeu 9 votos — uma tarefa basica que todo desenvolvedor PHP encontra em algum momento.

A resposta mostrava `fgetcsv()`, e funcionava. Mas "funcionava" e "funcionava bem em producao com arquivos CSV do mundo real" sao coisas muito diferentes.

## A Abordagem de 2015: fgetcsv() e Esperanca

O padrao era simples:

```php
// 2015: Leitura basica de CSV
$handle = fopen('dados.csv', 'r');
while (($row = fgetcsv($handle, 1000, ',')) !== false) {
    echo $row[0] . ' - ' . $row[1] . "\n";
}
fclose($handle);
```

Limpo. Simples. E quebrava no momento que alguem te passava um CSV exportado do Excel em um Windows brasileiro.

### O Pesadelo da Codificacao

`fgetcsv()` le bytes. Nao tem conceito de codificacao de caracteres. Um arquivo CSV salvo como Windows-1252 (comum no Brasil) produzia texto ilegivel quando voce tentava exibir como UTF-8:

```php
// 2015: A danca da codificacao
$handle = fopen('dados.csv', 'r');
while (($row = fgetcsv($handle, 0, ';')) !== false) {
    // CSVs brasileiros frequentemente usam ponto-e-virgula e encoding Windows
    $row = array_map(function($field) {
        return mb_convert_encoding($field, 'UTF-8', 'Windows-1252');
    }, $row);
    // Agora processa $row...
}
```

E tinha o BOM do UTF-8 (Byte Order Mark). O Excel adora colocar `\xEF\xBB\xBF` no inicio de arquivos UTF-8. Seu primeiro campo na primeira linha incluia silenciosamente tres bytes invisiveis, quebrando comparacoes de string:

```php
// 2015: Removendo o BOM manualmente
$firstLine = fgets($handle);
$firstLine = preg_replace('/^\xEF\xBB\xBF/', '', $firstLine);
rewind($handle);
```

### A Adivinhacao do Delimitador

`fgetcsv()` usa virgula como delimitador padrao. Mas CSV nao e realmente "separado por virgula" — e "separado pelo que o programa de exportacao decidiu." O Excel brasileiro usa ponto-e-virgula. Alguns sistemas europeus usam tab. Outros usam pipe. Voce precisava saber antes ou detectar por conta propria:

```php
// 2015: Farejar o delimitador
$firstLine = fgets($handle);
rewind($handle);
$delimiters = [',', ';', "\t", '|'];
$counts = [];
foreach ($delimiters as $d) {
    $counts[$d] = substr_count($firstLine, $d);
}
$delimiter = array_keys($counts, max($counts))[0];
```

Fragil? Com certeza. Mas todo mundo escreveu alguma versao disso.

## A Abordagem de 2026: Bibliotecas Que Lidam com a Realidade

### League\Csv

A resposta do ecossistema PHP para manipulacao de CSV amadureceu muito. League\Csv e a referencia hoje:

```php
// 2026: League\Csv cuida das partes feias
use League\Csv\Reader;
use League\Csv\CharsetConverter;

$reader = Reader::createFromPath('dados.csv', 'r');
$reader->setHeaderOffset(0); // Primeira linha como cabecalhos

// Conversao automatica de charset
$encoder = (new CharsetConverter())
    ->inputEncoding('Windows-1252')
    ->outputEncoding('UTF-8');
$reader->addFormatter($encoder);

foreach ($reader->getRecords() as $record) {
    // $record e um array associativo com chaves do cabecalho
    echo $record['nome'] . ' - ' . $record['email'];
}
```

O que League\Csv oferece:

- **Tratamento de BOM** — detecta e remove automaticamente
- **Conversao de charset** — conversor embutido, sem `mb_convert_encoding` manual
- **Mapeamento de cabecalhos** — acessa campos pelo nome, nao pelo indice
- **Filtragem de stream** — processa sem carregar o arquivo inteiro
- **Validacao** — checagens de consistencia de contagem de colunas

### SplFileObject para Casos Simples

Se voce nao quer uma dependencia, as classes SPL do PHP melhoraram a ergonomia:

```php
// 2026: SplFileObject — embutido no PHP
$file = new SplFileObject('dados.csv');
$file->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY);
$file->setCsvControl(';'); // Define delimitador

foreach ($file as $row) {
    if ($row[0] !== null) {
        echo implode(' | ', $row) . "\n";
    }
}
```

### Generators PHP para Arquivos Grandes

Para arquivos que nao cabem na memoria — e em producao, eles sempre crescem mais do que o esperado:

```php
// 2026: Leitura baseada em generator para eficiencia de memoria
function readCsv(string $path, string $delimiter = ','): Generator {
    $handle = fopen($path, 'r');
    $headers = fgetcsv($handle, 0, $delimiter);

    while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
        yield array_combine($headers, $row);
    }

    fclose($handle);
}

// Processa um arquivo de 2GB com uso constante de memoria
foreach (readCsv('exportacao-gigante.csv', ';') as $record) {
    processRecord($record);
}
```

Generators estavam disponiveis desde o PHP 5.5 (2013), mas em 2015 a maioria dos codebases ainda nao os adotava. Em 2026, sao padrao para processamento de arquivos.

## O Panorama Maior: PHP Ainda e a Ferramenta Certa?

Para processamento de CSV especificamente, o cenario mudou. Se estou fazendo analise ou transformacao de dados em 2026, honestamente eu usaria:

- **Python pandas** — `pd.read_csv()` resolve encoding, delimitadores, tipos e valores faltantes em uma chamada
- **Node.js csv-parse** — parser streaming que integra bem com pipelines JS modernas
- **DuckDB** — consulta arquivos CSV direto com SQL, sem etapa de carregamento

```python
# Python: Uma linha faz o que levava 20 linhas em PHP
import pandas as pd
df = pd.read_csv('dados.csv', encoding='latin-1', sep=';')
```

Mas PHP nao vai a lugar nenhum para aplicacoes web que precisam aceitar uploads de CSV e processa-los no servidor. League\Csv resolve bem esse caso de uso.

## O Que Mudou

| Aspecto     | 2015 (fgetcsv)                     | 2026 (Moderno)                         |
| ----------- | ---------------------------------- | -------------------------------------- |
| Encoding    | mb_convert_encoding manual         | Conversor de charset embutido          |
| BOM         | Remocao manual com regex           | Deteccao automatica                    |
| Cabecalhos  | Acesso por indice numerico         | Acesso por nome de coluna              |
| Memoria     | Carregar tudo ou gerenciar handles | Generators + streaming                 |
| Delimitador | Adivinhar ou fixar no codigo       | Auto-deteccao em bibliotecas           |
| Validacao   | Faca voce mesmo                    | Checagens de colunas, casting de tipos |

## A Conclusao

`fgetcsv()` ainda funciona. Eu nao diria a ninguem para parar de usar em scripts simples. Mas bibliotecas PHP modernas cuidam dos casos extremos que funcoes brutas de arquivo nao cobrem — deteccao de encoding, remocao de BOM, mapeamento de cabecalhos, streaming eficiente em memoria. A resposta de 2015 resolvia a pergunta feita. A resposta de 2026 incluiria um aviso: se seu CSV vem do mundo real, use uma biblioteca que ja viu todo formato estranho de exportacao que o Excel consegue produzir.
