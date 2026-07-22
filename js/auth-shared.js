// auth-shared.js - Ortak Kimlik Doğrulama ve LocalStorage Veri Katmanı

// Sürüm ve varsayılan şifre bilgileri
const DB_VERSION = "2";
const DEFAULT_ADMIN_PASSWORD = "admin123";

// Başlangıç verilerini tanımlayalım
const DEFAULT_PROJECTS = [];
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
        address: "İstasyon Mah. Tüzün Cad. Dış Kapı No: 33 Akaraatlı Apt. İç Kapı No: - Etimesgut / ANKARA / TÜRKİYE",
        memberNo: "UD-2026-0001",
        duesDebt: 120, // TL
        status: "approved"
    }
];

const DEFAULT_ANNOUNCEMENTS = [
    {
        id: "ann-sivas-tasra-toplantisi",
        title: "Gönül Köprüsü Taşra Teşkilat Toplantılarına Sivas'ta Start Verildi",
        category: "Kurumsal",
        content: "Gönül Köprüsü Derneği olarak, yereldeki teşkilatlanma çalışmalarımıza ve engelli hakları mücadelemize ivme kazandırmak amacıyla başlattığımız Taşra Teşkilat Toplantılarına Sivas'ta start verdik. Tüm Engelliler Derneği, Umut Veren Eller ve Sivas İyilik Derneği ile verimli istişareler gerçekleştirdik.",
        image: "cover-sivas-tasra-toplantisi.webp",
        date: "2026-07-04"
    },
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

const DEFAULT_SLIDES = [
    {
        id: "slide-sivas-tasra-toplantisi",
        title: "Gönül Köprüsü Taşra Teşkilat Toplantılarına Sivas'ta Start Verildi",
        category: "Kurumsal",
        content: "Gönül Köprüsü Derneği olarak, yereldeki teşkilatlanma çalışmalarımıza ve engelli hakları mücadelemize ivme kazandırmak amacıyla başlattığımız Taşra Teşkilat Toplantılarına Sivas'ta start verdik.",
        image: "cover-sivas-tasra-toplantisi.webp",
        date: "2026-07-04",
        link: "haber-sivas-tasra-toplantisi.html"
    },
    {
        id: "slide-1",
        title: "Eti Maden İşletmeleri Genel Müdür Yardımcısı Sayın Hüseyin Uyan'a Ziyaret",
        category: "Kurumsal",
        content: "Dernek heyetimiz, Eti Maden İşletmeleri Genel Müdür Yardımcısı Sayın Hüseyin UYAN'ı makamında ziyaret ederek çalışmalar ve geleceğe yönelik projeler hakkında görüş alışverişinde bulundu.",
        image: "cover-eti-maden.webp",
        date: "2026-06-20",
        link: "haber-eti-maden-ziyaret.html"
    },
    {
        id: "slide-2",
        title: "Ankara Sivil Topluma Rehberlik Çalıştayı'na Katılım",
        category: "Kurumsal",
        content: "T.C. İçişleri Bakanlığı Sivil Toplumla İlişkiler Genel Müdürlüğü tarafından düzenlenen çalıştaya derneğimizi temsilen Genel Başkanımız ve Genel Başkan Yardımcımız katılım sağlamıştır.",
        image: "cover-sivil-toplum-calistayi.webp",
        date: "2026-06-19",
        link: "haber-sivil-toplum-calistayi.html"
    },
    {
        id: "slide-3",
        title: "Değerli Üyelerimize Teşekkür Belgeleri Takdim Edildi",
        category: "Eğitim",
        content: "EÜAŞ Mersin Taşucu Denizkent Eğitim Tesislerinde gerçekleştirilen Eğitim ve Değerlendirme Kampı son gününde katılımcılarımıza teşekkür belgeleri takdim edildi.",
        image: "cover-kamp-tesekkur-belgesi.webp",
        date: "2026-06-17",
        link: "haber-kamp-tesekkur-belgesi.html"
    }
];

const DEFAULT_INSTAGRAM_POSTS = [
    {
        id: "insta-1",
        title: "Genel Başkanımızla Röportaj Videosu",
        link: "https://www.instagram.com/reels/DaF2NcZqZkv/",
        image: "cover-kamp-tanitim-videosu.webp",
        username: "@koprusu.gonul"
    },
    {
        id: "insta-2",
        title: "Değerli Üyelerimize Teşekkür Belgeleri",
        link: "https://www.instagram.com/koprusu.gonul/",
        image: "cover-kamp-tesekkur-belgesi.webp",
        username: "@koprusu.gonul"
    },
    {
        id: "insta-3",
        title: "Genişletilmiş İl Başkanları Toplantısı",
        link: "https://www.instagram.com/koprusu.gonul/",
        image: "cover-il-baskanlari-toplantisi.webp",
        username: "@koprusu.gonul"
    }
];

// LocalStorage başlatma fonksiyonu
// LocalStorage başlangıç değerlerini kurma fonksiyonu (Yalnızca ilk defa girildiyse)
function initializeDatabase() {
    if (!localStorage.getItem("dernek_initialized_cloud")) {
        if (!localStorage.getItem("members")) localStorage.setItem("members", JSON.stringify(DEFAULT_MEMBERS));
        if (!localStorage.getItem("announcements")) localStorage.setItem("announcements", JSON.stringify(DEFAULT_ANNOUNCEMENTS));
        if (!localStorage.getItem("comments")) localStorage.setItem("comments", JSON.stringify(DEFAULT_COMMENTS));
        if (!localStorage.getItem("suggestions")) localStorage.setItem("suggestions", JSON.stringify(DEFAULT_SUGGESTIONS));
        if (!localStorage.getItem("slider_items")) localStorage.setItem("slider_items", JSON.stringify(DEFAULT_SLIDES));
        if (!localStorage.getItem("instagram_posts")) localStorage.setItem("instagram_posts", JSON.stringify(DEFAULT_INSTAGRAM_POSTS));
        if (!localStorage.getItem("projects")) localStorage.setItem("projects", JSON.stringify(DEFAULT_PROJECTS));
        if (!localStorage.getItem("admin_password")) localStorage.setItem("admin_password", DEFAULT_ADMIN_PASSWORD);
        localStorage.setItem("dernek_initialized_cloud", "true");
    }
}

// Global Bulut Depolama Veritabanı Adresi (jsonblob.com - PHP/Veritabanı sunucusu gerektirmez, tüm dünyada ortaktır)
const CLOUD_DB_URL = "https://jsonblob.com/api/jsonBlob/019f89d3-3629-7317-aa18-290aa6c4610c";

// Sunucudan (Bulut Veritabanından) veri senkronizasyonu
async function syncDataFromServer() {
    try {
        const res = await fetch(CLOUD_DB_URL, {
            headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
            const data = await res.json();
            if (data) {
                if (data.members) localStorage.setItem("members", JSON.stringify(data.members));
                if (data.announcements) localStorage.setItem("announcements", JSON.stringify(data.announcements));
                if (data.comments) localStorage.setItem("comments", JSON.stringify(data.comments));
                if (data.suggestions) localStorage.setItem("suggestions", JSON.stringify(data.suggestions));
                if (data.slider_items) localStorage.setItem("slider_items", JSON.stringify(data.slider_items));
                if (data.instagram_posts) localStorage.setItem("instagram_posts", JSON.stringify(data.instagram_posts));
                if (data.projects) localStorage.setItem("projects", JSON.stringify(data.projects));
                if (data.admin_password) localStorage.setItem("admin_password", data.admin_password);
                console.log("Bulut veritabanı başarıyla yerel tarayıcı ile senkronize edildi.");

                // Ekrandaki dinamik içerikleri bulut verisiyle derhal güncelle
                if (typeof window.initDynamicContent === 'function') {
                    window.initDynamicContent();
                }
                window.dispatchEvent(new CustomEvent('cloudDataSynced'));
            }
        } else if (res.status === 404) {
            console.log("Bulut veritabanı bulunamadı, başlangıç verileri yükleniyor...");
            await uploadDataToCloud();
        }
    } catch (e) {
        console.error("Bulut veritabanı senkronizasyon hatası:", e);
    }
}

// Yerel hafızadaki güncel verileri Bulut Veritabanına yükleme fonksiyonu
async function uploadDataToCloud() {
    const dataToSave = {
        members: JSON.parse(localStorage.getItem("members") || JSON.stringify(DEFAULT_MEMBERS)),
        announcements: JSON.parse(localStorage.getItem("announcements") || JSON.stringify(DEFAULT_ANNOUNCEMENTS)),
        comments: JSON.parse(localStorage.getItem("comments") || JSON.stringify(DEFAULT_COMMENTS)),
        suggestions: JSON.parse(localStorage.getItem("suggestions") || JSON.stringify(DEFAULT_SUGGESTIONS)),
        slider_items: JSON.parse(localStorage.getItem("slider_items") || JSON.stringify(DEFAULT_SLIDES)),
        instagram_posts: JSON.parse(localStorage.getItem("instagram_posts") || JSON.stringify(DEFAULT_INSTAGRAM_POSTS)),
        projects: JSON.parse(localStorage.getItem("projects") || JSON.stringify(DEFAULT_PROJECTS)),
        admin_password: localStorage.getItem("admin_password") || DEFAULT_ADMIN_PASSWORD
    };
    try {
        const res = await fetch(CLOUD_DB_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dataToSave)
        });
        if (res.ok) {
            console.log("Tüm değişiklikler ortak bulut veritabanına kaydedildi.");
            return true;
        }
        throw new Error("HTTP error " + res.status);
    } catch (e) {
        console.error("Bulut veritabanına kaydetme hatası:", e);
        return false;
    }
}

// Oturum Yönetimi
function getCurrentUser() {
    const session = localStorage.getItem("dernek_session");
    if (!session) return null;
    return JSON.parse(session);
}

// Tamamen Sunucusuz (Client-side) Giriş Sistemi (Buluttan çekilen verilere göre doğrular)
async function login(email, password) {
    const adminPass = localStorage.getItem("admin_password") || DEFAULT_ADMIN_PASSWORD;
    if (email === "admin@dernek.org.tr" && password === adminPass) {
        const session = { email: "admin@dernek.org.tr", role: "admin", fullName: "Sistem Yöneticisi" };
        localStorage.setItem("dernek_session", JSON.stringify(session));
        return { success: true, role: "admin", user: session };
    }
    
    const members = JSON.parse(localStorage.getItem("members") || "[]");
    const m = members.find(m => m.email === email && m.password === password);
    if (m) {
        if (m.status !== 'approved') {
            return { success: false, message: "Üyelik başvurunuz henüz onaylanmamıştır veya reddedilmiştir." };
        }
        const session = {
            email: m.email,
            role: "member",
            fullName: m.fullName,
            memberNo: m.memberNo || ''
        };
        localStorage.setItem("dernek_session", JSON.stringify(session));
        return { success: true, role: "member", user: session };
    }
    return { success: false, message: "E-posta adresi veya şifre hatalı." };
}

function logout() {
    localStorage.removeItem("dernek_session");
    const isSubdir = window.location.pathname.includes("/member/") || window.location.pathname.includes("/admin/");
    window.location.href = isSubdir ? "../index.html" : "index.html";
}

function checkAccess(requiredRole) {
    const user = getCurrentUser();
    if (!user) {
        const isSubdir = window.location.pathname.includes("/member/") || window.location.pathname.includes("/admin/");
        window.location.href = isSubdir ? "../login.html" : "login.html";
        return false;
    }
    if (requiredRole && user.role !== requiredRole) {
        const isSubdir = window.location.pathname.includes("/member/") || window.location.pathname.includes("/admin/");
        window.location.href = isSubdir ? "../index.html" : "index.html";
        return false;
    }
    return true;
}

// Sayfa yüklendiğinde veritabanını kur ve buluttan en güncel halini çek
initializeDatabase();
syncDataFromServer();
