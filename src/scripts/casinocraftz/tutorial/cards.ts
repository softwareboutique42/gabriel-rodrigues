import type { UtilityCard, UtilityCardId } from './types.ts';

export const STARTER_CARDS: UtilityCard[] = [
  {
    id: 'probability-seer',
    labelKey: 'cards.probabilitySeer.label',
    descriptionKey: 'cards.probabilitySeer.description',
  },
  {
    id: 'dopamine-dampener',
    labelKey: 'cards.dopamineDampener.label',
    descriptionKey: 'cards.dopamineDampener.description',
  },
  {
    id: 'house-edge',
    labelKey: 'cards.houseEdge.label',
    descriptionKey: 'cards.houseEdge.description',
  },
];

const CARD_CLASSES = [
  'ccz-card--probability-seer',
  'ccz-card--dopamine-dampener',
  'ccz-card--house-edge',
] as const;

export function applyCard(cardId: UtilityCardId, root: HTMLElement): void {
  const tutorialZone = root.querySelector('[data-casinocraftz-zone="tutorial"]');
  if (!(tutorialZone instanceof HTMLElement)) {
    return;
  }

  clearCard(root);
  root.dataset.casinocraftzActiveCard = cardId;
  tutorialZone.classList.add(`ccz-card--${cardId}`);
}

export function clearCard(root: HTMLElement): void {
  delete root.dataset.casinocraftzActiveCard;

  const tutorialZone = root.querySelector('[data-casinocraftz-zone="tutorial"]');
  if (!(tutorialZone instanceof HTMLElement)) {
    return;
  }

  tutorialZone.classList.remove(...CARD_CLASSES);
}
