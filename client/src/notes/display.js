import {$, $$} from '../../lib/$.js'

/**
 *
 */
export let loading = () => {
  $('loading').style.display = 'block'
  $('content').innerHTML = ''
}

/**
 *
 * @param d
 * @returns {string}
 */
let getDateSpan = (d) => {
  let split = d.toISOString().split('T')
  return `<span title="${split[0]} ${split[1].slice(0, 8)}">${split[0]}</span>`
}

/**
 *
 * @param html
 */
export let content = (html) => {
  let $content = $('content')

  $('loading').style.display = 'none'
  if (typeof html === 'object') {
    $content.innerHTML = ''
    $content.appendChild(html)
  } else {
    $content.innerHTML = html
  }
}

/**
 *
 * @param link
 */
export let active = (link = null) => {
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
export let title = (before = '', after = '') => {
  $('title').innerHTML = ((before !== '')
    ? `<span style='text-transform: capitalize'>${before}</span> `
    : '') +
    '<a href="/notes">Notes</a>' +
    after

  document.title = ((before !== '') ? before + ' ' : '') + 'Notes' + after

  $('underheader').style.display = 'none'
}

/**
 *
 * @param created
 * @param modified
 */
export let date = (created, modified = null) => {
  let $underheader = $('underheader')

  $underheader.innerHTML = `<strong>Created</strong>:&nbsp;&nbsp;${getDateSpan(created)}`

  if (modified !== null) {
    $underheader.innerHTML += `&nbsp;&nbsp;&nbsp; <strong>Modified</strong>:&nbsp;&nbsp;${getDateSpan(modified)}`
  }

  $underheader.style.display = 'block'
}
