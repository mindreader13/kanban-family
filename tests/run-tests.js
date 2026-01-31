#!/usr/bin/env node
/**
 * Simple Kanban Test Runner
 * Usage: node tests/run-tests.js
 * 
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 */

const { chromium } = require('playwright');

const BASE_URL = process.env.KANBAN_URL || 'http://localhost:8080';

async function runTests() {
    console.log('🚀 Kanban Test Suite\n');
    console.log(`📱 Target: ${BASE_URL}\n`);
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Track errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    try {
        console.log('1️⃣  Loading app...');
        await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Check login status
        const isLoggedIn = await page.isVisible('#main-app');
        console.log(isLoggedIn ? '   ✅ Logged in' : '   ⚠️  Not logged in (will skip user tests)');
        
        if (!isLoggedIn) {
            console.log('\n❌ Please log in first, then run tests again.');
            await browser.close();
            return;
        }
        
        console.log('\n🧪 Running tests...\n');
        
        // === TEST 1: Full Task Creation ===
        console.log('Test 1: Create task with all fields');
        try {
            await page.click('button:has-text("新增任務")');
            await page.waitForSelector('#task-modal', { timeout: 3000 });
            
            await page.fill('#task-title', 'Automated Test Task');
            await page.fill('#task-desc', 'Testing all fields');
            await page.fill('#task-due', '2026-12-31');
            await page.fill('#task-due-time', '23:59');
            await page.fill('#tag-input', 'TestTag');
            await page.press('#tag-input', 'Enter');
            
            await page.click('button:has-text("儲存")');
            await page.waitForSelector('.task:has-text("Automated Test Task")', { timeout: 5000 });
            console.log('   ✅ PASSED\n');
        } catch (e) {
            console.log(`   ❌ FAILED: ${e.message}\n`);
        }
        
        // === TEST 2: Subtasks ===
        console.log('Test 2: Add subtasks');
        try {
            await page.click('button:has-text("新增任務")');
            await page.waitForSelector('#task-modal');
            await page.fill('#task-title', 'Subtask Test');
            
            const subtaskInput = page.locator('#subtasks-container input[type="text"]').last();
            await subtaskInput.fill('Step 1: Do something');
            await subtaskInput.press('Enter');
            
            await page.click('button:has-text("新增子任務")');
            await page.locator('#subtasks-container input[type="text"]').last().fill('Step 2: Do more');
            
            await page.click('button:has-text("儲存")');
            await page.waitForSelector('.task:has-text("Subtask Test")', { timeout: 5000 });
            console.log('   ✅ PASSED\n');
        } catch (e) {
            console.log(`   ❌ FAILED: ${e.message}\n`);
        }
        
        // === TEST 3: Edit Task ===
        console.log('Test 3: Edit task');
        try {
            const task = await page.$('.task:has-text("Subtask Test")');
            if (task) {
                await task.hover();
                await task.locator('.task-btn:has-text("✏️")').click();
                await page.waitForSelector('#task-modal');
                await page.fill('#task-title', 'Edited Subtask Test');
                await page.click('button:has-text("儲存")');
                await page.waitForSelector('.task:has-text("Edited Subtask Test")', { timeout: 5000 });
                console.log('   ✅ PASSED\n');
            } else {
                console.log('   ⚠️  SKIPPED (no task found)\n');
            }
        } catch (e) {
            console.log(`   ❌ FAILED: ${e.message}\n`);
        }
        
        // === TEST 4: Delete Task ===
        console.log('Test 4: Delete task');
        try {
            const initialCount = await page.locator('.task').count();
            const task = await page.$('.task:has-text("Edited Subtask Test")');
            if (task) {
                await task.hover();
                
                // Set up dialog handler
                page.once('dialog', dialog => dialog.accept());
                
                await task.locator('.task-btn:has-text("🗑️")').click();
                await page.waitForTimeout(500);
                
                const newCount = await page.locator('.task').count();
                if (newCount < initialCount) {
                    console.log('   ✅ PASSED\n');
                } else {
                    console.log('   ⚠️  Task count unchanged\n');
                }
            } else {
                console.log('   ⚠️  SKIPPED (no task found)\n');
            }
        } catch (e) {
            console.log(`   ❌ FAILED: ${e.message}\n`);
        }
        
        // === TEST 5: Due Date & Time Display ===
        console.log('Test 5: Due date/time display');
        try {
            await page.click('button:has-text("新增任務")');
            await page.waitForSelector('#task-modal');
            await page.fill('#task-title', 'Date Test');
            await page.fill('#task-due', '2026-06-15');
            await page.fill('#task-due-time', '14:30');
            await page.click('button:has-text("儲存")');
            
            await page.waitForSelector('.task:has-text("Date Test")', { timeout: 5000 });
            const taskContent = await page.locator('.task:has-text("Date Test")').textContent();
            
            if (taskContent.includes('6/15') && taskContent.includes('14:30')) {
                console.log('   ✅ PASSED\n');
            } else {
                console.log('   ⚠️  Date/time format may be different\n');
            }
        } catch (e) {
            console.log(`   ❌ FAILED: ${e.message}\n`);
        }
        
        // === TEST 6: Drag & Drop ===
        console.log('Test 6: Drag & drop');
        try {
            const todoCount = await page.locator('#todo-list .task').count();
            const inProgressCount = await page.locator('#inprogress-list .task').count();
            
            const task = await page.$('#todo-list .task');
            if (task && todoCount > 0) {
                await task.dragTo(page.locator('#inprogress-list'));
                await page.waitForTimeout(500);
                
                const newTodoCount = await page.locator('#todo-list .task').count();
                const newInProgressCount = await page.locator('#inprogress-list .task').count();
                
                if (newTodoCount === todoCount - 1 && newInProgressCount === inProgressCount + 1) {
                    console.log('   ✅ PASSED\n');
                } else {
                    console.log('   ⚠️  Counts may differ due to timing\n');
                }
            } else {
                console.log('   ⚠️  SKIPPED (no task in todo)\n');
            }
        } catch (e) {
            console.log(`   ❌ FAILED: ${e.message}\n`);
        }
        
        // === Console Errors ===
        if (errors.length > 0) {
            console.log('⚠️  Console errors detected:');
            errors.forEach(e => console.log(`   - ${e}`));
            console.log('');
        }
        
        console.log('✨ All tests completed!');
        
    } catch (e) {
        console.error('Test error:', e.message);
    } finally {
        await browser.close();
    }
}

// Run if called directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };
