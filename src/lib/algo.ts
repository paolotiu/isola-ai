import { _Board } from './game';
// def _max_value(self, game, depth):
// if self.time_left() < self.TIMER_THRESHOLD:
// 		raise SearchTimeout()

// if self._terminal_state(game, depth):
// 		return self.score(game, self)

// score = float("-inf")
// for move in game.get_legal_moves():
// 		min_value = self._min_value(game.forecast_move(move), depth - 1)
// 		score = max(score, min_value)

// return score

const calculateScore = (board: _Board, player: 1 | 2) => {
  const opp = player === 1 ? 2 : 1;
  if (board.getWinner() === player) {
    return Infinity;
  }

  if (board.getWinner() === opp) {
    return -Infinity;
  }

  // own_moves = len(game.get_legal_moves(player))
  // opp_moves = len(game.get_legal_moves(game.get_opponent(player)))
  // return float(own_moves - 3 * opp_moves)

  let ownMoves = board.getLegalMoves(player).length;
  let oppMoves = board.getLegalMoves(opp).length;

  // Which square your opp can move to that provides the most available squares (Higher is better)
  // Highest potential available square to opp after destruction (Lower is better)
  // 	On collision of best moves, choose first
  //own_moves - 2 * opp_moves

  if (board.getAlgoForPlayer(player) === 'minimax') {
    return ownMoves - oppMoves;
  }

  if (board.getAlgoForPlayer(player) === '3') {
    for (const firstMove of board.getLegalMoves(player)) {
      const nextGame = board.forecastMove(firstMove);
      for (const secondMove of nextGame.getLegalMoves(player)) {
        const nextNextGame = nextGame.forecastMove(secondMove);
        ownMoves += nextNextGame.getLegalMoves(player).length;
      }
    }

    for (const firstMove of board.getLegalMoves(opp)) {
      const nextGame = board.forecastMove(firstMove);
      for (const secondMove of nextGame.getLegalMoves(opp)) {
        const nextNextGame = nextGame.forecastMove(secondMove);
        oppMoves += nextNextGame.getLegalMoves(opp).length;
      }
    }
    // return float(own_score - 2 * opp_score)

    return ownMoves - 3 * oppMoves + ownMoves * 3;
  }

  console.log('algo not found');
  return ownMoves - 2 * oppMoves;
};

const maxValue = (board: _Board, forPlayer: 1 | 2, depth: number) => {
  let score = -Infinity;

  const legalMoves = board.getLegalMovesAdaptive(board.getTurn());

  if (depth === 0 || legalMoves.length === 0) {
    return calculateScore(board, forPlayer);
  }

  for (const move of legalMoves) {
    const minVal = minValue(board.forecastMove(move), forPlayer, depth - 1);

    score = Math.max(score, minVal);
  }

  return score;
};

const minValue = (board: _Board, forPlayer: 1 | 2, depth: number) => {
  let score = Infinity;

  const legalMoves = board.getLegalMovesAdaptive(board.getTurn());
  if (depth === 0 || legalMoves.length === 0) {
    return calculateScore(board, forPlayer);
  }

  for (const move of legalMoves) {
    const maxVal = maxValue(board.forecastMove(move), forPlayer, depth - 1);

    score = Math.min(score, maxVal);
  }
  return score;
};

const x = {
  inf: 0,
  zero: 0,
};

export const getBestMove = (board: _Board, forPlayer: 1 | 2, depth: number) => {
  let bestScore = -Infinity;
  let bestMove: number[] = [];
  const phase = board.getPhase();

  for (const move of board.getLegalMovesAdaptive(forPlayer)) {
    // min_value = self._min_value(game.forecast_move(move), depth - 1)
    //         if min_value > best_score:
    //             best_score = min_value
    //             best_move = move

    const minVal = minValue(board.forecastMove(move), forPlayer, depth - 1);

    if (minVal > bestScore) {
      bestScore = minVal;
      bestMove = move;
    }
  }

  if (bestMove.length === 0) {
    // console.log('no best move found');
  }

  if (bestScore === Infinity) {
    x.inf++;
  }

  if (bestScore === 0) {
    x.zero++;
  }

  const legalMoves = board.getLegalMovesAdaptive(board.getTurn());
  bestMove =
    bestMove.length !== 0 ? bestMove : legalMoves[Math.floor(Math.random() * legalMoves.length)];
  if (bestMove.length === 2) {
    const b = board.getBoard();
    b[bestMove[0]][bestMove[1]] = 4;
    console.log(forPlayer, phase);
    console.log(board.draw(b));
  }
  return bestMove;
};
