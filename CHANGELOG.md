# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

#### Fixed
- **XSS Vulnerabilities**: All user-generated content is now properly escaped to prevent cross-site scripting attacks
  - Task titles, descriptions, subtasks, and tags now use `escapeHtml()` sanitization
  - Archive modal task titles are now properly escaped
  - Tag display and subtask values in modals use proper escaping
  - Created `js/utils/sanitize.js` with comprehensive HTML sanitization utilities:
    - `escapeHtml()`: Escapes HTML entities for text content
    - `escapeAttr()`: Escapes for HTML attribute values  
    - `sanitizeString()`: Validates and limits string length
    - `sanitizeArray()`: Sanitizes arrays with custom function

### Added

#### Maintainability Improvements
- **Constants File** (`js/utils/constants.js`): Replaced magic strings with named constants
  - `STATUS.TODO`, `STATUS.IN_PROGRESS`, `STATUS.DONE`, `STATUS.ARCHIVE`
  - `TAG_TYPES.WORK`, `TAG_TYPES.PERSONAL`, `TAG_TYPES.URGENT`, `TAG_TYPES.OTHER`
  - `DEFAULT_BOARD` constant
  - `LIMITS` object for max lengths (title: 100, description: 1000, tags: 5, subtasks: 10)
  - `THEME.LIGHT`, `THEME.DARK` constants
  - `KEYBOARD_SHORTCUTS` for keyboard navigation

- **Input Validation** (`js/utils/validation.js`): Added comprehensive input validation
  - `validateTaskTitle()`: Required, max 100 chars with clear error messages
  - `validateTaskDescription()`: Max 1000 chars
  - `validateTags()`: Max 5 tags, each max 20 chars
  - `validateSubtasks()`: Max 10 subtasks, each max 200 chars
  - `validateBoardName()`: Required, max 50 chars
  - `ValidationError` class for typed error handling

- **Error Handling** (`js/utils/errorHandler.js`): Added robust error handling system
  - `withErrorHandling()`: Wraps async functions with toast notifications
  - `showToast()`: Non-blocking toast notifications (replaces browser alerts)
  - `getFirebaseErrorMessage()`: User-friendly Firebase error message translations
  - `createLoadingState()`: Prevents double-submits with loading states

### Changed

#### Code Quality
- **Modal Save**: Now validates all inputs before saving with proper error messages
- **Board Creation**: Uses validation system with success/error toasts
- **Firebase Operations**: All async operations wrapped with error handling
- **Keyboard Shortcuts**: Now use STATUS constants instead of magic strings
- **Delete Board**: Uses DEFAULT_BOARD constant and proper error handling
- **Drag & Drop**: Status updates wrapped with error handling

### Files Changed

```
js/
├── utils/
│   ├── sanitize.js      (NEW) - XSS protection utilities
│   ├── validation.js    (NEW) - Input validation functions
│   ├── errorHandler.js  (NEW) - Error handling and toast notifications
│   └── constants.js     (NEW) - Magic string constants
├── components/
│   ├── Task.js          (MOD) - Added sanitization imports and escaping
│   └── Modal.js         (MOD) - Added sanitization, validation, error handling
└── app.js               (MOD) - Added imports, validation, error handling
```

## [1.0.0] - 2026-01-31

### Added
- Initial release of Kanban Family board
- Firebase Authentication with Google Sign-In
- Cloud Firestore real-time sync
- Theme support (Light/Dark mode)
- Tags (Work, Personal, Urgent, Other)
- Due dates with time support
- Subtasks with checkboxes
- Multiple boards support
- Archive functionality
- Drag & drop task management
- Keyboard shortcuts (1/2/3 for status, E for edit, Delete to remove)

[Unreleased]: https://github.com/horaceho/kanban-family/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/horaceho/kanban-family/releases/tag/v1.0.0
