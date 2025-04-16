import React from 'react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  // Set the dimensions based on the size prop
  let width, height;
  switch(size) {
    case 'sm':
      width = 32;
      height = 32;
      break;
    case 'lg':
      width = 64;
      height = 64;
      break;
    default:
      width = 48;
      height = 48;
  }

  return (
    <svg width={width} height={height} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow Layer */}
      <path 
        d="M395 256 L256 395 L117 256 L256 117 Z" 
        fill="#5A4694" 
        transform="translate(30, 30)"
      />
      
      {/* Main Triangle */}
      <path 
        d="M395 256 L256 395 L117 256 L256 117 Z" 
        fill="#FF7B8A" 
        stroke="#FFF1E6" 
        strokeWidth="24"
      />
      
      {/* Path Points */}
      <circle cx="256" cy="256" r="20" fill="#5A4694" />
      <circle cx="200" cy="200" r="20" fill="#5A4694" />
      <circle cx="312" cy="200" r="20" fill="#5A4694" />
      
      {/* Dashed Path */}
      <path 
        d="M256 256 L200 200 M256 256 L312 200" 
        stroke="#5A4694" 
        strokeWidth="8" 
        strokeDasharray="12 8"
      />
    </svg>
  );
}

export function LogoFull() {
  return (
    <div className="logo-container">
      <Logo />
      <span className="logo-text">offbeat</span>
    </div>
  );
}