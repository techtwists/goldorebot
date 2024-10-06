'use client';

import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios'; // Axios for making HTTP requests
import './Game.css'; // Create a separate CSS file for styles

// Define the interface for user data
interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

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

export default function Game() {
  const [userData, setUserData] = useState<UserData | null>(null);
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
  });
  const [errorLogs, setErrorLogs] = useState<string[]>([]); // State to hold error logs

  // Fetch user data from WebApp
  useEffect(() => {
    WebApp.expand();
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  }, []);

  // Fetch game state from MongoDB (via API route)
  const fetchGameState = async (userId: number) => {
    try {
      const response = await axios.get(`/api/game-state?userId=${userId}`);
      if (response.data) {
        setGameState(response.data); // Update local game state with fetched data
      }
    } catch (error: unknown) {
      // Handle unknown error type
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error fetching game state:', errorMessage);
      setErrorLogs((prevLogs) => [...prevLogs, 'Error fetching game state: ' + errorMessage]); // Log error
    }
  };

  // Save game state to MongoDB (via API route)
  const saveGameState = async () => {
    try {
      await axios.post('/api/game-state', {
        userId: userData?.id,
        gameState,
      });
    } catch (error: unknown) {
      // Handle unknown error type
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error saving game state:', errorMessage);
      setErrorLogs((prevLogs) => [...prevLogs, 'Error saving game state: ' + errorMessage]); // Log error
    }
  };

  // Fetch game state when userData becomes available
  useEffect(() => {
    if (userData) {
      fetchGameState(userData.id);
    }
  }, [userData]);

  // Handle score increment
  const incrementScore = (amount: number) => {
    setGameState((prevState) => ({
      ...prevState,
      score: prevState.score + amount,
    }));
    addXP(1);
  };

  // Handle Pickaxe upgrade
  const upgradePickaxe = () => {
    if (gameState.score >= gameState.pickaxeCost) {
      setGameState((prevState) => ({
        ...prevState,
        score: prevState.score - prevState.pickaxeCost,
        pickaxeLevel: prevState.pickaxeLevel + 1,
        clickValue: Math.pow(2, prevState.pickaxeLevel),
        pickaxeCost: Math.floor(10 * Math.pow(1.5, prevState.pickaxeLevel)),
      }));
      addXP(5);
    }
  };

  // Hire miner logic
  const hireMiner = () => {
    if (gameState.score >= gameState.minerCost) {
      setGameState((prevState) => ({
        ...prevState,
        score: prevState.score - prevState.minerCost,
        minerCount: prevState.minerCount + 1,
        minerCost: Math.floor(50 * Math.pow(1.5, prevState.minerCount)),
      }));
      addXP(10);
    }
  };

  // Handle XP and leveling up
  const addXP = (amount: number) => {
    setGameState((prevState) => {
      let newXP = prevState.userXP + amount;
      let levelUp = false;
      if (newXP >= prevState.xpToNextLevel) {
        newXP -= prevState.xpToNextLevel;
        levelUp = true;
      }

      return {
        ...prevState,
        userXP: newXP,
        userLevel: levelUp ? prevState.userLevel + 1 : prevState.userLevel,
        xpToNextLevel: levelUp
          ? Math.floor(prevState.xpToNextLevel * 1.5)
          : prevState.xpToNextLevel,
      };
    });
  };

  // Auto-miner logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.minerCount > 0) {
        incrementScore(gameState.minerCount);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.minerCount]);

  // Auto-save game state when it changes
  useEffect(() => {
    if (userData) {
      saveGameState();
    }
  }, [gameState]);

  // UI updates and buttons
  const updateButtonStates = (score: number, cost: number) => score >= cost;

  return (
    <main className="game-container">
      {userData ? (
        <>
          <div id="user-info">
            <div id="user-icon">{userData.first_name[0]}</div>
            <div id="user-details">
              <h2 id="user-name">{userData.first_name}</h2>
              <p id="user-level">Level {gameState.userLevel}</p>
              <div id="xp-bar">
                <div
                  id="xp-progress"
                  style={{ width: `${(gameState.userXP / gameState.xpToNextLevel) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div id="game-container">
            <svg
              id="ore"
              onClick={() => incrementScore(gameState.clickValue)}
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="50,5 95,25 95,75 50,95 5,75 5,25"
                fill="#bdc3c7"
                stroke="#7f8c8d"
                strokeWidth="2"
              />
              <circle cx="30" cy="30" r="8" fill="#f1c40f" />
              <circle cx="70" cy="60" r="10" fill="#f1c40f" />
              <circle cx="45" cy="70" r="6" fill="#f1c40f" />
            </svg>
            <div id="score">Gold: {gameState.score}</div>
          </div>
          <div id="ui-container">
            <button
              id="pickaxe-upgrade"
              className="upgrade-btn"
              onClick={upgradePickaxe}
              disabled={!updateButtonStates(gameState.score, gameState.pickaxeCost)}
            >
              Upgrade Pickaxe (Cost: {gameState.pickaxeCost})
            </button>
            <button
              id="hire-miner"
              className="upgrade-btn"
              onClick={hireMiner}
              disabled={!updateButtonStates(gameState.score, gameState.minerCost)}
            >
              Hire Miner (Cost: {gameState.minerCost})
            </button>
          </div>
          <div id="auto-miner">Miners: {gameState.minerCount}</div>
          <div id="error-logs">
            <h3>Error Logs:</h3>
            <ul>
              {errorLogs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
          }
