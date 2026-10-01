// The three mopeds in the subscription, in garage order: simple, middle, best.
// Prices and order: Mika, 01.10.2026 (handbook knowledge.md).
// `level` drives the four bars in the garage. It is the owner's ranking of the
// models, not a measurement: real range and speed figures are not in the
// handbook yet (register, item 60), so all four bars of a model are equal.

export type ModelId = 'xl1200' | 'eagle' | 's70-pro';

export interface Model {
  id: ModelId;
  name: string;
  weeklyGel: number;
  level: 1 | 2 | 3;
  image: string;
}

export const DEPOSIT_GEL = 180;

export const models: Model[] = [
  { id: 'xl1200', name: 'XL1200', weeklyGel: 150, level: 1, image: 'img/models/xl1200.webp' },
  { id: 'eagle', name: 'Eagle', weeklyGel: 160, level: 2, image: 'img/models/eagle.webp' },
  { id: 's70-pro', name: 'S70 Pro', weeklyGel: 170, level: 3, image: 'img/models/s70-pro.webp' },
];

export const contact = {
  phone: '+995 595 16 55 88',
  whatsapp: '995595165588',
  email: 'info@ev8.ge',
};
