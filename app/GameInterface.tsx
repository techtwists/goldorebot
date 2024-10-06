import React from 'react'

interface GameInterfaceProps {
  gameState: any;
  incrementScore: (amount: number) => void;
  upgradePickaxe: () => void;
  hireMiner: () => void;
}

export default function GameInterface({
  gameState,
  incrementScore,
  upgradePickaxe,
  hireMiner,
}: GameInterfaceProps) {
  return (
    <div id="game-container">
      <svg id="ore" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" onClick={() => incrementScore(gameState.clickValue)}>
        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#bdc3c7" stroke="#7f8c8d" strokeWidth="2" />
        <circle cx="30" cy="30" r="8" fill="#f1c40f" />
        <circle cx="70" cy="60" r="10" fill="#f1c40f" />
        <circle cx="45" cy="70" r="6" fill="#f1c40f" />
      </svg>
      <div id="score">Gold: {gameState.score}</div>
      <div id="ui-container">
        <button className="upgrade-btn" onClick={upgradePickaxe}>
          Upgrade Pickaxe (Cost: {gameState.pickaxeCost})
        </button>
        <button className="upgrade-btn" onClick={hireMiner}>
          Hire Miner (Cost: {gameState.minerCost})
        </button>
      </div>
      <div id="auto-miner">Miners: {gameState.minerCount}</div>
    </div>
  )
}
