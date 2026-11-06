import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const BOARD_SIZE = 15;

export const GomokuGame: React.FC = () => {
  const { showToast } = useApp();
  const [board, setBoard] = useState<Array<Array<null | 'black' | 'white'>>>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [isBlackTurn, setIsBlackTurn] = useState(true);
  const [winner, setWinner] = useState<null | 'black' | 'white'>(null);
  const [history, setHistory] = useState<Array<{ r: number; c: number; piece: 'black' | 'white' }>>([]);

  const resetBoard = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setIsBlackTurn(true);
    setWinner(null);
    setHistory([]);
    showToast('五子棋新局已开！黑子先行', 'info');
  };

  const checkWin = (b: Array<Array<null | 'black' | 'white'>>, r: number, c: number, piece: 'black' | 'white') => {
    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal \
      [1, -1]  // Diagonal /
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      // forward
      for (let i = 1; i < 5; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && b[nr][nc] === piece) {
          count++;
        } else break;
      }
      // backward
      for (let i = 1; i < 5; i++) {
        const nr = r - dr * i;
        const nc = c - dc * i;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && b[nr][nc] === piece) {
          count++;
        } else break;
      }
      if (count >= 5) return true;
    }
    return false;
  };

  const handleCellClick = (r: number, c: number) => {
    if (board[r][c] || winner || !isBlackTurn) return;

    // Human plays Black
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = 'black';
    const newHistory = [...history, { r, c, piece: 'black' as const }];

    if (checkWin(newBoard, r, c, 'black')) {
      setBoard(newBoard);
      setWinner('black');
      setHistory(newHistory);
      confetti({ particleCount: 70, spread: 80, colors: ['#c084fc', '#ffffff'] });
      showToast('🎉 黑子五连珠获胜！', 'success');
      return;
    }

    setBoard(newBoard);
    setIsBlackTurn(false);
    setHistory(newHistory);

    // AI Bot plays White after short delay
    setTimeout(() => {
      executeBotMove(newBoard, newHistory);
    }, 400);
  };

  const executeBotMove = (
    currentBoard: Array<Array<null | 'black' | 'white'>>,
    currentHist: Array<{ r: number; c: number; piece: 'black' | 'white' }>
  ) => {
    // Simple heuristic: pick empty cell near last move or center
    const emptyCells: Array<{ r: number; c: number }> = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!currentBoard[r][c]) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length === 0) return;

    // Pick a strategic spot near player's last move
    const lastMove = currentHist[currentHist.length - 1];
    let chosen = emptyCells[0];
    let minDist = 999;

    for (const cell of emptyCells) {
      const d = Math.abs(cell.r - lastMove.r) + Math.abs(cell.c - lastMove.c);
      if (d <= 2 && d < minDist && Math.random() > 0.3) {
        minDist = d;
        chosen = cell;
      }
    }

    const updated = currentBoard.map(row => [...row]);
    updated[chosen.r][chosen.c] = 'white';
    const updatedHist = [...currentHist, { r: chosen.r, c: chosen.c, piece: 'white' as const }];

    if (checkWin(updated, chosen.r, chosen.c, 'white')) {
      setBoard(updated);
      setWinner('white');
      setHistory(updatedHist);
      showToast('白子获胜！', 'info');
      return;
    }

    setBoard(updated);
    setIsBlackTurn(true);
    setHistory(updatedHist);
  };

  return (
    <div className="space-y-6 flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full max-w-xl p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-600/30 text-fuchsia-300 border border-purple-400/30 font-bold">
            星河对弈 · 15×15 经典五子棋
          </span>
          <div className="text-xs text-purple-300 mt-1">
            当前：
            <span className="text-white font-bold ml-1">
              {winner ? '对局已结束' : isBlackTurn ? '执黑子 (你先行)' : '执白子 (紫米伴侣思考中...)'}
            </span>
          </div>
        </div>

        <button
          onClick={resetBoard}
          className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重新开局</span>
        </button>
      </div>

      {/* Gomoku Grid Board */}
      <div className="relative p-3 sm:p-5 rounded-3xl bg-[#d4a373] border-4 border-[#8b5a2b] shadow-2xl overflow-hidden select-none">
        <div className="grid grid-cols-15 gap-0 bg-[#e6be8a] p-1 rounded-xl shadow-inner border border-[#b27d42]">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className="w-5 h-5 sm:w-7 sm:h-7 relative flex items-center justify-center focus:outline-none group"
              >
                {/* Board grid lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[1px] bg-[#96632c]" />
                  <div className="h-full w-[1px] bg-[#96632c] absolute" />
                </div>

                {/* Star points (天元与星位) */}
                {(r === 3 || r === 7 || r === 11) && (c === 3 || c === 7 || c === 11) && !cell && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#5c3a1e] absolute z-0" />
                )}

                {/* Piece */}
                {cell === 'black' && (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-950 shadow-md ring-1 ring-black/40 z-10 animate-in zoom-in-75" />
                )}
                {cell === 'white' && (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-white to-neutral-200 shadow-md ring-1 ring-neutral-400 z-10 animate-in zoom-in-75" />
                )}
                {!cell && !winner && isBlackTurn && (
                  <div className="w-2.5 h-2.5 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 z-10 transition-opacity" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Win Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1b0836] to-[#0d031c] border-2 border-purple-400 p-6 text-white text-center space-y-4">
            <div className="text-4xl">🏆</div>
            <h2 className="text-xl font-bold font-serif text-yellow-300">
              {winner === 'black' ? '恭喜黑子五连珠获胜！' : '白子胜出！'}
            </h2>
            <button
              onClick={resetBoard}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-medium text-xs hover:bg-purple-500"
            >
              再下一局五子棋
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
