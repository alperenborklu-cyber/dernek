const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');

const dir = __dirname;
const tmpDir = os.tmpdir();

// Only process files that exist on disk (not already processed webps of same base)
const images = fs.readdirSync(dir).filter(f => {
    if (!/\.(png|jpg|jpeg|webp)$/i.test(f)) return false;
    if (f === 'logo.webp') return false;
    return true;
});

// Deduplicate: if both board-foo.png and board-foo.webp exist, skip .webp and process .png only
const bases = {};
for (const f of images) {
    const ext = path.extname(f).toLowerCase();
    const base = path.basename(f, ext);
    if (!bases[base]) bases[base] = [];
    bases[base].push(f);
}

// Build final list: prefer source (png/jpg) if available, else webp
const toProcess = [];
for (const [base, files] of Object.entries(bases)) {
    const src = files.find(f => /\.(png|jpg|jpeg)$/i.test(f));
    if (src) {
        toProcess.push(src);
    } else {
        toProcess.push(...files); // webp only
    }
}

let totalBefore = 0;
let totalAfter = 0;

async function optimizeAll() {
    for (const file of toProcess) {
        const filePath = path.join(dir, file);
        const ext = path.extname(file).toLowerCase();
        const baseName = path.basename(file, ext);
        const stat = fs.statSync(filePath);
        const sizeBefore = stat.size;
        totalBefore += sizeBefore;

        const outName = baseName + '.webp';
        const outPath = path.join(dir, outName);
        const tmpPath = path.join(tmpDir, 'opt_' + Date.now() + '_' + outName);

        try {
            // Make output file writable if it exists
            if (fs.existsSync(outPath)) {
                try { fs.chmodSync(outPath, 0o666); } catch(e) {}
            }

            await sharp(filePath)
                .resize({ width: 1200, withoutEnlargement: true })
                .webp({ quality: 82 })
                .toFile(tmpPath);

            const buf = fs.readFileSync(tmpPath);
            fs.writeFileSync(outPath, buf);
            fs.unlinkSync(tmpPath);

            const sizeAfter = fs.statSync(outPath).size;
            totalAfter += sizeAfter;
            const saved = Math.round((1 - sizeAfter / sizeBefore) * 100);
            console.log(`✓ ${file.padEnd(55)} ${Math.round(sizeBefore/1024)}KB → ${Math.round(sizeAfter/1024)}KB  (-${saved}%)`);
        } catch (e) {
            console.error(`✗ ${file}: ${e.message}`);
            totalAfter += sizeBefore;
        }
    }

    console.log('\n─────────────────────────────────────────────────────────────');
    console.log(`Total: ${Math.round(totalBefore/1024)}KB → ${Math.round(totalAfter/1024)}KB  (saved ${Math.round((1 - totalAfter/totalBefore)*100)}%)`);
}

optimizeAll();
