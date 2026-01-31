/**
 * Firestore Data Layer
 */
import { db } from './firebase.js';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export class TaskStore {
    constructor(userId) {
        this.userId = userId;
        this.tasks = [];
        this.listeners = [];
    }

    // Get tasks collection reference
    _tasksRef() {
        return collection(db, 'users', this.userId, 'tasks');
    }

    // Real-time listener
    subscribe(callback) {
        const q = query(this._tasksRef(), orderBy('created', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            this.tasks = [];
            snapshot.forEach(doc => {
                this.tasks.push({ id: doc.id, ...doc.data() });
            });
            callback(this.tasks);
        });
        this.listeners.push(unsubscribe);
        return unsubscribe;
    }

    // Add or update task
    async saveTask(task) {
        const taskData = {
            title: task.title,
            description: task.description || '',
            due: task.due || '',
            tags: task.tags || [],
            subtasks: task.subtasks || [],
            status: task.status,
            board: task.board,
            created: task.created || new Date().toISOString()
        };

        if (task.id) {
            await setDoc(doc(this._tasksRef(), task.id), taskData);
        } else {
            const newDoc = doc(this._tasksRef());
            await setDoc(newDoc, taskData);
        }
    }

    // Delete task
    async deleteTask(taskId) {
        await deleteDoc(doc(this._tasksRef(), taskId));
    }

    // Update task status
    async updateStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            await this.saveTask(task);
        }
    }

    // Get tasks by board and status
    getTasksByStatus(boardId, status) {
        return this.tasks.filter(t => t.board === boardId && t.status === status);
    }

    // Get all tasks for a board
    getTasksForBoard(boardId) {
        return this.tasks.filter(t => t.board === boardId);
    }
}

export class BoardStore {
    constructor(userId) {
        this.userId = userId;
        this.boards = { 'default': { name: 'Default Board' } };
    }

    _boardsRef() {
        return collection(db, 'users', this.userId, 'boards');
    }

    async loadBoards() {
        const snapshot = await getDocs(this._boardsRef());
        this.boards = { 'default': { name: 'Default Board' } };
        snapshot.forEach(doc => {
            this.boards[doc.id] = doc.data();
        });
        return this.boards;
    }

    async createBoard(name) {
        const id = 'board_' + Date.now();
        this.boards[id] = { name: name };
        await setDoc(doc(this._boardsRef(), id), { name: name });
        return id;
    }

    getBoards() {
        return this.boards;
    }
}