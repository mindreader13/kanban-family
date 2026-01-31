import { ValidationError } from './validation.js';

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-size: 0.9rem;
        z-index: 10000;
        transition: opacity 0.3s;
        ${type === 'error' ? 'background: #ff6b6b;' : type === 'success' ? 'background: #43e97b;' : 'background: #4facfe;'}
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export async function withErrorHandling(asyncFn, errorMessage) {
    try {
        return await asyncFn();
    } catch (error) {
        console.error(errorMessage, error);

        if (error instanceof ValidationError) {
            showToast(error.message, 'error');
        } else if (error.code) {
            showToast(getFirebaseErrorMessage(error.code), 'error');
        } else {
            showToast(errorMessage, 'error');
        }

        throw error;
    }
}

export function getFirebaseErrorMessage(code) {
    const messages = {
        'auth/user-not-found': '找不到使用者',
        'auth/wrong-password': '密碼錯誤',
        'auth/email-already-in-use': '電子郵件已被使用',
        'auth/invalid-email': '無效的電子郵件',
        'auth/weak-password': '密碼強度不足',
        'auth/popup-closed-by-user': '登入視窗被關閉',
        'auth/cancelled-popup-request': '登入被取消',
        'permission-denied': '權限不足',
        'not-found': '資料不存在',
        'already-exists': '資料已存在',
        'resource-exhausted': '操作過於頻繁，請稍後再試',
        'unauthenticated': '請先登入',
        'unavailable': '服務暫時無法使用',
        'deadline-exceeded': '操作超時'
    };
    return messages[code] || '操作失敗，請稍後再試';
}

export function createLoadingState(element) {
    const originalText = element.textContent;
    const originalDisabled = element.disabled;

    return {
        start: () => {
            element.disabled = true;
            element.textContent = '載入中...';
        },
        stop: () => {
            element.disabled = originalDisabled;
            element.textContent = originalText;
        }
    };
}
