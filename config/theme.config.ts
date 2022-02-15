import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { tailwindBeta, tailwindAlpha } from "@config/colors";

const chakraConfig: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const [alpha, beta] = [tailwindAlpha, tailwindBeta];

const themeConfig = {
  fonts: {
    heading: "Quicksand",
  },
  chakraConfig,
  colors: {
    sidebar: { bgLight: tailwindBeta.gray[900] },
    outlineColor: tailwindBeta.gray[700],
    item: {
      activeColor: tailwindBeta.gray[100],
      inactiveColor: tailwindBeta.gray[500],
      activeBg: tailwindBeta.gray[800],
    },
    body: {
      bgLight: "tobePut",
      bgDark: "tobePut",
    },
    alpha,
    beta,
  },
  shadows: {
    shade: {
      subtle: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
      primary:
        "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
      tailwind:
        "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;",
      tailwindWide:
        "rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;",
    },
  },
};

export const theme = extendTheme(themeConfig);
