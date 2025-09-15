import React, { useState, useEffect } from 'react'

const MemoryGame = ({ onSuccess, onFailed }) => {
  const [sequence, setSequence] = useState([])
  const [userSequence, setUserSequence] = useState([])
  const [isShowing, setIsShowing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [level, setLevel] = useState(1)

  const colors = ['red', 'blue', 'green', 'yellow']
  const [activeColor, setActiveColor] = useState(null)

  const generateSequence = () => {
    const newSequence = []
    for (let i = 0; i < level + 2; i++) {
      newSequence.push(colors[Math.floor(Math.random() * colors.length)])
    }
    return newSequence
  }

  const startGame = () => {
    const newSequence = generateSequence()
    setSequence(newSequence)
    setUserSequence([])
    setCurrentStep(0)
    setGameStarted(true)
    showSequence(newSequence)
  }

  const showSequence = (seq) => {
    setIsShowing(true)
    let step = 0
    
    const interval = setInterval(() => {
      if (step < seq.length) {
        setActiveColor(seq[step])
        setTimeout(() => {
          setActiveColor(null)
          step++
        }, 500)
      } else {
        clearInterval(interval)
        setIsShowing(false)
      }
    }, 1000)
  }

  const handleColorClick = (color) => {
    if (isShowing || !gameStarted) return
    
    const newUserSequence = [...userSequence, color]
    setUserSequence(newUserSequence)
    
    if (newUserSequence.length === sequence.length) {
      if (JSON.stringify(newUserSequence) === JSON.stringify(sequence)) {
        if (level >= 3) {
          setTimeout(() => onSuccess(), 1000)
        } else {
          setLevel(prev => prev + 1)
          setTimeout(() => startGame(), 1000)
        }
      } else {
        setTimeout(() => onFailed(), 1000)
      }
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setSequence([])
    setUserSequence([])
    setCurrentStep(0)
    setLevel(1)
    setIsShowing(false)
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-xl font-bold text-white mb-4">
        Memorize the sequence! Level {level}
      </div>
      
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            disabled={isShowing || !gameStarted}
            className={`w-20 h-20 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
              activeColor === color ? 'scale-110 shadow-lg' : ''
            } ${
              color === 'red' ? 'bg-red-500 hover:bg-red-600' :
              color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
              color === 'green' ? 'bg-green-500 hover:bg-green-600' :
              'bg-yellow-500 hover:bg-yellow-600'
            }`}
          />
        ))}
      </div>
      
      <div className="text-lg text-white">
        {isShowing ? 'Watch the sequence...' : 
         gameStarted ? 'Repeat the sequence!' : 'Click Start to begin!'}
      </div>
      
      <div className="flex space-x-4 justify-center">
        <button
          onClick={startGame}
          disabled={isShowing}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          🎮 Start Game
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

export { MemoryGame }
