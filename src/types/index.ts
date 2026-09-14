export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  platform: string;
  imageUrl: string;
  stock: number;
  isFeatured: boolean;
  isNewRelease: boolean;
  videoUrl?: string;
  videoType?: 'file' | 'youtube' | 'vimeo';
  createdAt: string;
}

export interface StoreSettings {
  id: string;
  binanceWallet: string;
  binanceQRUrl: string;
  paypalEmail: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  gameId: string;
  game: Game;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  total: number;
  paymentMethod: 'PAYPAL' | 'BINANCE';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CartItem {
  game: Game;
  quantity: number;
}

export type GameCategory = 'Acción' | 'RPG' | 'Deportes' | 'Aventura' | 'Terror' | 'Indie';
