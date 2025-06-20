import { Chess, type Square } from 'chess.js';
import { moveInfo } from './utils';

import type { MoveEffect, PieceRecord } from './types';

export class BetterChess extends Chess {
  public material: {
    w: PieceRecord;
    b: PieceRecord;
  } = {
    w: { r: 2, n: 2, b: 2, q: 1, p: 8 },
    b: { r: 2, n: 2, b: 2, q: 1, p: 8 },
  };

  constructor(fen?: string, val?: { skipValidation?: boolean | undefined }) {
    super(fen, val);
  }


  /* 🎯 Analysis for current move */
  moveAndAnalyze(...args: Parameters<Chess['move']>) {
    const move = super.move(...args);
    const turn = super.turn();

    const analysis = move ? moveInfo(move.to, move.after, move.before) : null;
    const piece = analysis?.capturedPiece;

    if (piece) this.material[turn][piece.name as 'r' | 'n' | 'q' | 'p' | 'b']--;
    
    if (analysis?.type === 'promotion') {
      const promotedPiece = move.promotion as 'q' | 'r' | 'b' | 'n';
      this.material[turn === 'w' ? 'b' : 'w'][promotedPiece]++;
    }

    return analysis;
  }


  /* ⚡ Analysis at any square */
  getAnalysisAt(square: string): MoveEffect | null {
    const history = this.history({ verbose: true });
    const lastMove = history[history.length - 2];

    return moveInfo(square, this.fen(), lastMove?.after || undefined);
  }
}
