// Handles en passant validation and execution
import type { BoardState, BoardCoord } from '../../types/Board';
import type { Piece } from '../../types/Piece';
import type { Move } from '../../types/Move';

export class EnPassantHandler {
  /**
   * Checks if a pawn's move is a valid en passant capture. This is the single
   * source of truth for en passant validation.
   * @param pawn - The pawn attempting the capture.
   * @param board - The current board state.
   * @param from - The starting position of the pawn.
   * @param to - The target square for the capture.
   * @param lastMove - The previous move made in the game.
   * @returns True if the move is a valid en passant capture, false otherwise.
   */
  public isEnPassantMove(
    pawn: Piece,
    board: BoardState,
    from: BoardCoord,
    to: BoardCoord,
    lastMove: Move | null
  ): boolean {
    // 1. A last move must exist and it must have been a pawn.
    if (!lastMove || lastMove.piece.type !== 'pawn') {
      return false;
    }

    // 2. The last move must have been a two-square advance.
    if (Math.abs(lastMove.to.row - lastMove.from.row) !== 2) {
      return false;
    }

    // 3. The moving pawn must be on the correct starting rank for en passant.
    // (Rank 5 for White, Rank 4 for Black)
    const correctRank = pawn.color === 'white' ? 4 : 3;
    if (from.row !== correctRank) {
      return false;
    }

    // 4. The move must be a one-square diagonal advance.
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);
    const expectedRowDiff = pawn.color === 'white' ? 1 : -1;
    if (rowDiff !== expectedRowDiff || colDiff !== 1) {
      return false;
    }
    
    // 5. The destination square for the capture must be empty.
    if (board[to.row][to.col] !== null) {
      return false;
    }

    // 6. The pawn being captured must be adjacent to the capturing pawn's
    //    starting square, and it must have landed on the same rank.
    //    This confirms the 'to' square of the last move is the one being attacked.
    return lastMove.to.col === to.col && lastMove.to.row === from.row;
  }

  /**
   * Execute en passant capture on board
   * @param board - Board state
   * @param move - En passant move
   * @returns New board state with en passant executed
   */
  public executeEnPassant(board: BoardState, move: Move): BoardState {
    if (!move.isEnPassant) return board;
    
    const newBoard = board.map(row => row.map(piece => piece ? { ...piece } : null));
    
    // Move the pawn
    const pawn = newBoard[move.from.row][move.from.col];
    if (pawn) {
      newBoard[move.to.row][move.to.col] = pawn;
      newBoard[move.from.row][move.from.col] = null;
      pawn.hasMoved = true;
    }
    
    // Remove the captured pawn (on the same rank as the moving pawn)
    newBoard[move.from.row][move.to.col] = null;
    
    return newBoard;
  }

  /**
   * Undoes an en passant capture on the board.
   * @param board - The current board state.
   * @param move - The en passant move to undo.
   */
  public unmakeEnPassant(board: BoardState, move: Move): void {
    const movingPawn = board[move.to.row][move.to.col];
    if (movingPawn) {
      movingPawn.hasMoved = move.piece.hasMoved;
      board[move.from.row][move.from.col] = movingPawn;
      board[move.to.row][move.to.col] = null;
      // Restore the captured pawn
      board[move.from.row][move.to.col] = move.captured || null;
    }
  }
}