"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Confetti from "./Confetti"
import { useTheme } from "./ThemeContext"
import BonusAnimation from "./BonusAnimation"

const BIRD_NAMES = ["Sparrow", "Eagle", "Pigeon", "Parrot", "Crow", "Owl", "Hawk", "Robin"]
const NON_BIRD_NAMES = ["Dog", "Cat", "Elephant", "Lion", "Tiger", "Bear", "Wolf", "Fox", "Deer", "Rabbit"]
const WORD_DURATION = 2000 // 2 seconds

interface GameScreenProps {
  score: number
  setScore: React.Dispatch<React.SetStateAction<number>> // Updated typing
  highScore: number
  setHighScore: React.Dispatch<React.SetStateAction<number>>
  onGameOver: (finalScore: number) => void
  isGameOver: boolean
  onPlayAgain: () => void
  goToHome: () => void
}

export default function GameScreen({
  score,
  setScore,
  highScore,
  setHighScore,
  onGameOver,
  isGameOver,
  onPlayAgain,
  goToHome,
}: GameScreenProps) {
  const [word, setWord] = useState("")
  const [isBirdWord, setIsBirdWord] = useState(false)
  const [showHighScorePopup, setShowHighScorePopup] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [streak, setStreak] = useState(0)
  const [bonusMultiplier, setBonusMultiplier] = useState(1)
  const [showBonusAnimation, setShowBonusAnimation] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const wordStartTimeRef = useRef<number>(0)
  const { isDark } = useTheme()

  const handleGameOver = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onGameOver(score)

    if (score > highScore) {
      setHighScore(score)
      setShowHighScorePopup(true)
      setShowConfetti(true)
      localStorage.setItem("highScore", score.toString())

      setTimeout(() => {
        setShowConfetti(false)
      }, 8000)
    }
  }, [score, highScore, setHighScore, onGameOver])

  const generateWord = useCallback(() => {
    if (isGameOver) return

    const isBird = Math.random() < 0.5
    const wordList = isBird ? BIRD_NAMES : NON_BIRD_NAMES
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)]
    setWord(randomWord)
    setIsBirdWord(isBird)
    wordStartTimeRef.current = Date.now()

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      if (isBird) {
        handleGameOver()
      } else {
        generateWord()
      }
    }, WORD_DURATION)
  }, [isGameOver, handleGameOver])

  useEffect(() => {
    if (!isGameOver) {
      generateWord()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [generateWord, isGameOver])

  const handleBirdClick = useCallback(() => {
    if (isGameOver) return

    const currentTime = Date.now()
    const timePassed = currentTime - wordStartTimeRef.current

    if (timePassed <= WORD_DURATION) {
      if (isBirdWord) {
        const newStreak = streak + 1
        const newBonusMultiplier = Math.floor(newStreak / 5) + 1
        const pointsToAdd = newBonusMultiplier

        setStreak(newStreak)
        setScore((prevScore) => prevScore + pointsToAdd) // Safely updating the score

        if (newBonusMultiplier > bonusMultiplier) {
          setBonusMultiplier(newBonusMultiplier)
          setShowBonusAnimation(true)
          setTimeout(() => setShowBonusAnimation(false), 1000)
        }

        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        generateWord()
      } else {
        setStreak(0)
        setBonusMultiplier(1)
        handleGameOver()
      }
    }
  }, [isGameOver, isBirdWord, streak, bonusMultiplier, setScore, generateWord, handleGameOver])

  const resetScore = useCallback(() => {
    setHighScore(0)
    localStorage.setItem("highScore", "0")
    setShowHighScorePopup(false)
  }, [setHighScore])

  if (isGameOver) {
    return (
      <div
        className={`bg-primary ${isDark ? "dark" : ""} bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-lg p-4 sm:p-8 shadow-lg text-center relative`}
      >
        <Confetti isActive={showConfetti} />
        {showHighScorePopup && (
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 rounded-t-lg animate-bounce">
            <p className="text-2xl font-bold">New High Score: {score}</p>
          </div>
        )}
        <h2 className="text-4xl font-semibold mb-6 text-yellow-400">Game Over!</h2>
        <p className="text-2xl mb-4 text-white">
          Final Score: <span className="text-yellow-400 font-semibold">{score}</span>
        </p>
        <p className="text-2xl mb-8 text-white">
          High Score: <span className="text-yellow-400 font-semibold">{highScore}</span>
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-green-600 text-white rounded-full text-base sm:text-lg font-semibold hover:bg-green-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
          >
            Play Again
          </button>
          <button
            onClick={goToHome}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-full text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Home
          </button>
          <button
            onClick={resetScore}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-red-600 text-white rounded-full text-base sm:text-lg font-semibold hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Reset Score
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-primary ${isDark ? "dark" : ""} bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-lg p-4 sm:p-8 shadow-lg text-center relative`}
    >
      <BonusAnimation isVisible={showBonusAnimation} bonusLevel={bonusMultiplier} />
      <h2 className="text-4xl font-semibold mb-6 text-yellow-400">{word}</h2>
      <p className="text-2xl mb-8 text-white">
        Score: <span className="text-yellow-400 font-semibold">{score}</span>
        {bonusMultiplier > 1 && <span className="text-yellow-400 font-semibold ml-2">(x{bonusMultiplier} Bonus)</span>}
      </p>
      <button
        onClick={handleBirdClick}
        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-accent text-primary rounded-full text-lg font-semibold hover:bg-yellow-400 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mb-4"
      >
        Bird
      </button>
      <p className="text-xl text-white">
        High Score: <span className="text-yellow-400 font-semibold">{highScore}</span>
      </p>
    </div>
  )
}
