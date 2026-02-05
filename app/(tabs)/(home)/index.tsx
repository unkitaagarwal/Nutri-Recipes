import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Plus, Calendar, ShoppingCart, ChefHat, ChevronRight } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MealCard from '@/components/MealCard';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipes, upcomingMeals, plannedMeals, isLoading } = useRecipes();

  const handleAddRecipe = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/add-recipe');
  };

  const todayMeals = upcomingMeals.filter((meal) => {
    const today = new Date();
    const mealDate = new Date(meal.date);
    return (
      mealDate.getDate() === today.getDate() &&
      mealDate.getMonth() === today.getMonth() &&
      mealDate.getFullYear() === today.getFullYear()
    );
  });

  const thisWeekMeals = upcomingMeals.filter((meal) => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const mealDate = new Date(meal.date);
    return mealDate >= today && mealDate <= nextWeek;
  });

  const futureMeals = upcomingMeals.filter((meal) => {
    const today = new Date();
    const mealDate = new Date(meal.date);
    return (
      mealDate.getDate() !== today.getDate() ||
      mealDate.getMonth() !== today.getMonth() ||
      mealDate.getFullYear() !== today.getFullYear()
    );
  });

  const shoppingItemsCount = plannedMeals.length > 0 ? Math.min(plannedMeals.length * 3, 12) : 0;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FEF3ED', '#FEF9F3']}
        style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good to see you!</Text>
            <Text style={styles.title}>Your plan for today</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={handleAddRecipe}
          >
            <Plus size={24} color={colors.white} />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addRecipeBar,
            pressed && styles.addRecipeBarPressed,
          ]}
          onPress={handleAddRecipe}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addRecipeGradient}
          >
            <View style={styles.addRecipeContent}>
              <View style={styles.addRecipeLeft}>
                <View style={styles.addRecipeIconCircle}>
                  <Plus size={16} color={colors.primary} />
                </View>
                <Text style={styles.addRecipeText}>Add Recipe</Text>
              </View>
              <ChevronRight size={20} color={colors.white} />
            </View>
          </LinearGradient>
        </Pressable>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsRow}>
          <Pressable 
            style={styles.statCard}
            onPress={() => router.push('/recipes')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#FEF3ED' }]}>
              <ChefHat size={20} color={colors.primary} />
            </View>
            <Text style={styles.statNumber}>{recipes.length}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </Pressable>
          <Pressable 
            style={styles.statCard}
            onPress={() => router.push('/calendar')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#E8F5EE' }]}>
              <Calendar size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statNumber}>{thisWeekMeals.length} planned</Text>
            <Text style={styles.statLabel}>{thisWeekMeals.length} planned{'\n'}this week</Text>
          </Pressable>
          <Pressable 
            style={styles.statCard}
            onPress={() => router.push('/shopping')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#FFF8E7' }]}>
              <ShoppingCart size={20} color={colors.warning} />
              {shoppingItemsCount > 0 && (
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>{shoppingItemsCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.statNumber}>Shopping</Text>
            <Text style={styles.statLabel}>List</Text>
            {shoppingItemsCount > 0 && (
              <Text style={styles.statSubLabel}>{shoppingItemsCount} items left to buy</Text>
            )}
          </Pressable>
        </View>

        {todayMeals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
            {todayMeals.map((meal, index) => (
              <MealCard 
                key={meal.id} 
                meal={meal} 
                isUpNext={index === 0}
              />
            ))}
            {todayMeals.length < 3 && (
              <Pressable 
                style={styles.planMoreButton}
                onPress={() => router.push('/calendar')}
              >
                <Calendar size={16} color={colors.secondary} />
                <Text style={styles.planMoreText}>Plan dinner →</Text>
              </Pressable>
            )}
          </View>
        )}

        {futureMeals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Meals</Text>
              <Pressable 
                style={styles.seeAllButton}
                onPress={() => router.push('/calendar')}
              >
                <Text style={styles.seeAllText}>See what&apos;s for the week →</Text>
              </Pressable>
            </View>
            {futureMeals.slice(0, 3).map((meal) => (
              <MealCard key={meal.id} meal={meal} showDate />
            ))}
          </View>
        )}

        {upcomingMeals.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No meals planned</Text>
            <Text style={styles.emptyText}>
              Plan your week by adding recipes to your calendar
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push('/calendar')}
            >
              <Calendar size={18} color={colors.white} />
              <Text style={styles.emptyButtonText}>Plan Meals</Text>
            </Pressable>
          </View>
        )}

        {plannedMeals.length > 0 && (
          <View style={styles.shoppingBanner}>
            <View style={styles.shoppingBannerHeader}>
              <ShoppingCart size={18} color={colors.warning} />
              <Text style={styles.shoppingBannerTitle}>Shopping list ready for today</Text>
            </View>
            <View style={styles.shoppingBannerActions}>
              <Pressable 
                style={styles.viewShoppingButton}
                onPress={() => router.push('/shopping')}
              >
                <Text style={styles.viewShoppingText}>View Shopping List</Text>
              </Pressable>
              <Pressable 
                style={styles.addMealButton}
                onPress={() => router.push('/calendar')}
              >
                <Text style={styles.addMealText}>+ Add another meal</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  addRecipeBar: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addRecipeBarPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  addRecipeGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  addRecipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addRecipeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addRecipeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRecipeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 14,
  },
  statSubLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  planMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingVertical: 8,
    marginTop: 4,
  },
  planMoreText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
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
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  shoppingBanner: {
    backgroundColor: '#F0F7F4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4E9E0',
  },
  shoppingBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  shoppingBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  shoppingBannerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewShoppingButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewShoppingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  addMealButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addMealText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  bottomSpacer: {
    height: 20,
  },
});
