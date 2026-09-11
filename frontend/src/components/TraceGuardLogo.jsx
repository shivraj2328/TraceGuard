import React from "react";

const TraceGuardLogo = ({
  width = 240,
  height = 65,
  animated = true,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 65"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TraceGuard Real-Time Telemetry"
      style={{ overflow: "visible" }}
      className={`select-none ${className}`}
      {...props}
    >
      <defs>

        {/* =================================
            BLUE / INDIGO GLOW
        ================================= */}

        <filter
          id="tgBlueGlow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
          filterUnits="userSpaceOnUse"
        >
          <feGaussianBlur
            stdDeviation="2.5"
            result="blur"
          />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>


        {/* =================================
            GREEN GLOW
        ================================= */}

        <filter
          id="tgGreenGlow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
          filterUnits="userSpaceOnUse"
        >
          <feGaussianBlur
            stdDeviation="2"
            result="blur"
          />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>


        {/* =================================
            CENTER RADIAL GLOW
        ================================= */}

        <radialGradient id="tgCenterGlow">
          <stop
            offset="0%"
            stopColor="#00E89C"
            stopOpacity="0.8"
          />

          <stop
            offset="45%"
            stopColor="#00E89C"
            stopOpacity="0.25"
          />

          <stop
            offset="100%"
            stopColor="#00E89C"
            stopOpacity="0"
          />
        </radialGradient>


        {/* =================================
            ENDPOINT GLOW
        ================================= */}

        <radialGradient id="tgNodeGlow">
          <stop
            offset="0%"
            stopColor="#00E89C"
            stopOpacity="0.45"
          />

          <stop
            offset="45%"
            stopColor="#00E89C"
            stopOpacity="0.18"
          />

          <stop
            offset="100%"
            stopColor="#00E89C"
            stopOpacity="0"
          />
        </radialGradient>


        {/* =================================
            ANIMATIONS
        ================================= */}

        {animated && (
          <style>
            {`
              .tg-hex {
                animation: tgHexPulse 2.5s ease-in-out infinite;
                transform-origin: 32px 32px;
              }

              .tg-center {
                animation: tgCenterPulse 1.7s ease-in-out infinite;
                transform-origin: 32px 32px;
              }

              .tg-network {
                animation: tgNetworkPulse 2s ease-in-out infinite;
              }

              .tg-node {
                animation: tgNodePulse 1.8s ease-in-out infinite;
              }

              .tg-node-glow {
                animation: tgNodeGlowPulse 1.8s ease-in-out infinite;
              }

              .tg-scan {
                stroke-dasharray: 5 7;
                animation: tgScan 1.8s linear infinite;
              }

              @keyframes tgHexPulse {
                0%, 100% {
                  opacity: 0.8;
                  filter: drop-shadow(0 0 3px #635BFF);
                }

                50% {
                  opacity: 1;
                  filter: drop-shadow(0 0 7px #635BFF);
                }
              }

              @keyframes tgCenterPulse {
                0%, 100% {
                  transform: scale(0.9);
                }

                50% {
                  transform: scale(1.08);
                }
              }

              @keyframes tgNetworkPulse {
                0%, 100% {
                  opacity: 0.75;
                }

                50% {
                  opacity: 1;
                }
              }

              @keyframes tgNodePulse {
                0%, 100% {
                  opacity: 0.65;
                }

                50% {
                  opacity: 1;
                }
              }

              @keyframes tgNodeGlowPulse {
                0%, 100% {
                  opacity: 0.35;
                  transform: scale(0.85);
                }

                50% {
                  opacity: 0.7;
                  transform: scale(1.15);
                }
              }

              @keyframes tgScan {
                from {
                  stroke-dashoffset: 0;
                }

                to {
                  stroke-dashoffset: -24;
                }
              }
            `}
          </style>
        )}

      </defs>


      {/* =================================
          HEXAGON ICON
      ================================= */}

      <g className={animated ? "tg-hex" : ""}>

        <polygon
          points="
            32,4
            57,18
            57,46
            32,60
            7,46
            7,18
          "
          fill="none"
          stroke="#635BFF"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#tgBlueGlow)"
        />

        <polygon
          points="
            32,7
            54,19.5
            54,44.5
            32,57
            10,44.5
            10,19.5
          "
          fill="none"
          stroke="#4F46E5"
          strokeWidth="0.5"
          opacity="0.35"
        />

      </g>


      {/* =================================
          TELEMETRY CONNECTIONS
      ================================= */}

      <g
        className={animated ? "tg-network" : ""}
        stroke="#00E89C"
        strokeWidth="1.5"
        strokeLinecap="round"
        filter="url(#tgGreenGlow)"
      >

        <line
          x1="32"
          y1="32"
          x2="32"
          y2="10"
        />

        <line
          x1="32"
          y1="32"
          x2="13"
          y2="43"
        />

        <line
          x1="32"
          y1="32"
          x2="51"
          y2="43"
        />

      </g>


      {/* =================================
          ANIMATED TELEMETRY SCAN
      ================================= */}

      {animated && (
        <g
          className="tg-scan"
          stroke="#6AFFC9"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        >

          <line
            x1="32"
            y1="32"
            x2="32"
            y2="10"
          />

          <line
            x1="32"
            y1="32"
            x2="13"
            y2="43"
          />

          <line
            x1="32"
            y1="32"
            x2="51"
            y2="43"
          />

        </g>
      )}


      {/* =================================
          CENTER GLOW
      ================================= */}

      <circle
        cx="32"
        cy="32"
        r="14"
        fill="url(#tgCenterGlow)"
      />


      {/* =================================
          CENTER NODE
      ================================= */}

      <g
        className={animated ? "tg-center" : ""}
      >

        <circle
          cx="32"
          cy="32"
          r="4.5"
          fill="#00DFA0"
          filter="url(#tgGreenGlow)"
        />

        <circle
          cx="32"
          cy="32"
          r="6.5"
          fill="none"
          stroke="#00E89C"
          strokeWidth="0.7"
          opacity="0.5"
        />

      </g>


      {/* =================================
          TOP ENDPOINT
          NO SVG FILTER — CLEAN CIRCULAR GLOW
      ================================= */}

      <g>

        {/* Soft circular glow */}
        <circle
          cx="32"
          cy="10"
          r="5"
          fill="url(#tgNodeGlow)"
          className={animated ? "tg-node-glow" : ""}
          style={{
            transformOrigin: "32px 10px",
          }}
        />

        {/* Outer ring */}
        <circle
          cx="32"
          cy="10"
          r="2"
          fill="#0B1724"
          stroke="#00E89C"
          strokeWidth="1"
          className={animated ? "tg-node" : ""}
        />

        {/* Center dot */}
        <circle
          cx="32"
          cy="10"
          r="0.7"
          fill="#00E89C"
        />

      </g>


      {/* =================================
          LEFT ENDPOINT
          NO SVG FILTER — CLEAN CIRCULAR GLOW
      ================================= */}

      <g>

        {/* Soft circular glow */}
        <circle
          cx="13"
          cy="43"
          r="5"
          fill="url(#tgNodeGlow)"
          className={animated ? "tg-node-glow" : ""}
          style={{
            transformOrigin: "13px 43px",
          }}
        />

        {/* Outer ring */}
        <circle
          cx="13"
          cy="43"
          r="2"
          fill="#0B1724"
          stroke="#00E89C"
          strokeWidth="1"
          className={animated ? "tg-node" : ""}
        />

        {/* Center dot */}
        <circle
          cx="13"
          cy="43"
          r="0.7"
          fill="#00E89C"
        />

      </g>


      {/* =================================
          RIGHT ENDPOINT
          NO SVG FILTER — CLEAN CIRCULAR GLOW
      ================================= */}

      <g>

        {/* Soft circular glow */}
        <circle
          cx="51"
          cy="43"
          r="5"
          fill="url(#tgNodeGlow)"
          className={animated ? "tg-node-glow" : ""}
          style={{
            transformOrigin: "51px 43px",
          }}
        />

        {/* Outer ring */}
        <circle
          cx="51"
          cy="43"
          r="2"
          fill="#0B1724"
          stroke="#00E89C"
          strokeWidth="1"
          className={animated ? "tg-node" : ""}
        />

        {/* Center dot */}
        <circle
          cx="51"
          cy="43"
          r="0.7"
          fill="#00E89C"
        />

      </g>


      {/* =================================
          TEXT
      ================================= */}

      <text
        x="68"
        y="31"
        fill="#F5F7FF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="16"
        fontWeight="700"
        letterSpacing="-0.4"
      >
        TRACEGUARD
      </text>


      {/* =================================
          TAGLINE
      ================================= */}

      <text
        x="69"
        y="44"
        fill="#00DFA0"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="6"
        fontWeight="600"
        letterSpacing="0.35"
      >
        REAL-TIME TELEMETRY
      </text>

    </svg>
  );
};

export default TraceGuardLogo;