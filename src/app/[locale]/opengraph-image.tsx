import { ImageResponse } from "next/og";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

/**
 * Open Graph image — generated at build time for each locale, so
 * shared links (WhatsApp, LinkedIn, Telegram, …) show a branded
 * card with the localized tagline. No image files to maintain.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Res Publica";

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? (locale as Locale) : "de");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0F1B2D",
          color: "#FAFAF7",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 64, letterSpacing: "0.18em" }}>
          RES<span style={{ color: "#B08D3E" }}>·</span>PUBLICA
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 30,
            color: "#93A0B4",
            maxWidth: 900,
          }}
        >
          {dict.meta.description}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            width: 96,
            height: 6,
            backgroundColor: "#1E4FA3",
          }}
        />
      </div>
    ),
    size
  );
}
