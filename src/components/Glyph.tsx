import { IconKey } from "@/data/categories";
import * as Icons from "./icons";

const map: Record<IconKey, (p: any) => JSX.Element> = {
  Droplet: Icons.Droplet,
  Jar: Icons.Jar,
  Mask: Icons.Mask,
  Cleanser: Icons.Cleanser,
  Lipstick: Icons.Lipstick,
  Device: Icons.Device,
  Man: Icons.Man,
  Woman: Icons.Woman,
  Leaf: Icons.Leaf,
  Pill: Icons.Pill,
  Eye: Icons.Eye,
  Scale: Icons.Scale,
  Tea: Icons.Tea,
  Sparkle: Icons.Sparkle,
  Shield: Icons.Shield,
  HealthHeart: Icons.HealthHeart,
  Bone: Icons.Bone,
  Stomach: Icons.Stomach,
};

export function Glyph({ name, ...props }: { name: IconKey } & React.SVGProps<SVGSVGElement> & { size?: number }) {
  const Cmp = map[name] ?? Icons.Sparkle;
  return <Cmp {...props} />;
}
