export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  inPantry?: boolean;
}

export interface Step {
  id: string;
  order: number;
  instruction: string;
  duration?: number;
}

export type RecipeSource = 'youtube' | 'tiktok' | 'instagram' | 'photo' | 'manual' | 'link';

export type RecipeTag = 
  | 'Easy' 
  | 'Medium' 
  | 'Hard' 
  | 'High Protein' 
  | 'Vegetarian' 
  | 'Vegan' 
  | 'Quick' 
  | 'Pantry-friendly'
  | 'Gluten-free'
  | 'Dairy-free';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  ingredients: Ingredient[];
  steps: Step[];
  isFavorite: boolean;
  createdAt: string;
  source?: string;
  sourceType: RecipeSource;
  importedAt: string;
  tags: RecipeTag[];
}

export interface PlannedMeal {
  id: string;
  recipeId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface ShoppingItem {
  id: string;
  ingredientId: string;
  name: string;
  amount: string;
  unit: string;
  recipeIds: string[];
  isPurchased: boolean;
  inPantry: boolean;
}
