/**
 * Kanban App - Main Entry Point
 */
import { auth, provider } from './firebase.js';
import { TaskStore, BoardStore } from './store.js';
import { ThemeManager } from './theme.js';
import { TaskComponent } from './components/Task.js';
import { ColumnComponent } from './components/Column.js';
import { TaskModal } from './components/Modal.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Global state
window.currentUser = null;
window.currentBoard = 'default';
window.draggedTask = null;
let taskStore = null;
let boardStore = null;
let themeManager = null;
window.taskModal = null;

// Save task function (defined early for modal to use)
window.saveTask = async (task) => {
    if (taskStore) {
        await taskStore.saveTask(task);
    }
};

// Initialize app
async function init() {
    themeManager = new ThemeManager();
    window.taskModal = new TaskModal(window.saveTask, () => window.taskModal.close());
    
    // Auth state listener
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            window.currentUser = user;
            showMainApp(user);
            await initStores(user.uid);
        } else {
            showLoginScreen();
        }
    });

    // Setup drag & drop
    setupDragDrop();
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

async function initStores(userId) {
    taskStore = new TaskStore(userId);
    boardStore = new BoardStore(userId);
    
    // Load boards
    await boardStore.loadBoards();
    updateBoardSelector();
    
    // Subscribe to tasks
    taskStore.subscribe(render);
}

// Auth functions
window.signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Login error:', error);
        alert('登入失敗: ' + error.message);
    }
};

window.signOut = async () => {
    try {
        await signOut(auth);
        // Clear state - onAuthStateChanged will handle UI update
    } catch (error) {
        console.error('Logout error:', error);
        // Fallback: force reload
        window.location.reload();
    }
};

function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

function showMainApp(user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('user-name').textContent = user.displayName || 'User';
    document.getElementById('user-avatar').textContent = (user.displayName || 'U')[0].toUpperCase();
}

// Board functions
window.openBoardModal = () => {
    document.getElementById('board-modal').classList.add('active');
};

window.closeBoardModal = () => {
    document.getElementById('board-modal').classList.remove('active');
    document.getElementById('board-name').value = '';
};

window.createBoard = async () => {
    const name = document.getElementById('board-name').value.trim();
    if (!name) {
        alert('請輸入看板名稱');
        return;
    }
    const id = await boardStore.createBoard(name);
    updateBoardSelector();
    closeBoardModal();
    switchBoard(id);
};

function updateBoardSelector() {
    const selector = document.getElementById('board-selector');
    const boards = boardStore.getBoards();
    selector.innerHTML = Object.entries(boards).map(([id, board]) => 
        `<option value="${id}" ${id === window.currentBoard ? 'selected' : ''}>${board.name}</option>`
    ).join('');
}

window.switchBoard = (boardId) => {
    window.currentBoard = boardId;
    render();
};

window.deleteCurrentBoard = async () => {
    if (window.currentBoard === 'default') {
        alert('不能刪除預設看板');
        return;
    }
    if (!confirm('確定要刪除這個看板嗎？所有任務都會被刪除！')) return;
    
    await boardStore.deleteBoard(window.currentBoard);
    window.currentBoard = 'default';
    updateBoardSelector();
    render();
};

// Archive functions
window.openArchiveModal = () => {
    const tasks = taskStore.getTasksForBoard(window.currentBoard);
    const archivedTasks = tasks.filter(t => t.status === 'archive');
    const container = document.getElementById('archive-list-modal');
    container.innerHTML = archivedTasks.length ? archivedTasks.map(task => `
        <div class="task" style="margin-bottom: 10px;">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                <span>${new Date(task.created).toLocaleDateString('zh-TW')}</span>
                <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="unarchiveTask('${task.id}')">復原</button>
                <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem; color: #ff6b6b;" onclick="deleteTask('${task.id}')">刪除</button>
            </div>
        </div>
    `).join('') : '<p style="color: var(--text-muted); text-align: center;">沒有封存任務</p>';
    document.getElementById('archive-modal').classList.add('active');
};

window.closeArchiveModal = () => {
    document.getElementById('archive-modal').classList.remove('active');
};

window.unarchiveTask = async (id) => {
    await taskStore.updateStatus(id, 'todo');
    openArchiveModal();
};

// Task functions
window.openTaskModal = (status, taskId = null) => {
    if (taskId) {
        const task = taskStore.tasks.find(t => t.id === taskId);
        taskModal.open(status, task);
    } else {
        taskModal.open(status, null);
    }
};

window.deleteTask = async (id) => {
    if (confirm('確定要刪除這個任務嗎？')) {
        await taskStore.deleteTask(id);
    }
};

window.archiveTask = async (id) => {
    await taskStore.updateStatus(id, 'archive');
};

window.editTask = (id) => {
    const task = taskStore.tasks.find(t => t.id === id);
    if (task) {
        window.openTaskModal(task.status, id);
    }
};

window.toggleSubtask = async (taskId, subtaskIndex) => {
    const task = taskStore.tasks.find(t => t.id === taskId);
    if (task && task.subtasks && task.subtasks[subtaskIndex]) {
        task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
        await taskStore.saveTask(task);
    }
};

// Quick status change
window.moveTaskTo = async (taskId, newStatus) => {
    await taskStore.updateStatus(taskId, newStatus);
};

// Keyboard shortcuts for tasks
window.handleTaskKeydown = (event, taskId, currentStatus) => {
    if (event.key === '1') {
        event.preventDefault();
        taskStore.updateStatus(taskId, 'todo');
    } else if (event.key === '2') {
        event.preventDefault();
        taskStore.updateStatus(taskId, 'inprogress');
    } else if (event.key === '3') {
        event.preventDefault();
        taskStore.updateStatus(taskId, 'done');
    } else if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
        const task = taskStore.tasks.find(t => t.id === taskId);
        if (task) window.openTaskModal(task.status, taskId);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (confirm('確定要刪除這個任務嗎？')) {
            taskStore.deleteTask(taskId);
        }
    }
};

// Drag & Drop
function setupDragDrop() {
    window.dragStart = (e) => {
        window.draggedTask = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    };
    
    window.dragEnd = (e) => {
        e.target.classList.remove('dragging');
        window.draggedTask = null;
    };
    
    window.handleDrop = async (e) => {
        e.preventDefault();
        const list = e.target.closest('.task-list');
        if (list && window.draggedTask) {
            const newStatus = list.id.replace('-list', '');
            const taskId = window.draggedTask.dataset.id;
            await taskStore.updateStatus(taskId, newStatus);
        }
    };
}

// Render
function render() {
    if (!taskStore) return;
    
    const tasks = taskStore.getTasksForBoard(window.currentBoard);
    
    const columns = [
        { status: 'todo', title: '📝 待處理', tasks: tasks.filter(t => t.status === 'todo') },
        { status: 'inprogress', title: '🔥 進行中', tasks: tasks.filter(t => t.status === 'inprogress') },
        { status: 'done', title: '✅ 已完成', tasks: tasks.filter(t => t.status === 'done') },
        { status: 'archive', title: '📦 封存', tasks: tasks.filter(t => t.status === 'archive') }
    ];
    
    columns.forEach(col => {
        const list = document.getElementById(`${col.status}-list`);
        const count = document.querySelector(`.${col.status} .task-count`);
        
        // Create TaskComponents
        const taskComponents = col.tasks.map(task => 
            new TaskComponent(
                task,
                'editTask',
                'archiveTask',
                'deleteTask',
                'toggleSubtask',
                'dragStart',
                'dragEnd'
            )
        );
        
        list.innerHTML = taskComponents.map(tc => tc.render()).join('');
        count.textContent = col.tasks.length;
    });
}

// Make functions globally available
window.toggleTheme = () => themeManager.toggle();

// Start the app
init();