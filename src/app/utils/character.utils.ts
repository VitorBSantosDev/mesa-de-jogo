import { CHARACTERS } from '../models/characters.model';
import { PlayerAvatar } from '../models/player.model';

export function getCharacterName(avatar: PlayerAvatar): string {
  return CHARACTERS.find((character) => character.avatar === avatar)?.name ?? avatar;
}
