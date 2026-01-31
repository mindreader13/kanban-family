import { LIMITS, TAG_TYPES } from './constants.js';

export const ValidationError = class extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'ValidationError';
    }
};

export function validateTaskTitle(title) {
    if (!title || typeof title !== 'string') {
        throw new ValidationError('任務名稱不能為空', 'title');
    }
    const trimmed = title.trim();
    if (trimmed.length === 0) {
        throw new ValidationError('任務名稱不能為空', 'title');
    }
    if (trimmed.length > LIMITS.MAX_TITLE_LENGTH) {
        throw new ValidationError(`任務名稱不能超過 ${LIMITS.MAX_TITLE_LENGTH} 個字元`, 'title');
    }
    return trimmed;
}

export function validateTaskDescription(description) {
    if (!description || typeof description !== 'string') {
        return '';
    }
    if (description.length > LIMITS.MAX_DESCRIPTION_LENGTH) {
        throw new ValidationError(`描述不能超過 ${LIMITS.MAX_DESCRIPTION_LENGTH} 個字元`, 'description');
    }
    return description.trim();
}

export function validateTag(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }
    const trimmed = text.trim();
    if (trimmed.length === 0) {
        return null;
    }
    if (trimmed.length > LIMITS.MAX_TAG_LENGTH) {
        throw new ValidationError(`標籤不能超過 ${LIMITS.MAX_TAG_LENGTH} 個字元`, 'tag');
    }
    return trimmed;
}

export function validateTags(tags) {
    if (!Array.isArray(tags)) {
        return [];
    }
    if (tags.length > LIMITS.MAX_TAGS) {
        throw new ValidationError(`標籤數量不能超過 ${LIMITS.MAX_TAGS} 個`, 'tags');
    }
    return tags.map(tag => ({
        text: validateTag(tag.text) || '',
        type: Object.values(TAG_TYPES).includes(tag.type) ? tag.type : TAG_TYPES.OTHER
    })).filter(tag => tag.text);
}

export function validateSubtask(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }
    const trimmed = text.trim();
    if (trimmed.length === 0) {
        return null;
    }
    if (trimmed.length > LIMITS.MAX_SUBTASK_LENGTH) {
        throw new ValidationError(`子任務不能超過 ${LIMITS.MAX_SUBTASK_LENGTH} 個字元`, 'subtask');
    }
    return trimmed;
}

export function validateSubtasks(subtasks) {
    if (!Array.isArray(subtasks)) {
        return [];
    }
    if (subtasks.length > LIMITS.MAX_SUBTASKS) {
        throw new ValidationError(`子任務數量不能超過 ${LIMITS.MAX_SUBTASKS} 個`, 'subtasks');
    }
    return subtasks
        .map(st => ({
            text: validateSubtask(st.text) || '',
            completed: !!st.completed
        }))
        .filter(st => st.text);
}

export function validateBoardName(name) {
    if (!name || typeof name !== 'string') {
        throw new ValidationError('看板名稱不能為空', 'boardName');
    }
    const trimmed = name.trim();
    if (trimmed.length === 0) {
        throw new ValidationError('看板名稱不能為空', 'boardName');
    }
    if (trimmed.length > 50) {
        throw new ValidationError('看板名稱不能超過 50 個字元', 'boardName');
    }
    return trimmed;
}
