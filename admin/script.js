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

    // 8. Yeni Duyuru Ekleme ve Güncelleme
    const announcementForm = document.getElementById("publishAnnouncementForm");
    const editAnnIdInput = document.getElementById("editAnnId");
    const submitAnnBtn = document.getElementById("submitAnnBtn");
    const cancelEditAnnBtn = document.getElementById("cancelEditAnnBtn");
    const annFormTitle = document.querySelector("#announcementsTab h3");

    if (announcementForm) {
        announcementForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const title = document.getElementById("annTitle").value.trim();
            const category = document.getElementById("annCategory").value;
            const image = document.getElementById("annImage").value.trim();
            const imagePosition = document.getElementById("annImagePosition").value;
            const image1 = document.getElementById("annImage1").value.trim();
            const image1Position = document.getElementById("annImage1Position").value;
            const image2 = document.getElementById("annImage2").value.trim();
            const image2Position = document.getElementById("annImage2Position").value;
            const image3 = document.getElementById("annImage3").value.trim();
            const image3Position = document.getElementById("annImage3Position").value;
            const content = document.getElementById("annContent").value.trim();
            const alertBox = document.getElementById("annSuccessAlert");
            const editId = editAnnIdInput ? editAnnIdInput.value : "";

            if (!title || !content) return;

            const announcements = JSON.parse(localStorage.getItem("announcements") || "[]");

            if (editId) {
                // Güncelleme Modu
                const idx = announcements.findIndex(ann => ann.id === editId);
                if (idx !== -1) {
                    announcements[idx].title = title;
                    announcements[idx].category = category;
                    announcements[idx].image = image || "";
                    announcements[idx].imagePosition = imagePosition || "top";
                    announcements[idx].image1 = image1 || "";
                    announcements[idx].image1Position = image1Position || "gallery";
                    announcements[idx].image2 = image2 || "";
                    announcements[idx].image2Position = image2Position || "gallery";
                    announcements[idx].image3 = image3 || "";
                    announcements[idx].image3Position = image3Position || "gallery";
                    announcements[idx].content = content;
                    localStorage.setItem("announcements", JSON.stringify(announcements));
                    
                    alertBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> Haber / Duyuru başarıyla güncellendi!';
                    resetAnnForm();
                }
            } else {
                // Yeni Kayıt Modu
                const newAnn = {
                    id: "ann-" + Date.now(),
                    title: title,
                    category: category,
                    content: content,
                    image: image || "",
                    imagePosition: imagePosition || "top",
                    image1: image1 || "",
                    image1Position: image1Position || "gallery",
                    image2: image2 || "",
                    image2Position: image2Position || "gallery",
                    image3: image3 || "",
                    image3Position: image3Position || "gallery",
                    date: new Date().toISOString().split('T')[0]
                };
                announcements.unshift(newAnn); // En üste ekle
                localStorage.setItem("announcements", JSON.stringify(announcements));
                
                alertBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> Haber / Duyuru başarıyla yayınlandı!';
                announcementForm.reset();
                resetAnnForm(); // Ek resim önizlemelerini de siler
            }

            alertBox.style.display = "block";
            setTimeout(() => {
                alertBox.style.display = "none";
            }, 3000);

            renderAll();
        });
    }

    const resetAnnForm = () => {
        if (announcementForm) announcementForm.reset();
        if (editAnnIdInput) editAnnIdInput.value = "";
        if (submitAnnBtn) submitAnnBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Yayınla';
        if (cancelEditAnnBtn) cancelEditAnnBtn.style.display = "none";
        if (annFormTitle) annFormTitle.innerHTML = '<i class="fa-solid fa-bullhorn" style="color: var(--secondary);"></i> Yeni Haber / Duyuru Yayınla';
        
        // Ana resim önizleme sıfırla
        const previewContainer = document.getElementById("annImagePreviewContainer");
        if (previewContainer) previewContainer.style.display = "none";
        const previewImg = document.getElementById("annImagePreview");
        if (previewImg) previewImg.src = "";
        const imagePosSelect = document.getElementById("annImagePosition");
        if (imagePosSelect) imagePosSelect.value = "top";

        // Ek resim önizleme sıfırla
        for (let i = 1; i <= 3; i++) {
            const extraContainer = document.getElementById(`annImage${i}PreviewContainer`);
            if (extraContainer) extraContainer.style.display = "none";
            const extraImg = document.getElementById(`annImage${i}Preview`);
            if (extraImg) extraImg.src = "";
            const extraInput = document.getElementById(`annImage${i}`);
            if (extraInput) extraInput.value = "";
            const extraFileInput = document.getElementById(`annImage${i}File`);
            if (extraFileInput) extraFileInput.value = "";
            const extraPosSelect = document.getElementById(`annImage${i}Position`);
            if (extraPosSelect) extraPosSelect.value = "gallery";
        }
    };

    if (cancelEditAnnBtn) {
        cancelEditAnnBtn.addEventListener("click", () => {
            resetAnnForm();
        });
    }

    // Duyuruları Listeleme ve Silme (Yönetim Paneli İçin)
    const renderAnnouncementsList = () => {
        const tableBody = document.getElementById("announcementsTableBody");
        if (!tableBody) return;

        const announcements = JSON.parse(localStorage.getItem("announcements") || "[]");

        if (announcements.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Yayınlanmış haber veya duyuru bulunmamaktadır.</td></tr>`;
            return;
        }

        tableBody.innerHTML = announcements.map(ann => `
            <tr>
                <td><strong>${ann.title}</strong></td>
                <td><span class="badge badge-approved" style="background-color: rgba(0, 92, 230, 0.1); color: var(--primary);">${ann.category || 'Kurumsal'}</span></td>
                <td>${ann.date}</td>
                <td>${ann.image ? `<img src="${ann.image}" style="height: 40px; max-width: 80px; object-fit: cover; border-radius: 4px;" alt="Görsel">` : '<span style="color: var(--text-muted); font-size: 0.85rem;">Görsel Yok</span>'}</td>
                <td>
                    <button class="btn btn-warning btn-sm btn-edit-announcement" data-id="${ann.id}" style="background-color: #f59e0b; color: white;"><i class="fa-solid fa-edit"></i> Düzenle</button>
                    <button class="btn btn-danger btn-sm btn-delete-announcement" data-id="${ann.id}"><i class="fa-solid fa-trash"></i> Sil</button>
                </td>
            </tr>
        `).join('');

        // Duyuru Silme Olayı
        document.querySelectorAll(".btn-delete-announcement").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                if (confirm("Bu duyuruyu silmek istediğinizden emin misiniz?")) {
                    const allAnnouncements = JSON.parse(localStorage.getItem("announcements") || "[]");
                    const updatedAnnouncements = allAnnouncements.filter(ann => ann.id !== id);
                    localStorage.setItem("announcements", JSON.stringify(updatedAnnouncements));
                    // Düzenlenen duyuru silinirse formu sıfırla
                    if (editAnnIdInput && editAnnIdInput.value === id) {
                        resetAnnForm();
                    }
                    renderAll();
                }
            });
        });

        // Duyuru Düzenleme Olayı
        document.querySelectorAll(".btn-edit-announcement").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const allAnnouncements = JSON.parse(localStorage.getItem("announcements") || "[]");
                const ann = allAnnouncements.find(a => a.id === id);

                if (ann) {
                    document.getElementById("annTitle").value = ann.title;
                    document.getElementById("annCategory").value = ann.category || "Kurumsal";
                    document.getElementById("annImage").value = ann.image || "";
                    document.getElementById("annImagePosition").value = ann.imagePosition || "top";
                    document.getElementById("annImage1").value = ann.image1 || "";
                    document.getElementById("annImage1Position").value = ann.image1Position || "gallery";
                    document.getElementById("annImage2").value = ann.image2 || "";
                    document.getElementById("annImage2Position").value = ann.image2Position || "gallery";
                    document.getElementById("annImage3").value = ann.image3 || "";
                    document.getElementById("annImage3Position").value = ann.image3Position || "gallery";
                    document.getElementById("annContent").value = ann.content;
                    if (editAnnIdInput) editAnnIdInput.value = ann.id;

                    const previewContainer = document.getElementById("annImagePreviewContainer");
                    const previewImg = document.getElementById("annImagePreview");
                    if (ann.image) {
                        if (previewImg) previewImg.src = ann.image;
                        if (previewContainer) previewContainer.style.display = "block";
                    } else {
                        if (previewContainer) previewContainer.style.display = "none";
                    }

                    // Ek resimler için önizlemeler
                    for (let i = 1; i <= 3; i++) {
                        const extraContainer = document.getElementById(`annImage${i}PreviewContainer`);
                        const extraImg = document.getElementById(`annImage${i}Preview`);
                        const val = ann[`image${i}`];
                        if (val) {
                            if (extraImg) extraImg.src = val;
                            if (extraContainer) extraContainer.style.display = "block";
                        } else {
                            if (extraContainer) extraContainer.style.display = "none";
                        }
                    }

                    if (submitAnnBtn) submitAnnBtn.innerHTML = '<i class="fa-solid fa-save"></i> Değişiklikleri Kaydet';
                    if (cancelEditAnnBtn) cancelEditAnnBtn.style.display = "inline-flex";
                    if (annFormTitle) annFormTitle.innerHTML = '<i class="fa-solid fa-edit" style="color: var(--secondary);"></i> Haberi / Duyuruyu Düzenle';

                    // Form alanına yumuşak geçiş yap
                    document.getElementById("publishAnnouncementForm").scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    };

    // Ortak Yenileme Fonksiyonu
    const renderAll = () => {
        updateStats();
        renderApplications();
        renderComments();
        renderSuggestions();
        renderAnnouncementsList();
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

    // Sidebar Şifre Değiştir Butonu Olayı
    const sidebarPasswordChangeBtn = document.getElementById("sidebarPasswordChangeBtn");
    if (sidebarPasswordChangeBtn) {
        sidebarPasswordChangeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const settingsTabBtn = document.querySelector('.tab-btn[data-tab="settings"]');
            if (settingsTabBtn) {
                settingsTabBtn.click();
            }
        });
    }

    // 11. Proje Ekleme Formu Dinleyicisi
    const addProjectForm = document.getElementById("addProjectForm");
    if (addProjectForm) {
        addProjectForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const title = document.getElementById("projTitle").value.trim();
            const category = document.getElementById("projCategory").value;
            const status = document.getElementById("projStatus").value;
            const image = document.getElementById("projImage").value.trim();
            const description = document.getElementById("projDesc").value.trim();
            const alertBox = document.getElementById("projSuccessAlert");

            if (!title || !description) return;

            const categoryNames = {
                "accessibility": "Erişilebilirlik",
                "education": "Eğitim & Kariyer",
                "social": "Sosyal & Spor"
            };

            const projects = JSON.parse(localStorage.getItem("projects") || "[]");
            const newProj = {
                id: "proj-" + Date.now(),
                title: title,
                category: category,
                categoryName: categoryNames[category] || "Erişilebilirlik",
                status: status,
                image: image || "../project_disabled_transport.webp",
                description: description
            };

            projects.push(newProj);
            localStorage.setItem("projects", JSON.stringify(projects));

            // Form Sıfırla
            addProjectForm.reset();
            const projPreviewContainer = document.getElementById("projImagePreviewContainer");
            if (projPreviewContainer) projPreviewContainer.style.display = "none";
            const projPreviewImg = document.getElementById("projImagePreview");
            if (projPreviewImg) projPreviewImg.src = "";
            
            // Başarı Mesajı Göster
            if (alertBox) {
                alertBox.style.display = "block";
                setTimeout(() => {
                    alertBox.style.display = "none";
                }, 4000);
            }
        });
    }

    // 12. Şifre Değiştirme Formu Dinleyicisi
    const changePasswordForm = document.getElementById("changePasswordForm");
    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById("currentPassword").value;
            const newPassword = document.getElementById("newPassword").value;
            const newPasswordConfirm = document.getElementById("newPasswordConfirm").value;
            
            const successAlert = document.getElementById("settingsSuccessAlert");
            const errorAlert = document.getElementById("settingsErrorAlert");
            
            if (successAlert) successAlert.style.display = "none";
            if (errorAlert) errorAlert.style.display = "none";
            
            const storedAdminPassword = localStorage.getItem("admin_password") || "admin123";
            
            if (currentPassword !== storedAdminPassword) {
                if (errorAlert) {
                    errorAlert.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Hata: Mevcut şifreniz yanlış!';
                    errorAlert.style.display = "block";
                }
                return;
            }
            
            if (newPassword !== newPasswordConfirm) {
                if (errorAlert) {
                    errorAlert.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Hata: Yeni şifreler eşleşmiyor!';
                    errorAlert.style.display = "block";
                }
                return;
            }
            
            if (newPassword.length < 6) {
                if (errorAlert) {
                    errorAlert.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Hata: Yeni şifre en az 6 karakter olmalıdır!';
                    errorAlert.style.display = "block";
                }
                return;
            }
            
            localStorage.setItem("admin_password", newPassword);
            changePasswordForm.reset();
            
            if (successAlert) {
                successAlert.style.display = "block";
                setTimeout(() => {
                    successAlert.style.display = "none";
                }, 4000);
            }
        });
    }

    // Göz At Dosya Okuyucu Fonksiyonları (FileReader & Base64)
    const handleFileSelect = (fileInputId, textInputId, previewContainerId, previewImgId) => {
        const fileInput = document.getElementById(fileInputId);
        const textInput = document.getElementById(textInputId);
        const previewContainer = document.getElementById(previewContainerId);
        const previewImg = document.getElementById(previewImgId);

        if (fileInput) {
            fileInput.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64String = event.target.result;
                    if (textInput) textInput.value = base64String;
                    if (previewImg) previewImg.src = base64String;
                    if (previewContainer) previewContainer.style.display = "block";
                };
                reader.readAsDataURL(file);
            });
        }
    };

    handleFileSelect("annImageFile", "annImage", "annImagePreviewContainer", "annImagePreview");
    handleFileSelect("annImage1File", "annImage1", "annImage1PreviewContainer", "annImage1Preview");
    handleFileSelect("annImage2File", "annImage2", "annImage2PreviewContainer", "annImage2Preview");
    handleFileSelect("annImage3File", "annImage3", "annImage3PreviewContainer", "annImage3Preview");
    handleFileSelect("projImageFile", "projImage", "projImagePreviewContainer", "projImagePreview");

    // Silme Butonları Olayı
    const registerRemoveImageHandler = (removeBtnId, textInputId, previewContainerId, previewImgId, fileInputId) => {
        const btn = document.getElementById(removeBtnId);
        if (btn) {
            btn.addEventListener("click", () => {
                const textInput = document.getElementById(textInputId);
                const previewContainer = document.getElementById(previewContainerId);
                const previewImg = document.getElementById(previewImgId);
                const fileInput = document.getElementById(fileInputId);

                if (textInput) textInput.value = "";
                if (previewImg) previewImg.src = "";
                if (previewContainer) previewContainer.style.display = "none";
                if (fileInput) fileInput.value = "";
            });
        }
    };

    registerRemoveImageHandler("removeAnnImageBtn", "annImage", "annImagePreviewContainer", "annImagePreview", "annImageFile");
    registerRemoveImageHandler("removeAnnImage1Btn", "annImage1", "annImage1PreviewContainer", "annImage1Preview", "annImage1File");
    registerRemoveImageHandler("removeAnnImage2Btn", "annImage2", "annImage2PreviewContainer", "annImage2Preview", "annImage2File");
    registerRemoveImageHandler("removeAnnImage3Btn", "annImage3", "annImage3PreviewContainer", "annImage3Preview", "annImage3File");
    registerRemoveImageHandler("removeProjImageBtn", "projImage", "projImagePreviewContainer", "projImagePreview", "projImageFile");
});
