// DOM helpers – now event-driven
import type { EventEmitter } from '../services/EventEmitter';
import type { GameEvent, GameEndEvent, UITextUpdateEvent } from '../model/GameEvents';

export class UIUpdater {
  private readonly turnEl = document.getElementById('turn-indicator');

  constructor(events: EventEmitter<GameEvent>) {
    events.on('uiTextUpdate',  data => this.updateTurn(data));
    events.on('gameEnd',       data => this.showEnd(data.message));
  }

  /* ------------------------------------------------------------- dom */

  private updateTurn({ text, isCheck }: UITextUpdateEvent['data']): void {
    if (!this.turnEl) return;
    this.turnEl.textContent = isCheck ? `${text} (Check!)` : text;
    this.turnEl.style.color = isCheck ? '#ff6b6b' : '';
  }

  private showEnd(msg: GameEndEvent['data']['message']): void {
    setTimeout(() => alert(msg), 100);
  }
}