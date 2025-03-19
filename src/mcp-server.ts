import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// Import database functions and types
import db, { 
  TalentProfile, 
  getTalentById, 
  getAllTalents, 
  getTalentsByAttribute,
  queryTalents
} from './db/index.js';

// Import CSS generation utilities
import cssGenerator from './utils/css-generator.js';

/**
 * Create and configure an MCP server for Popmelt
 */
export async function createMcpServer(): Promise<McpServer> {
  // Create the MCP server
  const server = new McpServer({
    name: 'Popmelt',
    version: '1.0.0',
  });
  
  // Register talent profile resources
  server.resource(
    'talent-list',
    'talent://list',
    async (uri) => {
      try {
        const talents = await getAllTalents();
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(talents, null, 2),
            mediaType: 'application/json'
          }]
        };
      } catch (error) {
        console.error('Error fetching talent list:', error);
        throw new Error('Failed to fetch talent list');
      }
    }
  );
  
  // Add individual talent resource
  server.resource(
    'talent',
    new ResourceTemplate('talent://{id}', { list: 'talent://list' }),
    async (uri, { id }) => {
      try {
        const talent = await getTalentById(id);
        
        if (!talent) {
          throw new Error(`Talent with ID ${id} not found`);
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(talent, null, 2),
            mediaType: 'application/json'
          }]
        };
      } catch (error) {
        console.error(`Error fetching talent ${id}:`, error);
        throw new Error(`Failed to fetch talent with ID ${id}`);
      }
    }
  );
  
  // Add talent attribute resource
  server.resource(
    'talent-attribute',
    new ResourceTemplate('talent-attribute://{id}/{attribute}', { list: undefined }),
    async (uri, { id, attribute }) => {
      try {
        const talent = await getTalentById(id);
        
        if (!talent) {
          throw new Error(`Talent with ID ${id} not found`);
        }
        
        // Handle nested attributes using dot notation
        const attributePath = attribute.split('.');
        let value: any = talent;
        
        for (const path of attributePath) {
          if (value && typeof value === 'object' && path in value) {
            value = value[path];
          } else {
            throw new Error(`Attribute ${attribute} not found in talent ${id}`);
          }
        }
        
        return {
          contents: [{
            uri: uri.href,
            text: typeof value === 'object' 
              ? JSON.stringify(value, null, 2) 
              : String(value),
            mediaType: typeof value === 'object' ? 'application/json' : 'text/plain'
          }]
        };
      } catch (error) {
        console.error(`Error fetching attribute ${attribute} for talent ${id}:`, error);
        throw new Error(`Failed to fetch attribute ${attribute} for talent ${id}`);
      }
    }
  );
  
  // Add component style resource
  server.resource(
    'component-style',
    new ResourceTemplate('component-style://{talent_id}/{component_name}', { list: undefined }),
    async (uri, { talent_id, component_name }) => {
      try {
        const talent = await getTalentById(talent_id);
        
        if (!talent) {
          throw new Error(`Talent with ID ${talent_id} not found`);
        }
        
        // Check if the component name is valid
        const validComponents = ['button', 'card', 'input', 'navbar', 'modal', 'table'];
        if (!validComponents.includes(component_name)) {
          throw new Error(`Invalid component name: ${component_name}`);
        }
        
        // Generate CSS for the component
        const css = cssGenerator.generateComponentCss(talent, {
          component: component_name as any
        });
        
        return {
          contents: [{
            uri: uri.href,
            text: css,
            mediaType: 'text/css'
          }]
        };
      } catch (error) {
        console.error(`Error generating component style for ${component_name} with talent ${talent_id}:`, error);
        throw new Error(`Failed to generate component style for ${component_name} with talent ${talent_id}`);
      }
    }
  );
  
  // Add a tool to generate CSS for a component
  server.tool(
    'generate-css',
    {
      talentId: z.string().describe('The ID of the talent profile to use'),
      component: z.enum(['button', 'card', 'input', 'navbar', 'modal', 'table'])
        .describe('The component to generate CSS for'),
      state: z.enum(['default', 'hover', 'active', 'disabled', 'focus'])
        .optional()
        .default('default')
        .describe('The state of the component'),
      customProperties: z.record(z.string(), z.union([z.string(), z.number()]))
        .optional()
        .describe('Custom CSS properties to include')
    },
    async ({ talentId, component, state, customProperties }) => {
      try {
        const talent = await getTalentById(talentId);
        
        if (!talent) {
          return {
            content: [{ type: 'text', text: `Error: Talent with ID ${talentId} not found` }],
            isError: true
          };
        }
        
        const css = cssGenerator.generateComponentCss(talent, {
          component,
          state,
          customProperties
        });
        
        return {
          content: [{ type: 'text', text: css }]
        };
      } catch (error) {
        console.error('Error generating CSS:', error);
        return {
          content: [{ type: 'text', text: `Error generating CSS: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );
  
  // Add a tool to generate a complete component library CSS
  server.tool(
    'generate-component-library',
    {
      talentId: z.string().describe('The ID of the talent profile to use')
    },
    async ({ talentId }) => {
      try {
        const talent = await getTalentById(talentId);
        
        if (!talent) {
          return {
            content: [{ type: 'text', text: `Error: Talent with ID ${talentId} not found` }],
            isError: true
          };
        }
        
        const css = cssGenerator.generateComponentLibraryCss(talent);
        
        return {
          content: [{ type: 'text', text: css }]
        };
      } catch (error) {
        console.error('Error generating component library CSS:', error);
        return {
          content: [{ type: 'text', text: `Error generating component library CSS: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );
  
  // Add a tool to query talents
  server.tool(
    'query-talents',
    {
      filters: z.record(z.string(), z.any())
        .describe('Filters to apply to the talent query'),
    },
    async ({ filters }) => {
      try {
        const talents = await queryTalents(filters);
        
        return {
          content: [{ 
            type: 'text', 
            text: `Found ${talents.length} matching talents:\n\n${JSON.stringify(talents, null, 2)}` 
          }]
        };
      } catch (error) {
        console.error('Error querying talents:', error);
        return {
          content: [{ type: 'text', text: `Error querying talents: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );
  
  // Add a tool to analyze style compatibility between talents
  server.tool(
    'analyze-style-compatibility',
    {
      talentId1: z.string().describe('The ID of the first talent profile'),
      talentId2: z.string().describe('The ID of the second talent profile')
    },
    async ({ talentId1, talentId2 }) => {
      try {
        const talent1 = await getTalentById(talentId1);
        const talent2 = await getTalentById(talentId2);
        
        if (!talent1 || !talent2) {
          return {
            content: [{ type: 'text', text: `Error: One or both talent profiles not found` }],
            isError: true
          };
        }
        
        // Calculate compatibility score based on aesthetic characteristics and design attributes
        const compatibility = calculateCompatibilityScore(talent1, talent2);
        
        // Prepare analysis text
        const analysisText = `
# Style Compatibility Analysis

## ${talent1.name} vs ${talent2.name}

Overall compatibility score: ${compatibility.overallScore}/10

### Aesthetic Compatibility

${compatibility.aestheticAnalysis}

### Design Attribute Compatibility

${compatibility.designAnalysis}

### Color Palette Compatibility

${compatibility.colorAnalysis}

### Typography Compatibility

${compatibility.typographyAnalysis}

## Recommendation

${compatibility.recommendation}
        `.trim();
        
        return {
          content: [{ type: 'text', text: analysisText }]
        };
      } catch (error) {
        console.error('Error analyzing style compatibility:', error);
        return {
          content: [{ type: 'text', text: `Error analyzing style compatibility: ${(error as Error).message}` }],
          isError: true
        };
      }
    }
  );
  
  // Add a prompt for styling a component
  server.prompt(
    'style-component',
    {
      talentId: z.string().describe('The ID of the talent profile to use'),
      component: z.string().describe('The component to style'),
      requirements: z.string().optional().describe('Additional styling requirements'),
    },
    ({ talentId, component, requirements }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `
I want to style a ${component} component using the Talent profile "${talentId}".

${requirements ? `Please consider these additional requirements: ${requirements}` : ''}

Please help me generate appropriate CSS styling that matches the talent's aesthetic and design principles. Additionally, explain the key design choices that reflect this talent's unique style.
          `.trim()
        }
      }]
    })
  );
  
  // Add a prompt for creating a descriptive talent summary
  server.prompt(
    'create-talent-description',
    {
      talentId: z.string().describe('The ID of the talent profile to summarize'),
    },
    ({ talentId }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `
Please create a detailed, descriptive summary of the Talent profile "${talentId}". Include information about:

1. Their overall aesthetic and design philosophy
2. Key characteristics of their style
3. How their approach to spacing, colors, typography, and layout contributes to their unique look
4. What types of projects or brands would be well-suited for this talent's style
5. A few concrete examples of how to apply this style to different UI elements

Format the response as a well-structured document that could be used as a style guide introduction.
          `.trim()
        }
      }]
    })
  );
  
  // Add a prompt for recommending a talent based on requirements
  server.prompt(
    'recommend-talent',
    {
      projectType: z.string().describe('The type of project or application'),
      brandPersonality: z.string().describe('The personality traits of the brand'),
      targetAudience: z.string().describe('The target audience for the project'),
      aestheticPreferences: z.string().optional().describe('Any specific aesthetic preferences'),
    },
    ({ projectType, brandPersonality, targetAudience, aestheticPreferences }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `
I'm looking for a suitable Talent AI profile for my project with the following characteristics:

- Project Type: ${projectType}
- Brand Personality: ${brandPersonality}
- Target Audience: ${targetAudience}
${aestheticPreferences ? `- Aesthetic Preferences: ${aestheticPreferences}` : ''}

Please recommend the most appropriate Talent profile(s) for this project. For each recommendation, explain:

1. Why this particular Talent is a good match
2. How their style aligns with the brand personality
3. How their design approach would resonate with the target audience
4. Any specific UI components that would benefit from their unique style
          `.trim()
        }
      }]
    })
  );
  
  return server;
}

/**
 * Calculate compatibility score between two talent profiles
 */
function calculateCompatibilityScore(talent1: TalentProfile, talent2: TalentProfile): {
  overallScore: number;
  aestheticAnalysis: string;
  designAnalysis: string;
  colorAnalysis: string;
  typographyAnalysis: string;
  recommendation: string;
} {
  const { metadata: meta1 } = talent1;
  const { metadata: meta2 } = talent2;
  
  // Calculate aesthetic compatibility
  const aestheticDiff = {
    complexity: Math.abs(meta1.aesthetic_characteristics.complexity - meta2.aesthetic_characteristics.complexity),
    minimalism: Math.abs(meta1.aesthetic_characteristics.minimalism - meta2.aesthetic_characteristics.minimalism),
    boldness: Math.abs(meta1.aesthetic_characteristics.boldness - meta2.aesthetic_characteristics.boldness),
    playfulness: Math.abs(meta1.aesthetic_characteristics.playfulness - meta2.aesthetic_characteristics.playfulness),
    elegance: Math.abs(meta1.aesthetic_characteristics.elegance - meta2.aesthetic_characteristics.elegance),
  };
  
  const aestheticScore = 10 - (
    (aestheticDiff.complexity + aestheticDiff.minimalism + aestheticDiff.boldness + 
     aestheticDiff.playfulness + aestheticDiff.elegance) / 5
  ) * 2;
  
  // Calculate design attribute compatibility
  const designDiff = {
    whitespace: Math.abs(meta1.design_attributes.whitespace_balance - meta2.design_attributes.whitespace_balance),
    colorHarmony: Math.abs(meta1.design_attributes.color_harmony - meta2.design_attributes.color_harmony),
    visualRhythm: Math.abs(meta1.design_attributes.visual_rhythm - meta2.design_attributes.visual_rhythm),
    layoutDensity: Math.abs(meta1.design_attributes.layout_density - meta2.design_attributes.layout_density),
    borderUse: Math.abs(meta1.design_attributes.border_use - meta2.design_attributes.border_use),
    shadowUse: Math.abs(meta1.design_attributes.shadow_use - meta2.design_attributes.shadow_use),
  };
  
  const designScore = 10 - (
    (designDiff.whitespace + designDiff.colorHarmony + designDiff.visualRhythm + 
     designDiff.layoutDensity + designDiff.borderUse + designDiff.shadowUse) / 6
  ) * 2;
  
  // Calculate color compatibility (simplified)
  const colorScore = meta1.color_palette.primary === meta2.color_palette.primary &&
    meta1.color_palette.secondary === meta2.color_palette.secondary ? 10 : 5;
  
  // Calculate typography compatibility (simplified)
  const typographyScore = meta1.typography.headingFont === meta2.typography.headingFont &&
    meta1.typography.bodyFont === meta2.typography.bodyFont ? 10 : 5;
  
  // Calculate overall score
  const overallScore = Math.round((aestheticScore + designScore + colorScore + typographyScore) / 4);
  
  // Generate analysis texts
  const aestheticAnalysis = `
The aesthetic characteristics have a compatibility score of ${aestheticScore.toFixed(1)}/10.
- Complexity difference: ${aestheticDiff.complexity}
- Minimalism difference: ${aestheticDiff.minimalism}
- Boldness difference: ${aestheticDiff.boldness}
- Playfulness difference: ${aestheticDiff.playfulness}
- Elegance difference: ${aestheticDiff.elegance}
  `.trim();
  
  const designAnalysis = `
The design attributes have a compatibility score of ${designScore.toFixed(1)}/10.
- Whitespace balance difference: ${designDiff.whitespace}
- Color harmony difference: ${designDiff.colorHarmony}
- Visual rhythm difference: ${designDiff.visualRhythm}
- Layout density difference: ${designDiff.layoutDensity}
- Border use difference: ${designDiff.borderUse}
- Shadow use difference: ${designDiff.shadowUse}
  `.trim();
  
  const colorAnalysis = `
The color palettes have a compatibility score of ${colorScore}/10.
- Primary colors: ${meta1.color_palette.primary} vs ${meta2.color_palette.primary}
- Secondary colors: ${meta1.color_palette.secondary} vs ${meta2.color_palette.secondary}
- Accent colors: ${meta1.color_palette.accent} vs ${meta2.color_palette.accent}
  `.trim();
  
  const typographyAnalysis = `
The typography has a compatibility score of ${typographyScore}/10.
- Heading fonts: ${meta1.typography.headingFont} vs ${meta2.typography.headingFont}
- Body fonts: ${meta1.typography.bodyFont} vs ${meta2.typography.bodyFont}
- Scale: ${meta1.typography.scale} vs ${meta2.typography.scale}
  `.trim();
  
  // Generate recommendation
  let recommendation;
  if (overallScore >= 8) {
    recommendation = `These talents are highly compatible and could be used together in the same project, particularly for creating a cohesive design system with subtle variations.`;
  } else if (overallScore >= 5) {
    recommendation = `These talents have moderate compatibility. They could work together if used intentionally in different sections of an application, but may create visual inconsistency if mixed too closely.`;
  } else {
    recommendation = `These talents have low compatibility and would create significant visual inconsistency if used together. It's recommended to choose one or the other for a single project.`;
  }
  
  return {
    overallScore,
    aestheticAnalysis,
    designAnalysis,
    colorAnalysis,
    typographyAnalysis,
    recommendation,
  };
} 