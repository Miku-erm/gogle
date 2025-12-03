export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // Base64
}

export enum GameMode {
  MENU = 'MENU',
  PASSWORD = 'PASSWORD',
  STORY = 'STORY',
  COLORING = 'COLORING',
  PUZZLE = 'PUZZLE',
  CHARACTER_EDIT = 'CHARACTER_EDIT',
  SETUP = 'SETUP'
}

export type ImageSize = '1K' | '2K' | '4K';

export interface StoryState {
  history: string;
  currentText: string;
  options: string[];
}