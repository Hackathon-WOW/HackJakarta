import { cn } from "@/lib/utils";

// Original Grow logo artwork (public/logo.svg) rendered via CSS mask so the
// exact shape is preserved while the color adapts to light/dark surfaces.
const ASPECT = 171 / 89; // logo.svg viewBox ratio

export function Logo({ className, tone = "dark", size = "md" }) {
  const height = size === "lg" ? 42 : size === "sm" ? 26 : 34;
  const color = tone === "light" ? "#FBF8F1" : "#15241C";
  return (
    <span
      role="img"
      aria-label="Grow"
      className={cn("inline-block align-middle", className)}
      style={{
        height,
        width: Math.round(height * ASPECT),
        backgroundColor: color,
        WebkitMaskImage: "url(/logo.svg)",
        maskImage: "url(/logo.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
    />
  );
}
