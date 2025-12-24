import React, { useState, useMemo } from 'react';
import { Player, GameState, GameRequest, Role, Property } from '../types';
import { SALARY_AMOUNT } from '../constants';

interface Props {
  gameState: GameState;
  onApprove: (reqId: string) => void;
  onReject: (reqId: string) => void;
  onUpdateBalance: (playerId: string, amount: number) => void;
  onReset: () => void;
  onLogout: () => void;
}

const MONEY_AMOUNTS = [1, 2, 5, 10, 50, 100, 200, 500];

const AdminDashboard: React.FC<Props> = ({ gameState, onApprove, onReject, onUpdateBalance, onReset, onLogout }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'requests'>('overview');

  const pendingRequests = useMemo(() => {
    return (Object.values(gameState.requests) as GameRequest[])
        .filter(r => r.status === 'PENDING')
        .sort((a, b) => a.timestamp - b.timestamp);
  }, [gameState.requests]);

  const playersList = (Object.values(gameState.players) as Player[]).filter(p => p.role === 'player');

  const selectedPlayer = selectedPlayerId ? gameState.players[selectedPlayerId] : null;

  const handleTax = () => {
      if (selectedPlayerId && selectedPlayer) {
          if (window.confirm(`Xác nhận trừ 15% tài sản của ${selectedPlayer.name}?`)) {
              const taxAmount = Math.floor(selectedPlayer.balance * 0.15);
              onUpdateBalance(selectedPlayerId, -taxAmount);
          }
      }
  };

  return (
    <div className="min-h-screen bg-[#eFEBE9] text-[#5d4037] flex flex-col md:flex-row">
      
      {/* Sidebar / Navigation */}
      <div className="bg-[#5d4037] text-[#fdf6e3] w-full md:w-64 p-4 flex flex-col justify-between shrink-0">
         <div>
             <h1 className="text-2xl font-bold mb-6 border-b border-[#fdf6e3]/30 pb-4 text-center">TRIỀU ĐÌNH</h1>
             <nav className="space-y-2">
                 <button 
                   onClick={() => setView('overview')}
                   className={`w-full text-left px-4 py-3 rounded ${view === 'overview' ? 'bg-[#b71c1c]' : 'hover:bg-[#fff]/10'}`}
                 >
                    Dân Chúng ({playersList.length})
                 </button>
                 <button 
                   onClick={() => setView('requests')}
                   className={`w-full text-left px-4 py-3 rounded flex justify-between items-center ${view === 'requests' ? 'bg-[#b71c1c]' : 'hover:bg-[#fff]/10'}`}
                 >
                    <span>Sớ Tấu</span>
                    {pendingRequests.length > 0 && (
                        <span className="bg-[#fdf6e3] text-[#b71c1c] text-xs font-bold px-2 py-1 rounded-full">{pendingRequests.length}</span>
                    )}
                 </button>
             </nav>
         </div>
         <div className="mt-8 space-y-4">
             <button 
                onClick={() => {
                    if(window.confirm('Bạn có chắc chắn muốn thiết lập lại toàn bộ trò chơi? Tiền và đất sẽ mất hết.')) {
                        onReset();
                    }
                }}
                className="w-full border border-red-400 text-red-300 hover:bg-red-900/50 px-4 py-2 rounded text-sm"
             >
                 Thiết Lập Lại
             </button>
             <button onClick={onLogout} className="w-full text-center text-sm opacity-60 hover:opacity-100">Thoát</button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
         {view === 'overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Player List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase border-b-2 border-[#5d4037] pb-2">Danh Sách Dân Chúng</h2>
                    {playersList.length === 0 ? <p className="italic opacity-60">Chưa có ai tham gia.</p> : (
                        playersList.map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => setSelectedPlayerId(p.id)}
                              className={`p-4 rounded border-2 cursor-pointer transition-colors ${selectedPlayerId === p.id ? 'bg-[#5d4037] text-[#fdf6e3] border-[#5d4037]' : 'bg-white border-[#5d4037]/20 hover:border-[#5d4037]'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-lg">{p.name}</div>
                                        <div className="text-sm opacity-80">Đất: {p.propertiesCount}</div>
                                    </div>
                                    <div className="text-xl font-bold">{p.balance.toLocaleString()}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Selected Player Control Panel */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-[#5d4037]">
                    {selectedPlayer ? (
                        <>
                           <div className="text-center mb-6">
                               <h3 className="text-2xl font-bold text-[#b71c1c]">{selectedPlayer.name}</h3>
                               <p className="text-4xl font-black mt-2 text-[#5d4037]">{selectedPlayer.balance.toLocaleString()} <span className="text-sm font-normal">Quan</span></p>
                           </div>

                           <div className="mb-6">
                               <h4 className="font-bold mb-3 text-sm uppercase text-gray-500">Điều chỉnh ngân khố</h4>
                               <div className="grid grid-cols-4 gap-2 mb-4">
                                   {MONEY_AMOUNTS.map(amt => (
                                       <button 
                                         key={`plus-${amt}`}
                                         onClick={() => onUpdateBalance(selectedPlayer.id, amt)}
                                         className="bg-green-100 text-green-800 border border-green-300 font-bold py-2 rounded hover:bg-green-200"
                                       >
                                           +{amt}
                                       </button>
                                   ))}
                               </div>
                               <div className="grid grid-cols-4 gap-2">
                                   {MONEY_AMOUNTS.map(amt => (
                                       <button 
                                         key={`minus-${amt}`}
                                         onClick={() => onUpdateBalance(selectedPlayer.id, -amt)}
                                         className="bg-red-100 text-red-800 border border-red-300 font-bold py-2 rounded hover:bg-red-200"
                                       >
                                           -{amt}
                                       </button>
                                   ))}
                               </div>
                               <div className="mt-4 pt-4 border-t border-gray-200">
                                   <button 
                                     onClick={handleTax}
                                     className="w-full bg-[#5d4037] text-[#fdf6e3] py-3 rounded font-bold hover:bg-[#3e2b25] border-2 border-[#5d4037] active:scale-95 transition-transform"
                                   >
                                       THUẾ 15%
                                   </button>
                               </div>
                           </div>
                           
                           <div className="border-t pt-4">
                               <h4 className="font-bold mb-2 text-sm uppercase text-gray-500">Tài sản ({selectedPlayer.propertiesCount})</h4>
                               <div className="flex flex-wrap gap-2">
                                   {(Object.values(gameState.properties) as Property[])
                                     .filter(p => p.ownerId === selectedPlayer.id)
                                     .map(p => (
                                         <span key={p.id} className="bg-[#5d4037] text-[#fdf6e3] text-xs px-2 py-1 rounded">
                                             {p.name} (Lv{p.level})
                                         </span>
                                     ))
                                   }
                                   {selectedPlayer.propertiesCount === 0 && <span className="text-sm italic text-gray-400">Không có tài sản</span>}
                               </div>
                           </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-40 italic">
                            Chọn một dân chúng để thao tác
                        </div>
                    )}
                </div>
             </div>
         )}

         {view === 'requests' && (
             <div className="max-w-3xl mx-auto">
                 <h2 className="text-xl font-bold uppercase border-b-2 border-[#5d4037] pb-4 mb-6">Sớ Tấu Cần Duyệt</h2>
                 <div className="space-y-4">
                     {pendingRequests.length === 0 ? <p className="italic opacity-60 text-center py-10">Không có sớ tấu nào đang chờ.</p> : (
                         pendingRequests.map(req => (
                             <div key={req.id} className="bg-white border-l-4 border-[#b71c1c] p-6 shadow-md rounded-r flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                         <span className="font-bold text-lg">{req.playerName}</span>
                                         <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{new Date(req.timestamp).toLocaleTimeString()}</span>
                                     </div>
                                     <div className="text-[#5d4037]">
                                         {req.type === 'BUY' && <>Muốn mua <strong>{req.targetName}</strong> với giá <strong className="text-red-700">{req.amount}</strong> quan</>}
                                         {req.type === 'SALARY' && <>Xin nhận lương <strong className="text-green-700">+{req.amount}</strong> quan</>}
                                         {req.type === 'UPGRADE' && <>Muốn nâng cấp <strong>{req.targetName}</strong> chi phí <strong className="text-red-700">{req.amount}</strong> quan</>}
                                     </div>
                                 </div>
                                 <div className="flex gap-3 w-full sm:w-auto">
                                     <button 
                                       onClick={() => onReject(req.id)}
                                       className="flex-1 sm:flex-none border-2 border-red-800 text-red-800 px-4 py-2 rounded font-bold hover:bg-red-50"
                                     >
                                         Bác Bỏ
                                     </button>
                                     <button 
                                       onClick={() => onApprove(req.id)}
                                       className="flex-1 sm:flex-none bg-[#5d4037] text-[#fdf6e3] px-6 py-2 rounded font-bold shadow hover:bg-[#3e2b25]"
                                     >
                                         Phê Duyệt
                                     </button>
                                 </div>
                             </div>
                         ))
                     )}
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default AdminDashboard;