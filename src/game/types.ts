export type Color = 'mint' | 'blue' | 'coral' | 'gold' | 'purple';
export type Cell = Color | null;
export type Board = Cell[][];
export type Coordinate = [row: number, column: number];
export type Shape = Coordinate[];
export interface Piece {
  shape: Shape;
  color: Color;
}
export type Tray = (Piece | null)[];
export type BuildingId = 'bakery' | 'garden' | 'library' | 'cafe' | 'windmill' | 'park';
export interface Project {
  id: BuildingId;
  name: string;
  cost: number;
  description: string;
}
export interface GameState {
  version: 2;
  board: Board;
  tray: Tray;
  score: number;
  best: number;
  bricks: number;
  built: BuildingId[];
  sound: boolean;
  tutorial: boolean;
}
export interface MoveResult {
  board: Board;
  placed: Board;
  cleared: Coordinate[];
  lines: number;
  points: number;
  bricks: number;
}
export interface Hint {
  index: number;
  shape: Shape;
  row: number;
  column: number;
}
