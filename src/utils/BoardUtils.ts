// src/utils/BoardUtils.ts

// Helper functions for board manipulation
import type { BoardState, BoardCoord } from '../types/Board';
import type { Piece, PieceType, PieceColor } from '../types/Piece';
import { BOARD_CONFIG } from '../config/BoardConfig';

export class BoardUtils {
  /**
   * Create a fresh chess board in starting position
   * @returns New board state with pieces in starting positions
   */
  static createInitialBoard(): BoardState {
    const board: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));
    
    const { pieceOrder, pawnRank, pieceRank } = BOARD_CONFIG.initialPosition;
    
    // Place pawns
    for (let i = 0; i < 8; i++) {
      board[pawnRank.white][i] = { type: 'pawn', color: 'white', hasMoved: false };
      board[pawnRank.black][i] = { type: 'pawn', color: 'black', hasMoved: false };
    }
    
    // Place other pieces
    for (let i = 0; i < 8; i++) {
      board[pieceRank.white][i] = { type: pieceOrder[i], color: 'white', hasMoved: false };
      board[pieceRank.black][i] = { type: pieceOrder[i], color: 'black', hasMoved: false };
    }
    
    return board;
  }

  /**
   * Create a deep copy of the board
   * @param board - Board to clone
   * @returns Deep copy of the board
   */
  static cloneBoard(board: BoardState): BoardState {
    return board.map(row => row.map(piece => 
      piece ? { ...piece } : null
    ));
  }

  /**
   * Get piece at specific position
   * @param board - Board state
   * @param pos - Position to check
   * @returns Piece at position or null
   */
  static getPieceAt(board: BoardState, pos: BoardCoord): Piece | null {
    if (!this.isValidPosition(pos)) return null;
    return board[pos.row][pos.col];
  }

  /**
   * Set piece at specific position (returns new board, doesn't mutate)
   * @param board - Board state
   * @param pos - Position to set
   * @param piece - Piece to place (or null to clear)
   * @returns New board with piece placed
   */
  static setPieceAt(board: BoardState, pos: BoardCoord, piece: Piece | null): BoardState {
    const newBoard = this.cloneBoard(board);
    if (this.isValidPosition(pos)) {
      newBoard[pos.row][pos.col] = piece;
    }
    return newBoard;
  }

  /**
   * Check if position is within board bounds
   * @param pos - Position to check
   * @returns True if valid position
   */
  static isValidPosition(pos: BoardCoord): boolean {
    return pos.row >= 0 && pos.row <= 7 && pos.col >= 0 && pos.col <= 7;
  }

  /**
   * Find position of specific type of piece for a color
   * @param board - Board state
   * @param pieceType - Type of piece to find
   * @param color - Color of piece to find
   * @returns Position of piece or null if not found
   */
  static findPiece(board: BoardState, pieceType: PieceType, color: PieceColor): BoardCoord | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === pieceType && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  /**
   * Get all pieces of a specific color
   * @param board - Board state
   * @param color - Color to filter by
   * @returns Array of pieces with their positions
   */
  static getPiecesByColor(board: BoardState, color: PieceColor): Array<{ piece: Piece; pos: BoardCoord }> {
    const pieces: Array<{ piece: Piece; pos: BoardCoord }> = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          pieces.push({ piece, pos: { row, col } });
        }
      }
    }
    return pieces;
  }
}