// src/services/MoveExecutor.ts

/**
 * @file Manages the execution and reversal of moves on the board.
 * This class uses an optimized "make/unmake" pattern for move validation
 * while preserving immutability for the main game state updates. It acts
 * as an orchestrator, delegating the logic for special moves to their
* respective handlers.
 */

import type { BoardState } from '../types/Board';
import type { Move } from '../types/Move';
import { CastlingHandler } from '../rules/special-moves/CastlingHandler';
import { EnPassantHandler } from '../rules/special-moves/EnPassantHandler';
import { PromotionHandler } from '../rules/special-moves/PromotionHandler';
import { BoardUtils } from '../utils/BoardUtils';

export class MoveExecutor {
  private castlingHandler: CastlingHandler;
  private enPassantHandler: EnPassantHandler;
  private promotionHandler: PromotionHandler;

  constructor() {
    this.castlingHandler = new CastlingHandler();
    this.enPassantHandler = new EnPassantHandler();
    this.promotionHandler = new PromotionHandler();
  }

  /**
   * Executes a move and returns a new board state, preserving immutability.
   * This is the primary method used by the controller to advance the game.
   * @param board The current, immutable board state.
   * @param move The move to execute.
   * @returns A new board state with the move applied.
   */
  public executeMove(board: BoardState, move: Move): BoardState {
    const newBoard = BoardUtils.cloneBoard(board);
    this._makeMove(newBoard, move);
    return newBoard;
  }

  /**
   * Tests if a given move would leave the player's king in check.
   * This method uses a highly optimized "make/unmake" approach to avoid slow
   * board cloning during move generation.
   *
   * @warning This method temporarily MUTATES the passed-in `board` object
   * before restoring it to its original state. It should only be used for
   * validation, not for permanent state changes.
   *
   * @param board The board state to test on (will be temporarily modified).
   * @param move The move to validate.
   * @param kingPos The current position of the king being checked.
   * @param isSquareAttacked A function to check for attacks on a given square.
   * @returns `true` if the move is illegal because it leaves the king in check, otherwise `false`.
   */
  public wouldLeaveKingInCheck(
    board: BoardState,
    move: Move,
    kingPos: { row: number; col: number },
    isSquareAttacked: (board: BoardState, pos: { row: number; col: number }, color: 'white' | 'black') => boolean
  ): boolean {
    // 1. Perform the move directly on the board (mutation).
    this._makeMove(board, move);

    // 2. Determine the king's final position and check for attacks.
    const finalKingPos = move.piece.type === 'king' ? move.to : kingPos;
    const opponentColor = move.piece.color === 'white' ? 'black' : 'white';
    const isCheck = isSquareAttacked(board, finalKingPos, opponentColor);
    
    // 3. Revert the move to restore the board to its original state.
    this._unmakeMove(board, move);
    
    return isCheck;
  }

  // --- PRIVATE MUTATING HELPERS ---

  private _makeMove(board: BoardState, move: Move): void {
    if (move.isCastling) {
      this.castlingHandler.executeCastling(board, move);
    } else if (move.isEnPassant) {
      this.enPassantHandler.executeEnPassant(board, move);
    } else {
      this._makeNormalMove(board, move);
    }

    if (move.promotion) {
      this.promotionHandler.executePromotion(board, move.to, move.promotion);
    }
  }

  private _unmakeMove(board: BoardState, move: Move): void {
    if (move.promotion) {
      this.promotionHandler.unmakePromotion(board, move.to);
    }

    if (move.isCastling) {
      this.castlingHandler.unmakeCastling(board, move);
    } else if (move.isEnPassant) {
      this.enPassantHandler.unmakeEnPassant(board, move);
    } else {
      this._unmakeNormalMove(board, move);
    }
  }
  
  private _makeNormalMove(board: BoardState, move: Move): void {
    const piece = board[move.from.row][move.from.col];
    if (!piece) return;

    board[move.to.row][move.to.col] = piece;
    board[move.from.row][move.from.col] = null;
    piece.hasMoved = true;
  }

  private _unmakeNormalMove(board: BoardState, move: Move): void {
    const movedPiece = board[move.to.row][move.to.col];
    if (!movedPiece) return;

    movedPiece.hasMoved = move.piece.hasMoved;

    board[move.from.row][move.from.col] = movedPiece;
    board[move.to.row][move.to.col] = move.captured || null;
  }
}