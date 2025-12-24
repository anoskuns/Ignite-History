import React from 'react';
import { useGameService } from './services/gameService';
import LoginScreen from './components/LoginScreen';
import PlayerDashboard from './components/PlayerDashboard';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const { 
    gameState, 
    currentPlayer, 
    login, 
    logout, 
    sendRequest, 
    approveRequest, 
    rejectRequest,
    resetGame,
    updateBalance
  } = useGameService();

  if (!gameState || !currentPlayer) {
    return <LoginScreen onLogin={login} />;
  }

  if (currentPlayer.role === 'admin') {
    return (
      <AdminDashboard 
        gameState={gameState} 
        onApprove={approveRequest}
        onReject={rejectRequest}
        onUpdateBalance={updateBalance}
        onReset={resetGame}
        onLogout={logout}
      />
    );
  }

  return (
    <PlayerDashboard 
      player={currentPlayer}
      gameState={gameState}
      onSendRequest={sendRequest}
      onLogout={logout}
    />
  );
};

export default App;