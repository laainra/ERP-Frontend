
# 🏭 ERP System (Frontend)

ERP System adalah aplikasi web berbasis **Vue 3 + Pinia + Vue Router** yang digunakan untuk mengelola proses **Production Planning & Inventory Control (PPIC)** serta **Production Management**.
Aplikasi ini terintegrasi dengan backend berbasis **Laravel 9 REST API**.

---

## 🚀 Tech Stack

| Layer            | Tools                     |
| ---------------- | ------------------------- |
| Framework        | Vue 3 (Composition API)   |
| State Management | Pinia                     |
| Routing          | Vue Router 4              |
| UI               | Bootstrap 5 + TailwindCSS |
| HTTP Client      | Axios                     |
| Alert & Modal    | SweetAlert2               |
| PDF Generator    | jsPDF + jsPDF-AutoTable   |
| Utility          | Lodash                    |

---

## 📁 Project Structure

```
src/
 ├─ api/                 # Axios API services (auth, products, plans, orders, reports)
 ├─ assets/              # Images, style.css
 ├─ components/          # Reusable components (Navbar, Sidebar, Footer)
 ├─ layouts/             # Layouts for PPIC, Production, and Main
 ├─ pages/
 │   ├─ auth/            # Login Page
 │   ├─ misc/            # Forbidden & NotFound
 │   ├─ ppic/            # DashboardPPIC, ProductsPage, ProductionPlanPage
 │   └─ production/      # Dashboard, ProductionOrderList, ProductionReport, etc.
 ├─ router/              # Vue Router config
 ├─ stores/              # Pinia stores (authStore, productStore, etc.)
 ├─ utils/               # Helper functions (generateCode, generatePdfReport)
 ├─ App.vue
 ├─ main.js
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Project

```bash
git clone https://github.com/laainra/erp-frontend.git
cd erp-frontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run Development Server

```bash
npm run serve
```

Akses di: [http://localhost:8080](http://localhost:8080)

### 4️⃣ Build for Production

```bash
npm run build
```

---

## 🔌 Environment Variables

Buat file `.env` di root folder:

```bash
VUE_APP_API_URL=http://localhost:8000/api
```

---

## 🔐 Authentication Flow

* **Login** → `authStore` → Simpan token ke localStorage
* **Axios Interceptor** → Kirim token ke header Authorization
* **Route Guard** → Cegah akses tanpa login
* Role-based Layout:

  * PPIC → `PPICLayout.vue`
  * Production → `ProductionLayout.vue`

---

## 📊 Features

✅ Authentication (Login/logout)
✅ Dashboard PPIC & Production
✅ CRUD Product & Production Plan
✅ Production Order Tracking
✅ Production Log & Reporting (PDF export)
✅ Responsive UI
✅ Role-based access (PPIC & Production)

---

## 🧩 Scripts

| Command         | Description             |
| --------------- | ----------------------- |
| `npm run serve` | Run local dev server    |
| `npm run build` | Build production bundle |
| `npm run lint`  | Run ESLint check        |

---

## 📦 Dependencies Overview

* **Vue 3** – Frontend framework
* **Pinia** – State management
* **Axios** – REST API integration
* **Bootstrap 5 / TailwindCSS** – Styling
* **SweetAlert2** – Modern alert dialogs
* **jsPDF** – PDF generation for reports
* **Lodash** – Utility functions

---

## 🧠 Developer Notes

* Gunakan `Pinia` store untuk komunikasi antar komponen.
* Simpan konfigurasi endpoint di `src/api/constants.js`.
* Komponen layout (`layouts/`) sudah siap untuk routing berbasis role.
* Gunakan `generatePdfReport.js` untuk ekspor laporan produksi.

---

## 👨‍💻 Author

**ERP System Frontend**
Developed by Laila Ainur Rahma — 2025
🛠️ Stack: Vue 3 | Laravel 9 | MySQL

