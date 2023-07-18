// Isola Game Logic

import { getBestMove } from './algo';

const EMPTY_SQUARE = '⬜';
const DESTROYED_SQUARE = '⬛';
const LEGAL_MOVE_SQUARE = '🟩';
const LEGAL_DESTROY_SQUARE = '🟨';
const PLAYER1_SQUARE = '🔵';
const PLAYER2_SQUARE = '🔴';

export class _Board {
  private _board: number[][];
  private _boardSize: number;
  private _lastPlayerMoved: 1 | 2;
  private _player1: number;
  private _player2: number;
  private _player1Position: number[];
  private _player2Position: number[];
  private _player1Moves: number[][];
  private _player2Moves: number[][];
  private _player1MovesCount: number;
  private _player2MovesCount: number;
  private _turn: 1 | 2;
  private _phase: 'move' | 'destroy' | 'end';
  private _winner: number | null;

  constructor(
    boardSize: number,
    opts?: {
      board?: number[][];
      phase?: 'move' | 'destroy' | 'end';
      turn?: 1 | 2;
      player1Position?: number[];
      player2Position?: number[];
    }
  ) {
    this._boardSize = boardSize;
    this._board = opts?.board ?? [];
    this._player1 = 1;
    this._player2 = 2;
    this._player1Position = opts?.player1Position ?? [];
    this._player2Position = opts?.player2Position ?? [];
    this._player1Moves = [];
    this._player2Moves = [];
    this._player1MovesCount = 0;
    this._player2MovesCount = 0;
    this._turn = opts?.turn ?? 1;
    this._phase = opts?.phase ?? 'move';
    this._lastPlayerMoved = 1;
    this._winner = null;
    if (!opts?.board) {
      this.initializeBoard();
    }
  }

  initializeBoard() {
    for (let i = 0; i < this._boardSize; i++) {
      this._board[i] = [];
      for (let j = 0; j < this._boardSize; j++) {
        this._board[i][j] = 0;
      }
    }

    const spawnCol = Math.floor(this._boardSize / 2);
    this._board[0][spawnCol] = 1;
    this._board[this._boardSize - 1][spawnCol] = 2;

    this._player1Position = [0, spawnCol];
    this._player2Position = [this._boardSize - 1, spawnCol];
  }

  getBoard() {
    return this._board;
  }

  drawBoard() {
    let board = '';
    for (let i = 0; i < this._boardSize; i++) {
      for (let j = 0; j < this._boardSize; j++) {
        if (this._board[i][j] === 0) {
          board += EMPTY_SQUARE;
        } else if (this._board[i][j] === 1) {
          board += PLAYER1_SQUARE;
        } else if (this._board[i][j] === 2) {
          board += PLAYER2_SQUARE;
        } else if (this._board[i][j] === 3) {
          board += DESTROYED_SQUARE;
        }
      }
      board += '\n';
    }
    return board;
  }

  getPlayer1() {
    return this._player1;
  }

  getPlayer2() {
    return this._player2;
  }

  getPlayer1Position() {
    return this._player1Position;
  }

  getPlayer2Position() {
    return this._player2Position;
  }

  getPlayer1Moves() {
    return this._player1Moves;
  }

  getPlayer2Moves() {
    return this._player2Moves;
  }

  getPlayer1MovesCount() {
    return this._player1MovesCount;
  }

  getPlayer2MovesCount() {
    return this._player2MovesCount;
  }

  setPlayer1MovesCount(count: number) {
    this._player1MovesCount = count;
  }

  setPlayer2MovesCount(count: number) {
    this._player2MovesCount = count;
  }

  setPlayer1Position(position: number[]) {
    this._player1Position = position;
  }

  setPlayer2Position(position: number[]) {
    this._player2Position = position;
  }

  setPlayer1Moves(moves: number[][]) {
    this._player1Moves = moves;
  }

  setPlayer2Moves(moves: number[][]) {
    this._player2Moves = moves;
  }

  movePlayer(player: 1 | 2, position: number[]) {
    if (player === 1) {
      if (this.isMoveLegal(player, position)) {
        this._board[this._player1Position[0]][this._player1Position[1]] = 0;
        this._player1Position = position;
        this._board[position[0]][position[1]] = 1;
        this._lastPlayerMoved = 1;
        this._phase = 'destroy';
        return true;
      }
    } else {
      if (this.isMoveLegal(player, position)) {
        this._board[this._player2Position[0]][this._player2Position[1]] = 0;
        this._player2Position = position;
        this._board[position[0]][position[1]] = 2;
        this._lastPlayerMoved = 2;
        this._phase = 'destroy';
        return true;
      }
    }

    return false;
  }

  isMoveLegal(player: 1 | 2, position: number[]) {
    const legalMoves = this.getLegalMoves(player);
    return (
      this._turn === player &&
      this._phase === 'move' &&
      legalMoves.some((move) => {
        return move[0] === position[0] && move[1] === position[1];
      })
    );
  }

  getLegalMoves(player: 1 | 2) {
    const position = player === 1 ? this._player1Position : this._player2Position;

    const adjacentSquares = this._getAdjacentSquares(position);

    return adjacentSquares.filter((square) => {
      const row = square[0];
      const col = square[1];
      return this._board[row][col] === 0;
    });
  }

  getLegalDestroys(player: 1 | 2) {
    const squares: number[][] = [];
    this._board.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (this._board[rowIndex][colIndex] === 0) {
          squares.push([rowIndex, colIndex]);
        }
      });
    });

    return squares;
  }

  getLegalMovesAdaptive(player: 1 | 2) {
    if (this._phase === 'move') {
      return this.getLegalMoves(player);
    }

    if (this._phase === 'destroy') {
      return this.getLegalDestroys(player);
    }

    return [];
  }

  forecastMove(position: number[]) {
    const player = this._turn;
    const newBoard = this.copy();

    if (this._phase === 'move') {
      newBoard.movePlayer(player, position);
    }

    if (this._phase === 'destroy') {
      newBoard.destroySquare(position);
    }

    return newBoard;
  }

  forecastDestroy(position: number[]) {
    const player = this._turn;
    const newBoard = this.copy();

    newBoard.destroySquare(position);
    return newBoard;
  }

  copy() {
    const newBoard = new _Board(this._boardSize, {
      board: this._board.map((row) => row.slice()),
      phase: this._phase,
      turn: this._turn,
      player1Position: this._player1Position.slice(),
      player2Position: this._player2Position.slice(),
    });

    return newBoard;
  }

  draw(_board: number[][]) {
    let board = '';
    for (let i = 0; i < this._boardSize; i++) {
      for (let j = 0; j < this._boardSize; j++) {
        if (_board[i][j] === 0) {
          board += EMPTY_SQUARE;
        } else if (_board[i][j] === 1) {
          board += PLAYER1_SQUARE;
        } else if (_board[i][j] === 2) {
          board += PLAYER2_SQUARE;
        } else if (_board[i][j] === 3) {
          board += DESTROYED_SQUARE;
        } else if (_board[i][j] === 4) {
          board += '🟪';
        }
      }

      board += '\n';
    }
    return board;
  }

  drawLegalMoves(player: 1 | 2) {
    const legalMoves = this.getLegalMoves(player);
    let board = '';
    for (let i = 0; i < this._boardSize; i++) {
      for (let j = 0; j < this._boardSize; j++) {
        const isLegalMove = legalMoves.some((move) => {
          return move[0] === i && move[1] === j;
        });

        if (isLegalMove) {
          board += LEGAL_MOVE_SQUARE;
        } else if (this._board[i][j] === 0) {
          board += EMPTY_SQUARE;
        } else if (this._board[i][j] === 1) {
          board += PLAYER1_SQUARE;
        } else if (this._board[i][j] === 2) {
          board += PLAYER2_SQUARE;
        } else if (this._board[i][j] === 3) {
          board += DESTROYED_SQUARE;
        }
      }
      board += '\n';
    }
    return board;
  }

  getLegalDestroyMoves() {
    const legalDestroyMoves: number[][] = [];

    for (let i = 0; i < this._boardSize; i++) {
      for (let j = 0; j < this._boardSize; j++) {
        if (this._board[i][j] === 0) {
          legalDestroyMoves.push([i, j]);
        }
      }
    }

    return legalDestroyMoves;
  }

  drawLegalDestroyMoves() {
    const legalDestroyMoves = this.getLegalDestroyMoves();
    let board = '';

    for (let i = 0; i < this._boardSize; i++) {
      for (let j = 0; j < this._boardSize; j++) {
        const isLegalDestroyMove = legalDestroyMoves.some((move) => {
          return move[0] === i && move[1] === j;
        });

        if (isLegalDestroyMove) {
          board += LEGAL_DESTROY_SQUARE;
        } else if (this._board[i][j] === 0) {
          board += EMPTY_SQUARE;
        } else if (this._board[i][j] === 1) {
          board += PLAYER1_SQUARE;
        } else if (this._board[i][j] === 2) {
          board += PLAYER2_SQUARE;
        } else if (this._board[i][j] === 3) {
          board += DESTROYED_SQUARE;
        }
      }
      board += '\n';
    }
    return board;
  }

  getIsLegalDestroyMove(position: number[]) {
    const legalDestroyMoves = this.getLegalDestroyMoves();
    return (
      legalDestroyMoves.some((move) => {
        return move[0] === position[0] && move[1] === position[1];
      }) && this._phase === 'destroy'
    );
  }

  destroySquare(position: number[]) {
    if (this.getIsLegalDestroyMove(position)) {
      const row = position[0];
      const col = position[1];
      this._board[row][col] = 3;
      this._lastPlayerMoved = this._turn;
      this._phase = 'move';
      this._turn = this._turn === 1 ? 2 : 1;

      const legalMovesForNextPlayer = this.getLegalMoves(this._turn);
      if (legalMovesForNextPlayer.length === 0) {
        this._lastPlayerMoved = this._turn;
        this._phase = 'end';
        this._winner = this._turn === 1 ? 2 : 1;
      }
      return true;
    }
    return false;
  }

  getLastPlayerMoved() {
    return this._lastPlayerMoved;
  }

  getWinner() {
    return this._winner;
  }

  getTurn() {
    return this._turn;
  }

  getSize() {
    return this._boardSize;
  }

  getPhase() {
    return this._phase;
  }
  _getAdjacentSquares(position: number[]) {
    const adjacentSquares: number[][] = [];
    const row = position[0];
    const col = position[1];

    if (row - 1 >= 0) {
      adjacentSquares.push([row - 1, col]);
    }
    if (row + 1 < this._boardSize) {
      adjacentSquares.push([row + 1, col]);
    }
    if (col - 1 >= 0) {
      adjacentSquares.push([row, col - 1]);
    }
    if (col + 1 < this._boardSize) {
      adjacentSquares.push([row, col + 1]);
    }
    if (row - 1 >= 0 && col - 1 >= 0) {
      adjacentSquares.push([row - 1, col - 1]);
    }
    if (row - 1 >= 0 && col + 1 < this._boardSize) {
      adjacentSquares.push([row - 1, col + 1]);
    }
    if (row + 1 < this._boardSize && col - 1 >= 0) {
      adjacentSquares.push([row + 1, col - 1]);
    }
    if (row + 1 < this._boardSize && col + 1 < this._boardSize) {
      adjacentSquares.push([row + 1, col + 1]);
    }

    return adjacentSquares;
  }

  simulateNextMove() {
    if (this._phase === 'end') {
      return;
    }
    if (this._phase === 'move') {
      const legalMoves = this.getLegalMoves(this.getTurn());
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];

      this.movePlayer(this.getTurn(), randomMove);
      return;
    }

    if (this._phase === 'destroy') {
      const legalDestroyMoves = this.getLegalDestroyMoves();
      const randomDestroyMove =
        legalDestroyMoves[Math.floor(Math.random() * legalDestroyMoves.length)];

      this.destroySquare(randomDestroyMove);
      return;
    }
  }

  simulateMiniMaxMove() {
    const depth = 4;
    if (this._phase === 'move') {
      const newB = this.copy();
      const bestMove = getBestMove(newB, newB.getTurn(), depth);

      // const boardCopy = newB.getBoard().map((row) => row.slice());
      // boardCopy[bestMove[0]][bestMove[1]] = 4;
      // console.log('BEST MOVE: ', bestMove);
      // console.log(this.draw(boardCopy));

      this.movePlayer(this.getTurn(), bestMove);
      return;
    }

    if (this._phase === 'destroy') {
      const newB = this.copy();
      const bestMove = getBestMove(newB, newB.getTurn(), depth);

      // const boardCopy = newB.getBoard().map((row) => row.slice());
      // boardCopy[bestMove[0]][bestMove[1]] = 4;
      // console.log('BEST MOVE: ', bestMove);
      // console.log(this.draw(boardCopy));

      this.destroySquare(bestMove);
      return;
    }
  }

  resetBoard() {
    this.initializeBoard();
  }
}

export const Board = new _Board(5);

export const simulateRandomGame = (opts?: { log?: boolean }) => {
  const { log = false } = opts ?? {};
  const Board = new _Board(5);

  while (Board.getWinner() === null) {
    const legalMoves = Board.getLegalMoves(Board.getTurn());
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    Board.movePlayer(Board.getTurn(), randomMove);

    log && console.log(Board.drawBoard());

    const legalDestroyMoves = Board.getLegalDestroyMoves();
    const randomDestroyMove =
      legalDestroyMoves[Math.floor(Math.random() * legalDestroyMoves.length)];

    Board.destroySquare(randomDestroyMove);
    log && console.log(Board.drawBoard());
  }

  log && console.log(`Winner is ${Board.getWinner() ?? 'no one'}`);

  log && console.log(Board.drawBoard());
  return Board.getWinner();
};

const simulateMinimaxVsRandomGame = async (opts?: { log?: boolean }) => {
  const { log = false } = opts ?? {};
  const Board = new _Board(5);

  while (Board.getWinner() === null) {
    Board.simulateMiniMaxMove();
    Board.simulateMiniMaxMove();

    log && console.log(Board.drawBoard());

    Board.simulateNextMove();
    Board.simulateNextMove();
  }

  log && console.log(`Winner is ${Board.getWinner() ?? 'no one'}`);

  return Board.getWinner();
};

export const simulateRandomGames = (numGames: number) => {
  const results = {
    1: 0,
    2: 0,
  };

  for (let i = 0; i < numGames; i++) {
    const winner = simulateRandomGame();
    if (winner !== null) {
      results[winner as 1 | 2]++;
    }
  }

  return results;
};

export const simulateMinimaxVsRandom = async (numGames: number) => {
  const results = {
    1: 0,
    2: 0,
  };

  // array with 1000 elements

  const arr = Array.from({ length: numGames }, () => 0);

  await Promise.all(
    arr.map(async (item, index) => {
      const winner = await simulateMinimaxVsRandomGame();

      results[winner as 1 | 2]++;

      return winner;
    })
  );

  return results;
};
