import React, { useState } from 'react'

const TicTacToeGame = ({ onSuccess, onFailed }) => {
  const [board, setBoard] = useState(Array(9).fill(''))
  const [currentPlayer, setCurrentPlayer] = useState('X')
  const [gameActive, setGameActive] = useState(false)
  const [moveCount, setMoveCount] = useState(0)

  const handleClick = (index) => {
    if (!gameActive || board[index] !== '') return
    
    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)
    setMoveCount(prev => prev + 1)
    
    if (checkWin(newBoard)) {
      setGameActive(false)
      setTimeout(() => onSuccess(), 1000)
    } else if (moveCount === 8) {
      setGameActive(false)
      setTimeout(() => onFailed(), 1000)
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  const checkWin = (board) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ]
    
    return winPatterns.some(pattern => {
      const [a, b, c] = pattern
      return board[a] && board[a] === board[b] && board[a] === board[c]
    })
  }

  const startGame = () => {
    setGameActive(true)
    setCurrentPlayer('X')
    setMoveCount(0)
    setBoard(Array(9).fill(''))
  }

  const resetGame = () => {
    setGameActive(false)
    setCurrentPlayer('X')
    setMoveCount(0)
    setBoard(Array(9).fill(''))
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-xl font-bold text-white mb-4">
        Get 3 X's in a row to win access! 🎯
      </div>
      
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-2 border-2 border-gray-600 bg-gray-800 p-4 rounded-lg">
          {board.map((cell, index) => (
            <div
              key={index}
              onClick={() => handleClick(index)}
              className={`w-16 h-16 flex items-center justify-center text-3xl cursor-pointer transition-all duration-200 hover:bg-yellow-500/30 bg-gray-700 rounded ${
                cell === 'X' ? 'text-red-500' : cell === 'O' ? 'text-blue-500' : ''
              }`}
            >
              {cell}
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-lg text-white">
        {gameActive ? `Player ${currentPlayer}'s turn` : 'Click Start to begin!'}
      </div>
      
      <div className="flex space-x-4 justify-center">
        <button
          onClick={startGame}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
        >
          ⭕ Start Game
        </button>
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  )
}

export { TicTacToeGame }
