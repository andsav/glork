export class Editor {
  constructor(id, content = '') {
    this.elem = document.createElement('div')

    this.textarea = document.createElement('textarea')
    this.textarea.name = this.textarea.id = id
    this.textarea.innerHTML = content

    this.preview = document.createElement('div')
    this.preview.style.display = 'none'
    this.preview.style.width = '100%'

    this.elem.appendChild(this.textarea)
    this.elem.appendChild(this.preview)

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

        let before = val.substring(0, s0),
          after = val.substring(s1),
          current_line = before.split('\n').pop(),
          current_indent = current_line.match(/^\s*/)[0]

        e.target.value = before + '\n' + current_indent + after
        e.target.selectionStart = e.target.selectionEnd = s0 + 1 + current_indent.length

        return false
      } else if (e.altKey) {
        let offset = 0
        let ret = false
        switch (e.keyCode) {
          case 84: //ctrl+t
            e.target.value = val.substring(0, s0) +
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
              '\n</center>' +
              val.substring(s1)
            break
          case 73: //ctrl+u
            e.target.value = val.substring(0, s0) + '<img src="" alt="">' + val.substring(s1)
            offset = '<img src=\''.length
            break

          case 76: // ctrl+l
            e.target.value = val.substring(0, s0) + '<ul>\n\t<li></li>\n</ul>' + val.substring(s1)
            offset = '<ul>\n\t<li>'.length
            break

          case 80: // ctrl+p
            e.target.value = val.substring(0, s0) + '<p></p>' + val.substring(s1)
            offset = '<p>'.length
            break

          case 82:
            this.preview.innerHTML = this.textarea.value

            this.textarea.style.display = 'none'
            this.preview.style.display = 'block'

            Prism.highlightAll()
            MathJax.Hub.Queue(['Typeset', MathJax.Hub])

            break


          default:
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