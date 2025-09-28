import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type CampaignSectionType = 
  | "overview" 
  | "rules" 
  | "rewards" 
  | "submissions" 
  | "communication" 
  | "updates";

interface SectionUpdates {
  overview: boolean;
  rules: boolean;
  submissions: boolean;
  communication: boolean;
  updates: boolean;
  rewards: boolean;
}

interface SectionUpdateContextType {
  sectionUpdates: SectionUpdates;
  markSectionAsUpdated: (section: CampaignSectionType) => void;
  markSectionAsRead: (section: CampaignSectionType) => void;
  clearAllUpdates: () => void;
}

const SectionUpdateContext = createContext<SectionUpdateContextType | undefined>(undefined);

export function useSectionUpdates() {
  const context = useContext(SectionUpdateContext);
  if (context === undefined) {
    throw new Error('useSectionUpdates must be used within a SectionUpdateProvider');
  }
  return context;
}

interface SectionUpdateProviderProps {
  children: ReactNode;
  campaignId: string;
}

export function SectionUpdateProvider({ children, campaignId }: SectionUpdateProviderProps) {
  // Load initial state from localStorage with campaign-specific key
  const getInitialState = (): SectionUpdates => {
    try {
      const stored = localStorage.getItem(`sectionUpdates_${campaignId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load section updates from localStorage:', error);
    }
    return {
      overview: false,
      rules: false,
      submissions: false,
      communication: false,
      updates: false,
      rewards: false,
    };
  };

  const [sectionUpdates, setSectionUpdates] = useState<SectionUpdates>(getInitialState);

  const markSectionAsUpdated = useCallback((section: CampaignSectionType) => {
    setSectionUpdates(prev => {
      const newState = {
        ...prev,
        [section]: true
      };
      // Persist to localStorage
      localStorage.setItem(`sectionUpdates_${campaignId}`, JSON.stringify(newState));
      return newState;
    });
  }, [campaignId]);

  const markSectionAsRead = useCallback((section: CampaignSectionType) => {
    setSectionUpdates(prev => {
      const newState = {
        ...prev,
        [section]: false
      };
      // Persist to localStorage
      localStorage.setItem(`sectionUpdates_${campaignId}`, JSON.stringify(newState));
      return newState;
    });
  }, [campaignId]);

  const clearAllUpdates = useCallback(() => {
    const clearedState = {
      overview: false,
      rules: false,
      submissions: false,
      communication: false,
      updates: false,
      rewards: false,
    };
    setSectionUpdates(clearedState);
    // Persist to localStorage
    localStorage.setItem(`sectionUpdates_${campaignId}`, JSON.stringify(clearedState));
  }, [campaignId]);

  const value = {
    sectionUpdates,
    markSectionAsUpdated,
    markSectionAsRead,
    clearAllUpdates,
  };

  return (
    <SectionUpdateContext.Provider value={value}>
      {children}
    </SectionUpdateContext.Provider>
  );
}