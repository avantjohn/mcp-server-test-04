import { getTalentById } from '../dist/db/index.js';

/**
 * Direct test of the CSS generation using the design_system field.
 * This bypasses the HTTP server and directly uses the database and CSS generator.
 */
async function testDesignSystemDirectly() {
  try {
    console.log('Directly testing design_system in talent profiles...');
    
    // Get a talent with the design_system field
    const talent = await getTalentById('talent_001'); // Use Olivia Gray's talent ID
    
    if (!talent) {
      console.error('Talent not found.');
      return;
    }
    
    console.log(`Found talent: ${talent.name}`);
    
    // Parse the metadata JSON if needed
    let parsedTalent = talent;
    if (typeof talent.metadata === 'string') {
      const metadata = JSON.parse(talent.metadata);
      parsedTalent = { ...talent, ...metadata };
    }
    
    console.log('Talent structure:', JSON.stringify({
      id: parsedTalent.id,
      name: parsedTalent.name,
      has_design_profile: !!parsedTalent.design_profile,
      has_design_system: parsedTalent.design_profile ? !!parsedTalent.design_profile.design_system : false
    }, null, 2));
    
    // Check if design_profile.design_system field exists (new format)
    if (parsedTalent.design_profile && parsedTalent.design_profile.design_system) {
      console.log('✅ design_system field exists in design_profile');
      
      // Print out the design system structure
      console.log('Design System Keys:', Object.keys(parsedTalent.design_profile.design_system));
      console.log('Colors Keys:', Object.keys(parsedTalent.design_profile.design_system.colors));
      
      // Check if colors.base exists
      if (parsedTalent.design_profile.design_system.colors.base) {
        console.log('Colors Base Keys:', Object.keys(parsedTalent.design_profile.design_system.colors.base));
      } else {
        console.log('❌ colors.base is missing from design_system');
      }
      
      // Check if components.button exists
      if (parsedTalent.design_profile.design_system.components && 
          parsedTalent.design_profile.design_system.components.button) {
        console.log('Button Component Keys:', Object.keys(parsedTalent.design_profile.design_system.components.button));
      } else {
        console.log('❌ components.button is missing from design_system');
      }
      
      // Import the CSS generator
      const { default: cssGenerator } = await import('../dist/utils/css-generator.js');
      
      // Generate CSS for a button
      const css = cssGenerator.generateComponentCss(parsedTalent, { 
        component: 'button', 
        state: 'default' 
      });
      
      console.log('\nGenerated CSS for button:');
      console.log('--------------------------');
      console.log(css);
      console.log('--------------------------');
      
      // Check if CSS includes variables from design system
      if (css.includes('var(--u-color') || css.includes('var(--color-')) {
        console.log('✅ CSS contains design system variables');
      } else {
        console.log('❌ CSS does not contain design system variables');
      }
      
      // Generate a complete component library
      console.log('\nGenerating complete component library...');
      const libraryCss = cssGenerator.generateComponentLibraryCss(parsedTalent);
      
      // Just show the first few lines to verify it worked
      console.log('Component library CSS (first 10 lines):');
      console.log('--------------------------');
      console.log(libraryCss.split('\n').slice(0, 10).join('\n'));
      console.log('--------------------------');
      
    } else if (parsedTalent.design_system) {
      // Old format where design_system is directly in metadata
      console.log('✅ design_system field exists directly in metadata (old format)');
      
      // Import the CSS generator
      const { default: cssGenerator } = await import('../dist/utils/css-generator.js');
      
      // Transform to new format on the fly
      const transformedTalent = {
        ...parsedTalent,
        design_profile: {
          id: parsedTalent.id,
          name: parsedTalent.name,
          description: parsedTalent.description || '',
          aesthetic_characteristics: parsedTalent.aesthetic_characteristics,
          design_attributes: parsedTalent.design_attributes,
          color_palette: parsedTalent.color_palette,
          typography: parsedTalent.typography,
          design_system: parsedTalent.design_system
        }
      };
      
      // Generate CSS with transformed format
      const css = cssGenerator.generateComponentCss(transformedTalent, { 
        component: 'button', 
        state: 'default' 
      });
      
      console.log('\nGenerated CSS for button (with transformed data):');
      console.log('--------------------------');
      console.log(css);
      console.log('--------------------------');
    } else {
      console.log('❌ design_system field is missing from both design_profile and metadata');
    }
  } catch (error) {
    console.error('Error in direct test:', error);
  }
}

// Run the test
testDesignSystemDirectly(); 