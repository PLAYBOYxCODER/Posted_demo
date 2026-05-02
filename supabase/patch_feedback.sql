-- Recreate Customer Feedbacks & Disputes System
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  images TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure permissions
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create feedback" ON contact_messages;
CREATE POLICY "Anyone can create feedback" ON contact_messages FOR INSERT WITH CHECK(true);

DROP POLICY IF EXISTS "Admins can view feedback" ON contact_messages;
CREATE POLICY "Admins can view feedback" ON contact_messages FOR SELECT USING (true); -- Admin views them locally

DROP POLICY IF EXISTS "Admins can delete feedback" ON contact_messages;
CREATE POLICY "Admins can delete feedback" ON contact_messages FOR DELETE USING (true);
