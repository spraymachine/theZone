# Project Quote

**Project:** The Zone — Venue & Event Space Booking Platform  
**Quote Date:** 10 March 2025  
**Quote Valid Until:** 10 April 2025  

---

## Total Project Value

| Description | Amount (INR) |
|-------------|--------------|
| **Total Project Cost** | **₹25,000** |

---

## Project Overview

**The Zone** is a full-stack web application for booking a venue/event space. It includes a public-facing website, an online booking system with payment integration, and an admin dashboard for managing bookings.

---

## Scope of Work

### 1. Public Website

| Deliverable | Description |
|-------------|-------------|
| **Home Page** | Hero section, event types (conferences, parties, get-togethers, corporate), key amenities, testimonials, GSAP scroll animations |
| **Space Page** | Venue showcase and space details |
| **Events Page** | Event categories and offerings |
| **Pricing & FAQ** | Transparent pricing and frequently asked questions |
| **Contact Page** | Contact information and inquiry form |
| **Testimonials Page** | Customer reviews and ratings |

### 2. Booking System

| Deliverable | Description |
|-------------|-------------|
| **Book Now Page** | Date picker, time slot selection (30-min intervals), duration (3–24 hours), guest count, event type selection |
| **Dynamic Pricing** | Weekday (₹3,499 base) and weekend (₹4,499 base) pricing with additional hourly rates |
| **Add-ons** | Deep cleaning, extra projector, sound upgrade, catering setup |
| **Slot Availability** | Real-time conflict detection against existing bookings |
| **Booking Hold** | Temporary slot reservation during checkout (15-minute hold) |

### 3. Payment Integration (Razorpay)

| Deliverable | Description |
|-------------|-------------|
| **Order Creation** | Server-side Razorpay order creation via Supabase Edge Function |
| **Checkout Flow** | Razorpay Checkout modal integration |
| **Payment Verification** | Server-side signature verification before confirming booking |
| **Webhook Handler** | Async handling of `payment.captured`, `payment.failed`, `order.paid` |
| **Failure Recording** | Tracking of failed/expired payments and slot release |

### 4. Backend & Database

| Deliverable | Description |
|-------------|-------------|
| **Supabase Setup** | PostgreSQL database, Row Level Security (RLS) policies |
| **Bookings Table** | Schema for bookings with status workflow (pending → payment_initiated → confirmed / payment_failed / payment_expired / cancelled) |
| **Edge Functions** | `create-razorpay-order`, `verify-razorpay-payment`, `record-razorpay-failure`, `razorpay-webhook` |
| **Email Notifications** | Booking confirmation emails via Mailjet (Supabase Edge Function) |

### 5. Admin Dashboard

| Deliverable | Description |
|-------------|-------------|
| **Admin Gate** | Protected admin area with authentication |
| **Admin Login** | Secure login for administrators |
| **Booking Management** | View, create, edit, and cancel bookings |
| **Manual Bookings** | Create bookings without payment (e.g., walk-ins, special arrangements) |
| **Status Management** | Update booking status, notes, and amounts |

### 6. UI/UX & Animations

| Deliverable | Description |
|-------------|-------------|
| **Responsive Design** | Mobile-friendly layout across all pages |
| **GSAP Animations** | Scroll-triggered animations, horizontal carousels |
| **Time Picker** | Intuitive 12-hour format time slot selector |
| **Consistent Styling** | CSS variables, cohesive design system |

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, GSAP |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **Payments** | Razorpay |
| **Email** | Mailjet |
| **Deployment** | GitHub Pages (static build) |

---

## Exclusions

- Third-party API costs (Razorpay transaction fees, Mailjet credits, Supabase usage beyond free tier)
- Custom domain and SSL (if not already owned)
- Content creation (copy, images) beyond placeholder content
- Ongoing maintenance, hosting, or support beyond delivery

---

## Payment Terms

| Milestone | Amount (INR) | Trigger |
|-----------|--------------|---------|
| **Advance** | ₹12,500 (50%) | On acceptance of quote |
| **Balance** | ₹12,500 (50%) | On project handover and sign-off |

---

## Deliverables

- Full source code (React + Supabase)
- Deployment scripts and documentation
- Razorpay setup guide (`RAZORPAY_SETUP.md`)
- Supabase migration scripts and RLS policies
- Admin access credentials (to be handed over securely)

---

## Acceptance

By accepting this quote, the client agrees to the scope, exclusions, and payment terms outlined above.

| | |
|---|---|
| **Prepared by** | _________________________ |
| **Date** | _________________________ |
| **Accepted by** | _________________________ |
| **Date** | _________________________ |

---

*This quote is valid for 30 days from the date of issue.*
