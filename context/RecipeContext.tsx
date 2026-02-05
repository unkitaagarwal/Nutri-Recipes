import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Recipe, PlannedMeal, ShoppingItem } from '@/types/recipe';
import { sampleRecipes } from '@/mocks/recipes';

const RECIPES_KEY = 'recipes';
const MEALS_KEY = 'planned_meals';
const ONBOARDING_KEY = 'onboarding_complete';

export const [RecipeProvider, useRecipes] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  const recipesQuery = useQuery({
    queryKey: [RECIPES_KEY],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(RECIPES_KEY);
      if (stored) {
        return JSON.parse(stored) as Recipe[];
      }
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(sampleRecipes));
      return sampleRecipes;
    },
  });

  const mealsQuery = useQuery({
    queryKey: [MEALS_KEY],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(MEALS_KEY);
      return stored ? (JSON.parse(stored) as PlannedMeal[]) : [];
    },
  });

  const onboardingQuery = useQuery({
    queryKey: [ONBOARDING_KEY],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      return stored === 'true';
    },
  });

  useEffect(() => {
    if (recipesQuery.data) {
      setRecipes(recipesQuery.data);
    }
  }, [recipesQuery.data]);

  useEffect(() => {
    if (mealsQuery.data) {
      setPlannedMeals(mealsQuery.data);
    }
  }, [mealsQuery.data]);

  useEffect(() => {
    if (onboardingQuery.data !== undefined) {
      setHasCompletedOnboarding(onboardingQuery.data);
    }
  }, [onboardingQuery.data]);

  const { mutate: syncRecipesMutate } = useMutation({
    mutationFn: async (newRecipes: Recipe[]) => {
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(newRecipes));
      return newRecipes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECIPES_KEY] });
    },
  });

  const { mutate: syncMealsMutate } = useMutation({
    mutationFn: async (newMeals: PlannedMeal[]) => {
      await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(newMeals));
      return newMeals;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEALS_KEY] });
    },
  });

  const { mutate: completeOnboardingMutate } = useMutation({
    mutationFn: async () => {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      return true;
    },
    onSuccess: () => {
      setHasCompletedOnboarding(true);
      queryClient.invalidateQueries({ queryKey: [ONBOARDING_KEY] });
    },
  });

  const addRecipe = useCallback((recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...recipes, newRecipe];
    setRecipes(updated);
    syncRecipesMutate(updated);
    return newRecipe;
  }, [recipes, syncRecipesMutate]);

  const updateRecipe = useCallback((id: string, updates: Partial<Recipe>) => {
    const updated = recipes.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setRecipes(updated);
    syncRecipesMutate(updated);
  }, [recipes, syncRecipesMutate]);

  const deleteRecipe = useCallback((id: string) => {
    const updated = recipes.filter((r) => r.id !== id);
    setRecipes(updated);
    syncRecipesMutate(updated);
    const updatedMeals = plannedMeals.filter((m) => m.recipeId !== id);
    setPlannedMeals(updatedMeals);
    syncMealsMutate(updatedMeals);
  }, [recipes, plannedMeals, syncRecipesMutate, syncMealsMutate]);

  const toggleFavorite = useCallback((id: string) => {
    const updated = recipes.map((r) =>
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    );
    setRecipes(updated);
    syncRecipesMutate(updated);
  }, [recipes, syncRecipesMutate]);

  const planMeal = useCallback((recipeId: string, date: string, mealType: PlannedMeal['mealType']) => {
    const newMeal: PlannedMeal = {
      id: Date.now().toString(),
      recipeId,
      date,
      mealType,
    };
    const updated = [...plannedMeals, newMeal];
    setPlannedMeals(updated);
    syncMealsMutate(updated);
  }, [plannedMeals, syncMealsMutate]);

  const removePlannedMeal = useCallback((id: string) => {
    const updated = plannedMeals.filter((m) => m.id !== id);
    setPlannedMeals(updated);
    syncMealsMutate(updated);
  }, [plannedMeals, syncMealsMutate]);

  const getRecipeById = useCallback((id: string) => {
    return recipes.find((r) => r.id === id);
  }, [recipes]);

  const getMealsForDate = useCallback((date: string) => {
    return plannedMeals.filter((m) => m.date === date);
  }, [plannedMeals]);

  const generateShoppingList = useCallback((mealIds: string[]): ShoppingItem[] => {
    const mealsToShop = plannedMeals.filter((m) => mealIds.includes(m.id));
    const ingredientMap = new Map<string, ShoppingItem>();

    mealsToShop.forEach((meal) => {
      const recipe = recipes.find((r) => r.id === meal.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach((ing) => {
        const key = ing.name.toLowerCase();
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.recipeIds.push(recipe.id);
        } else {
          ingredientMap.set(key, {
            id: ing.id,
            ingredientId: ing.id,
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            recipeIds: [recipe.id],
            isPurchased: false,
            inPantry: ing.inPantry || false,
          });
        }
      });
    });

    return Array.from(ingredientMap.values());
  }, [plannedMeals, recipes]);

  const upcomingMeals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return plannedMeals
      .filter((m) => m.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [plannedMeals]);

  return {
    recipes,
    plannedMeals,
    upcomingMeals,
    isLoading: recipesQuery.isLoading || mealsQuery.isLoading,
    hasCompletedOnboarding,
    completeOnboarding: () => completeOnboardingMutate(),
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    planMeal,
    removePlannedMeal,
    getRecipeById,
    getMealsForDate,
    generateShoppingList,
  };
});
