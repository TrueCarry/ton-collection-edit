import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'

const RunningMouse = ({ index }: { index: number }) => {
  const generateOffscreenPoint = useCallback(() => {
    const side = Math.floor(Math.random() * 4)
    switch (side) {
      case 0: // Top
        return { x: Math.random() * window.innerWidth, y: -50 }
      case 1: // Right
        return { x: window.innerWidth + 50, y: Math.random() * window.innerHeight }
      case 2: // Bottom
        return { x: Math.random() * window.innerWidth, y: window.innerHeight + 50 }
      case 3: // Left
        return { x: -50, y: Math.random() * window.innerHeight }
    }

    return { x: 0, y: 0 }
  }, [])

  const mouseType = useMemo(() => (Math.random() > 0.5 ? '🐁' : '🐀'), [])

  const startPoint = generateOffscreenPoint()
  const endPoint = generateOffscreenPoint()

  const zigzagKeyframes = useMemo(() => {
    const steps = 10
    const keyframes: { x: number; y: number }[] = []
    const zigzagAmplitude = 50
    let direction = Math.random() < 0.5 ? 1 : -1

    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    const angle = Math.atan2(dy, dx)

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps
      const baseX = startPoint.x + dx * progress
      const baseY = startPoint.y + dy * progress

      const zigzagOffset = i % 2 === 0 ? 0 : direction * zigzagAmplitude
      direction *= -1

      keyframes.push({
        x: baseX + Math.cos(angle + Math.PI / 2) * zigzagOffset,
        y: baseY + Math.sin(angle + Math.PI / 2) * zigzagOffset,
      })
    }
    return keyframes
  }, [startPoint, endPoint])

  return (
    <motion.div
      key={index}
      initial={{ x: startPoint.x, y: startPoint.y, opacity: 0 }}
      animate={{
        x: zigzagKeyframes.map((k) => k.x),
        y: zigzagKeyframes.map((k) => k.y),
        opacity: [0, 1, 1, 1, 1, 1, 0],
      }}
      transition={{ duration: 3, ease: 'linear' }}
      className="absolute text-2xl"
    >
      {mouseType}
    </motion.div>
  )
}

export const MouseAnimation: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="cursor-pointer text-2xl"
        onMouseEnter={() => setIsAnimating(true)}
        onMouseLeave={() => setIsAnimating(false)}
      >
        🐁
      </div>
      {isAnimating && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(30)].map((_, index) => (
            <RunningMouse key={index} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
