import React, { useState } from 'react'

const SimonGame = ({ onSuccess, onFailed, audioEnabled }) => {
  const [gameActive, setGameActive] = useState(false)
  const [sequence, setSequence] = useState([])
  const [userSequence, setUserSequence] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)

  const startGame = () => {
    setGameActive(true)
    setSequence([])
    setUserSequence([])
    generateNextSequence()
  }

  const generateNextSequence = () => {
    const newSequence = [...sequence, Math.floor(Math.random() * 4)]
    setSequence(newSequence)
    playSequence(newSequence)
  }

  const playSequence = (seq) => {
    setIsPlaying(true)
    let index = 0
    const interval = setInterval(() => {
      if (index < seq.length) {
        // Visual feedback
        setTimeout(() => {
          if (index < seq.length) {
            // Reset visual
          }
        }, 300)
        index++
      } else {
        clearInterval(interval)
        setIsPlaying(false)
      }
    }, 600)
  }

  const handleButtonClick = (buttonIndex) => {
    if (!gameActive || isPlaying) return
    
    const newUserSequence = [...userSequence, buttonIndex]
    setUserSequence(newUserSequence)
    
    if (newUserSequence.length === sequence.length) {
      if (JSON.stringify(newUserSequence) === JSON.stringify(sequence)) {
        if (sequence.length >= 3) {
          setTimeout(() => onSuccess(), 1000)
        } else {
          generateNextSequence()
        }
      } else {
        setTimeout(() => onFailed(), 1000)
      }
    }
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-xl font-bold text-white mb-4">
        Follow the sequence! 🎵
      </div>
      
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        {[0, 1, 2, 3].map(index => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={!gameActive || isPlaying}
            className={`w-20 h-20 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
              index === 0 ? 'bg-red-500 hover:bg-red-600' :
              index === 1 ? 'bg-blue-500 hover:bg-blue-600' :
              index === 2 ? 'bg-green-500 hover:bg-green-600' :
              'bg-yellow-500 hover:bg-yellow-600'
            }`}
          />
        ))}
      </div>
      
      <div className="text-lg text-white">
        {isPlaying ? 'Watch the sequence...' : 
         gameActive ? 'Repeat the sequence!' : 'Click Start to begin!'}
      </div>
      
      <div className="flex space-x-4 justify-center">
        <button
          onClick={startGame}
          disabled={isPlaying}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          🎵 Start Game
        </button>
      </div>
    </div>
  )
}

export { SimonGame }
