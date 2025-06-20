import { Chess } from 'chess.js';
import { moveInfo } from './utils';

import type { MoveEffect } from './types';
export type { MoveEffect };


export class BetterChess extends Chess {
  constructor(fen?: string, val?: { skipValidation?: boolean | undefined }) {
    super(fen, val);
  }


  /* 🎯 Analysis for current move */
  moveAndAnalyze(...args: Parameters<Chess['move']>) {
    const move = super.move(...args);
    return move ? moveInfo(move.to, move.after, move.before) : null;
  }


  /* ⚡ Analysis at any square */
  getAnalysisAt(square: string): MoveEffect | null {
    const history = this.history({ verbose: true });
    const lastMove = history[history.length - 2];

    return moveInfo(square, this.fen(), lastMove?.after || undefined);
  }
}
