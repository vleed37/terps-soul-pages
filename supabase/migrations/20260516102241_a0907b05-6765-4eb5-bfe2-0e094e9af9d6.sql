
alter table public.subscribers
  add constraint subscribers_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' and length(email) <= 255),
  add constraint subscribers_source_len check (source is null or length(source) <= 50);

alter table public.restock_notifications
  add constraint restock_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' and length(email) <= 255);

alter table public.wholesale_inquiries
  add constraint wholesale_name_len check (length(full_name) between 1 and 120),
  add constraint wholesale_business_len check (business_name is null or length(business_name) <= 200),
  add constraint wholesale_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' and length(email) <= 255),
  add constraint wholesale_phone_len check (phone is null or length(phone) <= 30),
  add constraint wholesale_message_len check (message is null or length(message) <= 2000);
