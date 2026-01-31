/**
 * Kanban App - Comprehensive Test Suite
 * Run with: npx playwright test tests/kanban.spec.js
 * Or: node tests/kanban.spec.js (with Playwright installed)
 */

const { chromium } = require('playwright');

const BASE_URL = process.env.KANBAN_URL || 'http://localhost:8080';

// Helper to wait for element
const waitFor = (page, selector, timeout = 5000) => 
    page.waitForSelector(selector, { timeout, state: 'visible' });

// Helper to click button with text
const clickByText = async (page, text) => {
    await page.locator(`button:has-text("${text}")`).first().click();
};

describe('Kanban App Tests', () => {
    let browser;
    let page;
    
    beforeAll(async () => {
        browser = await chromium.launch({ headless: true });
        page = await browser.newPage();
        
        // Listen for console messages
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Console Error:', msg.text());
            }
        });
    });
    
    afterAll(async () => {
        await browser.close();
    });
    
    beforeEach(async () => {
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    });
    
    // ============================================
    // AUTH TESTS
    // ============================================
    describe('Authentication', () => {
        test('Login screen is visible when not logged in', async () => {
            await waitFor(page, '#login-screen');
            await expect(page.locator('button:has-text("Google 帳戶登入")')).toBeVisible();
        });
    });
    
    // ============================================
    // TASK CRUD TESTS
    // ============================================
    describe('Task CRUD Operations', () => {
        // These tests assume user is logged in
        // Skip if login screen is visible
        test.skipIfLoggedOut('Create a basic task', async () => {
            // Click add task button
            await clickByText(page, '新增任務');
            await waitFor(page, '#task-modal');
            
            // Fill in title
            await page.fill('#task-title', 'Test Task 1');
            
            // Save
            await clickByText(page, '儲存');
            
            // Verify task appears
            await waitFor(page, '.task:has-text("Test Task 1")');
        });
        
        test.skipIfLoggedOut('Create task with all fields', async () => {
            // Open modal
            await clickByText(page, '新增任務');
            await waitFor(page, '#task-modal');
            
            // Fill title
            await page.fill('#task-title', 'Full Test Task');
            
            // Fill description
            await page.fill('#task-desc', 'This is a test description');
            
            // Set due date
            await page.fill('#task-due', '2026-02-15');
            await page.fill('#task-due-time', '14:30');
            
            // Add tag
            await page.fill('#tag-input', 'Urgent');
            await page.press('#tag-input', 'Enter');
            
            // Add subtask
            await page.fill('#subtasks-container input[type="text"]:last-of-type', 'Subtask 1');
            await page.press('#subtasks-container input[type="text"]:last-of-type', 'Enter');
            
            // Add another subtask
            await clickByText(page, '新增子任務');
            await page.fill('#subtasks-container input[type="text"]:last-of-type', 'Subtask 2');
            
            // Save
            await clickByText(page, '儲存');
            
            // Verify
            await waitFor(page, '.task:has-text("Full Test Task")');
            await expect(page.locator('.task:has-text("Full Test Task")')).toContainText('This is a test description');
        });
        
        test.skipIfLoggedOut('Edit a task', async () => {
            // Open task for edit
            const task = await page.locator('.task').first();
            await task.hover();
            await task.locator('.task-btn:has-text("✏️")').click();
            
            await waitFor(page, '#task-modal');
            
            // Change title
            await page.fill('#task-title', 'Updated Task Title');
            
            // Save
            await clickByText(page, '儲存');
            
            // Verify
            await waitFor(page, '.task:has-text("Updated Task Title")');
        });
        
        test.skipIfLoggedOut('Delete a task', async () => {
            const initialCount = await page.locator('.task').count();
            
            // Open delete
            const task = page.locator('.task').first();
            await task.hover();
            await task.locator('.task-btn:has-text("🗑️")').click();
            
            // Confirm delete
            page.on('dialog', dialog => dialog.accept());
            
            // Wait for task to be removed
            await page.waitForFunction(
                (initial) => document.querySelectorAll('.task').length === initial - 1,
                initialCount
            );
        });
    });
    
    // ============================================
    // FIELD-SPECIFIC TESTS
    // ============================================
    describe('Field Tests', () => {
        test.skipIfLoggedOut('Test title field', async () => {
            await clickByText(page, '新增任務');
            await waitFor(page, '#task-modal');
            
            // Test empty title (should show alert)
            await clickByText(page, '儲存');
            
            // Check if alert was triggered (we can't easily test alerts in headless)
            await page.fill('#task-title', 'Valid Title');
            await clickByText(page, '儲存');
            
            await waitFor(page, '.task:has-text("Valid Title")');
        });
        
        test.skipIfLoggedOut('Test description field', async () => {
            await clickByText(page, '新增任務');
            await page.fill('#task-title', 'Desc Test');
            await page.fill('#task-desc', 'Test description content');
            await clickByText(page, '儲存');
            
            await waitFor(page, '.task:has-text("Desc Test")');
            await expect(page.locator('.task:has-text("Desc Test")')).toContainText('Test description content');
        });
        
        test.skipIfLoggedOut('Test due date field', async () => {
            await clickByText(page, '新增任務');
            await page.fill('#task-title', 'Due Date Test');
            await page.fill('#task-due', '2026-12-31');
            await clickByText(page, '儲存');
            
            await waitFor(page, '.task:has-text("Due Date Test")');
            await expect(page.locator('.task:has-text("Due Date Test")')).toContainText('12/31');
        });
        
        test.skipIfLoggedOut('Test due time field', async () => {
            await clickByText(page, '新增任務');
            await page.fill('#task-title', 'Due Time Test');
            await page.fill('#task-due', '2026-06-15');
            await page.fill('#task-due-time', '23:59');
            await clickByText(page, '儲存');
            
            await waitFor(page, '.task:has-text("Due Time Test")');
            await expect(page.locator('.task:has-text("Due Time Test")')).toContainText('23:59');
        });
        
        test.skipIfLoggedOut('Test tags field', async () => {
            await clickByText(page, '新增任務');
            await page.fill('#task-title', 'Tag Test');
            
            // Add multiple tags
            await page.fill('#tag-input', 'Work');
            await page.press('#tag-input', 'Enter');
            await page.fill('#tag-input', 'Personal');
            await page.press('#tag-input', 'Enter');
            
            await clickByText(page, '儲存');
            
            await waitFor(page, '.task:has-text("Tag Test")');
            await expect(page.locator('.task:has-text("Tag Test")')).toContainText('Work');
            await expect(page.locator('.task:has-text("Tag Test")')).toContainText('Personal');
        });
        
        test.skipIfLoggedOut('Test subtasks field', async () => {
            await clickByText(page, '新增任務');
            await page.fill('#task-title', 'Subtask Test');
            
            // Add subtasks
            await page.fill('#subtasks-container input[type="text"]:last-of-type', 'Step 1');
            await page.press('#subtasks-container input[type="text"]:last-of-type', 'Enter');
            await clickByText(page, '新增子任務');
            await page.fill('#subtasks-container input[type="text"]:last-of-type', 'Step 2');
            await page.press('#subtasks-container input[type="text"]:last-of-type', 'Enter');
            
            await clickByText(page, '儲存');
            
            await waitFor(page, '.task:has-text("Subtask Test")');
            await expect(page.locator('.task:has-text("Subtask Test")')).toContainText('Step 1');
            await expect(page.locator('.task:has-text("Subtask Test")')).toContainText('Step 2');
        });
    });
    
    // ============================================
    // DRAG & DROP TESTS
    // ============================================
    describe('Drag & Drop', () => {
        test.skipIfLoggedOut('Move task to different column', async () => {
            const todoTasks = await page.locator('#todo-list .task').count();
            const inProgressTasks = await page.locator('#inprogress-list .task').count();
            
            const task = page.locator('#todo-list .task').first();
            
            // Drag task to in-progress column
            await task.dragTo(page.locator('#inprogress-list'));
            
            // Wait for move to complete
            await page.waitForTimeout(500);
            
            // Verify
            const newTodoTasks = await page.locator('#todo-list .task').count();
            const newInProgressTasks = await page.locator('#inprogress-list .task').count();
            
            expect(newTodoTasks).toBe(todoTasks - 1);
            expect(newInProgressTasks).toBe(inProgressTasks + 1);
        });
    });
    
    // ============================================
    // BOARD TESTS
    // ============================================
    describe('Board Operations', () => {
        test.skipIfLoggedOut('Create new board', async () => {
            await clickByText(page, 'New Board');
            await waitFor(page, '#board-modal');
            
            await page.fill('#board-name', 'Test Board');
            await clickByText(page, '建立');
            
            // Verify board selector updated
            await expect(page.locator('#board-selector')).toContainText('Test Board');
        });
        
        test.skipIfLoggedOut('Switch between boards', async () => {
            const selector = page.locator('#board-selector');
            await selector.selectOption({ index: 1 });
            
            // Wait for board switch
            await page.waitForTimeout(500);
        });
    });
    
    // ============================================
    // ARCHIVE TESTS
    // ============================================
    describe('Archive Operations', () => {
        test.skipIfLoggedOut('Archive a task', async () => {
            const task = page.locator('.task').first();
            await task.hover();
            await task.locator('.task-btn:has-text("📦")').click();
            
            // Task should disappear from active columns
            await page.waitForTimeout(500);
        });
        
        test.skipIfLoggedOut('View archive', async () => {
            await clickByText(page, 'Archive');
            await waitFor(page, '#archive-modal');
            
            // Can close modal
            await clickByText(page, '關閉');
        });
    });
    
    // ============================================
    // THEME TESTS
    // ============================================
    describe('Theme Operations', () => {
        test.skipIfLoggedOut('Toggle theme', async () => {
            const initialTheme = await page.evaluate(() => 
                document.body.getAttribute('data-theme')
            );
            
            await clickByText(page, 'Theme');
            
            const newTheme = await page.evaluate(() => 
                document.body.getAttribute('data-theme')
            );
            
            expect(newTheme).not.toBe(initialTheme);
        });
    });
});

// ============================================
// STANDALONE RUNNER (for node tests/kanban.spec.js)
// ============================================
if (require.main === module) {
    (async () => {
        console.log('🚀 Starting Kanban Tests...\n');
        
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        
        // Console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Console Error:', msg.text());
            }
        });
        
        console.log('📱 Opening:', BASE_URL);
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        
        // Check login status
        const isLoggedIn = await page.isVisible('#main-app');
        console.log(isLoggedIn ? '✅ Logged in' : '❌ Not logged in (will skip auth-required tests)');
        
        console.log('\n🧪 Running field tests...\n');
        
        // Test 1: Title field
        try {
            if (isLoggedIn) {
                await page.click('button:has-text("新增任務")');
                await page.waitForSelector('#task-modal');
                await page.fill('#task-title', 'Title Field Test');
                await page.fill('#task-desc', 'Description test');
                await page.fill('#task-due', '2026-06-15');
                await page.fill('#task-due-time', '10:30');
                await page.fill('#tag-input', 'TestTag');
                await page.press('#tag-input', 'Enter');
                await page.click('button:has-text("儲存")');
                await page.waitForSelector('.task:has-text("Title Field Test")');
                console.log('✅ Full task creation: PASSED');
            }
        } catch (e) {
            console.log('❌ Full task creation:', e.message);
        }
        
        // Test 2: Subtasks
        try {
            if (isLoggedIn) {
                await page.click('button:has-text("新增任務")');
                await page.waitForSelector('#task-modal');
                await page.fill('#task-title', 'Subtask Test');
                await page.fill('#subtasks-container input[type="text"]:last-of-type', 'Subtask 1');
                await page.press('#subtasks-container input[type="text"]:last-of-type', 'Enter');
                await page.click('button:has-text("儲存")');
                await page.waitForSelector('.task:has-text("Subtask Test")');
                console.log('✅ Subtasks test: PASSED');
            }
        } catch (e) {
            console.log('❌ Subtasks test:', e.message);
        }
        
        // Test 3: Edit task
        try {
            if (isLoggedIn) {
                const task = await page.$('.task');
                if (task) {
                    await task.hover();
                    await task.locator('.task-btn:has-text("✏️")').click();
                    await page.waitForSelector('#task-modal');
                    await page.fill('#task-title', 'Edited Task Title');
                    await page.click('button:has-text("儲存")');
                    await page.waitForSelector('.task:has-text("Edited Task Title")');
                    console.log('✅ Edit task test: PASSED');
                }
            }
        } catch (e) {
            console.log('❌ Edit task test:', e.message);
        }
        
        console.log('\n✨ Tests completed!');
        await browser.close();
    })();
}
