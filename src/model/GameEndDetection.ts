// Game end condition detection (simplified)
import type { BoardState } from '../types/Board';
import type { PieceColor } from '../types/Piece';
import type { GameState } from './GameState';
import type { DebugLogger } from '../dev/DebugLogger';
import { Game } from './Game';
import { BoardUtils } from '../utils/BoardUtils';
import { FenGenerator } from '../services/FenGenerator';

export class GameEndDetection {
  private game: Game;
  private logger: DebugLogger; // 2. Add logger property

  constructor(game: Game, logger: DebugLogger) { // 3. Accept logger in constructor
    this.game = game;
    this.logger = logger;
  }

  /**
   * Checks for any game-ending draw condition.
   * @param board The current board state.
   * @param gameState The current game state.
   * @returns True if the game is a draw.
   */
  public isDrawByRule(board: BoardState, gameState: GameState): boolean {
    // 50-move rule
    if (gameState.halfMoveClock >= 100) return true;

    // Threefold repetition
    const positionKey = FenGenerator.getPositionKey(board, gameState);
    if ((gameState.positionHistory.get(positionKey) ?? 0) >= 3) return true;

    // Insufficient material
    if (this.isInsufficientMaterial(board)) return true;

    return false;
  }

  /**
   * Check if player is in check
   * @param board - Board state
   * @param color - Color to check
   * @param gameState - Game state
   * @returns True if in check
   */
  public isInCheck(board: BoardState, color: PieceColor, gameState: GameState): boolean {
    const kingPos = color === 'white' ? gameState.whiteKingPos : gameState.blackKingPos;
    const opponentColor = color === 'white' ? 'black' : 'white';

    // 4. Pass the logger along in the call
    return this.game.isSquareAttacked(board, kingPos, opponentColor, gameState, this.logger);
  }

  /**
   * Check if position is drawn due to insufficient material
   * @param board - Board state
   * @returns True if insufficient material
   */
  public isInsufficientMaterial(board: BoardState): boolean {
    const pieces = BoardUtils.getPiecesByColor(board, 'white')
      .concat(BoardUtils.getPiecesByColor(board, 'black'));

    // Filter out kings
    const nonKingPieces = pieces.filter(p => p.piece.type !== 'king');

    // K vs K
    if (nonKingPieces.length === 0) return true;

    // K + minor piece vs K
    if (nonKingPieces.length === 1) {
      const piece = nonKingPieces[0].piece;
      return piece.type === 'bishop' || piece.type === 'knight';
    }

    // K + B vs K + B (same color squares)
    if (nonKingPieces.length === 2 &&
      nonKingPieces.every(p => p.piece.type === 'bishop')) {
      const pos1 = nonKingPieces[0].pos;
      const pos2 = nonKingPieces[1].pos;
      return (pos1.row + pos1.col) % 2 === (pos2.row + pos2.col) % 2;
    }

    return false;
  }
}