import * as THREE from 'three';

export function createRealisticEarthTexture(width = 512, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Create realistic Earth base with oceans and continents
  const oceanGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
  oceanGradient.addColorStop(0, '#1e40af'); // Deep blue
  oceanGradient.addColorStop(0.6, '#1d4ed8'); // Ocean blue
  oceanGradient.addColorStop(1, '#1e3a8a'); // Darker blue at edges
  
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add continents with realistic colors
  ctx.fillStyle = '#22c55e'; // Land green
  
  // North America
  ctx.fillRect(width * 0.1, height * 0.25, width * 0.15, height * 0.35);
  ctx.fillRect(width * 0.08, height * 0.15, width * 0.12, height * 0.25);
  
  // South America
  ctx.fillRect(width * 0.18, height * 0.45, width * 0.08, height * 0.4);
  
  // Europe
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(width * 0.45, height * 0.2, width * 0.1, height * 0.15);
  
  // Africa
  ctx.fillStyle = '#ca8a04'; // Sahara brown
  ctx.fillRect(width * 0.48, height * 0.35, width * 0.12, height * 0.3);
  ctx.fillStyle = '#22c55e'; // Sub-saharan green
  ctx.fillRect(width * 0.48, height * 0.55, width * 0.12, height * 0.2);
  
  // Asia
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(width * 0.6, height * 0.15, width * 0.25, height * 0.35);
  ctx.fillStyle = '#ca8a04'; // Desert regions
  ctx.fillRect(width * 0.65, height * 0.25, width * 0.15, height * 0.15);
  
  // Australia
  ctx.fillStyle = '#dc2626'; // Red outback
  ctx.fillRect(width * 0.75, height * 0.6, width * 0.1, height * 0.15);
  
  // Antarctica
  ctx.fillStyle = '#f8fafc'; // White ice
  ctx.fillRect(0, height * 0.85, width, height * 0.15);
  
  // Add ice caps
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height * 0.1); // North pole
  
  // Add cloud patterns for more realism
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 30 + 10;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return new THREE.CanvasTexture(canvas);
}

export function createEarthNormalMap(width = 512, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Create a subtle normal map for surface details
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);
    
    // Create subtle height variations
    const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.1 + 0.5;
    
    data[i] = (noise * 255) | 0;     // R - X normal
    data[i + 1] = (noise * 255) | 0; // G - Y normal
    data[i + 2] = 255;               // B - Z normal (up)
    data[i + 3] = 255;               // A - Alpha
  }
  
  ctx.putImageData(imageData, 0, 0);
  return new THREE.CanvasTexture(canvas);
}