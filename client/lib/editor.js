const shortcutMap = {
  84: {
    key: 't',
    desc: 'Table',
    insert: '<center>' +
    '\n<table class="bordered" style="width:50%">' +
    '\n\t<thead>' +
    '\n\t\t<tr>' +
    '\n\t\t\t<th></th>' +
    '\n\t\t</tr>' +
    '\n\t</thead>' +
    '\n\t<tbody>' +
    '\n\t\t<tr>' +
    '\n\t\t\t<td></td>' +
    '\n\t\t</tr>' +
    '\n\t</tbody>' +
    '\n</table>' +
    '\n</center>',
    cursor: ''
  },
  52: {
    key: '4',
    desc: 'Latex',
    insert: '$$$$',
    cursor: '$$'
  },
  65: {
    key: 'a',
    desc: 'Aside file',
    insert: '<aside class="file">\n' +
    '\t<a href="/public/aside/" target="_blank"><img src="/client/img/pdf_icon.png" style="vertical-align: top; width:16px; height:16px"> </a>\n' +
    '</aside>',
    cursor: '<aside class="file">\n\t<a href="/public/aside/'
  },
  67: {
    key: 'c',
    desc: 'Code',
    insert: '<pre><code class="language-javascript"></code></pre>',
    cursor: '<pre><code class="language-javascript">'
  },
  72: {
    key: 'h',
    desc: 'Section title',
    insert: '<h3></h3>',
    cursor: '<h3>'
  },
  73: {
    key: 'u',
    desc: 'Image',
    insert: '<img src="" alt="">',
    cursor: '<img src=\''
  },
  76: {
    key: 'l',
    desc: 'List',
    insert: '<ul>\n\t<li></li>\n</ul>',
    cursor: '<ul>\n\t<li>'
  },
  80: {
    key: 'p',
    desc: 'Paragraph',
    insert: '<p></p>',
    cursor: '<p>'
  },
  83: {
    key: 's',
    desc: 'Bold',
    insert: '<strong></strong>',
    cursor: '<strong>'
  },
  69: {
    key: 'e',
    desc: 'Italic',
    insert: '<em></em>',
    cursor: '<em>'
  }
}

const enterMap = {
  '</li>': {
    'addBefore': '</li>',
    'addAfter': '<li>',
    'removeAfter': ''
  },
  '</h3>': {
    'addBefore': '</h3>',
    'addAfter': '',
    'removeAfter': '</h3>'
  },
  '</h4>': {
    'addBefore': '</h4>',
    'addAfter': '',
    'removeAfter': '</h4>'
  },
  '</p>': {
    'addBefore': '</p>',
    'addAfter': '',
    'removeAfter': '</p>'
  },
  '$$': {
    'addBefore': '$$',
    'addAfter': '',
    'removeAfter': '\\$\\$'
  }
}

export class Editor {
  constructor (id, content = '') {
    this.elem = document.createElement('div')

    this.textarea = document.createElement('textarea')
    this.textarea.name = this.textarea.id = id
    this.textarea.innerHTML = content

    this.preview = document.createElement('div')
    this.preview.style.display = 'none'
    this.preview.style.width = '100%'

    this.help = document.createElement('p')
    this.help.innerHTML = '<em>shortcuts</em>'
    this.help.title = Object.keys(shortcutMap).map(s => `Ctrl+${shortcutMap[s].key}: ${shortcutMap[s].desc}`).join('\n')

    this.elem.appendChild(this.textarea)
    this.elem.appendChild(this.preview)
    this.elem.appendChild(this.help)

    this.textarea.onkeydown = (e) => {
      let val, s0, s1
      val = e.target.value
      s0 = e.target.selectionStart
      s1 = e.target.selectionEnd

      if (e.keyCode === 9) {
        e.preventDefault()
        e.target.value = val.substring(0, s0) + '\t' + val.substring(s1)
        e.target.selectionStart = e.target.selectionEnd = s0 + 1

        return false
      } else if (e.keyCode === 13) {
        e.preventDefault()

        let before = val.substring(0, s0)
        let after = val.substring(s1)
        let currentLine = before.split('\n').pop()
        let currentIndent = currentLine.match(/^\s*/)[0]
        let afterLine = after.split('\n')[0]
        let selectionOffset = 0

        if (enterMap.hasOwnProperty(afterLine)) {
          before += enterMap[afterLine]['addBefore']
          after = enterMap[afterLine]['addAfter'] + after.replace(new RegExp(`^${enterMap[afterLine]['removeAfter']}`), '')
          selectionOffset = enterMap[afterLine]['addBefore'].length + enterMap[afterLine]['addAfter'].length
        }

        e.target.value = before + '\n' + currentIndent + after
        e.target.selectionStart = e.target.selectionEnd = s0 + 1 + currentIndent.length + selectionOffset

        return false
      } else if (e.ctrlKey) {
        let offset = 0
        let ret = false

        if (shortcutMap.hasOwnProperty(e.keyCode)) {
          e.target.value = val.substring(0, s0) + shortcutMap[e.keyCode].insert + val.substring(s1)
          offset = shortcutMap[e.keyCode].cursor.length
        } else if (e.keyCode === 56) { // ctrl+8 preview
          this.preview.innerHTML = this.textarea.value

          this.textarea.style.display = 'none'
          this.preview.style.display = 'block'

          Prism.highlightAll()
          MathJax.Hub.Queue(['Typeset', MathJax.Hub])
        } else {
          ret = true
        }

        e.target.selectionStart = e.target.selectionEnd = s0 + offset
        return ret
      }
    }

    this.preview.onclick = () => {
      this.textarea.style.display = 'block'
      this.preview.style.display = 'none'
    }
  }
}
