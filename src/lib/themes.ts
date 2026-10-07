export type ThemeGroup = 'DARK / DEVELOPER' | 'COLOR / EXPERIMENTAL' | 'LIGHT / PAPER'

export interface Theme {
  id: string
  name: string
  group: ThemeGroup
  background: string
  surface: string
  text: string
  muted: string
  border: string
  accent: string
  secondary: string
  ink: string
  glow: string
}

const dark = (id: string, name: string, background: string, surface: string, accent: string, secondary: string, muted: string, border: string, glow = '.08', group: ThemeGroup = 'DARK / DEVELOPER'): Theme => ({ id, name, group, background, surface, accent, secondary, muted, border, text: '#f0f0e8', ink: '#111310', glow })
const color = (id: string, name: string, background: string, surface: string, accent: string, secondary: string, muted: string, border: string, glow = '.1') => dark(id, name, background, surface, accent, secondary, muted, border, glow, 'COLOR / EXPERIMENTAL')
const light = (id: string, name: string, background: string, surface: string, text: string, accent: string, secondary: string, muted: string, border: string): Theme => ({ id, name, group: 'LIGHT / PAPER', background, surface, text, accent, secondary, muted, border, ink: '#ffffff', glow: '0' })

export const themes: Theme[] = [
  dark('sthelse', 'sthelse', '#111310', '#151811', '#d5f38c', '#a8b886', '#94978b', '#30342a'),
  dark('tokyo-night', 'Tokyo Night', '#1a1b26', '#24283b', '#7aa2f7', '#bb9af7', '#a9b1d6', '#414868'),
  dark('dracula', 'Dracula', '#282a36', '#343746', '#ff79c6', '#bd93f9', '#b8b9cf', '#54576b'),
  dark('gruvbox-dark', 'Gruvbox Dark', '#28201b', '#342b24', '#fabd2f', '#fe8019', '#bdae93', '#665c54', '.04'),
  dark('nord-dark', 'Nord Dark', '#2e3440', '#3b4252', '#88c0d0', '#81a1c1', '#b5c2d4', '#586577'),
  dark('catppuccin-mocha', 'Catppuccin Mocha', '#1e1e2e', '#313244', '#cba6f7', '#f5c2e7', '#bac2de', '#585b70'),
  dark('monokai', 'Monokai', '#272822', '#34352e', '#a6e22e', '#fd971f', '#c1c1ad', '#55564a'),
  dark('one-dark', 'One Dark', '#282c34', '#333842', '#61afef', '#56b6c2', '#abb2bf', '#535b68'),
  dark('solarized-dark', 'Solarized Dark', '#002b36', '#073642', '#e0b940', '#2aa198', '#a0b6b8', '#41616a'),
  dark('amoled', 'AMOLED', '#000000', '#090909', '#ffffff', '#aaaaaa', '#a8a8a8', '#333333', '0'),
  dark('matrix', 'Matrix', '#020805', '#07140b', '#79ff9c', '#21cc60', '#94b89e', '#254a31', '.12'),
  dark('hacker', 'Hacker', '#060906', '#0c160c', '#b3ff6b', '#62d84e', '#a0b896', '#354c2f'),
  color('cyberpunk', 'Cyberpunk', '#120e18', '#201726', '#faff45', '#ff49cb', '#c1b1cc', '#51415d', '.17'),
  color('synthwave', 'Synthwave', '#21132f', '#322040', '#ff7bdf', '#b09cff', '#c3abd3', '#624776', '.14'),
  color('vaporwave', 'Vaporwave', '#291d43', '#392b55', '#83efff', '#ff9ade', '#c8b5dd', '#66527f'),
  color('arcade', 'Arcade', '#111c30', '#1d2b44', '#ffb15d', '#8bf1ff', '#a5b5d1', '#405675'),
  color('ocean', 'Ocean', '#072531', '#113541', '#62e3d1', '#7ac7f5', '#9dbfc7', '#37616b'),
  color('forest', 'Forest', '#11291e', '#20382b', '#a0edbb', '#d1d88d', '#acc4ad', '#45614d'),
  color('midnight', 'Midnight', '#111b31', '#1e2944', '#bbacff', '#779fff', '#a9b2d1', '#445475'),
  color('aurora', 'Aurora', '#0c292b', '#183b3b', '#83efbe', '#c5a0f6', '#a6c4c2', '#3b6363'),
  color('ruby', 'Ruby', '#2a111c', '#3d202c', '#ffa09f', '#ffbdd0', '#cda7b4', '#714352'),
  color('indigo', 'Indigo', '#1b193b', '#2c2950', '#c4b5fd', '#9bb5ff', '#b8b3d5', '#545078'),
  color('coffee', 'Coffee', '#251b16', '#372920', '#efc18b', '#dbac98', '#c1afa0', '#645044', '.04'),
  color('slate', 'Slate', '#1c252c', '#2a353e', '#80e3f0', '#a7becd', '#b0bec9', '#4d606d'),
  light('paper', 'Paper', '#f4f1e9', '#fffdf7', '#25251f', '#33372c', '#b8bfa7', '#64665a', '#c9cbbd'),
  light('cream', 'Cream', '#f4ead6', '#fff6e6', '#392c21', '#6c472a', '#ba9973', '#77624b', '#d1bfa5'),
  light('daylight', 'Daylight', '#f5f8ff', '#ffffff', '#18283f', '#215bb0', '#6ba7dc', '#5a6e88', '#c8d5e8'),
  light('sunset', 'Sunset', '#fff0df', '#fff8ef', '#482a23', '#ac3f25', '#f09459', '#866454', '#e2c3ad'),
  light('rose', 'Rose', '#f9e9ee', '#fff6f8', '#492832', '#8b3652', '#d797ad', '#88616d', '#dfbfcb'),
  light('lavender', 'Lavender', '#eeeafa', '#f9f6ff', '#332849', '#6840a0', '#ae9ad7', '#746386', '#cec2e1'),
  light('sakura', 'Sakura', '#ffeef2', '#fff8fa', '#492730', '#ae3550', '#eb99b1', '#8b5d6a', '#edc3cd'),
  light('mint', 'Mint', '#e7f5ed', '#f5fff8', '#1e3b2d', '#226c48', '#88caaa', '#567764', '#b6d8c3'),
  light('ocean-light', 'Ocean Light', '#e7f3f8', '#f4fcff', '#203b47', '#176b7b', '#83bccc', '#557780', '#b6d3dc'),
  light('lemon', 'Lemon', '#faf4d6', '#fffbe9', '#3d3c22', '#666016', '#c2b353', '#7a754e', '#dcd399'),
  light('sky', 'Sky', '#e9f2ff', '#f7fbff', '#203454', '#2b508a', '#8caedd', '#5c7495', '#bed0e8'),
  light('vanilla', 'Vanilla', '#f8f3e8', '#fffdf6', '#41342a', '#7b5135', '#c5ae8d', '#7d6e5d', '#dbccb7'),
]

export function initialTheme(): string {
  try { const stored = localStorage.getItem('sthelse-theme'); return themes.some(theme => theme.id === stored) ? stored! : 'sthelse' } catch { return 'sthelse' }
}

export function applyTheme(id: string) {
  const theme = themes.find(item => item.id === id) || themes[0]
  const values = { bg: theme.background, surface: theme.surface, paper: theme.text, muted: theme.muted, dim: theme.muted, line: theme.border, acid: theme.accent, secondary: theme.secondary, ink: theme.ink, glow: theme.glow }
  Object.entries(values).forEach(([key, value]) => document.documentElement.style.setProperty(`--${key}`, value))
  document.documentElement.style.colorScheme = theme.group === 'LIGHT / PAPER' ? 'light' : 'dark'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.background)
  try { localStorage.setItem('sthelse-theme', theme.id) } catch {}
}
