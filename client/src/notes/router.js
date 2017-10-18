import {$get} from '../../lib/$.js'
import {ENDPOINTS} from '../../lib/constants.js'
import {loading} from './display.js'
import {viewAll, viewRandom, viewSingle, viewTag, viewTags, viewNotFound} from './views.js'
import {changeForm, addForm, deleteForm} from './forms.js'

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
    $get(ENDPOINTS.NOTES_SINGLE + path.split('.html')[0], viewSingle)
  } else if (path.endsWith('.tag')) {
    let tag = path.split('.tag')[0]
    $get(ENDPOINTS.NOTES_TAG + tag, (data) => {
      viewTag(data, tag)
    })
  } else if (path.endsWith('.change')) {
    $get(ENDPOINTS.NOTES_SINGLE + path.split('.change')[0], changeForm)
  } else if (path.endsWith('.delete')) {
    deleteForm(path)
  } else if (path === 'add') {
    addForm()
  } else {
    viewNotFound()
  }
}

export let handleClick = (e) => {
  if (e.target.localName === 'a' && e.target.target !== '_blank' && e.target.href.indexOf('#') === -1) {
    goto(e.target.href, e.target.innerHTML)
    e.preventDefault()
    return false
  }
}

let goto = (path, title = '') => {
  loading()
  window.history.pushState(null, 'Notes' + ((title === '') ? ' - ' + title : ''), path)
  route(path)
}
