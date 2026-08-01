// Design System - Enterprise-grade spacing, typography, and styling standards

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
  '4xl': '48px',
  '5xl': '56px',
  '6xl': '64px',
};

export const typography = {
  // Page titles
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '36px',
    letterSpacing: '-0.5px',
  },

  // Section headings
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    lineHeight: '28px',
    letterSpacing: '-0.3px',
  },

  // Card titles / conversation names
  cardTitle: {
    fontSize: '15px',
    fontWeight: '600',
    lineHeight: '22px',
  },

  // Body text (primary)
  body: {
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
  },

  // Small text (secondary/tertiary)
  small: {
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '16px',
  },

  // Captions/labels
  caption: {
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '14px',
    letterSpacing: '0.3px',
  },

  // Button text
  button: {
    fontSize: '13px',
    fontWeight: '600',
    lineHeight: '16px',
  },
};

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.04)',
  md: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  lg: '0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  xl: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
};

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};
