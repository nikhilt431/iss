/**
 * Igniter Team - Bible Memorization Competition Judge Panel
 * Dedicated score evaluation system for judges with offline capabilities
 */

window.judgePanel = {
    init: function() {
        this.renderParticipantsList();
        
        // Register sync trigger
        window.addEventListener('online', () => this.syncOfflineDrafts());
        this.syncOfflineDrafts(); // Trigger check initially
    },

    renderParticipantsList: function() {
        const container = document.getElementById('judge-participants-list');
        if (!container) return;
        container.innerHTML = '';

        // Show active round name
        const activeRound = window.db.getActiveRound();
        const roundBadge = document.getElementById('judge-active-round-badge');
        if (roundBadge) {
            roundBadge.textContent = '🏆 सक्रिय चरण: ' + activeRound.name;
        }

        const filterVal = document.getElementById('judge-status-filter').value;
        const participants = window.db.getParticipants();
        const ranked = window.db.getRankedParticipants();
        const activeRoundId = activeRound.id;

        const filtered = participants.filter(p => {
            const rankedP = ranked.find(r => r.id === p.id);
            const isEvaluated = rankedP && rankedP.evaluated;
            const isEliminated = !!p.eliminated;

            // Check if participant has scores in the ACTIVE round
            const activeRoundScores = window.db.getParticipantScores(p.id).filter(s => (s.round_id || 'r1') === activeRoundId);
            const hasActiveRoundScores = activeRoundScores.length > 0;

            if (filterVal === 'passed') return !isEliminated;
            if (filterVal === 'eliminated') return isEliminated;
            if (filterVal === 'pending') {
                if (isEliminated) return false;
                return !hasActiveRoundScores;
            }
            if (filterVal === 'evaluated') {
                if (isEliminated) return false;
                return hasActiveRoundScores;
            }
            // 'all' — show everyone including eliminated
            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">कुनै सहभागी फेला परेन।</div>';
            return;
        }

        filtered.forEach(p => {
            const isEliminated = !!p.eliminated;
            const activeRoundScores = window.db.getParticipantScores(p.id).filter(s => (s.round_id || 'r1') === activeRoundId);
            const hasActiveRoundScores = activeRoundScores.length > 0;
            const scoreObj = ranked.find(r => r.id === p.id);
            const roundScore = scoreObj && scoreObj.round_scores ? (scoreObj.round_scores[activeRoundId] || 0) : 0;
            const photoUrl = p.photo_url || 'https://via.placeholder.com/60?text=सहभागी';
            const illaka = window.db.getIllakaById(p.illaka_id);

            const el = document.createElement('div');
            el.className = 'card';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'space-between';
            el.style.padding = '1rem';
            el.style.marginBottom = '0.75rem';

            if (isEliminated) {
                el.style.borderLeft = '5px solid var(--danger)';
                el.style.opacity = '0.65';
            } else if (hasActiveRoundScores) {
                el.style.borderLeft = '5px solid var(--success)';
            } else {
                el.style.borderLeft = '5px solid var(--warning)';
            }

            let statusBadge = '';
            if (isEliminated) {
                statusBadge = '<span class="role-badge danger">बाहिरिएको (Eliminated)</span>';
            } else if (hasActiveRoundScores) {
                statusBadge = `<span class="role-badge success">${roundScore} अंक (यो चरण)</span>`;
            } else {
                statusBadge = '<span class="role-badge warning">मूल्यांकन बाँकी</span>';
            }

            el.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img class="avatar-ring" src="${photoUrl}" alt="${p.name_ne}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%230a3064%22/><text x=%2250%22 y=%2255%22 font-family=%22sans-serif%22 font-size=%2235%22 fill=%22white%22 text-anchor=%22middle%22>${p.name_ne[0]}</text></svg>'">
                    <div>
                        <h4 style="font-size: 1.05rem; margin-bottom: 0.15rem;">${p.name_ne}</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted);">${p.church_name} | <b>${illaka ? illaka.name_ne : ''}</b></p>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1rem;">
                    ${statusBadge}
                    ${isEliminated ? '' : `<button class="btn btn-primary btn-sm" onclick="window.judgePanel.openScoringModal('${p.id}')">📝 अंक चढाउनुहोस्</button>`}
                </div>
            `;
            container.appendChild(el);
        });
    },

    openScoringModal: function(participantId) {
        const p = window.db.getParticipantById(participantId);
        if (!p) return;

        const categories = window.db.getScoreCategories();
        const judgeName = window.currentUser.name;
        const activeRound = window.db.getActiveRound();
        const activeRoundId = activeRound.id;
        // Only load scores for the current judge AND the active round
        const existingScores = window.db.getParticipantScores(participantId).filter(
            s => s.judge_name === judgeName && (s.round_id || 'r1') === activeRoundId
        );

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) window.closeActiveModals(); };

        let inputsHtml = categories.map(c => {
            const existing = existingScores.find(s => s.category_id === c.id);
            const val = existing ? existing.marks_obtained : 0;
            return `
                <div class="score-input-group" style="background: var(--bg-main); padding: 1.25rem; border: 1px solid var(--border); border-radius: var(--radius-md); margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <div>
                            <div style="font-weight: 700; color: var(--text-heading); font-size: 1.05rem;">${c.name_ne}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">पूर्णांक (Max): ${c.max_marks}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="number" class="form-control text-center score-number-input" 
                                   id="num-input-${c.id}" 
                                   min="0" max="${c.max_marks}" step="0.5" 
                                   value="${val}" 
                                   style="width: 80px; font-weight: 800; font-size: 1.2rem; color: var(--gold); padding: 0.25rem;"
                                   oninput="document.getElementById('slide-input-${c.id}').value = this.value; window.judgePanel.validateAndCalculate('${c.id}', ${c.max_marks});">
                            <span style="font-size: 1.1rem; color: var(--text-muted); font-weight: 600;">/ ${c.max_marks}</span>
                        </div>
                    </div>
                    <input type="range" class="slider-control" style="width: 100%;"
                           id="slide-input-${c.id}" 
                           min="0" max="${c.max_marks}" step="0.5" 
                           value="${val}" 
                           oninput="document.getElementById('num-input-${c.id}').value = this.value; window.judgePanel.validateAndCalculate('${c.id}', ${c.max_marks});">
                </div>
            `;
        }).join('');

        const comment = existingScores.length > 0 ? (existingScores[0].comments || '') : '';

        modal.innerHTML = `
            <div class="modal-content modal-content-lg" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 class="modal-title">मूल्यांकन फारम: ${p.name_ne}</h3>
                    <button class="modal-close" onclick="window.closeActiveModals()">×</button>
                </div>
                <div class="modal-body">
                    <div style="background: var(--bg-main); border: 1px solid var(--border); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <div>
                                <span style="font-size: 0.8rem; color: var(--text-muted);">प्रतियोगी:</span>
                                <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-heading);">${p.name_ne}</div>
                            </div>
                            <div>
                                <span style="font-size: 0.8rem; color: var(--text-muted);">मण्डली:</span>
                                <div style="font-weight: 700;">${p.church_name}</div>
                            </div>
                        </div>
                        <div style="background: var(--gold); color: #000; padding: 0.4rem 0.75rem; border-radius: var(--radius-sm); font-weight: 800; text-align: center; font-size: 0.95rem;">
                            🏆 ${activeRound.name}
                        </div>
                    </div>
                    
                    <form id="scoring-form" onsubmit="window.judgePanel.submitScores(event, '${p.id}')">
                        <h4 style="margin-bottom: 1rem; color: var(--text-heading); border-bottom: 1px solid var(--border); padding-bottom: 0.25rem;">श्रेणीगत अंक प्रविष्टि:</h4>
                        
                        ${inputsHtml}
                        
                        <div class="form-group" style="margin-top: 1.5rem;">
                            <label class="form-label">विशेष टिप्पणी/सुझाव (Comments):</label>
                            <textarea class="form-control" id="judge-comments" rows="3" placeholder="प्रतियोगीको प्रदर्शनबारे मुख्य कुराहरू लेख्नुहोस्...">${comment}</textarea>
                        </div>
                        
                        <div style="background: var(--primary); color: #fff; padding: 1rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
                            <span style="font-weight: 700; font-size: 1.1rem;">कुल लाइभ जोड:</span>
                            <span style="font-weight: 900; font-size: 2rem; color: var(--gold); font-family: var(--font-heading);" id="scoring-total-sum">0.00</span>
                        </div>
                        
                        <div class="modal-footer" style="padding: 1.5rem 0 0 0; background: transparent; border-top: none;">
                            <button type="button" class="btn btn-outline" onclick="window.closeActiveModals()">रद्द गर्नुहोस्</button>
                            <button type="submit" class="btn btn-gold">💾 अंक सुरक्षित गर्नुहोस्</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Trigger initial calculation
        this.calculateTotalSum();
    },

    validateAndCalculate: function(categoryId, maxMarks) {
        const numInput = document.getElementById(`num-input-${categoryId}`);
        if (!numInput) return;
        
        let val = parseFloat(numInput.value);
        if (val > maxMarks) {
            numInput.value = maxMarks;
            document.getElementById(`slide-input-${categoryId}`).value = maxMarks;
        }
        if (val < 0) {
            numInput.value = 0;
            document.getElementById(`slide-input-${categoryId}`).value = 0;
        }
        this.calculateTotalSum();
    },

    calculateTotalSum: function() {
        const categories = window.db.getScoreCategories();
        let total = 0;
        categories.forEach(c => {
            const input = document.getElementById(`num-input-${c.id}`);
            if (input && input.value) {
                total += parseFloat(input.value);
            }
        });
        const totalSumEl = document.getElementById('scoring-total-sum');
        if (totalSumEl) {
            totalSumEl.textContent = total.toFixed(2);
        }
    },

    submitScores: function(event, participantId) {
        event.preventDefault();
        
        const categories = window.db.getScoreCategories();
        const scoreEntries = [];
        
        categories.forEach(c => {
            const input = document.getElementById(`num-input-${c.id}`);
            if (input) {
                scoreEntries.push({
                    category_id: c.id,
                    marks_obtained: parseFloat(input.value)
                });
            }
        });

        const comments = document.getElementById('judge-comments').value.trim();
        if (scoreEntries.length > 0) {
            // Include comment in first entry for database mapping simplicity
            scoreEntries[0].comments = comments;
        }

        const judgeName = window.currentUser.name;

        // Check Online Connectivity Status
        if (!navigator.onLine) {
            this.saveOfflineDraft(participantId, scoreEntries, judgeName);
            window.closeActiveModals();
            this.renderParticipantsList();
            return;
        }

        try {
            window.db.saveParticipantScores(participantId, scoreEntries, judgeName);
            window.closeActiveModals();
            window.showToast('अंक सफलतापूर्वक सुरक्षित गरियो!');
            this.renderParticipantsList();
        } catch (e) {
            window.showToast(e.message, 'danger');
        }
    },

    // --- Offline Draft Sync System ---
    saveOfflineDraft: function(participantId, scoreEntries, judgeName) {
        let drafts = JSON.parse(localStorage.getItem('offline_scores_drafts')) || [];
        // Remove existing drafts for same participant/judge to prevent duplicates
        drafts = drafts.filter(d => !(d.participantId === participantId && d.judgeName === judgeName));
        
        drafts.push({
            id: Date.now(),
            participantId,
            scoreEntries,
            judgeName,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('offline_scores_drafts', JSON.stringify(drafts));
        window.showToast('निर्णायक अफलाइन हुनुहुन्छ! अंक स्थानीय ड्राफ्टमा सुरक्षित गरियो।', 'warning');
        
        this.updateOfflineBadgeCount();
    },

    syncOfflineDrafts: function() {
        if (!navigator.onLine) return;

        const drafts = JSON.parse(localStorage.getItem('offline_scores_drafts')) || [];
        if (drafts.length === 0) {
            this.updateOfflineBadgeCount();
            return;
        }

        let successCount = 0;
        drafts.forEach(d => {
            try {
                window.db.saveParticipantScores(d.participantId, d.scoreEntries, d.judgeName);
                successCount++;
            } catch (e) {
                console.error('Failed syncing offline draft:', e);
            }
        });

        // Clean draft storage after successfully flushing
        localStorage.removeItem('offline_scores_drafts');
        if (successCount > 0) {
            window.showToast(`${successCount} अफलाइन ड्राफ्टहरू लाइभ सर्भरसँग सिङ्क भए!`);
            this.renderParticipantsList();
        }
        this.updateOfflineBadgeCount();
    },

    updateOfflineBadgeCount: function() {
        const drafts = JSON.parse(localStorage.getItem('offline_scores_drafts')) || [];
        const btn = document.getElementById('offline-drafts-badge');
        if (!btn) return;

        if (drafts.length > 0) {
            btn.classList.remove('hidden');
            btn.textContent = `${drafts.length} सिङ्क बाँकी`;
        } else {
            btn.classList.add('hidden');
        }
    }
};

// Initialise change listeners for judge views
document.addEventListener('DOMContentLoaded', () => {
    const filterSelect = document.getElementById('judge-status-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            window.judgePanel.renderParticipantsList();
        });
    }
});
