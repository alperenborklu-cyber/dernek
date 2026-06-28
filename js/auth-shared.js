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
        address: "TCDD 2. Bölge Behiçbey Tesisleri Datem Binaları A Blok Anadolu Blv. Behiçbey - Yenimahalle / ANKARA",
        memberNo: "UD-2026-0001",
        duesDebt: 120, // TL
        status: "approved"
    }
];

const DEFAULT_ANNOUNCEMENTS = [
    {
        id: "ann-eti-maden",
        title: "Eti Maden İşletmeleri Genel Müdür Yardımcısı Sayın Hüseyin Uyan'a Ziyaret",
        category: "Kurumsal",
        content: "Dernek heyetimiz, Eti Maden İşletmeleri Genel Müdür Yardımcısı Sayın Hüseyin UYAN'ı makamında ziyaret ederek çalışmalar ve geleceğe yönelik projeler hakkında görüş alışverişinde bulundu.",
        image: "cover-eti-maden.webp",
        date: "2026-06-20"
    },
    {
        id: "ann-sivil-toplum-calistayi",
        title: "Ankara Sivil Topluma Rehberlik Çalıştayı'na Katılım",
        category: "Kurumsal",
        content: "T.C. İçişleri Bakanlığı Sivil Toplumla İlişkiler Genel Müdürlüğü tarafından düzenlenen çalıştaya derneğimizi temsilen Genel Başkanımız ve Genel Başkan Yardımcımız katılım sağlamıştır.",
        image: "cover-sivil-toplum-calistayi.webp",
        date: "2026-06-19"
    },
    {
        id: "ann-euas-ziyaret",
        title: "EÜAŞ Genel Müdürü Sayın Zafer Benli'ye Teşekkür Ziyareti",
        category: "Kurumsal",
        content: "Mersin Taşucu Denizkent Eğitim Tesislerinde gerçekleştirdiğimiz kampa vermiş oldukları destek nedeniyle EÜAŞ Genel Müdürü Sayın Zafer BENLİ'yi makamında ziyaret edip plaket takdim ettik.",
        image: "cover-euas-ziyaret.webp",
        date: "2026-06-18"
    },
    {
        id: "ann-tesekkur-belgesi",
        title: "Değerli Üyelerimize Teşekkür Belgeleri Takdim Edildi",
        category: "Eğitim",
        content: "EÜAŞ Mersin Taşucu Denizkent Eğitim Tesislerinde gerçekleştirilen Eğitim ve Değerlendirme Kampı son gününde katılımcılarımıza teşekkür belgeleri takdim edildi.",
        image: "cover-kamp-tesekkur-belgesi.webp",
        date: "2026-06-17"
    },
    {
        id: "ann-rehberlik-bulusmasi",
        title: "Ankara Sivil Toplum Rehberlik Buluşması",
        category: "Kurumsal",
        content: "Engelli Memur & İşçi Derneği olarak, Ankara Sivil Toplum Rehberlik Buluşmasına dernek heyetimizle iştirak ettik.",
        image: "cover-sivil-toplum-calistayi.webp",
        date: "2026-06-16"
    },
    {
        id: "ann-il-baskanlari-toplantisi",
        title: "Genişletilmiş İl Başkanları Toplantısı Gerçekleştirildi",
        category: "Kurumsal",
        content: "Genişletilmiş İl Başkanları Toplantımızı Yönetim Kurulumuz ve 61 il temsilcimizin tamamının katılımı ile gerçekleştirdik.",
        image: "cover-il-baskanlari-toplantisi.webp",
        date: "2026-06-15"
    },
    {
        id: "ann-il-muduru-ziyaret",
        title: "Aile ve Sosyal Hizmetler İl Müdürü Sn. Cüneyd Özdemir'e Ziyaret",
        category: "Kurumsal",
        content: "Genel Başkanımız Erhan ÖZCAN ve Teşkilatlandırma Başkanımız Seyfettin YEGEN, İl Müdürü Sn. Cüneyd Özdemir'i makamında ziyaret etti.",
        image: "cover-aile-sosyal-mudur-ziyaret.webp",
        date: "2026-06-14"
    },
    {
        id: "ann-genel-mudurluk-ziyaret",
        title: "Genel Müdürlük Ziyareti ve Birlikteliğimiz",
        category: "Kurumsal",
        content: "Genel Başkanımız Erhan ÖZCAN ile birlikte Genel Müdürlük makamında gerçekleştirilen ziyaret ve ortak çalışma alanlarımız ele alındı.",
        image: "cover-genel-mudurluk-ziyaret.webp",
        date: "2026-06-13"
    },
    {
        id: "ann-saglik-raporlari-yonetmelik",
        title: "Yeni Sağlık Raporları Yönetmeliği Yürürlüğe Girdi",
        category: "Kurumsal",
        content: "Sağlık Bakanlığı, engelli bireylerin sağlık kurulu rapor süreçlerini kolaylaştıran yeni mevzuat ve yönetmeliği yayınladı.",
        image: "cover-saglik-raporlari-yonetmelik.webp",
        date: "2026-06-12"
    },
    {
        id: "ann-meb-ziyaret",
        title: "MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürü'ne Ziyaret",
        category: "Eğitim",
        content: "Genel Başkanımız Erhan ÖZCAN ve heyetimiz, MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürü'nü ziyaret etti.",
        image: "cover-meb-ziyaret.webp",
        date: "2026-06-11"
    },
    {
        id: "ann-kamp-ilk-gun",
        title: "Denizkent Eğitim ve Değerlendirme Kampımızın İlk Günü Başladı",
        category: "Sosyal",
        content: "Engelli Memur & İşçi Derneği olarak, Mersin Taşucu Denizkent Eğitim Tesislerinde gerçekleştirdiğimiz Eğitim ve Değerlendirme Kampımızın ilk günü heyecanla başladı.",
        image: "cover-kamp-ilk-gun.webp",
        date: "2026-06-10"
    },
    {
        id: "ann-kamp-tekne-turu",
        title: "Kamp Etkinliği: Akdeniz'in Eşsiz Güzelliğinde Tekne Turu",
        category: "Sosyal",
        content: "Engelli Memur & İşçi Derneği olarak, EÜAŞ Mersin Taşucu Denizkent Eğitim Tesislerinde gerçekleştirdiğimiz Eğitim ve Değerlendirme Kampı katılımcıları Akdeniz'in eşsiz sularında tekne turuna katıldı.",
        image: "cover-kamp-tekne-turu.webp",
        date: "2026-06-09"
    },
    {
        id: "ann-kamp-istisare-toplantisi",
        title: "Denizkent Kampı Kapsamında İstişare ve Değerlendirme Toplantısı",
        category: "Eğitim",
        content: "Engelli Memur & İşçi Derneği olarak, EÜAŞ Mersin Taşucu Denizkent Eğitim Tesislerinde düzenlediğimiz Eğitim ve Değerlendirme Kampımız kapsamında genişletilmiş istişare toplantısı yapıldı.",
        image: "cover-kamp-istisare-toplantisi.webp",
        date: "2026-06-08"
    },
    {
        id: "ann-kamp-tanitim-videosu",
        title: "Mersin Taşucu Denizkent Toplantı ve İstişare Kampı Videosu",
        category: "Sosyal",
        content: "Engelli Memur & İşçi Derneği olarak Mersin Silifke Taşucu Denizkent Toplantı ve İstişare Kampımızdan derlediğimiz video bültenimiz yayınlandı.",
        image: "cover-kamp-tanitim-videosu.webp",
        date: "2026-06-07"
    },
    {
        id: "ann-kamp-album",
        title: "Mersin Taşucu Denizkent Kampı Fotoğraf Albümü",
        category: "Sosyal",
        content: "Mersin Silifke Taşucu Denizkent Toplantı ve İstişare Kampımızdan derlediğimiz fotoğraf albümümüz sosyal medya hesaplarımızda yayınlandı.",
        image: "cover-kamp-album.webp",
        date: "2026-06-06"
    },
    {
        id: "ann-kamp-canli-muzik",
        title: "Eğitim Kampımızda Canlı Müzik Eşliğinde Unutulmaz Bir Dayanışma Gecesi",
        category: "Sosyal",
        content: "Engelli Memur & İşçi Derneği tarafından EÜAŞ Mersin Taşucu Denizkent Eğitim Tesislerinde düzenlenen Eğitim ve Değerlendirme Kampımız kapsamında canlı müzik etkinliği yapıldı.",
        image: "cover-kamp-canli-muzik.webp",
        date: "2026-06-06"
    }
];

const DEFAULT_COMMENTS = [
    {
        id: "comm-1",
        targetId: "ann-tesekkur-belgesi", // updated targetId matching ID
        authorName: "Ahmet Yılmaz",
        authorEmail: "uye@dernek.org.tr",
        content: "Kamp gerçekten harikaydı, tüm organizasyon ekibine teşekkür ederim.",
        date: "2026-06-20 18:30",
        status: "approved"
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
    if (!localStorage.getItem("dernek_initialized") || !localStorage.getItem("dernek_initialized_v3")) {
        localStorage.setItem("members", JSON.stringify(DEFAULT_MEMBERS));
        localStorage.setItem("announcements", JSON.stringify(DEFAULT_ANNOUNCEMENTS));
        localStorage.setItem("comments", JSON.stringify(DEFAULT_COMMENTS));
        localStorage.setItem("suggestions", JSON.stringify(DEFAULT_SUGGESTIONS));
        localStorage.setItem("admin_password", "admin123");
        localStorage.setItem("dernek_initialized", "true");
        localStorage.setItem("dernek_initialized_v3", "true");
        console.log("Dernek LocalStorage Veritabanı Güncellendi ve Başlatıldı.");
    }
    if (!localStorage.getItem("admin_password")) {
        localStorage.setItem("admin_password", "admin123");
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
    const storedAdminPassword = localStorage.getItem("admin_password") || "admin123";
    if (email === "admin@dernek.org.tr" && password === storedAdminPassword) {
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
