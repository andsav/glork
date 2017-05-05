import {$, $$, $ready, $post, $get} from '../../lib/$.js';
import {ENDPOINTS} from '../../lib/constants.js';
import {serialize} from '../../lib/helpers.js';

let loading = () => {
    $("loading").style.display = "block";
    $("content").innerHTML = "";
};

let content = (html) => {
    $("loading").style.display = "none";
    if (typeof html == "object") {
        $("content").innerHTML = "";
        $("content").appendChild(html)
    } else {
        $("content").innerHTML = html;
    }
};

let active = (a = null) => {
    $$("active").forEach((c) => {
        c.className = ""
    });
    if (a) {
        $("link_" + a).className = "active";
    }
};

let title = (before = "", after = "") => {
    $("title").innerHTML = ((before !== "")
            ? "<span style='text-transform: capitalize'>" + before + "</span>" + " "
            : "") +
        '<a href="/notes">Notes</a>' +
        after;

    document.title = ((before !== "") ? before + " " : "") + "Notes" + after;
};

let display_single = (data) => {
    title(data.title);

    content(
        '<ul class="tags aside">' +
        data['tags'].map((c) => {
            return '<li><a href="/notes/' + c + '.tag">' + c + '</a></li>';
        }).join('') +
        '</ul>' +
        "<h2>" + data.title + "</h2>" +
        "<div>" + data.content + "</div>"
    );

    Prism.highlightAll();
    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
};

let generate_form = (title, fields, submit) => {
    let form = document.createElement("form");

    form.innerHTML = "<h2>" + title + "</h2>";

    for (let key in fields) {
        if (!fields[key].hasOwnProperty("value")) {
            fields[key]["value"] = "";
        }

        let group = document.createElement("div");
        group.className = "form-group";

        let label = document.createElement('label');
        label.for = label.innerHTML = key;
        group.appendChild(label);

        let input;
        if(fields[key]['type'] == "textarea") {
            input = document.createElement('textarea');
            input.name = input.id = key;
            input.innerHTML = fields[key]['value'];
            input.onkeydown = function (e) {
                if (e.keyCode === 9) {
                    let v = this.value,
                        s = this.selectionStart,
                        e = this.selectionEnd;

                    this.value = v.substring(0, s) + '\t' + v.substring(e);
                    this.selectionStart = this.selectionEnd = s + 1;

                    return false;
                }
            };
        } else {
            input = document.createElement('input');
            input.type = fields[key]['type'];
            input.name = input.id = key;
            input.value = fields[key]['value'];
        }
        group.appendChild(input);

        form.appendChild(group);
    }

    let button = document.createElement("button");
    button.type = "submit";
    button.innerHTML = "Submit";

    form.appendChild(button);
    form.onsubmit = submit;

    return form;
};

let route = (path) => {
    path = path.split(/\/notes\/*/)[1];

    if (path == "" || path == "all") {
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
    else if (path == "tags") {
        title();
        active("tags");
        $get(ENDPOINTS.NOTES_TAGS, (data) => {
            content(
                '<div style="text-align:center"><ul class="tags">' +
                data.map((tag) => {
                    return '<li><a href="/notes/' + tag['id'] + '.tag">' + tag['id'] + ' (' + tag['count'] + ')</a></li>';
                }).join('') +
                '</ul></div>'
            );
        });
    }
    else if (path == "random") {
        active("rand");
        $get(ENDPOINTS.NOTES_RANDOM, display_single);
    }
    else if (path.endsWith(".html")) {
        active();
        $get(ENDPOINTS.NOTES_SINGLE + path.split(".html")[0], display_single);
    }
    else if (path.endsWith('.tag')) {
        let tag = path.split(".tag")[0];
        title(tag.replace('-', ' '));
        active("tags");
        $get(ENDPOINTS.NOTES_TAG + tag, (data) => {
            content(
                "<h2>All notes for <em>" + tag + "</em></h2>" +
                "<ul>" + data.map((d) => {

                    return '<li>' +
                        '<a href="/notes/' + d.url + '.html">' + d.title + '</a>' +
                        '</li>';

                }).join("") + "</ul>"
            );
        });
    }
    else if (path == "add") {
        active();
        content(generate_form("Add note", {
            "password": {
                "type": "password"
            },
            "title": {
                "type": "text"
            },
            "url": {
                "type": "text"
            },
            "content": {
                "type": "textarea"
            },
            "tags": {
                "type": "text"
            }
        }, (e) => {
            e.preventDefault();

            let form_data = serialize(e.target);
            let data = {
                "note": {
                    "title": form_data["title"],
                    "url": form_data["url"],
                    "content": form_data["content"],
                    "tags": form_data["tags"].split(/,\s*/)
                },
                "id": "",
                "password": form_data["password"],
            };

            $post(ENDPOINTS.NOTES_UPDATE, data, (d) => {
                if(d) {
                    route("/notes/all");
                }
            });

            return false;
        }));
    }
    else {
        title();
        content("Not found!");
    }
};

let handle_click = (e) => {
    if (e.target.localName == 'a' && e.target.target != "_blank") {
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