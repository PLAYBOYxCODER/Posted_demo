# Poster Store – Full Technical Documentation

Welcome to the definitive technical blueprint of the Premium Poster Store e-commerce application. This documentation provides a clear, high-level overview of the fully implemented architecture, frontend interfaces, backend features, database structure, and deployment instructions.

## 1. Project Overview
This project is a modern, high-performance, and visually striking e-commerce web application specifically built for selling premium posters and offering "Design Your Own" customization tools.

**Core Philosophy:** 
- **Premium Aesthetics:** Dark mode, neon glows, glassmorphism, smooth scrolling, and micro-interactions (built via Framer Motion).
- **Scalability:** Full Serverless integration with Supabase and Next.js APIs.
- **Conversion Focused:** Fast checkout, integrated Razerpay, automated address filling, strict auth gating, and an intuitive "Design Your Own" interface.

---

## 2. Technology Stack

### Frontend Architecture
- **Framework:** Next.js 14 (App Router)
- **Library:** React.js
- **Styling:** Tailwind CSS (with highly custom animations and UI classes)
- **Icons:** Lucide React
- **Animations:** Framer Motion & CSS keyframe animations (Splash Screen, Infinite Carousels)

### Backend & Infrastructure
- **Database (PostgreSQL):** Supabase
- **Authentication:** Supabase Auth (Email OTP, Google Auth, Phone OTP)
- **Object Storage:** Supabase Storage (for user profile pics, custom poster uploads)
- **Email Service:** Resend (For Welcome emails, Order Placed, and Dispatch Tracking emails)
- **Payment Gateway:** Razorpay API Integration
- **Logistics Integration:** Shiprocket API Integration

---

## 3. Database Schema Overview (Supabase PostgreSQL)

The application utilizes a highly relational and secure database architecture with Row Level Security (RLS) enforcement.

1. **`profiles`**
   - Stores all user information. Handled automatically via Auth triggers.
   - **Key Columns:** `id`, `email`, `phone`, `full_name`, `avatar_url`, `shipping_addresses` (JSONB).
2. **`products`**
   - Global catalog. Modified securely via the Admin Panel.
   - **Key Columns:** `id`, `title`, `description`, `price`, `sale_price`, `category`, `images` (Array), `dimensions` (JSONB).
3. **`orders`**
   - The master transactional ledger. Uses UUIDs natively, but generates a human-readable `order_id` (e.g., `ORD-84521`).
   - **Key Columns:** `id`, `order_id`, `customer_email`, `status`, `product_details` (JSONB), `tracking_id`, `shipped_at`, `delivered_at`.
4. **`order_status_history` & `shipping_events`**
   - Time-series ledger tables to permanently record every movement (Pending -> Processing -> Shipped -> Delivered) to keep the customer fully informed.
5. **`contact_messages`**
   - Captures inputs from the customer service Contact Us page.

---

## 4. Key Flow & Website Structure

### A. Customer Flow
*   **Onboarding:** The app has a high-quality animated entry Splash screen before revealing the store.
*   **The Shop Matrix:** Users land on the `Home` page that natively contains infinite carousels, dynamic collections, and the "Design Your Own" section.
*   **Authentication:** The `/profile` or `/login` pages handle sign-ups via OTP or Google. The UI automatically remembers addresses.
*   **Shopping Cart & Checkout:** Zero trust model. Users MUST be logged in to checkout. Addresses are pre-filled. Checking out triggers Razorpay gateway.
*   **Logistics Tracking:** Customers can go to the `/track` page. Entering their `ORD-` ID immediately pulls live shipping data and provides a direct Shiprocket tracking link.

### B. Admin Flow
*   **Login Barrier:** The Admin panel is globally restricted with a secondary passphrase login system. Standard users cannot enter it.
*   **Order Dashboard (`/admin/orders`):** Admins can view all global active orders. They have toggles to view Custom vs Standard orders. With one click, they can flag an order for shipping and generate HTML receipts.
*   **Tracking UI (`/admin/tracking`):** A custom Kanban-style step-by-step workflow allowing admins to click buttons to progress an order from `Accept & Print` -> `Pack` -> `Dispatch` -> `Near City` -> `Delivered`.
*   **Product Management (`/admin/menu`):** Simple interface to change pricing, swap images, or add entirely new categories that immediately sync to the customer home page.

---

## 5. Unique Advanced Features Built

1. **Design Your Own Engine:** The `/design` page allows users to drag & drop their own photos onto frames to build custom printed artwork.
2. **Zero-Trust Order History:** The `OrderProvider.tsx` context wrapper ensures that even if API endpoints are hit directly, a user can ONLY see orders where the `customer_email` precisely matches their active Auth session.
3. **Automated Resend Emails:** Customers receive beautifully formatted HTML emails instantly upon Order Creation and Order Dispatch so you rarely get "Where is my order" support tickets.

---

## 6. Development & Deployment Guide

### Running Locally
1. Clone the repository and navigate to `poster-store`.
2. Ensure you have Node.js installed.
3. Install packages: `npm install`
4. Setup your `.env.local` containing:
   - `NEXT_PUBLIC_SUPABASE_URL` AND `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RAZORPAY_KEY_ID` AND `RAZORPAY_KEY_SECRET`
   - `RESEND_API_KEY`
   - `ADMIN_CREDENTIALS`
5. Run the dev server: `npm run dev`
6. Open `http://localhost:3000`

### Deploying to Production (Vercel/Netlify)
1. Push your final code to GitHub.
2. Link the repository to your Vercel or Netlify account.
3. In the platform dashboard, enter ALL the variables from your `.env.local` into the Production Environment Variables sheet.
4. Deploy. Next.js creates fully optimized static caches of your shop pages to ensure immediate load speeds.

---

## Need Further Upgrades?
Because the backend is cleanly mapped in Supabase and the UI is broken into reusable components, you can easily plug in Machine Learning recommendation APIs or new logistics courier Webhooks in the future with minimal architectural changes.
