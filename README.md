# 🚚 FleetFlow: Modular Fleet & Logistics Management System

**Built for the Odoo x Gujarat Vidyapith Hackathon**

FleetFlow is a centralized, rule-based digital hub designed to replace manual logbooks. It optimizes the lifecycle of a delivery fleet, strictly enforces driver safety compliance, and calculates real-time financial ROI based on operational logs.

## 🎯 How I Nailed the "Must Haves"
* **Dynamic Data & Offline Capable:** Built with Next.js App Router and a local **SQLite** database via Prisma. No static JSON. The entire system runs flawlessly completely offline.
* **Robust Input Validation:** Backend Server Actions strictly prevent dispatching if `CargoWeight > MaxCapacity`, or if a driver's license is expired.
* **State Management:** Fully implemented the `Draft → Dispatched → Completed` loop, automatically updating Vehicle/Driver availability statuses along the way.
* **Clean UI:** Built with Tailwind CSS and Shadcn for a responsive, intuitive, enterprise-grade interface.

## ⚙️ Tech Stack
* **Framework:** Next.js (App Router)
* **Database:** SQLite (Local)
* **ORM:** Prisma
* **Styling:** Tailwind CSS + Radix/Shadcn UI

## 🚀 How to Run Locally (For Evaluators)
Because this app is designed for local/offline execution, setup takes less than 60 seconds.

**1. Clone the repository and install dependencies:**
\`\`\`bash
npm install
\`\`\`

**2. Push the schema and seed the database:**
*Note: I wrote a seed script to instantly populate the database with users, vehicles, drivers, and historical trips so you can test the analytics immediately.*
\`\`\`bash
npx prisma db push
npm run build # (Optional: if tsx is not globally installed)
npx tsx prisma/seed.ts
\`\`\`

**3. Start the development server:**
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Things to Test (Validating the Business Logic)
I built strict ERP constraints into this app. Try to break them!
1. **Try overloading a truck:** Go to the Dispatcher, select the Light Van (500kg max), and try to assign 600kg of cargo. The system will block it.
2. **Try an expired license:** Try assigning a driver marked "Expired". The system will block it.
3. **Log Maintenance:** Go to the Maintenance tab, log a repair for a vehicle. Notice how it instantly disappears from the Dispatcher's selection pool.
4. **Check the Math:** Go to Financial Reports to see the dynamic ROI calculated based on the precise Odoo formula: `(Revenue - (Maintenance + Fuel)) / Acquisition Cost`.
