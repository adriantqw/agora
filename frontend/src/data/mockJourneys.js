import {
  Heart,
  GlassWater,
  Flower,
  Moon,
  Briefcase,
  PenTool,
  Shirt,
  Calendar,
  Music,
  PartyPopper,
  Stars,
  Wine,
} from 'lucide-react';

/**
 * Mock Journey Data
 *
 * Structure:
 * - id: unique identifier
 * - title: journey name
 * - status: 'active' | 'in-progress' | 'ideation'
 * - statusColor: hex color for status badge and dot
 * - statusLabel: display label for status badge
 * - closetUrl: navigation path for "View Closet" link
 * - outfits: array of outfit objects
 */

export const mockJourneys = [
  {
    id: 'valentines-day',
    title: "Valentine's Day Date",
    status: 'active',
    statusColor: '#F5A5B8',
    statusLabel: 'Ongoing Journey',
    closetUrl: '/browse',
    outfits: [
      {
        id: 'valentines-1',
        label: 'Candlelight Elegance',
        subtext: 'Romantic dinner dress',
        price: 145,
        imageUrl: null,
        icon: Heart,
        iconColor: '#F5A5B8',
        backgroundColor: '#FFF5F7',
        isAIPick: true,
      },
      {
        id: 'valentines-2',
        label: 'Gallery Night Out',
        subtext: 'Art exhibition chic',
        price: 210,
        imageUrl: null,
        icon: GlassWater,
        iconColor: '#4299e1',
        backgroundColor: '#EBF8FF',
        isAIPick: false,
      },
      {
        id: 'valentines-3',
        label: 'Soft Romance',
        subtext: 'Casual brunch outfit',
        price: 120,
        imageUrl: null,
        icon: Flower,
        iconColor: '#F5A5B8',
        backgroundColor: '#FFF5F7',
        isAIPick: false,
      },
      {
        id: 'valentines-4',
        label: 'Modern Minimalist',
        subtext: 'Evening cocktails',
        price: 165,
        imageUrl: null,
        icon: Moon,
        iconColor: '#805ad5',
        backgroundColor: '#FAF5FF',
        isAIPick: false,
      },
    ],
  },

  {
    id: 'office-edit',
    title: 'The Office Edit',
    status: 'in-progress',
    statusColor: '#4299e1',
    statusLabel: 'Ongoing Journey',
    closetUrl: '/browse',
    outfits: [
      {
        id: 'office-1',
        label: 'The Power Suit',
        subtext: 'Executive meeting',
        price: 285,
        imageUrl: null,
        icon: Briefcase,
        iconColor: '#1a202c',
        backgroundColor: '#F7FAFC',
        isAIPick: false,
      },
      {
        id: 'office-2',
        label: 'Creative Agency Look',
        subtext: 'Startup casual Friday',
        price: 110,
        imageUrl: null,
        icon: PenTool,
        iconColor: '#667eea',
        backgroundColor: '#EBF4FF',
        isAIPick: true,
      },
      {
        id: 'office-3',
        label: 'Polished Essential',
        subtext: 'Daily office staple',
        price: 150,
        imageUrl: null,
        icon: Shirt,
        iconColor: '#4299e1',
        backgroundColor: '#EBF8FF',
        isAIPick: false,
      },
      {
        id: 'office-4',
        label: 'Business Casual Midi',
        subtext: 'Client presentation',
        price: 195,
        imageUrl: null,
        icon: Calendar,
        iconColor: '#718096',
        backgroundColor: '#F7FAFC',
        isAIPick: false,
      },
    ],
  },

  {
    id: 'girls-night',
    title: "Girls' Night Out",
    status: 'ideation',
    statusColor: '#F5A5B8',
    statusLabel: 'Ideation Stage',
    closetUrl: '/browse',
    outfits: [
      {
        id: 'girls-night-1',
        label: 'Cocktail Hour Sparkle',
        subtext: 'Rooftop bar glam',
        price: 175,
        imageUrl: null,
        icon: Music,
        iconColor: '#F5A5B8',
        backgroundColor: '#FFF5F7',
        isAIPick: true,
      },
      {
        id: 'girls-night-2',
        label: 'Urban Edge Set',
        subtext: 'Club-ready outfit',
        price: 130,
        imageUrl: null,
        icon: PartyPopper,
        iconColor: '#805ad5',
        backgroundColor: '#FAF5FF',
        isAIPick: false,
      },
      {
        id: 'girls-night-3',
        label: "The 'It' Girl Midi",
        subtext: 'Dinner & dancing',
        price: 95,
        imageUrl: null,
        icon: Stars,
        iconColor: '#F59E0B',
        backgroundColor: '#FFFBEB',
        isAIPick: false,
      },
      {
        id: 'girls-night-4',
        label: 'After-Hours Chic',
        subtext: 'Late night lounge',
        price: 155,
        imageUrl: null,
        icon: Wine,
        iconColor: '#DC2626',
        backgroundColor: '#FEF2F2',
        isAIPick: false,
      },
    ],
  },
];

export default mockJourneys;
