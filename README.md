# Weakfish

### Simple [Chess](https://en.wikipedia.org/wiki/Chess) artificial intelligence written in JavaScript.

Makes use of : 
 - [Chessboardjs](https://chessboardjs.com/) for the board UI
 - [Chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md) for move generation/validation, piece placement/movement, and check/checkmate/stalemate detection
 
### Versions, AI strength & methods used

 - **v(0.1)** _depth 3_ [Negamax](https://www.chessprogramming.org/Negamax), [α-β Pruning](https://www.chessprogramming.org/Alpha-Beta).
 - **v(0.3)** _depth 3_ [Negamax](https://www.chessprogramming.org/Negamax), [α-β Pruning](https://www.chessprogramming.org/Alpha-Beta), [Move ordering](https://www.chessprogramming.org/Move_Ordering).

### Update changes & history

 - **v(0.3)**  10/08/21 > Added simple move ordering
 - **v(0.1 - First version)**  10/08/21

### Todo list

 - Add [Iterative deepening](https://www.chessprogramming.org/Iterative_Deepening)
 - Add [Opening book](https://www.chessprogramming.org/Opening_Book)
 - Add [Zobrist hashing](https://www.chessprogramming.org/Zobrist_Hashing) and [Transposition table](https://www.chessprogramming.org/Transposition_Table)
 - Improve evaluation speed and accuracy (bishop pair bonus, knight pair malus, endgame positions...)
 - Improve move ordering
  
### Looks cool i wanna play it 😍

 - You can try to defeat it on https://chess.ludovicdebever.site
