/**
 * Soapstone User Data Utilities
 * 
 * Provides consistent user data transformation between API responses
 * and component prop formats across all soapstone components.
 */

/**
 * API user format (from database/API)
 */
export interface ApiSoapstoneUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

/**
 * Component user format (for SoapstoneWall and similar)
 */
export interface ComponentSoapstoneUser {
  name: string;
  avatar?: string;
}

/**
 * Transform API user format to component format
 * Handles null/undefined values and provides defaults
 */
export function transformApiUserToComponent(
  apiUser: ApiSoapstoneUser | null | undefined
): ComponentSoapstoneUser | undefined {
  if (!apiUser) {
    return undefined;
  }

  return {
    name: apiUser.displayName || 'Anonymous Traveler',
    avatar: apiUser.avatarUrl || undefined,
  };
}

/**
 * Transform component user format to API format (for reverse compatibility if needed)
 */
export function transformComponentUserToApi(
  componentUser: ComponentSoapstoneUser | undefined
): ApiSoapstoneUser | null {
  if (!componentUser) {
    return null;
  }

  return {
    id: '', // Component format doesn't have ID
    displayName: componentUser.name === 'Anonymous Traveler' ? null : componentUser.name,
    avatarUrl: componentUser.avatar || null,
  };
}

/**
 * Get user display name with fallback
 */
export function getUserDisplayName(user: ApiSoapstoneUser | null | undefined): string {
  return user?.displayName || 'Anonymous Traveler';
}

/**
 * Get user avatar URL with fallback
 */
export function getUserAvatarUrl(user: ApiSoapstoneUser | null | undefined): string | null {
  return user?.avatarUrl || null;
}

/**
 * Get user initials for avatar placeholder
 */
export function getUserInitials(user: ApiSoapstoneUser | null | undefined): string {
  const displayName = getUserDisplayName(user);
  if (displayName === 'Anonymous Traveler') {
    return '?';
  }
  return displayName[0]?.toUpperCase() || '?';
}

