// src/components/Board.ts

import type { BoardState, BoardCoord, BoardUpdateData } from '../types/Board';
import type { Move } from '../types/Move';
import type { PieceType } from '../types/Piece';
import { BOARD_CONFIG } from '../config/BoardConfig';
import { BoardRenderer }    from '../view/renderers/BoardRenderer';
import { PieceRenderer }    from '../view/renderers/PieceRenderer';
import { HighlightRenderer} from '../view/renderers/HighlightRenderer';
import { PromotionRenderer} from '../view/renderers/PromotionRenderer';
import { MouseInputHandler } from '../input/MouseInputHandler';
import { EventEmitter } from '../services/EventEmitter';
import type { GameEvent } from '../model/GameEvents';
import type { ChessGameController } from './ChessGameController'; // Import the controller type

export class Board {
  private squareSize = 0;
  private boardCtx!: CanvasRenderingContext2D;
  private pieceCtx!: CanvasRenderingContext2D;
  private dynCtx!  : CanvasRenderingContext2D;
  private readonly boardR = new BoardRenderer();
  private readonly pieceR = new PieceRenderer();
  private readonly highR  = new HighlightRenderer();
  private readonly promoR = new PromotionRenderer();
  private input!: MouseInputHandler;
  private isPromotion = false;
  private promoMove   : Move | null = null;
  private readonly onSquareClick     : (row: number, col: number) => void;
  private readonly onPromotionChoice : (piece: PieceType) => void;

  constructor(
    container          : HTMLDivElement,
    events             : EventEmitter<GameEvent>,
    onSquareClick      : (row: number, col: number) => void,
    onPromotionChoice  : (piece: PieceType) => void
  ) {
    this.onSquareClick     = onSquareClick;
    this.onPromotionChoice = onPromotionChoice;

    this.setupCanvases(container);
    this.initRenderers();
    this.listen(events);
    this.initInput(container);
  }

  public async init(controller: ChessGameController): Promise<void> {
    const initialData = controller.getInitialViewData();
    this.draw(initialData.board, initialData.updateData);
    await this.pieceR.preloadImages();
    this.pieceR.drawAllPieces(this.pieceCtx, initialData.board, this.squareSize);
  }

  private setupCanvases(container: HTMLDivElement): void {
    const boardCV  = container.querySelector<HTMLCanvasElement>('#board-layer')!;
    const pieceCV  = container.querySelector<HTMLCanvasElement>('#pieces-layer')!;
    const dynCV    = container.querySelector<HTMLCanvasElement>('#dynamic-layer')!;
    this.boardCtx = boardCV.getContext('2d')!;
    this.pieceCtx = pieceCV.getContext('2d')!;
    this.dynCtx   = dynCV  .getContext('2d')!;
    const boardSize = Math.min(window.innerWidth * BOARD_CONFIG.canvas.boardSizeRatio, window.innerHeight * BOARD_CONFIG.canvas.boardSizeRatio);
    container.style.width  = container.style.height = `${boardSize}px`;
    [boardCV, pieceCV, dynCV].forEach(cv => { cv.width = cv.height = boardSize; });
    this.squareSize = boardSize / BOARD_CONFIG.size;
  }

  private initRenderers(): void {
    this.boardR.drawStaticBoard(this.boardCtx, this.squareSize);
  }

  private listen(emitter: EventEmitter<GameEvent>): void {
    emitter.on('boardUpdate', data => this.draw(data.board, data.updateData));
    emitter.on('promotion',   data => this.showPromotionDialog(data.move));
  }

  private initInput(container: HTMLDivElement): void {
    this.input = new MouseInputHandler(
      container.querySelector<HTMLCanvasElement>('#dynamic-layer')!,
      this.squareSize,
      coord => this.handleClick(coord)
    );
    this.input.enable();
  }

  private draw(board: BoardState, data: BoardUpdateData & { kingInCheckPos?: BoardCoord }): void {
    // 1. Clear the canvases at the beginning of the draw cycle.
    this.highR.clearCanvas(this.dynCtx);
    this.pieceCtx.clearRect(0, 0, this.pieceCtx.canvas.width, this.pieceCtx.canvas.height);

    // --- START OF FIX: Correct Rendering Order ---

    // 2. Draw all persistent highlights (last move, check) onto the piece canvas FIRST.
    if (data.lastMove) {
      this.highR.drawLastMoveHighlight(this.pieceCtx, data.lastMove, this.squareSize);
    }
    if (data.kingInCheckPos) {
      this.highR.drawCheckIndicator(this.pieceCtx, data.kingInCheckPos, this.squareSize);
    }

    // 3. NOW, draw all the pieces ON TOP of the highlights.
    //    This works because PieceRenderer no longer erases the canvas.
    this.pieceR.drawAllPieces(this.pieceCtx, board, this.squareSize);
    // --- END OF FIX ---

    // 4. Finally, draw transient highlights (like selection and valid moves) on the separate dynamic layer.
    if (data.selectedSquare) {
      this.highR.drawSelectedSquare(this.dynCtx, data.selectedSquare, this.squareSize);
      this.highR.drawValidMoves(this.dynCtx, data.validMoves, board, this.squareSize);
    }
  }

  private showPromotionDialog(move: Move): void {
    this.isPromotion = true;
    this.promoMove   = move;
    this.promoR.showPromotionDialog(this.dynCtx, move, this.pieceR.getPieceImages(), this.squareSize);
  }

  private handleClick(coord: BoardCoord): void {
    if (this.isPromotion && this.promoMove) {
      const choice = this.promoR.getPromotionChoice(this.promoMove, coord);
      if (choice) {
        this.isPromotion = false;
        this.promoMove   = null;
        this.highR.clearCanvas(this.dynCtx);
        this.onPromotionChoice(choice);
      }
    } else {
      this.onSquareClick(coord.row, coord.col);
    }
  }

  public destroy(): void {
    this.input.disable();
  }
}