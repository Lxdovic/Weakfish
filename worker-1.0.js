importScripts('js/chess.js')

var chess, settings

/* Message handle function
* get every instruction sent from "main.js" and executes them
* example instruction : { type: 'Setup', fen: chess.fen() }
* this will execute the "commandSetup" function at line 23
*/
var onmessage = function(message) {
    data = message.data
    eval('command' + data.type + '()')
}

// Make the move sent by "main.js" and starts the search algorithm
var commandMove = function() {
    settings = data.settings
    chess.move(data.move) // move
    rootnegamax() // search
}

// Setup the board with the given fen string
var commandSetup = function() {
    chess = new Chess(data.fen)
}

// Negamax algorithm root
var rootnegamax = function() {
    var start = performance.now()
    var depth = settings.depth
    var moves = chess.moves({ verbose: true })
    var max = -Infinity
    var best_move
    
    for (var i in moves) {
        chess.move(moves[i])
        var score = -negamax(depth - 1, -999999, 999999)
        chess.undo()

        if (score > max) { max = score; best_move = moves[i] }
    }

    postMessage({ type: 'Move', move: chess.move(best_move)})
}

/* Negamax algorithm (negated Minimax, faster than vanilla minimax)
* with alpha-beta pruning
*
* ADD MOVE ORDERING
* ADD TRANSPOSITION TABLES
* ADD ITERATIVE DEEPENING
*/
var negamax = function(depth, alpha, beta) {
    if (depth == 0) { return evaluate() }
    var moves = chess.moves({ verbose: true })
    var l = moves.length
    for (var i = 0; i < l; i++) {
        chess.move(moves[i])
        var score = -negamax(depth - 1, -beta, -alpha)
        chess.undo()

        if (score >= beta) { return score }
        if (score > alpha) { alpha = score }
    }

    return alpha
}

/* Evaluation function, this is used to determine if a position
* is great or bad for us.
*/
var evaluate = function() {
    if (chess.in_checkmate()) { return chess.turn() === 'w' ? 999999 : -999999 }
    if (chess.in_threefold_repetition() || chess.in_stalemate() || chess.in_draw()) {
        return chess.turn() === 'w' ? 999999 : -999999
    }
    
    var total = 0

    // loop through the board
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            // get every piece
            var piece = chess.get(String.fromCharCode(97 + i) + (j+1))

            // exit as soon as possible if there's not piece
            if (!piece) { continue }

            /* add the piece value
            * p > pawn > 100
            * n > knight > 320
            * b > bishop > 330
            * r > rook > 500
            * q > queen > 900
            * k > king > 20000
            */
            var index = j * 8 + i
            switch (piece.type) {
                case 'p': total += (piece.color == 'w' ? 100 + white_pawn[index] : - (100 + black_pawn[index])); break
                case 'n': total += (piece.color == 'w' ? 320 + white_knight[index] : - (320 + black_knight[index])); break
                case 'b': total += (piece.color == 'w' ? 330 + white_bishop[index] : - (330 + black_bishop[index])); break
                case 'r': total += (piece.color == 'w' ? 500 + white_rook[index] : - (500 + black_rook[index])); break
                case 'q': total += (piece.color == 'w' ? 900 + white_queen[index] : - (900 + black_queen[index])); break
                case 'k': total += (piece.color == 'w' ? 20000 + white_king[index] : - (20000 + black_king[index])); break // CHANGE TO "w/b_king_endgame" table on endgame positions
            }
            /* Also give bonuses and maluses
            * ADD BISHOP PAIR BONUS
            * ADD KNIGHT PAIR MALUS
            * ADD PAWN STRUCTURE BONUS / MALUS
            * ADD KING PROXIMITY ON ENDGAME
            */
        }
    }

    return chess.turn() === 'w' ? total : -total
}

var reverse_array = function(array) {
    return array.slice().reverse()
}

var black_pawn = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
]

var white_pawn = reverse_array(black_pawn)

var black_knight = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
]

var white_knight = reverse_array(black_knight)

var black_bishop = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
]

var white_bishop = reverse_array(black_bishop)

var black_rook = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
]

var white_rook = reverse_array(black_rook)

var black_queen = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
]

var white_queen = reverse_array(black_queen)

var black_king = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
]

var white_king = reverse_array(black_king)

var black_king_endgame = [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50
]

var white_king_endgame = reverse_array(black_king_endgame)