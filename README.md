# Project: StayEasy - Online Hotel & Homestay Booking System
**StayEasy** is a state-of-the-art online platform for searching and booking hotel rooms and homestays. Developed with high-end aesthetic designs, custom glassmorphism interfaces, smooth live interactive filters, and full loading spinners for responsive UX/UI.

---
> [!IMPORTANT]
> **DEVELOPMENT & COPYRIGHT INFO**:
> "Project: StayEasy - Developed by SlimexDev / Rimuru Scripter"
> This banner is placed in all top file comments and headers.
---
## 🚀 Technologies & Constraints
This project complies strictly with the following technical boundaries:
- **Core Core**: Vanilla HTML5, Vanilla CSS3, Vanilla ES6 JavaScript (using Modules).
- **Styling**: Bootstrap 5.3.3 via CDN + custom HSL dark/light variable systems.
- **Library Bans**: NO React, Vue, Angular, Axios, TypeScript, TailwindCSS, or SweetAlert2.
- **AJAX**: Pure `Fetch API` for backend database bindings.
---

## 📂 Folder Directory Layout
```text
StayEasy/
├── index.html         # Main Client Search and Booking Page
├── admin.html         # Administrator Room CRUD & Booking Approval Portal
├── css/
│   └── style.css      # Custom HSL-tailored styles, Glassmorphism UI, & Animations
├── js/
│   ├── api.js         # Fetch-based API connection module (MockAPI v1)
│   ├── utils.js       # Global helpers: Dark Mode, Session, Dynamic Calculations, Loading Spinner
│   ├── main.js        # Logic for index.html (Room listing, Filtering, Dynamic Booking)
│   └── admin.js       # Logic for admin.html (Security guard, Room CRUD, Booking Aggregator)
└── README.md          # Project Documentation & Run Guide
```

## 💾 Database Schemas on MockAPI
**Base Path**: `https://69f9a6e3c509a40d3aa2f039.mockapi.io/api/v1`
### 1. Rooms Endpoint (`/rooms`)
- `id`: string (automated)
- `roomName`: string
- `type`: string ("Phòng đơn" / "Phòng đôi" / "Căn hộ")
- `price`: number (Cost per night)
- `maxGuests`: number
- `image`: string (Image URL link)
- `description`: string
- `status`: string ("Trống" / "Đang sửa")

### 2. Users Endpoint (`/users`)
- `id`: string (automated)
- `username`: string (unique lookup)
- `password`: string
- `fullName`: string
- `role`: string ("admin" / "student")
- `bookings`: Array of booking objects
  - `bookingId`: string
  - `roomId`: string
  - `roomName`: string
  - `checkInDate`: string (YYYY-MM-DD)
  - `checkOutDate`: string (YYYY-MM-DD)
  - `totalNights`: number
  - `totalPrice`: number
  - `status`: string ("Chờ xác nhận" / "Đã xác nhận" / "Từ chối")

## 🛠️ Step-by-Step Run Instructions
1. **Clone or Open Folder**:
   Put all directories and files inside a local folder (e.g., `StayEasy/`).
2. **Serve the Application**:
   Since the codebase utilizes ES6 modules (`type="module"`), you **MUST** run the project on a local web server to avoid CORS issues (`file://` protocol restrictions).
   - *Option A*: Open VS Code and launch the **Live Server** extension.
   - *Option B*: If Node.js is installed, run:
     ```bash
     npx http-server ./
     ```
   - *Option C*: If Python is installed, run:
     ```bash
     python -m http-server 8000
     ```
3. **Browse**:
   Open your browser at `http://localhost:8080` (or the port specified by your local server tool).

## 🧪 Admin Credentials for Testing
To quickly test the administration dashboard:
1. Open the Homepage (`index.html`).
2. Click **Đăng ký** (Register) to sign up a new account, or use existing accounts.
3. Registered accounts can have `role: "admin"` or `role: "student"`.
4. Log in with the administrator account.
5. A **Quản trị** button will appear in the navigation bar. Click it to navigate to `admin.html`.
6. Alternatively, attempt to go straight to `admin.html` without admin logging in first to test the automated **Security Guardian gate** which blocks and immediately redirects illegal break-ins!
