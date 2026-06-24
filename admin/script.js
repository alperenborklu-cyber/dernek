// admin/script.js - Yönetici Paneli Etkileşim Kodları

document.addEventListener("DOMContentLoaded", () => {
    // 1. Yetki Kontrolü
    const session = localStorage.getItem("dernek_session") ? JSON.parse(localStorage.getItem("dernek_session")) : null;
    if (!session || session.role !== "admin") {
        window.location.href = "../login.html";
        return;
    }

    // 2. Admin Adını Sidebar'a Yaz
    const sidebarName = document.querySelector(".sidebar-user .user-name");
    if (sidebarName) sidebarName.textContent = session.fullName;

    // 3. Tab Değiştirme Sistemi
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(targetTab + "Tab").classList.add("active");
        });
    });

    // 4. İstatistikleri Hesaplama ve Yazma
    const updateStats = () => {
        const members = JSON.parse(localStorage.getItem("members") || "[]");
        const comments = JSON.parse(localStorage.getItem("comments") || "[]");
        const announcements = JSON.parse(localStorage.getItem("announcements") || "[]");

        const approvedCount = members.filter(m => m.status === "approved").length;
        const pendingAppsCount = members.filter(m => m.status === "pending").length;
        const pendingCommentsCount = comments.filter(c => c.status === "pending").length;
        const activeAnnouncementsCount = announcements.length;

        const elApproved = document.getElementById("statTotalMembers");
        const elPendingApps = document.getElementById("statPendingApps");
        const elPendingComments = document.getElementById("statPendingComments");
        const elActiveAnnouncements = document.getElementById("statActiveAnnouncements");

        if (elApproved) elApproved.textContent = approvedCount;
        if (elPendingApps) elPendingApps.textContent = pendingAppsCount;
        if (elPendingComments) elPendingComments.textContent = pendingCommentsCount;
        if (elActiveAnnouncements) elActiveAnnouncements.textContent = activeAnnouncementsCount;
    };

    // 5. Başvuruları Listeleme
    const renderApplications = () => {
        const appTableBody = document.getElementById("applicationsTableBody");
        if (!appTableBody) return;

        const members = JSON.parse(localStorage.getItem("members") || "[]");
        const pendingMembers = members.filter(m => m.status === "pending");

        if (pendingMembers.length === 0) {
            appTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Bekleyen başvuru bulunmamaktadır.</td></tr>`;
            return;
        }

        appTableBody.innerHTML = pendingMembers.map(m => `
            <tr>
                <td><strong>${m.fullName}</strong></td>
                <td>${m.tcNo}</td>
                <td>%${m.disabilityRatio} - ${m.disabilityType}</td>
                <td>${m.phone}</td>
                <td>${m.education}</td>
                <td>
                    <button class="btn btn-success btn-sm btn-approve-member" data-email="${m.email}"><i class="fa-solid fa-check"></i> Onayla</button>
                    <button class="btn btn-danger btn-sm btn-reject-member" data-email="${m.email}"><i class="fa-solid fa-times"></i> Reddet</button>
                </td>
            </tr>
        `).join('');

        // Onaylama / Reddetme Olayları
        document.querySelectorAll(".btn-approve-member").forEach(btn => {
            btn.addEventListener("click", () => {
                const email = btn.getAttribute("data-email");
                const allMembers = JSON.parse(localStorage.getItem("members") || "[]");
                const memberIdx = allMembers.findIndex(m => m.email === email);
                
                if (memberIdx !== -1) {
                    allMembers[memberIdx].status = "approved";
                    localStorage.setItem("members", JSON.stringify(allMembers));
                    alert("Üye başarıyla onaylandı. Artık geçici şifresi (123456) ile portala giriş yapabilir.");
                    renderAll();
                }
            });
        });

        document.querySelectorAll(".btn-reject-member").forEach(btn => {
            btn.addEventListener("click", () => {
                const email = btn.getAttribute("data-email");
                if (confirm("Bu başvuruyu reddetmek istediğinizden emin misiniz?")) {
                    const allMembers = JSON.parse(localStorage.getItem("members") || "[]");
                    const updatedMembers = allMembers.filter(m => m.email !== email);
                    localStorage.setItem("members", JSON.stringify(updatedMembers));
                    renderAll();
                }
            });
        });
    };

    // 6. Bekleyen Yorumları Listeleme
    const renderComments = () => {
        const commentTableBody = document.getElementById("commentsTableBody");
        if (!commentTableBody) return;

        const comments = JSON.parse(localStorage.getItem("comments") || "[]");
        const pendingComments = comments.filter(c => c.status === "pending");

        if (pendingComments.length === 0) {
            commentTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Onay bekleyen yorum bulunmamaktadır.</td></tr>`;
            return;
        }

        commentTableBody.innerHTML = pendingComments.map(c => `
            <tr>
                <td><strong>${c.authorName}</strong><br><small style="color: var(--text-muted);">${c.authorEmail}</small></td>
                <td><code style="background-color: var(--bg-color); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">${c.targetId}</code></td>
                <td>"${c.content}"</td>
                <td>${c.date}</td>
                <td>
                    <button class="btn btn-success btn-sm btn-approve-comment" data-id="${c.id}"><i class="fa-solid fa-check"></i> Onayla</button>
                    <button class="btn btn-danger btn-sm btn-delete-comment" data-id="${c.id}"><i class="fa-solid fa-trash"></i> Sil</button>
                </td>
            </tr>
        `).join('');

        // Yorum Onay / Sil Olayları
        document.querySelectorAll(".btn-approve-comment").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const allComments = JSON.parse(localStorage.getItem("comments") || "[]");
                const commentIdx = allComments.findIndex(c => c.id === id);

                if (commentIdx !== -1) {
                    allComments[commentIdx].status = "approved";
                    localStorage.setItem("comments", JSON.stringify(allComments));
                    renderAll();
                }
            });
        });

        document.querySelectorAll(".btn-delete-comment").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                if (confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
                    const allComments = JSON.parse(localStorage.getItem("comments") || "[]");
                    const updatedComments = allComments.filter(c => c.id !== id);
                    localStorage.setItem("comments", JSON.stringify(updatedComments));
                    renderAll();
                }
            });
        });
    };

    // 7. Gelen Mesajları/Talebileri Listeleme
    const renderSuggestions = () => {
        const suggestionsTableBody = document.getElementById("suggestionsTableBody");
        if (!suggestionsTableBody) return;

        const suggestions = JSON.parse(localStorage.getItem("suggestions") || "[]");

        if (suggestions.length === 0) {
            suggestionsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Gelen öneri veya talep bulunmamaktadır.</td></tr>`;
            return;
        }

        // En yeniden en eskiye sırala
        const sortedSuggestions = [...suggestions].reverse();

        suggestionsTableBody.innerHTML = sortedSuggestions.map(s => `
            <tr>
                <td><strong>${s.authorName}</strong><br><small style="color: var(--text-muted);">${s.authorEmail}</small></td>
                <td><strong>${s.subject}</strong></td>
                <td>${s.message}</td>
                <td>${s.date}</td>
            </tr>
        `).join('');
    };

    // 8. Yeni Duyuru Ekleme
    const announcementForm = document.getElementById("publishAnnouncementForm");
    if (announcementForm) {
        announcementForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const title = document.getElementById("annTitle").value.trim();
            const content = document.getElementById("annContent").value.trim();
            const alertBox = document.getElementById("annSuccessAlert");

            if (!title || !content) return;

            const announcements = JSON.parse(localStorage.getItem("announcements") || "[]");
            const newAnn = {
                id: "ann-" + Date.now(),
                title: title,
                content: content,
                date: new Date().toISOString().split('T')[0]
            };

            announcements.unshift(newAnn); // En üste ekle
            localStorage.setItem("announcements", JSON.stringify(announcements));
            
            announcementForm.reset();
            alertBox.style.display = "block";
            
            setTimeout(() => {
                alertBox.style.display = "none";
            }, 3000);

            renderAll();
        });
    }

    // Ortak Yenileme Fonksiyonu
    const renderAll = () => {
        updateStats();
        renderApplications();
        renderComments();
        renderSuggestions();
    };

    renderAll();

    // 9. Gece/Gündüz Modu Senkronu
    const themeBtn = document.getElementById("themeTogglePortal");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("dark-mode", isDark);
            
            const icon = themeBtn.querySelector("i");
            if (isDark) {
                icon.className = "fa-solid fa-sun";
            } else {
                icon.className = "fa-solid fa-moon";
            }
        });
        
        const savedDarkMode = localStorage.getItem("dark-mode");
        if (savedDarkMode === "true") {
            document.body.classList.add("dark-mode");
            const icon = themeBtn.querySelector("i");
            if (icon) icon.className = "fa-solid fa-sun";
        }
    }

    // 10. Çıkış Olayı
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("dernek_session");
            window.location.href = "../index.html";
        });
    }
});
