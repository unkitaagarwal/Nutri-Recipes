import * as Haptics from 'expo-haptics';
import { Check, ShoppingBag, Sparkles, X } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';
import { ShoppingItem } from '@/types/recipe';

type ViewMode = 'select' | 'pantry' | 'shopping';

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const { plannedMeals, generateShoppingList, getRecipeById } = useRecipes();
  const [viewMode, setViewMode] = useState<ViewMode>('select');
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  const upcomingMeals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return plannedMeals.filter((m) => m.date >= today);
  }, [plannedMeals]);

  const handleToggleMeal = (mealId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedMealIds((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleGenerateList = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const list = generateShoppingList(selectedMealIds);
    setShoppingList(list);
    setViewMode('pantry');
  };

  const handleTogglePantry = (itemId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, inPantry: !item.inPantry } : item
      )
    );
  };

  const handleConfirmPantry = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setViewMode('shopping');
  };

  const handleTogglePurchased = (itemId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isPurchased: !item.isPurchased } : item
      )
    );
  };

  const handleReset = () => {
    setViewMode('select');
    setSelectedMealIds([]);
    setShoppingList([]);
  };

  const itemsToBuy = shoppingList.filter((item) => !item.inPantry);
  const purchasedCount = itemsToBuy.filter((item) => item.isPurchased).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (viewMode === 'select') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping List</Text>
          <Text style={styles.subtitle}>Select meals to shop for</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {upcomingMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <ShoppingBag size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No meals planned</Text>
              <Text style={styles.emptyText}>
                Plan some meals first, then come back to generate your shopping
                list!
              </Text>
            </View>
          ) : (
            <>
              {upcomingMeals.map((meal) => {
                const recipe = getRecipeById(meal.recipeId);
                if (!recipe) return null;
                const isSelected = selectedMealIds.includes(meal.id);

                return (
                  <Pressable
                    key={meal.id}
                    style={[
                      styles.mealSelectCard,
                      isSelected && styles.mealSelectCardActive,
                    ]}
                    onPress={() => handleToggleMeal(meal.id)}
                  >
                    <View style={styles.mealSelectContent}>
                      <Text style={styles.mealSelectDate}>
                        {formatDate(meal.date)}
                      </Text>
                      <Text style={styles.mealSelectTitle}>{recipe.title}</Text>
                      <Text style={styles.mealSelectIngredients}>
                        {recipe.ingredients.length} ingredients
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxActive,
                      ]}
                    >
                      {isSelected && <Check size={16} color={colors.white} />}
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}
        </ScrollView>

        {selectedMealIds.length > 0 && (
          <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.generateButton,
                pressed && styles.generateButtonPressed,
              ]}
              onPress={handleGenerateList}
            >
              <Sparkles size={20} color={colors.white} />
              <Text style={styles.generateButtonText}>
                Generate Shopping List ({selectedMealIds.length} meals)
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  if (viewMode === 'pantry') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Check Pantry</Text>
            <Pressable onPress={handleReset} style={styles.closeButton}>
              <X size={24} color={colors.textLight} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            Mark items you already have at home
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {shoppingList.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.pantryItem,
                item.inPantry && styles.pantryItemChecked,
              ]}
              onPress={() => handleTogglePantry(item.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  item.inPantry && styles.checkboxActive,
                ]}
              >
                {item.inPantry && <Check size={16} color={colors.white} />}
              </View>
              <View style={styles.pantryItemContent}>
                <Text
                  style={[
                    styles.pantryItemName,
                    item.inPantry && styles.pantryItemNameChecked,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.pantryItemAmount}>
                  {item.amount} {item.unit}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.generateButton,
              pressed && styles.generateButtonPressed,
            ]}
            onPress={handleConfirmPantry}
          >
            <ShoppingBag size={20} color={colors.white} />
            <Text style={styles.generateButtonText}>
              View Shopping List ({itemsToBuy.length} items)
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Shopping List</Text>
          <Pressable onPress={handleReset} style={styles.closeButton}>
            <X size={24} color={colors.textLight} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          {purchasedCount} of {itemsToBuy.length} items purchased
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${itemsToBuy.length > 0 ? (purchasedCount / itemsToBuy.length) * 100 : 0}%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {itemsToBuy.length === 0 ? (
          <View style={styles.emptyState}>
            <Check size={48} color={colors.secondary} />
            <Text style={styles.emptyTitle}>All stocked up!</Text>
            <Text style={styles.emptyText}>
              You have everything you need in your pantry.
            </Text>
          </View>
        ) : (
          itemsToBuy.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.shoppingItem,
                item.isPurchased && styles.shoppingItemPurchased,
              ]}
              onPress={() => handleTogglePurchased(item.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  item.isPurchased && styles.checkboxSuccess,
                ]}
              >
                {item.isPurchased && <Check size={16} color={colors.white} />}
              </View>
              <View style={styles.shoppingItemContent}>
                <Text
                  style={[
                    styles.shoppingItemName,
                    item.isPurchased && styles.shoppingItemNamePurchased,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.shoppingItemAmount}>
                  {item.amount} {item.unit}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {purchasedCount === itemsToBuy.length && itemsToBuy.length > 0 && (
        <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.generateButtonPressed,
            ]}
            onPress={handleReset}
          >
            <Check size={20} color={colors.white} />
            <Text style={styles.generateButtonText}>Done Shopping!</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textLight,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: colors.card,
    borderRadius: 20,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  mealSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealSelectCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(224, 122, 95, 0.08)',
  },
  mealSelectContent: {
    flex: 1,
  },
  mealSelectDate: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealSelectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  mealSelectIngredients: {
    fontSize: 13,
    color: colors.textMuted,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxSuccess: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  generateButtonPressed: {
    opacity: 0.9,
  },
  generateButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  pantryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  pantryItemChecked: {
    backgroundColor: 'rgba(129, 178, 154, 0.1)',
  },
  pantryItemContent: {
    flex: 1,
  },
  pantryItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  pantryItemNameChecked: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  pantryItemAmount: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  shoppingItemPurchased: {
    backgroundColor: 'rgba(129, 178, 154, 0.1)',
  },
  shoppingItemContent: {
    flex: 1,
  },
  shoppingItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  shoppingItemNamePurchased: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  shoppingItemAmount: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
