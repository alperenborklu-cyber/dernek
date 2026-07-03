const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const AUTH_SHARED_PATH = path.join(__dirname, 'js', 'auth-shared.js');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API Endpoint: Save changes to js/auth-shared.js
    if (req.method === 'POST' && req.url === '/api/save') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                // Read existing js/auth-shared.js to find the functions section
                if (!fs.existsSync(AUTH_SHARED_PATH)) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'auth-shared.js bulunamadı.' }));
                    return;
                }

                const fileContent = fs.readFileSync(AUTH_SHARED_PATH, 'utf8');
                const funcMarker = '// LocalStorage başlatma fonksiyonu';
                const markerIndex = fileContent.indexOf(funcMarker);

                if (markerIndex === -1) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'auth-shared.js dosyasında başlangıç belirteci bulunamadı.' }));
                    return;
                }

                const functionsSection = fileContent.substring(markerIndex);
                const dbVersion = Date.now().toString(); // New timestamp for database version

                const updatedContent = `// auth-shared.js - Ortak Kimlik Doğrulama ve LocalStorage Veri Katmanı

// Sürüm ve varsayılan şifre bilgileri
const DB_VERSION = "${dbVersion}";
const DEFAULT_ADMIN_PASSWORD = "${data.admin_password || 'admin123'}";

// Başlangıç verilerini tanımlayalım
const DEFAULT_PROJECTS = ${JSON.stringify(data.projects || [], null, 4)};

const DEFAULT_MEMBERS = ${JSON.stringify(data.members || [], null, 4)};

const DEFAULT_ANNOUNCEMENTS = ${JSON.stringify(data.announcements || [], null, 4)};

const DEFAULT_COMMENTS = ${JSON.stringify(data.comments || [], null, 4)};

const DEFAULT_SUGGESTIONS = ${JSON.stringify(data.suggestions || [], null, 4)};

const DEFAULT_SLIDES = ${JSON.stringify(data.slider_items || [], null, 4)};

const DEFAULT_INSTAGRAM_POSTS = ${JSON.stringify(data.instagram_posts || [], null, 4)};

${functionsSection}`;

                // Write the updated content back to the file
                fs.writeFileSync(AUTH_SHARED_PATH, updatedContent, 'utf8');
                console.log(`[Sunucu] js/auth-shared.js başarıyla güncellendi. Yeni Sürüm: ${dbVersion}`);

                // Git add, commit ve push işlemlerini çalıştır
                const { exec } = require('child_process');
                exec('git add js/auth-shared.js && git commit -m "Yonetim panelinden otomatik veritabani guncellemesi" && git push', (gitErr, stdout, stderr) => {
                    if (gitErr) {
                        console.error('[Sunucu] Git push başarısız oldu:', gitErr);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, version: dbVersion, gitPush: false, gitError: gitErr.message }));
                    } else {
                        console.log('[Sunucu] Git push başarıyla tamamlandı.');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, version: dbVersion, gitPush: true }));
                    }
                });
            } catch (err) {
                console.error('[Sunucu] Veri kaydetme hatası:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // Static files server
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Support clean URLs (e.g. /hakkimizda -> hakkimizda.html)
    if (!path.extname(filePath)) {
        filePath += '.html';
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // If it's a sub-directory index request or missing file, fallback to index.html or 404
                fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexContent) => {
                    if (indexErr) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(indexContent);
                    }
                });
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`Sunucu Hatası: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 Dernek Yerel Geliştirme Sunucusu Çalışıyor!`);
    console.log(`👉 Adres: http://localhost:${PORT}`);
    console.log(`👉 Yönetim Paneli: http://localhost:${PORT}/admin/dashboard.html`);
    console.log(`=============================================================\n`);
});
