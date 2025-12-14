export interface Square {
  readonly file: number; // 0 = a, 7 = h
  readonly rank: number; // 0 = 1, 7 = 8
}

export function createSquare(file: number, rank: number): Square {
  return { file, rank };
}

export function isInsideBoard(square: Square): boolean {
  return square.file >= 0 && square.file < 8 && square.rank >= 0 && square.rank < 8;
}

export function toAlgebraic(square: Square): string {
  const fileChar = String.fromCharCode("a".charCodeAt(0) + square.file);
  const rankChar = (square.rank + 1).toString();
  return `${fileChar}${rankChar}`;
}

export function fromAlgebraic(text: string): Square {
  const file = text.charCodeAt(0) - "a".charCodeAt(0);
  const rank = Number.parseInt(text.charAt(1), 10) - 1;
  return { file, rank };
}
