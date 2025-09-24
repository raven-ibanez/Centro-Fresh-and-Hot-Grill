import { MenuItem } from '../types';

export const menuData: MenuItem[] = [
  // Grilled Specialties
  {
    id: 'lechon-kawali',
    name: 'Lechon Kawali',
    description: 'Crispy deep-fried pork belly served with liver sauce and atchara',
    basePrice: 320,
    category: 'grilled',
    popular: true,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'inihaw-na-baboy',
    name: 'Inihaw na Baboy',
    description: 'Grilled pork marinated in soy sauce, calamansi, and garlic',
    basePrice: 280,
    category: 'grilled',
    popular: true,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'inihaw-na-manok',
    name: 'Inihaw na Manok',
    description: 'Grilled chicken marinated in soy sauce, calamansi, and spices',
    basePrice: 250,
    category: 'grilled',
    popular: true,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'bangus-grilled',
    name: 'Inihaw na Bangus',
    description: 'Grilled milkfish stuffed with tomatoes, onions, and ginger',
    basePrice: 290,
    category: 'grilled',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'pork-bbq',
    name: 'Pork BBQ',
    description: 'Skewered pork marinated in sweet soy sauce and grilled to perfection',
    basePrice: 180,
    category: 'grilled',
    variations: [
      { id: 'regular', name: 'Regular (3 sticks)', price: 0 },
      { id: 'large', name: 'Large (5 sticks)', price: 50 }
    ],
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'chicken-bbq',
    name: 'Chicken BBQ',
    description: 'Grilled chicken skewers with sweet and savory marinade',
    basePrice: 160,
    category: 'grilled',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },

  // Rice Meals
  {
    id: 'adobo-rice',
    name: 'Adobo Rice',
    description: 'Classic Filipino adobo with rice, choice of pork or chicken',
    basePrice: 220,
    category: 'rice-meals',
    popular: true,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'sinigang-rice',
    name: 'Sinigang Rice',
    description: 'Sour soup with rice, choice of pork, shrimp, or fish',
    basePrice: 240,
    category: 'rice-meals',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'kare-kare-rice',
    name: 'Kare-Kare Rice',
    description: 'Oxtail and vegetables in peanut sauce served with rice',
    basePrice: 280,
    category: 'rice-meals',
    popular: true,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'bistek-rice',
    name: 'Bistek Rice',
    description: 'Beef steak with onions in soy sauce and calamansi over rice',
    basePrice: 260,
    category: 'rice-meals',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'tinola-rice',
    name: 'Tinola Rice',
    description: 'Chicken soup with ginger, papaya, and chili leaves over rice',
    basePrice: 200,
    category: 'rice-meals',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'afritada-rice',
    name: 'Afritada Rice',
    description: 'Chicken or pork stewed with potatoes and bell peppers over rice',
    basePrice: 230,
    category: 'rice-meals',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },

  // Noodles & Pasta
  {
    id: 'pancit-canton',
    name: 'Pancit Canton',
    description: 'Stir-fried egg noodles with vegetables, meat, and shrimp',
    basePrice: 200,
    category: 'noodles',
    popular: true,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'pancit-bihon',
    name: 'Pancit Bihon',
    description: 'Stir-fried rice noodles with vegetables and meat',
    basePrice: 180,
    category: 'noodles',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'lomi',
    name: 'Lomi',
    description: 'Thick egg noodles in rich soup with meat and vegetables',
    basePrice: 220,
    category: 'noodles',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'batchoy',
    name: 'Batchoy',
    description: 'Noodle soup with pork organs, chicharon, and egg',
    basePrice: 190,
    category: 'noodles',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },

  // Beverages
  {
    id: 'calamansi-juice',
    name: 'Calamansi Juice',
    description: 'Fresh calamansi juice served chilled or with ice',
    basePrice: 60,
    category: 'beverages',
    popular: true,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'buko-juice',
    name: 'Buko Juice',
    description: 'Fresh coconut water with coconut meat',
    basePrice: 80,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'mango-juice',
    name: 'Mango Juice',
    description: 'Fresh mango juice made from ripe Philippine mangoes',
    basePrice: 90,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'sago-gulaman',
    name: 'Sago at Gulaman',
    description: 'Traditional Filipino drink with tapioca pearls and jelly',
    basePrice: 50,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    description: 'Refreshing iced tea perfect for any meal',
    basePrice: 40,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'coffee',
    name: 'Kapeng Barako',
    description: 'Strong Filipino coffee served hot or iced',
    basePrice: 70,
    category: 'beverages',
    variations: [
      { id: 'hot', name: 'Hot', price: 0 },
      { id: 'iced', name: 'Iced', price: 10 }
    ],
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
];

export const categories = [
  { id: 'grilled', name: 'Grilled Specialties', icon: '🔥' },
  { id: 'rice-meals', name: 'Rice Meals', icon: '🍚' },
  { id: 'noodles', name: 'Noodles & Pasta', icon: '🍜' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' }
];

export const addOnCategories = [
  { id: 'spice', name: 'Spice Level' },
  { id: 'protein', name: 'Extra Protein' },
  { id: 'sauce', name: 'Sauces' },
  { id: 'extras', name: 'Extras' }
];