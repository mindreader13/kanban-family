/**
 * Task Component - Renders a single task card
 */
export class TaskComponent {
    constructor(task, onEdit, onArchive, onDelete, onToggleSubtask, onDragStart, onDragEnd) {
        this.task = task;
        this.onEdit = onEdit;
        this.onArchive = onArchive;
        this.onDelete = onDelete;
        this.onToggleSubtask = onToggleSubtask;
        this.onDragStart = onDragStart;
        this.onDragEnd = onDragEnd;
    }

    render() {
        const dueClass = this.getDueClass(this.task.due);
        const subtasksHtml = this.renderSubtasks();
        const tagsHtml = this.renderTags();
        const quickActions = this.renderQuickActions();

        return `
            <div class="task" 
                 draggable="true" 
                 data-id="${this.task.id}"
                 data-status="${this.task.status}"
                 ondragstart="${this.onDragStart}"
                 ondragend="${this.onDragEnd}"
                 tabindex="0"
                 onkeydown="handleTaskKeydown(event, '${this.task.id}', '${this.task.status}')">
                <div class="task-actions">
                    <button class="task-btn" onclick="${this.onEdit}('${this.task.id}')">✏️</button>
                    <button class="task-btn" onclick="${this.onArchive}('${this.task.id}')">📦</button>
                    <button class="task-btn delete" onclick="${this.onDelete}('${this.task.id}')">🗑️</button>
                </div>
                <div class="task-title">${this.task.title}</div>
                ${this.task.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">${this.task.description}</div>` : ''}
                <div class="task-meta">
                    ${this.task.due ? `<span class="task-due ${dueClass}">📅 ${this.formatDate(this.task.due)}</span>` : ''}
                    ${tagsHtml}
                </div>
                ${subtasksHtml}
                ${quickActions}
            </div>
        `;
    }

    renderQuickActions() {
        const currentStatus = this.task.status;
        let actions = '';

        if (currentStatus === 'todo') {
            actions = `<button class="task-btn" style="color: #4facfe; font-size: 0.8rem;" onclick="moveTaskTo('${this.task.id}', 'inprogress')">🚀 進行中</button>`;
        } else if (currentStatus === 'inprogress') {
            actions = `<button class="task-btn" style="color: #43e97b; font-size: 0.8rem;" onclick="moveTaskTo('${this.task.id}', 'done')">✅ 完成</button>`;
        } else if (currentStatus === 'done') {
            actions = `<button class="task-btn" style="color: #f093fb; font-size: 0.8rem;" onclick="moveTaskTo('${this.task.id}', 'todo')">📝 待處理</button>`;
        }

        return actions ? `<div class="quick-actions" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-color);">${actions}</div>` : '';
    }

    renderSubtasks() {
        if (!this.task.subtasks || this.task.subtasks.length === 0) return '';
        
        return `
            <div class="task-subtasks">
                ${this.task.subtasks.map((st, i) => `
                    <div class="subtask ${st.completed ? 'completed' : ''}">
                        <input type="checkbox" 
                               ${st.completed ? 'checked' : ''} 
                               onchange="${this.onToggleSubtask}('${this.task.id}', ${i})">
                        <span>${st.text}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTags() {
        if (!this.task.tags || this.task.tags.length === 0) return '';
        
        return `
            <div class="task-tags">
                ${this.task.tags.map(tag => `
                    <span class="tag tag-${tag.type || 'other'}">${tag.text}</span>
                `).join('')}
            </div>
        `;
    }

    getDueClass(due) {
        if (!due) return '';
        const today = new Date();
        today.setHours(0,0,0,0);
        const dueDate = new Date(due);
        const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'overdue';
        if (diff <= 2) return 'soon';
        return '';
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const time = dateStr.includes('T') ? dateStr.split('T')[1].substring(0, 5) : '';
        return time ? `${date.getMonth() + 1}/${date.getDate()} ${time}` : `${date.getMonth() + 1}/${date.getDate()}`;
    }
}