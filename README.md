# Hospital-Appointment-Scheduler
A full-stack hospital management web application that allows users to browse doctors, view departments, and book appointments seamlessly. Built using modern technologies like React, FastAPI, and MongoDB.

---

## 🚀 Features

* 👨‍⚕️ Browse doctors by department
* 📅 Book appointments easily
* 🏥 Department-based filtering
* 🔍 Clean and responsive UI
* ⚡ Fast API integration with backend
* 🌐 Full-stack architecture

---

## 🛠️ Tech Stack

### Frontend

* React (CRA + CRACO)
* Tailwind CSS
* Axios

### Backend

* FastAPI
* Uvicorn

### Database

* MongoDB

---

## 📁 Project Structure

```
hospital/
│
├── frontend/      # React frontend
├── backend/       # FastAPI backend
├── tests/         # Backend tests
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone 
cd hospital
```

---

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

Backend runs at:

```
http://localhost:8001
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
yarn install
yarn start
```

Frontend runs at:

```
http://localhost:3000
```

---

## 🔗 Environment Variables

Create a `.env` file in backend:

```
MONGO_URI=mongodb://localhost:27017
```

---

## 🌍 Deployment

* Frontend → Vercel / Netlify
* Backend → Render / Railway
* Database → MongoDB Atlas

---

## 📌 Future Improvements

* 🔐 User authentication (JWT)
* 📊 Admin dashboard
* 🗂️ Appointment history
* 💳 Payment integration

---

## 🤝 Contributing

Feel free to fork this repo and contribute!

---
