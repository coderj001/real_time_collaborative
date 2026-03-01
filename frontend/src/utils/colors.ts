const PALETTE = [
  '#ff3131', '#ffb000', '#00ffff', '#ff00ff',
  '#ff6600', '#00ff41', '#ff9500', '#ff69b4',
]

export function userColor(username: string): string {
  let hash = 0
  for (const ch of username) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
  return PALETTE[hash % PALETTE.length]
}
