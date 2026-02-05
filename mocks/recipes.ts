import { Recipe } from '@/types/recipe';

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const sampleRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Creamy Tuscan Pasta',
    description: 'A rich and creamy pasta with sun-dried tomatoes, spinach, and parmesan.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    difficulty: 'Easy',
    category: 'Pasta',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    sourceType: 'tiktok',
    importedAt: daysAgo(2),
    tags: ['Easy', 'Vegetarian'],
    ingredients: [
      { id: '1-1', name: 'Penne pasta', amount: '400', unit: 'g' },
      { id: '1-2', name: 'Heavy cream', amount: '250', unit: 'ml' },
      { id: '1-3', name: 'Sun-dried tomatoes', amount: '100', unit: 'g' },
      { id: '1-4', name: 'Fresh spinach', amount: '150', unit: 'g' },
      { id: '1-5', name: 'Parmesan cheese', amount: '80', unit: 'g' },
      { id: '1-6', name: 'Garlic cloves', amount: '3', unit: 'pcs' },
      { id: '1-7', name: 'Olive oil', amount: '2', unit: 'tbsp' },
    ],
    steps: [
      { id: '1-s1', order: 1, instruction: 'Bring a large pot of salted water to boil. Cook pasta according to package directions.', duration: 12 },
      { id: '1-s2', order: 2, instruction: 'While pasta cooks, mince garlic and slice sun-dried tomatoes into strips.', duration: 3 },
      { id: '1-s3', order: 3, instruction: 'Heat olive oil in a large pan over medium heat. Sauté garlic until fragrant, about 1 minute.', duration: 2 },
      { id: '1-s4', order: 4, instruction: 'Add sun-dried tomatoes and cook for 2 minutes. Pour in heavy cream and bring to a gentle simmer.', duration: 4 },
      { id: '1-s5', order: 5, instruction: 'Add spinach and stir until wilted. Season with salt and pepper.', duration: 2 },
      { id: '1-s6', order: 6, instruction: 'Drain pasta and add to the sauce. Toss well, then add parmesan and mix until creamy.', duration: 2 },
    ],
  },
  {
    id: '2',
    title: 'Thai Green Curry',
    description: 'Aromatic coconut curry with tender chicken and fresh vegetables.',
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'Medium',
    category: 'Asian',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    sourceType: 'youtube',
    importedAt: daysAgo(7),
    tags: ['Medium', 'High Protein', 'Dairy-free'],
    ingredients: [
      { id: '2-1', name: 'Chicken breast', amount: '500', unit: 'g' },
      { id: '2-2', name: 'Coconut milk', amount: '400', unit: 'ml' },
      { id: '2-3', name: 'Green curry paste', amount: '3', unit: 'tbsp' },
      { id: '2-4', name: 'Bell peppers', amount: '2', unit: 'pcs' },
      { id: '2-5', name: 'Bamboo shoots', amount: '200', unit: 'g' },
      { id: '2-6', name: 'Thai basil', amount: '1', unit: 'bunch' },
      { id: '2-7', name: 'Fish sauce', amount: '2', unit: 'tbsp' },
      { id: '2-8', name: 'Jasmine rice', amount: '300', unit: 'g' },
    ],
    steps: [
      { id: '2-s1', order: 1, instruction: 'Cook jasmine rice according to package directions.', duration: 20 },
      { id: '2-s2', order: 2, instruction: 'Cut chicken into bite-sized pieces. Slice bell peppers.', duration: 5 },
      { id: '2-s3', order: 3, instruction: 'Heat a wok over high heat. Add a splash of coconut milk and the curry paste. Fry until fragrant.', duration: 2 },
      { id: '2-s4', order: 4, instruction: 'Add chicken pieces and stir-fry until sealed on all sides.', duration: 5 },
      { id: '2-s5', order: 5, instruction: 'Pour in remaining coconut milk. Add bell peppers and bamboo shoots. Simmer for 15 minutes.', duration: 15 },
      { id: '2-s6', order: 6, instruction: 'Season with fish sauce. Garnish with Thai basil and serve over rice.', duration: 3 },
    ],
  },
  {
    id: '3',
    title: 'Classic Avocado Toast',
    description: 'Simple yet satisfying breakfast with creamy avocado and poached eggs.',
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800',
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    difficulty: 'Easy',
    category: 'Breakfast',
    isFavorite: true,
    createdAt: new Date().toISOString(),
    sourceType: 'instagram',
    importedAt: daysAgo(1),
    tags: ['Easy', 'Quick', 'Vegetarian', 'High Protein'],
    ingredients: [
      { id: '3-1', name: 'Sourdough bread', amount: '2', unit: 'slices' },
      { id: '3-2', name: 'Ripe avocados', amount: '2', unit: 'pcs' },
      { id: '3-3', name: 'Eggs', amount: '2', unit: 'pcs' },
      { id: '3-4', name: 'Cherry tomatoes', amount: '100', unit: 'g' },
      { id: '3-5', name: 'Red pepper flakes', amount: '1', unit: 'tsp' },
      { id: '3-6', name: 'Lemon juice', amount: '1', unit: 'tbsp' },
    ],
    steps: [
      { id: '3-s1', order: 1, instruction: 'Toast the sourdough slices until golden and crispy.', duration: 3 },
      { id: '3-s2', order: 2, instruction: 'Halve and pit the avocados. Scoop flesh into a bowl and mash with lemon juice, salt, and pepper.', duration: 2 },
      { id: '3-s3', order: 3, instruction: 'Bring a pot of water to a gentle simmer. Create a whirlpool and carefully drop in eggs. Poach for 3 minutes.', duration: 4 },
      { id: '3-s4', order: 4, instruction: 'Spread mashed avocado generously on toast. Top with poached egg and halved cherry tomatoes.', duration: 1 },
      { id: '3-s5', order: 5, instruction: 'Sprinkle with red pepper flakes and serve immediately.', duration: 0 },
    ],
  },
];

export const categories = [
  'All',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Pasta',
  'Asian',
  'Salads',
  'Desserts',
  'Snacks',
];

export const sourceFilters = [
  { key: 'all', label: 'All' },
  { key: 'recent', label: 'Imported This Week' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'photo', label: 'Photos' },
  { key: 'manual', label: 'Manual' },
] as const;

export const tagFilters = [
  'Favorites',
  'High Protein',
  'Vegetarian',
  'Vegan',
  'Quick',
  'Easy',
  'Medium',
  'Hard',
] as const;
