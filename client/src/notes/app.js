import {$, $ready, $post, $get} from '../../lib/$.js';
import {ENDPOINTS} from '../../lib/constants.js';

let loading = () => {
    $("loading").style.display = "block";
    $("content").innerHTML = "";
};

let content = (html) => {
    $("loading").style.display = "none";
    $("content").innerHTML = html;
};

let route = (path) => {
    path = path.split(/\/notes\/*/)[1];

    if(path == "" || path == "all") {
        $get(ENDPOINTS.NOTES_LIST, (data) => {
            content(
                "<h2>All Notes</h2>" +
                "<ul>" + data.map((d) => {

                    return '<li>' +
                        '<a href="/notes/' + d.url + '.html">' + d.title + '</a>' +
                        '</li>';

                }).join("") + "</ul>"
            );
        });
    } else {
        content("Not found!");
    }
};

let handle_click = (e) => {
    if(e.target.localName == 'a') {
        loading();

        window.history.pushState(null, "Notes - " + e.target.innerHTML, e.target.href);
        route(e.target.href);

        e.preventDefault();
        return false;
    }
};

$ready(() => {
    $("notes").onclick = $("nav").onclick = handle_click;

    window.onpopstate = () => {
        route(document.location.pathname);
    };

    route(document.location.pathname);
});