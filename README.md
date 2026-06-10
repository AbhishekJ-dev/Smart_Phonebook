# 📱 Smart Phonebook

A high-performance, full-stack contact management system featuring a "Smart" search engine. Built with a focus on speed, fuzzy matching, and robust data management, this application allows users to store, manage, and find contacts instantly.

## ✨ Key Features

- **🔍 Smart Search Engine**: Leverages PostgreSQL Full-Text Search (FTS) and Trigram similarity for instant, fuzzy matching across names, emails, companies, and phone numbers.
- **🔐 Secure Authentication**: JWT-based user authentication system with secure password hashing (bcrypt).
- **🗂️ Contact Management**: Full CRUD (Create, Read, Update, Delete) functionality for contacts with profile picture support.
- **⭐ Favorites & Tags**: Mark important contacts as favorites and organize them with custom tags.
- **📈 Search History**: Keeps track of recent searches to help you revisit frequent queries.
- **🎨 Modern UI/UX**: A sleek, responsive dashboard built with React, Tailwind CSS, and Framer Motion for smooth animations.
- **🛡️ Secure API**: Protected by Helmet, CORS, and Express Rate Limiters to ensure production-grade security.

## 🛠️ Technical Stack

### **Frontend**
- **React 19** & **Vite**: Ultra-fast development and optimized production builds.
- **Tailwind CSS 4.0**: Utility-first styling for a beautiful, modern interface.
- **Framer Motion**: Fluid UI transitions and micro-animations.
- **Lucide React**: Clean and consistent iconography.
- **Axios**: Promised-based HTTP client for API communication.

### **Backend**
- **Node.js** & **Express**: Robust and scalable backend API.
- **PostgreSQL**: Relational database handling complex search vectors and trigram indices.
- **Multer**: Handling profile picture uploads.
- **Express Validator**: Server-side data validation.

## 🚀 Advanced Search Capabilities

The "Smart" in Smart Phonebook comes from the advanced database implementation in PostgreSQL:
- **Trigram Indices**: Enables ultra-fast fuzzy searching (find "John" even if you type "Jhon").
- **GIN (Generalized Inverted Index)**: High-speed querying across tags and large contact datasets.
- **Search Vectors**: Uses `tsvector` to rank results based on relevance across multiple contact fields.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbhishekJ-dev/Smart_Phonebook.git
   cd Smart_Phonebook
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example and add your DB credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
