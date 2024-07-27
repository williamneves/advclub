import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function Loader({ size = "md" }: {
  size?: "sm" | "md" | "lg"
}) {
  return <div className="flex flex-1 items-center justify-center">
    <Loader2 className={cn("h-10 w-10 animate-spin", size === "sm" && "h-5 w-5", size === "md" && "h-10 w-10", size === "lg" && "h-15 w-15")} />
  </div>
}