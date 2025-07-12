"use client"
import { motion } from 'framer-motion'

const foodItems = [
  { emoji: '🍔', size: 'text-4xl', distance: 160, duration: 20 },
  { emoji: '🍕', size: 'text-5xl', distance: 180, duration: 25 },
  { emoji: '🌮', size: 'text-4xl', distance: 150, duration: 30 },
  { emoji: '🍩', size: 'text-3xl', distance: 170, duration: 22 },
  { emoji: '🍟', size: 'text-4xl', distance: 190, duration: 28 },
  { emoji: '🥤', size: 'text-3xl', distance: 160, duration: 26 },
]

export default function OrbitingFood() {
  return (
    <div className="absolute inset-0 z-0">
      {foodItems.map((item, index) => (
        <motion.div
          key={index}
          className="absolute top-1/2 left-1/2"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotate: 360 }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <motion.div
            className={`absolute ${item.size}`}
            style={{
              transform: `translateX(${item.distance}px) rotateY(${index * 60}deg) translateZ(50px) rotateX(20deg)`,
            }}
            animate={{
              y: [0, -10, 0, 10, 0],
              scale: [1, 1.1, 1, 0.9, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.5,
            }}
          >
            {item.emoji}
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
} 