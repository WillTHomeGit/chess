// Handles keyboard shortcuts
export class KeyboardInputHandler {
  private onUndo: () => void;
  private onRedo: () => void;
  private isEnabled: boolean = false;

  constructor(onUndo: () => void, onRedo: () => void) {
    this.onUndo = onUndo;
    this.onRedo = onRedo;
  }

  /**
   * Enable keyboard input handling
   */
  enable(): void {
    if (this.isEnabled) return;
    
    window.addEventListener('keydown', this.handleKeyPress);
    this.isEnabled = true;
  }

  /**
   * Disable keyboard input handling
   */
  disable(): void {
    if (!this.isEnabled) return;
    
    window.removeEventListener('keydown', this.handleKeyPress);
    this.isEnabled = false;
  }

  /**
   * Handle key press events
   * @param event - Keyboard event
   */
  private handleKeyPress = (event: KeyboardEvent): void => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z') {
        event.preventDefault();
        this.onUndo();
      } else if (event.key === 'y') {
        event.preventDefault();
        this.onRedo();
      }
    }
  };

  /**
   * Check if input is currently enabled
   * @returns True if enabled
   */
  isInputEnabled(): boolean {
    return this.isEnabled;
  }
}