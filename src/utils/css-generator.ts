import { TalentProfile, ColorPalette, Typography, DesignAttributes, DesignSystem, DesignProfile, TypographySettings } from '../db/index.js';

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
  const { design_profile } = talent;
  
  // Extract properties from talent design profile
  const { 
    aesthetic_characteristics,
    design_attributes,
    color_palette,
    typography,
    design_system
  } = design_profile;
  
  // Start building the CSS
  let css = '';
  
  // Add component selector based on component type and state
  const selector = getComponentSelector(component, state);
  css += `${selector} {\n`;
  
  // If design_system is available, use it for enhanced styling
  if (design_system && design_system.components[component]) {
    css += generateStyledComponentCss(component, state, design_system, customProperties);
  } else {
    // Fallback to the basic styling logic
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
  }
  
  // Add custom properties
  for (const [property, value] of Object.entries(customProperties)) {
    css += `  ${property}: ${value};\n`;
  }
  
  // Close the selector
  css += '}\n';
  
  // Add hover state if needed and not already specified
  if (state !== 'hover' && component !== 'table') {
    if (design_system) {
      css += generateDesignSystemHoverStyles(component, design_system);
    } else {
      css += generateHoverStyles(component, color_palette, design_attributes);
    }
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
  const { color_palette, typography, design_system } = talent.design_profile;
  
  if (design_system) {
    // Enhanced color variables using the design system
    css += `  /* Core Color */\n`;
    css += `  --u-color-core: ${design_system.colors.base.core};\n`;
    css += `  --u-color-neutral: ${design_system.colors.base.neutral};\n`;
    css += `  --u-color-tint-scale: ${design_system.colors.scales.tint};\n`;
    css += `  --u-color-shade-scale: ${design_system.colors.scales.shade};\n`;
    css += `  --u-color-chroma-scale: ${design_system.colors.scales.chroma};\n\n`;
    
    // Neutral palette variables
    css += `  /* Neutral Palette */\n`;
    for (const [shade, value] of Object.entries(design_system.colors.palette.neutral)) {
      css += `  --color-neutral-${shade}: ${value};\n`;
    }
    css += `\n`;
    
    // Primary palette variables
    css += `  /* Primary Palette */\n`;
    for (const [shade, value] of Object.entries(design_system.colors.palette.primary)) {
      css += `  --color-primary-${shade}: ${value};\n`;
    }
    css += `\n`;
    
    // Semantic color variables
    css += `  /* Semantic Colors */\n`;
    // Background
    for (const [key, value] of Object.entries(design_system.colors.semantic.background)) {
      css += `  --color-background-${key}: ${value};\n`;
    }
    // Text
    for (const [key, value] of Object.entries(design_system.colors.semantic.text)) {
      css += `  --color-text-${key}: ${value};\n`;
    }
    // Brand
    for (const [key, value] of Object.entries(design_system.colors.semantic.brand)) {
      css += `  --color-brand-${key}: ${value};\n`;
    }
    // UI
    for (const [key, value] of Object.entries(design_system.colors.semantic.ui)) {
      css += `  --color-ui-${key}: ${value};\n`;
    }
    css += `\n`;
    
    // Typography variables
    css += `  /* Typography */\n`;
    css += `  --font-heading: ${typography.heading.font};\n`;
    css += `  --font-body: ${typography.body.font};\n`;
    css += `  --font-weight-heading: ${typography.heading.weight};\n`;
    css += `  --font-weight-body: ${typography.body.weight};\n`;
    css += `  --letter-spacing-heading: ${typography.heading.letterSpacing};\n`;
    css += `  --letter-spacing-body: ${typography.body.letterSpacing};\n`;
    css += `  --line-height-heading: ${typography.heading.lineHeight};\n`;
    css += `  --line-height-body: ${typography.body.lineHeight};\n`;
    css += `  --font-size-base: ${typography.scale.base};\n`;
    css += `  --font-size-ratio: ${typography.scale.ratio};\n`;
    css += `  --font-size-h1: ${typography.scale.h1};\n`;
    css += `  --font-size-h2: ${typography.scale.h2};\n`;
    css += `  --font-size-h3: ${typography.scale.h3};\n`;
    css += `  --font-size-h4: ${typography.scale.h4};\n`;
    css += `  --font-size-h5: ${typography.scale.h5};\n`;
    css += `  --font-size-small: ${typography.scale.small};\n`;
    css += `\n`;
    
    // Spacing variables
    css += `  /* Spacing */\n`;
    css += `  --spacing-base: ${design_system.spacing.base};\n`;
    for (const [key, value] of Object.entries(design_system.spacing.scale)) {
      css += `  --spacing-${key}: ${value};\n`;
    }
    css += `\n`;
    
    // Border variables
    css += `  /* Borders */\n`;
    for (const [key, value] of Object.entries(design_system.borders.radius)) {
      css += `  --radius-${key}: ${value};\n`;
    }
    for (const [key, value] of Object.entries(design_system.borders.width)) {
      css += `  --border-${key}: ${value};\n`;
    }
    css += `\n`;
    
    // Shadow variables
    css += `  /* Shadows */\n`;
    for (const [key, value] of Object.entries(design_system.shadows)) {
      css += `  --shadow-${key}: ${value};\n`;
    }
    css += `\n`;
    
    // Transition variables
    css += `  /* Transitions */\n`;
    for (const [key, value] of Object.entries(design_system.transitions)) {
      css += `  --transition-${key}: ${value};\n`;
    }
  } else {
    // Basic color variables (fallback)
    css += `  /* Colors */\n`;
    css += `  --color-primary: ${color_palette.primary};\n`;
    css += `  --color-secondary: ${color_palette.secondary};\n`;
    css += `  --color-accent: ${color_palette.accent};\n`;
    css += `  --color-background: ${color_palette.background};\n`;
    css += `  --color-text: ${color_palette.text};\n\n`;
    
    // Basic typography variables (fallback)
    css += `  /* Typography */\n`;
    css += `  --font-heading: ${typography.heading.font};\n`;
    css += `  --font-body: ${typography.body.font};\n`;
    css += `  --font-weight-heading: ${typography.heading.weight};\n`;
    css += `  --font-weight-body: ${typography.body.weight};\n`;
    css += `  --letter-spacing-heading: ${typography.heading.letterSpacing};\n`;
    css += `  --letter-spacing-body: ${typography.body.letterSpacing};\n`;
    css += `  --line-height-heading: ${typography.heading.lineHeight};\n`;
    css += `  --line-height-body: ${typography.body.lineHeight};\n`;
    css += `  --font-size-base: ${typography.scale.base};\n`;
    css += `  --font-size-ratio: ${typography.scale.ratio};\n`;
  }
  
  css += `}\n\n`;
  
  // Generate CSS for each component
  for (const component of components) {
    css += `/* ${capitalizeFirstLetter(component)} Component */\n`;
    
    // Generate base styles
    css += generateComponentCss(talent, { component });
    
    // Generate state variations
    for (const state of states.filter(s => s !== 'default')) {
      css += generateComponentCss(talent, { component, state });
    }
    
    // Generate variants if design system is available
    if (design_system && design_system.components[component] && 'variants' in design_system.components[component]) {
      const variants = design_system.components[component].variants || {};
      
      for (const [variant, _] of Object.entries(variants)) {
        css += generateComponentCss(talent, { component, variant });
      }
    }
    
    css += '\n';
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
  const { heading, body, scale } = typography;
  
  const typographySettings = component === 'navbar' ? heading : body;
  const font = typographySettings.font;
  const weight = typographySettings.weight;
  const letterSpacing = typographySettings.letterSpacing;
  const lineHeight = typographySettings.lineHeight;
  
  css += `  font-family: ${font};\n`;
  
  // Different font sizes based on component
  switch (component) {
    case 'button':
      css += `  font-size: ${scale.small};\n`;
      css += `  font-weight: ${weight};\n`;
      break;
      
    case 'card':
      // Card itself doesn't need font size, its children will have it
      break;
      
    case 'input':
      css += `  font-size: ${scale.base};\n`;
      break;
      
    case 'navbar':
      css += `  font-size: ${scale.h5};\n`;
      css += `  font-weight: ${weight};\n`;
      break;
      
    case 'modal':
      // Modal itself doesn't need font size, its children will have it
      break;
      
    case 'table':
      css += `  font-size: ${scale.small};\n`;
      break;
  }
  
  css += `  letter-spacing: ${letterSpacing};\n`;
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

/**
 * Generate component styles based on design system
 */
function generateStyledComponentCss(
  component: ComponentType,
  state: ComponentState,
  designSystem: DesignSystem,
  customProperties: Record<string, string | number> = {}
): string {
  let css = '';
  
  // Add standard component properties
  if (state === 'default') {
    // Add box-sizing property
    css += `  box-sizing: border-box;\n`;
    
    // Apply component-specific styles based on the component type
    switch (component) {
      case 'button': {
        const buttonComponent = designSystem.components.button;
        // Add base properties
        for (const [property, value] of Object.entries(buttonComponent.base)) {
          css += `  ${property}: ${value};\n`;
        }
        
        // Add medium size properties by default
        for (const [property, value] of Object.entries(buttonComponent.sizes.md)) {
          css += `  ${property}: ${value};\n`;
        }
        
        // Add primary variant properties by default
        for (const [property, value] of Object.entries(buttonComponent.variants.primary)) {
          css += `  ${property}: ${value};\n`;
        }
        break;
      }
        
      case 'card': {
        const cardComponent = designSystem.components.card;
        // Add base properties
        for (const [property, value] of Object.entries(cardComponent.base)) {
          css += `  ${property}: ${value};\n`;
        }
        
        // Add medium padding by default
        css += `  padding: ${cardComponent.padding.md};\n`;
        break;
      }
        
      case 'input': {
        const inputComponent = designSystem.components.input;
        // Add base properties
        for (const [property, value] of Object.entries(inputComponent.base)) {
          css += `  ${property}: ${value};\n`;
        }
        
        // Add medium size properties by default
        for (const [property, value] of Object.entries(inputComponent.sizes.md)) {
          css += `  ${property}: ${value};\n`;
        }
        break;
      }
        
      case 'navbar': {
        const navbarComponent = designSystem.components.navbar;
        // Add base properties
        for (const [property, value] of Object.entries(navbarComponent.base)) {
          css += `  ${property}: ${value};\n`;
        }
        break;
      }
        
      case 'modal': {
        const modalComponent = designSystem.components.modal;
        // For modal, we need to apply properties from content section
        for (const [property, value] of Object.entries(modalComponent.content)) {
          css += `  ${property}: ${value};\n`;
        }
        
        // Add body padding
        css += `  padding: ${modalComponent.body.padding};\n`;
        break;
      }
        
      case 'table': {
        const tableComponent = designSystem.components.table;
        // Add base properties
        for (const [property, value] of Object.entries(tableComponent.base)) {
          css += `  ${property}: ${value};\n`;
        }
        break;
      }
    }
  } else if (state === 'hover') {
    // Add hover state styles
    switch (component) {
      case 'button': {
        const buttonComponent = designSystem.components.button;
        css += `  background-color: ${buttonComponent.variants.primary.hoverBackground};\n`;
        break;
      }
        
      case 'input': {
        const inputComponent = designSystem.components.input;
        if (inputComponent.states && inputComponent.states.hover) {
          for (const [property, value] of Object.entries(inputComponent.states.hover)) {
            css += `  ${property}: ${value};\n`;
          }
        }
        break;
      }
        
      case 'card': {
        const cardComponent = designSystem.components.card;
        if (cardComponent.variants && cardComponent.variants.elevated) {
          css += `  box-shadow: var(--shadow-md);\n`;
        }
        break;
      }
    }
  } else if (state === 'active') {
    // Add active state styles
    switch (component) {
      case 'button':
        css += `  transform: scale(0.98);\n`;
        break;
    }
  } else if (state === 'disabled') {
    // Add disabled state styles
    switch (component) {
      case 'button':
        css += `  opacity: 0.6;\n`;
        css += `  cursor: not-allowed;\n`;
        break;
        
      case 'input': {
        const inputComponent = designSystem.components.input;
        if (inputComponent.states && inputComponent.states.disabled) {
          for (const [property, value] of Object.entries(inputComponent.states.disabled)) {
            css += `  ${property}: ${value};\n`;
          }
        }
        break;
      }
    }
  } else if (state === 'focus') {
    // Add focus state styles
    switch (component) {
      case 'input': {
        const inputComponent = designSystem.components.input;
        if (inputComponent.states && inputComponent.states.focus) {
          for (const [property, value] of Object.entries(inputComponent.states.focus)) {
            css += `  ${property}: ${value};\n`;
          }
        }
        break;
      }
        
      case 'button': {
        const buttonComponent = designSystem.components.button;
        if (buttonComponent.variants && buttonComponent.variants.primary && buttonComponent.variants.primary.focusRing) {
          css += `  outline: ${buttonComponent.variants.primary.focusRing};\n`;
          css += `  outline-offset: 2px;\n`;
        }
        break;
      }
    }
  }
  
  return css;
}

/**
 * Generate hover styles based on design system
 */
function generateDesignSystemHoverStyles(
  component: ComponentType,
  designSystem: DesignSystem
): string {
  if (component === 'table') {
    return '';
  }
  
  const selector = getComponentSelector(component, 'hover');
  let css = `${selector} {\n`;
  
  switch (component) {
    case 'button': {
      const buttonComponent = designSystem.components.button;
      if (buttonComponent.variants.primary && buttonComponent.variants.primary.hoverBackground) {
        css += `  background-color: ${buttonComponent.variants.primary.hoverBackground};\n`;
      } else {
        css += `  filter: brightness(0.9);\n`;
      }
      break;
    }
      
    case 'card': {
      const cardComponent = designSystem.components.card;
      if (cardComponent.base.boxShadow) {
        css += `  box-shadow: var(--shadow-md);\n`;
      }
      break;
    }
      
    case 'input': {
      const inputComponent = designSystem.components.input;
      if (inputComponent.states && inputComponent.states.hover && inputComponent.states.hover.border) {
        css += `  border: ${inputComponent.states.hover.border};\n`;
      } else {
        css += `  border-color: var(--color-primary-400);\n`;
      }
      break;
    }
  }
  
  css += '}\n';
  return css;
}

/**
 * Utility function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default {
  generateComponentCss,
  generateComponentLibraryCss,
}; 