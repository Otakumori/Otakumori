import { avatarPartManager } from '@/app/lib/3d/avatar-parts';
import type { AvatarPartType } from '@/app/lib/3d/avatar-parts';

export function createFilteredPartsFunction(
  searchQuery: string,
  selectedCategory: string,
  showNsfwContent: boolean,
  ageVerified: boolean,
) {
  return (partType: AvatarPartType) => {
    const parts = avatarPartManager.getPartsByType(partType);
    return parts.filter((part) => {
      const matchesSearch =
        searchQuery === '' ||
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        part.category === selectedCategory ||
        (selectedCategory === 'nsfw' && part.contentRating !== 'sfw');

      const matchesContent =
        part.contentRating === 'sfw' ||
        (part.contentRating === 'nsfw' && showNsfwContent) ||
        (part.contentRating === 'explicit' && showNsfwContent && ageVerified);

      return matchesSearch && matchesCategory && matchesContent;
    });
  };
}

