-- Create the talents table
CREATE TABLE IF NOT EXISTS talents (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB NOT NULL
);

-- Create index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_talents_metadata ON talents USING GIN (metadata);

-- Insert sample talents
INSERT INTO talents (id, name, description, metadata) VALUES
('modern-minimalist', 'Modern Minimalist', 'Clean, minimal design with lots of whitespace and emphasis on typography', 
 '{
    "aesthetic_characteristics": {
      "style": "minimalist",
      "mood": "calm",
      "complexity": 2,
      "minimalism": 9,
      "boldness": 3,
      "playfulness": 2,
      "elegance": 8
    },
    "design_attributes": {
      "whitespace_balance": 9,
      "color_harmony": 7,
      "visual_rhythm": 6,
      "layout_density": 2,
      "texture_use": 1,
      "border_use": 2,
      "shadow_use": 3
    },
    "color_palette": {
      "primary": "#2D3748",
      "secondary": "#4A5568",
      "accent": "#38B2AC",
      "background": "#FFFFFF",
      "text": "#1A202C"
    },
    "typography": {
      "headingFont": "Inter, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "scale": 1.2,
      "weight": "light",
      "letterSpacing": 0.02,
      "lineHeight": 1.5
    }
  }'
),

('bold-vibrant', 'Bold & Vibrant', 'Energetic design with bold colors and strong visual elements', 
 '{
    "aesthetic_characteristics": {
      "style": "vibrant",
      "mood": "energetic",
      "complexity": 7,
      "minimalism": 3,
      "boldness": 9,
      "playfulness": 8,
      "elegance": 4
    },
    "design_attributes": {
      "whitespace_balance": 4,
      "color_harmony": 8,
      "visual_rhythm": 7,
      "layout_density": 7,
      "texture_use": 6,
      "border_use": 5,
      "shadow_use": 7
    },
    "color_palette": {
      "primary": "#6B46C1",
      "secondary": "#805AD5",
      "accent": "#F6AD55",
      "background": "#F7FAFC",
      "text": "#2D3748"
    },
    "typography": {
      "headingFont": "Montserrat, sans-serif",
      "bodyFont": "Open Sans, sans-serif",
      "scale": 1.333,
      "weight": "bold",
      "letterSpacing": 0.01,
      "lineHeight": 1.6
    }
  }'
),

('elegant-serif', 'Elegant Serif', 'Sophisticated design with classic serif typography and refined aesthetics', 
 '{
    "aesthetic_characteristics": {
      "style": "classic",
      "mood": "sophisticated",
      "complexity": 5,
      "minimalism": 5,
      "boldness": 4,
      "playfulness": 2,
      "elegance": 9
    },
    "design_attributes": {
      "whitespace_balance": 7,
      "color_harmony": 8,
      "visual_rhythm": 7,
      "layout_density": 5,
      "texture_use": 4,
      "border_use": 3,
      "shadow_use": 3
    },
    "color_palette": {
      "primary": "#553C9A",
      "secondary": "#6B46C1",
      "accent": "#D6BCFA",
      "background": "#FAF5FF",
      "text": "#44337A"
    },
    "typography": {
      "headingFont": "Playfair Display, serif",
      "bodyFont": "Merriweather, serif",
      "scale": 1.25,
      "weight": "regular",
      "letterSpacing": 0.01,
      "lineHeight": 1.7
    }
  }'
),

('playful-geometric', 'Playful Geometric', 'Fun and geometric design with bright colors and playful shapes', 
 '{
    "aesthetic_characteristics": {
      "style": "geometric",
      "mood": "playful",
      "complexity": 6,
      "minimalism": 4,
      "boldness": 7,
      "playfulness": 9,
      "elegance": 3
    },
    "design_attributes": {
      "whitespace_balance": 5,
      "color_harmony": 8,
      "visual_rhythm": 8,
      "layout_density": 6,
      "texture_use": 5,
      "border_use": 7,
      "shadow_use": 6
    },
    "color_palette": {
      "primary": "#E53E3E",
      "secondary": "#FC8181",
      "accent": "#F6E05E",
      "background": "#FFF5F5",
      "text": "#2D3748"
    },
    "typography": {
      "headingFont": "Poppins, sans-serif",
      "bodyFont": "Nunito, sans-serif",
      "scale": 1.4,
      "weight": "medium",
      "letterSpacing": 0.02,
      "lineHeight": 1.6
    }
  }'
),

('dark-tech', 'Dark Tech', 'Sleek dark-mode design with futuristic elements and vibrant accents', 
 '{
    "aesthetic_characteristics": {
      "style": "futuristic",
      "mood": "intense",
      "complexity": 7,
      "minimalism": 6,
      "boldness": 8,
      "playfulness": 3,
      "elegance": 7
    },
    "design_attributes": {
      "whitespace_balance": 6,
      "color_harmony": 8,
      "visual_rhythm": 7,
      "layout_density": 5,
      "texture_use": 4,
      "border_use": 3,
      "shadow_use": 8
    },
    "color_palette": {
      "primary": "#171923",
      "secondary": "#2D3748",
      "accent": "#38B2AC",
      "background": "#0D1117",
      "text": "#E2E8F0"
    },
    "typography": {
      "headingFont": "Space Grotesk, sans-serif",
      "bodyFont": "Inter, sans-serif",
      "scale": 1.25,
      "weight": "medium",
      "letterSpacing": 0.01,
      "lineHeight": 1.6
    }
  }'
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_talents_updated_at
BEFORE UPDATE ON talents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 