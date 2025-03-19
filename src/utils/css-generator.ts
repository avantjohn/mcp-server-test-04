import { TalentProfile, ColorPalette, Typography, DesignAttributes } from '../db/index.js';

type ComponentType = 'button' | 'card' | 'input' | 'navbar' | 'modal' | 'table';
type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'focus';

interface CssGenerationOptions {
  component: ComponentType;
  state?: ComponentState;
  variant?: string;
  customProperties?: Record<string, string | number>;
}

/**
 * Generate CSS styling for a component based on a talent profile
 */
export function generateComponentCss(
  talent: TalentProfile,
  options: CssGenerationOptions
): string {
  const { component, state = 'default', customProperties = {} } = options;
  const { metadata } = talent;
  
  // Extract properties from talent profile
  const { 
    aesthetic_characteristics,
    design_attributes,
    color_palette,
    typography
  } = metadata;
  
  // Start building the CSS
  let css = '';
  
  // Add component selector based on component type and state
  const selector = getComponentSelector(component, state);
  css += `${selector} {\n`;
  
  // Add base styling
  css += generateBaseStyles(component, aesthetic_characteristics.style);
  
  // Add colors
  css += generateColorStyles(component, state, color_palette);
  
  // Add typography
  css += generateTypographyStyles(component, typography);
  
  // Add spacing and layout based on design attributes
  css += generateSpacingStyles(component, design_attributes);
  
  // Add effects (shadows, borders) based on design attributes
  css += generateEffectStyles(component, state, design_attributes);
  
  // Add custom properties
  for (const [property, value] of Object.entries(customProperties)) {
    css += `  ${property}: ${value};\n`;
  }
  
  // Close the selector
  css += '}\n';
  
  // Add hover state if needed and not already specified
  if (state !== 'hover' && component !== 'table') {
    css += generateHoverStyles(component, color_palette, design_attributes);
  }
  
  return css;
}

/**
 * Generate CSS for a complete component library based on a talent profile
 */
export function generateComponentLibraryCss(talent: TalentProfile): string {
  const components: ComponentType[] = ['button', 'card', 'input', 'navbar', 'modal', 'table'];
  const states: ComponentState[] = ['default', 'hover', 'active', 'disabled', 'focus'];
  
  let css = `/* ${talent.name} Component Library */\n\n`;
  css += `/* Generated from Popmelt Talent Profile */\n\n`;
  
  // Generate CSS for common variables
  css += `:root {\n`;
  const { color_palette, typography } = talent.metadata;
  
  // Color variables
  css += `  /* Colors */\n`;
  css += `  --color-primary: ${color_palette.primary};\n`;
  css += `  --color-secondary: ${color_palette.secondary};\n`;
  css += `  --color-accent: ${color_palette.accent};\n`;
  css += `  --color-background: ${color_palette.background};\n`;
  css += `  --color-text: ${color_palette.text};\n\n`;
  
  // Typography variables
  css += `  /* Typography */\n`;
  css += `  --font-heading: ${typography.headingFont};\n`;
  css += `  --font-body: ${typography.bodyFont};\n`;
  css += `  --font-scale: ${typography.scale};\n`;
  css += `  --font-weight: ${typography.weight};\n`;
  css += `  --letter-spacing: ${typography.letterSpacing}rem;\n`;
  css += `  --line-height: ${typography.lineHeight};\n`;
  css += `}\n\n`;
  
  // Generate CSS for each component and state
  for (const component of components) {
    css += `/* ${component.toUpperCase()} */\n`;
    for (const state of states) {
      css += generateComponentCss(talent, { component, state });
      css += '\n';
    }
  }
  
  return css;
}

/**
 * Get the appropriate CSS selector for a component and state
 */
function getComponentSelector(component: ComponentType, state: ComponentState): string {
  const baseSelector = `.${component}`;
  
  switch (state) {
    case 'default':
      return baseSelector;
    case 'hover':
      return `${baseSelector}:hover`;
    case 'active':
      return `${baseSelector}:active`;
    case 'disabled':
      return `${baseSelector}:disabled, ${baseSelector}.disabled`;
    case 'focus':
      return `${baseSelector}:focus`;
    default:
      return baseSelector;
  }
}

/**
 * Generate base styles for a component based on its type and design style
 */
function generateBaseStyles(component: ComponentType, style: string): string {
  let css = '';
  
  // Common properties based on component type
  switch (component) {
    case 'button':
      css += `  display: inline-flex;\n`;
      css += `  align-items: center;\n`;
      css += `  justify-content: center;\n`;
      css += `  cursor: pointer;\n`;
      css += `  border: none;\n`;
      css += `  transition: all 0.3s ease;\n`;
      break;
      
    case 'card':
      css += `  display: flex;\n`;
      css += `  flex-direction: column;\n`;
      css += `  overflow: hidden;\n`;
      break;
      
    case 'input':
      css += `  display: block;\n`;
      css += `  width: 100%;\n`;
      css += `  transition: border-color 0.3s ease;\n`;
      break;
      
    case 'navbar':
      css += `  display: flex;\n`;
      css += `  align-items: center;\n`;
      css += `  width: 100%;\n`;
      break;
      
    case 'modal':
      css += `  position: fixed;\n`;
      css += `  top: 50%;\n`;
      css += `  left: 50%;\n`;
      css += `  transform: translate(-50%, -50%);\n`;
      css += `  z-index: 1000;\n`;
      break;
      
    case 'table':
      css += `  width: 100%;\n`;
      css += `  border-collapse: collapse;\n`;
      break;
  }
  
  // Adjust based on style
  if (style.includes('minimalist')) {
    css += `  box-sizing: border-box;\n`;
  }
  
  return css;
}

/**
 * Generate color styles for a component based on its state
 */
function generateColorStyles(
  component: ComponentType,
  state: ComponentState,
  colorPalette: ColorPalette
): string {
  let css = '';
  const { primary, secondary, accent, background, text } = colorPalette;
  
  switch (component) {
    case 'button':
      if (state === 'default') {
        css += `  background-color: ${primary};\n`;
        css += `  color: ${background};\n`;
      } else if (state === 'hover') {
        css += `  background-color: ${secondary};\n`;
      } else if (state === 'disabled') {
        css += `  background-color: #cccccc;\n`;
        css += `  color: #666666;\n`;
      }
      break;
      
    case 'card':
      css += `  background-color: ${background};\n`;
      css += `  color: ${text};\n`;
      break;
      
    case 'input':
      css += `  background-color: ${background};\n`;
      css += `  color: ${text};\n`;
      css += `  border: 1px solid ${state === 'focus' ? primary : '#ddd'};\n`;
      break;
      
    case 'navbar':
      css += `  background-color: ${primary};\n`;
      css += `  color: ${background};\n`;
      break;
      
    case 'modal':
      css += `  background-color: ${background};\n`;
      css += `  color: ${text};\n`;
      css += `  border: 1px solid ${primary};\n`;
      break;
      
    case 'table':
      css += `  background-color: ${background};\n`;
      css += `  color: ${text};\n`;
      if (state === 'hover') {
        css += `  background-color: ${accent}30;\n`; // 30 adds transparency
      }
      break;
  }
  
  return css;
}

/**
 * Generate typography styles for a component
 */
function generateTypographyStyles(
  component: ComponentType,
  typography: Typography
): string {
  let css = '';
  const { headingFont, bodyFont, scale, weight, letterSpacing, lineHeight } = typography;
  
  const font = component === 'navbar' ? headingFont : bodyFont;
  css += `  font-family: ${font};\n`;
  
  // Different font sizes based on component
  switch (component) {
    case 'button':
      css += `  font-size: ${scale * 0.875}rem;\n`;
      css += `  font-weight: ${weight === 'bold' ? 700 : 500};\n`;
      break;
      
    case 'card':
      // Card itself doesn't need font size, its children will have it
      break;
      
    case 'input':
      css += `  font-size: ${scale}rem;\n`;
      break;
      
    case 'navbar':
      css += `  font-size: ${scale * 1}rem;\n`;
      css += `  font-weight: ${weight === 'bold' ? 700 : 500};\n`;
      break;
      
    case 'modal':
      // Modal itself doesn't need font size, its children will have it
      break;
      
    case 'table':
      css += `  font-size: ${scale * 0.875}rem;\n`;
      break;
  }
  
  css += `  letter-spacing: ${letterSpacing}rem;\n`;
  css += `  line-height: ${lineHeight};\n`;
  
  return css;
}

/**
 * Generate spacing styles based on design attributes
 */
function generateSpacingStyles(
  component: ComponentType,
  designAttributes: DesignAttributes
): string {
  let css = '';
  const { whitespace_balance, layout_density } = designAttributes;
  
  // Calculate padding based on whitespace preference
  const basePadding = whitespace_balance * 0.25;
  
  switch (component) {
    case 'button':
      css += `  padding: ${basePadding * 0.75}rem ${basePadding * 1.5}rem;\n`;
      css += `  border-radius: ${whitespace_balance * 0.125}rem;\n`;
      break;
      
    case 'card':
      css += `  padding: ${basePadding}rem;\n`;
      css += `  border-radius: ${whitespace_balance * 0.125}rem;\n`;
      css += `  margin-bottom: ${basePadding}rem;\n`;
      break;
      
    case 'input':
      css += `  padding: ${basePadding * 0.75}rem;\n`;
      css += `  border-radius: ${whitespace_balance * 0.125}rem;\n`;
      css += `  margin-bottom: ${basePadding * 0.5}rem;\n`;
      break;
      
    case 'navbar':
      css += `  padding: ${basePadding * 0.75}rem ${basePadding * 1.5}rem;\n`;
      break;
      
    case 'modal':
      css += `  padding: ${basePadding * 1.5}rem;\n`;
      css += `  border-radius: ${whitespace_balance * 0.125}rem;\n`;
      css += `  min-width: ${40 + layout_density * 5}%;\n`;
      break;
      
    case 'table':
      css += `  border-spacing: 0;\n`;
      // Table spacing would be applied to td/th elements
      break;
  }
  
  return css;
}

/**
 * Generate effect styles (shadows, borders) based on design attributes
 */
function generateEffectStyles(
  component: ComponentType,
  state: ComponentState,
  designAttributes: DesignAttributes
): string {
  let css = '';
  const { shadow_use, border_use } = designAttributes;
  
  // Only apply shadows if shadow_use is above a threshold
  if (shadow_use > 2 && state !== 'disabled') {
    const shadowIntensity = shadow_use * 0.05;
    
    switch (component) {
      case 'button':
        css += `  box-shadow: 0 ${shadowIntensity}rem ${shadowIntensity * 2}rem rgba(0, 0, 0, 0.1);\n`;
        break;
        
      case 'card':
        css += `  box-shadow: 0 ${shadowIntensity}rem ${shadowIntensity * 3}rem rgba(0, 0, 0, 0.1);\n`;
        break;
        
      case 'modal':
        css += `  box-shadow: 0 ${shadowIntensity * 2}rem ${shadowIntensity * 4}rem rgba(0, 0, 0, 0.2);\n`;
        break;
        
      default:
        // No shadow for other components
        break;
    }
  }
  
  // Apply borders based on border_use
  if (border_use > 2 && component !== 'button' && state !== 'disabled') {
    const borderWidth = border_use * 0.05;
    
    switch (component) {
      case 'card':
      case 'input':
      case 'modal':
      case 'table':
        css += `  border: ${borderWidth}rem solid #ddd;\n`;
        break;
        
      default:
        // No border for other components
        break;
    }
  }
  
  return css;
}

/**
 * Generate hover styles for a component
 */
function generateHoverStyles(
  component: ComponentType,
  colorPalette: ColorPalette,
  designAttributes: DesignAttributes
): string {
  if (component === 'table') {
    return '';
  }
  
  const { shadow_use } = designAttributes;
  const { secondary, accent } = colorPalette;
  let css = `${getComponentSelector(component, 'hover')} {\n`;
  
  switch (component) {
    case 'button':
      css += `  background-color: ${secondary};\n`;
      if (shadow_use > 2) {
        const shadowIntensity = shadow_use * 0.05;
        css += `  box-shadow: 0 ${shadowIntensity * 1.5}rem ${shadowIntensity * 3}rem rgba(0, 0, 0, 0.15);\n`;
      }
      break;
      
    case 'card':
      if (shadow_use > 2) {
        const shadowIntensity = shadow_use * 0.05;
        css += `  box-shadow: 0 ${shadowIntensity * 1.5}rem ${shadowIntensity * 3}rem rgba(0, 0, 0, 0.15);\n`;
      }
      break;
      
    case 'input':
      css += `  border-color: ${accent};\n`;
      break;
  }
  
  css += '}\n';
  return css;
}

export default {
  generateComponentCss,
  generateComponentLibraryCss,
}; 