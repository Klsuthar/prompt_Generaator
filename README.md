# VidyaFrame Prompt Studio

**VidyaFrame Prompt Studio** is a premium, responsive web application designed for educators to generate, manage, and track structured AI image generation prompts for curriculum charts and worksheets.

The application loads curriculum metadata for **162 topics** spanning Mathematics, English, EVS, Science, Hindi, and Drawing subjects for Nursery up to Class 8, providing structured prompts optimized for DALL-E 3, Midjourney, and Stable Diffusion.

---

## 🚀 Quick Start & Setup

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Install Dependencies
Initialize the project packages:
```bash
npm install
```

### 2. Parse Excel Roadmap Data
To parse the Excel spreadsheet (`VidyaFrame_SEO_Content_Roadmap.xlsx`) and generate the static JSON database:
```bash
node convertExcel.cjs
```
This reads the Excel roadmap, cleans status values (e.g., mapping `✅ EXISTS` to `EXISTS`), extracts target classes, and saves the output to `src/data/topics.json`.

### 3. Start Development Server
Launch the application locally in development mode:
```bash
npm run dev
```
Open your browser and navigate to the address displayed in your terminal (usually `http://localhost:5173`).

### 4. Build for Production
To bundle and optimize the application assets for deployment:
```bash
npm run build
```
This generates optimized HTML, CSS, and JS files in the `/dist` directory.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React 19 + Vite 8
- **Styling**: Tailwind CSS v3 (configured with custom subject colors and glowing layouts)
- **Data Layer**: Cleaned JSON generated directly from the Excel spreadsheet at build time
- **State Management**: React `useState` & `useEffect` (no heavy state managers required)
- **Storage**: `localStorage` (persists clipboard copy statuses and active user filters)

---

## 🎹 Keyboard Shortcuts & Interactions

To expedite prompt operations for power users, the following shortcuts are active when the Prompt Panel drawer is open:
- **`Esc`**: Closes the prompt panel.
- **`C`**: Copies the active tab's JSON prompt to the clipboard (turns copied button green ✅).

---

## 💎 Design System & Visual Features

- **Subject Branding**: Visual elements (badges, card borders, progress meters) are custom color-coded:
  - **Mathematics** ➔ Blue `#3B82F6`
  - **English** ➔ Purple `#8B5CF6`
  - **EVS** ➔ Green `#10B981`
  - **Science** ➔ Teal `#14B8A6`
  - **Hindi** ➔ Orange `#F59E0B`
  - **Drawing** ➔ Pink `#EC4899`
- **Dynamic Layouts**: Renders a glassmorphic sidebar and dashboard. Card layouts adapt from 3 columns (desktop) to 2 columns (tablet) and 1 column (mobile).
- **Progress Gauge**: Monitors the curriculum build progress, calculating copied charts (out of 605) and worksheets (out of 649) to render real-time overall progress.
- **JSON Syntax Highlighter**: Custom regex-based highlighting colorizes keys, strings, numbers, booleans, and null values in the slide-out code display without relying on heavy external formatting libraries.
- **Print Layout**: Click the print icon inside any prompt panel to print a clean, structured, and paper-friendly copy of the JSON prompt as a PDF.
