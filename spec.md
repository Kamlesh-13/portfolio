# LearnHTML

## Current State
New project. No existing application code.

## Requested Changes (Diff)

### Add
- Structured HTML curriculum with multiple modules (HTML Basics, Elements & Tags, Attributes, Styling HTML)
- Each module contains ordered lessons (e.g., 1.1 Intro to HTML, 1.2 Structure, 1.3 Headings, 1.4 Paragraphs)
- Interactive code editor (CodeMirror or textarea-based) for writing HTML per lesson
- Live preview panel that renders the user's HTML in a sandboxed iframe in real time
- "Check Code" validation that checks for required HTML patterns/keywords in the user's code
- "Reset Code" to restore starter code for a lesson
- "Next Lesson" to advance to the next lesson
- Per-lesson progress tracking stored on the backend (completed lessons per user/session)
- Module-level progress bar showing percentage of completed lessons
- Quick quiz feature per lesson — multiple choice questions about HTML concepts
- Sidebar with lesson navigation showing current progress, active lesson, and completed lessons
- Global navigation bar with links to Courses, Quizzes, Editor (sandbox), Progress sections
- Progress dashboard showing completed modules and overall progress
- Current lesson info card and quiz callout card

### Modify
N/A (new project)

### Remove
N/A (new project)

## Implementation Plan
1. **Backend (Motoko)**
   - Data models: Lesson, Module, UserProgress (completedLessons, quizScores)
   - Stable storage for lesson curriculum (hardcoded seed data)
   - APIs: getLessons(), getModules(), markLessonComplete(lessonId), getUserProgress(), submitQuizAnswer(lessonId, answer), resetProgress()
   - No auth required — use anonymous session tracking

2. **Frontend (React/TypeScript)**
   - App shell: top navbar + left sidebar + main content area
   - Lesson page: code editor + live iframe preview side by side
   - Action buttons: Check Code, Reset Code, Next Lesson
   - Module progress bar (green fill)
   - Quiz modal for per-lesson multiple-choice quizzes
   - Progress page with overall stats
   - Sidebar shows all modules/lessons with completion markers
   - Responsive layout for desktop-first usage
