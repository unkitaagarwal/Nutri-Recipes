import { Image } from 'expo-image';
import {
  User,
  Heart,
  Clock,
  ChefHat,
  Settings,
  Bell,
  HelpCircle,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';

interface MenuItem {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { recipes, plannedMeals } = useRecipes();

  const stats = useMemo(() => {
    const favorites = recipes.filter((r) => r.isFavorite).length;
    const totalCookTime = recipes.reduce(
      (acc, r) => acc + r.prepTime + r.cookTime,
      0
    );
    const avgCookTime = recipes.length > 0 ? Math.round(totalCookTime / recipes.length) : 0;

    return {
      totalRecipes: recipes.length,
      favorites,
      avgCookTime,
      plannedMeals: plannedMeals.length,
    };
  }, [recipes, plannedMeals]);

  const menuItems: MenuItem[] = [
    {
      icon: <Heart size={22} color={colors.primary} />,
      title: 'Favorite Recipes',
      subtitle: `${stats.favorites} recipes`,
      onPress: () => {},
    },
    {
      icon: <Bell size={22} color={colors.warning} />,
      title: 'Notifications',
      subtitle: 'Meal reminders',
      onPress: () => {},
    },
    {
      icon: <Settings size={22} color={colors.textLight} />,
      title: 'Settings',
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={22} color={colors.secondary} />,
      title: 'Help & Support',
      onPress: () => {},
    },
    {
      icon: <Star size={22} color={colors.warning} />,
      title: 'Rate the App',
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={colors.white} />
            </View>
          </View>
          <Text style={styles.greeting}>Hello, Chef!</Text>
          <Text style={styles.subtitle}>Ready to cook something amazing?</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(224, 122, 95, 0.1)' }]}>
              <ChefHat size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.totalRecipes}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(129, 178, 154, 0.1)' }]}>
              <Heart size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{stats.favorites}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(242, 204, 143, 0.1)' }]}>
              <Clock size={20} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.avgCookTime}m</Text>
            <Text style={styles.statLabel}>Avg. Time</Text>
          </View>
        </View>

        <View style={styles.premiumCard}>
          <View style={styles.premiumBadge}>
            <Star size={16} color={colors.warning} fill={colors.warning} />
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
          <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
          <Text style={styles.premiumDescription}>
            Unlock unlimited recipes, advanced meal planning, and nutrition
            tracking.
          </Text>
          <Pressable style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Learn More</Text>
          </Pressable>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>{item.icon}</View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.version}>Recipe Vault v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  premiumCard: {
    backgroundColor: colors.text,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(242, 204, 143, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    marginBottom: 20,
  },
  premiumButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemPressed: {
    backgroundColor: colors.backgroundAlt,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
  },
});
