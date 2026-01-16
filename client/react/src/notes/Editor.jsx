import { useState, useRef, useCallback } from 'react'

const shortcutMap = {
  84: {
    key: 't',
    desc: 'Table',
    insert:
      '<center>' +
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
    insert:
      '<aside class="file">\n' +
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
    cursor: "<img src='"
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
    addBefore: '</li>',
    addAfter: '<li>',
    removeAfter: ''
  },
  '</h3>': {
    addBefore: '</h3>',
    addAfter: '',
    removeAfter: '</h3>'
  },
  '</h4>': {
    addBefore: '</h4>',
    addAfter: '',
    removeAfter: '</h4>'
  },
  '</p>': {
    addBefore: '</p>',
    addAfter: '',
    removeAfter: '</p>'
  },
  '$$': {
    addBefore: '$$',
    addAfter: '',
    removeAfter: '\\$\\$'
  }
}

export default function Editor({ id, value, onChange }) {
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef(null)

  const handleKeyDown = useCallback(
    (e) => {
      const textarea = e.target
      const val = textarea.value
      const s0 = textarea.selectionStart
      const s1 = textarea.selectionEnd

      if (e.keyCode === 9) {
        // Tab
        e.preventDefault()
        const newValue = val.substring(0, s0) + '\t' + val.substring(s1)
        onChange(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = s0 + 1
        }, 0)
        return false
      } else if (e.keyCode === 13) {
        // Enter
        e.preventDefault()

        let before = val.substring(0, s0)
        let after = val.substring(s1)
        const currentLine = before.split('\n').pop()
        const currentIndent = currentLine.match(/^\s*/)[0]
        const afterLine = after.split('\n')[0]
        let selectionOffset = 0

        if (Object.prototype.hasOwnProperty.call(enterMap, afterLine)) {
          before += enterMap[afterLine].addBefore
          after =
            enterMap[afterLine].addAfter +
            after.replace(
              new RegExp(`^${enterMap[afterLine].removeAfter}`),
              ''
            )
          selectionOffset =
            enterMap[afterLine].addBefore.length +
            enterMap[afterLine].addAfter.length
        }

        const newValue = before + '\n' + currentIndent + after
        onChange(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            s0 + 1 + currentIndent.length + selectionOffset
        }, 0)
        return false
      } else if (e.ctrlKey) {
        let offset = 0
        let ret = false

        if (Object.prototype.hasOwnProperty.call(shortcutMap, e.keyCode)) {
          const newValue =
            val.substring(0, s0) +
            shortcutMap[e.keyCode].insert +
            val.substring(s1)
          onChange(newValue)
          offset = shortcutMap[e.keyCode].cursor.length
        } else if (e.keyCode === 56) {
          // Ctrl+8 preview
          setShowPreview(true)
          setTimeout(() => {
            if (window.Prism) window.Prism.highlightAll()
            if (window.MathJax?.Hub) {
              window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub])
            }
          }, 100)
        } else {
          ret = true
        }

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = s0 + offset
        }, 0)
        return ret
      }
    },
    [onChange]
  )

  const shortcuts = Object.keys(shortcutMap)
    .map((s) => `Ctrl+${shortcutMap[s].key}: ${shortcutMap[s].desc}`)
    .join('\n')

  if (showPreview) {
    return (
      <div>
        <div
          style={{ display: 'block', width: '100%', cursor: 'pointer' }}
          onClick={() => setShowPreview(false)}
          dangerouslySetInnerHTML={{ __html: value }}
        />
        <p>
          <em>Click to edit</em>
        </p>
      </div>
    )
  }

  return (
    <div>
      <textarea
        ref={textareaRef}
        name={id}
        id={`form-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <p>
        <em title={shortcuts}>shortcuts</em>
      </p>
    </div>
  )
}
