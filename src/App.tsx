import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Board } from './lib/game';

function App() {
  // rerender on board change
  const [board, setBoard] = useState(Board.getBoard());
  const [hasStarted, setHasStarted] = useState(false);
  const [_turn, setTurn] = useState(Board.getTurn());

  const [focusedCell, setFocusedCell] = useState([0, 0]);
  // rerender hook
  const [rerender, setRerender] = useState(0);

  const hasRanRef = useRef(false);

  // if (!hasStarted) {
  //   Board.simulateMiniMaxMove();
  //   setBoard(Board.getBoard());
  //   setRerender(Math.random());
  //   setTimeout(() => {
  //     Board.simulateMiniMaxMove();
  //     setBoard(Board.getBoard());
  //     setRerender(rerender + 1);
  //     // setHasStarted(true);
  //   }, 500);
  // }

  console.log('board', board);

  useEffect(() => {
    if (!hasRanRef.current) {
      hasRanRef.current = true;
      setTimeout(() => {
        Board.simulateMiniMaxMove();

        setBoard(Board.getBoard());
        setRerender(Math.random());
        setTimeout(() => {
          Board.simulateMiniMaxMove();

          setBoard(Board.getBoard());
          setRerender(Math.random());
        }, 500);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const listen = (e: KeyboardEvent) => {
      const phase = Board.getPhase();

      if (phase === 'end') return;
      if (Board.getTurn() === 1) return;

      if (e.key === 'ArrowUp') {
        if (focusedCell[0] === 0) return;
        setFocusedCell([focusedCell[0] - 1, focusedCell[1]]);
      }
      if (e.key === 'ArrowDown') {
        if (focusedCell[0] === Board.getSize() - 1) return;
        setFocusedCell([focusedCell[0] + 1, focusedCell[1]]);
      }

      if (e.key === 'ArrowLeft') {
        if (focusedCell[1] === 0) return;
        setFocusedCell([focusedCell[0], focusedCell[1] - 1]);
      }

      if (e.key === 'ArrowRight') {
        if (focusedCell[1] === Board.getSize() - 1) return;
        setFocusedCell([focusedCell[0], focusedCell[1] + 1]);
      }

      if (e.key === 'z') {
        if (phase === 'move') {
          const res = Board.movePlayer(Board.getTurn(), focusedCell);
          console.log('res', res);
          setBoard(Board.getBoard());
          setRerender(rerender + 1);
        }

        if (phase === 'destroy') {
          const res = Board.destroySquare(focusedCell);
          console.log('res', res);
          setBoard(Board.getBoard());
          setRerender(rerender + 1);
        }

        if (Board.getTurn() === 1) {
          setTimeout(() => {
            Board.simulateMiniMaxMove();
            setBoard(Board.getBoard());
            setRerender(Math.random());
            setTimeout(() => {
              Board.simulateMiniMaxMove();
              setBoard(Board.getBoard());
              setRerender(rerender + 1);
            }, 500);
          }, 500);
        }
      }
      setTurn(Board.getTurn());
      setRerender(rerender + 1);
    };

    window.addEventListener('keydown', listen);

    return () => {
      window.removeEventListener('keydown', listen);
    };
  }, [focusedCell, rerender]);

  return (
    <div className="grid place-items-center h-full">
      <div
        className="grid w-[80vw] h-[80vh]"
        onClick={() => {
          // Board.simulateNextMove();
          // setBoard(Board.getBoard());
          // setRerender(rerender + 1);
        }}
      >
        {board.map((rows, r) => (
          <div
            key={Math.random()}
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${Board.getSize()}, 1fr)`,
            }}
          >
            {rows.map((cell, c) => {
              const isFocused = focusedCell[0] === r && focusedCell[1] === c;

              return (
                <div
                  key={cell.toString() + r.toString() + c.toString()}
                  className="grid place-items-center border"
                  style={{
                    backgroundColor:
                      cell === 0
                        ? 'white'
                        : cell === 1
                        ? 'blue'
                        : cell === 2
                        ? 'red'
                        : cell === 3
                        ? 'black'
                        : 'gray',
                    width: '100%',
                    height: '100%',
                    zIndex: isFocused ? 1 : 0,
                    outline: isFocused ? 'green' : 'black',
                    outlineWidth: isFocused ? '3px' : '0',
                    outlineStyle: isFocused ? 'solid' : 'none',
                  }}
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      {Board.getWinner() ? (
        <h2 className="text-xl font-bold text-green-600">
          Player {Board.getWinner()} is the winner!
        </h2>
      ) : (
        <h2 className="text-xl font-bold">Player {Board.getTurn()} turn</h2>
      )}
    </div>
  );
}

export default App;
