import React, { useState, useEffect } from 'react'

const StonePaperScissorGame = ({ onSuccess, onFailed, audioEnabled }) => {
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [round, setRound] = useState(1)
  const [playerChoice, setPlayerChoice] = useState(null)
  const [computerChoice, setComputerChoice] = useState(null)
  const [result, setResult] = useState('')
  const [gameActive, setGameActive] = useState(false)
  const [gestureMode, setGestureMode] = useState(false)
  const [gestureDetected, setGestureDetected] = useState(null)

  const choices = ['stone', 'paper', 'scissor']
  const choiceEmojis = {
    stone: '✊',
    paper: '✋',
    scissor: '✌️'
  }

  const choiceNames = {
    stone: 'Stone',
    paper: 'Paper',
    scissor: 'Scissor'
  }

  useEffect(() => {
    // Load saved scores from localStorage
    const savedPlayerScore = localStorage.getItem('sps_player_score')
    const savedComputerScore = localStorage.getItem('sps_computer_score')
    if (savedPlayerScore) setPlayerScore(parseInt(savedPlayerScore))
    if (savedComputerScore) setComputerScore(parseInt(savedComputerScore))
  }, [])

  const saveScores = () => {
    localStorage.setItem('sps_player_score', playerScore.toString())
    localStorage.setItem('sps_computer_score', computerScore.toString())
  }

  const startGame = () => {
    setGameActive(true)
    setRound(1)
    setPlayerScore(0)
    setComputerScore(0)
    setResult('')
    setPlayerChoice(null)
    setComputerChoice(null)
  }

  const resetGame = () => {
    setGameActive(false)
    setRound(1)
    setPlayerScore(0)
    setComputerScore(0)
    setResult('')
    setPlayerChoice(null)
    setComputerChoice(null)
    setGestureMode(false)
    setGestureDetected(null)
  }

  const makeChoice = (choice) => {
    if (!gameActive) return

    const computer = choices[Math.floor(Math.random() * choices.length)]
    setPlayerChoice(choice)
    setComputerChoice(computer)

    // Determine winner
    let roundResult = ''
    if (choice === computer) {
      roundResult = 'Tie!'
    } else if (
      (choice === 'stone' && computer === 'scissor') ||
      (choice === 'paper' && computer === 'stone') ||
      (choice === 'scissor' && computer === 'paper')
    ) {
      roundResult = 'You win!'
      setPlayerScore(prev => prev + 1)
    } else {
      roundResult = 'Computer wins!'
      setComputerScore(prev => prev + 1)
    }

    setResult(roundResult)
    saveScores()

    // Check for game end conditions
    setTimeout(() => {
      if (playerScore + 1 >= 3) {
        setResult('🎉 You won the game! Access granted!')
        setTimeout(() => onSuccess(), 1500)
      } else if (computerScore + 1 >= 3) {
        setResult('💀 Computer won the game! Try again!')
        setTimeout(() => onFailed(), 1500)
      } else {
        setRound(prev => prev + 1)
        setPlayerChoice(null)
        setComputerChoice(null)
        setResult('')
      }
    }, 2000)
  }

  const handleGestureInput = (gesture) => {
    if (!gameActive || !gestureMode) return

    // Map gesture to choice
    let choice = null
    if (gesture === 'fist' || gesture === 'closed') {
      choice = 'stone'
    } else if (gesture === 'open' || gesture === 'palm') {
      choice = 'paper'
    } else if (gesture === 'peace' || gesture === 'v') {
      choice = 'scissor'
    }

    if (choice) {
      setGestureDetected(choice)
      setTimeout(() => {
        makeChoice(choice)
        setGestureDetected(null)
      }, 1000)
    }
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-2xl font-bold text-white mb-4">
        Stone Paper Scissor 🎮
      </div>

      {/* Score Display */}
      <div className="flex justify-center space-x-8 text-white text-lg">
        <div className="bg-blue-600 px-4 py-2 rounded-lg">
          <div className="text-sm">Player</div>
          <div className="text-2xl font-bold">{playerScore}</div>
        </div>
        <div className="bg-red-600 px-4 py-2 rounded-lg">
          <div className="text-sm">Computer</div>
          <div className="text-2xl font-bold">{computerScore}</div>
        </div>
      </div>

      {/* Round Display */}
      <div className="text-white text-lg">
        Round {round} - First to 3 wins!
      </div>

      {/* Game Mode Toggle */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setGestureMode(false)}
          className={`px-4 py-2 rounded-lg transition-all ${
            !gestureMode 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-600 text-gray-300'
          }`}
        >
          Button Mode
        </button>
        <button
          onClick={() => setGestureMode(true)}
          className={`px-4 py-2 rounded-lg transition-all ${
            gestureMode 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-600 text-gray-300'
          }`}
        >
          Gesture Mode
        </button>
      </div>

      {/* Game Area */}
      {gameActive ? (
        <div className="space-y-6">
          {/* Choices Display */}
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-white text-lg mb-2">You</div>
              <div className="text-6xl">
                {playerChoice ? choiceEmojis[playerChoice] : '❓'}
              </div>
              <div className="text-white text-sm mt-2">
                {playerChoice ? choiceNames[playerChoice] : 'Choose'}
              </div>
            </div>
            
            <div className="text-4xl text-white flex items-center">VS</div>
            
            <div className="text-center">
              <div className="text-white text-lg mb-2">Computer</div>
              <div className="text-6xl">
                {computerChoice ? choiceEmojis[computerChoice] : '❓'}
              </div>
              <div className="text-white text-sm mt-2">
                {computerChoice ? choiceNames[computerChoice] : 'Thinking...'}
              </div>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`text-2xl font-bold ${
              result.includes('You win') ? 'text-green-400' :
              result.includes('Computer wins') ? 'text-red-400' :
              result.includes('Tie') ? 'text-yellow-400' :
              'text-white'
            }`}>
              {result}
            </div>
          )}

          {/* Gesture Detection Area */}
          {gestureMode && (
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
              <div className="text-white text-lg mb-4">
                Show your gesture to the camera:
              </div>
              <div className="flex justify-center space-x-8 text-4xl">
                <div className="text-center">
                  <div>✊</div>
                  <div className="text-sm text-gray-300">Stone</div>
                </div>
                <div className="text-center">
                  <div>✋</div>
                  <div className="text-sm text-gray-300">Paper</div>
                </div>
                <div className="text-center">
                  <div>✌️</div>
                  <div className="text-sm text-gray-300">Scissor</div>
                </div>
              </div>
              {gestureDetected && (
                <div className="text-green-400 text-lg mt-4">
                  Detected: {choiceNames[gestureDetected]}!
                </div>
              )}
            </div>
          )}

          {/* Button Controls */}
          {!gestureMode && (
            <div className="flex justify-center space-x-4">
              {choices.map(choice => (
                <button
                  key={choice}
                  onClick={() => makeChoice(choice)}
                  disabled={playerChoice !== null}
                  className="w-20 h-20 text-4xl bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {choiceEmojis[choice]}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-white text-lg">
          Click Start to begin the game!
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex space-x-4 justify-center">
        <button
          onClick={startGame}
          disabled={gameActive}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          🎮 Start Game
        </button>
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
        >
          🔄 Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="text-gray-300 text-sm max-w-md mx-auto">
        {gestureMode 
          ? 'Use your camera to show hand gestures: ✊ for Stone, ✋ for Paper, ✌️ for Scissor'
          : 'Click the buttons to make your choice. First to win 3 rounds gets access!'
        }
      </div>
    </div>
  )
}

export { StonePaperScissorGame }
