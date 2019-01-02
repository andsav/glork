import { $get } from '../../lib/$.js'
import { stopAnimations } from '../../lib/helpers.js'
import { ENDPOINTS, DEFAULT_COLLECTION } from '../../lib/constants.js'
import { loading, getPath } from './display.js'
import { viewAll, viewTree, viewNotFound, viewRandom, viewSingle, viewTag, viewTags } from './views.js'
import { addForm, changeForm, deleteForm } from './forms.js'

export const collection = (r) => `${r}/${'collection' in window.localStorage ? window.localStorage['collection'] : DEFAULT_COLLECTION}`

const primaryRoutes = {
  'all': () => { $get(collection(ENDPOINTS.NOTES_LIST), viewAll) },
  'tree': () => { $get(collection(ENDPOINTS.NOTES_LIST), viewTree) },
  'tags': () => { $get(collection(ENDPOINTS.NOTES_TAGS), viewTags) },
  'random': () => { $get(collection(ENDPOINTS.NOTES_RANDOM), viewRandom) },
  'add': () => { addForm() }
}

const secondaryRoutes = {
  '.html': (x) => {
    $get(collection(ENDPOINTS.NOTES_SINGLE + x), viewSingle)
  },
  '.tag': (x) => {
    $get(collection(ENDPOINTS.NOTES_TAG + x), (data) => {
      viewTag(data, x)
    })
  },
  '.change': (x) => {
    $get(collection(ENDPOINTS.NOTES_SINGLE + x), changeForm)
  },
  '.clone': (x) => {
    $get(collection(ENDPOINTS.NOTES_SINGLE + x), changeForm)
  },
  '.collection': (x) => {
    window.localStorage['collection'] = x
    primaryRoutes['all']()
  },
  '.delete': (x, path) => {
    deleteForm(path)
  }
}

/**
 *
 * @param path
 */
export const route = (path) => {
  stopAnimations()

  path.replace(getPath(), 'notes')

  try {
    path = path.split(/\/notes\/*/)[1]
  } catch (e) {
    path = 'error'
  }

  if (typeof path === 'undefined') {
    path = 'error'
  } else if (path === '') {
    path = 'all'
  }

  if (primaryRoutes.hasOwnProperty(path)) {
    primaryRoutes[path]()
  } else {
    let notFound = true
    for (const k in secondaryRoutes) {
      if (path.endsWith(k)) {
        notFound = false
        secondaryRoutes[k](path.split(k)[0], path)
        break
      }
    }
    if (notFound) {
      viewNotFound()
    }
  }

}

/**
 *
 * @param e
 * @returns {boolean}
 */
export const handleClick = (e) => {
  if (e.target.localName === 'a' && e.target.target !== '_blank' && e.target.href.indexOf('#') === -1) {
    goto(e.target.href, e.target.innerHTML)
    e.preventDefault()
    return false
  }
  return true
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
