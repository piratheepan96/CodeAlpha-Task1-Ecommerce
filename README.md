# 🛒 CodeAlpha Task 1 — Simple E-Commerce Store

A full-stack e-commerce web application built as part of the **CodeAlpha Full Stack Development Internship**. This project implements core online shopping features including product browsing, cart management, checkout, user authentication, and order administration.

![Status](https://img.shields.io/badge/status-completed-brightgreen)
![Internship](https://img.shields.io/badge/CodeAlpha-Task%201-blue)

---

## 📖 Overview

This is a simple, functional e-commerce store where users can browse products, view product details, add items to their cart, register/login, and place orders. An admin view is included for managing incoming orders.

**Tech Stack**
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** *(add your DB here — e.g. MongoDB / MySQL / JSON file storage)*

---

## ✨ Features

- 🏬 **Product Listings** — Browse all available products on the homepage
- 🔍 **Product Details Page** — View detailed information for each product
- 🛍️ **Shopping Cart** — Add, update, and remove items before checkout
- 💳 **Checkout & Order Processing** — Place orders with order summary
- 🔐 **User Authentication** — Register and log in as a customer
- 🧾 **Admin Order Management** — View and manage customer orders

---

## 📂 Project Structure

```
CodeAlpha-Task1-Ecommerce/
├── index.html            # Homepage
├── products.html          # Product listing page
├── product-details.html   # Single product details page
├── cart.html               # Shopping cart page
├── checkout.html           # Checkout / order placement page
├── login.html               # User login page
├── register.html            # User registration page
├── admin-orders.html        # Admin panel for viewing/managing orders
├── server.js                 # Express backend server
├── package.json               # Project dependencies & scripts
├── package-lock.json
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes bundled with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/piratheepan96/CodeAlpha-Task1-Ecommerce.git
   cd CodeAlpha-Task1-Ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Open the app**
   Visit `http://localhost:3000` (or whichever port is set in `server.js`) in your browser.

---

## 🧭 Usage

1. Browse products from the **homepage** or **products page**.
2. Click a product to view its **details**.
3. Add products to your **cart**.
4. **Register** or **log in** to your account.
5. Proceed to **checkout** to place your order.
6. Admins can view all placed orders via the **admin-orders** page.

---

## 🗺️ Roadmap / Possible Improvements

- [ ] Connect to a persistent database (MongoDB/MySQL)
- [ ] Add payment gateway integration
- [ ] Implement order status tracking
- [ ] Add product search & filtering
- [ ] Improve responsive design for mobile

---

## 🎓 About This Internship

This project was built as **Task 1** of the **Full Stack Development Internship** at [CodeAlpha](https://www.codealpha.tech). The internship covers frontend and backend web development, RESTful APIs, database integration, authentication, and deployment.

---

## 👤 Author

**Piratheepan**
GitHub: [@piratheepan96](https://github.com/piratheepan96)

---

## 📄 License

This project is open source and available for educational purposes.
