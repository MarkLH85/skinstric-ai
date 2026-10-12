export const SKINSTRIC_FIGMA = {
  masterCanvas: "43:24125",

  screens: {
    landing: {
      id: "000",
      name: "Landing / Sophisticated skincare",
    },
    landingTransition: {
      id: "001",
      name: "Landing transition/state",
    },
    introduction: {
      id: "002",
      name: "To start analysis / Introduce Yourself",
    },
    nameEntry: {
      id: "003",
      name: "Name entry",
    },
    exit: {
      id: "004",
      name: "Exit / confirmation state",
    },
    imageChoice: {
      id: "005",
      name: "Camera / gallery selection",
    },
    cameraPermission: {
      id: "006",
      name: "Camera permission state",
    },
    cameraSetup: {
      id: "007",
      name: "Camera setup",
    },
    demographics: {
      id: "013",
      name: "Demographic overview",
    },
    demographicDetail: {
      id: "014",
      name: "Demographic detail / confidence results",
    },
  },

  rules: {
    explicitScreenStateMapping: true,
    preserveExistingApiFunctionality: true,
    reconstructUiAroundFigmaStates: true,
  },
} as const;

export type SkinstricFigmaScreen =
  (typeof SKINSTRIC_FIGMA.screens)[keyof typeof SKINSTRIC_FIGMA.screens]["id"];
