import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "#E8272D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 쇼핑백 몸통 */}
          <rect x="14" y="46" width="92" height="62" rx="14" fill="white" fillOpacity="0.92" />
          {/* 손잡이 */}
          <path
            d="M38 46V32C38 18.745 48.745 8 62 8C75.255 8 86 18.745 86 32V46"
            stroke="white"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          {/* 플러스 */}
          <line x1="60" y1="65" x2="60" y2="92" stroke="#E8272D" strokeWidth="10" strokeLinecap="round" />
          <line x1="46" y1="78.5" x2="74" y2="78.5" stroke="#E8272D" strokeWidth="10" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
