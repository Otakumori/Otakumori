import type { FC } from "react";

interface AchievementCategoriesProps {
  selectedCategory?: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const AchievementCategories: FC<AchievementCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => (
  <div className="mb-4">
    <button
      type="button"
      className={[
        "mr-2 inline-block cursor-pointer rounded-full px-3 py-1",
        selectedCategory === null ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-600",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelectCategory(null)}
    >
      All
    </button>
    {[
      { id: "community", label: "Community" },
      { id: "special", label: "Special" },
    ].map(({ id, label }) => (
      <button
        key={id}
        type="button"
        className={[
          "mr-2 inline-block rounded-full px-3 py-1",
          selectedCategory === id ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-600",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onSelectCategory(id)}
      >
        {label}
      </button>
    ))}
  </div>
);