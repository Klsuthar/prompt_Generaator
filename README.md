# VidyaFrame Prompt Studio

**VidyaFrame Prompt Studio** is a premium, fully responsive web application designed for educators to generate, manage, and track structured AI image generation prompts for curriculum charts and worksheets.

The app supports **162 topics** spanning Mathematics, English, EVS, Science, Hindi, and Drawing. It parses class ranges (like Nursery to Class 1) to cyclically distribute and generate unique prompts and filenames for each individual asset (e.g. 6 charts and 8 worksheets for "English Alphabet").

---

## 🚀 Deployment to GitHub Pages (Instant Link)

Because this project is built using vanilla HTML, CSS (via Tailwind CDN), and JavaScript (via ES Modules), **it does not require any compile or build steps.** 

To deploy and create a live link on GitHub:

1. **Upload your code** to a new repository on GitHub (refer to the instructions below).
2. Go to your repository on GitHub.com.
3. Click on the **Settings** tab.
4. On the left sidebar, click on **Pages** (under the "Code and automation" section).
5. Under **Build and deployment** -> **Branch**, select **`main`** (or `master`) and click **Save**.
6. Refresh the page after 1 minute, and you will see your live website link at the top (e.g., `https://username.github.io/repository-name/`).

---

## 💻 Running Locally

To run the application locally on your computer:

Modern browsers restrict loading local JSON files (`topics.json`) via `fetch()` from `file://` paths due to CORS security policies. Therefore, **you must run the project using a simple local web server**:

- **Option A (VS Code)**: Install the **Live Server** extension, open `index.html`, and click **Go Live**.
- **Option B (Python)**: Open your terminal in the project directory and run:
  ```bash
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your browser.
- **Option C (Node.js/npm)**: Open your terminal and run:
  ```bash
  npx serve .
  ```
  Then open the link displayed in your terminal.

---

## 📂 Project Structure

- `index.html` — Main landing page (loads Tailwind CSS CDN & Lucide CDN).
- `app.js` — Core application logic (renders cards, filters, sidebar, and coordinate states).
- `promptGenerator.js` — Dynamic prompt-building and file-naming logic.
- `convertExcel.cjs` — Utility script to convert Excel sheet to JSON.
- `src/data/topics.json` — Static JSON database compiled from the Excel sheet.

---

## 🎹 Keyboard Shortcuts

When the Prompt Panel drawer is open:
- **`Esc`**: Closes the prompt panel.
- **`C`**: Copies the active asset's JSON prompt to the clipboard (turns copied button green ✅).
