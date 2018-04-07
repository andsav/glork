import { $get } from '../../lib/$.js'
import { ENDPOINTS } from '../../lib/constants.js'
import { loading } from './display.js'
import { viewAll, viewNotFound, viewRandom, viewSingle, viewTag, viewTags } from './views.js'
import { addForm, changeForm, deleteForm } from './forms.js'

/**
 *
 * @param path
 */
export let route = (path) => {
  path = path.split(/\/notes\/*/)[1]

  if (typeof path === 'undefined') {
    path = 'error'
  }

  if (path === '' || path === 'all') {
    $get(ENDPOINTS.NOTES_LIST, viewAll)
  } else if (path === 'tags') {
    $get(ENDPOINTS.NOTES_TAGS, viewTags)
  } else if (path === 'random') {
    $get(ENDPOINTS.NOTES_RANDOM, viewRandom)
  } else if (path.endsWith('.html')) {
    let note = path.split('.html')[0]
    $get(ENDPOINTS.NOTES_SINGLE + note, viewSingle)
  } else if (path.endsWith('.tag')) {
    let tag = path.split('.tag')[0]
    $get(ENDPOINTS.NOTES_TAG + tag, (data) => {
      viewTag(data, tag)
    })
  } else if (path.endsWith('.change')) {
    let note = path.split('.change')[0]
    $get(ENDPOINTS.NOTES_SINGLE + note, changeForm)
  } else if (path.endsWith('.delete')) {
    deleteForm(path)
  } else if (path === 'add') {
    addForm()
  } else {
    viewNotFound()
  }
}

/**
 *
 * @param e
 * @returns {boolean}
 */
export let handleClick = (e) => {
  if (e.target.localName === 'a' && e.target.target !== '_blank' && e.target.href.indexOf('#') === -1) {
    goto(e.target.href, e.target.innerHTML)
    e.preventDefault()
    return false
  }
}

/**
 *
 * @param path
 * @param title
 */
let goto = (path, title = '') => {
  loading()
  window.history.pushState(null, 'Notes' + ((title === '') ? ' - ' + title : ''), path)
  route(path)
}
