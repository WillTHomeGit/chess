// src/components/ChessGameController.ts

import type { BoardState, BoardCoord } from '../types/Board';
import type { DebugLogger } from '../dev/DebugLogger';
import type { Move } from '../types/Move';
import type { PieceType } from '../types/Piece';
import { Game } from '../model/Game';
import { GameState, type GameSnapshot } from '../model/GameState';
import { GameEndDetection } from '../model/GameEndDetection';
import { BoardService } from '../services/BoardService';
import { MoveExecutor } from '../services/MoveExecutor';
import { MoveNotation } from '../services/MoveNotation';
import { FenGenerator } from '../services/FenGenerator';
import { PromotionHandler } from '../rules/special-moves/PromotionHandler';
import { KeyboardInputHandler } from '../input/KeyboardInputHandler';
import { EventEmitter } from '../services/EventEmitter';
import type { GameEvent, BoardUpdateEvent, UITextUpdateEvent, PromotionEvent, GameEndEvent } from '../model/GameEvents';

export class ChessGameController {
  private readonly game            = new Game();
  private readonly gameState       = new GameState();
  private readonly moveExecutor    = new MoveExecutor();
  private readonly promotionHdl    = new PromotionHandler();
  private readonly keyboardHandler = new KeyboardInputHandler(() => this.undo(), () => this.redo());
  private readonly logger: DebugLogger;
  private readonly gameEndDetect: GameEndDetection;
  public readonly events = new EventEmitter<GameEvent>();
  private currentBoard : BoardState = BoardService.createInitialBoard();
  private selectedSquare: BoardCoord | null = null;
  private promotionMove : Move | null = null;
  private moveList      : string[] = [];

  constructor(logger: DebugLogger) {
    this.logger = logger;
    this.gameEndDetect = new GameEndDetection(this.game, this.logger);
    this.initGame();
  }

  private initGame(): void {
    this.logger.group('ChessGameController.initGame');
    const startKey = FenGenerator.getPositionKey(this.currentBoard, this.gameState);
    this.gameState.positionHistory.set(startKey, 1);
    this.gameState.saveSnapshot(this.currentBoard);
    this.updateLegalMoves();
    this.logger.log(`Initial legal moves generated for ${this.gameState.currentTurn}: ${this.gameState.allLegalMovesForCurrentTurn.length}`);
    this.logger.groupEnd();
    this.keyboardHandler.enable();
  }

  public getInitialViewData() {
    return {
      board: this.currentBoard,
      updateData: {
        lastMove: this.gameState.getLastMove(),
        isCheck: this.gameState.isCheck,
        validMoves: [],
        selectedSquare: null,
        kingInCheckPos: this.gameState.isCheck ? (this.gameState.currentTurn === 'white' ? this.gameState.whiteKingPos : this.gameState.blackKingPos) : undefined
      }
    };
  }

  public handleSquareClick(row: number, col: number): void {
    this.logger.group(`ChessGameController.handleSquareClick([${row},${col}])`);
    const clickedCoord = { row, col };

    if (this.selectedSquare) {
      if (this.selectedSquare.row === clickedCoord.row && this.selectedSquare.col === clickedCoord.col) {
        this.selectedSquare = null;
        this.emitViewUpdate();
      } else {
        const move = this.findMove(this.selectedSquare, clickedCoord);
        if (move) {
          this.selectedSquare = null;
          this.executeMove(move);
        } else {
          const piece = this.currentBoard[row][col];
          if (piece && piece.color === this.gameState.currentTurn) {
            this.selectedSquare = clickedCoord;
          } else {
            this.selectedSquare = null;
          }
          this.emitViewUpdate();
        }
      }
    } else {
      const piece = this.currentBoard[row][col];
      if (piece && piece.color === this.gameState.currentTurn) {
        const hasMoves = this.gameState.allLegalMovesForCurrentTurn.some(m => m.from.row === row && m.from.col === col);
        if (hasMoves) {
          this.selectedSquare = clickedCoord;
        }
      }
      this.emitViewUpdate();
    }
    this.logger.groupEnd();
  }

  public onPromotionPieceSelected(pieceType: PieceType): void {
    if (!this.promotionMove) return;
    const finalMove: Move = { ...this.promotionMove, promotion: pieceType };
    this.currentBoard = this.promotionHdl.executePromotion(this.currentBoard, finalMove.to, pieceType);
    this.promotionMove = null;
    this.finaliseMove(finalMove);
  }

  private executeMove(move: Move): void {
    this.logger.group('ChessGameController.executeMove');
    this.logger.log(`Executing move: ${move.piece.type} from [${move.from.row},${move.from.col}] to [${move.to.row},${move.to.col}]`);
    this.gameState.saveSnapshot(this.currentBoard);
    this.currentBoard = this.moveExecutor.executeMove(this.currentBoard, move);
    if (move.piece.type === 'king') {
      if (move.piece.color === 'white') this.gameState.whiteKingPos = move.to;
      else this.gameState.blackKingPos = move.to;
    }
    if (this.promotionHdl.needsPromotion(move.piece, move.to)) {
      this.promotionMove = move;
      this.events.emit<PromotionEvent>({ type: 'promotion', data: { move } });
    } else {
      this.finaliseMove(move);
    }
    this.logger.groupEnd();
  }

  private finaliseMove(move: Move): void {
    this.logger.group('ChessGameController.finaliseMove');
    this.gameState.addMove(move);
    this.gameState.updateStateAfterMove(move, this.currentBoard);
    this.logger.log('Updating legal moves for next turn...');
    this.updateLegalMoves();
    this.logger.log('Checking for game end conditions...');
    this.checkGameEnd();
    const boardBefore = this.gameState.gameSnapshots[this.gameState.currentSnapshotIndex - 1].board;
    const notation = MoveNotation.getMoveNotation(move, boardBefore, this.gameState.isCheck, this.gameState.isCheckmate);
    this.moveList.push(notation);
    this.emitViewUpdate();
    this.emitUITextUpdate();
    this.emitGameEndIfNeeded();
    this.logger.groupEnd();
  }

  private emitViewUpdate(): void {
    const validMoves = this.selectedSquare ? this.gameState.allLegalMovesForCurrentTurn.filter(m => m.from.row === this.selectedSquare!.row && m.from.col === this.selectedSquare!.col) : [];
    const kingInCheckPos = this.gameState.isCheck ? (this.gameState.currentTurn === 'white' ? this.gameState.whiteKingPos : this.gameState.blackKingPos) : undefined;
    this.events.emit<BoardUpdateEvent>({
      type: 'boardUpdate',
      data: {
        board: this.currentBoard,
        updateData: {
          lastMove: this.gameState.getLastMove(),
          isCheck: this.gameState.isCheck,
          validMoves,
          selectedSquare: this.selectedSquare,
          kingInCheckPos
        }
      }
    });
  }

  public emitUITextUpdate(): void {
    const player = this.gameState.currentTurn === 'white' ? 'White' : 'Black';
    this.events.emit<UITextUpdateEvent>({
      type: 'uiTextUpdate',
      data: { text: `${player} to move`, isCheck: this.gameState.isCheck }
    });
  }

  private emitGameEndIfNeeded(): void {
    if (this.gameState.isCheckmate) {
      const winner = this.gameState.currentTurn === 'white' ? 'Black' : 'White';
      this.events.emit<GameEndEvent>({ type: 'gameEnd', data: { message: `Checkmate! ${winner} wins!` } });
    } else if (this.gameState.isDraw) {
      this.events.emit<GameEndEvent>({ type: 'gameEnd', data: { message: 'Game is a draw!' } });
    }
  }

  private checkGameEnd(): void {
    const color = this.gameState.currentTurn;
    const gs = this.gameState;
    const board = this.currentBoard;
    const hasLegal = gs.allLegalMovesForCurrentTurn.length > 0;
    gs.isCheck = this.gameEndDetect.isInCheck(board, color, gs);
    gs.isCheckmate = gs.isCheck && !hasLegal;
    gs.isStalemate = !gs.isCheck && !hasLegal;
    const ruleDraw = this.gameEndDetect.isDrawByRule(board, gs);
    gs.isDraw = gs.isStalemate || ruleDraw;
  }

  private updateLegalMoves(): void {
    const boardForValidation = BoardService.cloneBoard(this.currentBoard);
    this.gameState.allLegalMovesForCurrentTurn = this.game.generateAllLegalMoves(
      boardForValidation,
      this.gameState.currentTurn,
      this.gameState,
      this.logger
    );
  }

  private findMove(from: BoardCoord, to: BoardCoord): Move | null {
    return this.gameState.allLegalMovesForCurrentTurn.find(m => m.from.row === from.row && m.from.col === from.col && m.to.row === to.row && m.to.col === to.col) || null;
  }
  
  private undo(): void {
    const snap = this.gameState.undo();
    if (snap) {
      this.moveList.pop();
      this.restoreSnapshot(snap);
    }
  }

  private redo(): void {
    const snap = this.gameState.redo();
    if (snap) {
      const redoneMove = this.gameState.getLastMove();
      if (redoneMove) {
        const boardBefore = this.gameState.gameSnapshots[this.gameState.currentSnapshotIndex - 1].board;
        const notation = MoveNotation.getMoveNotation(redoneMove, boardBefore, snap.isCheck, snap.isCheckmate);
        this.moveList.push(notation);
      }
      this.restoreSnapshot(snap);
    }
  }
  
  private restoreSnapshot(snap: GameSnapshot): void {
    this.currentBoard = BoardService.cloneBoard(snap.board);
    this.updateLegalMoves();
    this.emitViewUpdate();
    this.emitUITextUpdate();
  }

  public destroy(): void {
    this.keyboardHandler.disable();
    this.events.clear();
  }
}