# LinkVault 🔗

> A full-stack bookmark manager to save, organize, and share links that matter.

## 📖 Overview

LinkVault is a personal bookmark manager built with the MERN stack. Users can save any URL and instantly get the title, description, and thumbnail auto-fetched from the page. Links can be organized with tags, categories, and collections — and collections can be made public and shared with anyone via a unique URL.

---

## ✨ Features

### 🔐 Authentication
- Secure register and login with JWT
- Passwords hashed with bcrypt
- Protected routes on both frontend and backend
- Auto-generated public username on registration

### 🔗 Link Management
- Save any URL with one click
- Auto-fetches title, description, thumbnail, and favicon using Open Graph scraping
- Add personal notes, tags, and category to every link
- Edit and delete links
- Mark links as favorites

### 📂 Organization
- **Tags** — add multiple tags to any link and filter by them
- **Categories** — 9 default categories + create and delete your own custom categories
- **Collections** — group links into named collections, make them public or private

### 🌐 Public Sharing
- Make any collection public
- Share via a unique URL: `/u/username/collection-slug`
- Anyone can view a public collection without an account
- Logged-in users can copy an entire collection into their own vault with one click
- Copy count tracked on every public collection

### 🔍 Search & Filter
- Real-time search across title, description, notes, and tags
- Filter by category, tags, or favorites
- Sidebar tag navigation

### 📊 Dashboard Stats
- Total links saved
- Favorites count
- Unique categories used
- Unique tags used

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Metadata Scraping | Axios, Cheerio (Open Graph) |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
linkvault/
├── frontend/                   # React + Vite + Tailwind
│   └── src/
│       ├── api/                # Axios API call functions
│       ├── components/         # Reusable UI components
│       ├── context/            # AuthContext (global state)
│       ├── pages/              # Login, Register, Dashboard, Collections, PublicCollection
│       └── utils/              # Helper functions
│
└── backend/                    # Node.js + Express
    ├── config/                 # MongoDB connection
    ├── controllers/            # Business logic
    ├── middleware/             # JWT auth guard
    ├── models/                 # Mongoose schemas
    ├── routes/                 # Express route definitions
    └── utils/                  # Metadata fetcher
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [MongoDB Atlas](https://mongodb.com/atlas) account (free tier works)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/linkvault.git
cd linkvault
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/linkvault
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

> **Get your MONGO_URI:** Go to [MongoDB Atlas](https://mongodb.com/atlas) → Create free cluster → Connect → Copy connection string

Start the backend server:

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Reference

### Auth Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |
| GET | `/api/auth/me` | Get current user info | Private |
| POST | `/api/auth/categories` | Add a custom category | Private |
| DELETE | `/api/auth/categories` | Delete a custom category | Private |

### Link Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/links` | Get all links (supports ?search, ?tag, ?category, ?favorite) | Private |
| POST | `/api/links` | Create a new link | Private |
| PUT | `/api/links/:id` | Update a link | Private |
| DELETE | `/api/links/:id` | Delete a link | Private |
| GET | `/api/links/meta/fetch?url=` | Fetch Open Graph metadata from a URL | Private |
| GET | `/api/links/stats/summary` | Get user stats | Private |

### Collection Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/collections` | Get all user collections | Private |
| POST | `/api/collections` | Create a new collection | Private |
| PUT | `/api/collections/:id` | Update a collection | Private |
| DELETE | `/api/collections/:id` | Delete a collection | Private |
| POST | `/api/collections/:id/links` | Add or remove a link from collection | Private |
| GET | `/api/collections/public/:username/:slug` | View a public collection | Public |
| POST | `/api/collections/public/:username/:slug/copy` | Copy a public collection to vault | Private |

---

## 🚢 Deployment

### Backend → Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repository
4. Set the following:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `node index.js`
5. Add environment variables from your `.env` file
6. Deploy

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Set **Root directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. Update `frontend/src/api/axios.js` base URL to use `import.meta.env.VITE_API_URL`
5. Deploy

### Update CORS for Production

In `backend/index.js`, update the CORS origin to your Vercel URL:

```js
app.use(cors({
  origin: 'https://your-app.vercel.app',
  credentials: true,
}));
```

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sourav**
- GitHub: [@sksrv](https://github.com/sksrv)
- LinkedIn: [sourav kumar](https://www.linkedin.com/in/sourav-kumar-82b424201/)

---

<p align="center">Built with ❤️ using the MERN stack</p>
