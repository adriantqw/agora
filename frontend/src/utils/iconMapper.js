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
  Flame,
  Sun,
  TrendingUp,
  Zap,
  Coffee,
  Umbrella,
  Watch,
  Smartphone,
  Headphones,
  Star
} from 'lucide-react';

const iconMap = {
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
  Flame,
  Sun,
  TrendingUp,
  Zap,
  Coffee,
  Umbrella,
  Watch,
  Smartphone,
  Headphones,
  Star
};

export const getIconByName = (name) => {
  return iconMap[name] || Star; // Default to Star if not found
};
