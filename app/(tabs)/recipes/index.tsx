import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { 
  Plus, 
  Search, 
  ChefHat, 
  BookOpen, 
  LayoutGrid, 
  List, 
  SlidersHorizontal,
  Star,
  Clock,
  Play,
  Music,
  Camera,
  X,
  ChevronDown
} from 'lucide-react-native';
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RecipeCard, { RecipeGroup } from '@/components/RecipeCard';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';
import { sourceFilters, tagFilters } from '@/mocks/recipes';
import { Recipe } from '@/types/recipe';

type ViewMode = 'default' | 'list';
type SourceFilter = typeof sourceFilters[number]['key'];

const sourceIcons: Record<string, typeof Play> = {
  youtube: Play,
  tiktok: Music,
  instagram: Camera,
};

function isWithinLastWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

function getSourceCounts(recipes: Recipe[]): { source: string; count: number }[] {
  const counts: Record<string, number> = {};
  recipes.forEach((recipe) => {
    const source = recipe.sourceType || 'manual';
    counts[source] = (counts[source] || 0) + 1;
  });
  return Object.entries(counts).map(([source, count]) => ({ source, count }));
}

export default function RecipesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipes, isLoading, deleteRecipe } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('default');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description?.toLowerCase().includes(searchLower) ||
        recipe.category.toLowerCase().includes(searchLower) ||
        recipe.ingredients?.some(ing => ing.name.toLowerCase().includes(searchLower)) ||
        recipe.tags?.some(tag => tag.toLowerCase().includes(searchLower));

      let matchesSource = true;
      if (sourceFilter === 'recent') {
        matchesSource = isWithinLastWeek(recipe.importedAt);
      } else if (sourceFilter !== 'all') {
        matchesSource = recipe.sourceType === sourceFilter;
      }

      const matchesTags = selectedTags.length === 0 || 
        (selectedTags.includes('Favorites') && recipe.isFavorite) ||
        selectedTags.some(tag => recipe.tags?.includes(tag as any));

      return matchesSearch && matchesSource && matchesTags;
    });
  }, [recipes, searchQuery, sourceFilter, selectedTags]);

  const recentlyImported = useMemo(() => recipes.filter(r => isWithinLastWeek(r.importedAt)), [recipes]);

  const handleAddRecipe = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/add-recipe');
  }, [router]);

  const handleRecipeLongPress = useCallback((recipe: Recipe) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedRecipe(recipe);
    setShowActionModal(true);
  }, []);

  const handleDeleteRecipe = useCallback(() => {
    if (selectedRecipe) {
      deleteRecipe(selectedRecipe.id);
      setShowActionModal(false);
      setSelectedRecipe(null);
    }
  }, [selectedRecipe, deleteRecipe]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSourceFilter('all');
    setSelectedTags([]);
    setSearchQuery('');
  }, []);

  const hasActiveFilters = sourceFilter !== 'all' || selectedTags.length > 0 || searchQuery.length > 0;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BookOpen size={24} color={colors.primary} />
          <Text style={styles.title}>Recipe Vault</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={handleAddRecipe}
        >
          <Plus size={20} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <X size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {sourceFilters.slice(0, 4).map((filter) => {
            const isActive = sourceFilter === filter.key;
            const Icon = sourceIcons[filter.key];
            return (
              <Pressable
                key={filter.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSourceFilter(filter.key)}
              >
                {Icon && <Icon size={12} color={isActive ? colors.white : colors.textLight} />}
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
                {filter.key === 'youtube' && (
                  <ChevronDown size={12} color={isActive ? colors.white : colors.textLight} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.tagSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {tagFilters.slice(0, 4).map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                style={[styles.tagChip, isActive && styles.tagChipActive]}
                onPress={() => toggleTag(tag)}
              >
                {tag === 'Favorites' && <Star size={12} color={isActive ? colors.white : colors.textLight} />}
                <Text style={[styles.tagChipText, isActive && styles.tagChipTextActive]}>
                  {tag}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            style={styles.moreFiltersChip}
            onPress={() => setShowFiltersModal(true)}
          >
            <SlidersHorizontal size={14} color={colors.textLight} />
            <Text style={styles.moreFiltersText}>Filters</Text>
          </Pressable>
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsTitle}>All Recipes</Text>
          <Text style={styles.resultsCount}>{filteredRecipes.length} recipes</Text>
        </View>
        <View style={styles.viewToggle}>
          <Pressable
            style={[styles.viewButton, viewMode === 'default' && styles.viewButtonActive]}
            onPress={() => setViewMode('default')}
          >
            <LayoutGrid size={16} color={viewMode === 'default' ? colors.primary : colors.textMuted} />
          </Pressable>
          <Pressable
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List size={16} color={viewMode === 'list' ? colors.primary : colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {hasActiveFilters && (
        <Pressable style={styles.clearFilters} onPress={clearFilters}>
          <X size={14} color={colors.primary} />
          <Text style={styles.clearFiltersText}>Clear filters</Text>
        </Pressable>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <ChefHat size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>This is your recipe brain</Text>
            <Text style={styles.emptyText}>
              Save from TikTok, YouTube, Instagram, or photos.{'\n'}
              Everything you need, organized and searchable.
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={handleAddRecipe}
            >
              <Plus size={18} color={colors.white} />
              <Text style={styles.emptyButtonText}>Import your first recipe</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.allRecipes}>
              {filteredRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  variant={viewMode}
                  onLongPress={() => handleRecipeLongPress(recipe)}
                />
              ))}
            </View>

            {!hasActiveFilters && recentlyImported.length > 0 && (
              <RecipeGroup
                title="Recently Imported"
                recipes={recentlyImported}
                icon={<Clock size={16} color={colors.primary} />}
                onViewAll={() => setSourceFilter('recent')}
                sourceCounts={getSourceCounts(recentlyImported)}
              />
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showFiltersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <Pressable onPress={() => setShowFiltersModal(false)}>
              <X size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Source</Text>
            <View style={styles.modalChips}>
              {sourceFilters.map((filter) => {
                const isActive = sourceFilter === filter.key;
                return (
                  <Pressable
                    key={filter.key}
                    style={[styles.modalChip, isActive && styles.modalChipActive]}
                    onPress={() => setSourceFilter(filter.key)}
                  >
                    <Text style={[styles.modalChipText, isActive && styles.modalChipTextActive]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.modalSectionTitle}>Tags</Text>
            <View style={styles.modalChips}>
              {tagFilters.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    style={[styles.modalChip, isActive && styles.modalChipActive]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.modalChipText, isActive && styles.modalChipTextActive]}>
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.modalClearButton} onPress={clearFilters}>
              <Text style={styles.modalClearText}>Clear All</Text>
            </Pressable>
            <Pressable 
              style={styles.modalApplyButton} 
              onPress={() => setShowFiltersModal(false)}
            >
              <Text style={styles.modalApplyText}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showActionModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowActionModal(false)}
      >
        <Pressable 
          style={styles.actionModalOverlay} 
          onPress={() => setShowActionModal(false)}
        >
          <View style={styles.actionModalContent}>
            <View style={styles.actionModalHandle} />
            <Text style={styles.actionModalTitle}>{selectedRecipe?.title}</Text>
            <Pressable 
              style={styles.actionItem}
              onPress={() => {
                setShowActionModal(false);
                router.push('/plan-meal');
              }}
            >
              <Text style={styles.actionItemText}>Add to meal plan</Text>
            </Pressable>
            <Pressable style={styles.actionItem}>
              <Text style={styles.actionItemText}>Edit tags</Text>
            </Pressable>
            <Pressable style={styles.actionItem}>
              <Text style={styles.actionItemText}>Change category</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionItem, styles.actionItemDestructive]}
              onPress={handleDeleteRecipe}
            >
              <Text style={styles.actionItemTextDestructive}>Delete recipe</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    marginLeft: 10,
  },
  filterSection: {
    marginBottom: 8,
  },
  tagSection: {
    marginBottom: 14,
  },
  filterChips: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 5,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textLight,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 5,
  },
  tagChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textLight,
  },
  tagChipTextActive: {
    color: colors.white,
  },
  moreFiltersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: 5,
  },
  moreFiltersText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textLight,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  resultsTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
  },
  resultsCount: {
    fontSize: 13,
    color: colors.textMuted,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewButton: {
    padding: 7,
    borderRadius: 7,
  },
  viewButtonActive: {
    backgroundColor: colors.background,
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  clearFiltersText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  allRecipes: {
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  modalChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  modalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textLight,
  },
  modalChipTextActive: {
    color: colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalClearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalClearText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textLight,
  },
  modalApplyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalApplyText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.white,
  },
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionModalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  actionModalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  actionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionItemText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  actionItemDestructive: {
    borderBottomWidth: 0,
  },
  actionItemTextDestructive: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
});
