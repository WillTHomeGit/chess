/**
 * @file Factory for creating and caching piece validators.
 * Using a cached factory prevents the creation of new validator objects
 * in tight loops (e.g., move generation), reducing garbage collection pressure
 * and improving performance.
 */

import type { Piece } from '../../types/Piece';
import type { PieceValidator } from './PieceValidator';
import { PawnValidator } from './PawnValidator';
import { KnightValidator } from './KnightValidator';
import { BishopValidator } from './BishopValidator';
import { RookValidator } from './RookValidator';
import { QueenValidator } from './QueenValidator';
import { KingValidator } from './KingValidator';

export class ValidatorFactory {
  // --- NEW ---
  /**
   * A private, static cache to store singleton instances of each validator.
   * Note: Pawn validators are special as they are color-dependent.
   */
  private static readonly validatorCache = {
    pawn_white: new PawnValidator('white'),
    pawn_black: new PawnValidator('black'),
    knight: new KnightValidator(),
    bishop: new BishopValidator(),
    rook: new RookValidator(),
    queen: new QueenValidator(),
    king: new KingValidator(),
  };

  /**
   * Gets the appropriate validator for a given piece.
   * This is the original, non-cached method. It creates a new instance on every call.
   * It should be considered deprecated in performance-critical code.
   * @param piece - The piece to get the validator for.
   * @returns A new validator instance for the piece.
   */
  static getValidator(piece: Piece): PieceValidator {
    switch (piece.type) {
      case 'pawn':
        return new PawnValidator(piece.color);
      case 'knight':
        return new KnightValidator();
      case 'bishop':
        return new BishopValidator();
      case 'rook':
        return new RookValidator();
      case 'queen':
        return new QueenValidator();
      case 'king':
        return new KingValidator();
      default:
        // This is a safeguard. In a type-safe environment, it should not be reached.
        throw new Error(`Unknown piece type: ${piece.type}`);
    }
  }

  // --- NEW METHOD IMPLEMENTED ---
  /**
   * Gets a cached, singleton instance of the appropriate validator for a given piece.
   * This is the preferred method for performance-critical code as it avoids
   * repeated object allocation.
   * @param piece The piece to get the validator for.
   * @returns The cached validator instance for the piece.
   */
  static getValidatorCached(piece: Piece): PieceValidator {
    switch (piece.type) {
      case 'pawn':
        // Pawns are a special case because their movement depends on color.
        return piece.color === 'white' 
          ? this.validatorCache.pawn_white 
          : this.validatorCache.pawn_black;
      case 'knight':
        return this.validatorCache.knight;
      case 'bishop':
        return this.validatorCache.bishop;
      case 'rook':
        return this.validatorCache.rook;
      case 'queen':
        return this.validatorCache.queen;
      case 'king':
        return this.validatorCache.king;
      default:
        // This default case should ideally not be reachable if all piece types are handled.
        // We throw an error here to fail fast if a new, unhandled piece type is introduced.
        throw new Error(`Unknown piece type for cached validator: ${piece.type}`);
    }
  }
}