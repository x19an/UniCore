<div align="center">
  <br />
    <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/hexagon.svg" alt="UniCore Logo" width="100" />
  <br />
  
  <h1>UniCore</h1>
  <p>
    <strong>Your sleek, all-in-one university productivity hub.</strong>
  </p>

  <p>
    <a href="https://unicore.vercel.app"><img src="https://img.shields.io/badge/Live_App-Visit_Now-000000?style=for-the-badge&logo=vercel" alt="Live App" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  </p>
</div>

<br />

## ✦ What is UniCore?

**UniCore** is a modern, mobile-responsive productivity engine designed specifically for university students. Built with cutting-edge web technologies, it consolidates everything you need to stay on top of your academic life into one gorgeous, glassmorphism-inspired dashboard.

Whether you're keeping your attendance safely above the danger zone, tracking your daily study streaks, or organizing your lecture notes with markdown, UniCore operates as the central operating system for your degree.

---

## 🚀 Use it Live!

No need to host or configure databases yourself! UniCore is fully deployed and ready to use. 

👉 **[Visit the Live App on Vercel](https://unicore.vercel.app)** 

Simply create an account and start organizing your semester instantly. Your data is securely isolated using Row Level Security (RLS) in the cloud.

---

## ✨ Features

- 📊 **Smart Dashboard**: A bird's-eye view of your day, highlighting urgent tasks and at-risk attendance.
- 🎓 **Attendance Tracker**: Log theory and lab sessions, track your absence percentage, and know exactly when you're at risk of dropping below the required 75%.
- 📝 **Markdown Notes**: A rich text editor for your lecture notes with full markdown support and course-based organization. (Upload images directly into your notes!)
- ✅ **Task Management (Todos)**: Keep track of assignments and priorities with an intuitive checklist.
- 🔥 **Habit Streaks**: Build momentum by tracking daily habits (like coding or reading) with visual progress bars.
- 🎯 **Goal Setting**: Set and track both short-term milestones and long-term ambitions.
- 📱 **PWA Ready**: Install it directly to your phone's home screen for a seamless, native app-like experience with swipeable masonry layouts.
- 🌙 **Dark Mode First**: Because who studies in the light? A gorgeous, glass UI tailored for late-night grinds.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) & Framer Motion
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **PWA**: [Serwist](https://serwist.build/)

---

## 💻 For Developers

Want to contribute or run your own local instance?

1. **Clone the repository**
   ```bash
   git clone https://github.com/x19an/UniCore.git
   cd UniCore
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run the development server**
   *(Note: You'll need to configure your own `.env.local` with Supabase keys if you want to test database logic locally, but UI development can be done with mock data if you bypass the auth middleware.)*
   ```bash
   npm run dev
   ```

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/x19an">x19an</a>
</div>
