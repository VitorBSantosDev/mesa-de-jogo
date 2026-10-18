export type PlayerAvatar =
  | 'gandalf' | 'sauron' | 'frodo' | 'aragorn' | 'legolas' | 'gimli'
  | 'galadriel' | 'pippin' | 'arwen' | 'boromir' | 'sam' | 'merry';

export interface Player {
  id: number;
  name: string;
  avatar: PlayerAvatar;
}