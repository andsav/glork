import { $, $ready } from '../../lib/$.js'
import { handleClick, route } from './router.js'

$ready(() => {
  $('notes').onclick = $('nav').onclick = handleClick

  window.onpopstate = () => {
    route(document.location.pathname)
  }

  route(document.location.pathname)
})
