export interface ThemeConfig {
  name: string
  key: string
  colors: {
    primary: string
    primaryForeground: string
    accent: string
    accentForeground: string
  }
  preview: string // CSS gradient for preview
}

export const themes: ThemeConfig[] = [
  {
    name: 'Banana',
    key: 'banana',
    colors: {
      primary: 'oklch(0.85 0.18 90)',
      primaryForeground: 'oklch(0.2 0.02 90)',
      accent: 'oklch(0.3 0.1 140)',
      accentForeground: 'oklch(0.98 0.01 90)',
    },
    preview: 'linear-gradient(135deg, #FFE135 0%, #228B22 100%)',
  },
  {
    name: 'Ocean',
    key: 'ocean',
    colors: {
      primary: 'oklch(0.55 0.22 250)',
      primaryForeground: 'oklch(0.98 0.01 90)',
      accent: 'oklch(0.45 0.18 200)',
      accentForeground: 'oklch(0.98 0.01 90)',
    },
    preview: 'linear-gradient(135deg, #4F86F7 0%, #3B82F6 100%)',
  },
  {
    name: 'Forest',
    key: 'forest',
    colors: {
      primary: 'oklch(0.5 0.18 145)',
      primaryForeground: 'oklch(0.98 0.01 90)',
      accent: 'oklch(0.4 0.15 170)',
      accentForeground: 'oklch(0.98 0.01 90)',
    },
    preview: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
  },
  {
    name: 'Berry',
    key: 'berry',
    colors: {
      primary: 'oklch(0.6 0.2 330)',
      primaryForeground: 'oklch(0.98 0.01 90)',
      accent: 'oklch(0.5 0.18 300)',
      accentForeground: 'oklch(0.98 0.01 90)',
    },
    preview: 'linear-gradient(135deg, #EC4899 0%, #D946EF 100%)',
  },
  {
    name: 'Sunset',
    key: 'sunset',
    colors: {
      primary: 'oklch(0.7 0.2 45)',
      primaryForeground: 'oklch(0.2 0.02 90)',
      accent: 'oklch(0.6 0.18 25)',
      accentForeground: 'oklch(0.98 0.01 90)',
    },
    preview: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
  },
  {
    name: 'Lavender',
    key: 'lavender',
    colors: {
      primary: 'oklch(0.75 0.15 280)',
      primaryForeground: 'oklch(0.2 0.02 90)',
      accent: 'oklch(0.65 0.18 260)',
      accentForeground: 'oklch(0.98 0.01 90)',
    },
    preview: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
  },
  {
    name: 'Mint',
    key: 'mint',
    colors: {
      primary: 'oklch(0.75 0.15 160)',
      primaryForeground: 'oklch(0.2 0.02 90)',
      accent: 'oklch(0.4 0.18 140)',
      accentForeground: 'oklch(0.98 0.01 90)',
    },
    preview: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
  },
  {
    name: 'Rose',
    key: 'rose',
    colors: {
      primary: 'oklch(0.65 0.2 20)',
      primaryForeground: 'oklch(0.98 0.01 90)',
      accent: 'oklch(0.55 0.18 350)',
      accentForeground: 'oklch(0.98 0.01 90)',
    },
    preview: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)',
  },
]

export const defaultTheme = themes[0]

export function getThemeByKey(key: string): ThemeConfig {
  return themes.find(theme => theme.key === key) || defaultTheme
}
