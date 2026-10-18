export type GameCategory =
  | "Estratégia" | "Colocação de peças" | "Família"
  | "Party" | "Abstrato" | "Cartas";

export interface Game {
  id: number;
  name: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
  duration: number;
  image: string;
}

export type NewGame = Omit<Game, "id">;

export const GAME_CATEGORIES: GameCategory[] = [
  'Estratégia', 'Colocação de peças', 'Família', 'Party', 'Abstrato', 'Cartas',
];