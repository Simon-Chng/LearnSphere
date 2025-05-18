"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Custom hook for managing application-level navigation, category selection,
 * and sidebar state within the `/apps` section.
 *
 * Automatically updates the selected category based on the current URL.
 *
 * @param {string} initialCategory - The category to select by default (e.g. "all" or a specific category ID)
 * @returns {{
 *   isSidebarOpen: boolean,
 *   setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>,
 *   selectedCategory: string,
 *   categories: { id: string, name: string, icon: string }[],
 *   handleCategorySelect: (categoryId: string) => void,
 *   onShowAllFeatures: () => void
 * }}
 */
export const useAppNavigation = (initialCategory) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const categories = [
    { id: 'goal-setting', name: 'Goal Setting', icon: '🎯' },
    { id: 'problem-solving', name: 'Problem Solving', icon: '💡' },
    { id: 'text-summarization', name: 'Text Summarization', icon: '📝' },
    { id: 'emotional-support', name: 'Emotional Support', icon: '❤️' },
    { id: 'social-learning', name: 'Social Learning', icon: '👥' }
  ];

  // Listen for route changes and automatically update selected state
  useEffect(() => {
    if (pathname === '/apps') {
      setSelectedCategory('all');
    } else {
      const category = pathname.split('/').pop();
      if (categories.some(c => c.id === category)) {
        setSelectedCategory(category);
      }
    }
  }, [pathname]);

  /**
   * Updates selectedCategory and navigates to the corresponding page.
   *
   * @param {string} categoryId - The ID of the selected category
   */
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    router.push(`/apps/${categoryId}`);
  };

  /**
   * Resets to showing all features and navigates to the main apps page.
   */
  const onShowAllFeatures = () => {
    setSelectedCategory('all');
    router.push('/apps');
  };

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    selectedCategory,
    categories,
    handleCategorySelect,
    onShowAllFeatures
  };
};
