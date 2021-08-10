var fen = '4k3/8/8/8/8/6rK/8/8 w KQkq - 0 1'
var worker = new Worker('worker-1.0.js')

var time_interval
var $timewhite = $('#timewhite')
var $timeblack = $('#timeblack')
var mouse_square
var board = null
var chess = new Chess(fen)
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

function removeGreySquares () {
  $('#board-container .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#board-container .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDragStart (source, piece) {
  if ((chess.turn() === 'w' && piece.search(/^w/) === -1) ||
      (chess.turn() === 'b' && piece.search(/^b/) === -1)) {
    return false
  }

  removeGreySquares()

  var moves = chess.moves({
    square: source,
    verbose: true
  })

  if (moves.length === 0) return

  greySquare(source)

  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }

  if (chess.game_over()) return false
}

function onDrop (source, target) {
  var move = chess.move({
    from: source,
    to: target,
    promotion: 'q'
  })

  source_square = source

  if (move === null) return 'snapback'

  worker.postMessage({ type: 'Move', move, settings });
  if (!settings.game_started) {
    settings.game_started = true
    time_interval = setInterval(() => {
      chess.turn() == 'w' ? settings.time_white -= 100 : settings.time_black -= 100
      $timewhite.html(ms_to_timer(settings.time_white))
      $timeblack.html(ms_to_timer(settings.time_black))
      if (settings.time_white <= 0) {
        timeout(false)
      }
      if (settings.time_black <= 0) { 
        timeout(true)
      }
    }, 100)
  }
}

function onMouseoverSquare (square, piece) {
  mouse_square = square
}

function onSnapEnd(source, target) {
  removeGreySquares()
}

var config = {
  draggable: true,
  position: fen,
  orientation: 'white',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
}

board = Chessboard('board-container', config)

var data
var settings = {
  depth: 3,
  time_white: 60000 * .1,
  time_black: 60000 * .1,
  game_started: false
}

function timeout(winner) {
  winner ? alert('Game over, won by time!') : alert('Game over, lost by time!')
  settings.game_started = false
  clearInterval(time_interval)
  commandSetup()
}

var commandSetup = function() {
  chess.load(fen)
  board.position(chess.fen())
  worker.postMessage({ type: 'Setup', fen: chess.fen() })
  settings = {
    depth: 3,
    time_white: 60000 * .1,
    time_black: 60000 * .1,
    game_started: false
  }
}

commandSetup()

worker.onmessage = function(message) {
  data = message.data
  eval('command' + data.type + '()')
}

var commandMove = function() {
  chess.move(data.move)
  board.position(chess.fen())
  if (chess.game_over()) {
    if (chess.in_stalemate()) { alert('Draw, stalemate!');settings.game_started = false;clearInterval(time_interval);commandSetup() }
    if (chess.in_threefold_repetition()) { alert('Draw, threefold repetition!');settings.game_started = false;clearInterval(time_interval);commandSetup() }
    if (chess.insufficient_material()) { alert('Draw, insufficient material!');settings.game_started = false;clearInterval(time_interval);commandSetup() }
    if (chess.in_checkmate()) { alert(chess.turn() == 'w' ? 'Checkmate, computer wins' : 'Checkmate, you win');settings.game_started = false;clearInterval(time_interval);commandSetup() }
  }
}

function ms_to_timer(ms) {
  var minutes = Math.floor(ms / 60000)
  var seconds = ((ms % 60000) / 1000).toFixed(0)
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}