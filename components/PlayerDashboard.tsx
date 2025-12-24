import React, { useState, useMemo } from 'react';
import { Player, GameState, GameRequest, Property } from '../types';
import { SALARY_AMOUNT } from '../constants';

interface Props {
  player: Player;
  gameState: GameState;
  onSendRequest: (type: 'BUY' | 'UPGRADE' | 'SALARY', amount: number, targetId?: string, targetName?: string) => void;
  onLogout: () => void;
}

const PlayerDashboard: React.FC<Props> = ({ player, gameState, onSendRequest, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'requests'>('properties');
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Filter available properties (not owned)
  const availableProperties = useMemo(() => {
    return (Object.values(gameState.properties) as Property[]).filter(p => !p.ownerId);
  }, [gameState.properties]);

  const myProperties = useMemo(() => {
    return (Object.values(gameState.properties) as Property[]).filter(p => p.ownerId === player.id);
  }, [gameState.properties, player.id]);

  const myRequests = useMemo(() => {
    return (Object.values(gameState.requests) as GameRequest[])
      .filter(r => r.playerId === player.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [gameState.requests, player.id]);

  const pendingCount = useMemo(() => {
      return myRequests.filter(r => r.status === 'PENDING').length;
  }, [myRequests]);

  const handleBuy = (prop: Property) => {
    if (player.balance < prop.price) {
      alert("Ngân khố không đủ để mua vùng đất này!");
      return;
    }
    onSendRequest('BUY', prop.price, prop.id, prop.name);
    setShowBuyModal(false);
  };

  const handleUpgrade = (prop: Property) => {
      if (player.balance < prop.buildPrice) {
          alert("Ngân khố không đủ để nâng cấp!");
          return;
      }
      onSendRequest('UPGRADE', prop.buildPrice, prop.id, prop.name);
  };

  const handleSalary = () => {
    onSendRequest('SALARY', SALARY_AMOUNT);
  };

  const getLevelName = (level: number) => {
      switch(level) {
          case 0: return 'Đất Trống';
          case 1: return 'Dinh Điền';
          case 2: return 'Phủ Đệ';
          case 3: return 'Phủ Thành';
          default: return '';
      }
  };

  return (
    <div className="min-h-screen pb-20 relative">
       {/* Sticky Header */}
       <header className="sticky top-0 z-20 bg-[#b71c1c] text-[#fdf6e3] shadow-lg border-b-4 border-[#5d4037]">
         <div className="px-4 py-3 flex justify-between items-center max-w-2xl mx-auto">
            <div>
                <h2 className="font-bold text-lg">{player.name}</h2>
                <div className="text-xs opacity-80 uppercase tracking-wider">Dân Chúng</div>
            </div>
            <div className="text-right">
                <div className="text-2xl font-black">{player.balance.toLocaleString()}</div>
                <div className="text-xs opacity-80">Quan Tiền</div>
            </div>
         </div>
       </header>

       <main className="p-4 max-w-2xl mx-auto space-y-6">
          
          {/* Action Bar */}
          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={() => setShowBuyModal(true)}
               className="bg-[#5d4037] text-[#fdf6e3] py-4 rounded-lg font-bold shadow border-2 border-[#fdf6e3] active:scale-95 transition-transform flex flex-col items-center justify-center"
             >
                <span className="text-2xl mb-1">🏰</span>
                <span>Mua Đất</span>
             </button>
             <button 
               onClick={handleSalary}
               className="bg-[#2e7d32] text-[#fdf6e3] py-4 rounded-lg font-bold shadow border-2 border-[#fdf6e3] active:scale-95 transition-transform flex flex-col items-center justify-center"
             >
                <span className="text-2xl mb-1">💰</span>
                <span>Nhận Lương</span>
             </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-[#5d4037]">
            <button 
                onClick={() => setActiveTab('properties')}
                className={`flex-1 py-3 font-bold transition-colors ${activeTab === 'properties' ? 'bg-[#5d4037] text-[#fdf6e3]' : 'text-[#5d4037] hover:bg-[#5d4037]/10'}`}
            >
                Địa Bạ ({myProperties.length})
            </button>
            <button 
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-3 font-bold transition-colors relative ${activeTab === 'requests' ? 'bg-[#5d4037] text-[#fdf6e3]' : 'text-[#5d4037] hover:bg-[#5d4037]/10'}`}
            >
                Sớ Tấu
                {pendingCount > 0 && (
                    <span className="absolute top-2 right-1/4 -mt-1 -mr-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-white text-[10px] items-center justify-center">
                            {pendingCount}
                        </span>
                    </span>
                )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
             {activeTab === 'properties' ? (
                 myProperties.length === 0 ? (
                     <p className="text-center italic opacity-60 py-8">Chưa sở hữu vùng đất nào.</p>
                 ) : (
                     myProperties.map(p => (
                         <div key={p.id} className="bg-white/50 border-2 border-[#5d4037] p-3 rounded flex flex-col gap-2">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h3 className="font-bold text-lg text-[#b71c1c]">{p.name}</h3>
                                     <div className="text-sm font-bold text-[#5d4037]">{getLevelName(p.level)}</div>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-xs uppercase text-gray-500">Phí thông hành</div>
                                     <div className="font-black text-xl">{p.rentValues[p.level]}</div>
                                 </div>
                             </div>
                             
                             {p.level < 3 && (
                                 <div className="mt-2 border-t border-[#5d4037]/20 pt-2 flex justify-end">
                                     <button 
                                        onClick={() => handleUpgrade(p)}
                                        className="bg-[#b71c1c] text-[#fdf6e3] px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1 shadow hover:bg-[#8e1616]"
                                     >
                                         <span>⬆️ Nâng cấp</span>
                                         <span className="bg-[#fdf6e3]/20 px-1 rounded text-xs">{p.buildPrice} Quan</span>
                                     </button>
                                 </div>
                             )}
                         </div>
                     ))
                 )
             ) : (
                myRequests.length === 0 ? (
                    <p className="text-center italic opacity-60 py-8">Chưa có sớ tấu nào được gửi.</p>
                ) : (
                    myRequests.map(req => (
                        <div key={req.id} className="bg-white/50 border border-[#5d4037] p-3 rounded flex justify-between items-center text-sm">
                            <div>
                                <span className={`font-bold ${req.type === 'BUY' ? 'text-blue-800' : 'text-green-800'}`}>
                                    {req.type === 'BUY' ? 'MUA ĐẤT' : req.type === 'SALARY' ? 'NHẬN LƯƠNG' : 'NÂNG CẤP'}
                                </span>
                                {req.targetName && <span className="block text-xs">{req.targetName}</span>}
                            </div>
                            <div className="text-right">
                                <span className={`font-bold px-2 py-1 rounded text-xs border ${
                                    req.status === 'PENDING' ? 'bg-red-50 text-red-700 border-red-500' :
                                    req.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-300' :
                                    'bg-gray-100 text-gray-600 border-gray-300'
                                }`}>
                                    {req.status === 'PENDING' ? '🔴 ĐÃ GỬI' : req.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'BÁC BỎ'}
                                </span>
                                <div className="text-xs mt-1 text-gray-500">
                                    {new Date(req.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))
                )
             )}
          </div>
       </main>

        <div className="fixed bottom-4 left-4">
             <button onClick={onLogout} className="text-xs text-[#5d4037] underline opacity-60">Thoát</button>
        </div>

       {/* Buy Modal */}
       {showBuyModal && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
               <div className="bg-[#fdf6e3] w-full max-w-md rounded-xl border-4 border-[#5d4037] shadow-2xl max-h-[80vh] flex flex-col">
                   <div className="p-4 border-b-2 border-[#5d4037] flex justify-between items-center bg-[#5d4037] text-[#fdf6e3]">
                       <h3 className="font-bold text-lg">Chọn Đất Mua</h3>
                       <button onClick={() => setShowBuyModal(false)} className="text-2xl leading-none">&times;</button>
                   </div>
                   <div className="overflow-y-auto p-4 space-y-2 flex-1">
                       {availableProperties.map(p => (
                           <div key={p.id} className="flex justify-between items-center p-3 border border-[#5d4037]/30 rounded hover:bg-[#5d4037]/5">
                               <div>
                                   <div className="font-bold text-[#b71c1c]">{p.name}</div>
                                   <div className="text-xs font-bold text-[#5d4037]">Giá: {p.price}</div>
                               </div>
                               <div className="text-right">
                                   <div className="text-[10px] text-gray-500">Thuế: {p.rentValues[0]}</div>
                                   <button 
                                     onClick={() => handleBuy(p)}
                                     className="mt-1 bg-[#5d4037] text-[#fdf6e3] px-4 py-1.5 rounded text-sm font-bold"
                                   >
                                       Mua
                                   </button>
                               </div>
                           </div>
                       ))}
                       {availableProperties.length === 0 && <p className="text-center p-4">Đã hết đất trống.</p>}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default PlayerDashboard;