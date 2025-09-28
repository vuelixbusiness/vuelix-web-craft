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
  const [sectionUpdates, setSectionUpdates] = useState<SectionUpdates>({
    overview: false,
    rules: false,
    submissions: false,
    communication: false,
    updates: false,
    rewards: false,
  });

  const markSectionAsUpdated = useCallback((section: CampaignSectionType) => {
    setSectionUpdates(prev => ({
      ...prev,
      [section]: true
    }));
  }, []);

  const markSectionAsRead = useCallback((section: CampaignSectionType) => {
    setSectionUpdates(prev => ({
      ...prev,
      [section]: false
    }));
  }, []);

  const clearAllUpdates = useCallback(() => {
    setSectionUpdates({
      overview: false,
      rules: false,
      submissions: false,
      communication: false,
      updates: false,
      rewards: false,
    });
  }, []);

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