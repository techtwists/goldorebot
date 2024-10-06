'use client'

import React, { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import UserInfo from './UserInfo'
import GameInterface from './GameInterface'

// Define the interface for user data
interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

// Define the interface for game state
interface GameState {
  score: number;
  clickValue: number;
  pickaxeLevel: number;
  minerCount: number;
  pickaxeCost: number;
  minerCost: number;
  userXP: number;
  userLevel: number;
  xpToNextLevel: number;
}

export default function page() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    clickValue: 1,
    pickaxeLevel: 1,
    minerCount: 0,
    pickaxeCost: 10,
    minerCost: 50,
    userXP: 0,
    userLevel: 1,
    xpToNextLevel: 100,
  })

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData)
    }
  }, [])

  // Increment score
  const incrementScore = (amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      score: prevState.score + amount,
    }))
  }

  // Upgrade pickaxe
  const upgradePickaxe = () => {
    if (gameState.score >= gameState.pickaxeCost) {
      setGameState(prevState => ({
        ...prevState,
        score: prevState.score - prevState.pickaxeCost,
        pickaxeLevel: prevState.pickaxeLevel + 1,
        clickValue: Math.pow(2, prevState.pickaxeLevel),
        pickaxeCost: Math.floor(10 * Math.pow(1.5, prevState.pickaxeLevel)),
      }))
    }
  }

  // Hire miner
  const hireMiner = () => {
    if (gameState.score >= gameState.minerCost) {
      setGameState(prevState => ({
        ...prevState,
        score: prevState.score - prevState.minerCost,
        minerCount: prevState.minerCount + 1,
        minerCost: Math.floor(50 * Math.pow(1.5, prevState.minerCount)),
      }))
    }
  }

  // Auto-mining logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.minerCount > 0) {
        incrementScore(gameState.minerCount)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState.minerCount])

  return (
    <main className="p-4">
      {userData ? (
        <>
          <UserInfo user={userData} gameState={gameState} />
          <GameInterface
            gameState={gameState}
            incrementScore={incrementScore}
            upgradePickaxe={upgradePickaxe}
            hireMiner={hireMiner}
          />
        </>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  )
}
