import React, { useState, useEffect, useRef } from 'react'

const GestureUnlockGame = ({ onSuccess, onFailed, audioEnabled }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [savedPatterns, setSavedPatterns] = useState([])
  const [currentPattern, setCurrentPattern] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [patternName, setPatternName] = useState('')
  const [showPatterns, setShowPatterns] = useState(false)
  const [brushSize, setBrushSize] = useState(4)
  const [brushColor, setBrushColor] = useState('#4ecdc4')
  const [lastPoint, setLastPoint] = useState(null)

  useEffect(() => {
    loadSavedPatterns()
    setupCanvas()
  }, [])

  const loadSavedPatterns = () => {
    const saved = localStorage.getItem('gesture_patterns')
    if (saved) {
      setSavedPatterns(JSON.parse(saved))
    }
  }

  const savePatterns = (patterns) => {
    localStorage.setItem('gesture_patterns', JSON.stringify(patterns))
    setSavedPatterns(patterns)
  }

  const setupCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushSize
  }

  const getMousePos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const getTouchPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0] || e.changedTouches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e)
    setLastPoint(pos)
    setCurrentPattern([pos])
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = e.type.includes('touch') ? getTouchPos(e) : getMousePos(e)

    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    setCurrentPattern(prev => [...prev, pos])
    setLastPoint(pos)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPoint(null)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCurrentPattern([])
  }

  const savePattern = () => {
    if (currentPattern.length < 10) {
      alert('Please draw a more complex pattern (at least 10 points)')
      return
    }

    setIsSaving(true)
  }

  const confirmSave = () => {
    if (!patternName.trim()) {
      alert('Please enter a pattern name')
      return
    }

    const newPattern = {
      id: Date.now(),
      name: patternName.trim(),
      points: currentPattern,
      timestamp: new Date().toISOString()
    }

    const updatedPatterns = [...savedPatterns, newPattern]
    savePatterns(updatedPatterns)
    
    setPatternName('')
    setIsSaving(false)
    clearCanvas()
  }

  const cancelSave = () => {
    setIsSaving(false)
    setPatternName('')
  }

  const deletePattern = (id) => {
    const updatedPatterns = savedPatterns.filter(p => p.id !== id)
    savePatterns(updatedPatterns)
  }

  const comparePatterns = (pattern1, pattern2) => {
    if (pattern1.length !== pattern2.length) return false

    // Normalize patterns to same scale
    const normalize = (points) => {
      const minX = Math.min(...points.map(p => p.x))
      const maxX = Math.max(...points.map(p => p.x))
      const minY = Math.min(...points.map(p => p.y))
      const maxY = Math.max(...points.map(p => p.y))
      
      const width = maxX - minX
      const height = maxY - minY
      const scale = Math.max(width, height)
      
      return points.map(p => ({
        x: (p.x - minX) / scale,
        y: (p.y - minY) / scale
      }))
    }

    const norm1 = normalize(pattern1)
    const norm2 = normalize(pattern2)

    // Calculate distance between corresponding points
    let totalDistance = 0
    for (let i = 0; i < norm1.length; i++) {
      const dx = norm1[i].x - norm2[i].x
      const dy = norm1[i].y - norm2[i].y
      totalDistance += Math.sqrt(dx * dx + dy * dy)
    }

    const avgDistance = totalDistance / norm1.length
    return avgDistance < 0.1 // Tolerance threshold
  }

  const submitPattern = () => {
    if (currentPattern.length < 10) {
      alert('Please draw a pattern first')
      return
    }

    // Check against saved patterns
    for (const savedPattern of savedPatterns) {
      if (comparePatterns(currentPattern, savedPattern.points)) {
        setTimeout(() => onSuccess(), 1000)
        return
      }
    }

    // Pattern not recognized
    setTimeout(() => onFailed(), 1000)
  }

  const drawSavedPattern = (pattern) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    clearCanvas()
    
    if (pattern.points.length > 0) {
      ctx.beginPath()
      ctx.moveTo(pattern.points[0].x, pattern.points[0].y)
      
      for (let i = 1; i < pattern.points.length; i++) {
        ctx.lineTo(pattern.points[i].x, pattern.points[i].y)
      }
      
      ctx.stroke()
    }
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-2xl font-bold text-white mb-4">
        Gesture Unlock System 🎨
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border-2 border-gray-600 rounded-lg bg-gray-900 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Drawing Controls */}
      <div className="flex justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-white text-sm">Brush Size:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => {
              setBrushSize(parseInt(e.target.value))
              const canvas = canvasRef.current
              if (canvas) {
                const ctx = canvas.getContext('2d')
                ctx.lineWidth = parseInt(e.target.value)
              }
            }}
            className="w-20"
          />
          <span className="text-white text-sm">{brushSize}</span>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-white text-sm">Color:</label>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => {
              setBrushColor(e.target.value)
              const canvas = canvasRef.current
              if (canvas) {
                const ctx = canvas.getContext('2d')
                ctx.strokeStyle = e.target.value
              }
            }}
            className="w-8 h-8 rounded"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
        >
          🗑️ Clear
        </button>
        <button
          onClick={savePattern}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
        >
          💾 Save Pattern
        </button>
        <button
          onClick={submitPattern}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
        >
          🔓 Submit
        </button>
        <button
          onClick={() => setShowPatterns(!showPatterns)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
        >
          📋 Saved Patterns
        </button>
      </div>

      {/* Save Pattern Modal */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-white text-lg font-bold mb-4">Save Pattern</h3>
            <input
              type="text"
              placeholder="Enter pattern name"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              className="w-full p-2 mb-4 rounded text-black"
            />
            <div className="flex space-x-4">
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={cancelSave}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Patterns List */}
      {showPatterns && (
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 max-w-md mx-auto">
          <h3 className="text-white text-lg font-bold mb-4">Saved Patterns</h3>
          {savedPatterns.length === 0 ? (
            <p className="text-gray-300">No patterns saved yet</p>
          ) : (
            <div className="space-y-2">
              {savedPatterns.map(pattern => (
                <div key={pattern.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <span className="text-white">{pattern.name}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => drawSavedPattern(pattern)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deletePattern(pattern.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowPatterns(false)}
            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            Close
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-gray-300 text-sm max-w-md mx-auto">
        Draw a gesture pattern on the canvas. Save it to create your unlock pattern, or draw a saved pattern to gain access!
      </div>
    </div>
  )
}

export { GestureUnlockGame }
