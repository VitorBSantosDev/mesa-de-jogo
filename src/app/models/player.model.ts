export type PlayerColor =
  | "red" | "blue" | "yellow" | "green" | "purple" | "orange"
  | "teal" | "pink" | "brown" | "lime" | "burgundy" | "gray";

export interface Player {
  id: number;
  name: string;
  color: PlayerColor;
}