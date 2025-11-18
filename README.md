# Factory Piece-Rate Tracker (SaaS ERP)

SaaS ERP for Textile Weaving Mills to automate piece-rate payroll. Built with React, TypeScript, and the Firebase serverless backend.

**Live Demo:** [https://factory-piece-rate-tracker-m6twe9h28-ko-htuns-projects.vercel.app](https://factory-piece-rate-tracker-m6twe9h28-ko-htuns-projects.vercel.app)

---

## 1. About This Project

This is not just a simple tracking app; it's a multi-tenant SaaS (Software as a Service) application designed for a specific, high-stakes industrial environment: **Textile Weaving Mills**.

This project solves a critical business problem for B2B (Business-to-Business) wholesale manufacturers who:
1.  Purchase raw yarn (ကုန်ကြမ်း).
2.  Manufacture finished goods like woven fabric rolls and traditional materials (e.g., *Paso-kwin*).
3.  Sell these fabrics in bulk to other garment factories and apparel manufacturers.

The primary goal of this application is to automate the complex, error-prone process of piece-rate payroll for factory workers and provide owners with a real-time digital dashboard of their entire production workflow.

## 2. Tech Stack

This project was built using a modern, scalable, serverless tech stack.

* **Frontend:** React, TypeScript, Vite
* **Backend:** Firebase (Serverless)
    * **Authentication:** Firebase Auth (for Owner/Supervisor accounts)
    * **Database:** Firestore (NoSQL DB for all factory data)
    * **Serverless Functions:** Firebase Cloud Functions (for backend logic like inviting users)
    * **Email:** "Trigger Email from Firestore" Extension (for sending password links)
* **Deployment:**
    * **Frontend:** Vercel (CI/CD connected to GitHub)
    * **Backend:** Firebase Hosting

## 3. Core Features

* **Secure Authentication:** Multi-tenant auth system for "Owners" (factory managers) and "Supervisors" (sub-accounts).
* **Supervisor Invitation System:** A core feature where Owners can securely invite new supervisors via a Firebase Callable Cloud Function. The system creates an Auth user, generates a password reset link, and emails the invite automatically.
* **Piece-Rate & Payroll:** (In-Development) Functionality to track worker productivity, calculate deductions, and automate payroll.
* **Data Management:** Full CRUD (Create, Read, Update, Delete) for workers, tasks, and production logs.

## 4. Project Status: Conquering the "Fatal Flaw Loop"

This project's development involved overcoming a complex series of infrastructure and configuration "Fatal Flaws" that went far beyond simple coding.

The "Invite Supervisor" feature was trapped in a "Silent Crash Loop" (0 logs, `Error: Internal`) which required a deep-dive debug of the entire cloud infrastructure.

**Key Infrastructure Challenges Solved:**
1.  **The "Silent Crash" Flaw:** Fixed by moving the Admin SDK initialization (`initializeApp()`) *inside* the `try...catch` block to ensure any IAM or permission errors were caught by our "Bulletproof Catch Block."
2.  **The "Deploy Timeout" Flaw:** Solved by removing `setGlobalOptions()` from the function's Global Scope.
3.  **The "Deployment Path" Flaw:** Fixed the `lib/lib/index.js` error by correctly configuring `firebase.json` (`"source": "functions/lib"`) and patching the copied `package.json`'s `"main"` entry to `"index.js"`.
4.  **The "Region Mismatch" Flaw:** Solved the `us-central1` CORS error by updating the React Frontend (`AuthContext.tsx`) to explicitly call the function in the correct `asia-east1` region using `getFunctions(app, "asia-east1")`.

This project is a testament to debugging and architecting a real-world, scalable, and resilient cloud application.
## Version 1.0 (Stable)
This version includes all fixes for the "Fatal Flaw Loop" (Deployment, Path, Timeout, and Region errors) and is considered the stable v1.0 release.