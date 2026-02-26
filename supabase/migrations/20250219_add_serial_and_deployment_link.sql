-- Run this on existing databases to add serial_number and deployment link.
-- New installs already have these in schema.sql.

ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS serial_number text;

ALTER TABLE public.deployments ADD COLUMN IF NOT EXISTS inventory_item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL;
