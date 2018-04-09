import { $ajax, $post } from '../../lib/$.js'
import { ENDPOINTS } from '../../lib/constants.js'
import { serialize } from '../../lib/helpers.js'
import { Editor } from '../../lib/editor.js'
import { active, content } from './display.js'

/**
 *
 * @param original
 */
export let changeForm = (original) => {
  active()
  content(generateForm('Change note', {
    'password': {
      'type': 'password'
    },
    'title': {
      'type': 'text',
      'value': original['title']
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
  }, (e) => {
    e.preventDefault()

    let [formData, data] = getFormData(e.target)

    $ajax('PUT',
      ENDPOINTS.NOTES_SINGLE + original['url'],
      data,
      (d) => {
        if (d) window.location.href = '/notes/' + formData['url'] + '.html'
      })

    return false
  }, (form) => {
    $ajax('PUT',
      ENDPOINTS.NOTES_SINGLE + original['url'],
      getFormData(form).pop(),
      (d) => {
        if (d) console.log(`Autosave at ${new Date()}`)
      })
  }))
}

/**
 *
 */
export let addForm = () => {
  active()
  content(generateForm('Add note', {
    'password': {
      'type': 'password'
    },
    'title': {
      'type': 'text'
    },
    'url': {
      'type': 'text'
    },
    'content': {
      'type': 'textarea'
    },
    'tags': {
      'type': 'text'
    },
    'tree': {
      'type': 'text'
    }
  }, (e) => {
    e.preventDefault()

    $post(
      ENDPOINTS.NOTES_CREATE,
      getFormData(e.target)[1],
      (d) => {
        if (d) {
          window.location.href = '/notes/all'
        }
      })

    return false
  }))
}

/**
 *
 * @param path
 */
export let deleteForm = (path) => {
  content(generateForm('Delete note', {
    'password': {
      'type': 'password'
    }
  }, (e) => {
    e.preventDefault()

    let formData = serialize(e.target)
    let endpoint = path.split('.delete')[0] + '/' + window.btoa(formData['password'])

    $ajax('DELETE',
      ENDPOINTS.NOTES_SINGLE + endpoint,
      false,
      (d) => {
        if (d) {
          window.location.href = '/notes/all'
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
      'title': formData['title'],
      'url': formData['url'],
      'content': formData['content'],
      'tags': formData['tags'].split(/,\s*/),
      'tree': formData['tree'].split(/,\s*/)
    },
    'id': '',
    'password': formData['password']
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
      input.type = fields[key]['type']
      input.name = input.id = key
      input.value = fields[key]['value']
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
