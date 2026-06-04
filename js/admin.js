/**
 * Igniter Team - Bible Memorization Competition Admin Panel
 * Manages Illaka CRUD, Participant CRUD, Notices, Downloads, System settings and Backups
 */

// --- Google Drive URL Converter ---
// Converts any Google Drive sharing link to a direct embeddable image URL.
window.convertGoogleDriveUrl = function(url) {
    if (!url || url.trim() === '') return url;
    url = url.trim();

    // Helper to extract file ID
    const extractId = (u) => {
        const fileMatch = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch) return fileMatch[1];
        const idMatch = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch) return idMatch[1];
        return null;
    };

    const id = extractId(url);
    if (id) {
        // Use the thumbnail endpoint which reliably bypasses strict CORB/Cookie blocks for public images
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }

    // Not a Google Drive link — return unchanged
    return url;
};

// --- Client-Side Image Compression Tool ---
// Resizes and compresses images to avoid localStorage QuotaExceededError
window.compressImage = function(file, options = {}) {
    return new Promise((resolve, reject) => {
        const maxWidth = options.maxWidth || 800;
        const maxHeight = options.maxHeight || 800;
        const quality = options.quality !== undefined ? options.quality : 0.7;
        const toPng = !!options.toPng;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                let width = img.width;
                let height = img.height;

                // Scale down maintaining aspect ratio
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const mimeType = toPng ? 'image/png' : 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, quality);
                resolve(dataUrl);
            };
            img.onerror = function() {
                reject(new Error('छवि लोड गर्न असफल भयो।'));
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            reject(new Error('फाइल पढ्न असफल भयो।'));
        };
        reader.readAsDataURL(file);
    });
};

// --- FileStore URL Helpers ---
// Resolves a filestore:// key or a plain data URL / external URL to a usable src.
window.resolveUrl = function(url) {
    if (!url) return Promise.resolve('');
    if (url.startsWith('filestore://')) {
        const key = url.slice('filestore://'.length);
        return window.FileStore.get(key).then(data => data || '');
    }
    return Promise.resolve(url);
};

// Finds all <img data-fs-key="..."> in container and loads them from FileStore.
// Also handles <a data-fs-key="..."> and <source data-fs-key="...">.
window.hydrateImages = function(container) {
    container = container || document;
    const imgs = container.querySelectorAll('[data-fs-key]');
    imgs.forEach(el => {
        const key = el.dataset.fsKey;
        if (!key) return;
        window.FileStore.get(key).then(data => {
            if (!data) return;
            if (el.tagName === 'IMG') {
                el.src = data;
            } else if (el.tagName === 'A') {
                el.href = data;
            }
        }).catch(() => {});
    });
};

window.adminPanel = {
    init: function() {
        this.renderSubTab('participants');
        
        // Register Admin sub-navigation listeners
        const subNavButtons = document.querySelectorAll('.admin-subnav-btn');
        subNavButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                subNavButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderSubTab(btn.dataset.tab);
            });
        });
    },

    renderSubTab: function(tabName) {
        // Hide all subtab contents
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
        
        // Show target content
        const target = document.getElementById(`admin-tab-${tabName}`);
        if (target) target.classList.remove('hidden');

        // Initialise listings
        if (tabName === 'participants') {
            this.renderParticipantsTable();
        } else if (tabName === 'illakas') {
            this.renderIllakasTable();
        } else if (tabName === 'settings') {
            this.loadSettingsForm();
        } else if (tabName === 'notices') {
            this.renderNoticesTable();
        } else if (tabName === 'materials') {
            this.renderMaterialsTable();
        } else if (tabName === 'prizes') {
            this.renderPrizesTable();
        } else if (tabName === 'gallery') {
            this.renderGalleryTable();
        } else if (tabName === 'team') {
            this.renderTeamTable();
        } else if (tabName === 'contact_settings') {
            this.loadContactSettingsForm();
        } else if (tabName === 'inbox') {
            this.renderMessagesTable();
        }
    },

    // --- Participants CRUD Actions ---
    renderParticipantsTable: function() {
        const tbody = document.getElementById('admin-participants-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const participants = window.db.getParticipants();
        const illakas = window.db.getIllakas();

        if (participants.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">कुनै सहभागी थपिएको छैन।</td></tr>`;
            return;
        }

        participants.forEach(p => {
            const illaka = illakas.find(i => i.id === p.illaka_id);
            const isFileStore = p.photo_url && p.photo_url.startsWith('filestore://');
            const fsKey = isFileStore ? p.photo_url.slice('filestore://'.length) : '';
            const placeholderSrc = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%230a3064%22/><text x=%2250%22 y=%2255%22 font-family=%22sans-serif%22 font-size=%2235%22 fill=%22white%22 text-anchor=%22middle%22>' + (p.name_ne[0] || '?') + '</text></svg>';
            const imgSrc = isFileStore ? placeholderSrc : (p.photo_url || placeholderSrc);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img class="avatar-ring" ${isFileStore ? `data-fs-key="${fsKey}"` : ''} src="${imgSrc}" alt="${p.name_ne}" onerror="this.src='${placeholderSrc}'">
                </td>
                <td style="font-weight: 700; color: var(--primary);">${p.name_ne}</td>
                <td>${p.church_name}</td>
                <td><span style="font-weight: 600; color: var(--gold);">${illaka ? illaka.name_ne : ''}</span></td>
                <td>${p.age_group}</td>
                <td>
                    <span class="role-badge ${p.eliminated ? 'warning' : 'success'}" style="cursor: pointer; user-select: none;" onclick="window.adminPanel.toggleElimination('${p.id}')">
                        ${p.eliminated ? '❌ बाहिरिएको (Eliminated)' : '✅ सक्रिय (Active)'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="window.adminPanel.openParticipantModal('${p.id}')">✏️ सम्पादन</button>
                    <button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteParticipant('${p.id}')">🗑️ मेट्नुहोस्</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        window.hydrateImages(tbody);
    },

    openParticipantModal: function(id = '') {
        const isEdit = id !== '';
        const p = isEdit ? window.db.getParticipantById(id) : { name_ne: '', church_name: '', illaka_id: '', age_group: 'युवा (Youth)', photo_url: '' };
        
        const illakas = window.db.getIllakas();
        const illakaOptions = illakas.map(i => `
            <option value="${i.id}" ${p.illaka_id === i.id ? 'selected' : ''}>${i.name_ne}</option>
        `).join('');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) window.closeActiveModals(); };

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'सहभागी सम्पादन गर्नुहोस्' : 'नयाँ सहभागी थप्नुहोस्'}</h3>
                    <button class="modal-close" onclick="window.closeActiveModals()">×</button>
                </div>
                <div class="modal-body">
                    <form id="admin-participant-form" onsubmit="window.adminPanel.saveParticipant(event, '${id}')">
                        <div class="form-group text-center">
                            <label class="form-label" style="text-align: center;">सहभागीको फोटो (ऐच्छिक)</label>
                            <img class="avatar-large" id="participant-photo-preview" src="${p.photo_url || 'https://via.placeholder.com/120'}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%230a3064%22/><text x=%2250%22 y=%2255%22 font-family=%22sans-serif%22 font-size=%2235%22 fill=%22white%22 text-anchor=%22middle%22>${p.name_ne[0] || '?'}</text></svg>'">
                            <input type="file" id="participant-photo-file" class="form-control" accept="image/*" onchange="window.adminPanel.previewPhoto(this)">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">सहभागीको नाम (Nepali):</label>
                            <input type="text" id="participant-name" class="form-control" required value="${p.name_ne}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">मण्डलीको नाम (Church):</label>
                            <input type="text" id="participant-church" class="form-control" required value="${p.church_name}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">इलाका चयन गर्नुहोस् (Illaka):</label>
                            <select id="participant-illaka" class="form-control" required>
                                <option value="" disabled selected>इलाका रोज्नुहोस्</option>
                                ${illakaOptions}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">उमेर समुह (Age Group):</label>
                            <select id="participant-age" class="form-control">
                                <option value="किशोर (Teenagers)" ${p.age_group === 'किशोर (Teenagers)' ? 'selected' : ''}>किशोर (Teenagers)</option>
                                <option value="युवा (Youth)" ${p.age_group === 'युवा (Youth)' ? 'selected' : ''}>युवा (Youth)</option>
                                <option value="वयस्क (Adult)" ${p.age_group === 'वयस्क (Adult)' ? 'selected' : ''}>वयस्क (Adult)</option>
                            </select>
                        </div>
                        
                        <div class="modal-footer" style="padding: 1.5rem 0 0 0; background: transparent; border-top: none;">
                            <button type="button" class="btn btn-outline" onclick="window.closeActiveModals()">रद्द गर्नुहोस्</button>
                            <button type="submit" class="btn btn-primary">💾 सुरक्षित गर्नुहोस्</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    previewPhoto: function(input) {
        const file = input.files[0];
        if (!file) return;

        const preview = document.getElementById('participant-photo-preview');
        if (preview) {
            preview.style.opacity = '0.5';
        }

        window.compressImage(file, { maxWidth: 200, maxHeight: 200, quality: 0.7 })
            .then(base64 => {
                if (preview) {
                    preview.src = base64;
                    preview.dataset.base64 = base64;
                    preview.style.opacity = '1';
                }
            })
            .catch(err => {
                console.error('Participant photo compression error:', err);
                window.showToast('फोटो लोड गर्न समस्या भयो!', 'danger');
            });
    },

    saveParticipant: function(e, id) {
        e.preventDefault();
        
        const preview = document.getElementById('participant-photo-preview');
        const base64 = preview ? preview.dataset.base64 : null;
        const existingSrc = preview ? preview.src : '';

        const data = {
            name_ne: document.getElementById('participant-name').value.trim(),
            church_name: document.getElementById('participant-church').value.trim(),
            illaka_id: document.getElementById('participant-illaka').value,
            age_group: document.getElementById('participant-age').value
        };

        // Preserve existing photo if no new upload
        if (!base64) {
            if (id) {
                const existing = window.db.getParticipantById(id);
                data.photo_url = existing ? existing.photo_url : '';
            } else {
                data.photo_url = '';
            }
        }

        if (id) data.id = id;

        const saveAndClose = () => {
            window.db.saveParticipant(data);
            window.closeActiveModals();
            window.showToast(id ? 'सहभागी विवरण सम्पादन गरियो!' : 'नयाँ सहभागी सफलतापूर्वक थपियो!');
            this.renderParticipantsTable();
        };

        if (base64) {
            // Save photo to FileStore, store reference key in state
            const savedId = data.id || ('p_' + Date.now());
            const fsKey = 'participant_photo_' + savedId;
            window.FileStore.put(fsKey, base64)
                .then(() => {
                    data.photo_url = 'filestore://' + fsKey;
                    if (!data.id) data.id = savedId;
                    saveAndClose();
                })
                .catch(err => {
                    console.error('Photo save error:', err);
                    data.photo_url = base64; // fallback
                    saveAndClose();
                });
        } else {
            saveAndClose();
        }
    },

    deleteParticipant: function(id) {
        if (confirm('के तपाईं निश्चित रूपमा यो सहभागी मेटाउन चाहनुहुन्छ? कुल मूल्यांकन अंक पनि मेटिनेछ।')) {
            window.db.deleteParticipant(id);
            window.showToast('सहभागी सफलतापूर्वक मेटाइयो!');
            this.renderParticipantsTable();
        }
    },

    toggleElimination: function(id) {
        const p = window.db.getParticipantById(id);
        if (p) {
            p.eliminated = !p.eliminated;
            window.db.saveParticipant(p);
            window.showToast(p.eliminated ? 'सहभागी बाहिरिएको सूचीमा राखियो!' : 'सहभागी सक्रिय सूचीमा राखियो!');
            this.renderParticipantsTable();
        }
    },

    // --- Illakas CRUD Actions ---
    renderIllakasTable: function() {
        const tbody = document.getElementById('admin-illakas-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const illakas = window.db.getIllakas();

        if (illakas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center" style="padding: 2rem; color: var(--text-muted);">कुनै इलाका थपिएको छैन।</td></tr>`;
            return;
        }

        illakas.forEach(i => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--primary);">${i.id}</td>
                <td>${i.name_ne}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="window.adminPanel.openIllakaModal('${i.id}')">✏️ सम्पादन</button>
                    <button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteIllaka('${i.id}')">🗑️ मेट्नुहोस्</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    openIllakaModal: function(id = '') {
        const isEdit = id !== '';
        const i = isEdit ? window.db.getIllakaById(id) : { name_ne: '' };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) window.closeActiveModals(); };

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'इलाका सम्पादन गर्नुहोस्' : 'नयाँ इलाका थप्नुहोस्'}</h3>
                    <button class="modal-close" onclick="window.closeActiveModals()">×</button>
                </div>
                <div class="modal-body">
                    <form id="admin-illaka-form" onsubmit="window.adminPanel.saveIllaka(event, '${id}')">
                        <div class="form-group">
                            <label class="form-label">इलाकाको नाम (Nepali Region Name):</label>
                            <input type="text" id="illaka-name" class="form-control" required value="${i.name_ne}" placeholder="उदा: इलाका ५ - सप्तरी">
                        </div>
                        <div class="modal-footer" style="padding: 1.5rem 0 0 0; background: transparent; border-top: none;">
                            <button type="button" class="btn btn-outline" onclick="window.closeActiveModals()">रद्द गर्नुहोस्</button>
                            <button type="submit" class="btn btn-primary">💾 सुरक्षित गर्नुहोस्</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    saveIllaka: function(e, id) {
        e.preventDefault();
        const data = {
            name_ne: document.getElementById('illaka-name').value.trim()
        };
        if (id) data.id = id;

        window.db.saveIllaka(data);
        window.closeActiveModals();
        window.showToast(id ? 'इलाका सम्पादन गरियो!' : 'नयाँ इलाका सफलतापूर्वक थपियो!');
        this.renderIllakasTable();
    },

    deleteIllaka: function(id) {
        try {
            if (confirm('के तपाईं निश्चित रूपमा यो इलाका मेटाउन चाहनुहुन्छ?')) {
                window.db.deleteIllaka(id);
                window.showToast('इलाका सफलतापूर्वक मेटाइयो!');
                this.renderIllakasTable();
            }
        } catch (e) {
            window.showToast(e.message, 'danger');
        }
    },

    // --- Prizes CRUD Actions ---
    renderPrizesTable: function() {
        const tbody = document.getElementById('admin-prizes-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const prizes = window.db.getPrizes();

        if (prizes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 2rem; color: var(--text-muted);">कुनै पुरस्कार थपिएको छैन।</td></tr>`;
            return;
        }

        prizes.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--gold);">${p.title_ne}</td>
                <td style="font-weight: 600;">${p.amount}</td>
                <td>${p.description_ne || ''}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="window.adminPanel.openPrizeModal('${p.id}')">✏️ सम्पादन</button>
                    <button class="btn btn-danger btn-sm" onclick="window.adminPanel.deletePrize('${p.id}')">🗑️ मेट्नुहोस्</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    openPrizeModal: function(id = '') {
        const isEdit = id !== '';
        const prizes = window.db.getPrizes();
        const p = isEdit ? prizes.find(pr => pr.id === id) : { title_ne: '', amount: '', description_ne: '' };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) window.closeActiveModals(); };

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'पुरस्कार सम्पादन गर्नुहोस्' : 'नयाँ पुरस्कार थप्नुहोस्'}</h3>
                    <button class="modal-close" onclick="window.closeActiveModals()">×</button>
                </div>
                <div class="modal-body">
                    <form id="admin-prize-form" onsubmit="window.adminPanel.savePrize(event, '${id}')">
                        <div class="form-group">
                            <label class="form-label">पुरस्कार शीर्षक (e.g. 1st Prize):</label>
                            <input type="text" id="prize-title" class="form-control" required value="${p.title_ne}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">रकम / उपहार (Amount/Gift):</label>
                            <input type="text" id="prize-amount" class="form-control" required value="${p.amount}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">थप विवरण (Description):</label>
                            <input type="text" id="prize-desc" class="form-control" value="${p.description_ne}">
                        </div>
                        <div class="modal-footer" style="padding: 1.5rem 0 0 0; background: transparent; border-top: none;">
                            <button type="button" class="btn btn-outline" onclick="window.closeActiveModals()">रद्द गर्नुहोस्</button>
                            <button type="submit" class="btn btn-gold">💾 सुरक्षित गर्नुहोस्</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    savePrize: function(e, id) {
        e.preventDefault();
        const data = {
            title_ne: document.getElementById('prize-title').value.trim(),
            amount: document.getElementById('prize-amount').value.trim(),
            description_ne: document.getElementById('prize-desc').value.trim()
        };
        if (id) data.id = id;

        window.db.savePrize(data);
        window.closeActiveModals();
        window.showToast(id ? 'पुरस्कार सम्पादन गरियो!' : 'नयाँ पुरस्कार सफलतापूर्वक थपियो!');
        this.renderPrizesTable();
    },

    deletePrize: function(id) {
        if (confirm('के तपाईं निश्चित रूपमा यो पुरस्कार मेटाउन चाहनुहुन्छ?')) {
            window.db.deletePrize(id);
            window.showToast('पुरस्कार सफलतापूर्वक मेटाइयो!');
            this.renderPrizesTable();
        }
    },

    // --- Notices CRUD Actions ---
    renderNoticesTable: function() {
        const tbody = document.getElementById('admin-notices-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const notices = window.db.getNotices();

        if (notices.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 2rem; color: var(--text-muted);">कुनै सूचना प्रकाशित छैन।</td></tr>`;
            return;
        }

        notices.forEach(n => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--primary);">${n.title_ne}</td>
                <td>${n.content_ne || ''}</td>
                <td><span class="role-badge ${n.is_ticker ? 'success' : ''}">${n.is_ticker ? 'सक्रिय (Ticker)' : 'सामान्य'}</span></td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteNotice('${n.id}')">🗑️ मेट्नुहोस्</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    openNoticeModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) window.closeActiveModals(); };

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">नयाँ सूचना थप्नुहोस्</h3>
                    <button class="modal-close" onclick="window.closeActiveModals()">×</button>
                </div>
                <div class="modal-body">
                    <form id="admin-notice-form" onsubmit="window.adminPanel.saveNotice(event)">
                        <div class="form-group">
                            <label class="form-label">शीर्षक (Notice Title):</label>
                            <input type="text" id="notice-title" class="form-control" required placeholder="सूचनाको मुख्य विषय लेख्नुहोस्">
                        </div>
                        <div class="form-group">
                            <label class="form-label">पूर्ण विवरण (Details):</label>
                            <textarea id="notice-content" class="form-control" rows="3" placeholder="सूचनाको विवरण लेख्नुहोस्..."></textarea>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem;">
                            <input type="checkbox" id="notice-ticker" style="width: 18px; height: 18px; cursor: pointer;">
                            <label for="notice-ticker" style="font-weight: 600; cursor: pointer;">स्क्रोलिङ लाइभ टिकर (Live Announcement Ticker) मा देखाउनुहोस्</label>
                        </div>
                        <div class="modal-footer" style="padding: 1.5rem 0 0 0; background: transparent; border-top: none;">
                            <button type="button" class="btn btn-outline" onclick="window.closeActiveModals()">रद्द गर्नुहोस्</button>
                            <button type="submit" class="btn btn-primary">📢 प्रकाशित गर्नुहोस्</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    saveNotice: function(e) {
        e.preventDefault();
        const data = {
            title_ne: document.getElementById('notice-title').value.trim(),
            content_ne: document.getElementById('notice-content').value.trim(),
            is_ticker: document.getElementById('notice-ticker').checked
        };
        window.db.saveNotice(data);
        window.closeActiveModals();
        window.showToast('सूचना सफलतापूर्वक प्रकाशित गरियो!');
        this.renderNoticesTable();
    },

    deleteNotice: function(id) {
        if (confirm('के तपाईं निश्चित रूपमा यो सूचना मेटाउन चाहनुहुन्छ?')) {
            window.db.deleteNotice(id);
            window.showToast('सूचना सफलतापूर्वक मेटाइयो!');
            this.renderNoticesTable();
        }
    },

    // --- Materials CRUD Actions ---
    renderMaterialsTable: function() {
        const tbody = document.getElementById('admin-materials-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const materials = window.db.getMaterials();

        if (materials.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 2rem; color: var(--text-muted);">कुनै डाउनलोड सामग्री थपिएको छैन।</td></tr>`;
            return;
        }

        materials.forEach(m => {
            const isFS = m.file_url && m.file_url.startsWith('filestore://');
            const fsKey = isFS ? m.file_url.slice('filestore://'.length) : '';
            const isExternal = m.file_type === 'Link';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--primary);">${m.title_ne}</td>
                <td><span class="role-badge" style="background: var(--primary); color: white; border: none;">${m.file_type}</span></td>
                <td>${m.file_size}</td>
                <td style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                    ${isExternal
                        ? `<a href="${m.file_url}" target="_blank" class="btn btn-outline btn-sm">🔗 खोल्नुहोस्</a>`
                        : isFS
                            ? `<a data-fs-key="${fsKey}" download="${m.title_ne}" class="btn btn-outline btn-sm" onclick="window.adminPanel.handleFsDownload(event,'${fsKey}','${m.title_ne}.${m.file_type.toLowerCase()}')">⬇️ डाउनलोड</a>`
                            : `<a href="${m.file_url}" download="${m.title_ne}" class="btn btn-outline btn-sm">⬇️ डाउनलोड</a>`
                    }
                    <button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteMaterial('${m.id}')">🗑️ मेट्नुहोस्</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    handleFsDownload: function(e, fsKey, filename) {
        e.preventDefault();
        window.FileStore.get(fsKey).then(data => {
            if (!data) { window.showToast('फाइल फेला परेन!', 'danger'); return; }
            const a = document.createElement('a');
            a.href = data;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    },

    openMaterialModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) window.closeActiveModals(); };

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">नयाँ डाउनलोड फाइल थप्नुहोस् (Upload File)</h3>
                    <button class="modal-close" onclick="window.closeActiveModals()">×</button>
                </div>
                <div class="modal-body">
                    <form id="admin-material-form">
                        <div class="form-group">
                            <label class="form-label">सामग्री अपलोड गर्नुहोस् (Choose File):</label>
                            <input type="file" id="material-file-upload" class="form-control" style="padding: 0.5rem;" required>
                            <small style="color: var(--text-muted); display: block; margin-top: 0.25rem;">Note: For very large files, please share a Google Drive link below instead.</small>
                        </div>
                        
                        <div style="text-align: center; margin: 1rem 0; color: var(--text-muted); font-weight: bold;">- OR -</div>
                        
                        <div class="form-group">
                            <label class="form-label">बाह्य लिङ्क (External URL / Google Drive):</label>
                            <input type="url" id="material-url" class="form-control" placeholder="उदा: https://drive.google.com/...">
                        </div>

                        <div class="form-group" style="margin-top: 1rem;">
                            <label class="form-label">सामग्रीको नाम (File Title):</label>
                            <input type="text" id="material-title" class="form-control" required placeholder="उदा: प्रतियोगिता समय तालिका र नियम PDF">
                        </div>
                        
                        <input type="hidden" id="material-size" value="">
                        <input type="hidden" id="material-type" value="">
                        
                        <div class="modal-footer" style="padding: 1.5rem 0 0 0; background: transparent; border-top: none;">
                            <button type="button" class="btn btn-outline" onclick="window.closeActiveModals()">रद्द गर्नुहोस्</button>
                            <button type="submit" class="btn btn-primary" id="material-submit-btn">📁 सुरक्षित गर्नुहोस्</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const form = document.getElementById('admin-material-form');
        const fileInput = document.getElementById('material-file-upload');
        const urlInput = document.getElementById('material-url');
        const titleInput = document.getElementById('material-title');
        const submitBtn = document.getElementById('material-submit-btn');

        // Auto-fill title from filename
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                if (!titleInput.value) {
                    // remove extension for title
                    titleInput.value = file.name.split('.').slice(0, -1).join('.');
                }
                urlInput.value = ''; // clear URL if file is selected
            }
        });

        // Clear file if URL is typed
        urlInput.addEventListener('input', (e) => {
            if (e.target.value.trim() !== '') {
                fileInput.value = '';
                fileInput.removeAttribute('required');
            } else {
                fileInput.setAttribute('required', 'true');
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = titleInput.value.trim();
            const urlVal = urlInput.value.trim();

            if (urlVal !== '') {
                // Save external URL directly (no file storage needed)
                window.adminPanel.saveMaterialData({
                    title_ne: title,
                    file_type: 'Link',
                    file_size: 'External',
                    file_url: window.convertGoogleDriveUrl(urlVal)
                });
            } else if (fileInput.files.length > 0) {
                // Process File Upload via FileReader → IndexedDB (no size limit!)
                const file = fileInput.files[0];

                submitBtn.textContent = 'अपलोड हुँदैछ...';
                submitBtn.disabled = true;

                // calculate friendly size
                let friendlySize = (file.size / 1024).toFixed(1) + ' KB';
                if (file.size > 1024 * 1024) friendlySize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

                // simple type inference
                let ext = file.name.split('.').pop().toUpperCase();
                if (ext.length > 5) ext = 'FILE';

                const reader = new FileReader();
                reader.onload = (ev) => {
                    const base64String = ev.target.result;
                    const materialId = 'm_' + Date.now();
                    const fsKey = 'material_' + materialId;

                    window.FileStore.put(fsKey, base64String)
                        .then(() => {
                            window.adminPanel.saveMaterialData({
                                id: materialId,
                                title_ne: title,
                                file_type: ext,
                                file_size: friendlySize,
                                file_url: 'filestore://' + fsKey
                            });
                        })
                        .catch(err => {
                            console.error('Material FileStore error:', err);
                            submitBtn.textContent = '📁 सुरक्षित गर्नुहोस्';
                            submitBtn.disabled = false;
                            window.showToast('फाइल सुरक्षित गर्न समस्या भयो!', 'danger');
                        });
                };
                reader.onerror = () => {
                    submitBtn.textContent = '📁 सुरक्षित गर्नुहोस्';
                    submitBtn.disabled = false;
                    window.showToast('फाइल पढ्न समस्या भयो!', 'danger');
                };
                reader.readAsDataURL(file);
            } else {
                window.showToast('कृपया फाइल छान्नुहोस् वा लिङ्क टाइप गर्नुहोस्!', 'danger');
            }
        });
    },

    saveMaterialData: function(data) {
        window.db.saveMaterial(data);
        window.closeActiveModals();
        window.showToast('फाइल सफलतापूर्वक अपलोड र सुरक्षित भयो!');
        this.renderMaterialsTable();
    },

    deleteMaterial: function(id) {
        if (confirm('के तपाईं निश्चित रूपमा यो फाइल मेटाउन चाहनुहुन्छ?')) {
            window.db.deleteMaterial(id);
            window.showToast('फाइल विवरण मेटाइयो!');
            this.renderMaterialsTable();
        }
    },

    // --- Settings & Backups Actions ---
    loadSettingsForm: function() {
        const settings = window.db.getSettings();
        
        document.getElementById('set-event-title').value = settings.title_ne;
        document.getElementById('set-event-subtitle').value = settings.subtitle_ne;
        
        // Convert ISO to local input datetime-local string
        const dateObj = new Date(settings.event_date);
        dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
        document.getElementById('set-event-date').value = dateObj.toISOString().slice(0, 16);
        
        document.getElementById('set-event-lock').checked = settings.lock_scores;

        // Load Auth Settings
        const auth = window.db.getAuthSettings();
        document.getElementById('set-admin-pass').value = auth.admin_pass || '';
        document.getElementById('set-admin-email').value = auth.admin_recovery_email || '';
        document.getElementById('set-judge-pass').value = auth.judge_pass || '';
        document.getElementById('set-judge-email').value = auth.judge_recovery_email || '';

        // Load Certificate Settings
        const cert = window.db.getCertificateSettings();
        document.getElementById('cert-theme-color').value = cert.theme_color || '#0a3064';

        const loadCertImg = (url, previewId) => {
            const preview = document.getElementById(previewId);
            if (!preview) return;
            if (!url) { preview.style.display = 'none'; preview.removeAttribute('src'); return; }
            window.resolveUrl(url).then(src => {
                if (src) {
                    preview.src = src;
                    preview.dataset.fsRef = url.startsWith('filestore://') ? url : '';
                    preview.style.display = 'block';
                } else {
                    preview.style.display = 'none';
                    preview.removeAttribute('src');
                }
            });
        };

        loadCertImg(cert.logo_url, 'cert-logo-preview');
        loadCertImg(cert.watermark_url, 'cert-watermark-preview');

        document.getElementById('cert-title-ne').value = cert.title_ne || '';
        document.getElementById('cert-title-en').value = cert.title_en || '';
        document.getElementById('cert-desc-ne').value = cert.description_ne || '';
        document.getElementById('cert-desc-en').value = cert.description_en || '';
        document.getElementById('cert-verse-ne').value = cert.verse_ne || '';
        document.getElementById('cert-verse-en').value = cert.verse_en || '';

        this.renderSignatoriesForm(cert.signatories || []);
    },

    renderSignatoriesForm: function(signatories) {
        const container = document.getElementById('admin-signatories-container');
        if (!container) return;
        container.innerHTML = '';
        signatories.forEach((sig, index) => {
            this.appendSignatoryHtml(sig, index);
        });
    },

    appendSignatoryHtml: function(sig, index) {
        const container = document.getElementById('admin-signatories-container');
        const div = document.createElement('div');
        div.className = 'signatory-block';
        div.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border: 1px solid var(--border); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem; position: relative;';

        div.innerHTML = `
            <button type="button" onclick="this.parentElement.remove()" style="position: absolute; top: 0.5rem; right: 0.5rem; background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: var(--danger);">×</button>
            <h4 style="grid-column: 1/-1; font-size: 0.95rem; color: var(--primary); margin-bottom: 0.25rem;">✍️ हस्ताक्षरकर्ता ${index + 1}</h4>
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">नाम (Name):</label>
                <input type="text" class="form-control sig-name" required value="${sig.name || ''}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">पद - नेपाली (Title NE):</label>
                <input type="text" class="form-control sig-title-ne" required value="${sig.title_ne || ''}">
            </div>
            <div class="form-group" style="margin-bottom: 0; grid-column: 1/-1;">
                <label class="form-label">Title - English (EN):</label>
                <input type="text" class="form-control sig-title-en" required value="${sig.title_en || ''}">
            </div>
            <div class="form-group" style="margin-bottom: 0; grid-column: 1/-1;">
                <label class="form-label">हस्ताक्षरको फोटो (Signature Image - Optional):</label>
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <input type="file" class="form-control sig-file" accept="image/*" onchange="window.adminPanel.previewSignature(this)">
                    <button type="button" class="btn btn-danger btn-sm" onclick="window.adminPanel.removeSignature(this)" title="Remove">🗑️</button>
                </div>
                <img class="sig-preview" style="display: none; max-height: 50px; margin-top: 0.5rem;" />
            </div>
        `;
        container.appendChild(div);

        // Load existing signature from FileStore if needed
        if (sig.signature_url) {
            const preview = div.querySelector('.sig-preview');
            window.resolveUrl(sig.signature_url).then(src => {
                if (src && preview) {
                    preview.src = src;
                    preview.dataset.fsRef = sig.signature_url.startsWith('filestore://') ? sig.signature_url : '';
                    preview.style.display = 'block';
                }
            });
        }
    },

    previewSignature: function(input) {
        const file = input.files[0];
        if (!file) return;
        
        const preview = input.closest('.form-group').querySelector('.sig-preview');
        if (preview) {
            preview.style.opacity = '0.5';
        }

        window.compressImage(file, { maxWidth: 300, maxHeight: 150, toPng: true })
            .then(base64 => {
                if (preview) {
                    preview.src = base64;
                    preview.style.display = 'block';
                    preview.style.opacity = '1';
                }
            })
            .catch(err => {
                console.error('Signature compression error:', err);
                window.showToast('हस्ताक्षर लोड गर्न समस्या भयो!', 'danger');
            });
    },

    previewCertImage: function(input, previewId) {
        const file = input.files[0];
        if (!file) return;
        
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.style.opacity = '0.5';
        }

        const isWatermark = previewId.includes('watermark');
        const maxWidth = isWatermark ? 800 : 300;
        const maxHeight = isWatermark ? 800 : 300;

        window.compressImage(file, { maxWidth: maxWidth, maxHeight: maxHeight, toPng: true })
            .then(base64 => {
                if (preview) {
                    preview.src = base64;
                    preview.style.display = 'block';
                    preview.style.opacity = '1';
                }
            })
            .catch(err => {
                console.error('Cert image compression error:', err);
                window.showToast('फोटो लोड गर्न समस्या भयो!', 'danger');
            });
    },

    removeCertImage: function(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (input) input.value = '';
        if (preview) {
            preview.removeAttribute('src');
            preview.style.display = 'none';
        }
    },

    removeSignature: function(btn) {
        const container = btn.closest('.form-group');
        const input = container.querySelector('.sig-file');
        const preview = container.querySelector('.sig-preview');
        if (input) input.value = '';
        if (preview) {
            preview.removeAttribute('src');
            preview.style.display = 'none';
        }
    },

    addSignatoryField: function() {
        const container = document.getElementById('admin-signatories-container');
        const index = container.children.length;
        this.appendSignatoryHtml({}, index);
    },

    saveCertificateSettingsForm: function(e) {
        e.preventDefault();

        const btn = e.target.querySelector('[type=submit]');
        if (btn) { btn.disabled = true; btn.textContent = 'सुरक्षित हुँदैछ...'; }

        const getImgData = (imgEl) => {
            if (!imgEl) return { src: '', isNew: false };
            const src = imgEl.src;
            // Blank / pointing to page itself
            if (!src || src === window.location.href || src.endsWith('/index.html') || src === '') {
                return { src: '', isNew: false };
            }
            // Already a filestore reference stored in a data attribute
            if (imgEl.dataset.fsRef) return { src: imgEl.dataset.fsRef, isNew: false };
            // New upload (base64)
            if (src.startsWith('data:')) return { src: src, isNew: true };
            // External URL
            return { src: src, isNew: false };
        };

        const logoPreview = document.getElementById('cert-logo-preview');
        const watermarkPreview = document.getElementById('cert-watermark-preview');
        const logoData = getImgData(logoPreview);
        const watermarkData = getImgData(watermarkPreview);

        // Collect signatory data
        const signatoryBlocks = document.querySelectorAll('#admin-signatories-container .signatory-block');
        const sigDataArr = [];
        signatoryBlocks.forEach((block, idx) => {
            const preview = block.querySelector('.sig-preview');
            const sigData = getImgData(preview);
            sigDataArr.push({
                idx,
                name: block.querySelector('.sig-name').value.trim(),
                title_ne: block.querySelector('.sig-title-ne').value.trim(),
                title_en: block.querySelector('.sig-title-en').value.trim(),
                sigData
            });
        });

        // Build list of FileStore save promises
        const saves = [];
        let logoUrl = logoData.isNew ? null : logoData.src;
        let watermarkUrl = watermarkData.isNew ? null : watermarkData.src;

        if (logoData.isNew) {
            const key = 'cert_logo';
            saves.push(window.FileStore.put(key, logoData.src).then(() => { logoUrl = 'filestore://' + key; }));
        }
        if (watermarkData.isNew) {
            const key = 'cert_watermark';
            saves.push(window.FileStore.put(key, watermarkData.src).then(() => { watermarkUrl = 'filestore://' + key; }));
        }

        const sigUrls = sigDataArr.map(s => s.sigData.isNew ? null : s.sigData.src);
        sigDataArr.forEach((s, i) => {
            if (s.sigData.isNew) {
                const key = 'cert_sig_' + (i + 1);
                saves.push(window.FileStore.put(key, s.sigData.src).then(() => { sigUrls[i] = 'filestore://' + key; }));
            }
        });

        Promise.all(saves).then(() => {
            const signatories = sigDataArr.map((s, i) => ({
                id: 'sig' + (s.idx + 1),
                name: s.name,
                title_ne: s.title_ne,
                title_en: s.title_en,
                signature_url: sigUrls[i] || ''
            }));

            const settings = {
                theme_color: document.getElementById('cert-theme-color').value,
                logo_url: logoUrl || '',
                watermark_url: watermarkUrl || '',
                title_ne: document.getElementById('cert-title-ne').value.trim(),
                title_en: document.getElementById('cert-title-en').value.trim(),
                description_ne: document.getElementById('cert-desc-ne').value.trim(),
                description_en: document.getElementById('cert-desc-en').value.trim(),
                verse_ne: document.getElementById('cert-verse-ne').value.trim(),
                verse_en: document.getElementById('cert-verse-en').value.trim(),
                signatories
            };

            window.db.saveCertificateSettings(settings);
            if (btn) { btn.disabled = false; btn.textContent = '💾 सुरक्षित गर्नुहोस्'; }
            window.showToast('प्रमाणपत्र सेटिङ सुरक्षित गरियो!');
            window.dispatchEvent(new Event('db_updated'));
        }).catch(err => {
            console.error('Certificate settings save error:', err);
            if (btn) { btn.disabled = false; btn.textContent = '💾 सुरक्षित गर्नुहोस्'; }
            window.showToast('सुरक्षित गर्न समस्या भयो! पुन: प्रयास गर्नुहोस्।', 'danger');
        });
    },

    saveSettingsForm: function(e) {
        e.preventDefault();
        
        const settings = {
            title_ne: document.getElementById('set-event-title').value.trim(),
            subtitle_ne: document.getElementById('set-event-subtitle').value.trim(),
            event_date: new Date(document.getElementById('set-event-date').value).toISOString(),
            lock_scores: document.getElementById('set-event-lock').checked
        };

        window.db.saveSettings(settings);
        window.showToast('सेटिङ सुरक्षित गरियो!');
        
        // Notify other components to refresh
        window.dispatchEvent(new Event('db_updated'));
    },

    saveAuthSettingsForm: function(e) {
        e.preventDefault();
        
        const auth = {
            admin_pass: document.getElementById('set-admin-pass').value.trim(),
            admin_recovery_email: document.getElementById('set-admin-email').value.trim(),
            judge_pass: document.getElementById('set-judge-pass').value.trim(),
            judge_recovery_email: document.getElementById('set-judge-email').value.trim()
        };

        window.db.saveAuthSettings(auth);
        window.showToast('पासवर्ड सेटिङ सुरक्षित गरियो!');
    },

    // Export / Import
    triggerBackupDownload: function() {
        const jsonStr = window.db.exportBackup();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `igniter_bible_contest_backup_${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        window.showToast('डाटा ब्याकअप JSON फाइल डाउनलोड भयो!');
    },

    downloadBackup: function() {
        this.triggerBackupDownload();
    },

    triggerRestore: function(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const success = window.db.importBackup(e.target.result);
            if (success) {
                window.showToast('प्रणाली ब्याकअप सफलतापूर्वक पुनर्स्थापित (Restored) भयो!');
                window.dispatchEvent(new Event('db_updated'));
                this.renderSubTab('settings');
            } else {
                window.showToast('अवैध ब्याकअप फाइल संरचना!', 'danger');
            }
        };
        reader.readAsText(file);
        input.value = ''; // reset file input
    },

    triggerResetDb: function() {
        if (confirm('⚠️ चेतावनी: के तपाईं प्रणालीलाई फ्याक्ट्री रिसेट गर्न चाहनुहुन्छ? सम्पूर्ण सहभागी र नयाँ अंकहरू मेटिनेछन् र मूल सीड डाटा लोड हुनेछ।')) {
            window.db.reset();
            window.showToast('प्रणाली सफलतापूर्वक रिसेट भयो!');
            window.dispatchEvent(new Event('db_updated'));
            this.renderSubTab('settings');
        }
    },

    // --- Gallery CRUD Actions ---
    renderGalleryTable: function() {
        const tbody = document.getElementById('admin-gallery-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const gallery = window.db.getGallery();
        if (gallery.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 2rem; color: var(--text-muted);">कुनै फोटो थपिएको छैन।</td></tr>`;
            return;
        }
        gallery.sort((a,b) => (a.order || 0) - (b.order || 0)).forEach(g => {
            const isFS = g.image_url && g.image_url.startsWith('filestore://');
            const fsKey = isFS ? g.image_url.slice('filestore://'.length) : '';
            const imgSrc = isFS ? '' : (g.image_url || '');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img ${isFS ? `data-fs-key="${fsKey}"` : `src="${imgSrc}"`} style="width:80px;height:50px;object-fit:cover;border-radius:4px;background:#eee;"></td>
                <td style="font-weight: 700;">${g.title_ne}</td>
                <td>${g.order || 0}</td>
                <td><button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteGallery('${g.id}')">🗑️ मेट्नुहोस्</button></td>
            `;
            tbody.appendChild(tr);
        });
        window.hydrateImages(tbody);
    },

    openGalleryModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) window.closeActiveModals(); };
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 480px;">
                <div class="modal-header">
                    <h3 class="modal-title">नयाँ फोटो थप्नुहोस् (Gallery)</h3>
                    <button class="modal-close" onclick="window.closeActiveModals()">×</button>
                </div>
                <div class="modal-body">
                    <form id="admin-gallery-form">
                        <div class="form-group">
                            <label class="form-label">📷 फोटोको लिङ्क (Image URL / Google Drive Link):</label>
                            <input type="url" id="gallery-image-url" class="form-control" placeholder="उदा: https://drive.google.com/file/d/.../view">
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">(यो लिङ्क राखेमा तलको फाइल छान्नुपर्दैन। यो स्थायी र सुरक्षित तरिका हो।)</p>
                        </div>
                        <div style="text-align: center; margin: 1rem 0; color: var(--text-muted); font-weight: bold;">-- वा (OR) --</div>
                        <div class="form-group">
                            <label class="form-label">फोटो अपलोड गर्नुहोस् (Choose File from device):</label>
                            <input type="file" id="gallery-file-input" class="form-control" accept="image/*" style="padding: 0.5rem;">
                        </div>
                        <div style="text-align: center; margin-top: 0.75rem;">
                            <img id="gallery-photo-preview" src="" style="display: none; max-height: 180px; max-width: 100%; border-radius: 8px; object-fit: cover; border: 2px solid var(--gold);">
                        </div>
                        <div class="form-group" style="margin-top: 1rem;">
                            <label class="form-label">क्याप्सन (Caption / Title):</label>
                            <input type="text" id="gallery-title" class="form-control" required placeholder="उदा: प्रतियोगिता २०२५ को सम्झना">
                        </div>
                        <div class="form-group">
                            <label class="form-label">देखाउने क्रम (Display Order):</label>
                            <input type="number" id="gallery-order" class="form-control" value="1" required>
                        </div>
                        <div class="modal-footer" style="padding: 1.5rem 0 0 0; background: transparent; border-top: none;">
                            <button type="button" class="btn btn-outline" onclick="window.closeActiveModals()">रद्द गर्नुहोस्</button>
                            <button type="submit" class="btn btn-primary">📁 सुरक्षित गर्नुहोस्</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // File input preview using FileReader
        const fileInput = document.getElementById('gallery-file-input');
        const preview = document.getElementById('gallery-photo-preview');
        fileInput.addEventListener('change', function() {
            if (fileInput.files && fileInput.files[0]) {
                preview.style.opacity = '0.5';
                window.compressImage(fileInput.files[0], { maxWidth: 800, maxHeight: 800, quality: 0.6 })
                    .then(base64 => {
                        preview.src = base64;
                        preview.dataset.base64 = base64;
                        preview.style.display = 'block';
                        preview.style.opacity = '1';
                    })
                    .catch(err => {
                        console.error('Gallery image compression error:', err);
                        window.showToast('फोटो लोड गर्न समस्या भयो!', 'danger');
                    });
            }
        });

        // Form submit
        document.getElementById('admin-gallery-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('gallery-title').value.trim();
            const order = parseInt(document.getElementById('gallery-order').value) || 1;
            let externalUrl = document.getElementById('gallery-image-url').value.trim();
            const base64 = preview.dataset.base64;
            const submitBtn = e.target.querySelector('[type=submit]');
            
            if (externalUrl) {
                // Use external URL directly (convert Google Drive link if applicable)
                externalUrl = window.convertGoogleDriveUrl ? window.convertGoogleDriveUrl(externalUrl) : externalUrl;
                window.db.saveGalleryPhoto({
                    id: 'g_' + Date.now(),
                    title_ne: title,
                    image_url: externalUrl,
                    order: order
                });
                window.closeActiveModals();
                window.showToast('फोटो सफलतापूर्वक थपियो!');
                window.adminPanel.renderGalleryTable();
                return;
            }

            if (!base64) {
                window.showToast('कृपया लिङ्क राख्नुहोस् वा फोटो छान्नुहोस्!', 'danger');
                return;
            }
            
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'अपलोड हुँदैछ...'; }

            const photoId = 'g_' + Date.now();
            const fsKey = 'gallery_' + photoId;
            window.FileStore.put(fsKey, base64)
                .then(() => {
                    window.db.saveGalleryPhoto({
                        id: photoId,
                        title_ne: title,
                        image_url: 'filestore://' + fsKey,
                        order: order
                    });
                    window.closeActiveModals();
                    window.showToast('फोटो सफलतापूर्वक अपलोड भयो!');
                    window.adminPanel.renderGalleryTable();
                })
                .catch(err => {
                    console.error('Gallery FileStore error:', err);
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '📁 सुरक्षित गर्नुहोस्'; }
                    window.showToast('फोटो सुरक्षित गर्न समस्या भयो!', 'danger');
                });
        });
    },

    deleteGallery: function(id) {
        if (confirm('के तपाईं निश्चित रूपमा यो फोटो मेटाउन चाहनुहुन्छ?')) {
            window.db.deleteGalleryPhoto(id);
            window.showToast('फोटो मेटाइयो!');
            this.renderGalleryTable();
        }
    },

    // --- Team CRUD Actions ---
    renderTeamTable: function() {
        const tbody = document.getElementById('admin-team-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const team = window.db.getTeamMembers();
        if (team.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 2rem; color: var(--text-muted);">कुनै सदस्य थपिएको छैन।</td></tr>`;
            return;
        }
        team.sort((a,b) => (a.order || 0) - (b.order || 0)).forEach(t => {
            const isFS = t.photo_url && t.photo_url.startsWith('filestore://');
            const fsKey = isFS ? t.photo_url.slice('filestore://'.length) : '';
            const imgSrc = isFS ? '' : (t.photo_url || 'https://via.placeholder.com/50?text=👤');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img ${isFS ? `data-fs-key="${fsKey}"` : `src="${imgSrc}"`} style="width:50px;height:50px;border-radius:50%;object-fit:cover;background:#eee;"></td>
                <td style="font-weight: 700;">${t.name}</td>
                <td>${t.role}</td>
                <td><button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteTeam('${t.id}')">🗑️ मेट्नुहោस्</button></td>
            `;
            tbody.appendChild(tr);
        });
        window.hydrateImages(tbody);
    },

    openTeamModal: function() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) window.closeActiveModals(); };
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h3 class="modal-title">नयाँ सदस्य थप्नुहोस् (Our Team)</h3>
                    <button class="modal-close" onclick="window.closeActiveModals()">×</button>
                </div>
                <div class="modal-body">
                    <form id="admin-team-form">
                        <div class="form-group">
                            <label class="form-label">सदस्यको नाम (Name):</label>
                            <input type="text" id="team-name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">भूमिका (Role):</label>
                            <input type="text" id="team-role" class="form-control" required>
                        </div>
                        <div class="form-group" style="margin-top: 1rem;">
                            <label class="form-label">📷 फोटोको लिङ्क (Image URL / Google Drive Link):</label>
                            <input type="url" id="team-image-url" class="form-control" placeholder="उदा: https://drive.google.com/file/d/.../view">
                        </div>
                        <div style="text-align: center; margin: 1rem 0; color: var(--text-muted); font-weight: bold;">-- वा (OR) --</div>
                        <div class="form-group">
                            <label class="form-label">फोटो अपलोड गर्नुहोस् (Choose File from device):</label>
                            <input type="file" id="team-file-input" class="form-control" accept="image/*" style="padding: 0.5rem;">
                        </div>
                        <div style="text-align: center; margin-top: 0.75rem;">
                            <img id="team-photo-preview" src="" style="display: none; width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--gold);">
                        </div>
                        <div class="form-group" style="margin-top: 1rem;">
                            <label class="form-label">देखाउने क्रम (Display Order):</label>
                            <input type="number" id="team-order" class="form-control" value="1" required>
                        </div>
                        <div class="modal-footer" style="padding: 1.5rem 0 0 0; background: transparent; border-top: none;">
                            <button type="button" class="btn btn-outline" onclick="window.closeActiveModals()">रद्द गर्नुहोस्</button>
                            <button type="submit" class="btn btn-primary">📁 सुरक्षित गर्नुहोस्</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // File input preview using FileReader
        const fileInput = document.getElementById('team-file-input');
        const preview = document.getElementById('team-photo-preview');
        fileInput.addEventListener('change', function() {
            if (fileInput.files && fileInput.files[0]) {
                preview.style.opacity = '0.5';
                window.compressImage(fileInput.files[0], { maxWidth: 300, maxHeight: 300, quality: 0.7 })
                    .then(base64 => {
                        preview.src = base64;
                        preview.dataset.base64 = base64;
                        preview.style.display = 'block';
                        preview.style.opacity = '1';
                    })
                    .catch(err => {
                        console.error('Team image compression error:', err);
                        window.showToast('फोटो लोड गर्न समस्या भयो!', 'danger');
                    });
            }
        });

        // Form submit
        document.getElementById('admin-team-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const base64 = preview.dataset.base64 || '';
            let externalUrl = document.getElementById('team-image-url').value.trim();
            const submitBtn = e.target.querySelector('[type=submit]');

            const memberData = {
                name: document.getElementById('team-name').value.trim(),
                role: document.getElementById('team-role').value.trim(),
                order: parseInt(document.getElementById('team-order').value) || 1
            };

            const doSave = (photoUrl) => {
                memberData.photo_url = photoUrl;
                window.db.saveTeamMember(memberData);
                window.closeActiveModals();
                window.showToast('टिम सदस्य सफलतापूर्वक अपलोड भयो!');
                window.adminPanel.renderTeamTable();
            };

            if (externalUrl) {
                externalUrl = window.convertGoogleDriveUrl ? window.convertGoogleDriveUrl(externalUrl) : externalUrl;
                doSave(externalUrl);
                return;
            }

            if (base64) {
                if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'अपलोड हुँदैछ...'; }
                const memberId = 't_' + Date.now();
                const fsKey = 'team_' + memberId;
                memberData.id = memberId;
                window.FileStore.put(fsKey, base64)
                    .then(() => doSave('filestore://' + fsKey))
                    .catch(err => {
                        console.error('Team FileStore error:', err);
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '📁 सुरक्षित गर्नुहोस्'; }
                        window.showToast('फोटो सुरक्षित गर्न समस्या भयो!', 'danger');
                    });
            } else {
                doSave('');
            }
        });
    },

    deleteTeam: function(id) {
        if (confirm('के तपाईं निश्चित रूपमा यो सदस्य मेटाउन चाहनुहुन्छ?')) {
            window.db.deleteTeamMember(id);
            window.showToast('सदस्य मेटाइयो!');
            this.renderTeamTable();
        }
    },

    // --- Contact Settings ---
    loadContactSettingsForm: function() {
        const settings = window.db.getContactSettings ? window.db.getContactSettings() : null;
        if (!settings) return;

        document.getElementById('cs-address').value = settings.address || '';
        document.getElementById('cs-phone').value = settings.phone || '';
        document.getElementById('cs-email').value = settings.email || '';
        document.getElementById('cs-map-url').value = settings.google_map_url || '';

        // Setup save listener once
        if (!this._contactSettingsBound) {
            document.getElementById('btn-save-contact-settings').addEventListener('click', () => {
                window.db.updateContactSettings({
                    address: document.getElementById('cs-address').value.trim(),
                    phone: document.getElementById('cs-phone').value.trim(),
                    email: document.getElementById('cs-email').value.trim(),
                    google_map_url: document.getElementById('cs-map-url').value.trim()
                });
                window.showToast('सम्पर्क विवरण सुरक्षित भयो!', 'success');
            });
            this._contactSettingsBound = true;
        }
    },

    // --- Inbox Messages ---
    renderMessagesTable: function() {
        const tbody = document.getElementById('admin-messages-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        const messages = window.db.getMessages ? window.db.getMessages() : [];
        
        if (messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">इनबक्स खाली छ।</td></tr>';
            return;
        }

        messages.forEach(m => {
            const dateStr = new Date(m.created_at).toLocaleString();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateStr}</td>
                <td><strong>${m.name}</strong></td>
                <td>${m.contact}</td>
                <td>${m.message}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteMessage('${m.id}')">🗑️ मेटाउनुहोस्</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    deleteMessage: function(id) {
        if (confirm('के तपाईं यो सन्देश मेटाउन निश्चित हुनुहुन्छ?')) {
            window.db.deleteMessage(id);
            window.showToast('सन्देश मेटाइयो!');
            this.renderMessagesTable();
        }
    }
};
