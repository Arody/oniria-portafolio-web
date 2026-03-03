-- Table: Global Settings (Singleton Row)
CREATE TABLE oniria.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_title TEXT NOT NULL DEFAULT 'Oniria Weddings',
    site_description TEXT,
    logo_text TEXT,
    logo_image_url TEXT,
    
    -- Typography Choices (CSS font-family strings)
    heading_font TEXT DEFAULT 'Cabinet Grotesk',
    body_font TEXT DEFAULT 'Inter',
    
    -- Hero Section Configuration
    hero_title TEXT DEFAULT 'CREANDO RECUERDOS ATEMPORALES',
    hero_subtitle TEXT DEFAULT 'Fotografía Editorial de Bodas',
    hero_background_type TEXT DEFAULT 'image' CHECK (hero_background_type IN ('image', 'video')),
    hero_background_url TEXT, -- Can be an image URL or a Vimeo embed URL
    
    -- Contact Email Receiving
    contact_email TEXT,

    -- Singleton enforcement: Always ensure id = 1 or a constant UUID so there's only one config row
    is_singleton BOOLEAN DEFAULT true UNIQUE CHECK (is_singleton),

    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE oniria.settings ENABLE ROW LEVEL SECURITY;

-- Settings RLS
CREATE POLICY "Public can read settings" 
ON oniria.settings FOR SELECT TO public
USING (true);

CREATE POLICY "Super and Admin can update settings" 
ON oniria.settings FOR UPDATE TO authenticated
USING (oniria.has_role(ARRAY['super_admin', 'admin']))
WITH CHECK (oniria.has_role(ARRAY['super_admin', 'admin']));

CREATE POLICY "Super and Admin can insert initial settings"
ON oniria.settings FOR INSERT TO authenticated
WITH CHECK (oniria.has_role(ARRAY['super_admin', 'admin']));

-- Insert initial values row automatically
INSERT INTO oniria.settings (site_title, site_description, logo_text, heading_font, body_font)
VALUES (
    'Oniria Weddings', 
    'Fotografía Editorial de Bodas', 
    'ONIRIA.',
    'Cabinet Grotesk',
    'Inter'
) ON CONFLICT DO NOTHING;

-- Migration to add logo_size
ALTER TABLE oniria.settings ADD COLUMN IF NOT EXISTS logo_size INTEGER DEFAULT 40;
