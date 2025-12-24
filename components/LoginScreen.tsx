import React, { useState } from 'react';
import { Role } from '../types';

interface LoginProps {
  onLogin: (roomId: string, name: string, role: Role) => void;
}

const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && name) {
      onLogin(roomId.toUpperCase(), name, isAdmin ? 'admin' : 'player');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 pattern-bg pointer-events-none"></div>
      
      <div className="max-w-md w-full bg-[#fdf6e3] border-4 border-[#5d4037] p-8 rounded-lg shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#b71c1c] mb-2 uppercase tracking-wider">IGNITE HISTORY</h1>
          <div className="h-1 w-24 bg-[#5d4037] mx-auto"></div>
          <p className="mt-2 text-[#5d4037] italic">Hệ thống hỗ trợ board game</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#5d4037] font-bold mb-2">Tên Phòng (Mã Game)</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#5d4037] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#b71c1c] text-lg uppercase"
              placeholder="Ví dụ: RONGVANG"
              required
            />
          </div>

          <div>
            <label className="block text-[#5d4037] font-bold mb-2">Tên Của Bạn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#5d4037] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#b71c1c] text-lg"
              placeholder="Ví dụ: Chúa Nguyễn"
              required
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="adminCheck"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="w-5 h-5 accent-[#b71c1c]"
            />
            <label htmlFor="adminCheck" className="text-[#5d4037] font-bold select-none cursor-pointer">
              Đăng nhập với vai trò Quản Trò (Triều Đình)
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#b71c1c] text-[#fdf6e3] font-bold py-4 rounded shadow-lg hover:bg-[#8e1616] transition-colors text-xl uppercase tracking-widest border-2 border-[#5d4037]"
          >
            Vào Sổ
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;