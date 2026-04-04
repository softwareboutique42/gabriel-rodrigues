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
        text: 'Because you\u0027ve now observed 3 spins, this probability reveal unlocked. Here\u0027s what the outcomes tell us.',
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
        text: 'Como voce agora observou 3 giros, esta revelacao de probabilidade foi desbloqueada. Aqui esta o que os resultados mostram.',
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
  'near-miss-intro': {
    en: [
      {
        id: 'nmi-narrator-en',
        role: 'narrator',
        text: 'Lesson two studies near misses: outcomes that feel close enough to matter even though they still lose.',
      },
      {
        id: 'nmi-system-en',
        role: 'system',
        text: 'A near miss does not signal improving odds. It is still a loss presented in a way that feels almost rewarding.',
      },
    ],
    pt: [
      {
        id: 'nmi-narrator-pt',
        role: 'narrator',
        text: 'A licao dois estuda quase acertos: resultados que parecem proximos o suficiente para importar, mesmo continuando perdas.',
      },
      {
        id: 'nmi-system-pt',
        role: 'system',
        text: 'Um quase acerto nao sinaliza odds melhores. Continua sendo uma perda apresentada de um jeito que parece quase recompensador.',
      },
    ],
  },
  'near-miss-observe': {
    en: [
      {
        id: 'nmo-narrator-en',
        role: 'narrator',
        text: 'Observe two more spins. Your brain will notice patterns even when the machine is still resolving each round independently.',
      },
      {
        id: 'nmo-system-en',
        role: 'system',
        text: 'The trigger here is observation only. No player action can push the machine closer to a win.',
      },
    ],
    pt: [
      {
        id: 'nmo-narrator-pt',
        role: 'narrator',
        text: 'Observe mais dois giros. Seu cerebro nota padroes mesmo quando a maquina continua resolvendo cada rodada de forma independente.',
      },
      {
        id: 'nmo-system-pt',
        role: 'system',
        text: 'O gatilho aqui e apenas observacao. Nenhuma acao do jogador empurra a maquina para mais perto de uma vitoria.',
      },
    ],
  },
  'near-miss-reveal': {
    en: [
      {
        id: 'nmr-narrator-en',
        role: 'narrator',
        text: 'Because you observed 2 spins in this lesson, the near-miss reveal unlocked. Almost-winning visuals can intensify attention without changing the result.',
      },
      {
        id: 'nmr-system-en',
        role: 'system',
        text: 'Near misses compress emotional distance, not mathematical distance. The payout table still reads them as ordinary losses.',
      },
    ],
    pt: [
      {
        id: 'nmr-narrator-pt',
        role: 'narrator',
        text: 'Como voce observou 2 giros nesta licao, a revelacao de quase acerto foi desbloqueada. Visuais de quase-vitoria podem intensificar a atencao sem mudar o resultado.',
      },
      {
        id: 'nmr-system-pt',
        role: 'system',
        text: 'Quase acertos comprimem a distancia emocional, nao a distancia matematica. A tabela de payout continua lendo isso como perda comum.',
      },
    ],
  },
  'near-miss-complete': {
    en: [
      {
        id: 'nmc-narrator-en',
        role: 'narrator',
        text: 'Lesson two is complete. Feeling close is part of the presentation layer, not evidence that the machine is warming up for you.',
      },
      {
        id: 'nmc-system-en',
        role: 'system',
        text: 'You learned that near misses are persuasive feedback cues, not signals of increasing control or improving odds.',
      },
    ],
    pt: [
      {
        id: 'nmc-narrator-pt',
        role: 'narrator',
        text: 'A licao dois esta concluida. A sensacao de proximidade faz parte da camada de apresentacao, nao e evidencia de que a maquina esta esquentando para voce.',
      },
      {
        id: 'nmc-system-pt',
        role: 'system',
        text: 'Voce aprendeu que quase acertos sao sinais persuasivos de feedback, nao sinais de controle crescente ou odds melhores.',
      },
    ],
  },
  'sensory-conditioning-intro': {
    en: [
      {
        id: 'sci-narrator-en',
        role: 'narrator',
        text: 'Lesson three studies sensory conditioning: the lights, sounds, and pacing that keep attention pinned to the machine.',
      },
      {
        id: 'sci-system-en',
        role: 'system',
        text: 'These cues change how the outcome feels, not how the outcome is calculated.',
      },
    ],
    pt: [
      {
        id: 'sci-narrator-pt',
        role: 'narrator',
        text: 'A licao tres estuda condicionamento sensorial: luzes, sons e ritmo que mantem a atencao presa na maquina.',
      },
      {
        id: 'sci-system-pt',
        role: 'system',
        text: 'Esses sinais mudam a sensacao do resultado, nao a forma como o resultado e calculado.',
      },
    ],
  },
  'sensory-conditioning-observe': {
    en: [
      {
        id: 'sco-narrator-en',
        role: 'narrator',
        text: 'Observe two spins with the presentation in mind. Fast feedback can feel like momentum even when each round is still independent.',
      },
      {
        id: 'sco-system-en',
        role: 'system',
        text: 'This lesson tracks repeated exposure, not skill. The machine is not becoming more favorable to you.',
      },
    ],
    pt: [
      {
        id: 'sco-narrator-pt',
        role: 'narrator',
        text: 'Observe dois giros pensando na apresentacao. Feedback rapido pode parecer impulso, mesmo quando cada rodada continua independente.',
      },
      {
        id: 'sco-system-pt',
        role: 'system',
        text: 'Esta licao acompanha exposicao repetida, nao habilidade. A maquina nao esta ficando mais favoravel para voce.',
      },
    ],
  },
  'sensory-conditioning-reveal': {
    en: [
      {
        id: 'scr-narrator-en',
        role: 'narrator',
        text: 'Because you observed 2 spins in lesson three, the conditioning reveal unlocked. Repetition, cadence, and audiovisual bursts can make neutral outcomes feel loaded.',
      },
      {
        id: 'scr-system-en',
        role: 'system',
        text: 'Conditioning cues amplify anticipation and recall. They do not alter RNG, payout logic, or future odds.',
      },
    ],
    pt: [
      {
        id: 'scr-narrator-pt',
        role: 'narrator',
        text: 'Como voce observou 2 giros na licao tres, a revelacao de condicionamento foi desbloqueada. Repeticao, cadencia e explosoes audiovisuais podem fazer resultados neutros parecerem carregados.',
      },
      {
        id: 'scr-system-pt',
        role: 'system',
        text: 'Sinais de condicionamento ampliam antecipacao e memoria. Eles nao alteram RNG, logica de payout ou odds futuras.',
      },
    ],
  },
  'sensory-conditioning-complete': {
    en: [
      {
        id: 'scc-narrator-en',
        role: 'narrator',
        text: 'Lesson three is complete. The presentation can shape urgency and memory without ever changing the math under the cabinet.',
      },
      {
        id: 'scc-system-en',
        role: 'system',
        text: 'You learned that sensory reinforcement is part of the interface layer, not a sign of improving luck or hidden control.',
      },
    ],
    pt: [
      {
        id: 'scc-narrator-pt',
        role: 'narrator',
        text: 'A licao tres esta concluida. A apresentacao pode moldar urgencia e memoria sem nunca mudar a matematica por baixo do gabinete.',
      },
      {
        id: 'scc-system-pt',
        role: 'system',
        text: 'Voce aprendeu que reforco sensorial faz parte da camada de interface, nao e sinal de sorte melhorando ou de controle oculto.',
      },
    ],
  },
};

export function getDialogue(stepId: TutorialStepId, lang: 'en' | 'pt'): DialogueMessage[] {
  return DIALOGUE_REGISTRY[stepId]?.[lang] ?? [];
}
