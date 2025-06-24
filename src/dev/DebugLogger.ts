/**
 * A simple, controllable logger that only outputs to the console
 * when the application is in debug mode (via URL parameter).
 */
export class DebugLogger {
  private readonly isEnabled: boolean = false;

  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.isEnabled = urlParams.get('debug') === 'true';
  }

  /**
   * Starts a new collapsible group in the console.
   * @param label The label for the log group.
   */
  public group(label: string): void {
    if (this.isEnabled) {
      console.group(label);
    }
  }

  /**
   * Closes the current collapsible group.
   */
  public groupEnd(): void {
    if (this.isEnabled) {
      console.groupEnd();
    }
  }

  /**
   * Logs a standard message, with optional styling.
   * @param message The message to log.
   * @param style Optional CSS style string for the message.
   */
  public log(message: string, style: string = ''): void {
    if (this.isEnabled) {
      if (style) {
        console.log(`%c${message}`, style);
      } else {
        console.log(message);
      }
    }
  }
}