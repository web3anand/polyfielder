const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="sport-icon">{children}</div>
);

export const AllIcon = () => (
  <IconWrapper>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2.5 0 5 3.6 5 9s-2.5 9-5 9" />
      <path d="M12 3c-2.5 0-5 3.6-5 9s2.5 9 5 9" />
      <path d="M3 12h18" />
      <path d="M5.5 6h13" />
      <path d="M5.5 18h13" />
    </svg>
  </IconWrapper>
);

export const NbaIcon = () => (
  <IconWrapper>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c-3 0-5.5 3.6-5.5 9s2.5 9 5.5 9" />
      <path d="M12 3c3 0 5.5 3.6 5.5 9s-2.5 9-5.5 9" />
      <path d="M3 12h18" />
      <path d="M5.5 7c2.2 1.5 4.7 2.3 6.5 2.3S16.8 8.5 18.5 7" />
      <path d="M5.5 17c2.2-1.5 4.7-2.3 6.5-2.3s4.8.8 6.5 2.3" />
    </svg>
  </IconWrapper>
);

export const NflIcon = () => (
  <IconWrapper>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3c-4.5 0-9 3.6-9 9s4.5 9 9 9 9-3.6 9-9-4.5-9-9-9Z" />
      <path d="M5 12h14" />
      <path d="m8.5 8.5 7 7" />
      <path d="m15.5 8.5-7 7" />
      <path d="M12 7v10" />
    </svg>
  </IconWrapper>
);

export const SoccerIcon = () => (
  <IconWrapper>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <polygon points="12 7 9 9 10 13 12 15 14 13 15 9" />
      <path d="m12 7 2-1" />
      <path d="m12 7-2-1" />
      <path d="m9 9-3-1" />
      <path d="m15 9 3-1" />
      <path d="m10 13-2.5 2" />
      <path d="m14 13 2.5 2" />
      <path d="m12 15v3" />
    </svg>
  </IconWrapper>
);

export const TennisIcon = () => (
  <IconWrapper>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 4a5.5 5.5 0 0 1 0 7.8l-5.7 5.7a2 2 0 0 1-2.8-2.8L14.2 9A5.5 5.5 0 1 0 17 4Z" />
      <path d="m12.5 15.5 4 4" />
      <circle cx="18.5" cy="5.5" r="1.5" />
      <path d="M13 4c-2 1.5-3.5 5.5 0 9" />
    </svg>
  </IconWrapper>
);

export const CricketIcon = () => (
  <IconWrapper>
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 6 8.5 8.5a2 2 0 0 1 0 2.8l-1.8 1.8a2 2 0 0 1-2.8 0L5 11" />
      <path d="m4 10 3-3" />
      <path d="M15 3l6 6" />
      <circle cx="7" cy="5" r="2" />
    </svg>
  </IconWrapper>
);
