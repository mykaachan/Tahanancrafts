# 🏠 TahananCrafts
A **Filipino Artisan Marketplace** that connects local artisans with customers through an e-commerce platform.  
This project is divided into **Frontend** (React.js) and **Backend** (Django REST Framework).

---

## 📂 Project Structure
```
TahananCrafts/
│
├── backend/        # Django REST API (users, products, search, ML analytics)
│   ├── tahanancrafts/   # Django project settings
│   ├── products/        # Product app
│   ├── users/           # User app
│   ├── search/          # Search app
│
├── frontend/       # React.js frontend
│   ├── src/             # React components
│   ├── public/          # Static files
│
└── README.md       # Project documentation
```

---

## ⚙️ Backend (Django)

### 🔹 Setup
1. Go to backend folder:
   ```bash
   cd backend
   ```
2. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate   # Windows
   source venv/bin/activate # Mac/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Apply migrations:
   ```bash
   python manage.py migrate
   ```
5. Run server:
   ```bash
   python manage.py runserver
   ```

### 🔹 Features
- User authentication (Admin, Seller, Customer)  
- Product management (CRUD for artisans)  
- Search & filters  
- Machine learning (recommendations, analytics)  

---

## 🎨 Frontend (React.js)

### 🔹 Setup
1. Go to frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the app:
   ```bash
   npm start
   ```

### 🔹 Features
- Login/Signup (Email/Phone, Google, Facebook)  
- Artisan shop pages & product listings  
- Cart & Checkout (COD payment)  
- Personalized recommendations  

---

## 🔄 Git Workflow

### 🔹 First Time Setup
```bash
git clone https://github.com/mykaachan/TahananCrafts.git
cd TahananCrafts
```

### 🔹 Everyday Workflow
1. Pull latest changes:
   ```bash
   git pull origin main
   ```
2. Create a branch for your task:
   ```bash
   git checkout -b feature/add-product-page
   ```
3. Stage changes:
   ```bash
   git add -A
   ```
4. Commit changes:
   ```bash
   git commit -m "Add product page UI"
   ```
5. Push to GitHub:
   ```bash
   git push origin feature/add-product-page
   ```
6. Open a **Pull Request** on GitHub → review → merge to `main`.
