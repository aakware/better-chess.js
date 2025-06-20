import { Chess, type Square } from 'chess.js';
import type { MoveEffect, PieceInEffect } from './types.js';

type MoveCategory = 'castle' | 'check' | 'mate' | 'capture' | 'promotion' | 'developing' | 'neutral';
const PIECE_VALS: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 100
}

/**
 * Get the category of a move based on its Standard Algebraic Notation (SAN).
 * This function categorizes moves into different types such as castling, check, mate, capture, promotion, and developing moves.
 * @param san - Standard Algebraic Notation of the move
 * @returns {MoveCategory} - The category of the move 
 * @example
 * getMoveCategory('e4') // returns 'developing'
 */
export const getMoveCategory = (san: string): MoveCategory => {
    if (san.startsWith('O-O')) return 'castle';
    if (san.includes('#')) return 'mate';
    if (san.includes('+')) return 'check';
    if (san.includes('x')) return 'capture';
    if (san.includes('=')) return 'promotion'; // e.g. e8=Q
    return 'developing';
};


/**
 * Build a PieceInEffect object for a given square in the FEN string.
 * This function analyzes the piece at the specified square, its color, and its attackers and defenders.
 * @param square - The square to analyze (e.g., 'e4')
 * @param fen - The FEN string representing the current board state
 * @param depth - The depth of analysis for attackers/defenders (default is 1)
 * @returns {PieceInEffect | null} - The piece in effect or null if no piece exists at that square
*/

function buildPieceInEffect(square: string, fen: string, depth = 1): PieceInEffect | null {
    const chess = new Chess(fen);
    const piece = chess.get(square as Square);
    
    if (!piece) return null;
    const color = piece.color;

    const attackers: PieceInEffect[] = [];
    const defenders: PieceInEffect[] = [];

    const whiteReachable = chess.attackers(square as Square, 'w');
    const blackReachable = chess.attackers(square as Square, 'b');

    for (const from of [...whiteReachable, ...blackReachable]) {
        const p = chess.get(from);

        if (!p) continue;
        const sub = depth > 0 ? buildPieceInEffect(from, fen, 0) : null;
        
        if (!sub) continue;
        (p.color === color ? defenders : attackers).push(sub);
    }

    return {
        at: square,
        name: piece.type,
        color: color,
        attackers,
        defenders,
    };
};

/**
 * 
 * @param chessInstance 
 * @param startSquare 
 * @param dx 
 * @param dy 
 * @returns 
 */
function _getPiecesAlongRay(chessInstance: Chess, startSquare: Square, dx: number, dy: number, fen: string): PieceInEffect[] {
    const piecesOnRay: PieceInEffect[] = [];
    let x = startSquare.charCodeAt(0) + dx;
    let y = parseInt(startSquare[1]) + dy;

    while (x >= 'a'.charCodeAt(0) && x <= 'h'.charCodeAt(0) && y >= 1 && y <= 8) {
        const currentSquare = String.fromCharCode(x) + y;
        const piece = chessInstance.get(currentSquare as Square);

        if (piece) {
            const pieceEffect = buildPieceInEffect(currentSquare, fen, 0);
            if (!pieceEffect) break;

            piecesOnRay.push(pieceEffect);
            if (piecesOnRay.length === 2) break;
        }

        x += dx;
        y += dy;
    }
    return piecesOnRay;
}


/**
 * Analyze a move based on the piece's square, the current FEN, and an optional previous FEN.
 * This function determines the type of move (e.g., normal, capture, promotion) and analyzes the piece's attackers and defenders.
 * @param pieceSquare - The square of the piece being moved (e.g., 'e4')
 * @param fen - The current FEN string representing the board state
 * @param prevFen - The previous FEN string before the move (optional)
 * @returns {MoveEffect | null} - An object containing move effects or null if no piece exists at that square
*/
export function moveInfo(pieceSquare: string, fen: string, prevFen?: string): MoveEffect | null {
    const chess = new Chess(fen);

    const piece = chess.get(pieceSquare as Square);
    if (!piece) return null;

    let type: MoveEffect['type'] = 'normal';
    let moveObj = null;

    let capturedPiece: PieceInEffect | undefined = undefined;

    if (prevFen) {
        const prevChess = new Chess(prevFen);
        const moves = prevChess.moves({ verbose: true }) as any[];

        moveObj = moves.find(m => {
            const c = new Chess(prevFen);
            const res = c.move(m);

            return res && c.fen() === fen;
        });

        if (moveObj) {
            if (moveObj.flags.includes('p')) type = 'promotion';
            else if (moveObj.flags.includes('c') || moveObj.captured) type = 'capture';

            else if (moveObj.flags.includes('e')) type = 'enPassant';
            else if (moveObj.flags.includes('k') || moveObj.flags.includes('q')) type = 'castling';
            
            if (moveObj.san.includes('+')) type = 'check';
            if (moveObj.san.includes('#')) type = 'checkmate';

            const capturedPieceSquare = moveObj.to as Square;
            const captured = prevChess.get(capturedPieceSquare);

            if (captured) {
                capturedPiece = buildPieceInEffect(capturedPieceSquare, prevFen, 0) || undefined;

                if (capturedPiece) {
                    capturedPiece.at = capturedPieceSquare;
                    capturedPiece.name = captured.type;
                }
            }
        }
    }
    if (typeof chess.isStalemate === 'function' ? chess.isStalemate() : chess.isGameOver() && !chess.isCheckmate() && !chess.isDraw() && !chess.inCheck()) type = 'stalemate';
    

    /* ⚡ Attackers & Defenders */
    const pieceEffect = buildPieceInEffect(pieceSquare, fen, 1)!;
    let defense: MoveEffect['defense'] = 'undefended';

    const numAttackers = pieceEffect.attackers.length;
    const numDefenders = pieceEffect.defenders.length;

    if (numAttackers > 0) type = 'attacking';

    if (numDefenders === 0 && numAttackers > 0) defense = 'undefended';
    else if (numDefenders > 0 && numAttackers === 0) defense = 'overdefended';

    else if (numDefenders > 0 && numAttackers > 0) {
        if (numDefenders > numAttackers) defense = 'overdefended';
        else if (numDefenders < numAttackers) defense = 'underdefended';
        else defense = 'defended';
    } else defense = 'defended';


    /* 🏰 Fianchetto Logic */
    if (piece.type === 'b' && ['b2', 'g2', 'b7', 'g7'].includes(pieceSquare)) {
        const file = pieceSquare[0];
        const rank = pieceSquare[1];

        const adder = piece.color === 'w' ? 1 : -1;

        const frontPawn = chess.get(`${file}${Number(rank) + adder}` as Square);
        const frontPawnPlusOne = chess.get(`${file}${Number(rank) + adder * 2}` as Square);

        const isFianchettoPawnPresent = (pawn: { type: string; color: 'w' | 'b'} | null | undefined) =>
            pawn?.type === 'p' && pawn?.color === piece.color;

        if (isFianchettoPawnPresent(frontPawn) || isFianchettoPawnPresent(frontPawnPlusOne)) {
            type = 'fianchetto';
        }
    }

    /* 🪂 Hanging Piece Logic */
    const defends: PieceInEffect[] = [];

    const hangingPieces: { w: PieceInEffect[]; b: PieceInEffect[] } = { w: [], b: [] };
    for (let i = 0; i < 64; i++) {
        const file = 'abcdefgh'[i % 8],
              rank = Math.floor(i / 8) + 1,
              sq = `${file}${rank}`,
              p = chess.get(sq as Square);

        if (!p) continue;
        if (sq == pieceSquare) continue;

        const eff = buildPieceInEffect(sq, fen, 1);
        if (!eff) continue;

        /* 🛡️ Defend Logic */
        const defendedByPiece = eff.defenders.find(d => d.at === pieceSquare);
        if (defendedByPiece && eff.name !== 'k') defends.push(eff);
        
        if (eff.attackers.length > 0 && eff.defenders.length === 0) {
            hangingPieces[p.color].push(eff);
        }
    }

    /* 🤨 Attack Logic */
    const attacks: PieceInEffect[] = [];
    
    const alterFen = chess.fen().replace(/\s[wb]\s/, ` ${piece.color} `);
    const pieceReachable = (new Chess(alterFen)).moves({
        square: pieceSquare as Square,
        verbose: true,
    });

    for (const move of pieceReachable) {
        const targetSquare = move.to as Square;
        const targetPiece = chess.get(targetSquare);

        if (!targetPiece) continue;

        const targetEffect = buildPieceInEffect(targetSquare, fen, 0);
        if (!targetEffect) continue;

        if (targetPiece.color !== piece.color) attacks.push(targetEffect);
    }
    

    /* 🧩 Tactics Logic */

    const tactics: MoveEffect['tactics'] = [];

    /* 1. Forks */
    if (attacks.length > 1) tactics.push({ tactic: 'fork', targets: attacks });


    /* 2. Pins & Skewers */
    if (['b', 'r', 'q'].includes(piece.type)) {
        const ALL_8_DIRECTIONS = [
            [0, 1], [0, -1], [1, 0], [-1, 0], // N, S, E, W (ranks/files)
            [1, 1], [1, -1], [-1, 1], [-1, -1] // NE, SE, NW, SW (diagonals)
        ];

        const DIRECTIONS = {
            b: ALL_8_DIRECTIONS.slice(4, 8),
            r: ALL_8_DIRECTIONS.slice(0, 4),
            q: ALL_8_DIRECTIONS
        }

        for (const [dx, dy] of DIRECTIONS[piece.type as 'b' | 'r' | 'q']) {
            const piecesOnRay = _getPiecesAlongRay(chess, pieceSquare as Square, dx, dy, chess.fen());

            if (piecesOnRay.length < 2) continue;

            const firstPiece = piecesOnRay[0];
            const secondPiece = piecesOnRay[1];

            if (firstPiece.color !== piece.color && secondPiece.color !== piece.color) {
                const piece1Value = PIECE_VALS[firstPiece.name];
                const piece2Value = PIECE_VALS[secondPiece.name];

                let tacticName: 'pin' | 'skewer' = 'pin';

                if (piece1Value > piece2Value && ['defended', 'overdefended'].includes(defense)) {
                    tacticName = 'skewer';
                }
                
                tactics.push({
                    tactic: tacticName,
                    targets: [firstPiece, secondPiece]
                });
            }
        }
    }

    return {
        piece: pieceEffect,
        capturedPiece,
        tactics,
        attacks,
        defends,
        type,
        defense,
        hangingPieces,
    };
};