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

  const ownMoves = board.getLegalMoves(player).length;
  const oppMoves = board.getLegalMoves(opp).length;

  // Which square your opp can move to that provides the most available squares (Higher is better)
  // Highest potential available square to opp after destruction (Lower is better)
  // 	On collision of best moves, choose first
  //own_moves - 2 * opp_moves
  return ownMoves - oppMoves;
  // return ownMoves - 2 * oppMoves;
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

export const getBestMove = (board: _Board, forPlayer: 1 | 2, depth: number) => {
  let bestScore = -Infinity;
  let bestMove: number[] = [];

  for (const move of board.getLegalMovesAdaptive(board.getTurn())) {
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
    console.log('no best move found');
  }
  return bestMove.length !== 0 ? bestMove : board.getLegalMovesAdaptive(board.getTurn())[0];
};
