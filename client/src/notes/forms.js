import { $ajax, $post, $ } from '../../lib/$.js'
import { collection } from './router.js'
import { ENDPOINTS } from '../../lib/constants.js'
import { serialize } from '../../lib/helpers.js'
import { Editor } from '../../lib/editor.js'
import { active, content, getPath } from './display.js'

/**
 *
 * @param original
 * @returns Object
 */
const formContent = (original) => {
  return {
    'password': {
      'type': 'password'
    },
    'title': {
      'type': 'text',
      'value': original['title'],
      'onchange': (e) => {
        const $url = $('form-url')
        if ($url.value.length === 0) {
          $url.value = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^0-9a-z-]+/g, '')
        }
      }
    },
    'url': {
      'type': 'text',
      'value': original['url']
    },
    'content': {
      'type': 'textarea',
      'value': original['content']
    },
    'tags': {
      'type': 'text',
      'value': original['tags'].join(', ')
    },
    'tree': {
      'type': 'text',
      'value': original['tree'] === null ? '' : original['tree'].join(', ')
    }
  }
}

/**
 *
 * @param original
 */
export const changeForm = (original) => {
  active()
  content(generateForm('Change note', formContent(original), (e) => {
    e.preventDefault()

    let [formData, data] = getFormData(e.target)

    $ajax('PUT',
      collection(ENDPOINTS.NOTES_SINGLE + original['url']),
      data,
      (d) => {
        if (d) window.location.href = `/${getPath()}/` + formData['form-url'] + '.html'
      })

    return false
  }, (form) => {
    $ajax('PUT',
      collection(ENDPOINTS.NOTES_SINGLE + original['url']),
      getFormData(form).pop(),
      (d) => {
        if (d) console.log(`Autosave at ${new Date()}`)
      })
  }))
}

/**
 *
 * @param original
 */
export const addForm = (original = {'title': '', 'url': '', 'content': '', 'tags': [], 'tree': []}) => {
  active()
  content(generateForm('Add note', formContent(original), (e) => {
    e.preventDefault()

    $post(
      collection(ENDPOINTS.NOTES_CREATE),
      getFormData(e.target)[1],
      (d) => {
        if (d) {
          window.location.href = `/${getPath()}/all`
        }
      })

    return false
  }))
}

/**
 *
 * @param path
 */
export const deleteForm = (path) => {
  content(generateForm('Delete note', {
    'password': {
      'type': 'password'
    }
  }, (e) => {
    e.preventDefault()

    let formData = serialize(e.target)
    let endpoint = path.split('.delete')[0] + '/' + window.btoa(formData['form-password'])

    $ajax('DELETE',
      collection(ENDPOINTS.NOTES_SINGLE + endpoint),
      false,
      (d) => {
        if (d) {
          window.location.href = `/${getPath()}/all`
        }
      })

    return false
  }))
}

/**
 *
 * @param target
 * @returns {[null,null]}
 */
let getFormData = (target) => {
  let formData = serialize(target)
  let data = {
    'note': {
      'title': formData['form-title'],
      'url': formData['form-url'],
      'content': formData['form-content'],
      'tags': formData['form-tags'].split(/,\s*/),
      'tree': formData['form-tree'].split(/,\s*/)
    },
    'id': '',
    'password': formData['form-password']
  }

  return [formData, data]
}

/**
 *
 * @param title
 * @param fields
 * @param submit
 * @param autosave
 * @returns {HTMLFormElement}
 */
let generateForm = (title, fields, submit, autosave = null) => {
  let form = document.createElement('form')

  form.innerHTML = `<h2>${title}</h2>`

  for (let key in fields) {
    if (!fields.hasOwnProperty(key)) {
      continue
    }

    if (!fields[key].hasOwnProperty('value')) {
      fields[key]['value'] = ''
    }

    let group = document.createElement('div')
    group.className = 'form-group'

    let label = document.createElement('label')
    label.for = label.innerHTML = key
    group.appendChild(label)

    let input

    if (fields[key]['type'] === 'textarea') {
      input = (new Editor(key, fields[key]['value'])).elem
    } else {
      input = document.createElement('input')
      input.name = key
      input.id = `form-${key}`
      Object.keys(fields[key]).forEach(k => {
        input[k] = fields[key][k]
      })
    }

    group.appendChild(input)
    form.appendChild(group)
  }

  let button = document.createElement('button')
  button.type = 'submit'
  button.innerHTML = 'Submit'

  form.appendChild(button)
  form.onsubmit = submit

  if (typeof autosave === 'function') {
    window.setInterval(() => {
      autosave(form)
    }, 5 * 1000)
  }

  return form
}
