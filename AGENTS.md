# KANBAN FAMILY - AGENTS KNOWLEDGE BASE

**Generated:** 2026-01-31  
**Stack:** Vanilla JS (ES6+), Firebase SDK v10, CSS Variables  
**Type:** Client-side Kanban board with real-time sync

---

## OVERVIEW

Family Kanban Board with Firebase Auth + Firestore. Uses vanilla JavaScript ES6 modules with no build step required. Features: drag-drop, themes, subtasks, tags, due dates, multiple boards, archive.

---

## STRUCTURE

```
./
├── index.html              # Entry point, loads js/app.js
├── css/style.css           # CSS variables for theming
├── js/
│   ├── app.js              # Main: init, auth, render orchestration
│   ├── firebase.js         # Firebase config + auth setup
│   ├── store.js            # TaskStore, BoardStore (Firestore)
│   ├── theme.js            # ThemeManager (light/dark)
│   └── components/
│       ├── Task.js         # Task card component
│       ├── Column.js       # Column wrapper (unused - see NOTE)
│       └── Modal.js        # Task modal component
└── tests/
    ├── run-tests.js        # Custom test runner
    └── kanban.spec.js      # Playwright tests
```

---

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Auth flow | `js/app.js` | `signInWithGoogle()`, `signOut()`, `onAuthStateChanged` |
| Data operations | `js/store.js` | `TaskStore.saveTask()`, `TaskStore.updateStatus()` |
| Task rendering | `js/components/Task.js` | `TaskComponent.render()` returns HTML string |
| Modal UI | `js/components/Modal.js` | `TaskModal.open()`, `close()`, `save()` |
| Theme toggle | `js/theme.js` | CSS variable switching |
| Drag & drop | `js/app.js` | `setupDragDrop()`, `dragStart/End`, `handleDrop` |
| Keyboard shortcuts | `js/app.js` | `handleTaskKeydown()` - 1/2/3 for status, E for edit, Del to delete |

---

## CONVENTIONS

**Module Pattern:**
- ES6 modules with CDN Firebase imports
- Global functions attached to `window.*` for HTML onclick handlers
- Components are classes with `render()` returning HTML strings

**Data Flow:**
- `TaskStore.subscribe(callback)` for real-time updates
- `render()` called on every Firestore snapshot change
- Global state: `window.currentUser`, `window.currentBoard`, `window.draggedTask`

**Status Values:**
- `'todo'`, `'inprogress'`, `'done'`, `'archive'`
- Archive is a status, not a separate collection

**Firebase Paths:**
- `users/{userId}/tasks` - tasks collection
- `users/{userId}/boards` - boards collection

---

## ANTI-PATTERNS (DO NOT)

- **DO NOT** delete the default board - protected in `deleteCurrentBoard()`
- **DO NOT** use `Column.js` - column rendering is inline in `app.js render()`
- **DO NOT** modify `taskStore.tasks` directly - always use `saveTask()` or `updateStatus()`

---

## UNIQUE STYLES

**Component Pattern:**
```js
// Components return HTML strings, not DOM nodes
const component = new TaskComponent(task, ...callbacks);
list.innerHTML = taskComponents.map(tc => tc.render()).join('');
```

**Callback Strings:**
```js
// Callbacks passed as string names, resolved via window.*
new TaskComponent(task, 'editTask', 'archiveTask', ...)
// In render(): onclick="${this.onEdit}('${this.task.id}')"
```

**Bilingual UI:**
- Interface in Traditional Chinese (zh-TW)
- Code/comments in English

---

## COMMANDS

```bash
# Serve locally (required for ES modules)
npm run serve           # http-server on :8080
npm run serve:python    # Python http.server on :8080

# Test
npm test                # Custom test runner
npm run test:playwright # Playwright E2E tests
```

---

## NOTES

- `Column.js` exists but is unused - columns render inline in `app.js`
- `dragStart/End/Drop` attached to `window` for HTML attribute access
- Time input preserved but display simplified to HH:MM
- No build step - serve directly from filesystem
