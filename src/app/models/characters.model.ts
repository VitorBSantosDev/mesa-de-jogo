import { PlayerAvatar } from './player.model';

export interface Character {
  avatar: PlayerAvatar;
  name: string;
}

export const CHARACTERS: Character[] = [
  { avatar: 'gandalf', name: 'Gandalf' },
  { avatar: 'sauron', name: 'Sauron' },
  { avatar: 'frodo', name: 'Frodo' },
  { avatar: 'aragorn', name: 'Aragorn' },
  { avatar: 'legolas', name: 'Legolas' },
  { avatar: 'gimli', name: 'Gimli' },
  { avatar: 'galadriel', name: 'Galadriel' },
  { avatar: 'pippin', name: 'Pippin' },
  { avatar: 'arwen', name: 'Arwen' },
  { avatar: 'boromir', name: 'Boromir' },
  { avatar: 'sam', name: 'Sam' },
  { avatar: 'merry', name: 'Merry' },
];

export function characterName(avatar: PlayerAvatar): string {
  return CHARACTERS.find((character) => character.avatar === avatar)?.name ?? avatar;
}