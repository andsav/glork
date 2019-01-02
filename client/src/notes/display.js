import { $, $$ } from '../../lib/$.js'
import { COLLECTIONS, DEFAULT_COLLECTION } from '../../lib/constants.js'

/**
 *
 * @returns {string}
 */
export const getPath = () => document.location.pathname.split('/')[1]

/**
 *
 */
export const loading = () => {
  $('loading').style.display = 'block'
  $('content').innerHTML = ''
}

/**
 *
 * @param d
 * @returns {string}
 */
const getDateSpan = (d) => {
  const split = d.toISOString().split('T')
  return `<span title="${split[0]} ${split[1].slice(0, 8)}">${split[0]}</span>`
}

/**
 *
 * @param i
 * @param link
 * @returns {string}
 */
export const getIcon = (i, link) => `<a href="${link}"><img src="/client/img/${i}_icon.svg" style="margin-top:3px; vertical-align: top; width:10px; height:10px"></a>`

/**
 *
 * @param html
 * @returns {HTMLElement}
 */
export const content = (...html) => {
  let $content = $('content')

  $('loading').style.display = 'none'

  $content.innerHTML = ''
  html.forEach(h => {
    if (typeof h === 'object') {
      $content.appendChild(h)
    } else {
      $content.innerHTML += h
    }
  })

  return $content
}

/**
 *
 * @param link
 */
export const active = (link = null) => {
  $$('active').forEach((c) => {
    c.className = ''
  })
  if (link) {
    $('link_' + link).className = 'active'
  }
}

/**
 *
 * @param before
 * @param after
 */
export const title = (before = '', after = '') => {
  $('title').innerHTML = ((before !== '')
    ? `<span style='text-transform: capitalize'>${before}</span> `
    : '') +
    `<a href="/${getPath()}">Notes</a>` +
    after

  document.title = ((before !== '') ? before + ' ' : '') + 'Notes' + after

  $('underheader').style.display = 'none'
}

/**
 *
 * @param url
 * @param created
 * @param modified
 */
export const underheader = (url, created, modified = null) => {
  const $underheader = $('underheader')

  const icons = [
    ['pencil', 'change'],
    ['copy', 'clone'],
    ['x', 'delete']
  ].map((i) => getIcon(i[0], `${url}.${i[1]}`)).join('&nbsp;&nbsp;')

  $underheader.innerHTML = `${icons}&nbsp;&nbsp;&nbsp;<strong>Created</strong>:&nbsp;&nbsp;${getDateSpan(created)}`

  if (modified !== null) {
    $underheader.innerHTML += `&nbsp;&nbsp;&nbsp; <strong>Modified</strong>:&nbsp;&nbsp;${getDateSpan(modified)}`
  }

  $underheader.style.display = 'block'
}

/**
 *
 * @param collections
 * @returns {HTMLElement}
 */
export const getCollectionSwitch = (collections = COLLECTIONS) => {
  const a = (c, active) => {
    let el = document.createElement(active ? 'SPAN' : 'A')
    el.innerHTML = c
    if (!active) {
      el.href = `/notes/${c}.collection`
    }
    return el
  }
  const li = (c) => {
    let active = 'collection' in window.localStorage ? c === window.localStorage['collection'] : c === DEFAULT_COLLECTION
    let el = document.createElement('LI')
    if (active) {
      el.className = 'active'
    }
    el.appendChild(a(c, active))
    return el
  }
  const ul = document.createElement('UL')
  ul.className = 'tags aside'
  collections.forEach(c => {
    ul.appendChild(li(c))
  })
  return ul
}
