// Board setup configuration
import type { PieceType } from '../types/Piece';

export const BOARD_CONFIG = {
  size: 8,
  initialPosition: {
    pieceOrder: ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'] as PieceType[],
    pawnRank: { white: 1, black: 6 },
    pieceRank: { white: 0, black: 7 }
  },
  canvas: {
    layerNames: ['board-layer', 'pieces-layer', 'dynamic-layer'],
    boardSizeRatio: 0.8 // 80% of min(window width, height)
  }
} as const;