/**
 * Common helper functions
 */

/**
 * Euclidean distance
 */
export const dist = (a, b) => {
  const x = a[0] - b[0]
  const y = a[1] - b[1]
  return Math.sqrt(x * x + y * y)
}

/**
 * Check collision with previous points
 */
export const collision = (previous, point, r) =>
  previous.map((co) => dist(co, point) > r).includes(false)

/**
 * Check if point is inside circle
 */
export const inCircle = (point, circle, r) => {
  const x = point.x - circle.x
  const y = point.y - circle.y
  return x * x + y * y < r * r
}

/**
 * Round float number
 */
export const round = (n, decimals) => Math.round(n * decimals) / decimals

/**
 * Fisher-Yates shuffle algorithm
 */
export const shuffle = (a) => {
  const arr = [...a]
  for (let i = arr.length; i; i--) {
    const j = ~~(Math.random() * i);
    [arr[i - 1], arr[j]] = [arr[j], arr[i - 1]]
  }
  return arr
}

/**
 * Return a random integer between min and max
 */
export const rand = (min, max) => ~~(Math.random() * (max - min + 1)) + min

/**
 * Returns a random number according to a Gaussian distribution N(0, 1)
 */
export const gaussian = () => {
  const u = 1 - Math.random()
  const v = 1 - Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

/**
 * Split an array into chunks
 */
export const chunk = (array, chunks) => {
  const chunkSize = ~~(array.length / chunks)
  const ret = []

  for (let i = 0; i < array.length; ++i) {
    const e = array[i]
    if (i % chunkSize === 0) {
      ret.push([e])
    } else {
      ret[ret.length - 1].push(e)
    }
  }

  if (ret.length > chunks) {
    let lastCol = ret.pop()
    for (let i = 0; i < lastCol.length; ++i) {
      ret[i % chunks].push(lastCol[i])
    }
  }

  return ret
}

/**
 * Get date from mongodb ObjectId field
 */
export const objectId2date = (id) =>
  new Date(parseInt(id.substring(0, 8), 16) * 1000)

/**
 * Stop all animations in progress
 */
export const stopAnimations = (setError) => {
  let highestTimeoutId = setTimeout(() => {})
  setTimeout(() => {
    while (--highestTimeoutId) clearTimeout(highestTimeoutId)
  }, 0)
  if (setError) setError(null)
}
