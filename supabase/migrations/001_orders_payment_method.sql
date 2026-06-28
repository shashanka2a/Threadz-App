-- Allow razorpay and other payment methods (drop legacy enum-style check)
alter table public.orders drop constraint if exists orders_payment_method_check;
