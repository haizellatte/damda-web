import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#E8272D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 쇼핑백 몸통 */}
          <rect x="2" y="8" width="18" height="12" rx="3" fill="white" fillOpacity="0.92" />
          {/* 손잡이 */}
          <path
            d="M6.5 8V6.5C6.5 4.015 8.515 2 11 2C13.485 2 15.5 4.015 15.5 6.5V8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* 플러스 */}
          <line x1="11" y1="12" x2="11" y2="17" stroke="#E8272D" strokeWidth="2" strokeLinecap="round" />
          <line x1="8.5" y1="14.5" x2="13.5" y2="14.5" stroke="#E8272D" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
