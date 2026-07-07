import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "NewPerks — Cartão fidelidade digital por QR code";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #09090b 0%, #1e1033 60%, #2e1065 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              borderRadius: 24,
              fontSize: 56,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            N
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, color: "#fff", display: "flex" }}>
            NewPerks
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 36,
            color: "#d4d4d8",
            display: "flex",
          }}
        >
          Cartão fidelidade digital por QR code
        </div>

        <div
          style={{
            marginTop: 16,
            fontSize: 26,
            color: "#a78bfa",
            display: "flex",
          }}
        >
          Sem app. Sem papel. Cliente escaneia, junta selos e volta.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)",
            display: "flex",
          }}
        />
      </div>
    ),
    size
  );
}
