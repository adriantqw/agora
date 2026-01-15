#!/usr/bin/env node
/**
 * Generate PNG favicons from SVG
 * Run with: node scripts/generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

// Read the SVG favicon
const svgPath = path.join(__dirname, '../public/favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

console.log('📦 Favicon generator');
console.log('━'.repeat(50));
console.log('\n✅ SVG favicon already exists at public/favicon.svg');
console.log('\nTo generate PNG favicons, you can use one of these tools:');
console.log('\n1. Online converter:');
console.log('   - Visit: https://realfavicongenerator.net/');
console.log('   - Upload: public/favicon.svg');
console.log('   - Download and extract to public/');
console.log('\n2. Using ImageMagick (if installed):');
console.log('   convert public/favicon.svg -resize 32x32 public/favicon.png');
console.log('   convert public/favicon.svg -resize 180x180 public/apple-touch-icon.png');
console.log('\n3. Using online SVG to PNG converter:');
console.log('   - https://svgtopng.com/');
console.log('   - Export 32x32 as favicon.png');
console.log('   - Export 180x180 as apple-touch-icon.png');
console.log('\n━'.repeat(50));
