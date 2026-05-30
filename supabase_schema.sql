-- Supabase Schema for "Bible पढ कण्ठस्त प्रतियोगिता"
-- Execute this SQL script in your Supabase SQL Editor to provision the tables and security rules.

-- 1. ENABLE UUID GENERATION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE ILLAKAS TABLE
CREATE TABLE public.illakas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ne VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE PARTICIPANTS TABLE
CREATE TABLE public.participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ne VARCHAR(255) NOT NULL,
    church_name VARCHAR(255) NOT NULL,
    illaka_id UUID REFERENCES public.illakas(id) ON DELETE RESTRICT,
    age_group VARCHAR(100) NOT NULL,
    photo_url TEXT, -- Base64 or Bucket URL
    attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREATE SCORE CATEGORIES TABLE
CREATE TABLE public.score_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ne VARCHAR(255) NOT NULL UNIQUE,
    max_marks INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE SCORES TABLE
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.score_categories(id) ON DELETE CASCADE,
    judge_name VARCHAR(255) NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULLCHECK (marks_obtained >= 0),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_participant_category_judge UNIQUE (participant_id, category_id, judge_name)
);

-- 6. CREATE NOTICES TABLE
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ne TEXT NOT NULL,
    content_ne TEXT,
    is_ticker BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CREATE MATERIALS TABLE
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ne VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size VARCHAR(100) NOT NULL,
    file_url TEXT DEFAULT '#',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CREATE EVENT SETTINGS TABLE (Single row configuration)
CREATE TABLE public.event_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    title_ne VARCHAR(255) NOT NULL DEFAULT 'बाइबल पढ कण्ठस्त प्रतियोगिता २०८३',
    subtitle_ne VARCHAR(255) NOT NULL DEFAULT 'इग्नाइटर टिम (Igniter Team)',
    event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 days'),
    lock_scores BOOLEAN NOT NULL DEFAULT FALSE,
    dashboard_visible BOOLEAN NOT NULL DEFAULT TRUE
);

-- 9. PRE-SEED INITIAL REQUIRED DATA
INSERT INTO public.illakas (id, name_ne) VALUES
    ('i1111111-1111-1111-1111-111111111111', 'इलाका १ - धरान'),
    ('i2222222-2222-2222-2222-222222222222', 'इलाका २ - इटहरी'),
    ('i3333333-3333-3333-3333-333333333333', 'इलाका ३ - विराटनगर'),
    ('i4444444-4444-4444-4444-444444444444', 'इलाका ४ - इनरुवा')
ON CONFLICT (name_ne) DO NOTHING;

INSERT INTO public.score_categories (id, name_ne, max_marks) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'शुद्धता (Accuracy)', 30),
    ('c2222222-2222-2222-2222-222222222222', 'गति (Speed)', 20),
    ('c3333333-3333-3333-3333-333333333333', 'उच्चारण (Pronunciation)', 20),
    ('c4444444-4444-4444-4444-444444444444', 'आत्मविश्वास (Confidence)', 15),
    ('c5555555-5555-5555-5555-555555555555', 'कण्ठस्त स्तर (Memorization Level)', 15)
ON CONFLICT (name_ne) DO NOTHING;

INSERT INTO public.event_settings (id, title_ne, subtitle_ne, lock_scores, dashboard_visible)
VALUES (1, 'बाइबल पढ कण्ठस्त प्रतियोगिता २०८३', 'इग्नाइटर टिम (Igniter Team)', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 10. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.illakas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

-- 11. SECURITY POLICIES FOR VIEWER (PUBLIC READ ACCESS)
CREATE POLICY "Allow public read access on illakas" ON public.illakas FOR SELECT USING (true);
CREATE POLICY "Allow public read access on participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Allow public read access on score_categories" ON public.score_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Allow public read access on notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Allow public read access on materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Allow public read access on event_settings" ON public.event_settings FOR SELECT USING (true);

-- 12. WRITE SECURITY POLICIES FOR AUTHENTICATED ROLES (ADMINS / JUDGES)
-- (Note: Set custom claims or map schemas accordingly in production supabase settings)
CREATE POLICY "Allow write operations for admins on all tables"
    ON public.illakas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow write operations for admins on participants"
    ON public.participants FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow write operations for admins on score_categories"
    ON public.score_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow judge score entry"
    ON public.scores FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow admin manage notices"
    ON public.notices FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin manage materials"
    ON public.materials FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin edit settings"
    ON public.event_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
