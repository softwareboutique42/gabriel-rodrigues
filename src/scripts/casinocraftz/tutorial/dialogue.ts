import type { DialogueMessage, TutorialStepId } from './types.ts';

export const DIALOGUE_REGISTRY: Record<TutorialStepId, Record<'en' | 'pt', DialogueMessage[]>> = {
  welcome: {
    en: [
      {
        id: 'welcome-narrator-en',
        role: 'narrator',
        text: 'Welcome to the lab. There are no real stakes here - only real math.',
      },
      {
        id: 'welcome-system-en',
        role: 'system',
        text: 'Casinocraftz is a zero-risk educational simulator. No real money, no gambling.',
      },
    ],
    pt: [
      {
        id: 'welcome-narrator-pt',
        role: 'narrator',
        text: 'Bem-vindo ao laboratorio. Aqui nao ha apostas reais - apenas matematica real.',
      },
      {
        id: 'welcome-system-pt',
        role: 'system',
        text: 'Casinocraftz e um simulador educacional sem risco. Sem dinheiro real, sem jogo de azar.',
      },
    ],
  },
  'house-edge-intro': {
    en: [
      {
        id: 'hei-narrator-en',
        role: 'narrator',
        text: 'Every game in a casino is designed so the house collects a small percentage of every bet - forever.',
      },
      {
        id: 'hei-system-en',
        role: 'system',
        text: "House edge is the casino's guaranteed long-run profit margin. On this slot machine it is approximately 4.5%.",
      },
    ],
    pt: [
      {
        id: 'hei-narrator-pt',
        role: 'narrator',
        text: 'Todo jogo em um cassino e projetado para que a casa colete uma pequena porcentagem de cada aposta - para sempre.',
      },
      {
        id: 'hei-system-pt',
        role: 'system',
        text: 'A vantagem da casa e a margem de lucro garantida ao longo do tempo. Nesta maquina de slots e aproximadamente 4,5%.',
      },
    ],
  },
  'play-and-observe': {
    en: [
      {
        id: 'pao-narrator-en',
        role: 'narrator',
        text: 'Spin three times. Watch what happens. The machine does not remember you.',
      },
      {
        id: 'pao-system-en',
        role: 'system',
        text: 'Each spin is independent. Past results have zero effect on future outcomes - the RNG resets every round.',
      },
    ],
    pt: [
      {
        id: 'pao-narrator-pt',
        role: 'narrator',
        text: 'Gire tres vezes. Observe o que acontece. A maquina nao te reconhece.',
      },
      {
        id: 'pao-system-pt',
        role: 'system',
        text: 'Cada giro e independente. Resultados passados nao afetam resultados futuros - o RNG e redefinido a cada rodada.',
      },
    ],
  },
  'probability-reveal': {
    en: [
      {
        id: 'pr-narrator-en',
        role: 'narrator',
        text: 'You\u0027ve observed 3 spins on the slot machine. Here\u0027s what the outcomes tell us about probability.',
      },
      {
        id: 'pr-system-en',
        role: 'system',
        text: 'Symbol A appears on approximately 40% of stops. Symbol E appears on roughly 5%. This imbalance creates the edge.',
      },
    ],
    pt: [
      {
        id: 'pr-narrator-pt',
        role: 'narrator',
        text: 'Você observou 3 giros na máquina de slots. Aqui está o que os resultados nos dizem sobre probabilidade.',
      },
      {
        id: 'pr-system-pt',
        role: 'system',
        text: 'O simbolo A aparece em aproximadamente 40% das paradas. O simbolo E em cerca de 5%. Esse desequilibrio cria a vantagem.',
      },
    ],
  },
  'card-unlock': {
    en: [
      {
        id: 'cu-narrator-en',
        role: 'narrator',
        text: 'You have earned your first tools. Use them to see through the design.',
      },
      {
        id: 'cu-system-en',
        role: 'system',
        text: 'Three utility cards are now unlocked: Probability Seer, Dopamine Dampener, and House Edge. Each reveals a different layer of the mechanism.',
      },
    ],
    pt: [
      {
        id: 'cu-narrator-pt',
        role: 'narrator',
        text: 'Voce ganhou suas primeiras ferramentas. Use-as para enxergar atraves do design.',
      },
      {
        id: 'cu-system-pt',
        role: 'system',
        text: 'Tres cartas utilitarias foram desbloqueadas: Vidente de Probabilidade, Atenuador de Dopamina e Vantagem da Casa. Cada uma revela uma camada diferente do mecanismo.',
      },
    ],
  },
  complete: {
    en: [
      {
        id: 'done-narrator-en',
        role: 'narrator',
        text: 'Lesson one is done. The math is the same whether you know it or not - but now you know it.',
      },
      {
        id: 'done-system-en',
        role: 'system',
        text: 'You have learned: house edge, independent spins, weighted symbol probabilities, and how utility cards expose hidden systems.',
      },
    ],
    pt: [
      {
        id: 'done-narrator-pt',
        role: 'narrator',
        text: 'A primeira licao esta concluida. A matematica e a mesma voce sabendo ou nao - mas agora voce sabe.',
      },
      {
        id: 'done-system-pt',
        role: 'system',
        text: 'Voce aprendeu: vantagem da casa, giros independentes, probabilidades ponderadas de simbolos e como as cartas expoem sistemas ocultos.',
      },
    ],
  },
};

export function getDialogue(stepId: TutorialStepId, lang: 'en' | 'pt'): DialogueMessage[] {
  return DIALOGUE_REGISTRY[stepId]?.[lang] ?? [];
}
