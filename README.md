# ♟️ better-chess.js

## An Enhanced Chess.js Library with Advanced Analysis and Tactical Insights

[![NPM Version](https://img.shields.io/npm/v/better-chess.js.svg?style=flat-square)](https://www.npmjs.com/package/better-chess.js)
[![NPM Downloads](https://img.shields.io/npm/dm/better-chess.js.svg?style=flat-square)](https://www.npmjs.com/package/better-chess.js)
[![GitHub Stars](https://img.shields.io/github/stars/aakware/better-chess.js.svg?style=social)](https://github.com/aakware/better-chess.js/stargazers)
[![License](https://img.shields.io/github/license/aakware/better-chess.js.svg?style=flat-square)](LICENSE)

---

## ✨ Features

`better-chess.js` extends the popular `chess.js` library, providing a richer API for deeper analytical insights directly within your chess applications. It's built with TypeScript for robust type-safety and enhanced developer experience.

- **⚡ Real-time Move Analysis:** Get detailed tactical and positional insights immediately after making a move.
- **🔍 On-Demand Square Analysis:** Query any square on the board for comprehensive analysis of pieces, attacks, defenses, and inherent tactics.
* **🧠 Tactical Pattern Detection:** Automatically identifies common chess tactics like:
    * **Forks** (Knights, Queens, Rooks, Bishops)
    * **Pins** 
    * **Skewers**
    * And more coming soon!
- **📊 Material Tracking:** Automatically tracks available material for both sides.
- **💯 Type-Safe & Modern:** Written entirely in TypeScript, offering excellent IntelliSense and reducing common runtime errors.
- **🧩 Extends `chess.js`:** All familiar `chess.js` methods and functionalities are fully inherited and available.

---

## 📦 Installation

```bash
npm install better-chess.js
```


## 📖 Usage

You can use `better-chess.js` just like you would with `chess.js`, but with the added benefit of advanced analysis capabilities. You will get 2 new methods: `moveAndAnalyze` and `analyzeAt`, and a property `material` to track the material available for both sides.

```ts
import { BetterChess } from 'better-chess.js';

const chess = new BetterChess();

/* ⚡ Grab the move analysis after making a move */
const analysis = chess.moveAndAnalyze({
    from: 'e2',
    to: 'e4',
    promotion: 'q' // Optional, for pawn promotion
});


/* 🔍 Analyze a specific square */
const squareAnalysis = chess.analyzeAt('g6');
```

## 🎯 Analysis Format 

The analysis object follows this format:

```ts
/* 💡 The Analysis Object Type! */
export type MoveEffect = {
    piece: PieceInEffect;
    capturedPiece?: PieceInEffect;

    type: MoveEffectType;
    defense: 'underdefended' | 'undefended' | 'defended' | 'overdefended';

    attacks: PieceInEffect[];
    defends: PieceInEffect[];

    tactics: TacticalMove[];
    hangingPieces: {
        w: PieceInEffect[];
        b: PieceInEffect[];
    };
};
```


The other types used in the analysis are defined as follows:

```ts
/* ♟️ General Piece Information */
export type PieceInEffect = {
    at: string;
    name: string;
    color: 'w' | 'b';
    attackers: PieceInEffect[];
    defenders: PieceInEffect[];
}

/* 🧠 Tactical Move Information */
export type TacticalMove = {
    tactic: 'fork' | 'pin' | 'skewer' | 'doubleCheck' | 'trap';
    targets: PieceInEffect[];
}

/* 🧩 Move Effect Types */
type MoveEffectType = 
    | 'promotion'
    | 'capture'
    | 'check'
    | 'checkmate'
    | 'stalemate'
    | 'enPassant'
    | 'castling'
    | 'normal'
    | 'attacking'
    | 'fianchetto';
```

<details>
<summary>💡 Click to see a sample Analysis Output</summary>

--- 

Let's consider the following position as mentioned in the image below, the latest move was Bishop to g4, pinning the Knight on f3 against the Queen on d1.

![Sample Analysis Output](/assets/sample-position.png)

The corresponding analysis output for this position would look like this:

```json
{
    "piece": {
        "at": "g4",
        "name": "b",
        "color": "b",
        "attackers": [],

        // which pieces are defending the bishop on g4?
        "defenders": [
            {
                "at": "f6",
                "name": "n",
                "color": "b",
                "attackers": [],
                "defenders": []
            }
        ]
    },

    // any tactical patterns detected in this position?
    "tactics": [
        {
            "tactic": "pin",

            // [0] -> the piece being pinned
            // [1] -> the piece behind the pinned piece
            "targets": [
                {
                    "at": "f3",
                    "name": "n",
                    "color": "w",
                    "attackers": [],
                    "defenders": []
                },
                {
                    "at": "d1",
                    "name": "q",
                    "color": "w",
                    "attackers": [],
                    "defenders": []
                }
            ]
        }
    ],

    // which enemy pieces can this bishop reach?
    "attacks": [
        {
            "at": "f3",
            "name": "n",
            "color": "w",
            "attackers": [],
            "defenders": []
        }
    ],

    "defends": [], // which same-color pieces are being guarded by the bishop?
    "type": "normal",
    "defense": "overdefended",

    // Piece data for any other pieces that are hanging (i.e., undefended) by both sides
    "hangingPieces": {
        "w": [
            {
                "at": "e4",
                "name": "p",
                "color": "w",
                "attackers": [
                    {
                        "at": "f6",
                        "name": "n",
                        "color": "b",
                        "attackers": [],
                        "defenders": []
                    },
                    {
                        "at": "d5",
                        "name": "p",
                        "color": "b",
                        "attackers": [],
                        "defenders": []
                    }
                ],
                "defenders": []
            }
        ],
        "b": [] // No hanging pieces for black in this position
    }
}
```

---
</details>


## Material Tracking 
`better-chess.js` automatically tracks the material available for both sides. You can access this information using:

```ts
const { w, b } = chess.material;

console.log(w) // { p: 8, n: 2, b: 2, r: 2, q: 1 }
console.log(b) // { p: 8, n: 2, b: 2, r: 2, q: 1 }
```

And yes, it also updates automatically as moves are made, captures occur, and promotions happen.

---

## 💡 Why `better-chess.js`

![Views Counter](https://views-counter.vercel.app/badge?pageId=better-chessjs&leftColor=524c4c&rightColor=02b12e&type=today&label=Viewers&style=none&label=Today)
![Views Counter](https://views-counter.vercel.app/badge?pageId=better-chessjs&leftColor=524c4c&rightColor=02b12e&type=total&label=Viewers&style=none)
![Views Counter](https://views-counter.vercel.app/badge?pageId=better-chessjs&leftColor=524c4c&rightColor=02b12e&type=unique&label=Viewers&style=none&label=Unique)

Although `chess.js` provides a robust foundation for chess game logic, `better-chess.js` extends its capabilities by offering direct, integrated analysis for tactical patterns and positional characteristics. 

This saves developers' time from having to implement complex analysis algorithms themselves, allowing them to focus on building engaging chess applications with advanced features.

---

## 📜 TODO
- [ ] Add support for more tactical patterns (e.g., discovered attacks, double attacks).
- [ ] Maybe add engine integration support for engine reviews and evaluations.
- [ ] Anything else you suggest!

---

## 📃 License 

`better-chess.js` is licensed under the [MIT License](LICENSE). Feel free to use it in your projects, both personal and commercial.

---

## 💖 Acknowledgements

This library builds upon the fantastic work of the `chess.js` team. Their robust game logic provides the essential foundation for `better-chess.js`.


## 🤝 Contributing

I welcome contributions! If you have ideas for new features, improvements, or bug fixes, please open an issue or submit a pull request.

## 📫 Contact

For any questions, suggestions, or feedback, feel free to reach out via [GitHub Issues](https://github.com/aakware/better-chess.js/issues) or my [Discord Server](https://discord.gg/JbqEFHqgpq); or you can directly DM me at `@aakash.er` on Discord!