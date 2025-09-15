import React, { useState } from 'react'

const PatternGame = ({ onSuccess, onFailed }) => {
  const [pattern, setPattern] = useState([])
  const [userPattern, setUserPattern] = useState([])
  const [gameActive, setGameActive] = useState(false)
  const [isShowing, setIsShowing] = useState(false)

  const generatePattern = () => {
    const newPattern = []
    for (let i = 0; i < 5; i++) {
      newPattern.push(Math.floor(Math.random() * 9))
    }
    return newPattern
  }

  const startGame = () => {
    const newPattern = generatePattern()
    setPattern(newPattern)
    setUserPattern([])
    setGameActive(true)
    showPattern(newPattern)
  }

  const showPattern = (pat) => {
    setIsShowing(true)
    let index = 0
    const interval = setInterval(() => {
      if (index < pat.length) {
        // Highlight pattern
        setTimeout(() => {
          if (index < pat.length) {
            // Reset highlight
          }
          index++
        }, 500)
      } else {
        clearInterval(interval)
        setIsShowing(false)
      }
    }, 1000)
  }

  const handleDotClick = (index) => {
    if (!gameActive || isShowing) return
    
    const newUserPattern = [...userPattern, index]
    setUserPattern(newUserPattern)
    
    if (newUserPattern.length === pattern.length) {
      if (JSON.stringify(newUserPattern) === JSON.stringify(pattern)) {
        setTimeout(() => onSuccess(), 1000)
      } else {
        setTimeout(() => onFailed(), 1000)
      }
    }
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-xl font-bold text-white mb-4">
        Remember the pattern! 🧩
      </div>
      
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {Array.from({ length: 9 }, (_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            disabled={!gameActive || isShowing}
            className={`w-12 h-12 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
              pattern.includes(index) ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
      
      <div className="text-lg text-white">
        {isShowing ? 'Watch the pattern...' : 
         gameActive ? 'Repeat the pattern!' : 'Click Start to begin!'}
      </div>
      
      <div className="flex space-x-4 justify-center">
        <button
          onClick={startGame}
          disabled={isShowing}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          🧩 Start Game
        </button>
      </div>
    </div>
  )
}

export { PatternGame }
