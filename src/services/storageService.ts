import { UserProfile, WellnessTip } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'wellness_user_profile',
  SAVED_TIPS: 'wellness_saved_tips',
  RECOMMENDATIONS: 'wellness_recommendations',
  LAST_UPDATED: 'wellness_last_updated',
};

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Save user profile to local storage
   */
  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      this.updateTimestamp();
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  /**
   * Get user profile from local storage
   */
  getUserProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  /**
   * Save wellness tips to local storage
   */
  saveTips(tips: WellnessTip[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_TIPS, JSON.stringify(tips));
      this.updateTimestamp();
    } catch (error) {
      console.error('Error saving tips:', error);
    }
  }

  /**
   * Get saved tips from local storage
   */
  getSavedTips(): WellnessTip[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_TIPS);
      if (data) {
        const tips = JSON.parse(data);
        // Convert date strings back to Date objects
        return tips.map((tip: any) => ({
          ...tip,
          createdAt: new Date(tip.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading saved tips:', error);
      return [];
    }
  }

  /**
   * Add a single tip to saved tips
   */
  addSavedTip(tip: WellnessTip): void {
    const savedTips = this.getSavedTips();
    const exists = savedTips.some(t => t.id === tip.id);
    
    if (!exists) {
      savedTips.push({ ...tip, isSaved: true });
      this.saveTips(savedTips);
    }
  }

  /**
   * Remove a tip from saved tips
   */
  removeSavedTip(tipId: string): void {
    const savedTips = this.getSavedTips();
    const filtered = savedTips.filter(t => t.id !== tipId);
    this.saveTips(filtered);
  }

  /**
   * Toggle save status of a tip
   */
  toggleSaveTip(tip: WellnessTip): boolean {
    const savedTips = this.getSavedTips();
    const existingIndex = savedTips.findIndex(t => t.id === tip.id);
    
    if (existingIndex >= 0) {
      savedTips.splice(existingIndex, 1);
      this.saveTips(savedTips);
      return false; // Tip was removed
    } else {
      savedTips.push({ ...tip, isSaved: true });
      this.saveTips(savedTips);
      return true; // Tip was added
    }
  }

  /**
   * Check if a tip is saved
   */
  isTipSaved(tipId: string): boolean {
    const savedTips = this.getSavedTips();
    return savedTips.some(t => t.id === tipId);
  }

  /**
   * Save current recommendations
   */
  saveRecommendations(recommendations: WellnessTip[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
      this.updateTimestamp();
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  }

  /**
   * Get saved recommendations
   */
  getRecommendations(): WellnessTip[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
      if (data) {
        const tips = JSON.parse(data);
        return tips.map((tip: any) => ({
          ...tip,
          createdAt: new Date(tip.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading recommendations:', error);
      return [];
    }
  }

  /**
   * Clear all stored data
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Clear only user session data (keep saved tips)
   */
  clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.RECOMMENDATIONS);
      this.updateTimestamp();
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Update last modified timestamp
   */
  private updateTimestamp(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
    } catch (error) {
      console.error('Error updating timestamp:', error);
    }
  }

  /**
   * Get last updated timestamp
   */
  getLastUpdated(): Date | null {
    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error('Error getting timestamp:', error);
      return null;
    }
  }

  /**
   * Export all data as JSON
   */
  exportData(): string {
    const data = {
      profile: this.getUserProfile(),
      savedTips: this.getSavedTips(),
      recommendations: this.getRecommendations(),
      lastUpdated: this.getLastUpdated(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON string
   */
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.profile) {
        this.saveUserProfile(data.profile);
      }
      if (data.savedTips) {
        this.saveTips(data.savedTips);
      }
      if (data.recommendations) {
        this.saveRecommendations(data.recommendations);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export default StorageService.getInstance();