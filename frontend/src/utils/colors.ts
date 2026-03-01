const PALETTE = [
  '#e53935', '#8e24aa', '#1e88e5', '#00897b',
  '#f4511e', '#039be5', '#33b679', '#7986cb',
]

export function userColor(username: string): string {
  let hash = 0
  for (const ch of username) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
  return PALETTE[hash % PALETTE.length]
}
