export interface UserType {
  id: string;
  icon: string;
  label: string;
  description: string;
}

export const USER_TYPES: UserType[] = [
  {
    id: 'artist',
    icon: '🎵',
    label: 'Artist',
    description: 'I want to promote my music and build an audience.'
  },
  {
    id: 'creator',
    icon: '🎥',
    label: 'Creator',
    description: 'I want to create content and earn from campaigns.'
  },
  {
    id: 'visual_creative',
    icon: '🖼️',
    label: 'Visual Creative',
    description: 'I design, shoot, or edit for campaigns.'
  },
  {
    id: 'dj',
    icon: '🎧',
    label: 'DJ',
    description: 'I mix, play, or showcase music in sets or live events.'
  },
  {
    id: 'producer',
    icon: '🎹',
    label: 'Producer',
    description: 'I make beats, remixes, or collaborate with artists.'
  },
  {
    id: 'collective',
    icon: '👥',
    label: 'Collective',
    description: 'We manage or represent multiple talents.'
  },
  {
    id: 'record_label',
    icon: '💿',
    label: 'Record Label',
    description: 'We manage artists and run promotions.'
  },
  {
    id: 'brand',
    icon: '🏷️',
    label: 'Brand',
    description: 'We want to sponsor content or collaborate with talent.'
  },
  {
    id: 'studio',
    icon: '🎛️',
    label: 'Studio (Audio/Visual)',
    description: 'We offer recording or production services.'
  },
  {
    id: 'festival_event',
    icon: '🎤',
    label: 'Festival/Event',
    description: 'We host or promote live performances.'
  }
];

export const getUserTypeById = (id: string): UserType | undefined => {
  return USER_TYPES.find(type => type.id === id);
};
