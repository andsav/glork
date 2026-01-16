import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useLocation
} from 'react-router-dom'
import { ENDPOINTS, COLLECTIONS, DEFAULT_COLLECTION } from '../lib/constants'
import { useApi } from '../hooks/useApi'
import { chunk, objectId2date } from '../lib/helpers'
import Editor from './Editor'

// Get collection from localStorage
const getCollection = () =>
  localStorage.getItem('collection') || DEFAULT_COLLECTION

// Build endpoint with collection
const withCollection = (endpoint) => `${endpoint}/${getCollection()}`

// Main App wrapper with Router
export default function NotesApp() {
  return (
    <BrowserRouter>
      <NotesLayout />
    </BrowserRouter>
  )
}

// Layout component with header and routing
function NotesLayout() {
  const [activeLink, setActiveLink] = useState(null)
  const [pageTitle, setPageTitle] = useState('')
  const [underheaderData, setUnderheaderData] = useState(null)
  const location = useLocation()

  // Update active link based on path
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/all')) setActiveLink('all')
    else if (path.includes('/tree')) setActiveLink('tree')
    else if (path.includes('/tags')) setActiveLink('tags')
    else if (path.includes('/random')) setActiveLink('rand')
    else setActiveLink(null)
  }, [location])

  return (
    <>
      <header id="header" className="opened">
        <h1 id="title">
          {pageTitle && (
            <span style={{ textTransform: 'capitalize' }}>{pageTitle} </span>
          )}
          <Link to="/notes">Notes</Link>
        </h1>
        <nav id="nav">
          <ul>
            <li>
              <Link
                id="link_all"
                to="/notes/all"
                className={activeLink === 'all' ? 'active' : ''}
              >
                All
              </Link>
            </li>
            <li>
              <Link
                id="link_tree"
                to="/notes/tree"
                className={activeLink === 'tree' ? 'active' : ''}
              >
                Tree
              </Link>
            </li>
            <li>
              <Link
                id="link_tags"
                to="/notes/tags"
                className={activeLink === 'tags' ? 'active' : ''}
              >
                Tags
              </Link>
            </li>
            <li>
              <Link
                id="link_rand"
                to="/notes/random"
                className={activeLink === 'rand' ? 'active' : ''}
              >
                Random
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {underheaderData && (
        <aside id="underheader" style={{ display: 'block' }}>
          <UnderheaderContent data={underheaderData} />
        </aside>
      )}

      <div id="pages">
        <div id="notes" className="shown">
          <Routes>
            <Route
              path="/notes"
              element={
                <AllNotesView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/all"
              element={
                <AllNotesView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/tree"
              element={
                <TreeView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/tags"
              element={
                <TagsView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/random"
              element={
                <RandomNoteView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/add"
              element={
                <AddNoteView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/:url.html"
              element={
                <SingleNoteView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/:tag.tag"
              element={
                <TagNotesView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/:url.change"
              element={
                <EditNoteView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/:url.delete"
              element={
                <DeleteNoteView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
            <Route
              path="/notes/:collection.collection"
              element={<CollectionSwitch />}
            />
            <Route
              path="*"
              element={
                <NotFoundView
                  setTitle={setPageTitle}
                  setUnderheader={setUnderheaderData}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </>
  )
}

// Underheader content component
function UnderheaderContent({ data }) {
  const getDateSpan = (d) => {
    const split = d.toISOString().split('T')
    return (
      <span title={`${split[0]} ${split[1].slice(0, 8)}`}>{split[0]}</span>
    )
  }

  return (
    <>
      <Link to={`${data.url}.change`}>
        <img
          src="/client/img/pencil_icon.svg"
          style={{ marginTop: 3, verticalAlign: 'top', width: 10, height: 10 }}
          alt="Edit"
        />
      </Link>
      &nbsp;&nbsp;
      <Link to={`${data.url}.clone`}>
        <img
          src="/client/img/copy_icon.svg"
          style={{ marginTop: 3, verticalAlign: 'top', width: 10, height: 10 }}
          alt="Clone"
        />
      </Link>
      &nbsp;&nbsp;
      <Link to={`${data.url}.delete`}>
        <img
          src="/client/img/x_icon.svg"
          style={{ marginTop: 3, verticalAlign: 'top', width: 10, height: 10 }}
          alt="Delete"
        />
      </Link>
      &nbsp;&nbsp;&nbsp;
      <strong>Created</strong>:&nbsp;&nbsp;{getDateSpan(data.created)}
      {data.modified && (
        <>
          &nbsp;&nbsp;&nbsp;
          <strong>Modified</strong>:&nbsp;&nbsp;{getDateSpan(data.modified)}
        </>
      )}
    </>
  )
}

// Collection switch component
function CollectionSwitchWidget() {
  const collection = getCollection()

  return (
    <ul className="tags aside">
      {COLLECTIONS.map((c) => (
        <li key={c} className={c === collection ? 'active' : ''}>
          {c === collection ? (
            <span>{c}</span>
          ) : (
            <Link to={`/notes/${c}.collection`}>{c}</Link>
          )}
        </li>
      ))}
    </ul>
  )
}

// Collection switch route handler
function CollectionSwitch() {
  const { collection } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('collection', collection)
    navigate('/notes/all')
  }, [collection, navigate])

  return <LoadingIndicator />
}

// Loading indicator
function LoadingIndicator() {
  return <div id="loading" style={{ display: 'block' }} />
}

// All Notes View
function AllNotesView({ setTitle, setUnderheader }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const { get } = useApi()

  useEffect(() => {
    setTitle('')
    setUnderheader(null)

    get(withCollection(ENDPOINTS.NOTES_LIST))
      .then((data) => {
        setNotes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [get, setTitle, setUnderheader])

  if (loading) return <LoadingIndicator />

  const columns = chunk(notes, 3)

  return (
    <div id="content">
      <CollectionSwitchWidget />
      <h2>All Notes</h2>
      <div className="row">
        {columns.map((col, i) => (
          <div key={i} className="col">
            <ul>
              {col.map((note) => (
                <li key={note.url}>
                  <Link to={`/notes/${note.url}.html`}>{note.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// Tree View
function TreeView({ setTitle, setUnderheader }) {
  const [tree, setTree] = useState({})
  const [loading, setLoading] = useState(true)
  const { get } = useApi()

  useEffect(() => {
    setTitle('')
    setUnderheader(null)

    get(withCollection(ENDPOINTS.NOTES_LIST))
      .then((data) => {
        const treeData = {}
        data.forEach((note) => {
          let current = treeData
          note.tree.forEach((node) => {
            if (!current[node]) {
              current[node] = {}
            }
            current = current[node]
          })
          if (!current.notes) {
            current.notes = []
          }
          current.notes.push(note)
        })
        setTree(treeData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [get, setTitle, setUnderheader])

  if (loading) return <LoadingIndicator />

  const renderNotes = (notes) => (
    <ul>
      {notes.map((note) => (
        <li key={note.url}>
          <Link to={`/notes/${note.url}.html`}>{note.title}</Link>
        </li>
      ))}
    </ul>
  )

  const renderNodes = (nodes) => (
    <ul>
      {Object.keys(nodes).map((key) => {
        if (key === 'notes') return null
        return (
          <li key={key}>
            <strong
              onClick={(e) =>
                e.target.nextSibling?.classList.toggle('active')
              }
            >
              {key}
            </strong>
            {nodes[key].notes
              ? renderNotes(nodes[key].notes)
              : renderNodes(nodes[key])}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div id="content">
      <h2>All Notes</h2>
      <div id="node-content" className="notes-tree">
        {renderNodes(tree)}
      </div>
    </div>
  )
}

// Tags View
function TagsView({ setTitle, setUnderheader }) {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const { get } = useApi()

  useEffect(() => {
    setTitle('')
    setUnderheader(null)

    get(withCollection(ENDPOINTS.NOTES_TAGS))
      .then((data) => {
        setTags(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [get, setTitle, setUnderheader])

  if (loading) return <LoadingIndicator />

  return (
    <div id="content">
      <div style={{ textAlign: 'center' }}>
        <ul className="tags">
          {tags.map((tag) => (
            <li key={tag.id}>
              <Link to={`/notes/${tag.id}.tag`}>
                {tag.id} ({tag.count})
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Tag Notes View
function TagNotesView({ setTitle, setUnderheader }) {
  const { tag } = useParams()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const { get } = useApi()

  useEffect(() => {
    setTitle(tag.replace('-', ' '))
    setUnderheader(null)

    get(withCollection(ENDPOINTS.NOTES_TAG + tag))
      .then((data) => {
        setNotes(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [tag, get, setTitle, setUnderheader])

  if (loading) return <LoadingIndicator />

  return (
    <div id="content">
      <h2>
        All notes for <em>{tag}</em>
      </h2>
      <ul>
        {notes.map((note) => (
          <li key={note.url}>
            <Link to={`/notes/${note.url}.html`}>{note.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Single Note View
function SingleNoteView({ setTitle, setUnderheader }) {
  const { url } = useParams()
  const noteUrl = url.replace('.html', '')
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const { get } = useApi()

  useEffect(() => {
    get(withCollection(ENDPOINTS.NOTES_SINGLE + noteUrl))
      .then((data) => {
        setNote(data)
        setTitle(data.title)

        const modified = new Date(data.modified)
        setUnderheader({
          url: noteUrl,
          created: objectId2date(data.id),
          modified: modified.getYear() >= 0 ? modified : null
        })

        setLoading(false)

        // Highlight code and render math
        setTimeout(() => {
          if (window.Prism) window.Prism.highlightAll()
          if (window.MathJax?.Hub) {
            window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub])
          }
        }, 100)
      })
      .catch(() => setLoading(false))
  }, [noteUrl, get, setTitle, setUnderheader])

  if (loading) return <LoadingIndicator />
  if (!note) return <div id="content">Note not found</div>

  // Process content to add anchors
  const processContent = (content) => {
    return content.replace(/<h3>(.+)<\/h3>/g, (match, section) => {
      const anchor = section
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .join('-')
      return `<span class="anchor" id="${anchor}"></span><h3><span>${section}</span>&nbsp;<small><a href="#${anchor}">#</a></small></h3>`
    })
  }

  return (
    <div id="content">
      <ul className="tags aside">
        {note.tags.map((tag) => (
          <li key={tag}>
            <Link to={`/notes/${tag}.tag`} rel="tag">
              {tag}
            </Link>
          </li>
        ))}
      </ul>
      <h2>{note.title}</h2>
      <div
        id="note-content"
        dangerouslySetInnerHTML={{ __html: processContent(note.content) }}
      />
    </div>
  )
}

// Random Note View
function RandomNoteView({ setTitle, setUnderheader }) {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const { get } = useApi()

  useEffect(() => {
    get(withCollection(ENDPOINTS.NOTES_RANDOM))
      .then((data) => {
        setNote(data)
        setTitle(data.title)

        const modified = new Date(data.modified)
        setUnderheader({
          url: data.url,
          created: objectId2date(data.id),
          modified: modified.getYear() >= 0 ? modified : null
        })

        setLoading(false)

        setTimeout(() => {
          if (window.Prism) window.Prism.highlightAll()
          if (window.MathJax?.Hub) {
            window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub])
          }
        }, 100)
      })
      .catch(() => setLoading(false))
  }, [get, setTitle, setUnderheader])

  if (loading) return <LoadingIndicator />
  if (!note) return <div id="content">No notes found</div>

  const processContent = (content) => {
    return content.replace(/<h3>(.+)<\/h3>/g, (match, section) => {
      const anchor = section
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .join('-')
      return `<span class="anchor" id="${anchor}"></span><h3><span>${section}</span>&nbsp;<small><a href="#${anchor}">#</a></small></h3>`
    })
  }

  return (
    <div id="content">
      <ul className="tags aside">
        {note.tags.map((tag) => (
          <li key={tag}>
            <Link to={`/notes/${tag}.tag`} rel="tag">
              {tag}
            </Link>
          </li>
        ))}
      </ul>
      <h2>{note.title}</h2>
      <div
        id="note-content"
        dangerouslySetInnerHTML={{ __html: processContent(note.content) }}
      />
    </div>
  )
}

// Add Note View
function AddNoteView({ setTitle, setUnderheader }) {
  const navigate = useNavigate()
  const { post } = useApi()

  useEffect(() => {
    setTitle('')
    setUnderheader(null)
  }, [setTitle, setUnderheader])

  const handleSubmit = async (formData) => {
    try {
      const result = await post(withCollection(ENDPOINTS.NOTES_CREATE), {
        note: {
          title: formData.title,
          url: formData.url,
          content: formData.content,
          tags: formData.tags.split(/,\s*/),
          tree: formData.tree.split(/,\s*/)
        },
        id: '',
        password: formData.password
      })

      if (result) {
        navigate('/notes/all')
      }
    } catch (err) {
      console.error('Failed to add note:', err)
    }
  }

  return (
    <div id="content">
      <NoteForm title="Add note" onSubmit={handleSubmit} />
    </div>
  )
}

// Edit Note View
function EditNoteView({ setTitle, setUnderheader }) {
  const { url } = useParams()
  const noteUrl = url.replace('.change', '')
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { get, put } = useApi()

  useEffect(() => {
    setTitle('')
    setUnderheader(null)

    get(withCollection(ENDPOINTS.NOTES_SINGLE + noteUrl))
      .then((data) => {
        setNote(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [noteUrl, get, setTitle, setUnderheader])

  const handleSubmit = async (formData) => {
    try {
      const result = await put(withCollection(ENDPOINTS.NOTES_SINGLE + noteUrl), {
        note: {
          title: formData.title,
          url: formData.url,
          content: formData.content,
          tags: formData.tags.split(/,\s*/),
          tree: formData.tree.split(/,\s*/)
        },
        id: '',
        password: formData.password
      })

      if (result) {
        navigate(`/notes/${formData.url}.html`)
      }
    } catch (err) {
      console.error('Failed to update note:', err)
    }
  }

  if (loading) return <LoadingIndicator />
  if (!note) return <div id="content">Note not found</div>

  return (
    <div id="content">
      <NoteForm
        title="Change note"
        initialData={{
          title: note.title,
          url: note.url,
          content: note.content,
          tags: note.tags.join(', '),
          tree: note.tree?.join(', ') || ''
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

// Delete Note View
function DeleteNoteView({ setTitle, setUnderheader }) {
  const { url } = useParams()
  const noteUrl = url.replace('.delete', '')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { del } = useApi()

  useEffect(() => {
    setTitle('')
    setUnderheader(null)
  }, [setTitle, setUnderheader])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const endpoint =
        withCollection(ENDPOINTS.NOTES_SINGLE + noteUrl) +
        '/' +
        btoa(password)

      const result = await del(endpoint)

      if (result) {
        navigate('/notes/all')
      }
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  return (
    <div id="content">
      <form onSubmit={handleSubmit}>
        <h2>Delete note</h2>
        <div className="form-group">
          <label htmlFor="form-password">password</label>
          <input
            type="password"
            id="form-password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

// Not Found View
function NotFoundView({ setTitle, setUnderheader }) {
  useEffect(() => {
    setTitle('')
    setUnderheader(null)
  }, [setTitle, setUnderheader])

  return <div id="content">Not found!</div>
}

// Note Form Component
function NoteForm({ title, initialData = {}, onSubmit }) {
  const [formData, setFormData] = useState({
    password: '',
    title: initialData.title || '',
    url: initialData.url || '',
    content: initialData.content || '',
    tags: initialData.tags || '',
    tree: initialData.tree || ''
  })

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-generate URL from title
      if (field === 'title' && !prev.url) {
        newData.url = value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^0-9a-z-]+/g, '')
      }

      return newData
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>

      <div className="form-group">
        <label htmlFor="form-password">password</label>
        <input
          type="password"
          id="form-password"
          name="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="form-title">title</label>
        <input
          type="text"
          id="form-title"
          name="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="form-url">url</label>
        <input
          type="text"
          id="form-url"
          name="url"
          value={formData.url}
          onChange={(e) => handleChange('url', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="form-content">content</label>
        <Editor
          id="content"
          value={formData.content}
          onChange={(value) => handleChange('content', value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="form-tags">tags</label>
        <input
          type="text"
          id="form-tags"
          name="tags"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="form-tree">tree</label>
        <input
          type="text"
          id="form-tree"
          name="tree"
          value={formData.tree}
          onChange={(e) => handleChange('tree', e.target.value)}
        />
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}
