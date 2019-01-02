/*
 Common helper functions
 */

import { $ } from './$.js'

const ERROR_DIV = $('error_msg')

/**
 * Euclidean distance
 *
 * @param a
 * @param b
 * @returns {number}
 */
export const dist = (a, b) => {
  const x = a[0] - b[0]
  const y = a[1] - b[1]
  return Math.sqrt(x * x + y * y)
}

/**
 *
 * @param previous
 * @param point
 * @param r
 * @returns {boolean}
 */
export const collision = (previous, point, r) => previous.map((co) => dist(co, point) > r).includes(false)

/**
 *
 * @param point
 * @param circle
 * @param r
 * @returns {boolean}
 */
export const inCircle = (point, circle, r) => {
  const x = point.x - circle.x
  const y = point.y - circle.y
  return x * x + y * y < r * r
}

/**
 * Round float number
 *
 * @param n
 * @param decimals
 * @returns {number}
 */
export const round = (n, decimals) => (Math.round(n * decimals) / decimals)

/**
 * Fisher–Yates algorithm
 *
 * @param a
 */
export const shuffle = (a) => {
  for (let i = a.length; i; i--) {
    const j = ~~(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]]
  }
}

/**
 * Return a random integer between min and max
 *
 * @param min
 * @param max
 * @returns {*}
 */
export const rand = (min, max) => ~~(Math.random() * (max - min + 1)) + min

/**
 * Returns a random number according to a Gaussian distribution N(0, 1) (Box–Muller transform)
 *
 * @returns {number}
 */
export const gaussian = () => {
  const u = 1 - Math.random()
  const v = 1 - Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

/**
 * Pack form data into a key => value map
 *
 * @param form
 * @returns {{}}
 */
export const serialize = (form) => {
  const data = {}

  form.querySelectorAll('input, textarea').forEach(
    (input) => {
      data[input.id] = input.value
    }
  )

  return data
}

/**
 * Stop all animations in progress
 */
export const stopAnimations = () => {
  let highestTimeoutId = setTimeout(() => {
  })

  setTimeout(() => {
    while (--highestTimeoutId) clearTimeout(highestTimeoutId)
  }, 0)

  if (ERROR_DIV) ERROR_DIV.style.opacity = '0'
}

/**
 * Display error
 *
 * @param elem
 * @param err
 */
export const error = (elem, err) => {
  elem.classList.add('shake', 'shake-constant')
  ERROR_DIV.innerHTML = err
  ERROR_DIV.style.opacity = 1

  setTimeout(function () {
    elem.classList.remove('shake', 'shake-constant')
  }, 300)

  setTimeout(function () {
    ERROR_DIV.style.opacity = 0
  }, 2000)
}

/**
 * Split an array into chunks
 *
 * @param array
 * @param chunks
 * @returns {Array}
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
 * Get underheader from mongodb ObjectId field
 *
 * @param id
 * @returns {Date}
 */
export const objectId2date = (id) => new Date(parseInt(id.substring(0, 8), 16) * 1000)
