export const SKINSTRIC = {
  colors: {
    background: "#fcfcfc",
    foreground: "#1a1b1c",
    muted: "#d9d9d9",
    mutedLight: "#e7e7e7",
  },

  screens: {
    landing: "000",
    landingTransition: "001",
    introduction: "002",
    name: "003",
    exit: "004",
    imageChoice: "005",
    cameraPermission: "006",
    cameraSetup: "007",
    demographics: "013",
    demographicDetail: "014",
  },
} as const;

export type SkinstricScreen =
  | "000"
  | "001"
  | "002"
  | "003"
  | "004"
  | "005"
  | "006"
  | "007"
  | "analysis"
  | "013"
  | "014";
