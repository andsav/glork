/*
 Common helper functions
 */

import {$} from './$.js'

const ERROR_DIV = $('error_msg')

// Euclidean distance
export let dist = (a, b) => {
  let x = a[0] - b[0]
  let y = a[1] - b[1]
  return Math.sqrt(x * x + y * y)
}

export let collision = (previous, point, r) => previous.map((co) => dist(co, point) > r).includes(false)

export let inCircle = (point, circle, r) => {
  let x = point.x - circle.x
  let y = point.y - circle.y;
  return x * x + y * y < r * r
}

// Round float number
export let round = (n, decimals) => (Math.round(n * decimals) / decimals)

// Fisher–Yates algorithm
export let shuffle = (a) => {
  for (let i = a.length; i; i--) {
    let j = ~~(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]]
  }
}

// Return a random integer between min and max
export let rand = (min, max) => ~~(Math.random() * (max - min + 1)) + min

// Returns a random number according to a Gaussian distribution N(0, 1) (Box–Muller transform)
export let gaussian = () => {
  let u = 1 - Math.random()
  let v = 1 - Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Pack form data into a key => value map
export let serialize = (form) => {
  let data = {}

  form.querySelectorAll('input, textarea').forEach(
    (input) => {
      data[input.id] = input.value
    }
  )

  return data
}

// Stop all animations in progress
export let stopAnimations = () => {
  let highestTimeoutId = setTimeout(';')
  for (let i = 0; i < highestTimeoutId; i++) {
    clearTimeout(i)
  }

  ERROR_DIV.style.opacity = 0
}

// Display error
export let error = (elem, err) => {
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

// Split an array into chunks
export let chunk = (array, chunks) => {
  let chunk_size = ~~(array.length / chunks)
  let ret = []

  for (let i = 0; i < array.length; ++i) {
    let e = array[i]
    if (i % chunk_size === 0) {
      ret.push([e])
    } else {
      ret[ret.length - 1].push(e)
    }
  }

  if (ret.length > chunks) {
    while (ret[ret.length - 1].length !== 0) {
      for (let i = 0; i < ret.length - 1; ++i) {
        ret[i].push(ret[i + 1].shift())
      }
    }

    ret.pop()
  }

  return ret
}

// Get date from mongodb ObjectId field
export let objectId2date = (id) => new Date(parseInt(id.substring(0, 8), 16) * 1000)
