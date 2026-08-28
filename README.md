<div align="center">
  <br />
    <img src="https://raw.githubusercontent.com/x19an/UniCore/main/public/icons/icon-512x512.png" alt="UniCore Logo" width="120" />
  <br />
  
  <h1>UniCore</h1>
  <p>
    <strong>Your sleek AI-powered future assistant & university productivity hub.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </p>
</div>

<br />

## ✦ What is UniCore?

**UniCore** is a modern, mobile-responsive, all-in-one productivity engine designed specifically for university students. Built with cutting-edge web technologies, it consolidates everything a student needs to stay on top of their academic life into one sleek dashboard.

Whether you're keeping your attendance safely above the danger zone, tracking your daily study streaks, or organizing your lecture notes, UniCore operates as the central operating system for your degree.

---

## ✨ Features

- 📊 **Smart Dashboard**: A bird's-eye view of your day, highlighting urgent tasks and at-risk attendance.
- 🎓 **Attendance Tracker**: Log theory and lab sessions, track your absence percentage, and know exactly when you're at risk of dropping below the required 75%.
- 📝 **Markdown Notes**: A rich text editor for your lecture notes with full markdown support and course-based organization.
- ✅ **Task Management (Todos)**: Keep track of assignments and priorities with an intuitive checklist.
- 🔥 **Habit Streaks**: Build momentum by tracking daily habits (like coding or reading) with visual progress bars.
- 🎯 **Goal Setting**: Set and track both short-term milestones and long-term ambitions.
- 📱 **PWA Ready**: Install it directly to your phone's home screen for a seamless, native app-like experience.
- 🌙 **Dark Mode First**: Because who studies in the light? A gorgeous, glassmorphism-inspired dark UI.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) & Base UI
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: React Context API
- **PWA**: [Serwist](https://serwist.build/)

---

## 🚀 Getting Started

To run UniCore locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/x19an/UniCore.git
cd UniCore
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
*(You will need to run the `schema.sql` file in your Supabase SQL Editor to set up the database tables).*

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/x19an">x19an</a>
</div>
