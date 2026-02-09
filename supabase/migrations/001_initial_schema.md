# Initial Database Schema - 001_initial_schema.sql

This migration file sets up the foundational database structure for PrintPOS.

## Tables Included:
1.  **profiles**: Stores user information linked to Supabase Auth, including full name and role (admin/staff).
2.  **customers**: Manages customer data such as name, phone, and importantly, their **current_debt** (balance).
3.  **inventory_items**: Tracks stock for paper, ink, binding, and other materials. Includes cost per unit and quantity.
4.  **expenses**: Records operational expenses (rent, electricity) and links them to categories.
5.  **orders**: The core transaction table. Stores total amount, paid amount, status (pending/completed), and payment method.
6.  **order_items**: Detailed breakdown of each order (e.g., specific print jobs, binding services).
7.  **settings**: Global configuration for the app (default costs, profit margins) to allow dynamic pricing adjustments.

## Purpose:
This schema provides the necessary relational structure to handle:
- User authentication and roles.
- Inventory tracking and cost management.
- Order processing and financial recording.
- Customer debt tracking.
