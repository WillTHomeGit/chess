// Handles mouse input on the chess board
import type { BoardCoord } from '../types/Board';
import { CoordinateUtils } from '../utils/CoordinateUtils';

export class MouseInputHandler {
  private canvas: HTMLCanvasElement;
  private squareSize: number;
  private onSquareClick: (coord: BoardCoord) => void;
  private isEnabled: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    squareSize: number,
    onSquareClick: (coord: BoardCoord) => void
  ) {
    this.canvas = canvas;
    this.squareSize = squareSize;
    this.onSquareClick = onSquareClick;
  }

  /**
   * Enable mouse input handling
   */
  enable(): void {
    if (this.isEnabled) return;
    
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.isEnabled = true;
  }

  /**
   * Disable mouse input handling
   */
  disable(): void {
    if (!this.isEnabled) return;
    
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.isEnabled = false;
  }

  /**
   * Handle mouse down event
   * @param event - Mouse event
   */
  private handleMouseDown = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const coord = CoordinateUtils.pixelToBoardCoord(x, y, this.squareSize);
    this.onSquareClick(coord);
  };

  /**
   * Update square size when board is resized
   * @param newSquareSize - New square size in pixels
   */
  updateSquareSize(newSquareSize: number): void {
    this.squareSize = newSquareSize;
  }

  /**
   * Check if input is currently enabled
   * @returns True if enabled
   */
  isInputEnabled(): boolean {
    return this.isEnabled;
  }
}