// Import necessary types from 'chess.js'
import { Chess, Square } from 'chess.js';

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type DefenseStatus = 'defended' | 'overdefended' | 'undefended' | 'underdefended';

export type PieceInEffect = {
    at: string;
    name: string;
    color: 'w' | 'b';
    attackers: PieceInEffect[];
    defenders: PieceInEffect[];
}

export type PieceRecord = {
    r: number;
    n: number;
    b: number;
    q: number;
    p: number;
}

export type TacticalMove = {
    tactic: 'fork' | 'pin' | 'skewer' | 'doubleCheck' | 'trap';
    targets?: PieceInEffect[];
}

export type MoveEffect = {
    piece: PieceInEffect;
    capturedPiece?: PieceInEffect;

    type: 'promotion' | 'capture' | 'check' | 'checkmate' | 'stalemate' | 'enPassant' | 'castling' | 'normal' | 'attacking' | 'fianchetto';
    defense: 'underdefended' | 'undefended' | 'defended' | 'overdefended';

    attacks: PieceInEffect[];
    defends: PieceInEffect[];

    tactics: TacticalMove[];
    hangingPieces: {
        w: PieceInEffect[];
        b: PieceInEffect[];
    };
};

export class BetterChess extends Chess {
    public materialCaptured: {
        w: ('p' | 'r' | 'b' | 'n' | 'q')[];
        b: ('p' | 'r' | 'b' | 'n' | 'q')[];
    };

    constructor(fen?: string, val?: { skipValidation?: boolean | undefined });
    moveAndAnalyze(...args: Parameters<Chess['move']>): MoveEffect | null;
    getAnalysisAt(square: Square): MoveEffect | null;
}