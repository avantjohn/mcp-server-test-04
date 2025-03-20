import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define types for our database entities
export interface TalentProfile {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  title?: string;
  summary?: string;
  photo?: string;
  contact?: ContactInfo;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  languages?: string[];
  interests?: string[];
  design_profile: DesignProfile;
}

export interface ContactInfo {
  email: string;
  phone: string;
  website: string;
  location: string;
}

export interface Experience {
  position: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Project {
  name: string;
  description: string;
  url: string;
}

export interface DesignProfile {
  id: string;
  name: string;
  description: string;
  aesthetic_characteristics: AestheticCharacteristics;
  design_attributes: DesignAttributes;
  color_palette: ColorPalette;
  typography: Typography;
  design_system: DesignSystem;
}

export interface AestheticCharacteristics {
  style: string;
  mood: string;
  complexity: number;
  minimalism: number;
  boldness: number;
  playfulness: number;
  elegance: number;
}

export interface DesignAttributes {
  whitespace_balance: number;
  color_harmony: number;
  visual_rhythm: number;
  layout_density: number;
  texture_use: number;
  border_use: number;
  shadow_use: number;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Typography {
  heading: TypographySettings;
  body: TypographySettings;
  scale: TypographyScale;
}

export interface TypographySettings {
  font: string;
  weight: number;
  letterSpacing: string;
  lineHeight: number;
}

export interface TypographyScale {
  base: string;
  ratio: number;
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  small: string;
}

export interface DesignSystem {
  colors: DesignSystemColors;
  spacing: DesignSystemSpacing;
  borders: DesignSystemBorders;
  shadows: DesignSystemShadows;
  transitions: DesignSystemTransitions;
  components: DesignSystemComponents;
}

export interface DesignSystemColors {
  base: {
    core: string;
    neutral: string;
  };
  scales: {
    tint: number;
    shade: number;
    chroma: number;
  };
  palette: {
    neutral: Record<string, string>;
    primary: Record<string, string>;
  };
  semantic: {
    background: Record<string, string>;
    text: Record<string, string>;
    brand: Record<string, string>;
    ui: Record<string, string>;
  };
}

export interface DesignSystemSpacing {
  base: string;
  scale: Record<string, string>;
  layout: {
    container: {
      max: string;
      padding: Record<string, string>;
    };
    section: {
      max: string;
      padding: Record<string, string>;
    };
  };
}

export interface DesignSystemBorders {
  radius: Record<string, string>;
  width: Record<string, string>;
}

export interface DesignSystemShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface DesignSystemTransitions {
  default: string;
  fast: string;
  slow: string;
}

export interface DesignSystemComponents {
  button: {
    base: Record<string, string>;
    sizes: Record<string, Record<string, string>>;
    variants: Record<string, Record<string, string>>;
  };
  card: {
    base: Record<string, string>;
    variants: Record<string, Record<string, string>>;
    padding: Record<string, string>;
  };
  input: {
    base: Record<string, string>;
    states: Record<string, Record<string, string>>;
    sizes: Record<string, Record<string, string>>;
  };
  navbar: {
    base: Record<string, string>;
    variants: Record<string, Record<string, string>>;
    responsive: Record<string, Record<string, string>>;
  };
  modal: {
    overlay: Record<string, string>;
    content: Record<string, string>;
    header: Record<string, string>;
    body: Record<string, string>;
    footer: Record<string, string>;
  };
  table: {
    base: Record<string, string>;
    head: Record<string, string>;
    cell: Record<string, string>;
    variants: Record<string, Record<string, string>>;
  };
}

// SQLite connection
let db: Database | null = null;

// Initialize database connection
export async function initializeDb(): Promise<void> {
  if (db) return; // Already initialized
  
  const dbPath = path.join(__dirname, '..', '..', 'db', 'popmelt.sqlite');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  console.log(`Connected to SQLite database at ${dbPath}`);
}

// Helper functions for database operations
export async function query<T>(text: string, params: any[] = []): Promise<T[]> {
  if (!db) {
    await initializeDb();
  }
  
  // Convert PostgreSQL parameter style ($1, $2) to SQLite style (?, ?)
  const sqliteText = text.replace(/\$(\d+)/g, '?');
  
  // Handle JSON fields for SQLite - only use the new format paths
  const sqliteQuery = sqliteText
    .replace(/metadata->'([^']+)'/g, "json_extract(metadata, '$.$1')")
    .replace(/metadata->>'([^']+)'/g, "json_extract(metadata, '$.$1')");
  
  try {
    // For SELECT queries
    if (sqliteQuery.trim().toLowerCase().startsWith('select')) {
      const result = await db!.all(sqliteQuery, params);
      
      // Parse JSON metadata field directly with no transformation
      return result.map((row: any) => {
        if (row.metadata && typeof row.metadata === 'string') {
          const metadata = JSON.parse(row.metadata);
          // Use the new format directly, no transformation needed
          return { ...row, ...metadata } as T;
        }
        return row as T;
      });
    } else {
      // For non-SELECT queries
      await db!.run(sqliteQuery, params);
      return [] as T[];
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Database functions for Talent profiles
export async function getTalentById(id: string): Promise<TalentProfile | null> {
  const result = await query<TalentProfile>(
    'SELECT * FROM talents WHERE id = ?',
    [id]
  );
  return result.length > 0 ? result[0] : null;
}

export async function getAllTalents(): Promise<TalentProfile[]> {
  return query<TalentProfile>('SELECT * FROM talents ORDER BY name');
}

export async function getTalentsByAttribute(
  attributeName: string,
  attributeValue: string | number
): Promise<TalentProfile[]> {
  // Handle nested design_profile attributes
  if (attributeName.startsWith('design_profile.')) {
    const nestedPath = attributeName.substring('design_profile.'.length);
    const jsonPath = nestedPath.split('.').join('->');
    
    return query<TalentProfile>(
      `SELECT * FROM talents WHERE metadata->'design_profile'->'${jsonPath}' = ? ORDER BY name`,
      [attributeValue]
    );
  }
  
  // Check if attribute is a direct field in the profile
  const profileFields = ['title', 'summary', 'photo', 'contact', 'skills', 'experience', 'education', 'projects', 'languages', 'interests', 'design_profile'];
  if (profileFields.includes(attributeName)) {
    return query<TalentProfile>(
      `SELECT * FROM talents WHERE metadata->'${attributeName}' IS NOT NULL ORDER BY name`,
      []
    );
  }
  
  // Handle non-nested fields
  return query<TalentProfile>(
    `SELECT * FROM talents WHERE ${attributeName} = ? ORDER BY name`,
    [attributeValue]
  );
}

/**
 * Get the default talent ID from the config table
 * @returns The default talent ID, defaults to 'talent_001' (Olivia Gray) if not set
 */
export async function getDefaultTalentId(): Promise<string> {
  if (!db) {
    await initializeDb();
  }
  
  try {
    // Check if config table exists
    const configTableExists = await db!.get("SELECT name FROM sqlite_master WHERE type='table' AND name='config'");
    
    if (configTableExists) {
      // Get default_talent from config
      const config = await db!.get('SELECT value FROM config WHERE key = ?', ['default_talent']);
      
      if (config && config.value) {
        return config.value;
      }
    }
    
    // If no config or default talent found, return Olivia Gray's ID
    return 'talent_001';
  } catch (error) {
    console.error('Error getting default talent ID:', error);
    // Fallback to Olivia Gray's ID
    return 'talent_001';
  }
}

export async function queryTalents(queryParams: Record<string, any>): Promise<TalentProfile[]> {
  // Build a dynamic query based on provided parameters
  const conditions = [];
  const values = [];
  
  for (const [key, value] of Object.entries(queryParams)) {
    // Handle all metadata attributes including design_profile
    if (key.includes('.')) {
      const parts = key.split('.');
      let jsonPath = parts.join('->');
      conditions.push(`metadata->'${jsonPath}' = ?`);
      values.push(value);
    } else {
      // Handle regular fields
      conditions.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';
  
  return query<TalentProfile>(
    `SELECT * FROM talents ${whereClause} ORDER BY name`,
    values
  );
}

// Function to close the database connection when shutting down
export async function closePool(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

// Initialize database on module load
initializeDb().catch(console.error);

export default {
  query,
  getTalentById,
  getAllTalents,
  getTalentsByAttribute,
  queryTalents,
  getDefaultTalentId,
  closePool,
  initializeDb
}; 