import {$, $$, $ready, $post, $get} from '../../lib/$.js';
import {ENDPOINTS} from '../../lib/constants.js';

let loading = () => {
    $("loading").style.display = "block";
    $("content").innerHTML = "";
};

let content = (html) => {
    $("loading").style.display = "none";
    $("content").innerHTML = html;
};

let active = (a = null) => {
    $$("active").forEach((c) => { c.className = "" });
    if(a) {
        $("link_" + a).className = "active";
    }
};

let title = (before = "", after = "") => {
    $("title").innerHTML = ((before !== "")
            ? "<span style='text-transform: capitalize'>" + before + "</span>" + " "
            : "") +
        '<a href="/notes">Notes</a>' +
        after;
};

let display_single = (data) => {
    title(data.title);

    content(
        '<ul class="tags-aside">' +
            data['tags'].map((c) => { return '<li><a href="/notes/' + c +'.tag">' + c + '</a></li>'; }).join('') +
        '</ul>' +
        "<h2>" + data.title + "</h2>" +
        "<div>" + data.content + "</div>"
    );

    Prism.highlightAll();
    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
};

let route = (path) => {
    path = path.split(/\/notes\/*/)[1];

    if(path == "" || path == "all") {
        title();
        active("all");

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
    }
    else if(path == "tags") {
        title();
        active("tags");
        $get(ENDPOINTS.NOTES_TAGS, (data) => {
            content(
                "<pre>" + JSON.stringify(data) + "</pre>"
            );
        });
    }
    else if(path == "random") {
        active("rand");
        $get(ENDPOINTS.NOTES_RANDOM, display_single);
    }
    else if(path.endsWith(".html")) {
        active();
        $get(ENDPOINTS.NOTES_SINGLE + path.split(".html")[0], display_single);
    }
    else if(path.endsWith('.tag')) {
        let tag = path.split(".tag")[0];
        title(tag.replace('-', ' '));
        active("tags");
        $get(ENDPOINTS.NOTES_TAG + tag, (data) => {
            content(
                "<pre>" + JSON.stringify(data) + "</pre>"
            );
        });
    }
    else {
        title();
        content("Not found!");
    }
};

let handle_click = (e) => {
    if(e.target.localName == 'a' && e.target.target != "_blank") {
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