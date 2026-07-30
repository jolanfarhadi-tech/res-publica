import { ImageResponse } from "next/og";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getOpenGraphPresentation } from "@/i18n/open-graph";

/**
 * Open Graph image — generated at build time for each locale, so
 * shared links (WhatsApp, LinkedIn, Telegram, …) show a branded
 * card with the localized tagline. No image files to maintain.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Res Publica";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const presentation = await getOpenGraphPresentation(
    isLocale(locale) ? (locale as Locale) : "de"
  );

  if (presentation.imageVariant === "neutral") {
    return new ImageResponse(<NeutralOpenGraphCard />, size);
  }

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
          {presentation.description}
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

function NeutralOpenGraphCard() {
  return (
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 112,
            height: 112,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            backgroundColor: "#FAFAF7",
            color: "#0F1B2D",
            fontSize: 42,
          }}
        >
          RP
        </div>
        <div style={{ display: "flex", fontSize: 64, letterSpacing: "0.18em" }}>
          RES<span style={{ color: "#B08D3E" }}>·</span>PUBLICA
        </div>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 64,
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 240,
            height: 8,
            backgroundColor: "#1E4FA3",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 96,
            height: 8,
            backgroundColor: "#B08D3E",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 48,
            height: 8,
            backgroundColor: "#4A8B84",
          }}
        />
      </div>
    </div>
  );
}
