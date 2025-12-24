import { Property } from './types';

export const INITIAL_BALANCE = 200;
export const SALARY_AMOUNT = 200;

export const THEME = {
  bg: '#fdf6e3', // Paper
  primary: '#5d4037', // Brown
  accent: '#b71c1c', // Red
  success: '#2e7d32', // Green
  warning: '#f57f17', // Orange
};

// Data mapping based on provided table
// rentValues: [Base, Lv1 (Dinh điền), Lv2 (Phủ đệ), Lv3 (Phủ thành)]
export const INITIAL_PROPERTIES: Property[] = [
  // Khởi Thủy
  { id: 'p1', name: 'Phong Châu', price: 40, rentValues: [2, 10, 50, 200], buildPrice: 40, ownerId: null, level: 0 },
  { id: 'p2', name: 'Cổ Loa', price: 40, rentValues: [2, 10, 50, 200], buildPrice: 40, ownerId: null, level: 0 },
  { id: 'p3', name: 'Hoa Lư', price: 60, rentValues: [4, 25, 100, 400], buildPrice: 60, ownerId: null, level: 0 },
  { id: 'p4', name: 'Thăng Long', price: 80, rentValues: [6, 40, 150, 550], buildPrice: 50, ownerId: null, level: 0 },
  
  // Trung Đại
  { id: 'p5', name: 'Thiên Trường', price: 100, rentValues: [8, 50, 180, 600], buildPrice: 80, ownerId: null, level: 0 },
  { id: 'p6', name: 'Vân Đồn', price: 100, rentValues: [8, 50, 180, 600], buildPrice: 80, ownerId: null, level: 0 },
  { id: 'p7', name: 'Lam Kinh', price: 120, rentValues: [10, 60, 220, 750], buildPrice: 100, ownerId: null, level: 0 },
  { id: 'p8', name: 'Văn Miếu', price: 140, rentValues: [12, 80, 250, 900], buildPrice: 100, ownerId: null, level: 0 },
  
  // Cận Đại
  { id: 'p9', name: 'Phố Hiến', price: 160, rentValues: [14, 90, 300, 900], buildPrice: 120, ownerId: null, level: 0 },
  { id: 'p10', name: 'Hội An', price: 160, rentValues: [14, 90, 300, 900], buildPrice: 120, ownerId: null, level: 0 },
  { id: 'p11', name: 'Phú Xuân', price: 180, rentValues: [16, 100, 350, 1000], buildPrice: 140, ownerId: null, level: 0 },
  { id: 'p12', name: 'Kinh Thành Huế', price: 200, rentValues: [18, 120, 400, 1100], buildPrice: 150, ownerId: null, level: 0 },
  { id: 'p13', name: 'Chùa Thiên Mụ', price: 220, rentValues: [22, 140, 450, 1200], buildPrice: 150, ownerId: null, level: 0 },
  
  // Hiện Đại
  { id: 'p14', name: 'Ba Đình', price: 240, rentValues: [24, 150, 500, 1200], buildPrice: 180, ownerId: null, level: 0 },
  { id: 'p15', name: 'Điện Biên', price: 240, rentValues: [24, 150, 500, 1200], buildPrice: 180, ownerId: null, level: 0 },
  { id: 'p16', name: 'Dinh Độc Lập', price: 260, rentValues: [28, 180, 600, 1400], buildPrice: 200, ownerId: null, level: 0 },
  { id: 'p17', name: 'Trường Sa', price: 300, rentValues: [35, 200, 700, 1500], buildPrice: 250, ownerId: null, level: 0 },
  { id: 'p18', name: 'Hoàng Sa', price: 300, rentValues: [35, 200, 700, 1500], buildPrice: 250, ownerId: null, level: 0 }, // Added Hoàng Sa to pair with Trường Sa logically
  { id: 'p19', name: 'Hà Nội (Mới)', price: 350, rentValues: [50, 250, 800, 2000], buildPrice: 250, ownerId: null, level: 0 },
];