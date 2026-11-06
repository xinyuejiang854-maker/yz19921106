-- ==============================================================================
-- 紫约星河 ZI LAND - Supabase Postgres Schema & RLS Security Policies
-- ==============================================================================

-- 1. Profiles Table (紫米用户资料)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  region TEXT DEFAULT '全国紫米大厅',
  bio TEXT DEFAULT '与紫同行，未来可期！',
  points INTEGER DEFAULT 100,
  sign_days INTEGER DEFAULT 1,
  last_sign_date DATE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  badges TEXT[] DEFAULT ARRAY['初代紫米'],
  favorite_character TEXT DEFAULT '小夭',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Starlight Photos (星光相册)
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('剧照', '活动生图', '杂志大片', '饭制手绘', '舞台经典')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  likes_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY['杨紫'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved photos are viewable by everyone."
  ON public.photos FOR SELECT USING (status = 'approved' OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can upload photos."
  ON public.photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors or Admins can delete photos."
  ON public.photos FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Photo Comments & Likes (相册互动)
CREATE TABLE IF NOT EXISTS public.photo_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.photo_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone."
  ON public.photo_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment."
  ON public.photo_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Star Wishes & Birthday Messages (生日祝福墙与星愿墙)
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('生日祝福', '新剧大爆', '平安顺遂', '星愿胶囊', '紫米心语')),
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  color_theme TEXT DEFAULT 'purple',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wishes are viewable by everyone."
  ON public.wishes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can make a wish."
  ON public.wishes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Chat & Realtime Messages (全国紫米实时聊天)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'national',
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'sticker', 'system')),
  sticker_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages are viewable by everyone in channel."
  ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages."
  ON public.chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Enable Supabase Realtime replication on chat_messages and wishes
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishes;

-- 6. Content Moderation & Reports (审核与拉黑举报)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('photo', 'comment', 'wish', 'chat', 'user')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can report content."
  ON public.reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can view reports."
  ON public.reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. Supabase Storage Bucket Policies (图片云存储)
INSERT INTO storage.buckets (id, name, public)
VALUES ('star-gallery', 'star-gallery', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to Starlight Gallery"
  ON storage.objects FOR SELECT USING (bucket_id = 'star-gallery');

CREATE POLICY "Authenticated Users can upload images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'star-gallery' AND auth.role() = 'authenticated'
  );
