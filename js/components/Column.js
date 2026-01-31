/**
 * Column Component - Renders a task column
 */
export class ColumnComponent {
    constructor(status, title, tasks, onAddTask, onDrop) {
        this.status = status;
        this.title = title;
        this.tasks = tasks;
        this.onAddTask = onAddTask;
        this.onDrop = onDrop;
    }

    render() {
        return `
            <div class="column ${this.status}" data-status="${this.status}">
                <div class="column-header">
                    <span class="column-title">${this.title}</span>
                    <span class="task-count">${this.tasks.length}</span>
                </div>
                <div class="task-list" id="${this.status}-list" 
                     ondragover="event.preventDefault()" 
                     ondrop="${this.onDrop}">
                    ${this.tasks.map(task => task.render()).join('')}
                </div>
                ${this.status !== 'archive' ? `<button class="add-task" onclick="${this.onAddTask}('${this.status}')">+ 新增任務</button>` : ''}
            </div>
        `;
    }
}