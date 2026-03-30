---
title: 'Testar no Xcode Sem Licença Paga'
description: 'Minha resposta no SO de 2015 explicava a barreira de $99/ano para testar em dispositivo. Em 2026, provisionamento gratuito é padrão desde o Xcode 7.'
date: 2026-03-29
tags: ['ios', 'xcode', 'stackoverflow', 'swift']
lang: 'pt'
---

# Testar no Xcode Sem Licença Paga

Em 2015, respondi uma pergunta no Stack Overflow em Português sobre testar apps iOS em dispositivo real sem a assinatura paga do Apple Developer Program. Recebeu 4 votos, e a frustração na pergunta era palpável.

## A Realidade de 2015: Pague para Testar

A situação era clara: você precisava da assinatura de $99/ano para rodar seu app em dispositivo real. A única opção gratuita era o iOS Simulator — bom, mas incapaz de testar câmera, GPS real, sensores e performance com restrições reais de memória.

Muitos desenvolvedores aprendendo Swift ou prototipando apps não conseguiam justificar $99 só para testar no próprio telefone.

## A Realidade de 2026: Provisionamento Gratuito Desde o Xcode 7

A Apple mudou isso em 2015 com o Xcode 7 — provisionamento gratuito permite que qualquer Apple ID faça deploy em dispositivo sem assinatura paga. Em 2026, isso é padrão há uma década:

1. Abra o Xcode, vá em **Preferences → Accounts**
2. Adicione seu Apple ID (gratuito, sem assinatura necessária)
3. Selecione seu dispositivo como alvo de execução
4. Xcode cria um perfil de provisionamento gratuito automaticamente
5. Execute o app

**Limitações do provisionamento gratuito:**

- Apps expiram após 7 dias (precisa re-fazer deploy pelo Xcode)
- Máximo 3 apps por dispositivo ao mesmo tempo
- Sem Push Notifications, Compra no App ou a maioria das entitlements
- Não pode distribuir para outros

Para testes pessoais e aprendizado, essas limitações são aceitáveis.

## O Que Ainda Exige Assinatura Paga

A assinatura Apple Developer de $99/ano ainda é necessária para:

- **Distribuição na App Store** (publicar para usuários)
- **TestFlight** beta testing com testadores externos
- **Push Notifications** e a maioria das capacidades avançadas

## Conclusão

A barreira "pague para testar no seu próprio dispositivo" de 2015 acabou. Provisionamento gratuito resolve a vasta maioria dos cenários de desenvolvimento e aprendizado. A taxa de $99/ano agora é especificamente para distribuição e capacidades avançadas.
