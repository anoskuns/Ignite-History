import { useState, useEffect, useCallback } from 'react';
import { GameState, Player, GameRequest, RequestType, Role } from '../types';
import { INITIAL_BALANCE, INITIAL_PROPERTIES, SALARY_AMOUNT } from '../constants';

const STORAGE_KEY_PREFIX = 'htnn_game_';

// Helper to simulate ID generation
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useGameService = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Load game state from local storage
  const loadGame = useCallback((id: string): GameState => {
    const key = `${STORAGE_KEY_PREFIX}${id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize new game if not found
    const initialGame: GameState = {
      roomId: id,
      status: 'active',
      players: {},
      properties: INITIAL_PROPERTIES.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
      requests: {},
      lastUpdated: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(initialGame));
    return initialGame;
  }, []);

  const saveGame = useCallback((state: GameState) => {
    const key = `${STORAGE_KEY_PREFIX}${state.roomId}`;
    const newState = { ...state, lastUpdated: Date.now() };
    localStorage.setItem(key, JSON.stringify(newState));
    setGameState(newState);
    // Dispatch event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: JSON.stringify(newState)
    }));
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${STORAGE_KEY_PREFIX}${roomId}` && e.newValue) {
        setGameState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [roomId]);

  // Periodic refresh to simulate real-time feel in single browser
  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(() => {
        const current = loadGame(roomId);
        if (gameState && current.lastUpdated > gameState.lastUpdated) {
            setGameState(current);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [roomId, gameState, loadGame]);


  const login = (room: string, name: string, role: Role) => {
    const game = loadGame(room);
    
    // Check if player exists or create new
    let pId = (Object.values(game.players) as Player[]).find(p => p.name === name)?.id;
    
    if (!pId) {
      pId = generateId();
      game.players[pId] = {
        id: pId,
        name,
        balance: INITIAL_BALANCE,
        role,
        propertiesCount: 0,
        joinedAt: Date.now(),
      };
      saveGame(game);
    } else {
        // Update role just in case they switch context, though usually names should be unique per role ideally
        game.players[pId].role = role; 
        saveGame(game);
    }

    setRoomId(room);
    setPlayerId(pId);
    setGameState(game);
  };

  const logout = () => {
    setRoomId(null);
    setPlayerId(null);
    setGameState(null);
  };

  const sendRequest = (type: RequestType, amount: number, targetId?: string, targetName?: string) => {
    if (!gameState || !playerId) return;
    
    const request: GameRequest = {
      id: generateId(),
      type,
      playerId,
      playerName: gameState.players[playerId].name,
      amount,
      targetId,
      targetName,
      status: 'PENDING',
      timestamp: Date.now(),
    };

    const newGame = { ...gameState };
    newGame.requests[request.id] = request;
    saveGame(newGame);
  };

  const approveRequest = (reqId: string) => {
    if (!gameState) return;
    const game = { ...gameState };
    const req = game.requests[reqId];
    if (!req || req.status !== 'PENDING') return;

    const player = game.players[req.playerId];

    if (req.type === 'BUY') {
      if (player.balance >= req.amount && req.targetId) {
        player.balance -= req.amount;
        const prop = game.properties[req.targetId];
        prop.ownerId = player.id;
        prop.level = 1;
        player.propertiesCount += 1;
        req.status = 'APPROVED';
      } else {
        // Not enough money or invalid property
        req.status = 'REJECTED'; 
      }
    } else if (req.type === 'SALARY') {
      player.balance += req.amount;
      req.status = 'APPROVED';
    } else if (req.type === 'UPGRADE') {
         if (player.balance >= req.amount && req.targetId) {
             player.balance -= req.amount;
             const prop = game.properties[req.targetId];
             if(prop.level < 3) prop.level += 1 as any;
             req.status = 'APPROVED';
         } else {
             req.status = 'REJECTED';
         }
    }

    saveGame(game);
  };

  const rejectRequest = (reqId: string) => {
    if (!gameState) return;
    const game = { ...gameState };
    if (game.requests[reqId]) {
      game.requests[reqId].status = 'REJECTED';
      saveGame(game);
    }
  };

  const resetGame = () => {
    if (!gameState) return;
    const game = { ...gameState };
    
    // Reset properties
    Object.keys(game.properties).forEach(k => {
        game.properties[k].ownerId = null;
        game.properties[k].level = 0;
    });

    // Reset players
    Object.keys(game.players).forEach(k => {
        game.players[k].balance = INITIAL_BALANCE;
        game.players[k].propertiesCount = 0;
    });

    // Clear requests
    game.requests = {};
    
    saveGame(game);
  };

  const updateBalance = (pId: string, amount: number) => {
      if (!gameState) return;
      const game = { ...gameState };
      if (game.players[pId]) {
          game.players[pId].balance += amount;
          saveGame(game);
      }
  };

  const currentPlayer = gameState && playerId ? gameState.players[playerId] : null;

  return {
    gameState,
    currentPlayer,
    login,
    logout,
    sendRequest,
    approveRequest,
    rejectRequest,
    resetGame,
    updateBalance
  };
};