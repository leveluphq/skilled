import company from 'style/company';

export const NAV_HEIGHT = 56;
export const FOCUS_WIDTH = 2;
export const HIGHLIGHT_COLOR = '#fff300';
export const CTA_CREEN = '#30a84f';

const zIndex = {
  z1: 100,
  z2: 200,
  z3: 300,
  z4: 400,
  z5: 500,
  z6: 600,
  z7: 700,
  z8: 800,
  z9: 900,
  z10: 1000,
  nav: 900,
  modal: 1000,
};

const spacing = {
  gutter: 20,
  navHeight: NAV_HEIGHT,
  verticalPagePad: 32,
};

export enum BasePalette {
  Brand = '#EED639',
  Red = '#FF695E',
  Orange = '#FF851B',
  Yellow = '#FFE21F',
  Green = '#2ECC40',
  Teal = '#19A69E',
  SkyBlue = '#54C8FF',
  Blue = '#2185D0',
  Violet = '#806de4',
  Purple = '#DC73FF',
  Pink = '#FF8EDF',
  Brown = '#D67C1C',
  Black = '#000000',
  White = '#FFFFFF',
  Gray = '#BFBEBE',
  Button = '#0069ed',
  ButtonHover = '#0053ba',
}
export const COLOR_BRAND = BasePalette.Brand;

// NOTE: Inspired by discord app
export const DarkPalette = {
  Black0: '#000000',
  Black1: '#040405',
  Black2: '#18191C',
  Black3: '#202225',
  Black4: '#36393F',
  Black5: '#4F545C',
  Black6: '#72767D',
  Black7: '#B9BBBE',
  Black8: '#DCDDDE',
  Black9: '#F6F6F7',
  Black10: '#FFFFFF',
};

export enum ScrollerPalette {
  Introduction = BasePalette.Blue,
  Validation = BasePalette.Red,
  Explanation = BasePalette.Violet,
  Solution = BasePalette.Green,
  Progress = BasePalette.Orange,
}

export interface ColorType {
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundDistinct: string;
  navBackground: string;
  dropdownBackground: string;
  paper: string;
  tileBorder: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  inverted: string;
  invertedSecondary: string;
  brand: string;
  cta: string;
  error: string;
  border: string;
  overlay: string;
  focus: string;
  buttonPrimary: string;
  buttonHover: string;
  buttonOutline: string;
  alert: string;
  alertHover: string;
  highlight: string;
  basePalette: typeof BasePalette;
  blackPalette: typeof DarkPalette;
}

export interface ThemeType {
  color: ColorType;
  focus: string;
  spacing: typeof spacing;
  zIndex: typeof zIndex;
  company: typeof company;
  shadow: {
    stroke: string;
    low: string;
    medium: string;
    high: string;
  };
}

export const themeDark: ThemeType = {
  color: {
    backgroundPrimary: DarkPalette.Black2,
    backgroundSecondary: DarkPalette.Black3,
    backgroundDistinct: DarkPalette.Black1,
    paper: DarkPalette.Black3,
    navBackground: DarkPalette.Black4,
    dropdownBackground: DarkPalette.Black1,
    tileBorder: '#272727',
    textPrimary: '#FFFFFF',
    textSecondary: '#B9BBBE',
    textLight: '#9f9f9f',
    inverted: DarkPalette.Black10,
    invertedSecondary: DarkPalette.Black9,
    brand: BasePalette.Brand,
    cta: CTA_CREEN,
    error: BasePalette.Red,
    border: DarkPalette.Black4,
    overlay: '#000000',
    focus: BasePalette.White,
    buttonPrimary: BasePalette.Button,
    buttonHover: BasePalette.ButtonHover,
    buttonOutline: BasePalette.White,
    alert: '#f14c4e',
    alertHover: '#ed1d1f',
    highlight: HIGHLIGHT_COLOR,
    basePalette: BasePalette,
    blackPalette: DarkPalette,
  },
  focus: `${FOCUS_WIDTH}px solid ${BasePalette.White}`,
  spacing,
  zIndex,
  company,
  shadow: {
    stroke: '0 0 0 1px rgba(6,6,7,0.08)',
    low: '0 1px 0 rgba(6,6,7,0.1),0 1.5px 0 rgba(6,6,7,0.1),0 2px 0 rgba(6,6,7,0.1)',
    medium: '0 4px 4px rgba(0,0,0,0.18)',
    high: '0 8px 16px rgba(0,0,0,0.26)',
  },
};

export const themeLight: ThemeType = {
  color: {
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#E9EBEE',
    backgroundDistinct: '#393C3E',
    paper: '#FFFFFF',
    navBackground: '#FFFFFF',
    dropdownBackground: '#FFFFFF',
    tileBorder: '#272727',
    textPrimary: 'rgba(0, 0, 0, 0.65)',
    textSecondary: '#555555',
    textLight: '#9f9f9f',
    inverted: '#000000',
    invertedSecondary: '#000000',
    brand: BasePalette.Brand,
    cta: CTA_CREEN,
    error: BasePalette.Red,
    border: '#C1C0C0',
    overlay: '#FFFFFF',
    focus: BasePalette.White,
    buttonPrimary: BasePalette.Button,
    buttonHover: BasePalette.ButtonHover,
    buttonOutline: BasePalette.Brand,
    alert: '#f14c4e',
    alertHover: '#ed1d1f',
    highlight: HIGHLIGHT_COLOR,
    basePalette: BasePalette,
    blackPalette: DarkPalette,
  },
  focus: `${FOCUS_WIDTH}px solid ${BasePalette.White}`,
  spacing,
  zIndex,
  company,
  shadow: {
    stroke: '0 0 0 1px rgba(6,6,7,0.08)',
    low: '0 1px 0 rgba(6,6,7,0.1),0 1.5px 0 rgba(6,6,7,0.025),0 2px 0 rgba(6,6,7,0.025)',
    medium: '0 4px 4px rgba(0,0,0,0.08)',
    high: '0 8px 16px rgba(0,0,0,0.16)',
  },
};

export enum ThemeNames {
  Dark = 'DARK',
  Light = 'LIGHT',
}

export const themeMap = {
  [ThemeNames.Dark]: themeDark,
  [ThemeNames.Light]: themeLight,
};
