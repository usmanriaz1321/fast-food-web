# 🍔 BiteDash

**BiteDash** (formerly *Flavour Dash*) is a full-stack food delivery web application built for a local restaurant in **Piplan/Harnoli, Pakistan**. It lets customers browse the menu, place orders, and track deliveries in real time — while giving restaurant admins a complete dashboard to manage the entire operation.

🔗 **Live App:** [bitedash.netlify.app](https://bitedash.netlify.app)
🔗 **API:** [fast-food-web-ruddy.vercel.app](https://fast-food-web-ruddy.vercel.app)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Deployment](#-deployment)
- [Known Issues / Roadmap](#-known-issues--roadmap)
- [Author](#-author)

---

## ✨ Features

### Customer-Facing
- 🍕 Browse menu items by category (Pizza, Burgers, Shawarma, etc.)
- 💰 Size-based pricing on products (Small / Medium / Large, etc.)
- 🛒 Real-time cart management with subtotal, delivery fee, and **free delivery on orders above Rs. 600**
- 📦 Place orders with delivery details and track status (`Pending → Confirmed → Preparing → Out for Delivery → Delivered`)
- 👤 Profile management — saved addresses & payment methods
- ⭐ Submit feedback with star ratings
- 🌗 Light / Dark theme toggle
- 🔐 JWT authentication with email verification and OTP-based password reset

### Admin Panel
- 🎨 Dedicated dark, GitHub-inspired admin theme
- 🍽️ Manage menu items with size-specific pricing
- 🏷️ Create and manage combo deals
- 📦 Process orders and update statuses
- 👥 Manage user accounts (view / block / delete)
- 💬 Approve or delete customer feedback
- 🗂️ Manage categories with images
- 📊 Dashboard stats overview

---

## 🛠 Tech Stack

**Frontend**
- React.js (Vite)
- React Bootstrap
- React Router
- Context API (`AuthContext`, `CartContext`)
- react-toastify (notifications)
- Axios

**Backend**
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT (authentication)
- bcryptjs (password hashing)
- Nodemailer (email verification / OTP)
- Multer + Cloudinary (image uploads)

**Deployment**
- Frontend → **Netlify**
- Backend → **Vercel** (serverless functions)
- Database → **MongoDB Atlas**
- Media storage → **Cloudinary**

---

## 📁 Project Structure

```
fast-food-web/
├── client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── pages/
│   │   │   ├── admin/             # Admin panel pages
│   │   │   └── web/               # Customer-facing pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── server/                      # Express backend
│   ├── controllers/
│   │   ├── web/                   # auth, user, menu, deals, orders, cart, feedback
│   │   └── admin/
│   ├── middleware/                # auth.js, error handling
│   ├── models/                    # User, OTP, Menu, Deal, Order, Category...
│   ├── routes/
│   │   ├── web/
│   │   └── admin/
│   ├── uploads/
│   ├── .env.example
│   ├── index.js                   # App entry point (Vercel serverless handler)
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

> ⚠️ **Note on filenames:** This project is deployed on Vercel (Linux), which is case-sensitive with file paths — unlike Windows. All model/controller filenames must match their `require()` statements exactly in casing (e.g. `User.js`, not `user.js`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (local for dev, or an Atlas connection string)
- Cloudinary account (for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/usmanriaz1321/fast-food-web.git
cd fast-food-web
```

### 2. Set up the backend
```bash
cd server
npm install
cp .env.example .env    # then fill in your own values
npm run dev              # or: node index.js
```
Server runs on `http://localhost:5000` by default.

### 3. Set up the frontend
```bash
cd client
npm install
cp .env.example .env    # then fill in your own values
npm run dev
```
Frontend runs on `http://localhost:5173` by default (Vite default port).

---

## 🔑 Environment Variables

### `server/.env`
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Email (Nodemailer - verification & OTP)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```
> In production (Netlify), set `VITE_API_URL` to your deployed backend, e.g. `https://fast-food-web-ruddy.vercel.app/api`

**⚠️ Never commit `.env` files.** Only commit `.env.example` with placeholder values. Make sure `.env` is listed in `.gitignore` at both `client/` and `server/` level.

---

## 🔌 API Overview

Base URL: `/api`

| Route | Description |
|---|---|
| `/api/auth` | Register, login, email verification, OTP password reset |
| `/api/user` | User profile management |
| `/api/menu` | Menu items (CRUD) |
| `/api/deals` | Combo deals (CRUD) |
| `/api/orders` | Place orders, update/track order status |
| `/api/cart` | Cart operations |
| `/api/feedback` | Submit / approve / delete feedback |
| `/api/categories` | Category management |
| `/api/upload` | Image upload (Cloudinary) |
| `/api/admin` | Admin-only routes (users, stats, moderation) |

All protected routes require a JWT sent via `Authorization: Bearer <token>` header. Admin-only routes additionally check the user's role in the auth middleware.

---

## 🌐 Deployment

**Backend (Vercel)**
- Deployed as a serverless function via `vercel.json`
- MongoDB connection is cached across invocations (see `server/index.js`) since Vercel functions are stateless
- Environment variables must be set manually in **Vercel Dashboard → Settings → Environment Variables** (local `.env` files are not used in production)
- MongoDB Atlas **Network Access** must allow `0.0.0.0/0` since Vercel uses dynamic IPs

**Frontend (Netlify)**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable `VITE_API_URL` set in **Netlify Dashboard → Site Settings → Environment Variables**

**Redeploying:** Both platforms auto-deploy on push to `master`/`main` if connected to this GitHub repo.

---

## 🐛 Known Issues / Roadmap

- [ ] Handle orphaned `order.userId` references gracefully across all admin views (optional chaining + fallback UI)
- [ ] Migrate any remaining local file uploads to Cloudinary (Vercel's filesystem is not persistent)
- [ ] Add pagination to admin orders/users tables
- [ ] Add automated tests for critical auth and order flows

---

## 👤 Author

**Usman Riaz**
GitHub: [@usmanriaz1321](https://github.com/usmanriaz1321)

---

## 📄 License

This project is currently unlicensed / private.
