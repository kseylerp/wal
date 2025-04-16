import React from 'react';

interface ColorFilteredImageProps {
  src: string;
  alt: string;
  filterColor: string;
  className?: string;
}

/**
 * Component that applies a color filter to an image
 * Takes an image with light colors on dark background and applies a specified color
 */
export const ColorFilteredImage: React.FC<ColorFilteredImageProps> = ({
  src,
  alt,
  filterColor,
  className = ''
}) => {
  // Convert hex color to RGB
  const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Generate CSS filter values
  const generateFilter = (color: string): string => {
    const rgb = hexToRgb(color);
    if (!rgb) return '';
    
    // This is a simplified approach - for perfect matching, more complex calculations would be needed
    return `brightness(0) saturate(100%) invert(1) sepia(0.5) 
      saturate(300%) hue-rotate(${getHueRotate(rgb)}deg) 
      brightness(${getBrightness(rgb)}) contrast(${getContrast(rgb)})`;
  };

  // Calculate approximate hue rotation based on RGB
  const getHueRotate = (rgb: { r: number, g: number, b: number }): number => {
    // Very simplified hue calculation
    const hue = Math.atan2(
      Math.sqrt(3) * (rgb.g - rgb.b),
      2 * rgb.r - rgb.g - rgb.b
    ) * (180 / Math.PI);
    return (hue + 360) % 360;
  };

  // Calculate approximate brightness based on RGB
  const getBrightness = (rgb: { r: number, g: number, b: number }): number => {
    // Use relative luminance formula
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  };

  // Calculate approximate contrast based on RGB
  const getContrast = (rgb: { r: number, g: number, b: number }): number => {
    // Simple calculation - can be refined for better results
    return Math.max(rgb.r, rgb.g, rgb.b) / 255 * 1.5;
  };

  // Generate the filter CSS
  const filterStyle = {
    filter: generateFilter(filterColor),
  };

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={filterStyle} 
    />
  );
};