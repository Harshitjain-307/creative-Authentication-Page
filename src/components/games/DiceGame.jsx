import React, { useState } from 'react'

const DiceGame = ({ onSuccess, onFailed }) => {
  const [dice1, setDice1] = useState(1)
  const [dice2, setDice2] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const rollDice = () => {
    if (isRolling) return
    
    setIsRolling(true)
    setAttempts(prev => prev + 1)
    
    // Animate rolling
    const rollInterval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1)
      setDice2(Math.floor(Math.random() * 6) + 1)
    }, 100)
    
    setTimeout(() => {
      clearInterval(rollInterval)
      const finalDice1 = Math.floor(Math.random() * 6) + 1
      const finalDice2 = Math.floor(Math.random() * 6) + 1
      setDice1(finalDice1)
      setDice2(finalDice2)
      setIsRolling(false)
      
      const total = finalDice1 + finalDice2
      if (total === 7) {
        setTimeout(() => onSuccess(), 1000)
      } else if (attempts >= 2) {
        setTimeout(() => onFailed(), 1000)
      }
    }, 1500)
  }

  const getDiceEmoji = (num) => {
    const dice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
    return dice[num - 1]
  }

  return (
    <div className="text-center space-y-8">
      <div className="text-2xl font-bold text-white mb-4">
        Roll a total of 7 to win access! 🎯
      </div>
      
      <div className="flex justify-center space-x-8">
        <div className={`text-6xl transition-all duration-300 ${isRolling ? 'animate-spin' : ''}`}>
          {getDiceEmoji(dice1)}
        </div>
        <div className={`text-6xl transition-all duration-300 ${isRolling ? 'animate-spin' : ''}`}>
          {getDiceEmoji(dice2)}
        </div>
      </div>
      
      <div className="text-xl text-white">
        Total: <span className="font-bold text-blue-400">{dice1 + dice2}</span>
      </div>
      
      <div className="text-sm text-gray-300">
        Attempts: {attempts}/3
      </div>
      
      <button
        onClick={rollDice}
        disabled={isRolling}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRolling ? 'Rolling...' : '🎲 Roll Dice'}
      </button>
    </div>
  )
}

export { DiceGame }
