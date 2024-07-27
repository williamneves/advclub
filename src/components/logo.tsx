import Link from "next/link";
import Image from "next/image";
import LOGO from "@/assets/images/LOGO-BLUE-CROSS.png";
import { cn } from "@/lib/utils";

export function Logo({ withBorder = true }: { withBorder?: boolean }) {
  return (
    <div
      className={cn("flex h-14 items-center px-4 lg:h-[60px] lg:px-6", {
        "border-b": withBorder,
      })}
    >
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Image
          src={LOGO}
          priority
          alt="BT Adventurer Club"
          className="size-10 lg:size-12"
        />
        <span className="text-lg font-bold">Adv-Club</span>
      </Link>
    </div>
  );
}
