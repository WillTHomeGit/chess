// src/model/Game.ts

import type { Move } from '../types/Move';
import type { DebugLogger } from '../dev/DebugLogger';
import type { BoardState, BoardCoord } from '../types/Board';
import type { Piece, PieceColor } from '../types/Piece';
import type { GameState } from './GameState';
import { ValidatorFactory } from '../rules/validators/ValidatorFactory';
import { CastlingHandler } from '../rules/special-moves/CastlingHandler';
import { EnPassantHandler } from '../rules/special-moves/EnPassantHandler';
import { PromotionHandler } from '../rules/special-moves/PromotionHandler';
import { MoveExecutor } from '../services/MoveExecutor';
import { FenGenerator } from '../services/FenGenerator';

export class Game {
  private readonly castlingHandler = new CastlingHandler();
  private readonly enPassantHandler = new EnPassantHandler();
  private readonly promotionHandler = new PromotionHandler();
  private readonly moveExecutor = new MoveExecutor();
  private readonly attackCache = new Map<string, boolean>();

  public generateAllLegalMoves(
    board: BoardState,
    color: PieceColor,
    gameState: GameState,
    logger: DebugLogger
  ): Move[] {
    logger.group(`Game.generateAllLegalMoves for ${color}`);
    
    // Create a temporary, short-lived cache for this specific move generation cycle.
    const moveGenCache = new Map<string, boolean>();

    const legalMoves: Move[] = [];
    for (let r = 0; r < 8; ++r) {
      for (let c = 0; c < 8; ++c) {
        const piece = board[r][c];
        if (!piece || piece.color !== color) continue;
        
        const fromCoord: BoardCoord = { row: r, col: c };
        // Pass the new temporary cache down the call stack.
        legalMoves.push(
          ...this._generateMovesForPiece(board, piece, fromCoord, gameState, logger, moveGenCache)
        );
      }
    }
    legalMoves.push(...this._generateSpecialMoves(board, color, gameState, logger, moveGenCache));
    logger.groupEnd();
    return legalMoves;
  }

  // This method uses the PERSISTENT cache and is primarily for between-turn checks.
  public isSquareAttacked(
    board: BoardState,
    position: BoardCoord,
    attackingColor: PieceColor,
    gameState: GameState,
    logger: DebugLogger
  ): boolean {
    const boardKey = FenGenerator.getPositionKey(board, gameState);
    const cacheKey = `${boardKey}:${position.row},${position.col}:${attackingColor}`;
    const hit = this.attackCache.get(cacheKey);

    if (hit !== undefined) {
      logger.log(`isSquareAttacked([${position.row},${position.col}]) by ${attackingColor}: PERSISTENT CACHE HIT`, 'color: #009688');
      return hit;
    }
    
    logger.log(`isSquareAttacked([${position.row},${position.col}]) by ${attackingColor}: PERSISTENT CACHE MISS - Calculating...`, 'color: #D32F2F');
    const result = this._calculateIsSquareAttacked(
      board,
      position,
      attackingColor
    );
    this.attackCache.set(cacheKey, result);
    return result;
  }

  private _generateMovesForPiece(
    board: BoardState, piece: Piece, from: BoardCoord, gameState: GameState, logger: DebugLogger, moveGenCache: Map<string, boolean>
  ): Move[] {
    const validator = ValidatorFactory.getValidatorCached(piece);
    const potentialDestinations = validator.getPotentialMoves(from);
    const moves: Move[] = [];

    if (potentialDestinations.length > 0) {
      logger.log(`%c[Generator] For ${piece.color} ${piece.type} at [${from.row},${from.col}], checking ${potentialDestinations.length} potential moves...`, 'color: cyan');
    }

    for (let i = 0, len = potentialDestinations.length; i < len; ++i) {
      const to = potentialDestinations[i];

      if (!validator.isValidMove(board, from, to)) {
        continue;
      }

      const validated = this._validateMoveLite(
        piece, board, from, to, gameState, logger, moveGenCache
      );
      if (validated) moves.push(validated);
    }
    return moves;
  }

  private _validateMoveLite(
    piece: Piece, board: BoardState, from: BoardCoord, to: BoardCoord, gameState: GameState, logger: DebugLogger, moveGenCache: Map<string, boolean>
  ): Move | null {
    logger.log(`  > [Validator] Path for [${from.row},${from.col}] to [${to.row},${to.col}] is clear. Now checking for king safety.`);

    const destinationPiece = board[to.row][to.col];
    if (destinationPiece && destinationPiece.color === piece.color) return null;

    const kingPos = piece.color === 'white' ? gameState.whiteKingPos : gameState.blackKingPos;
    
    const pieceSnapshot: Piece = { ...piece };
    const move: Move = { from, to, piece: pieceSnapshot, captured: destinationPiece || undefined };

    if (this.promotionHandler.needsPromotion(piece, to)) {
      move.promotion = 'queen';
    }

    // This specialized function uses the TEMPORARY cache for the simulation.
    const isAttackedDuringSim = (b: BoardState, p: BoardCoord, c: PieceColor) => {
      const tempCacheKey = `${p.row},${p.col}:${c}`;
      const hit = moveGenCache.get(tempCacheKey);
      if (hit !== undefined) {
        logger.log(`    - isAttackedDuringSim: TEMP CACHE HIT`, 'color: #4CAF50');
        return hit;
      }
      logger.log(`    - isAttackedDuringSim: TEMP CACHE MISS`, 'color: #F44336');
      const result = this._calculateIsSquareAttacked(b, p, c);
      moveGenCache.set(tempCacheKey, result);
      return result;
    };

    const wouldBeInCheck = this.moveExecutor.wouldLeaveKingInCheck(board, move, kingPos, isAttackedDuringSim);
    
    if (wouldBeInCheck) {
      logger.log(`    - Move [${from.row},${from.col}] to [${to.row},${to.col}] REJECTED (leaves king in check).`);
      return null;
    }

    return move;
  }

  private _generateSpecialMoves(board: BoardState, color: PieceColor, gameState: GameState, logger: DebugLogger, moveGenCache: Map<string, boolean>): Move[] {
    // --- START OF FULL IMPLEMENTATION ---
    logger.group('Game._generateSpecialMoves');
    const moves: Move[] = [];
    const kingPos = color === 'white' ? gameState.whiteKingPos : gameState.blackKingPos;
    const king = board[kingPos.row][kingPos.col];

    // Create the same temporary checking function for special moves.
    const isAttackedDuringSim = (b: BoardState, p: BoardCoord, c: PieceColor) => {
      const tempCacheKey = `${p.row},${p.col}:${c}`;
      const hit = moveGenCache.get(tempCacheKey);
      if (hit !== undefined) {
        // This is a silent hit check; we don't need to log every single one inside the helper.
        return hit;
      }
      const result = this._calculateIsSquareAttacked(b, p, c);
      moveGenCache.set(tempCacheKey, result);
      return result;
    };

    // 1. Check for Castling
    if (king?.type === 'king') {
      logger.log('  > Checking for castling moves...', 'color: #2196F3');
      // Kingside
      const ks = this.castlingHandler.canCastle(board, king, kingPos, { row: kingPos.row, col: 6 }, isAttackedDuringSim);
      if (ks.valid && ks.move) {
        logger.log('    - Kingside castling is valid. Adding move.', 'color: #2196F3');
        moves.push(ks.move);
      }
      // Queenside
      const qs = this.castlingHandler.canCastle(board, king, kingPos, { row: kingPos.row, col: 2 }, isAttackedDuringSim);
      if (qs.valid && qs.move) {
        logger.log('    - Queenside castling is valid. Adding move.', 'color: #2196F3');
        moves.push(qs.move);
      }
    }

    // 2. Check for En Passant
    const last = gameState.getLastMove();
    if (last && last.piece.type === 'pawn' && Math.abs(last.to.row - last.from.row) === 2) {
      logger.log(`  > Checking for en passant capture against pawn at [${last.to.row},${last.to.col}]...`, 'color: #2196F3');
      const victimPos = last.to;
      const adjacent = [{ row: victimPos.row, col: victimPos.col - 1 }, { row: victimPos.row, col: victimPos.col + 1 }];

      for (const from of adjacent) {
        const attacker = board[from.row]?.[from.col];
        if (!attacker || attacker.type !== 'pawn' || attacker.color !== color) continue;
        
        const dir = color === 'white' ? 1 : -1;
        const to = { row: from.row + dir, col: victimPos.col };
        if (
          this.enPassantHandler.isEnPassantMove(attacker, board, from, to, last) &&
          !this.moveExecutor.wouldLeaveKingInCheck(board, { from, to, piece: attacker, isEnPassant: true, captured: last.piece }, kingPos, isAttackedDuringSim)
        ) {
          logger.log(`    - En passant capture is valid for pawn at [${from.row},${from.col}]. Adding move.`, 'color: #2196F3');
          moves.push({ from, to, piece: attacker, isEnPassant: true, captured: last.piece });
        }
      }
    }
    
    logger.groupEnd();
    return moves;
    // --- END OF FULL IMPLEMENTATION ---
  }

  private _calculateIsSquareAttacked(board: BoardState, pos: BoardCoord, color: PieceColor): boolean {
    for (let r = 0; r < 8; ++r) {
      for (let c = 0; c < 8; ++c) {
        const piece = board[r][c];
        if (!piece || piece.color !== color) continue;
        if (piece.type === 'pawn') {
          const dir = color === 'white' ? 1 : -1;
          if (r + dir === pos.row && (c - 1 === pos.col || c + 1 === pos.col))
            return true;
        } else {
          const validator = ValidatorFactory.getValidatorCached(piece);
          if (validator.isValidMove(board, { row: r, col: c }, pos)) return true;
        }
      }
    }
    return false;
  }
}