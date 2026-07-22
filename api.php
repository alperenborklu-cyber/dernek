<?php
// api.php - Dernek Portalı Sunucu Arayüzü

// Hata ayıklama modunu aç
ini_set('display_errors', 0);
error_reporting(E_ALL);

// CORS Ayarları
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('SECURE_API', true);
$db_file = __DIR__ . '/data/database.php';

// Veritabanını okuma fonksiyonu
function read_db() {
    global $db_file;
    if (!file_exists($db_file)) {
        return [
            "admin_password" => "admin123",
            "projects" => [],
            "members" => [],
            "announcements" => [],
            "comments" => [],
            "suggestions" => [],
            "slider_items" => [],
            "instagram_posts" => []
        ];
    }
    
    $content = file_get_contents($db_file);
    // PHP koruma kodlarını temizle
    $json_start = strpos($content, '?>');
    if ($json_start !== false) {
        $json_str = substr($content, $json_start + 2);
    } else {
        $json_str = $content;
    }
    
    $data = json_decode(trim($json_str), true);
    return is_array($data) ? $data : [];
}

// Veritabanını kaydetme fonksiyonu
function save_db($data) {
    global $db_file;
    
    $dir = dirname($db_file);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    $json_str = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    $file_content = "<?php\n";
    $file_content .= "if (!defined('SECURE_API')) {\n";
    $file_content .= "    header('HTTP/1.1 403 Forbidden');\n";
    $file_content .= "    exit('Erişim Engellendi.');\n";
    $file_content .= "}\n";
    $file_content .= "?>\n";
    $file_content .= $json_str;
    
    return file_put_contents($db_file, $file_content) !== false;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'get_data':
        $db = read_db();
        // Şifreleri dış dünyaya gönderme (Güvenlik için admin_password'ü kaldırıyoruz)
        unset($db['admin_password']);
        
        // Üyelerin şifrelerini ve kişisel verilerini sansürleyelim (Sadece onaylı üyelerin isim vb. bilgilerini göndermek gerekebilir)
        // Ancak yönetim paneli tüm verileri isteyeceği için bu basit yapıda tümünü gönderiyoruz.
        // Güvenliği artırmak için giriş yapan kullanıcının rolüne göre de filtreleme yapılabilir.
        
        echo json_encode($db);
        break;

    case 'signup':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Yalnızca POST isteği kabul edilir."]);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['email']) || empty($input['fullName'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Eksik veya hatalı bilgi gönderildi."]);
            exit;
        }
        
        $db = read_db();
        
        // E-posta kontrolü
        foreach ($db['members'] as $m) {
            if ($m['email'] === $input['email']) {
                echo json_encode(["success" => false, "message" => "Bu e-posta adresi ile zaten bir başvuru yapılmış."]);
                exit;
            }
        }
        
        // Yeni üyeyi ekle (Durum her zaman onay bekliyor olarak başlar)
        $input['status'] = 'pending';
        $db['members'][] = $input;
        
        if (save_db($db)) {
            echo json_encode(["success" => true, "message" => "Başvurunuz başarıyla kaydedildi."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Sunucu hatası: Kayıt yapılamadı."]);
        }
        break;

    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Yalnızca POST isteği kabul edilir."]);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $email = isset($input['email']) ? trim($input['email']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        
        if (empty($email) || empty($password)) {
            echo json_encode(["success" => false, "message" => "Lütfen e-posta ve şifrenizi girin."]);
            exit;
        }
        
        $db = read_db();
        
        // Admin Girişi
        $admin_pass = isset($db['admin_password']) ? $db['admin_password'] : 'admin123';
        if ($email === "admin@dernek.org.tr" && $password === $admin_pass) {
            $session = ["email" => "admin@dernek.org.tr", "role" => "admin", "fullName" => "Sistem Yöneticisi"];
            echo json_encode(["success" => true, "role" => "admin", "user" => $session]);
            exit;
        }
        
        // Üye Girişi
        $found = false;
        foreach ($db['members'] as $m) {
            if ($m['email'] === $email && $m['password'] === $password) {
                if ($m['status'] !== 'approved') {
                    echo json_encode(["success" => false, "message" => "Üyelik başvurunuz henüz onaylanmamıştır veya reddedilmiştir."]);
                    exit;
                }
                $session = [
                    "email" => $m['email'],
                    "role" => "member",
                    "fullName" => $m['fullName'],
                    "memberNo" => isset($m['memberNo']) ? $m['memberNo'] : ''
                ];
                echo json_encode(["success" => true, "role" => "member", "user" => $session]);
                exit;
            }
        }
        
        echo json_encode(["success" => false, "message" => "E-posta adresi veya şifre hatalı."]);
        break;

    case 'save_admin':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Yalnızca POST isteği kabul edilir."]);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Geçersiz veri biçimi."]);
            exit;
        }
        
        // PHP ile veri kaydetme
        $db = read_db();
        
        // Gelen verilerle veritabanını güncelle
        if (isset($input['members'])) $db['members'] = $input['members'];
        if (isset($input['announcements'])) $db['announcements'] = $input['announcements'];
        if (isset($input['comments'])) $db['comments'] = $input['comments'];
        if (isset($input['suggestions'])) $db['suggestions'] = $input['suggestions'];
        if (isset($input['slider_items'])) $db['slider_items'] = $input['slider_items'];
        if (isset($input['instagram_posts'])) $db['instagram_posts'] = $input['instagram_posts'];
        if (isset($input['projects'])) $db['projects'] = $input['projects'];
        if (isset($input['admin_password'])) $db['admin_password'] = $input['admin_password'];
        
        if (save_db($db)) {
            echo json_encode(["success" => true, "version" => time()]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Değişiklikler sunucuya kaydedilemedi."]);
        }
        break;

    case 'add_comment':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) exit;
        
        $db = read_db();
        $db['comments'][] = $input;
        save_db($db);
        echo json_encode(["success" => true]);
        break;

    case 'add_suggestion':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) exit;
        
        $db = read_db();
        $db['suggestions'][] = $input;
        save_db($db);
        echo json_encode(["success" => true]);
        break;

    case 'update_profile':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['email'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Geçersiz veri."]);
            exit;
        }
        
        $db = read_db();
        $updated = false;
        foreach ($db['members'] as $idx => $m) {
            if ($m['email'] === $input['email']) {
                $db['members'][$idx]['fullName'] = isset($input['fullName']) ? $input['fullName'] : $m['fullName'];
                $db['members'][$idx]['phone'] = isset($input['phone']) ? $input['phone'] : $m['phone'];
                $db['members'][$idx]['education'] = isset($input['education']) ? $input['education'] : $m['education'];
                $db['members'][$idx]['address'] = isset($input['address']) ? $input['address'] : $m['address'];
                if (isset($input['duesDebt'])) {
                    $db['members'][$idx]['duesDebt'] = intval($input['duesDebt']);
                }
                $updated = true;
                break;
            }
        }
        
        if ($updated && save_db($db)) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Profil güncellenemedi veya üye bulunamadı."]);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Geçersiz işlem (Action)."]);
        break;
}
