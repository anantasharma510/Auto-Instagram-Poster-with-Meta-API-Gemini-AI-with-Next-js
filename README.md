# Meta-Gemini Social Poster

A prototype web application that connects with Facebook and Instagram via Meta's Graph API and allows users to auto-post summarized content to their Instagram account. This project demonstrates social media automation by integrating Facebook OAuth, Meta Graph API, and Google Gemini API.

---

## 🚀 Features

- 🔐 **Facebook OAuth Authentication**
- 📄 **Connect Facebook Page & Linked Instagram Account**
- 📝 **Input Long-form Content via Web Interface**
- 🤖 **Summarize Text using Google Gemini API**
- 📲 **Auto-Post Summarized Content to Instagram**
- 🧪 **Built as a Proof-of-Concept for AI-driven Social Media Automation**

---

## 🛠️ Tech Stack

- **Next.js / Node.js**
- **Facebook Developer Platform (OAuth, Meta Graph API)**
- **Google Gemini API**
- **Tailwind CSS (or your UI stack)**
- **MongoDB /  *(if used for auth/session or post storage)*

---

## 🔧 Setup Instructions

1. **Clone the Repository**
   ```bash

  https://github.com/anantasharma510/Auto-Instagram-Poster-with-Meta-API-Gemini-AI-with-Next-js
npm install

# Facebook OAuth Credentials
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# MongoDB Connection URI
MONGODB_URI=your_mongodb_connection_string

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Public Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

npm run dev

