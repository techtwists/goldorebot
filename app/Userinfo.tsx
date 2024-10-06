import React from 'react'
import { GameState } from './Page'

interface UserInfoProps {
  user: {
    first_name: string;
    last_name?: string;
    username?: string;
    is_premium?: boolean;
  };
  gameState: GameState;
}

export default function UserInfo({ user, gameState }: UserInfoProps) {
  return (
    <div className="user-info">
      <div className="user-icon">{user.first_name[0]}</div>
      <div className="user-details">
        <h2 className="user-name">{user.username || user.first_name}</h2>
        <p>Level: {gameState.userLevel}</p>
        <div className="xp-bar">
          <div
            className="xp-progress"
            style={{ width: `${(gameState.userXP / gameState.xpToNextLevel) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
