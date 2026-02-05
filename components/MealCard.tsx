import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Clock, Trash2 } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';
import { PlannedMeal } from '@/types/recipe';

interface MealCardProps {
  meal: PlannedMeal;
  showDate?: boolean;
  isUpNext?: boolean;
}

const mealTypeLabels: Record<PlannedMeal['mealType'], { emoji: string; label: string }> = {
  breakfast: { emoji: '🌅', label: 'Breakfast' },
  lunch: { emoji: '☀️', label: 'Lunch' },
  dinner: { emoji: '🌙', label: 'Dinner' },
  snack: { emoji: '🍎', label: 'Snack' },
};

export default function MealCard({ meal, showDate = false, isUpNext = false }: MealCardProps) {
  const router = useRouter();
  const { getRecipeById, removePlannedMeal } = useRecipes();
  const recipe = getRecipeById(meal.recipeId);

  if (!recipe) return null;

  const handlePress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const mealInfo = mealTypeLabels[meal.mealType];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        {isUpNext && (
          <View style={styles.upNextBadge}>
            <Text style={styles.upNextText}>Up next</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        {showDate && (
          <Text style={styles.date}>{formatDate(meal.date)}</Text>
        )}
        <View style={styles.mealTypeRow}>
          <Text style={styles.mealEmoji}>{mealInfo.emoji}</Text>
          <Text style={styles.mealType}>{mealInfo.label}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>
        <View style={styles.meta}>
          <Clock size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>
            {recipe.prepTime + recipe.cookTime} min
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.deleteButton}
        onPress={() => removePlannedMeal(meal.id)}
        hitSlop={8}
      >
        <Trash2 size={18} color={colors.textMuted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.95,
    backgroundColor: '#FAFAFA',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 90,
    height: 90,
  },
  upNextBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upNextText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  mealTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  mealEmoji: {
    fontSize: 12,
  },
  mealType: {
    fontSize: 12,
    color: colors.textMuted,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  deleteButton: {
    padding: 14,
    justifyContent: 'center',
  },
});
