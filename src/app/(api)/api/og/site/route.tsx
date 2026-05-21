import { ImageResponse } from "next/og";
import { getPageOg } from "@/lib/og-pages";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("page") ?? "";
  const meta = getPageOg(key);
  if (!meta) {
    return new Response("Unknown page", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "#050505" }} />
          <div style={{ position: "absolute", top: -200, left: -200, width: 800, height: 800, borderRadius: "400px", background: "rgba(247, 147, 26, 0.08)", filter: "blur(100px)" }} />
          <div style={{ position: "absolute", bottom: -200, right: -200, width: 800, height: 800, borderRadius: "400px", background: "rgba(138, 43, 226, 0.08)", filter: "blur(100px)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10, padding: "0 60px" }}>
          {/* Logo + Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
            <img
              src="https://tiphive.xyz/logo.png"
              alt="TipHive Logo"
              style={{ height: "56px", objectFit: "contain" }}
            />
            <span style={{ fontSize: "36px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
              TipHive
            </span>
          </div>

          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(247, 147, 26, 0.4)",
              background: "rgba(247, 147, 26, 0.08)",
              fontSize: "20px",
              fontWeight: 600,
              color: "#F7931A",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            {meta.eyebrow}
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "22px" }}>
            <span style={{ fontSize: "78px", fontWeight: 900, color: "white", lineHeight: 1.0, letterSpacing: "-0.04em", textAlign: "center", textTransform: "uppercase" }}>
              {meta.headlineTop}
            </span>
            <span style={{ fontSize: "78px", fontWeight: 900, color: "#F7931A", lineHeight: 1.0, letterSpacing: "-0.04em", textAlign: "center", textTransform: "uppercase" }}>
              {meta.headlineBottom}
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "26px",
              color: "#94A3B8",
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: 1.4,
              fontWeight: 500,
              marginBottom: "30px",
            }}
          >
            {meta.tagline}
          </div>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "18px 44px",
              borderRadius: "999px",
              background: "linear-gradient(90deg, #F7931A 0%, #8A2BE2 100%)",
              fontSize: "28px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "0.02em",
              boxShadow: "0 12px 40px rgba(247, 147, 26, 0.35)",
            }}
          >
            {meta.cta}
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "8px", background: "linear-gradient(to right, #F7931A, #8A2BE2)" }} />
      </div>
    ),
    {
      ...SIZE,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
