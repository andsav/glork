import { chunk, objectId2date } from '../../lib/helpers.js'
import { active, content, underheader, title, getPath, getCollectionSwitch } from './display.js'

/**
 *
 * @param data
 */
export const viewAll = (data) => {
  title()
  active('all')

  let columns = chunk(data, 3)

  let html = columns.map((col) => {
    let list = col.map((d) => `<li><a href="/${getPath()}/${d.url}.html">${d.title}</a></li>`).join('')
    return `<div class="col"><ul>${list}</ul></div>`
  }).join('')

  content(getCollectionSwitch(), `<h2>All Notes</h2><div class="row">${html}</div>`)
}

/**
 *
 * @param data
 */
export const viewTree = (data) => {
  title()
  active('tree')

  let tree = {}

  data.forEach(note => {
    let current = tree
    note['tree'].forEach(node => {
      if (!current.hasOwnProperty(node)) {
        current[node] = {}
      }
      current = current[node]
    })
    if (!current.hasOwnProperty('notes')) {
      current['notes'] = []
    }
    current['notes'].push(note)
  })

  let notes = n => {
    let leaf = n.map(x => `<li><a href="/${getPath()}/${x['url']}.html">${x['title']}</a></li>`).join('')
    return `<ul>${leaf}</ul>`
  }

  let nodes = n => {
    let leaf = Object.keys(n).map(x => {
      let sub = n[x].hasOwnProperty('notes') ? notes(n[x]['notes']) : nodes(n[x])
      return `<li><strong onclick="this.nextSibling.classList.toggle('active')">${x}</strong>${sub}</li>`
    }).join('')
    return `<ul>${leaf}</ul>`
  }

  content(`<h2>All Notes</h2><div id="node-content" class="notes-tree">${nodes(tree)}</div>`)
}

/**
 *
 * @param data
 */
export const viewTags = (data) => {
  title()
  active('tags')
  let tagsList = data.map((tag) => `<li><a href="/${getPath()}/${tag['id']}.tag">${tag['id']} (${tag['count']})</a></li>`).join('')
  content(`<div style="text-align:center"><ul class="tags">${tagsList}</ul></div>`)
}

/**
 *
 * @param data
 */
export const viewRandom = (data) => {
  active('rand')
  viewNote(data)
}

/**
 *
 * @param data
 */
export const viewSingle = (data) => {
  active()
  viewNote(data)
}

/**
 *
 * @param data
 * @param tag
 */
export const viewTag = (data, tag) => {
  title(tag.replace('-', ' '))
  active('tags')
  let notesList = data.map((d) => `<li><a href="/${getPath()}/${d.url}.html">${d.title}</a></li>`).join('')
  content(`<h2>All notes for <em>${tag}</em></h2><ul>${notesList}</ul>`)
}

/**
 *
 */
export const viewNotFound = () => {
  title()
  content('Not found!')
}

/**
 *
 * @param data
 */
let viewNote = (data) => {
  title(data.title)

  data['modified'] = new Date(data['modified'])
  if (data['modified'].getYear() < 0) {
    data['modified'] = null
  }

  underheader(data['url'], objectId2date(data['id']), data['modified'])

  let contentHtml = '<div id="note-content">' + data.content.replace(/<h3>(.+)<\/h3>/g, (match, section) => {
    let anchor = section.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).join('-')
    return `<span class="anchor" id="${anchor}"></span><h3><span>${section}</span>&nbsp;<small><a href="#${anchor}">#</a></small></h3>`
  }) + '</div>'

  let tagsList = data['tags'].map((c) => `<li><a href="/${getPath()}/${c}.tag" rel="tag">${c}</a></li>`).join('')
  let tagsHtml = `<ul class="tags aside">${tagsList}</ul>`
  let titleHtml = `<h2>${data.title}</h2>`

  content(tagsHtml + titleHtml + contentHtml)

  Prism.highlightAll()
  MathJax.Hub.Queue(['Typeset', MathJax.Hub])
}
