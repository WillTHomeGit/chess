// Service for board-related operations (uses BoardUtils)
import { BoardUtils } from '../utils/BoardUtils';

// Re-export BoardUtils methods as a service
export class BoardService {
  static createInitialBoard = BoardUtils.createInitialBoard;
  static cloneBoard = BoardUtils.cloneBoard;
  static getPieceAt = BoardUtils.getPieceAt;
  static setPieceAt = BoardUtils.setPieceAt;
  static isValidPosition = BoardUtils.isValidPosition;
  static findPiece = BoardUtils.findPiece;
  static getPiecesByColor = BoardUtils.getPiecesByColor;
}