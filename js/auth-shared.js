// auth-shared.js - Ortak Kimlik Doğrulama ve LocalStorage Veri Katmanı

// Başlangıç verilerini tanımlayalım
const DEFAULT_MEMBERS = [
    {
        email: "uye@dernek.org.tr",
        password: "uye123",
        fullName: "Ahmet Yılmaz",
        tcNo: "12345678901",
        birthPlace: "Ankara",
        birthDate: "1994-05-12",
        fatherName: "Mehmet",
        motherName: "Fatma",
        maritalStatus: "Bekar",
        bloodGroup: "A+",
        disabilityType: "Bedensel",
        disabilityRatio: "45",
        gender: "Erkek",
        phone: "5551234567",
        education: "Lisans",
        city: "Ankara",
        address: "Çankaya Mah. Atatürk Bulvarı No: 120",
        memberNo: "UD-2026-0001",
        duesDebt: 120, // TL
        status: "approved"
    }
];

const DEFAULT_ANNOUNCEMENTS = [
    {
        id: "ann-1",
        title: "Temmuz Ayı Olağan İstişare Toplantısı",
        content: "Derneğimizin Temmuz ayı olağan istişare toplantısı 5 Temmuz 2026 Cumartesi günü saat 14:00'te genel merkezimizde yapılacaktır. Tüm üyelerimizin katılımı rica olunur.",
        date: "2026-06-24"
    },
    {
        id: "ann-2",
        title: "Engelli Kamu Personeli Hakları Semineri",
        content: "Yeni mevzuat düzenlemeleri ve engelli memurların haklarına yönelik online seminerimiz 10 Temmuz 2026 günü saat 20:00'de Zoom üzerinden gerçekleştirilecektir.",
        date: "2026-06-20"
    }
];

const DEFAULT_COMMENTS = [
    {
        id: "comm-1",
        targetId: "haber-kamp-tesekkur-belgesi", // haberin URL ismi veya ID'si
        authorName: "Ahmet Yılmaz",
        authorEmail: "uye@dernek.org.tr",
        content: "Kamp gerçekten harikaydı, tüm organizasyon ekibine teşekkür ederim.",
        date: "2026-06-20 18:30",
        status: "approved"
    },
    {
        id: "comm-2",
        targetId: "ann-1", // duyuru ID'si
        authorName: "Ahmet Yılmaz",
        authorEmail: "uye@dernek.org.tr",
        content: "Toplantıya Ankara dışından online katılım imkanı olacak mı acaba?",
        date: "2026-06-24 20:00",
        status: "pending"
    }
];

const DEFAULT_SUGGESTIONS = [
    {
        id: "sug-1",
        authorName: "Ahmet Yılmaz",
        authorEmail: "uye@dernek.org.tr",
        subject: "Tekerlekli Sandalye Rampa Talebi",
        message: "Dernek binamızın girişindeki rampanın eğimi biraz fazla, düzeltilmesini talep ediyorum.",
        date: "2026-06-24 15:45"
    }
];

// LocalStorage başlatma fonksiyonu
function initializeDatabase() {
    if (!localStorage.getItem("dernek_initialized")) {
        localStorage.setItem("members", JSON.stringify(DEFAULT_MEMBERS));
        localStorage.setItem("announcements", JSON.stringify(DEFAULT_ANNOUNCEMENTS));
        localStorage.setItem("comments", JSON.stringify(DEFAULT_COMMENTS));
        localStorage.setItem("suggestions", JSON.stringify(DEFAULT_SUGGESTIONS));
        localStorage.setItem("dernek_initialized", "true");
        console.log("Dernek LocalStorage Veritabanı Başlatıldı.");
    }
}

// Oturum Yönetimi
function getCurrentUser() {
    const session = localStorage.getItem("dernek_session");
    if (!session) return null;
    return JSON.parse(session);
}

function login(email, password) {
    initializeDatabase();
    
    // Admin kontrolü
    if (email === "admin@dernek.org.tr" && password === "admin123") {
        const adminSession = { email: "admin@dernek.org.tr", role: "admin", fullName: "Sistem Yöneticisi" };
        localStorage.setItem("dernek_session", JSON.stringify(adminSession));
        return { success: true, role: "admin", user: adminSession };
    }
    
    // Üye kontrolü
    const members = JSON.parse(localStorage.getItem("members") || "[]");
    const user = members.find(m => m.email === email && m.password === password);
    
    if (user) {
        if (user.status !== "approved") {
            return { success: false, message: "Üyelik başvurunuz henüz onaylanmamıştır veya reddedilmiştir." };
        }
        const userSession = { email: user.email, role: "member", fullName: user.fullName, memberNo: user.memberNo };
        localStorage.setItem("dernek_session", JSON.stringify(userSession));
        return { success: true, role: "member", user: userSession };
    }
    
    return { success: false, message: "E-posta adresi veya şifre hatalı." };
}

function logout() {
    localStorage.removeItem("dernek_session");
    // Sayfayı yenile veya anasayfaya yönlendir
    const isSubdir = window.location.pathname.includes("/member/") || window.location.pathname.includes("/admin/");
    window.location.href = isSubdir ? "../index.html" : "index.html";
}

function checkAccess(requiredRole) {
    const user = getCurrentUser();
    if (!user) {
        // Oturum yoksa
        const isSubdir = window.location.pathname.includes("/member/") || window.location.pathname.includes("/admin/");
        window.location.href = isSubdir ? "../login.html" : "login.html";
        return false;
    }
    if (requiredRole && user.role !== requiredRole) {
        // Rol uyuşmuyorsa yetkisiz giriş engellenir
        const isSubdir = window.location.pathname.includes("/member/") || window.location.pathname.includes("/admin/");
        window.location.href = isSubdir ? "../index.html" : "index.html";
        return false;
    }
    return true;
}

// Sayfa yüklendiğinde otomatik veri tabanını kur
initializeDatabase();
