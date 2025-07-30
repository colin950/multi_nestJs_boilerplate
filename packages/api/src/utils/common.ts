export const DAY_MS = 24 * 60 * 60 * 1000

export function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}
