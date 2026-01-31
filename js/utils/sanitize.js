const HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

const HTML_ESCAPE_REGEX = /[&<>"'`=/]/g;

export function escapeHtml(text) {
    if (text === null || text === undefined) {
        return '';
    }
    return String(text).replace(HTML_ESCAPE_REGEX, char => HTML_ESCAPE_MAP[char]);
}

export function escapeAttr(text) {
    if (text === null || text === undefined) {
        return '';
    }
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function sanitizeString(text, maxLength = 200) {
    if (typeof text !== 'string') {
        return null;
    }
    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) {
        return null;
    }
    return trimmed;
}

export function sanitizeArray(arr, sanitizer) {
    if (!Array.isArray(arr)) {
        return [];
    }
    return arr
        .map(item => sanitizer(item))
        .filter(item => item !== null && item !== undefined);
}
