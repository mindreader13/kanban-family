import { escapeHtml, escapeAttr } from '../utils/sanitize.js';
import { validateTaskTitle, validateTaskDescription, validateTags, validateSubtasks, ValidationError } from '../utils/validation.js';
import { withErrorHandling, createLoadingState } from '../utils/errorHandler.js';

export class TaskModal {
    constructor(onSave, onClose) {
        this.onSave = onSave;
        this.onClose = onClose;
        this.currentTags = [];
        this.editingTask = null;
        this.currentStatus = 'todo';
    }

    open(status, task = null) {
        this.currentStatus = status;
        this.editingTask = task;
        this.currentTags = task ? [...(task.tags || [])] : [];
        
        const modal = document.getElementById('task-modal');
        const titleEl = modal.querySelector('.modal-title');
        
        // Reset form
        document.getElementById('task-title').value = task ? task.title : '';
        document.getElementById('task-desc').value = task ? task.description || '' : '';
        
        // Split date and time from due field
        let dueDate = '';
        let dueTime = '';
        if (task && task.due) {
            if (task.due.includes('T')) {
                const parts = task.due.split('T');
                dueDate = parts[0];
                dueTime = parts[1] ? parts[1].substring(0, 5) : '';
            } else {
                dueDate = task.due;
            }
        }
        document.getElementById('task-due').value = dueDate;
        document.getElementById('task-due-time').value = dueTime;
        
        // Reset tags
        this.updateTagsDisplay();
        
        // Reset subtasks - only if it's a new task or editing existing
        this.resetSubtasks(task ? task.subtasks : []);
        
        titleEl.textContent = task ? '編輯任務' : '新增任務';
        modal.classList.add('active');
    }

    close() {
        document.getElementById('task-modal').classList.remove('active');
        this.editingTask = null;
    }

    async save() {
        const saveBtn = document.querySelector('#task-modal .btn-primary');
        const loading = createLoadingState(saveBtn);

        try {
            loading.start();

            const titleInput = document.getElementById('task-title').value;
            const descriptionInput = document.getElementById('task-desc').value;
            const due = document.getElementById('task-due').value;
            const dueTime = document.getElementById('task-due-time').value;
            const dueDateTime = due && dueTime ? `${due}T${dueTime}:00` : due;

            const title = validateTaskTitle(titleInput);
            const description = validateTaskDescription(descriptionInput);
            const tags = validateTags(this.currentTags);
            const subtasks = validateSubtasks(this.getSubtasks());

            const task = {
                id: this.editingTask?.id,
                title,
                description,
                due: dueDateTime || due,
                tags,
                subtasks,
                status: this.currentStatus,
                board: window.currentBoard,
                created: this.editingTask?.created || new Date().toISOString()
            };

            await this.onSave(task);
            this.close();
        } catch (error) {
            if (error instanceof ValidationError) {
                alert(error.message);
            } else {
                throw error;
            }
        } finally {
            loading.stop();
        }
    }

    // Tag handling
    addTag(text) {
        try {
            if (!text || this.currentTags.length >= 5) {
                return;
            }
            if (this.currentTags.find(t => t.text === text)) {
                return;
            }
            const types = ['work', 'personal', 'urgent', 'other'];
            const type = types[this.currentTags.length % types.length];
            this.currentTags.push({ text: text.substring(0, 20), type });
            this.updateTagsDisplay();
        } catch (error) {
            console.error('Error adding tag:', error);
        }
    }

    removeTag(text) {
        this.currentTags = this.currentTags.filter(t => t.text !== text);
        this.updateTagsDisplay();
    }

    updateTagsDisplay() {
        const container = document.getElementById('tags-container');
        container.innerHTML = this.currentTags.map(tag => `
            <span class="tag-item tag-${escapeAttr(tag.type)}" style="background: var(--tag-${escapeAttr(tag.type)});">
                ${escapeHtml(tag.text)}
                <button onclick="taskModal.removeTag('${escapeAttr(tag.text)}')">×</button>
            </span>
        `).join('') + `
            <input type="text" id="tag-input" placeholder="輸入標籤並按 Enter"
                   onkeypress="if(event.key==='Enter'){event.preventDefault();taskModal.addTag(this.value.trim());this.value='';}">
        `;
    }

    // Subtask handling
    addSubtask() {
        const container = document.getElementById('subtasks-container');
        if (!container) return;
        
        const newItem = document.createElement('div');
        newItem.className = 'subtask-item';
        newItem.innerHTML = `
            <input type="checkbox" onchange="window.taskModal?.updateSubtaskStatus(this)">
            <input type="text" placeholder="輸入子任務" onkeypress="if(event.key==='Enter'){event.preventDefault();window.taskModal?.addSubtask();}">
            <button class="task-btn" onclick="window.taskModal?.removeSubtask(this)">✕</button>
        `;
        container.appendChild(newItem);
        // Focus on the new input
        newItem.querySelector('input[type="text"]').focus();
    }

    removeSubtask(btn) {
        if (!btn || !btn.parentElement) return;
        const container = document.getElementById('subtasks-container');
        if (container && container.children.length > 1) {
            btn.parentElement.remove();
        }
    }

    resetSubtasks(subtasks) {
        const container = document.getElementById('subtasks-container');
        if (!container) return;

        if (subtasks && subtasks.length > 0) {
            container.innerHTML = subtasks.map(st => `
                <div class="subtask-item">
                    <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="window.taskModal?.updateSubtaskStatus(this)">
                    <input type="text" value="${escapeAttr(st.text)}" onkeypress="if(event.key==='Enter'){event.preventDefault();window.taskModal?.addSubtask();}">
                    <button class="task-btn" onclick="window.taskModal?.removeSubtask(this)">✕</button>
                </div>
            `).join('') + `
                <div class="subtask-item">
                    <input type="checkbox" onchange="window.taskModal?.updateSubtaskStatus(this)">
                    <input type="text" placeholder="輸入子任務" onkeypress="if(event.key==='Enter'){event.preventDefault();window.taskModal?.addSubtask();}">
                    <button class="task-btn" onclick="window.taskModal?.removeSubtask(this)">✕</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="subtask-item">
                    <input type="checkbox" onchange="window.taskModal?.updateSubtaskStatus(this)">
                    <input type="text" placeholder="輸入子任務" onkeypress="if(event.key==='Enter'){event.preventDefault();window.taskModal?.addSubtask();}">
                    <button class="task-btn" onclick="window.taskModal?.removeSubtask(this)">✕</button>
                </div>
            `;
        }
    }

    getSubtasks() {
        const container = document.getElementById('subtasks-container');
        if (!container) return [];
        
        const items = container.querySelectorAll('.subtask-item');
        return Array.from(items).map(item => ({
            text: item.querySelector('input[type="text"]')?.value || '',
            completed: item.querySelector('input[type="checkbox"]')?.checked || false
        })).filter(st => st.text.trim());
    }

    updateSubtaskStatus(checkbox) {
        // Placeholder - status updated on save
    }
}