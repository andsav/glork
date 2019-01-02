/*
    JQuery replacement
 */

export const $ = (id) => document.getElementById(id)

export const $$ = (cls) => Array.from(document.getElementsByClassName(cls))

export const $ajax = (method, url, data, success, error = (x) => {
}) => {
  const xhr = new XMLHttpRequest()
  xhr.open(method, url, true)
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
  xhr.onload = function () {
    if (xhr.status === 200) {
      success(JSON.parse(xhr.responseText))
    } else {
      error(xhr.response)
    }
  }
  if (data) {
    xhr.send(JSON.stringify(data))
  } else {
    xhr.send()
  }
}

export const $post = (url, data, success, error = (x) => {
}) => {
  $ajax('POST', url, data, success, error)
}

export const $get = (url, success, error = (x) => {
}) => {
  $ajax('GET', url, false, success, error)
}

export const $getData = (url, data, success, error) => {
  const params = Object.keys(data).map((i) => i + '=' + data[i]).join('&')
  $get(url + '?' + params, success, error)
}

export const $ready = (fn) => {
  document.addEventListener('DOMContentLoaded', fn)
}
