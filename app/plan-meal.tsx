import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Clock, Check } from 'lucide-react-native';
import React, { useState } from 'react';
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
import { PlannedMeal } from '@/types/recipe';

const mealTypes: { type: PlannedMeal['mealType']; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { type: 'lunch', label: 'Lunch', emoji: '☀️' },
  { type: 'dinner', label: 'Dinner', emoji: '🌙' },
  { type: 'snack', label: 'Snack', emoji: '🍎' },
];

export default function PlanMealScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { recipes, planMeal } = useRecipes();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<PlannedMeal['mealType']>('dinner');

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSave = () => {
    if (!selectedRecipeId || !date) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    planMeal(selectedRecipeId, date, selectedMealType);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Plan a Meal</Text>
        <Pressable
          style={[
            styles.saveButton,
            !selectedRecipeId && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!selectedRecipeId}
        >
          <Text
            style={[
              styles.saveButtonText,
              !selectedRecipeId && styles.saveButtonTextDisabled,
            ]}
          >
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>Planning for</Text>
          <Text style={styles.dateValue}>{date ? formatDate(date) : ''}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypeGrid}>
            {mealTypes.map((meal) => (
              <Pressable
                key={meal.type}
                style={[
                  styles.mealTypeCard,
                  selectedMealType === meal.type && styles.mealTypeCardActive,
                ]}
                onPress={() => setSelectedMealType(meal.type)}
              >
                <Text style={styles.mealTypeEmoji}>{meal.emoji}</Text>
                <Text
                  style={[
                    styles.mealTypeLabel,
                    selectedMealType === meal.type && styles.mealTypeLabelActive,
                  ]}
                >
                  {meal.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a Recipe</Text>
          {recipes.map((recipe) => (
            <Pressable
              key={recipe.id}
              style={[
                styles.recipeCard,
                selectedRecipeId === recipe.id && styles.recipeCardActive,
              ]}
              onPress={() => setSelectedRecipeId(recipe.id)}
            >
              <Image
                source={{ uri: recipe.imageUrl }}
                style={styles.recipeImage}
                contentFit="cover"
              />
              <View style={styles.recipeContent}>
                <Text style={styles.recipeCategory}>{recipe.category}</Text>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <View style={styles.recipeMeta}>
                  <Clock size={12} color={colors.textMuted} />
                  <Text style={styles.recipeMetaText}>
                    {recipe.prepTime + recipe.cookTime} min
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedRecipeId === recipe.id && styles.radioButtonActive,
                ]}
              >
                {selectedRecipeId === recipe.id && (
                  <Check size={16} color={colors.white} />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: colors.textMuted,
  },
  scrollContent: {
    padding: 20,
  },
  dateCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(224, 122, 95, 0.08)',
  },
  mealTypeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  mealTypeLabelActive: {
    color: colors.primary,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recipeCardActive: {
    borderColor: colors.primary,
  },
  recipeImage: {
    width: 80,
    height: 80,
  },
  recipeContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recipeCategory: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    margin: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  radioButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
