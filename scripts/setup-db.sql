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
    },
    "design_system": {
      "colors": {
        "core": "oklch(50% .25 300)",
        "tint_scale": 1.25,
        "shade_scale": 1.25,
        "chroma_shift": 1,
        "chroma_neutral": 0.025,
        "theme": {
          "brand_primary": "var(--u-color-core-01-400)",
          "bg_primary": "var(--u-color-core-00-900)",
          "text_primary": "var(--u-color-core-00-100)",
          "text_secondary": "var(--u-color-core-00-200)"
        }
      },
      "spacing": {
        "padding_xl": "4rem",
        "padding_lg": "3rem",
        "padding_md": "2rem",
        "padding_sm": "1rem",
        "padding_xs": "0.5rem"
      },
      "typography": {
        "font_family_heading": "\"Inter Variable\", sans-serif",
        "font_family_body": "\"Inter Variable\", sans-serif",
        "font_trim_top": 0.43,
        "font_trim_bottom": 0.36,
        "font_scale": 1.3,
        "font_base": 16,
        "font_weight_thin": 100,
        "font_weight_normal": 400,
        "font_weight_bold": 780,
        "line_height_tight": 1.1,
        "line_height_normal": 1.4,
        "line_height_loose": 1.7,
        "letter_spacing_tight": -0.03,
        "letter_spacing_normal": -0.0004
      },
      "borders": {
        "weight_primary": "1px",
        "weight_secondary": "2px",
        "radius_scale": "0.5rem",
        "radius_rd": "100vw",
        "radius_xl": "calc(var(--u-border-radius-scale) * 2.25)",
        "radius_lg": "calc(var(--u-border-radius-scale) * 1.75)",
        "radius_md": "var(--u-border-radius-scale)",
        "radius_sm": "calc(var(--u-border-radius-scale) * 0.75)",
        "radius_xs": "calc(var(--u-border-radius-scale) * 0.425)"
      },
      "components": {
        "button": {
          "padding": "0.75rem 1.5rem",
          "border_radius": "0.5rem",
          "transition": "all 0.3s ease"
        },
        "card": {
          "padding": "1rem",
          "border_radius": "0.5rem",
          "box_shadow": "0 0.1rem 0.3rem rgba(0, 0, 0, 0.1)"
        },
        "input": {
          "padding": "0.75rem",
          "border_radius": "0.5rem",
          "border": "1px solid #ddd"
        }
      }
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
    },
    "design_system": {
      "colors": {
        "core": "oklch(40% .3 280)",
        "tint_scale": 1.25,
        "shade_scale": 1.3,
        "chroma_shift": 1.2,
        "chroma_neutral": 0.02,
        "theme": {
          "brand_primary": "var(--u-color-core-01-500)",
          "bg_primary": "var(--u-color-core-00-100)",
          "text_primary": "var(--u-color-core-00-900)",
          "text_secondary": "var(--u-color-core-00-700)"
        }
      },
      "spacing": {
        "padding_xl": "4rem",
        "padding_lg": "3rem",
        "padding_md": "2rem",
        "padding_sm": "1.25rem",
        "padding_xs": "0.75rem"
      },
      "typography": {
        "font_family_heading": "\"Montserrat Variable\", sans-serif",
        "font_family_body": "\"Open Sans Variable\", sans-serif",
        "font_trim_top": 0.42,
        "font_trim_bottom": 0.35,
        "font_scale": 1.333,
        "font_base": 16,
        "font_weight_thin": 100,
        "font_weight_normal": 400,
        "font_weight_bold": 700,
        "line_height_tight": 1.2,
        "line_height_normal": 1.5,
        "line_height_loose": 1.8,
        "letter_spacing_tight": -0.02,
        "letter_spacing_normal": 0
      },
      "borders": {
        "weight_primary": "2px",
        "weight_secondary": "3px",
        "radius_scale": "0.5rem",
        "radius_rd": "100vw",
        "radius_xl": "calc(var(--u-border-radius-scale) * 2)",
        "radius_lg": "calc(var(--u-border-radius-scale) * 1.5)",
        "radius_md": "var(--u-border-radius-scale)",
        "radius_sm": "calc(var(--u-border-radius-scale) * 0.75)",
        "radius_xs": "calc(var(--u-border-radius-scale) * 0.5)"
      },
      "components": {
        "button": {
          "padding": "0.75rem 2rem",
          "border_radius": "0.5rem",
          "transition": "all 0.3s ease",
          "font_weight": "700"
        },
        "card": {
          "padding": "1.5rem",
          "border_radius": "0.5rem",
          "box_shadow": "0 0.2rem 0.6rem rgba(0, 0, 0, 0.15)"
        },
        "input": {
          "padding": "0.75rem",
          "border_radius": "0.5rem",
          "border": "2px solid #e0e0e0"
        }
      }
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
    },
    "design_system": {
      "colors": {
        "core": "oklch(45% .05 260)",
        "tint_scale": 1.35,
        "shade_scale": 1.35,
        "chroma_shift": 0.8,
        "chroma_neutral": 0.015,
        "theme": {
          "brand_primary": "var(--u-color-core-01-500)",
          "bg_primary": "var(--u-color-core-00-100)",
          "text_primary": "var(--u-color-core-00-900)",
          "text_secondary": "var(--u-color-core-00-800)"
        }
      },
      "spacing": {
        "padding_xl": "5rem",
        "padding_lg": "3.75rem",
        "padding_md": "2.5rem",
        "padding_sm": "1.25rem",
        "padding_xs": "0.625rem"
      },
      "typography": {
        "font_family_heading": "\"Playfair Display Variable\", serif",
        "font_family_body": "\"Merriweather\", serif",
        "font_trim_top": 0.5,
        "font_trim_bottom": 0.45,
        "font_scale": 1.5,
        "font_base": 18,
        "font_weight_thin": 300,
        "font_weight_normal": 400,
        "font_weight_bold": 700,
        "line_height_tight": 1.3,
        "line_height_normal": 1.6,
        "line_height_loose": 1.9,
        "letter_spacing_tight": 0.05,
        "letter_spacing_normal": 0.1
      },
      "borders": {
        "weight_primary": "1px",
        "weight_secondary": "2px",
        "radius_scale": "0.3rem",
        "radius_rd": "100vw",
        "radius_xl": "calc(var(--u-border-radius-scale) * 2)",
        "radius_lg": "calc(var(--u-border-radius-scale) * 1.5)",
        "radius_md": "var(--u-border-radius-scale)",
        "radius_sm": "calc(var(--u-border-radius-scale) * 0.75)",
        "radius_xs": "calc(var(--u-border-radius-scale) * 0.5)"
      },
      "components": {
        "button": {
          "padding": "0.875rem 2.25rem",
          "border_radius": "0.25rem",
          "transition": "all 0.4s ease",
          "font_weight": "500",
          "letter_spacing": "0.1em"
        },
        "card": {
          "padding": "2rem",
          "border_radius": "0.3rem",
          "box_shadow": "0 0.1rem 0.3rem rgba(0, 0, 0, 0.08)"
        },
        "input": {
          "padding": "1rem",
          "border_radius": "0.25rem",
          "border": "1px solid #d8d8d8"
        }
      }
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
    },
    "design_system": {
      "colors": {
        "core": "oklch(70% .35 20)",
        "tint_scale": 1.2,
        "shade_scale": 1.2,
        "chroma_shift": 1.3,
        "chroma_neutral": 0.03,
        "theme": {
          "brand_primary": "var(--u-color-core-01-500)",
          "bg_primary": "var(--u-color-core-00-100)",
          "text_primary": "var(--u-color-core-00-800)",
          "text_secondary": "var(--u-color-core-00-600)"
        }
      },
      "spacing": {
        "padding_xl": "3.5rem",
        "padding_lg": "2.75rem",
        "padding_md": "2rem",
        "padding_sm": "1.25rem",
        "padding_xs": "0.75rem"
      },
      "typography": {
        "font_family_heading": "\"Poppins Variable\", sans-serif",
        "font_family_body": "\"Nunito\", sans-serif",
        "font_trim_top": 0.45,
        "font_trim_bottom": 0.38,
        "font_scale": 1.414,
        "font_base": 16,
        "font_weight_thin": 300,
        "font_weight_normal": 400,
        "font_weight_bold": 800,
        "line_height_tight": 1.3,
        "line_height_normal": 1.6,
        "line_height_loose": 1.9,
        "letter_spacing_tight": -0.01,
        "letter_spacing_normal": 0.01
      },
      "borders": {
        "weight_primary": "2px",
        "weight_secondary": "4px",
        "radius_scale": "0.75rem",
        "radius_rd": "100vw",
        "radius_xl": "calc(var(--u-border-radius-scale) * 2.5)",
        "radius_lg": "calc(var(--u-border-radius-scale) * 2)",
        "radius_md": "var(--u-border-radius-scale)",
        "radius_sm": "calc(var(--u-border-radius-scale) * 0.8)",
        "radius_xs": "calc(var(--u-border-radius-scale) * 0.6)"
      },
      "components": {
        "button": {
          "padding": "0.875rem 2rem",
          "border_radius": "1.5rem",
          "transition": "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          "font_weight": "700"
        },
        "card": {
          "padding": "1.5rem",
          "border_radius": "1rem",
          "box_shadow": "0 0.2rem 0.6rem rgba(0, 0, 0, 0.12)"
        },
        "input": {
          "padding": "1rem",
          "border_radius": "1rem",
          "border": "2px solid #e0e0e0"
        }
      }
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
    },
    "design_system": {
      "colors": {
        "core": "oklch(60% .3 190)",
        "tint_scale": 1.25,
        "shade_scale": 1.25,
        "chroma_shift": 1.2,
        "chroma_neutral": 0.01,
        "theme": {
          "brand_primary": "var(--u-color-core-01-500)",
          "bg_primary": "var(--u-color-core-00-900)",
          "text_primary": "var(--u-color-core-00-100)",
          "text_secondary": "var(--u-color-core-00-300)"
        }
      },
      "spacing": {
        "padding_xl": "4rem",
        "padding_lg": "3rem",
        "padding_md": "2rem",
        "padding_sm": "1rem",
        "padding_xs": "0.5rem"
      },
      "typography": {
        "font_family_heading": "\"Space Grotesk\", sans-serif",
        "font_family_body": "\"Inter Variable\", sans-serif",
        "font_trim_top": 0.42,
        "font_trim_bottom": 0.34,
        "font_scale": 1.25,
        "font_base": 16,
        "font_weight_thin": 100,
        "font_weight_normal": 400,
        "font_weight_bold": 600,
        "line_height_tight": 1.2,
        "line_height_normal": 1.5,
        "line_height_loose": 1.8,
        "letter_spacing_tight": 0.02,
        "letter_spacing_normal": 0.05
      },
      "borders": {
        "weight_primary": "1px",
        "weight_secondary": "2px",
        "radius_scale": "0.25rem",
        "radius_rd": "100vw",
        "radius_xl": "calc(var(--u-border-radius-scale) * 2)",
        "radius_lg": "calc(var(--u-border-radius-scale) * 1.5)",
        "radius_md": "var(--u-border-radius-scale)",
        "radius_sm": "calc(var(--u-border-radius-scale) * 0.75)",
        "radius_xs": "calc(var(--u-border-radius-scale) * 0.5)"
      },
      "components": {
        "button": {
          "padding": "0.75rem 1.75rem",
          "border_radius": "0.25rem",
          "transition": "all 0.2s ease",
          "font_weight": "500",
          "text_transform": "uppercase",
          "letter_spacing": "0.05em"
        },
        "card": {
          "padding": "1.5rem",
          "border_radius": "0.25rem",
          "box_shadow": "0 0.3rem 1rem rgba(0, 0, 0, 0.2)",
          "border": "1px solid rgba(255, 255, 255, 0.05)"
        },
        "input": {
          "padding": "0.875rem",
          "border_radius": "0.25rem",
          "border": "1px solid rgba(255, 255, 255, 0.1)",
          "background": "rgba(255, 255, 255, 0.05)"
        }
      }
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