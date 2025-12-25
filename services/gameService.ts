import { useState, useEffect } from 'react';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  getDoc, 
  runTransaction, 
  increment 
} from 'firebase/firestore';
import { db } from '../firebase';
import { GameState, Player, GameRequest, RequestType, Role } from '../types';
import { INITIAL_BALANCE, INITIAL_PROPERTIES } from '../constants';

// Helper to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useGameService = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Sync game state from Firestore in Real-time
  useEffect(() => {
    if (!roomId) {
        setGameState(null);
        return;
    }

    const gameRef = doc(db, 'games', roomId);
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data() as GameState);
      } else {
        // If doc doesn't exist (deleted), clear state or handle error
        setGameState(null);
      }
    }, (error) => {
      console.error("Error syncing game:", error);
    });

    return () => unsubscribe();
  }, [roomId]);

  const login = async (room: string, name: string, role: Role) => {
    try {
      const gameRef = doc(db, 'games', room);
      const gameSnap = await getDoc(gameRef);
      
      let currentPId = '';

      if (!gameSnap.exists()) {
        // Initialize new game if it doesn't exist
        const newPlayerId = generateId();
        const initialGame: GameState = {
          roomId: room,
          status: 'active',
          players: {
            [newPlayerId]: {
              id: newPlayerId,
              name,
              balance: INITIAL_BALANCE,
              role,
              propertiesCount: 0,
              joinedAt: Date.now(),
            }
          },
          properties: INITIAL_PROPERTIES.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
          requests: {},
          lastUpdated: Date.now(),
        };
        await setDoc(gameRef, initialGame);
        currentPId = newPlayerId;
      } else {
        // Join existing game
        const data = gameSnap.data() as GameState;
        // Check if player with same name exists
        const existingPlayer = Object.values(data.players).find(p => p.name === name);
        
        if (existingPlayer) {
          currentPId = existingPlayer.id;
          // Update role if changed (optional logic)
          if (existingPlayer.role !== role) {
             await updateDoc(gameRef, {
                [`players.${currentPId}.role`]: role
             });
          }
        } else {
          // Create new player in existing room
          currentPId = generateId();
          const newPlayer: Player = {
            id: currentPId,
            name,
            balance: INITIAL_BALANCE,
            role,
            propertiesCount: 0,
            joinedAt: Date.now(),
          };
          await updateDoc(gameRef, {
            [`players.${currentPId}`]: newPlayer
          });
        }
      }

      setRoomId(room);
      setPlayerId(currentPId);
    } catch (e) {
      console.error("Login failed:", e);
      alert("Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
    }
  };

  const logout = () => {
    setRoomId(null);
    setPlayerId(null);
    setGameState(null);
  };

  const sendRequest = async (type: RequestType, amount: number, targetId?: string, targetName?: string) => {
    if (!roomId || !playerId || !gameState) return;

    const requestId = generateId();
    const request: GameRequest = {
      id: requestId,
      type,
      playerId,
      playerName: gameState.players[playerId].name,
      amount,
      targetId,
      targetName,
      status: 'PENDING',
      timestamp: Date.now(),
    };

    const gameRef = doc(db, 'games', roomId);
    // Use dot notation to update nested map field
    await updateDoc(gameRef, {
      [`requests.${requestId}`]: request
    });
  };

  const approveRequest = async (reqId: string) => {
    if (!roomId || !gameState) return;
    const gameRef = doc(db, 'games', roomId);

    try {
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(gameRef);
        if (!sfDoc.exists()) throw "Game does not exist!";

        const gameData = sfDoc.data() as GameState;
        const req = gameData.requests[reqId];
        
        if (!req || req.status !== 'PENDING') return; // Already processed

        const player = gameData.players[req.playerId];
        if (!player) return; // Player might have left

        if (req.type === 'BUY') {
          if (!req.targetId) return;
          const prop = gameData.properties[req.targetId];
          
          if (player.balance >= req.amount && !prop.ownerId) {
            // Deduct money, Assign property
            transaction.update(gameRef, {
              [`players.${req.playerId}.balance`]: player.balance - req.amount,
              [`players.${req.playerId}.propertiesCount`]: player.propertiesCount + 1,
              [`properties.${req.targetId}.ownerId`]: req.playerId,
              [`properties.${req.targetId}.level`]: 1,
              [`requests.${reqId}.status`]: 'APPROVED'
            });
          } else {
            transaction.update(gameRef, { [`requests.${reqId}.status`]: 'REJECTED' });
          }
        } else if (req.type === 'SALARY') {
          transaction.update(gameRef, {
            [`players.${req.playerId}.balance`]: player.balance + req.amount,
            [`requests.${reqId}.status`]: 'APPROVED'
          });
        } else if (req.type === 'UPGRADE') {
          if (!req.targetId) return;
          const prop = gameData.properties[req.targetId];
          
          if (player.balance >= req.amount && prop.level < 3) {
             transaction.update(gameRef, {
                [`players.${req.playerId}.balance`]: player.balance - req.amount,
                [`properties.${req.targetId}.level`]: prop.level + 1,
                [`requests.${reqId}.status`]: 'APPROVED'
             });
          } else {
             transaction.update(gameRef, { [`requests.${reqId}.status`]: 'REJECTED' });
          }
        }
      });
    } catch (e) {
      console.error("Transaction failed: ", e);
      alert("Xử lý thất bại. Có thể dữ liệu đã thay đổi.");
    }
  };

  const rejectRequest = async (reqId: string) => {
    if (!roomId) return;
    const gameRef = doc(db, 'games', roomId);
    await updateDoc(gameRef, {
      [`requests.${reqId}.status`]: 'REJECTED'
    });
  };

  const resetGame = async () => {
    if (!roomId || !gameState) return;
    const gameRef = doc(db, 'games', roomId);
    
    // Construct reset state locally
    const resetProperties = { ...gameState.properties };
    Object.keys(resetProperties).forEach(k => {
      resetProperties[k] = { ...resetProperties[k], ownerId: null, level: 0 };
    });

    const resetPlayers = { ...gameState.players };
    Object.keys(resetPlayers).forEach(k => {
      resetPlayers[k] = { ...resetPlayers[k], balance: INITIAL_BALANCE, propertiesCount: 0 };
    });

    await updateDoc(gameRef, {
      properties: resetProperties,
      players: resetPlayers,
      requests: {} // Clear all requests
    });
  };

  const updateBalance = async (pId: string, amount: number) => {
    if (!roomId) return;
    const gameRef = doc(db, 'games', roomId);
    await updateDoc(gameRef, {
      [`players.${pId}.balance`]: increment(amount)
    });
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