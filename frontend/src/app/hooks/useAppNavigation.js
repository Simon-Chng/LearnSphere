"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

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

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    router.push(`/apps/${categoryId}`);
  };

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
