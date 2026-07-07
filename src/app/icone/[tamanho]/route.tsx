import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

// Ícone do app gerado por código — /icone/192 e /icone/512
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tamanho: string }> }
) {
  const { tamanho } = await params;
  const t = tamanho === "512" ? 512 : 192;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
        }}
      >
        <div
          style={{
            fontSize: t * 0.55,
            fontWeight: 800,
            color: "#fff",
            display: "flex",
          }}
        >
          N
        </div>
      </div>
    ),
    { width: t, height: t }
  );
}
