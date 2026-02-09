-- Migration: Make created_by nullable in orders table
-- This allows orders to be created without a specific user assignment

ALTER TABLE public.orders ALTER COLUMN created_by DROP NOT NULL;
