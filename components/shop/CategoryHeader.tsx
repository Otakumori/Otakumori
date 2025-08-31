import CategoryBanner from '@/components/graphics/CategoryBanner';

export type CategoryHeaderProps = {
  category: string | { slug: string; label: string; description?: string };
  description?: string;
  className?: string;
  totalProducts?: number;
  currentPage?: number;
  totalPages?: number;
};

export default function CategoryHeader({
  category,
  description,
  className,
  totalProducts,
  currentPage,
  totalPages,
}: CategoryHeaderProps) {
  // Handle both string and object category types
  const getCategoryInfo = () => {
    if (typeof category === 'string') {
      const displayName = category
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { name: displayName, desc: description };
    } else {
      return { name: category.label, desc: description || category.description };
    }
  };

  const { name: displayName, desc: categoryDescription } = getCategoryInfo();

  // Build subtitle with product count and pagination info
  const buildSubtitle = () => {
    let subtitle = categoryDescription || '';

    if (totalProducts !== undefined) {
      const productText = totalProducts === 1 ? 'product' : 'products';
      subtitle += subtitle
        ? ` • ${totalProducts} ${productText}`
        : `${totalProducts} ${productText}`;
    }

    if (currentPage && totalPages && totalPages > 1) {
      subtitle += ` • Page ${currentPage} of ${totalPages}`;
    }

    return subtitle;
  };

  return (
    <div className={className}>
      <CategoryBanner title={displayName} subtitle={buildSubtitle()} animate={true} />
    </div>
  );
}
