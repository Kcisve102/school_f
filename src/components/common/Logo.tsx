import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * Brand logomark: a gear with an AI signal path cut through it.
 * Industrial (gear = factory) + intelligent (circuit node = AI learning).
 * Uses accent color tokens — adapts to light/dark theme automatically.
 */
export const LogoMark: React.FC<LogoMarkProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Gear body */}
      <path
        d="
          M16 2
          L17.8 5.2
          L21.2 4.4
          L22 7.8
          L25.4 8.6
          L24.6 12
          L27.8 13.8
          L26 16
          L27.8 18.2
          L24.6 20
          L25.4 23.4
          L22 24.2
          L21.2 27.6
          L17.8 26.8
          L16 30
          L14.2 26.8
          L10.8 27.6
          L10 24.2
          L6.6 23.4
          L7.4 20
          L4.2 18.2
          L6 16
          L4.2 13.8
          L7.4 12
          L6.6 8.6
          L10 7.8
          L10.8 4.4
          L14.2 5.2
          Z
        "
        fill="var(--color-accent)"
        opacity="0.15"
      />
      <path
        d="
          M16 2
          L17.8 5.2
          L21.2 4.4
          L22 7.8
          L25.4 8.6
          L24.6 12
          L27.8 13.8
          L26 16
          L27.8 18.2
          L24.6 20
          L25.4 23.4
          L22 24.2
          L21.2 27.6
          L17.8 26.8
          L16 30
          L14.2 26.8
          L10.8 27.6
          L10 24.2
          L6.6 23.4
          L7.4 20
          L4.2 18.2
          L6 16
          L4.2 13.8
          L7.4 12
          L6.6 8.6
          L10 7.8
          L10.8 4.4
          L14.2 5.2
          Z
        "
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Inner gear hole */}
      <circle
        cx="16"
        cy="16"
        r="5.5"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        fill="var(--color-accent)"
        opacity="0"
      />
      <circle
        cx="16"
        cy="16"
        r="5.5"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* AI signal path — horizontal line with nodes through the gear center */}
      {/* Left segment */}
      <line
        x1="7"
        y1="16"
        x2="11.5"
        y2="16"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Right segment */}
      <line
        x1="20.5"
        y1="16"
        x2="25"
        y2="16"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Center node — filled circle at gear center */}
      <circle
        cx="16"
        cy="16"
        r="2"
        fill="var(--color-accent)"
      />
      {/* Left node dot */}
      <circle
        cx="11.5"
        cy="16"
        r="1.2"
        fill="var(--color-accent)"
        opacity="0.7"
      />
      {/* Right node dot */}
      <circle
        cx="20.5"
        cy="16"
        r="1.2"
        fill="var(--color-accent)"
        opacity="0.7"
      />
      {/* Small upward tick from center — signal pulse */}
      <polyline
        points="13.5,16 14.5,13 17.5,19 18.5,16"
        stroke="var(--color-accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default LogoMark;
