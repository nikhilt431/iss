/**
 * Igniter Team - Bible Memorization Competition Admin Panel
 * Manages Illaka CRUD, Participant CRUD, Notices, Downloads, System settings and Backups
 */

// --- Google Drive URL Converter ---
// Converts any Google Drive sharing link to a direct embeddable image URL.
window.convertGoogleDriveUrl = function(url) {
    if (!url || url.trim() === '') return url;
    url = url.trim();

    // Already a direct uc?export link — leave as-is
    if (url.includes('drive.google.com/uc')) return url;

    // Pattern: /file/d/FILE_ID/view OR /file/d/FILE_ID/preview
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
        return 'https://drive.google.com/uc?export=view&id=' + fileMatch[1];
    }

    // Pattern: open?id=FILE_ID or id=FILE_ID anywhere
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
        return 'https://drive.google.com/uc?export=view&id=' + idMatch[1];
    }

    // Not a Google Drive link — return unchanged
    return url;
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
            const photoUrl = p.photo_url || 'https://via.placeholder.com/40?text=सहभागी';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img class="avatar-ring" src="${photoUrl}" alt="${p.name_ne}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%230a3064%22/><text x=%2250%22 y=%2255%22 font-family=%22sans-serif%22 font-size=%2235%22 fill=%22white%22 text-anchor=%22middle%22>${p.name_ne[0]}</text></svg>'">
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

        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('participant-photo-preview');
            if (preview) {
                preview.src = e.target.result;
                preview.dataset.base64 = e.target.result; // store base64 string
            }
        };
        reader.readAsDataURL(file);
    },

    saveParticipant: function(e, id) {
        e.preventDefault();
        
        const preview = document.getElementById('participant-photo-preview');
        const photoUrl = preview ? (preview.dataset.base64 || preview.src) : '';

        const data = {
            name_ne: document.getElementById('participant-name').value.trim(),
            church_name: document.getElementById('participant-church').value.trim(),
            illaka_id: document.getElementById('participant-illaka').value,
            age_group: document.getElementById('participant-age').value,
            photo_url: photoUrl.startsWith('http') ? '' : photoUrl // only save if upload exists
        };

        if (id) data.id = id;

        window.db.saveParticipant(data);
        window.closeActiveModals();
        window.showToast(id ? 'सहभागी विवरण सम्पादन गरियो!' : 'नयाँ सहभागी सफलतापूर्वक थपियो!');
        this.renderParticipantsTable();
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
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700; color: var(--primary);">${m.title_ne}</td>
                <td><span class="role-badge" style="background: var(--primary); color: white; border: none;">${m.file_type}</span></td>
                <td>${m.file_size}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteMaterial('${m.id}')">🗑️ मेट्नुहोस्</button>
                </td>
            `;
            tbody.appendChild(tr);
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
                // Save external URL directly
                window.adminPanel.saveMaterialData({
                    title_ne: title,
                    file_type: 'Link',
                    file_size: 'External',
                    file_url: urlVal
                });
            } else if (fileInput.files.length > 0) {
                // Process File Upload via FileReader (Base64)
                const file = fileInput.files[0];
                
                // Firestore doc limit is 1MB, let's limit file size to ~700KB for safety
                if (file.size > 700 * 1024) {
                    window.showToast('फाइल साइज धेरै ठूलो भयो! कृपया ७०० KB भन्दा सानो फाइल छान्नुहोस् वा Google Drive लिङ्क प्रयोग गर्नुहोस्।', 'danger');
                    return;
                }

                submitBtn.textContent = 'लोड हुँदैछ...';
                submitBtn.disabled = true;

                const reader = new FileReader();
                reader.onload = (ev) => {
                    const base64String = ev.target.result;
                    
                    // calculate friendly size
                    let friendlySize = (file.size / 1024).toFixed(1) + ' KB';
                    if (file.size > 1024 * 1024) friendlySize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
                    
                    // simple type inference
                    let ext = file.name.split('.').pop().toUpperCase();
                    if (ext.length > 4) ext = 'FILE';

                    window.adminPanel.saveMaterialData({
                        title_ne: title,
                        file_type: ext,
                        file_size: friendlySize,
                        file_url: base64String
                    });
                };
                reader.readAsDataURL(file);
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
        
        const logoPreview = document.getElementById('cert-logo-preview');
        if (cert.logo_url) {
            logoPreview.src = cert.logo_url;
            logoPreview.style.display = 'block';
        } else {
            logoPreview.style.display = 'none';
            logoPreview.removeAttribute('src');
        }

        const watermarkPreview = document.getElementById('cert-watermark-preview');
        if (cert.watermark_url) {
            watermarkPreview.src = cert.watermark_url;
            watermarkPreview.style.display = 'block';
        } else {
            watermarkPreview.style.display = 'none';
            watermarkPreview.removeAttribute('src');
        }

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
        
        const previewSrc = sig.signature_url || '';
        const previewDisplay = previewSrc ? 'block' : 'none';

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
                <img class="sig-preview" src="${previewSrc}" style="display: ${previewDisplay}; max-height: 50px; margin-top: 0.5rem;" />
            </div>
        `;
        container.appendChild(div);
    },

    previewSignature: function(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = input.parentElement.querySelector('.sig-preview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    },

    previewCertImage: function(input, previewId) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
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
        
        const signatories = [];
        document.querySelectorAll('#admin-signatories-container .signatory-block').forEach((block, idx) => {
            const preview = block.querySelector('.sig-preview');
            signatories.push({
                id: 'sig' + (idx + 1),
                name: block.querySelector('.sig-name').value.trim(),
                title_ne: block.querySelector('.sig-title-ne').value.trim(),
                title_en: block.querySelector('.sig-title-en').value.trim(),
                signature_url: preview ? preview.src : ''
            });
        });

        const logoPreview = document.getElementById('cert-logo-preview');
        const watermarkPreview = document.getElementById('cert-watermark-preview');

        const settings = {
            theme_color: document.getElementById('cert-theme-color').value,
            logo_url: logoPreview.src || '',
            watermark_url: watermarkPreview.src || '',
            title_ne: document.getElementById('cert-title-ne').value.trim(),
            title_en: document.getElementById('cert-title-en').value.trim(),
            description_ne: document.getElementById('cert-desc-ne').value.trim(),
            description_en: document.getElementById('cert-desc-en').value.trim(),
            verse_ne: document.getElementById('cert-verse-ne').value.trim(),
            verse_en: document.getElementById('cert-verse-en').value.trim(),
            signatories: signatories
        };

        window.db.saveCertificateSettings(settings);
        window.showToast('प्रमाणपत्र सेटिङ सुरक्षित गरियो!');
        window.dispatchEvent(new Event('db_updated'));
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
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${g.image_url}" style="width:80px;height:50px;object-fit:cover;border-radius:4px;"></td>
                <td style="font-weight: 700;">${g.title_ne}</td>
                <td>${g.order || 0}</td>
                <td><button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteGallery('${g.id}')">🗑️ मेट्नुहोस्</button></td>
            `;
            tbody.appendChild(tr);
        });
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
                            <label class="form-label">📷 फोटो अपलोड गर्नुहोस् (Choose Photo):</label>
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
                const reader = new FileReader();
                reader.onload = function(ev) {
                    preview.src = ev.target.result;
                    preview.dataset.base64 = ev.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(fileInput.files[0]);
            }
        });

        // Form submit
        document.getElementById('admin-gallery-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const base64 = preview.dataset.base64;
            if (!base64) {
                window.showToast('कृपया फोटो छान्नुहोस्!', 'danger');
                return;
            }
            window.db.saveGalleryPhoto({
                title_ne: document.getElementById('gallery-title').value.trim(),
                image_url: base64,
                order: parseInt(document.getElementById('gallery-order').value) || 1
            });
            window.closeActiveModals();
            window.showToast('फोटो सफलतापूर्वक अपलोड भयो!');
            window.adminPanel.renderGalleryTable();
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
            const photoUrl = t.photo_url || 'https://via.placeholder.com/50?text=👤';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${photoUrl}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;"></td>
                <td style="font-weight: 700;">${t.name}</td>
                <td>${t.role}</td>
                <td><button class="btn btn-danger btn-sm" onclick="window.adminPanel.deleteTeam('${t.id}')">🗑️ मेट्नुहोस्</button></td>
            `;
            tbody.appendChild(tr);
        });
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
                        <div class="form-group">
                            <label class="form-label">📷 फोटो अपलोड गर्नुहोस् (Choose Photo):</label>
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
                const reader = new FileReader();
                reader.onload = function(ev) {
                    preview.src = ev.target.result;
                    preview.dataset.base64 = ev.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(fileInput.files[0]);
            }
        });

        // Form submit
        document.getElementById('admin-team-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const base64 = preview.dataset.base64 || '';
            window.db.saveTeamMember({
                name: document.getElementById('team-name').value.trim(),
                role: document.getElementById('team-role').value.trim(),
                photo_url: base64,
                order: parseInt(document.getElementById('team-order').value) || 1
            });
            window.closeActiveModals();
            window.showToast('टिम सदस्य सफलतापूर्वक अपलोड भयो!');
            window.adminPanel.renderTeamTable();
        });
    },

    deleteTeam: function(id) {
        if (confirm('के तपाईं निश्चित रूपमा यो सदस्य मेटाउन चाहनुहुन्छ?')) {
            window.db.deleteTeamMember(id);
            window.showToast('सदस्य मेटाइयो!');
            this.renderTeamTable();
        }
    }
};
