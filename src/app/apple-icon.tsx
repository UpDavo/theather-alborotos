import { ImageResponse } from "next/og";

export const dynamic = "force-static";
import { AppIcon } from "@/lib/app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS redondea las esquinas solo: el fondo va a sangre.
export default function AppleIcon() {
  return new ImageResponse(<AppIcon size={180} />, size);
}
