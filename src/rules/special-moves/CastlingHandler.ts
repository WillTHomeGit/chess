// Handles castling validation and execution
import type { BoardState, BoardCoord } from '../../types/Board';
import type { Piece } from '../../types/Piece';
import type { Move } from '../../types/Move';
import { GAME_CONFIG } from '../../config/GameConfig';

export class CastlingHandler {
  /**
   * Check if castling move is legal
   * @param board - Board state
   * @param king - King piece
   * @param from - King's current position
   * @param to - King's target position
   * @param isSquareAttacked - Function to check if square is attacked
   * @returns Validation result with move details
   */
  canCastle(
    board: BoardState,
    king: Piece,
    from: BoardCoord,
    to: BoardCoord,
    isSquareAttacked: (board: BoardState, pos: BoardCoord, attackingColor: 'white' | 'black') => boolean
  ): { valid: boolean; move?: Move } {
    // King must not have moved
    if (king.hasMoved) return { valid: false };
    
    const row = from.row;
    const isKingside = to.col > from.col;
    const { kingsideKingCol, queensideKingCol } = GAME_CONFIG.castling;
    const correctKingCol = isKingside ? kingsideKingCol : queensideKingCol;
    
    // Check correct target square
    if (to.row !== row || to.col !== correctKingCol) {
      return { valid: false };
    }
    
    // Check rook
    const rookCol = isKingside ? 
      GAME_CONFIG.castling.kingsideRookFromCol : 
      GAME_CONFIG.castling.queensideRookFromCol;
    const rook = board[row][rookCol];
    
    if (!rook || rook.type !== 'rook' || rook.color !== king.color || rook.hasMoved) {
      return { valid: false };
    }
    
    // Check path is clear
    const pathCols = isKingside ? [5, 6] : [1, 2, 3];
    for (const col of pathCols) {
      if (board[row][col]) return { valid: false };
    }
    
    // Check king doesn't pass through or end in check
    const opponentColor = king.color === 'white' ? 'black' : 'white';
    const squaresToCheck = isKingside ? [4, 5, 6] : [2, 3, 4];
    
    for (const col of squaresToCheck) {
      if (isSquareAttacked(board, { row, col }, opponentColor)) {
        return { valid: false };
      }
    }
    
    return {
      valid: true,
      move: {
        from,
        to: { row, col: correctKingCol },
        piece: king,
        isCastling: isKingside ? 'kingside' : 'queenside'
      }
    };
  }

  /**
   * Execute castling move on board
   * @param board - Board state
   * @param move - Castling move
   * @returns New board state with castling executed
   */
  executeCastling(board: BoardState, move: Move): BoardState {
    if (!move.isCastling) return board;
    
    const newBoard = board.map(row => row.map(piece => piece ? { ...piece } : null));
    const row = move.from.row;
    const isKingside = move.isCastling === 'kingside';
    
    // Move king
    const king = newBoard[move.from.row][move.from.col];
    if (king) {
      newBoard[move.to.row][move.to.col] = king;
      newBoard[move.from.row][move.from.col] = null;
      king.hasMoved = true;
    }
    
    // Move rook
    const { kingsideRookFromCol, queensideRookFromCol, kingsideRookToCol, queensideRookToCol } = GAME_CONFIG.castling;
    const rookFromCol = isKingside ? kingsideRookFromCol : queensideRookFromCol;
    const rookToCol = isKingside ? kingsideRookToCol : queensideRookToCol;
    
    const rook = newBoard[row][rookFromCol];
    if (rook) {
      newBoard[row][rookToCol] = rook;
      newBoard[row][rookFromCol] = null;
      rook.hasMoved = true;
    }
    
    return newBoard;
  }

  // --- NEW METHOD ---
  /**
   * Reverts a castling move on the board.
   * This method restores the king and rook to their positions before the castling move,
   * and resets their `hasMoved` status.
   * @param board - The current board state.
   * @param move - The castling move to unmake.
   */
  public unmakeCastling(board: BoardState, move: Move): void {
    const isKingside = move.isCastling === 'kingside';
    const row = move.from.row;
    const kingToCol = move.from.col;
    const rookFromCol = isKingside ? GAME_CONFIG.castling.kingsideRookFromCol : GAME_CONFIG.castling.queensideRookFromCol;
    const rookToCol = isKingside ? GAME_CONFIG.castling.kingsideRookToCol : GAME_CONFIG.castling.queensideRookToCol;

    const king = board[move.to.row][move.to.col];
    const rook = board[row][rookToCol];

    if (king && rook) {
      king.hasMoved = false;
      rook.hasMoved = false;
      board[row][kingToCol] = king;
      board[move.to.row][move.to.col] = null;
      board[row][rookFromCol] = rook;
      board[row][rookToCol] = null;
    }
  }
}