// Game state management (simplified version of existing)
import type { Move } from '../types/Move';
import type { PieceColor } from '../types/Piece';
import type { BoardCoord, BoardState } from '../types/Board';
import { FenGenerator } from '../services/FenGenerator';

export interface GameSnapshot {
  board: BoardState;
  currentTurn: PieceColor;
  moveHistory: Move[];
  lastMove: Move | null;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  whiteKingPos: BoardCoord;
  blackKingPos: BoardCoord;
  halfMoveClock: number;
  positionHistory: Map<string, number>;
}

export class GameState {
  currentTurn: PieceColor = 'white';
  moveHistory: Move[] = [];
  lastMove: Move | null = null;
  
  whiteKingPos: BoardCoord = { row: 0, col: 4 };
  blackKingPos: BoardCoord = { row: 7, col: 4 };
  
  isCheck: boolean = false;
  isCheckmate: boolean = false;
  isStalemate: boolean = false;
  isDraw: boolean = false;
  
  allLegalMovesForCurrentTurn: Move[] = [];
  
  gameSnapshots: GameSnapshot[] = [];
  currentSnapshotIndex: number = -1;

  public halfMoveClock: number = 0;
  public positionHistory: Map<string, number> = new Map();

  /**
   * Updates game state after a move is made. Must be called AFTER the move
   * is added to history and the turn is switched.
   * @param move The move that was just made.
   * @param board The board state AFTER the move.
   */
  public updateStateAfterMove(move: Move, board: BoardState): void {
    // 1. Update the half-move clock for the 50-move rule
    if (move.piece.type === 'pawn' || move.captured) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }

    // 2. Update the position history for threefold repetition
    // The key is generated based on the state for the *next* player.
    const positionKey = FenGenerator.getPositionKey(board, this);
    const count = this.positionHistory.get(positionKey) || 0;
    this.positionHistory.set(positionKey, count + 1);
  }

  /**
   * Add a move to the history and switch turns
   * @param move - Move to add
   */
  addMove(move: Move): void {
    this.moveHistory.push(move);
    this.lastMove = move;
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    
    // Update king positions
    if (move.piece.type === 'king') {
      if (move.piece.color === 'white') {
        this.whiteKingPos = move.to;
      } else {
        this.blackKingPos = move.to;
      }
    }
  }

  /**
   * Save current state as snapshot
   * @param board - Current board state
   */
  saveSnapshot(board: BoardState): void {
    if (this.currentSnapshotIndex < this.gameSnapshots.length - 1) {
      this.gameSnapshots = this.gameSnapshots.slice(0, this.currentSnapshotIndex + 1);
    }
    
    const snapshot: GameSnapshot = {
      board: board.map(row => row.map(piece => piece ? { ...piece } : null)),
      currentTurn: this.currentTurn,
      moveHistory: [...this.moveHistory],
      lastMove: this.lastMove,
      isCheck: this.isCheck,
      isCheckmate: this.isCheckmate,
      isStalemate: this.isStalemate,
      isDraw: this.isDraw,
      whiteKingPos: { ...this.whiteKingPos },
      blackKingPos: { ...this.blackKingPos },
      halfMoveClock: this.halfMoveClock,
      positionHistory: new Map(this.positionHistory),
    };
    
    this.gameSnapshots.push(snapshot);
    this.currentSnapshotIndex++;
  }

  /**
   * Undo to previous state
   * @returns Previous snapshot or null
   */
  undo(): GameSnapshot | null {
    if (this.currentSnapshotIndex <= 0) return null;
    
    this.currentSnapshotIndex--;
    const snapshot = this.gameSnapshots[this.currentSnapshotIndex];
    this.restoreFromSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Redo to next state
   * @returns Next snapshot or null
   */
  redo(): GameSnapshot | null {
    if (this.currentSnapshotIndex >= this.gameSnapshots.length - 1) return null;
    
    this.currentSnapshotIndex++;
    const snapshot = this.gameSnapshots[this.currentSnapshotIndex];
    this.restoreFromSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Restore state from snapshot
   * @param snapshot - Snapshot to restore
   */
  private restoreFromSnapshot(snapshot: GameSnapshot): void {
    this.currentTurn = snapshot.currentTurn;
    this.moveHistory = [...snapshot.moveHistory];
    this.lastMove = snapshot.lastMove;
    this.isCheck = snapshot.isCheck;
    this.isCheckmate = snapshot.isCheckmate;
    this.isStalemate = snapshot.isStalemate;
    this.isDraw = snapshot.isDraw;
    this.whiteKingPos = snapshot.whiteKingPos;
    this.blackKingPos = snapshot.blackKingPos;
    this.halfMoveClock = snapshot.halfMoveClock;
    this.positionHistory = new Map(snapshot.positionHistory);
  }

  /**
   * Get the last move played
   * @returns Last move or null
   */
  getLastMove(): Move | null {
    return this.lastMove;
  }

  /**
   * Check if undo is possible
   * @returns True if can undo
   */
  canUndo(): boolean {
    return this.currentSnapshotIndex > 0;
  }

  /**
   * Check if redo is possible
   * @returns True if can redo
   */
  canRedo(): boolean {
    return this.currentSnapshotIndex < this.gameSnapshots.length - 1;
  }
}