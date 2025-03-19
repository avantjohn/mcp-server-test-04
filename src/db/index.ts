import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Define types for our database entities
export interface TalentProfile {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  metadata: TalentMetadata;
}

export interface TalentMetadata {
  aesthetic_characteristics: AestheticCharacteristics;
  design_attributes: DesignAttributes;
  color_palette: ColorPalette;
  typography: Typography;
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
  headingFont: string;
  bodyFont: string;
  scale: number;
  weight: string;
  letterSpacing: number;
  lineHeight: number;
}

// Create a connection pool
const pool = new pg.Pool({
  // Connection parameters are read from environment variables:
  // PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT
});

// Helper functions for database operations
export async function query<T>(text: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Database functions for Talent profiles
export async function getTalentById(id: string): Promise<TalentProfile | null> {
  const result = await query<TalentProfile>(
    'SELECT * FROM talents WHERE id = $1',
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
  // We need to handle nested JSON properties for metadata
  if (attributeName.includes('.')) {
    const [mainField, ...nestedFields] = attributeName.split('.');
    const jsonPath = nestedFields.join('->');
    
    return query<TalentProfile>(
      `SELECT * FROM talents WHERE metadata->'${jsonPath}' = $1 ORDER BY name`,
      [attributeValue]
    );
  }
  
  // Handle non-nested fields
  return query<TalentProfile>(
    `SELECT * FROM talents WHERE ${attributeName} = $1 ORDER BY name`,
    [attributeValue]
  );
}

export async function queryTalents(queryParams: Record<string, any>): Promise<TalentProfile[]> {
  // Build a dynamic query based on provided parameters
  const conditions = [];
  const values = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(queryParams)) {
    if (key.includes('.')) {
      // Handle nested JSON fields
      const [mainField, ...nestedFields] = key.split('.');
      const jsonPath = nestedFields.join('->');
      conditions.push(`metadata->'${jsonPath}' = $${paramIndex}`);
    } else {
      // Handle regular fields
      conditions.push(`${key} = $${paramIndex}`);
    }
    values.push(value);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';
  
  return query<TalentProfile>(
    `SELECT * FROM talents ${whereClause} ORDER BY name`,
    values
  );
}

// Function to close the database pool when shutting down
export async function closePool(): Promise<void> {
  await pool.end();
}

export default {
  query,
  getTalentById,
  getAllTalents,
  getTalentsByAttribute,
  queryTalents,
  closePool
}; 