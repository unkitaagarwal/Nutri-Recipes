import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Clock, Users, Heart, Play, Music, Camera, FileText, Link, ChevronRight, Flame, Leaf, Zap, Dumbbell } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';
import { Recipe, RecipeSource } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  variant?: 'default' | 'compact' | 'list';
  onLongPress?: () => void;
}

const sourceConfig: Record<RecipeSource, { icon: typeof Play; label: string; bgColor: string }> = {
  youtube: { icon: Play, label: 'YouTube', bgColor: 'rgba(255, 0, 0, 0.9)' },
  tiktok: { icon: Music, label: 'TikTok', bgColor: 'rgba(0, 0, 0, 0.85)' },
  instagram: { icon: Camera, label: 'Instagram', bgColor: 'rgba(228, 64, 95, 0.9)' },
  photo: { icon: Camera, label: 'Photo', bgColor: 'rgba(74, 144, 217, 0.9)' },
  manual: { icon: FileText, label: 'Manual', bgColor: 'rgba(107, 114, 128, 0.9)' },
  link: { icon: Link, label: 'Link', bgColor: 'rgba(59, 130, 246, 0.9)' },
};

const difficultyColors: Record<string, { bg: string; text: string }> = {
  Easy: { bg: '#10B981', text: '#FFFFFF' },
  Medium: { bg: '#F59E0B', text: '#FFFFFF' },
  Hard: { bg: '#EF4444', text: '#FFFFFF' },
};

const tagIcons: Record<string, typeof Flame> = {
  'High Protein': Dumbbell,
  'Vegetarian': Leaf,
  'Vegan': Leaf,
  'Quick': Zap,
  'Dinner': Flame,
  'Breakfast': Flame,
  'Lunch': Flame,
};

function formatImportDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

export default function RecipeCard({ recipe, variant = 'default', onLongPress }: RecipeCardProps) {
  const router = useRouter();
  const { toggleFavorite } = useRecipes();

  const handlePress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  const handleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(recipe.id);
  };

  const handleLongPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress?.();
  };

  const totalTime = recipe.prepTime + recipe.cookTime;
  const sourceInfo = sourceConfig[recipe.sourceType || 'manual'];
  const SourceIcon = sourceInfo.icon;
  const difficultyStyle = difficultyColors[recipe.difficulty] || difficultyColors.Easy;

  if (variant === 'list') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.listCard,
          pressed && styles.cardPressed,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <View style={styles.listImageContainer}>
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.listImage}
            contentFit="cover"
          />
          <View style={[styles.listSourceBadge, { backgroundColor: sourceInfo.bgColor }]}>
            <SourceIcon size={10} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.listCategory}>{recipe.category}</Text>
            <View style={[styles.listDifficultyBadge, { backgroundColor: difficultyStyle.bg }]}>
              <Text style={styles.listDifficultyText}>{recipe.difficulty}</Text>
            </View>
          </View>
          <Text style={styles.listTitle} numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text style={styles.listMeta}>
            Imported {formatImportDate(recipe.importedAt)} | {sourceInfo.label}
          </Text>
          <View style={styles.listFooter}>
            <View style={styles.listMetaItem}>
              <Clock size={12} color={colors.textMuted} />
              <Text style={styles.listMetaText}>{totalTime} min</Text>
            </View>
            <View style={styles.listMetaItem}>
              <Users size={12} color={colors.textMuted} />
              <Text style={styles.listMetaText}>{recipe.servings}</Text>
            </View>
            {recipe.tags?.slice(0, 2).map((tag) => {
              const TagIcon = tagIcons[tag];
              return (
                <View key={tag} style={styles.miniTag}>
                  {TagIcon && <TagIcon size={10} color={colors.textLight} />}
                  <Text style={styles.miniTagText}>{tag}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <Pressable style={styles.listFavorite} onPress={handleFavorite} hitSlop={8}>
          <Heart
            size={18}
            color={recipe.isFavorite ? colors.primary : colors.textMuted}
            fill={recipe.isFavorite ? colors.primary : 'transparent'}
          />
        </Pressable>
      </Pressable>
    );
  }

  if (variant === 'compact') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.compactCard,
          pressed && styles.cardPressed,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <View style={styles.compactImageContainer}>
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.compactImage}
            contentFit="cover"
          />
          {recipe.tags?.includes('Vegetarian') && (
            <View style={styles.compactTagBadge}>
              <Text style={styles.compactTagText}>Vegetarian</Text>
            </View>
          )}
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {recipe.title}
          </Text>
          <View style={styles.compactMeta}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={styles.compactMetaText}>{totalTime} min</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyStyle.bg }]}>
          <Text style={[styles.difficultyText, { color: difficultyStyle.text }]}>{recipe.difficulty}</Text>
        </View>
        <View style={[styles.sourceBadge, { backgroundColor: sourceInfo.bgColor }]}>
          <SourceIcon size={12} color="#FFFFFF" />
          <Text style={styles.sourceBadgeText}>{sourceInfo.label}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>{recipe.category}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {recipe.description}
        </Text>
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{totalTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
          </View>
          <View style={styles.tagsRow}>
            {recipe.tags?.slice(0, 3).map((tag) => {
              const TagIcon = tagIcons[tag];
              return (
                <View key={tag} style={styles.tag}>
                  {TagIcon && <TagIcon size={12} color={colors.textLight} />}
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              );
            })}
            <Pressable style={styles.moreButton} onPress={handleFavorite} hitSlop={8}>
              <Heart
                size={16}
                color={recipe.isFavorite ? colors.primary : colors.textMuted}
                fill={recipe.isFavorite ? colors.primary : 'transparent'}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface RecipeGroupProps {
  title: string;
  recipes: Recipe[];
  icon?: React.ReactNode;
  onViewAll?: () => void;
  sourceCounts?: { source: string; count: number }[];
}

export function RecipeGroup({ title, recipes, icon, onViewAll, sourceCounts }: RecipeGroupProps) {
  const router = useRouter();

  if (recipes.length === 0) return null;

  return (
    <View style={styles.groupContainer}>
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleRow}>
          {icon}
          <Text style={styles.groupTitle}>{title}</Text>
        </View>
        {onViewAll && (
          <Pressable style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color={colors.primary} />
          </Pressable>
        )}
      </View>
      {sourceCounts && sourceCounts.length > 0 && (
        <View style={styles.sourceCountsRow}>
          {sourceCounts.map(({ source, count }) => {
            const info = sourceConfig[source as RecipeSource] || sourceConfig.manual;
            const Icon = info.icon;
            return (
              <View key={source} style={styles.sourceCountItem}>
                <View style={[styles.sourceCountIcon, { backgroundColor: info.bgColor }]}>
                  <Icon size={10} color="#FFFFFF" />
                </View>
                <Text style={styles.sourceCountText}>{info.label}</Text>
                <Text style={styles.sourceCountNum}>{count}</Text>
              </View>
            );
          })}
        </View>
      )}
      <View style={styles.groupRecipes}>
        {recipes.slice(0, 4).map((recipe) => {
          return (
            <Pressable 
              key={recipe.id} 
              style={styles.groupRecipeCard}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <View style={styles.groupImageContainer}>
                <Image
                  source={{ uri: recipe.imageUrl }}
                  style={styles.groupRecipeImage}
                  contentFit="cover"
                />
                {recipe.tags?.slice(0, 2).map((tag, index) => (
                  <View 
                    key={tag} 
                    style={[
                      styles.groupTagBadge, 
                      { top: 6 + (index * 22) },
                      tag === 'Vegetarian' && styles.groupTagVegetarian,
                      tag === 'Quick' && styles.groupTagBreakfast,
                    ]}
                  >
                    <Text style={styles.groupTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.groupRecipeTitle} numberOfLines={1}>{recipe.title}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  sourceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  sourceBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  content: {
    padding: 14,
  },
  category: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  meta: {
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500' as const,
  },
  moreButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  compactCard: {
    width: 160,
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  compactImageContainer: {
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: 100,
  },
  compactTagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compactTagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  compactContent: {
    padding: 10,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 6,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactMetaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  listImageContainer: {
    position: 'relative',
  },
  listImage: {
    width: 90,
    height: 90,
  },
  listSourceBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
    borderRadius: 6,
  },
  listContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCategory: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listDifficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listDifficultyText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 2,
  },
  listMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  listMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  listMetaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  miniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 3,
  },
  miniTagText: {
    fontSize: 9,
    color: colors.textLight,
    fontWeight: '500' as const,
  },
  listFavorite: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupContainer: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  sourceCountsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  sourceCountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sourceCountIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceCountText: {
    fontSize: 12,
    color: colors.textLight,
  },
  sourceCountNum: {
    fontSize: 12,
    color: colors.textMuted,
  },
  groupRecipes: {
    flexDirection: 'row',
    gap: 10,
  },
  groupRecipeCard: {
    flex: 1,
    maxWidth: 80,
  },
  groupImageContainer: {
    position: 'relative',
  },
  groupRecipeImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 6,
  },
  groupTagBadge: {
    position: 'absolute',
    left: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  groupTagVegetarian: {
    backgroundColor: colors.secondary,
  },
  groupTagBreakfast: {
    backgroundColor: '#F59E0B',
  },
  groupTagText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  groupRecipeTitle: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500' as const,
  },
});
