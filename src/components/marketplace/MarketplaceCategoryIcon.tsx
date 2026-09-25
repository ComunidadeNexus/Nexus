import {
  Gamepad2,
  Share2,
  Gift,
  MessageSquare,
  Crown,
  Mail,
  Monitor,
  Sparkles,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { MarketplaceCategory } from "@/lib/marketplace";

const ICONS: Record<string, LucideIcon> = {
  Gamepad2,
  Share2,
  Gift,
  MessageSquare,
  Crown,
  Mail,
  Monitor,
  Sparkles,
  GraduationCap,
};

export function MarketplaceCategoryIcon({
  name,
  className,
}: {
  name: MarketplaceCategory["icon"];
  className?: string;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} />;
}
