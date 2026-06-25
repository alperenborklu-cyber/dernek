const sharp = require('sharp');
const fs = require('fs');

// Find the baskan file
const files = fs.readdirSync('.').filter(f => f.includes('ba') && f.includes('kan') && f.endsWith('.png'));
console.log('Found:', files);

const src = files[0];
if (!src) { console.error('File not found!'); process.exit(1); }

sharp(src)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile('board-erhan-ozcan-new.webp')
    .then(() => {
        fs.copyFileSync('board-erhan-ozcan-new.webp', 'board-erhan-ozcan.webp');
        fs.unlinkSync('board-erhan-ozcan-new.webp');
        console.log('OK - converted successfully');
    })
    .catch(e => console.error('Error:', e.message));
