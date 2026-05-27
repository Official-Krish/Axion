export function AxionLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="16" fill="#0B0B18" />
      <ellipse
        cx="16"
        cy="16"
        rx="10"
        ry="4.5"
        fill="none"
        stroke="#6366F1"
        strokeWidth="1"
        transform="rotate(-20 16 16)"
        opacity="0.7"
      />
      <path d="M16 5 L21.5 19 L16 15.5 L10.5 19 Z" fill="url(#a)" />
      <circle cx="16" cy="16" r="1.8" fill="#A5B4FC" />
      <circle cx="16" cy="5" r="1.2" fill="#818CF8" opacity="0.9" />
    </svg>
  );
}

export function AxionWordmark({ height = 32 }: { height?: number }) {
  const aspect = 260 / 52;
  return (
    <svg
      width={height * aspect}
      height={height}
      viewBox="0 0 260 52"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="wg2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <ellipse
        cx="26"
        cy="26"
        rx="20"
        ry="20"
        fill="none"
        stroke="url(#wg2)"
        strokeWidth="0.8"
      />
      <ellipse
        cx="26"
        cy="26"
        rx="14"
        ry="6"
        fill="none"
        stroke="url(#wg1)"
        strokeWidth="1.2"
        transform="rotate(-20 26 26)"
      />
      <path d="M26 8 L34 30 L26 25 L18 30 Z" fill="url(#wg1)" opacity="0.95" />
      <path d="M26 8 L34 30 L26 25 Z" fill="#38BDF8" opacity="0.28" />
      <circle cx="26" cy="26" r="2.2" fill="#A5B4FC" />
      <circle cx="26" cy="8" r="1.5" fill="#818CF8" opacity="0.85" />
      <text
        x="62"
        y="33"
        fontFamily="'Inter', system-ui, sans-serif"
        fontSize="24"
        fontWeight="600"
        letterSpacing="-0.4"
        fill="white"
      >
        Axion
      </text>
    </svg>
  );
}
