import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, Game, Order, CartItem, StoreSettings } from '../types';
import { seedGames } from '../data/games';

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (name: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;

  // Games
  games: Game[];
  addGame: (game: Omit<Game, 'id' | 'createdAt'>) => void;
  updateGame: (id: string, game: Partial<Game>) => void;
  deleteGame: (id: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: string) => void;
  updateCartQuantity: (gameId: string, quantity: number) => void;
  clearCart: () => void;

  // Orders
  orders: Order[];
  createOrder: (paymentMethod: 'PAYPAL' | 'BINANCE', transactionId?: string) => string;
  updateOrderStatus: (orderId: string, status: 'PENDING' | 'COMPLETED' | 'FAILED') => void;

  // Store Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;

  // Toast
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

// Initialize admin user
const adminUser: User = {
  id: 'admin-001',
  email: 'admin@playzone.com',
  password: 'AdminMaster2026!',
  name: 'Admin Master',
  role: 'ADMIN',
  createdAt: '2024-01-01T00:00:00Z',
};

// Initialize store settings
const defaultStoreSettings: StoreSettings = {
  id: 'settings-001',
  binanceWallet: 'TXqH7kR3vP8mN5wL2jF9cB4dA6eY1hG3kM',
  binanceQRUrl: '',
  paypalEmail: 'payments@playzone.com',
  updatedAt: new Date().toISOString(),
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth State
      currentUser: null,
      users: [adminUser],
      
      login: (email: string, password: string) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (user) {
          set({ currentUser: user });
          return { success: true, message: 'Inicio de sesión exitoso' };
        }
        return { success: false, message: 'Email o contraseña incorrectos' };
      },

      register: (name: string, email: string, password: string) => {
        const exists = get().users.find(u => u.email === email);
        if (exists) {
          return { success: false, message: 'Este email ya está registrado' };
        }
        const newUser: User = {
          id: uuidv4(),
          email,
          password,
          name,
          role: 'USER',
          createdAt: new Date().toISOString(),
        };
        set(state => ({ users: [...state.users, newUser], currentUser: newUser }));
        return { success: true, message: 'Registro exitoso' };
      },

      logout: () => set({ currentUser: null }),

      // Games State
      games: seedGames,

      addGame: (game) => {
        const newGame: Game = {
          ...game,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ games: [...state.games, newGame] }));
        get().addToast('Juego agregado exitosamente', 'success');
      },

      updateGame: (id, updates) => {
        set(state => ({
          games: state.games.map(g => g.id === id ? { ...g, ...updates } : g),
        }));
        get().addToast('Juego actualizado exitosamente', 'success');
      },

      deleteGame: (id) => {
        set(state => ({ games: state.games.filter(g => g.id !== id) }));
        get().addToast('Juego eliminado', 'info');
      },

      // Cart State
      cart: [],

      addToCart: (game) => {
        const existing = get().cart.find(item => item.game.id === game.id);
        if (existing) {
          set(state => ({
            cart: state.cart.map(item =>
              item.game.id === game.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }));
        } else {
          set(state => ({
            cart: [...state.cart, { game, quantity: 1 }],
          }));
        }
        get().addToast(`${game.title} agregado al carrito`, 'success');
      },

      removeFromCart: (gameId) => {
        set(state => ({
          cart: state.cart.filter(item => item.game.id !== gameId),
        }));
      },

      updateCartQuantity: (gameId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(gameId);
          return;
        }
        set(state => ({
          cart: state.cart.map(item =>
            item.game.id === gameId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      // Orders State
      orders: [],

      createOrder: (paymentMethod, transactionId) => {
        const { cart, currentUser } = get();
        if (!currentUser || cart.length === 0) return '';

        const total = cart.reduce((sum, item) => {
          const discountedPrice = item.game.discount > 0
            ? item.game.price * (1 - item.game.discount / 100)
            : item.game.price;
          return sum + discountedPrice * item.quantity;
        }, 0);

        const order: Order = {
          id: uuidv4(),
          userId: currentUser.id,
          userEmail: currentUser.email,
          userName: currentUser.name,
          total: Math.round(total * 100) / 100,
          paymentMethod,
          paymentStatus: paymentMethod === 'PAYPAL' ? 'COMPLETED' : 'PENDING',
          transactionId: transactionId || undefined,
          createdAt: new Date().toISOString(),
          items: cart.map(item => ({
            id: uuidv4(),
            gameId: item.game.id,
            game: item.game,
            quantity: item.quantity,
            price: item.game.discount > 0
              ? item.game.price * (1 - item.game.discount / 100)
              : item.game.price,
          })),
        };

        // Decrease stock
        set(state => ({
          orders: [...state.orders, order],
          games: state.games.map(g => {
            const cartItem = cart.find(c => c.game.id === g.id);
            if (cartItem) {
              return { ...g, stock: Math.max(0, g.stock - cartItem.quantity) };
            }
            return g;
          }),
          cart: [],
        }));

        get().addToast('Orden creada exitosamente', 'success');
        return order.id;
      },

      updateOrderStatus: (orderId, status) => {
        set(state => ({
          orders: state.orders.map(o =>
            o.id === orderId ? { ...o, paymentStatus: status } : o
          ),
        }));
        get().addToast(`Estado de orden actualizado a ${status}`, 'success');
      },

      // Store Settings
      storeSettings: defaultStoreSettings,

      updateStoreSettings: (settings) => {
        set(state => ({
          storeSettings: {
            ...state.storeSettings,
            ...settings,
            updatedAt: new Date().toISOString(),
          },
        }));
        get().addToast('Configuración actualizada', 'success');
      },

      // Toast State
      toasts: [],

      addToast: (message, type) => {
        const id = uuidv4();
        set(state => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
        setTimeout(() => get().removeToast(id), 3000);
      },

      removeToast: (id) => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id),
        }));
      },
    }),
    {
      name: 'playzone-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        games: state.games,
        cart: state.cart,
        orders: state.orders,
        storeSettings: state.storeSettings,
      }),
    }
  )
);
