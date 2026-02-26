-- Schema Creation
CREATE SCHEMA IF NOT EXISTS oniria;

-- Types for Roles and Publish States
CREATE TYPE oniria.user_role AS ENUM ('super_admin', 'admin', 'editor');
CREATE TYPE oniria.publish_status AS ENUM ('draft', 'published');
CREATE TYPE oniria.category_type AS ENUM ('Bodas', 'Pre-boda', 'Detalles', 'Recepción');

-- Table: User Roles
CREATE TABLE oniria.user_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role oniria.user_role NOT NULL DEFAULT 'editor'
);

ALTER TABLE oniria.user_roles ENABLE ROW LEVEL SECURITY;

-- Security Policies for user_roles
CREATE POLICY "Users can read their own role" 
ON oniria.user_roles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Super admin can do all on user_roles" 
ON oniria.user_roles FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM oniria.user_roles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Admin can view roles and manage editors" 
ON oniria.user_roles FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM oniria.user_roles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM oniria.user_roles WHERE id = auth.uid() AND role = 'admin') AND role = 'editor'
);


-- Table: Portfolio Projects
CREATE TABLE oniria.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    couple_name TEXT NOT NULL,
    location TEXT,
    event_date DATE,
    description TEXT,
    category oniria.category_type,
    status oniria.publish_status DEFAULT 'draft',
    cover_image_url TEXT,
    images TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE oniria.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Portfolio RLS
CREATE POLICY "Public can view published portfolio projects" 
ON oniria.portfolio_projects FOR SELECT TO public
USING (status = 'published');

CREATE POLICY "Super Admin and Admin full access on portfolio" 
ON oniria.portfolio_projects FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM oniria.user_roles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Table: Blog Posts
CREATE TABLE oniria.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    cover_image_url TEXT,
    status oniria.publish_status DEFAULT 'draft',
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE oniria.blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog RLS
CREATE POLICY "Public can view published blog posts" 
ON oniria.blog_posts FOR SELECT TO public
USING (status = 'published');

CREATE POLICY "All admins and editors can manage blog posts" 
ON oniria.blog_posts FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM oniria.user_roles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor'))
);


-- Table: Messages (Contact Form)
CREATE TABLE oniria.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    event_date DATE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE oniria.messages ENABLE ROW LEVEL SECURITY;

-- Messages RLS
CREATE POLICY "Public can insert messages" 
ON oniria.messages FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Super and Admin can view and manage messages" 
ON oniria.messages FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM oniria.user_roles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
);


-- Storage Bucket: oniria
INSERT INTO storage.buckets (id, name, public) 
VALUES ('oniria', 'oniria', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS on bucket 'oniria'
CREATE POLICY "Public can read oniria bucket"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'oniria');

CREATE POLICY "Editors and admins can upload to oniria bucket"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'oniria' AND
    EXISTS (SELECT 1 FROM oniria.user_roles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor'))
);

CREATE POLICY "Editors and admins can update to oniria bucket"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'oniria' AND
    EXISTS (SELECT 1 FROM oniria.user_roles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor'))
);

CREATE POLICY "Editors and admins can delete from oniria bucket"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'oniria' AND
    EXISTS (SELECT 1 FROM oniria.user_roles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor'))
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION oniria.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolio_projects_modtime
BEFORE UPDATE ON oniria.portfolio_projects
FOR EACH ROW EXECUTE PROCEDURE oniria.update_timestamp();

CREATE TRIGGER update_blog_posts_modtime
BEFORE UPDATE ON oniria.blog_posts
FOR EACH ROW EXECUTE PROCEDURE oniria.update_timestamp();

-- Grant permissions on schema
GRANT USAGE ON SCHEMA oniria TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA oniria TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA oniria TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA oniria TO anon, authenticated;
