/*
    JQuery replacement
 */

export let $ = (id) => document.getElementById(id);

export let $$ = (cls) => Array.from(document.getElementsByClassName(cls));

export let $post = (url, data, success, error = (x) => {}) => {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onload = function () {
        if (xhr.status === 200) {
            success(JSON.parse(xhr.responseText));
        } else {
            error(xhr.response);
        }
    };
    xhr.send(JSON.stringify(data));
};

export let $get = (url, success, error = (x) => {}) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onload = function () {
        if (xhr.status === 200) {
            success(JSON.parse(xhr.responseText));
        } else {
            error(xhr.response);
        }
    };
    xhr.send();
};

export let $get_data = (url, data, success, error) => {
    let params = Object.keys(data).map((i) => i+'='+data[i]).join('&');
    $get(url + "?" + params, success, error);
};

export let $ready = (fn) => {
    document.addEventListener("DOMContentLoaded", fn);
};