import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  ChefHat,
  Play,
  Calendar,
  Trash2,
} from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';

export default function RecipeDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipeById, toggleFavorite, deleteRecipe } = useRecipes();

  const recipe = getRecipeById(id || '');

  if (!recipe) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  const handleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(recipe.id);
  };

  const handleStartCooking = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(`/cooking/${recipe.id}`);
  };

  const handlePlanMeal = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push({
      pathname: '/plan-meal',
      params: { date: today },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRecipe(recipe.id);
            router.back();
          },
        },
      ]
    );
  };

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.heroGradient}
          />
          <View style={[styles.heroHeader, { paddingTop: insets.top + 8 }]}>
            <Pressable
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={colors.white} />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerButton} onPress={handleFavorite}>
                <Heart
                  size={24}
                  color={colors.white}
                  fill={recipe.isFavorite ? colors.primary : 'transparent'}
                />
              </Pressable>
              <Pressable style={styles.headerButton} onPress={handleDelete}>
                <Trash2 size={24} color={colors.white} />
              </Pressable>
            </View>
          </View>
          <View style={styles.heroContent}>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
            </View>
            <Text style={styles.category}>{recipe.category}</Text>
            <Text style={styles.title}>{recipe.title}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(224, 122, 95, 0.1)' }]}>
                <Clock size={18} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{totalTime}</Text>
              <Text style={styles.statLabel}>minutes</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(129, 178, 154, 0.1)' }]}>
                <Users size={18} color={colors.secondary} />
              </View>
              <Text style={styles.statValue}>{recipe.servings}</Text>
              <Text style={styles.statLabel}>servings</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(242, 204, 143, 0.1)' }]}>
                <ChefHat size={18} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{recipe.ingredients.length}</Text>
              <Text style={styles.statLabel}>ingredients</Text>
            </View>
          </View>

          <Text style={styles.description}>{recipe.description}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={ingredient.id} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>
                    <Text style={styles.ingredientAmount}>
                      {ingredient.amount} {ingredient.unit}
                    </Text>{' '}
                    {ingredient.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.steps.map((step, index) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.order}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>{step.instruction}</Text>
                  {step.duration && (
                    <View style={styles.stepDuration}>
                      <Clock size={12} color={colors.textMuted} />
                      <Text style={styles.stepDurationText}>
                        {step.duration} min
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.planButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handlePlanMeal}
        >
          <Calendar size={20} color={colors.primary} />
          <Text style={styles.planButtonText}>Plan</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.cookButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleStartCooking}
        >
          <Play size={20} color={colors.white} fill={colors.white} />
          <Text style={styles.cookButtonText}>Start Cooking</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 100,
  },
  heroSection: {
    height: 360,
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  difficultyBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  difficultyText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  description: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 26,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  ingredientsList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  ingredientAmount: {
    fontWeight: '600',
    color: colors.primary,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  stepDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  stepDurationText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  cookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  cookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
