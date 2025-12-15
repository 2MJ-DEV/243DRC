import { ImageResponse } from "next/og";

export const alt = "243 DRC - Plateforme Open Source pour Développeurs Congolais";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: "linear-gradient(135deg, #007FFF 0%, #EFDA5B 50%, #CA3E4B 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: "bold",
              color: "white",
            }}
          >
            243
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          243 DRC
        </div>
        <div
          style={{
            fontSize: 32,
            textAlign: "center",
            opacity: 0.9,
            maxWidth: 900,
          }}
        >
          Plateforme Open Source pour Développeurs Congolais
        </div>
        <div
          style={{
            fontSize: 24,
            textAlign: "center",
            marginTop: 40,
            opacity: 0.8,
          }}
        >
          Découvrez, partagez et contribuez aux projets open-source
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

