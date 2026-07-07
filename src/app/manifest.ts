import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NewPerks — Cartão Fidelidade",
    short_name: "NewPerks",
    description: "Seu cartão fidelidade digital. Junte selos e ganhe recompensas.",
    // Sem start_url: o navegador usa a página que o usuário instalou —
    // o cliente que instala o cartão dele volta direto pro cartão dele.
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icone/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icone/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
