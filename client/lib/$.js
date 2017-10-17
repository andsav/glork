/*
    JQuery replacement
 */

export let $ = (id) => document.getElementById(id)

export let $$ = (cls) => Array.from(document.getElementsByClassName(cls))

export let $ajax = (method, url, data, success, error = (x) => {
}) => {
  let xhr = new XMLHttpRequest()
  xhr.open(method, url, true)
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
  xhr.onload = function () {
    if (xhr.status === 200) {
      success(JSON.parse(xhr.responseText))
    } else {
      error(xhr.response)
    }
  }
  if (data)
    xhr.send(JSON.stringify(data))
  else
    xhr.send()
}

export let $post = (url, data, success, error = (x) => {
}) => {
  $ajax('POST', url, data, success, error)
}

export let $get = (url, success, error = (x) => {
}) => {
  $ajax('GET', url, false, success, error)
}

export let $get_data = (url, data, success, error) => {
  let params = Object.keys(data).map((i) => i + '=' + data[i]).join('&')
  $get(url + '?' + params, success, error)
}

export let $ready = (fn) => {
  document.addEventListener('DOMContentLoaded', fn)
}
