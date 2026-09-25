export type AppColors = {
  background: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryButton: string;
  primaryPressed: string;
  primarySoft: string;
  emergency: string;
  emergencyForeground: string;
  emergencyPressed: string;
  emergencySoft: string;
  border: string;
  focus: string;
  success: string;
  scrim: string;
};

export const lightColors: AppColors = {
  background: "#F7F8F8",
  surface: "#FFFFFF",
  surfaceRaised: "#EEF2F1",
  text: "#172525",
  textMuted: "#5D6B6B",
  primary: "#176B65",
  primaryButton: "#176B65",
  primaryPressed: "#10514C",
  primarySoft: "#E4F0EE",
  emergency: "#B3261E",
  emergencyForeground: "#A8201A",
  emergencyPressed: "#8C1D18",
  emergencySoft: "#FCEBE9",
  border: "#D7DEDD",
  focus: "#F2B705",
  success: "#277B52",
  scrim: "#E9ECEB",
};

export const darkColors: AppColors = {
  background: "#101616",
  surface: "#182020",
  surfaceRaised: "#232C2B",
  text: "#F1F5F4",
  textMuted: "#A9B5B3",
  primary: "#76CFC5",
  primaryButton: "#267B73",
  primaryPressed: "#1D625C",
  primarySoft: "#203936",
  emergency: "#C43A31",
  emergencyForeground: "#FFB4AC",
  emergencyPressed: "#9E2D27",
  emergencySoft: "#3A2220",
  border: "#35403F",
  focus: "#FFD45A",
  success: "#6DCEA0",
  scrim: "#252D2D",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const typography = {
  hero: 30,
  title: 24,
  heading: 18,
  body: 16,
  label: 14,
  caption: 12,
} as const;

export const minimumTouchTarget = 56;
