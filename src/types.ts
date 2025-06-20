export type PieceInEffect = {
    at: string;
    name: string;
    color: 'w' | 'b';
    attackers: PieceInEffect[];
    defenders: PieceInEffect[];
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