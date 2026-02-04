'use client';

import { ActionCategory } from '@/lib/types';
import { getCategoryLabel } from '@/lib/actions-utils';

interface CategoryFilterProps {
  categories: ActionCategory[];
  selected: ActionCategory[];
  onChange: (selected: ActionCategory[]) => void;
}

export default function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const isAllSelected = selected.length === 0;

  const toggleCategory = (category: ActionCategory) => {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange([])}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          isAllSelected
            ? 'bg-navy text-white dark:bg-gold dark:text-navy'
            : 'bg-cream dark:bg-navy-700 text-navy/60 dark:text-cream/60 hover:text-navy dark:hover:text-cream'
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const isActive = selected.includes(category);
        return (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-navy text-white dark:bg-gold dark:text-navy'
                : 'bg-cream dark:bg-navy-700 text-navy/60 dark:text-cream/60 hover:text-navy dark:hover:text-cream'
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        );
      })}
    </div>
  );
}
