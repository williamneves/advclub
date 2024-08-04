-- Custom SQL migration file, put you code below! --
insert into
  storage.buckets (id, name)
values
  ('default', 'default');

CREATE POLICY "ANON READY pjqibl_0" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'default');

CREATE POLICY "AUTH ALL pjqibl_0" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'default');

CREATE POLICY "AUTH ALL pjqibl_1" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'default');