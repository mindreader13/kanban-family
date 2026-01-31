# Kanban V2 - Modular Structure

A refactored version of the family kanban board with a professional project structure.

## Project Structure

```
kanban-v2/
├── index.html              # Main HTML entry point
├── css/
│   └── style.css           # All styles
├── js/
│   ├── app.js              # Main application logic & initialization
│   ├── firebase.js         # Firebase configuration & auth setup
│   ├── store.js            # Data layer (TaskStore, BoardStore)
│   ├── theme.js            # Theme manager (light/dark mode)
│   └── components/
│       ├── Task.js         # Task card component
│       ├── Column.js       # Column component
│       └── Modal.js        # Task modal component
└── assets/                 # For images, fonts, etc.
```

## Features

- ✅ Firebase Authentication (Google Sign-In)
- ✅ Cloud Firestore (Real-time sync)
- ✅ Theme Support (Light/Dark mode)
- ✅ Tags (Work, Personal, Urgent, Other)
- ✅ Due Dates with time
- ✅ Subtasks with checkboxes
- ✅ Multiple Boards
- ✅ Archive
- ✅ Drag & Drop

## Running Locally

Since this uses ES modules, you need to serve it via a web server:

### Option 1: Python
```bash
cd kanban-v2
python3 -m http.server 8080
```

### Option 2: Node.js (http-server)
```bash
cd kanban-v2
npx http-server -p 8080
```

### Option 3: VS Code Live Server
Open the folder in VS Code and use "Live Server" extension.

## Tech Stack

- **Vanilla JavaScript (ES6+ Modules)**
- **Firebase SDK v10** (Auth + Firestore)
- **CSS Variables** for theming
- **No build step required**

## Ported from

Original single-file version: `/root/clawd/kanban/index.html`
