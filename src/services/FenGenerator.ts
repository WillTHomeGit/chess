import type { BoardState } from '../types/Board';
import type { GameState } from '../model/GameState';
import { BOARD_CONFIG } from '../config/BoardConfig';

/**
 * Generates FEN-like strings to uniquely identify board positions.
 */
export class FenGenerator {
  /**
   * Generates a unique key for a given position, including piece placement,
   * turn, castling rights, and en passant target. This is used for detecting
   * threefold repetition.
   * @param board The current board state.
   * @param gameState The current game state.
   * @returns A unique string identifier for the position.
   */
  public static getPositionKey(board: BoardState, gameState: GameState): string {
    // 1. Piece Placement
    const piecePlacement = this.getPiecePlacementFen(board);

    // 2. Active Color
    const activeColor = gameState.currentTurn.charAt(0);

    // 3. Castling Availability
    const castling = this.getCastlingFen(board);

    // 4. En Passant Target
    const enPassant = this.getEnPassantFen(gameState);

    return `${piecePlacement} ${activeColor} ${castling} ${enPassant}`;
  }

  private static getPiecePlacementFen(board: BoardState): string {
    let fen = '';
    for (let row = 7; row >= 0; row--) {
      let emptySquares = 0;
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          if (emptySquares > 0) {
            fen += emptySquares;
            emptySquares = 0;
          }
          let pieceChar = piece.type.charAt(0).toUpperCase();
          if (piece.type === 'knight') pieceChar = 'N';
          fen += piece.color === 'white' ? pieceChar : pieceChar.toLowerCase();
        } else {
          emptySquares++;
        }
      }
      if (emptySquares > 0) {
        fen += emptySquares;
      }
      if (row > 0) {
        fen += '/';
      }
    }
    return fen;
  }

  private static getCastlingFen(board: BoardState): string {
    let fen = '';
    const { pieceRank } = BOARD_CONFIG.initialPosition;

    // White Kingside
    const whiteKing = board[pieceRank.white][4];
    const whiteKRook = board[pieceRank.white][7];
    if (whiteKing?.type === 'king' && !whiteKing.hasMoved && whiteKRook?.type === 'rook' && !whiteKRook.hasMoved) {
      fen += 'K';
    }
    // White Queenside
    const whiteQRook = board[pieceRank.white][0];
    if (whiteKing?.type === 'king' && !whiteKing.hasMoved && whiteQRook?.type === 'rook' && !whiteQRook.hasMoved) {
      fen += 'Q';
    }

    // Black Kingside
    const blackKing = board[pieceRank.black][4];
    const blackKRook = board[pieceRank.black][7];
    if (blackKing?.type === 'king' && !blackKing.hasMoved && blackKRook?.type === 'rook' && !blackKRook.hasMoved) {
      fen += 'k';
    }
    // Black Queenside
    const blackQRook = board[pieceRank.black][0];
    if (blackKing?.type === 'king' && !blackKing.hasMoved && blackQRook?.type === 'rook' && !blackQRook.hasMoved) {
      fen += 'q';
    }

    return fen === '' ? '-' : fen;
  }

  private static getEnPassantFen(gameState: GameState): string {
    const lastMove = gameState.getLastMove();
    if (!lastMove || lastMove.piece.type !== 'pawn' || Math.abs(lastMove.to.row - lastMove.from.row) !== 2) {
      return '-';
    }
    const file = String.fromCharCode(97 + lastMove.from.col);
    const rank = lastMove.piece.color === 'white' ? 3 : 6;
    return `${file}${rank}`;
  }
}