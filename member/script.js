// member/script.js - Üye Portalı Etkileşim Kodları

document.addEventListener("DOMContentLoaded", () => {
    // 1. Yetki ve Oturum Kontrolü
    const session = localStorage.getItem("dernek_session") ? JSON.parse(localStorage.getItem("dernek_session")) : null;
    if (!session || session.role !== "member") {
        window.location.href = "../login.html";
        return;
    }

    // Database'den güncel üye bilgisini çek
    const members = JSON.parse(localStorage.getItem("members") || "[]");
    let currentUser = members.find(m => m.email === session.email);

    if (!currentUser) {
        // Oturum geçersizse çıkış yap
        localStorage.removeItem("dernek_session");
        window.location.href = "../login.html";
        return;
    }

    // 2. Üye Bilgilerini Sidebar ve Header'a Yaz
    const sidebarName = document.querySelector(".sidebar-user .user-name");
    const sidebarNo = document.querySelector(".sidebar-user .user-role");
    if (sidebarName) sidebarName.textContent = currentUser.fullName;
    if (sidebarNo) sidebarNo.textContent = currentUser.memberNo;

    // 3. Dijital Üye Kartını Güncelle
    const cardName = document.getElementById("cardMemberName");
    const cardNo = document.getElementById("cardMemberNo");
    const cardTc = document.getElementById("cardMemberTc");
    const cardBlood = document.getElementById("cardMemberBlood");
    const cardDisability = document.getElementById("cardMemberDisability");

    if (cardName) cardName.textContent = currentUser.fullName;
    if (cardNo) cardNo.textContent = currentUser.memberNo;
    if (cardTc) cardTc.textContent = currentUser.tcNo.replace(/(\d{3})\d{5}(\d{3})/, "$1*****$2");
    if (cardBlood) cardBlood.textContent = currentUser.bloodGroup + " Rh";
    if (cardDisability) cardDisability.textContent = `%${currentUser.disabilityRatio} (${currentUser.disabilityType})`;

    // 4. Aidat Durumu Güncelle
    const duesAmount = document.getElementById("duesDebtAmount");
    const payDuesBtn = document.getElementById("payDuesBtn");
    
    const updateDuesUI = () => {
        if (duesAmount) {
            duesAmount.textContent = currentUser.duesDebt + " TL";
            if (currentUser.duesDebt === 0) {
                duesAmount.style.color = "#0f5132";
                if (payDuesBtn) {
                    payDuesBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Ödendi`;
                    payDuesBtn.disabled = true;
                    payDuesBtn.style.backgroundColor = "#d1e7dd";
                    payDuesBtn.style.color = "#0f5132";
                    payDuesBtn.style.cursor = "default";
                }
            } else {
                duesAmount.style.color = "#ef4444";
            }
        }
    };
    
    updateDuesUI();

    // Aidat Ödeme Etkileşimi
    if (payDuesBtn) {
        payDuesBtn.addEventListener("click", () => {
            const confirmPayment = confirm("Dernek yıllık üyelik aidat ödemesini (360 TL) simüle etmek istiyor musunuz?");
            if (confirmPayment) {
                // Update in memory and localStorage
                currentUser.duesDebt = 0;
                
                const userIdx = members.findIndex(m => m.email === currentUser.email);
                if (userIdx !== -1) {
                    members[userIdx] = currentUser;
                    localStorage.setItem("members", JSON.stringify(members));
                }

                alert("Ödeme işleminiz başarıyla simüle edilmiştir. Teşekkür ederiz!");
                updateDuesUI();
            }
        });
    }

    // 5. Duyuruları Listeleme
    const announcementsContainer = document.getElementById("announcementsList");
    const renderAnnouncements = () => {
        if (!announcementsContainer) return;
        const announcements = JSON.parse(localStorage.getItem("announcements") || "[]");
        
        if (announcements.length === 0) {
            announcementsContainer.innerHTML = "<p>Yayınlanmış duyuru bulunmamaktadır.</p>";
            return;
        }

        announcementsContainer.innerHTML = announcements.map(ann => {
            // Yorumları da getir
            const comments = JSON.parse(localStorage.getItem("comments") || "[]");
            const annComments = comments.filter(c => c.targetId === ann.id && c.status === "approved");
            
            return `
                <div class="announcement-item">
                    <div class="announcement-meta">
                        <span><i class="fa-solid fa-bullhorn"></i> Dernek Duyurusu</span>
                        <span>${ann.date}</span>
                    </div>
                    <div class="announcement-title">${ann.title}</div>
                    <div class="announcement-content">${ann.content}</div>
                    
                    <!-- Duyuru Yorum Kutusu -->
                    <div class="ann-comments-section" style="margin-top: 14px; background: var(--bg-color); padding: 12px; border-radius: 10px;">
                        <h5 style="margin: 0 0 8px 0; font-size: 0.85rem; color: var(--text-main);"><i class="fa-solid fa-comments"></i> Yorumlar (${annComments.length})</h5>
                        <div class="ann-comments-list" style="max-height: 150px; overflow-y: auto; margin-bottom: 8px;">
                            ${annComments.map(c => `
                                <div style="font-size: 0.8rem; margin-bottom: 6px; border-bottom: 1px dashed var(--border-color); padding-bottom: 4px;">
                                    <strong>${c.authorName}:</strong> ${c.content}
                                </div>
                            `).join('') || '<p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Bu duyuruya henüz yorum yapılmamış.</p>'}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" placeholder="Yorum yazın..." id="input-ann-comment-${ann.id}" style="flex: 1; padding: 6px 12px; font-size: 0.8rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-main); outline: none;">
                            <button class="btn btn-primary btn-submit-ann-comment" data-ann-id="${ann.id}" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 8px;"><i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                        <div id="alert-ann-comment-${ann.id}" style="display: none; font-size: 0.75rem; color: #0f5132; margin-top: 4px;">Yorumunuz alındı, admin onayından sonra görünecektir.</div>
                    </div>
                </div>
            `;
        }).join('');

        // Yorum gönderme butonlarına listener ekle
        document.querySelectorAll(".btn-submit-ann-comment").forEach(btn => {
            btn.addEventListener("click", () => {
                const annId = btn.getAttribute("data-ann-id");
                const commentInput = document.getElementById(`input-ann-comment-${annId}`);
                const text = commentInput.value.trim();
                
                if (!text) return;
                
                const comments = JSON.parse(localStorage.getItem("comments") || "[]");
                comments.push({
                    id: "comm-" + Date.now(),
                    targetId: annId,
                    authorName: currentUser.fullName,
                    authorEmail: currentUser.email,
                    content: text,
                    date: new Date().toLocaleString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    status: "pending"
                });
                
                localStorage.setItem("comments", JSON.stringify(comments));
                commentInput.value = "";
                
                const alertDiv = document.getElementById(`alert-ann-comment-${annId}`);
                alertDiv.style.display = "block";
                setTimeout(() => {
                    alertDiv.style.display = "none";
                }, 3000);
            });
        });
    };

    renderAnnouncements();

    // 6. Talep / Öneri Gönderme
    const suggestionForm = document.getElementById("suggestionForm");
    if (suggestionForm) {
        suggestionForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const subject = document.getElementById("sugSubject").value.trim();
            const message = document.getElementById("sugMessage").value.trim();
            const alertBox = document.getElementById("suggestionAlert");

            if (!subject || !message) return;

            const suggestions = JSON.parse(localStorage.getItem("suggestions") || "[]");
            suggestions.push({
                id: "sug-" + Date.now(),
                authorName: currentUser.fullName,
                authorEmail: currentUser.email,
                subject: subject,
                message: message,
                date: new Date().toLocaleString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            });

            localStorage.setItem("suggestions", JSON.stringify(suggestions));
            suggestionForm.reset();

            alertBox.style.display = "block";
            setTimeout(() => {
                alertBox.style.display = "none";
            }, 4000);
        });
    }

    // 7. Profil Güncelleme Formu (`profile.html` varsa)
    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
        // Mevcut bilgileri form alanlarına doldur
        document.getElementById("pName").value = currentUser.fullName;
        document.getElementById("pPhone").value = currentUser.phone || "";
        document.getElementById("pEmail").value = currentUser.email;
        document.getElementById("pEducation").value = currentUser.education || "";
        document.getElementById("pAddress").value = currentUser.address || "";
        
        if (currentUser.disabilityType) {
            document.getElementById("pDisabilityType").value = currentUser.disabilityType;
            document.getElementById("pDisabilityRatio").value = currentUser.disabilityRatio;
        }

        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            currentUser.fullName = document.getElementById("pName").value.trim();
            currentUser.phone = document.getElementById("pPhone").value.trim();
            currentUser.education = document.getElementById("pEducation").value;
            currentUser.address = document.getElementById("pAddress").value.trim();
            
            const userIdx = members.findIndex(m => m.email === currentUser.email);
            if (userIdx !== -1) {
                members[userIdx] = currentUser;
                localStorage.setItem("members", JSON.stringify(members));
                
                // Update header session just in case name changed
                const sessionCopy = JSON.parse(localStorage.getItem("dernek_session"));
                sessionCopy.fullName = currentUser.fullName;
                localStorage.setItem("dernek_session", JSON.stringify(sessionCopy));
            }

            const alertBox = document.getElementById("profileAlert");
            alertBox.style.display = "block";
            
            if (sidebarName) sidebarName.textContent = currentUser.fullName;
            
            setTimeout(() => {
                alertBox.style.display = "none";
            }, 3000);
        });
    }

    // 8. Dark Mode Gece Teması Senkronu
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
        
        // Tercihi yükle
        const savedDarkMode = localStorage.getItem("dark-mode");
        if (savedDarkMode === "true") {
            document.body.classList.add("dark-mode");
            const icon = themeBtn.querySelector("i");
            if (icon) icon.className = "fa-solid fa-sun";
        }
    }

    // 9. Çıkış Yap Butonu
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("dernek_session");
            window.location.href = "../index.html";
        });
    }
});
