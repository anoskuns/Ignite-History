export type Role = 'player' | 'admin';

export type PropertyLevel = 0 | 1 | 2 | 3; // 0: Trống, 1: Dinh điền, 2: Phủ đệ, 3: Phủ thành

export interface Property {
  id: string;
  name: string;
  price: number;
  rentValues: number[]; // [Base, Level1, Level2, Level3]
  buildPrice: number; // Cost to upgrade
  ownerId: string | null;
  level: PropertyLevel;
}

export interface Player {
  id: string;
  name: string;
  balance: number;
  role: Role;
  propertiesCount: number;
  joinedAt: number;
}

export type RequestType = 'BUY' | 'UPGRADE' | 'SALARY';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface GameRequest {
  id: string;
  type: RequestType;
  playerId: string;
  playerName: string;
  targetId?: string; // Property ID
  targetName?: string;
  amount: number;
  status: RequestStatus;
  timestamp: number;
}

export interface GameState {
  roomId: string;
  status: 'active' | 'ended';
  players: Record<string, Player>;
  properties: Record<string, Property>;
  requests: Record<string, GameRequest>;
  lastUpdated: number;
}

export interface GameContextType {
  gameState: GameState | null;
  currentPlayer: Player | null;
  login: (roomId: string, name: string, role: Role) => void;
  logout: () => void;
  sendRequest: (type: RequestType, amount: number, targetId?: string, targetName?: string) => void;
  approveRequest: (reqId: string) => void;
  rejectRequest: (reqId: string) => void;
  resetGame: () => void;
  updateBalance: (playerId: string, amount: number) => void;
}