'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

// Types for adult gating system
export interface AdultGatingConfig {
  enabled: boolean;
  ageVerification: boolean;
  selfAttestation: boolean;
  regionRestrictions: string[];
  contentLevels: {
    mild: boolean;
    moderate: boolean;
    explicit: boolean;
  };
  physicsProfiles: {
    basic: boolean;
    enhanced: boolean;
    realistic: boolean;
  };
}

export interface UserAdultStatus {
  isVerified: boolean;
  age: number | null;
  region: string | null;
  consentGiven: boolean;
  consentDate: Date | null;
  contentLevel: 'mild' | 'moderate' | 'explicit' | null;
  physicsLevel: 'basic' | 'enhanced' | 'realistic' | null;
}

export interface AdultContentDescriptor {
  id: string;
  name: string;
  description: string;
  level: 'mild' | 'moderate' | 'explicit';
  category: 'physics' | 'clothing' | 'pose' | 'interaction';
  requiresVerification: boolean;
  regionBlocked: string[];
  previewImage?: string;
}

// Adult gating configuration
export const ADULT_GATING_CONFIG: AdultGatingConfig = {
  enabled: true,
  ageVerification: true,
  selfAttestation: true,
  regionRestrictions: ['CN', 'RU', 'SA', 'AE'], // Countries with strict content laws
  contentLevels: {
    mild: true,
    moderate: true,
    explicit: true,
  },
  physicsProfiles: {
    basic: true,
    enhanced: true,
    realistic: true,
  },
};

// Adult content descriptors
export const ADULT_CONTENT_DESCRIPTORS: AdultContentDescriptor[] = [
  // Physics content
  {
    id: 'hair-physics',
    name: 'Hair Physics',
    description: 'Realistic hair movement and physics simulation',
    level: 'mild',
    category: 'physics',
    requiresVerification: false,
    regionBlocked: [],
  },
  {
    id: 'cloth-physics',
    name: 'Cloth Physics',
    description: 'Realistic clothing movement and physics simulation',
    level: 'mild',
    category: 'physics',
    requiresVerification: false,
    regionBlocked: [],
  },
  {
    id: 'soft-body-physics',
    name: 'Soft Body Physics',
    description: 'Realistic soft body deformation and movement',
    level: 'moderate',
    category: 'physics',
    requiresVerification: true,
    regionBlocked: ['CN', 'RU'],
  },
  {
    id: 'enhanced-physics',
    name: 'Enhanced Physics',
    description: 'Advanced physics simulation with realistic body movement',
    level: 'explicit',
    category: 'physics',
    requiresVerification: true,
    regionBlocked: ['CN', 'RU', 'SA', 'AE'],
  },
  
  // Clothing content
  {
    id: 'revealing-clothing',
    name: 'Revealing Clothing',
    description: 'Clothing that reveals more skin',
    level: 'mild',
    category: 'clothing',
    requiresVerification: false,
    regionBlocked: [],
  },
  {
    id: 'lingerie',
    name: 'Lingerie',
    description: 'Intimate clothing options',
    level: 'moderate',
    category: 'clothing',
    requiresVerification: true,
    regionBlocked: ['CN', 'RU'],
  },
  {
    id: 'nude-clothing',
    name: 'Nude Clothing',
    description: 'Clothing that covers minimal areas',
    level: 'explicit',
    category: 'clothing',
    requiresVerification: true,
    regionBlocked: ['CN', 'RU', 'SA', 'AE'],
  },
  
  // Pose content
  {
    id: 'suggestive-poses',
    name: 'Suggestive Poses',
    description: 'Poses that are mildly suggestive',
    level: 'mild',
    category: 'pose',
    requiresVerification: false,
    regionBlocked: [],
  },
  {
    id: 'intimate-poses',
    name: 'Intimate Poses',
    description: 'Poses that are more intimate in nature',
    level: 'moderate',
    category: 'pose',
    requiresVerification: true,
    regionBlocked: ['CN', 'RU'],
  },
  {
    id: 'explicit-poses',
    name: 'Explicit Poses',
    description: 'Poses that are sexually explicit',
    level: 'explicit',
    category: 'pose',
    requiresVerification: true,
    regionBlocked: ['CN', 'RU', 'SA', 'AE'],
  },
  
  // Interaction content
  {
    id: 'touch-interactions',
    name: 'Touch Interactions',
    description: 'Interactive touch-based features',
    level: 'mild',
    category: 'interaction',
    requiresVerification: false,
    regionBlocked: [],
  },
  {
    id: 'intimate-interactions',
    name: 'Intimate Interactions',
    description: 'More intimate interaction features',
    level: 'moderate',
    category: 'interaction',
    requiresVerification: true,
    regionBlocked: ['CN', 'RU'],
  },
  {
    id: 'explicit-interactions',
    name: 'Explicit Interactions',
    description: 'Sexually explicit interaction features',
    level: 'explicit',
    category: 'interaction',
    requiresVerification: true,
    regionBlocked: ['CN', 'RU', 'SA', 'AE'],
  },
];

// Adult gating service
export class AdultGatingService {
  private config: AdultGatingConfig;
  
  constructor(config: AdultGatingConfig = ADULT_GATING_CONFIG) {
    this.config = config;
  }
  
  // Check if adult content is enabled
  isAdultContentEnabled(): boolean {
    return this.config.enabled;
  }
  
  // Get user's adult status
  async getUserAdultStatus(userId: string): Promise<UserAdultStatus> {
    try {
      // In a real implementation, this would query the database
      // For now, we'll use localStorage as a fallback
      const stored = localStorage.getItem(`otakumori_adult_status_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          consentDate: parsed.consentDate ? new Date(parsed.consentDate) : null,
        };
      }
      
      return {
        isVerified: false,
        age: null,
        region: null,
        consentGiven: false,
        consentDate: null,
        contentLevel: null,
        physicsLevel: null,
      };
    } catch (error) {
      console.error('Error getting user adult status:', error);
      return {
        isVerified: false,
        age: null,
        region: null,
        consentGiven: false,
        consentDate: null,
        contentLevel: null,
        physicsLevel: null,
      };
    }
  }
  
  // Update user's adult status
  async updateUserAdultStatus(userId: string, status: Partial<UserAdultStatus>): Promise<void> {
    try {
      const currentStatus = await this.getUserAdultStatus(userId);
      const updatedStatus = { ...currentStatus, ...status };
      
      // Store in localStorage (in production, this would be stored in database)
      localStorage.setItem(
        `otakumori_adult_status_${userId}`,
        JSON.stringify(updatedStatus)
      );
    } catch (error) {
      console.error('Error updating user adult status:', error);
    }
  }
  
  // Check if user can access content
  async canAccessContent(
    userId: string,
    contentId: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!this.config.enabled) {
      return { allowed: true };
    }
    
    const userStatus = await this.getUserAdultStatus(userId);
    const content = ADULT_CONTENT_DESCRIPTORS.find(c => c.id === contentId);
    
    if (!content) {
      return { allowed: false, reason: 'Content not found' };
    }
    
    // Check region restrictions
    if (userStatus.region && content.regionBlocked.includes(userStatus.region)) {
      return { allowed: false, reason: 'Content blocked in your region' };
    }
    
    // Check age verification
    if (content.requiresVerification && !userStatus.isVerified) {
      return { allowed: false, reason: 'Age verification required' };
    }
    
    // Check content level
    if (userStatus.contentLevel) {
      const levelOrder = { mild: 1, moderate: 2, explicit: 3 };
      const userLevel = levelOrder[userStatus.contentLevel];
      const contentLevel = levelOrder[content.level];
      
      if (userLevel < contentLevel) {
        return { allowed: false, reason: 'Content level too high for your settings' };
      }
    }
    
    return { allowed: true };
  }
  
  // Verify user age
  async verifyUserAge(userId: string, age: number): Promise<boolean> {
    if (age < 18) {
      return false;
    }
    
    await this.updateUserAdultStatus(userId, {
      isVerified: true,
      age,
      consentGiven: true,
      consentDate: new Date(),
    });
    
    return true;
  }
  
  // Set user content level
  async setUserContentLevel(
    userId: string,
    level: 'mild' | 'moderate' | 'explicit'
  ): Promise<void> {
    await this.updateUserAdultStatus(userId, { contentLevel: level });
  }
  
  // Set user physics level
  async setUserPhysicsLevel(
    userId: string,
    level: 'basic' | 'enhanced' | 'realistic'
  ): Promise<void> {
    await this.updateUserAdultStatus(userId, { physicsLevel: level });
  }
  
  // Get available content for user
  async getAvailableContent(userId: string): Promise<AdultContentDescriptor[]> {
    const userStatus = await this.getUserAdultStatus(userId);
    const availableContent: AdultContentDescriptor[] = [];
    
    for (const content of ADULT_CONTENT_DESCRIPTORS) {
      const access = await this.canAccessContent(userId, content.id);
      if (access.allowed) {
        availableContent.push(content);
      }
    }
    
    return availableContent;
  }
  
  // Get content by category
  async getContentByCategory(
    userId: string,
    category: string
  ): Promise<AdultContentDescriptor[]> {
    const availableContent = await this.getAvailableContent(userId);
    return availableContent.filter(content => content.category === category);
  }
  
  // Check if user needs age verification
  async needsAgeVerification(userId: string): Promise<boolean> {
    const userStatus = await this.getUserAdultStatus(userId);
    return !userStatus.isVerified && this.config.ageVerification;
  }
  
  // Get user's region (simplified)
  async getUserRegion(): Promise<string | null> {
    try {
      // In a real implementation, this would use a geolocation service
      // For now, we'll return null (no restrictions)
      return null;
    } catch (error) {
      console.error('Error getting user region:', error);
      return null;
    }
  }
  
  // Reset user adult status
  async resetUserAdultStatus(userId: string): Promise<void> {
    try {
      localStorage.removeItem(`otakumori_adult_status_${userId}`);
    } catch (error) {
      console.error('Error resetting user adult status:', error);
    }
  }
}

// React hook for adult gating
export function useAdultGating() {
  const { user } = useUser();
  const [adultStatus, setAdultStatus] = useState<UserAdultStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  const service = new AdultGatingService();
  
  useEffect(() => {
    if (user) {
      loadAdultStatus();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const loadAdultStatus = async () => {
    if (!user) return;
    
    try {
      const status = await service.getUserAdultStatus(user.id);
      setAdultStatus(status);
    } catch (error) {
      console.error('Error loading adult status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const verifyAge = async (age: number) => {
    if (!user) return false;
    
    const success = await service.verifyUserAge(user.id, age);
    if (success) {
      await loadAdultStatus();
    }
    return success;
  };
  
  const setContentLevel = async (level: 'mild' | 'moderate' | 'explicit') => {
    if (!user) return;
    
    await service.setUserContentLevel(user.id, level);
    await loadAdultStatus();
  };
  
  const setPhysicsLevel = async (level: 'basic' | 'enhanced' | 'realistic') => {
    if (!user) return;
    
    await service.setUserPhysicsLevel(user.id, level);
    await loadAdultStatus();
  };
  
  const canAccessContent = async (contentId: string) => {
    if (!user) return false;
    
    const result = await service.canAccessContent(user.id, contentId);
    return result.allowed;
  };
  
  const getAvailableContent = async () => {
    if (!user) return [];
    
    return await service.getAvailableContent(user.id);
  };
  
  return {
    adultStatus,
    loading,
    verifyAge,
    setContentLevel,
    setPhysicsLevel,
    canAccessContent,
    getAvailableContent,
    refresh: loadAdultStatus,
  };
}

// Age verification component
export function AgeVerificationModal({
  isOpen,
  onClose,
  onVerify,
}: {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (age: number) => void;
}) {
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18) {
      setError('You must be 18 or older to access adult content');
      return;
    }
    
    onVerify(ageNum);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Age Verification</h2>
        <p className="text-gray-600 mb-4">
          You must be 18 or older to access adult content. Please verify your age to continue.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              id="age"
              type="number"
              min="18"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Content level selector component
export function ContentLevelSelector({
  currentLevel,
  onLevelChange,
}: {
  currentLevel: 'mild' | 'moderate' | 'explicit' | null;
  onLevelChange: (level: 'mild' | 'moderate' | 'explicit') => void;
}) {
  const levels = [
    { id: 'mild', label: 'Mild', description: 'Safe for all audiences' },
    { id: 'moderate', label: 'Moderate', description: 'Some suggestive content' },
    { id: 'explicit', label: 'Explicit', description: 'Adult content only' },
  ];
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Content Level
      </label>
      {levels.map(level => (
        <label key={level.id} className="flex items-center space-x-2">
          <input
            type="radio"
            name="contentLevel"
            value={level.id}
            checked={currentLevel === level.id}
            onChange={() => onLevelChange(level.id as 'mild' | 'moderate' | 'explicit')}
            className="text-pink-500 focus:ring-pink-500"
          />
          <div>
            <div className="text-sm font-medium">{level.label}</div>
            <div className="text-xs text-gray-500">{level.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
}