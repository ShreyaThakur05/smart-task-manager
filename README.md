# 🧠 Smart Task Management Platform

*AI-powered • Drag & Drop • Real-time*

A modern task management web application with AI-powered natural language task creation, intuitive drag-and-drop interface, and persistent data storage.

## ✨ Features

- **🤖 AI Task Creation** - Create tasks using natural language with Gemini AI
- **📋 Kanban Board** - Drag and drop cards between lists
- **📝 Custom Lists** - Create your own workflow stages
- **💾 Data Persistence** - All data saved locally (localStorage)
- **🌙 Dark Mode** - System preference detection
- **📱 Responsive** - Works on all devices
- **⚡ Real-time** - Instant updates and smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Gemini API key (optional, for enhanced AI)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd to_do_list
```

2. **Install dependencies**
```bash
cd client
npm install
```

3. **Setup environment (optional)**
```bash
cp .env.example .env.local
# Add your Gemini API key to .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

4. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### AI Task Creation
- Click "AI Create" button
- Type natural language commands like:
  - "Add test task in hello list"
  - "Create urgent bug fix due tomorrow"
  - "Schedule meeting with team next Friday"

### Manual Task Creation
- Click "New Task" for detailed task creation
- Fill in title, description, priority, due date, labels
- Assign to specific lists

### List Management
- Create custom lists with "Add another list"
- Drag and drop cards between lists
- Delete custom lists (default lists are protected)

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 + TypeScript
- Tailwind CSS + Framer Motion
- Zustand (State Management)
- DnD Kit (Drag & Drop)

**AI Integration:**
- Google Gemini API
- Natural language processing
- Smart task parsing

**Storage:**
- localStorage (Zustand Persist)
- No backend required

## 📁 Project Structure

```
client/
├── app/
│   ├── components/          # React components
│   │   ├── AIAssistant.tsx  # AI task creation
│   │   ├── Board.tsx        # Main kanban board
│   │   ├── List.tsx         # Individual lists
│   │   ├── Card.tsx         # Task cards
│   │   └── ...              # Other components
│   ├── store/               # Zustand stores
│   │   ├── taskStore.ts     # Task management
│   │   └── authStore.ts     # Authentication
│   └── page.tsx             # Main page
├── public/                  # Static assets
└── package.json
```

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_GEMINI_API_KEY` - Google Gemini API key for enhanced AI features

### Default Lists
- **Backlog** - New tasks
- **In Progress** - Active work
- **Review** - Pending review
- **Done** - Completed tasks

## 🚀 Deployment

**Vercel (Recommended):**
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

**Other Platforms:**
- Netlify
- GitHub Pages
- Any static hosting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Framer Motion for animations
- Tailwind CSS for styling
- DnD Kit for drag and drop

---

Built with ❤️ for modern task management