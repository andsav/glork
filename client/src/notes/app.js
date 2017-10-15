import {$, $$, $ready, $ajax, $post, $get} from '../../lib/$.js';
import {ENDPOINTS} from '../../lib/constants.js';
import {serialize, chunk} from '../../lib/helpers.js';
import {Editor} from '../../lib/editor.js';

let loading = () => {
    $("loading").style.display = "block";
    $("content").innerHTML = "";
};

let content = (html) => {
    let $content = $("content");

    $("loading").style.display = "none";
    if (typeof html === "object") {
        $content.innerHTML = "";
        $content.appendChild(html)
    } else {
        $content.innerHTML = html;
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
            ? `<span style='text-transform: capitalize'>${before}</span> `
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
            return `<li><a href="/notes/${c}.tag">${c}</a></li>`;
        }).join('') +
        '</ul>' +
        "<h2>" + data.title + "</h2>" +
        '<div id="note-content">' + data.content.replace(/<h3>(.+)<\/h3>/, (match, section) => {
            return '<h3 id="' + section.toLowerCase().split(/\s+/).join('-') + '">' + section + '</h3>';
        }) + "</div>"
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

        if (fields[key]['type'] === "textarea") {
            input = (new Editor(key, fields[key]['value'])).elem;
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

    if (typeof path === "undefined") {
        path = "error";
    }

    if (path === "" || path === "all") {
        title();
        active("all");

        $get(ENDPOINTS.NOTES_LIST, (data) => {
            let columns = chunk(data, 3),
                html = columns.map((col) => {
                    let list = col.map((d) => `<li><a href="/notes/${d.url}.html">${d.title}</a></li>`).join('');
                    return `<div class="col"><ul>${list}</ul></div>`;
                }).join('');

            content(`<h2>All Notes</h2><div class="row">${html}</div>`);
        });
    }
    else if (path === "tags") {
        title();
        active("tags");
        $get(ENDPOINTS.NOTES_TAGS, (data) => {
            let tags_list =  data.map((tag) => `<li><a href="/notes/${tag['id']}.tag">${tag['id']} (${tag['count']})</a></li>`).join('');
            content(`<div style="text-align:center"><ul class="tags">${tags_list}</ul></div>`);
        });
    }
    else if (path === "random") {
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
            let notes_list = data.map((d) => `<li><a href="/notes/${d.url}.html">${d.title}</a></li>`).join("");
            content(`<h2>All notes for <em>${tag}</em></h2><ul>${notes_list}</ul>`);
        });
    }
    else if (path.endsWith('.change')) {
        active();
        $get(ENDPOINTS.NOTES_SINGLE + path.split(".change")[0], (original) => {
            content(generate_form("Change note", {
                "password": {
                    "type": "password"
                },
                "title": {
                    "type": "text",
                    "value": original['title']
                },
                "url": {
                    "type": "text",
                    "value": original['url']
                },
                "content": {
                    "type": "textarea",
                    "value": original['content']
                },
                "tags": {
                    "type": "text",
                    "value": original['tags'].join(', ')
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
                    "password": form_data["password"],
                };

                $ajax('PUT',
                    ENDPOINTS.NOTES_SINGLE + original['url'],
                    data,
                    (d) => {
                        if (d) {
                            goto("/notes/" + form_data["url"] + ".html", form_data["title"]);
                        }
                    });

                return false;
            }));
        });
    }
    else if (path.endsWith('.delete')) {
        content(generate_form("Delete note", {
            "password": {
                "type": "password"
            }
        }, (e) => {
            e.preventDefault();

            let form_data = serialize(e.target);

            $ajax('DELETE',
                ENDPOINTS.NOTES_SINGLE + path.split(".delete")[0] + "/" + window.btoa(form_data['password']),
                false,
                (d) => {
                    if (d) {
                        goto("/notes/all");
                    }
                });

            return false;
        }));
    }
    else if (path === "add") {
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

            $post(
                ENDPOINTS.NOTES_CREATE,
                data,
                (d) => {
                    if (d) {
                        goto("/notes/all");
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

let goto = (path, title = "") => {
    loading();
    window.history.pushState(null, "Notes" + ((title === "") ? " - " + title : ""), path);
    route(path);
};

let handle_click = (e) => {
    if (e.target.localName === 'a' && e.target.target !== "_blank") {
        goto(e.target.href, e.target.innerHTML);
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