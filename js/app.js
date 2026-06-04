/**
 * Igniter Team - Bible Memorization Competition Public View Controller
 * Manages SPA navigation, Widgets, Countdown, Search Filters, Notice Ticker & Theme Toggles
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Configuration
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark';
        themeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            showToast(theme === 'dark' ? 'डार्क मोड सक्रिय भयो' : 'लाइट मोड सक्रिय भयो');
        });
    }

    // 1.5. Bilingual i18n Translation Configuration
    const langSelect = document.getElementById('lang-select');
    const savedLang = localStorage.getItem('lang') || 'ne';
    localStorage.setItem('lang', savedLang);
    
    const TRANSLATIONS = {
        ne: {
            // Header tabs
            'nav-org-home': '🏠 गृहपृष्ठ',
            'nav-about': '📖 हाम्रो बारेमा (About Us)',
            'nav-tournament-group': '🏆 प्रतियोगिता ▾',
            'nav-home': 'ड्यासबोर्ड',
            'nav-live-score': 'लाइभ नतिजा',
            'nav-participants': 'सहभागीहरू',
            'nav-downloads': 'डाउनलोडहरू',
            'nav-notices': '🔔 समाचार',
            'nav-gallery': '🖼️ ग्यालरी',
            'nav-contact': '📞 सम्पर्क',
            'nav-judge': '📝 जज प्यानल',
            'nav-admin': '⚙️ एडमिन प्यानल',
            'nav-login': '🔑 लगइन',
            'logout-btn': '🚪 बाहिरिनुहोस्',
            
            // Countdown section
            'countdown-title': 'प्रतियोगिता सुरु हुन बाँकी समय',
            'home-event-title': 'बाइबल पद कण्ठस्थ प्रतियोगिता २०८३',
            'home-event-subtitle': 'इग्नाइटर टिम (Igniter Team)',
            
            // System roles
            'role-viewer': 'दर्शक (Viewer)',
            'role-judge': 'निर्णायक (Judge)',
            'role-admin': 'सुपर एडमिन'
        },
        en: {
            // Header tabs
            'nav-org-home': '🏠 Home',
            'nav-about': '📖 About Us',
            'nav-tournament-group': '🏆 Tournament ▾',
            'nav-home': 'Dashboard',
            'nav-live-score': 'Live Result',
            'nav-participants': 'Participants',
            'nav-downloads': 'Downloads',
            'nav-notices': '🔔 News',
            'nav-gallery': '🖼️ Gallery',
            'nav-contact': '📞 Contact',
            'nav-judge': '📝 Judge Panel',
            'nav-admin': '⚙️ Admin Panel',
            'nav-login': '🔑 Login',
            'logout-btn': '🚪 Logout',
            
            // Countdown section
            'countdown-title': 'Time Remaining Until Competition Starts',
            'home-event-title': 'Bible Reading Memorization Contest 2026',
            'home-event-subtitle': 'Igniter Team • Into the Way of Jesus Christ',
            
            // System roles
            'role-viewer': 'Viewer (दर्शक)',
            'role-judge': 'Judge (निर्णायक)',
            'role-admin': 'Super Admin'
        }
    };

    window.translateUI = function(lang) {
        const dict = TRANSLATIONS[lang] || TRANSLATIONS['ne'];
        
        // Translate direct ID mappings
        Object.keys(dict).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = dict[id];
        });

        // Toggle locale attributes
        document.documentElement.lang = lang;
        document.title = lang === 'en' ? 'Bible Memorization Contest - Igniter Team' : 'बाइबल पद कण्ठस्थ प्रतियोगिता - इग्नाइटर टिम';

        // Translate countdown boxes labels
        const labels = document.querySelectorAll('.countdown-label');
        if (labels.length >= 4) {
            labels[0].textContent = lang === 'en' ? 'Days' : 'दिन';
            labels[1].textContent = lang === 'en' ? 'Hours' : 'घण्टा';
            labels[2].textContent = lang === 'en' ? 'Minutes' : 'मिनेट';
            labels[3].textContent = lang === 'en' ? 'Seconds' : 'सेकेन्ड';
        }

        // Translate Stats Widgets
        const widgetTitles = document.querySelectorAll('.widget-title');
        const widgetDescs = document.querySelectorAll('.widget-desc');
        
        if (widgetTitles.length >= 3) {
            widgetTitles[0].textContent = lang === 'en' ? 'Total Participants' : 'कुल सहभागीहरू (Total Participants)';
            widgetTitles[1].textContent = lang === 'en' ? 'Total Regions (Illaka)' : 'सम्बद्ध इलाकाहरू (Total Regions)';
            widgetTitles[2].textContent = lang === 'en' ? 'Top Scorer Competitor' : 'सर्वोत्कृष्ट प्रतियोगी (Top Scorer)';
        }
        
        if (widgetDescs.length >= 3) {
            widgetDescs[0].textContent = lang === 'en' ? 'Competitors registered in the tournament' : 'प्रतियोगितामा दर्ता भएका जम्मा प्रतिस्पर्धी';
            widgetDescs[1].textContent = lang === 'en' ? '4 regions and newly added areas' : '४ इलाकाहरू र थप नयाँ क्षेत्रहरू';
            
            const ranked = window.db.getRankedParticipants();
            if (ranked.length === 0) {
                widgetDescs[2].textContent = lang === 'en' ? 'Not evaluated yet' : 'अझै मूल्याङ्कन भएको छैन';
            }
        }

        // Translate Section Titles (Dashboard Home)
        const top3LeaderTitle = document.getElementById('top-3-leaderboard')?.previousElementSibling;
        if (top3LeaderTitle) {
            top3LeaderTitle.textContent = lang === 'en' ? '🏆 Top 3 Leaderboard' : '🏆 शीर्ष ३ विजेताहरू (Top 3 Leaderboard)';
        }

        const recentNoticesTitle = document.getElementById('recent-notices-container')?.previousElementSibling;
        if (recentNoticesTitle) {
            recentNoticesTitle.textContent = lang === 'en' ? '📢 Recent Notices & Updates' : '📢 भर्खरैका सूचनाहरू (Recent Updates)';
        }

        // Translate Live Score Section
        const liveScoreHeader = document.querySelector('#section-live-score .action-row h2');
        if (liveScoreHeader) {
            liveScoreHeader.textContent = lang === 'en' ? 'Live Scoreboard & Ranks' : 'लाइभ स्कोरबोर्ड र श्रेणीकरण (Live Rankings)';
        }

        const btnExport = document.querySelector('#section-live-score .action-row button[onclick*="exportLiveScores"]');
        if (btnExport) {
            btnExport.textContent = lang === 'en' ? '📊 Export Excel/CSV' : '📊 Excel/CSV डाउनलोड';
        }

        const btnPrint = document.querySelector('#section-live-score .action-row button[onclick*="print"]');
        if (btnPrint) {
            btnPrint.textContent = lang === 'en' ? '🖨️ Print Results Table' : '🖨️ नतिजा प्रिन्ट गर्नुहोस्';
        }

        // Translate table headers
        const tableThs = document.querySelectorAll('#section-live-score table th');
        if (tableThs.length >= 7) {
            tableThs[0].textContent = lang === 'en' ? 'Rank (स्थान)' : 'स्थान (Rank)';
            tableThs[1].textContent = lang === 'en' ? 'Competitor Name' : 'सहभागीको नाम (Name)';
            tableThs[2].textContent = lang === 'en' ? 'Church' : 'मण्डली (Church)';
            tableThs[3].textContent = lang === 'en' ? 'Region (Illaka)' : 'इलाका (Area)';
            tableThs[4].textContent = lang === 'en' ? 'Score Categories Breakdown' : 'श्रेणीगत अंक (Score Categories Breakdown)';
            tableThs[5].textContent = lang === 'en' ? 'Total Marks' : 'कुल प्राप्त अंक (Total)';
            tableThs[6].textContent = lang === 'en' ? 'Action' : 'कार्य (Action)';
        }

        // Translate Search & Filters
        const searchInput = document.getElementById('p-search-input');
        if (searchInput) {
            searchInput.placeholder = lang === 'en' ? '🔍 Search competitor name or church...' : '🔍 सहभागीको नाम वा मण्डलीबाट खोज्नुहोस्...';
        }

        const illakaFilter = document.getElementById('p-filter-illaka');
        if (illakaFilter && illakaFilter.options.length > 0) {
            illakaFilter.options[0].textContent = lang === 'en' ? 'All Areas (सबै इलाकाहरू)' : 'सबै इलाकाहरू (All Areas)';
        }

        const pListHeader = document.querySelector('#section-participants .action-row h2');
        if (pListHeader) {
            pListHeader.textContent = lang === 'en' ? 'Participants Directory' : 'प्रतिस्पर्धी सूची (Participants Directory)';
        }

        // Translate Downloads Section
        const dlHeader = document.querySelector('#section-downloads h2');
        if (dlHeader) {
            dlHeader.textContent = lang === 'en' ? '📥 Instruction Guidelines & Downloads' : '📥 निर्देशिका र सामग्री डाउनलोड (Downloads Section)';
        }
        const dlDesc = document.querySelector('#section-downloads p');
        if (dlDesc) {
            dlDesc.textContent = lang === 'en' ? 'Download competition rules, Bible chapters study materials, and event schedules here.' : 'प्रतियोगितासम्बन्धी नियमहरू, बाइबल खण्डहरू र कार्यतालिकाहरू यहाँबाट डाउनलोड गर्न सक्नुहुन्छ।';
        }

        // Translate Notice Section
        const nHeader = document.querySelector('#section-notices h2');
        if (nHeader) {
            nHeader.textContent = lang === 'en' ? '🔔 Official Notice Board' : '🔔 आधिकारिक सूचना बोर्ड (Notice Board)';
        }
        const nDesc = document.querySelector('#section-notices p');
        if (nDesc) {
            nDesc.textContent = lang === 'en' ? 'The latest official tournament updates, schedules, and decisions are published here.' : 'कार्यक्रमसम्बन्धी पछिल्ला निर्णय तथा सूचनाहरू यहाँ प्रकाशन गरिन्छ।';
        }

        // Translate Secure Login Card
        const loginHeader = document.querySelector('#section-login h2');
        if (loginHeader) {
            loginHeader.textContent = lang === 'en' ? 'Secure Portal Login' : 'सुरक्षित प्रणाली लगइन';
        }
        const loginSub = document.querySelector('#section-login p');
        if (loginSub) {
            loginSub.textContent = lang === 'en' ? 'Enter judge or administrator credentials' : 'एडमिन वा निर्णायक (Judge) विवरण प्रविष्ट गर्नुहोस्';
        }
        const loginLabels = document.querySelectorAll('#section-login .form-label');
        if (loginLabels.length >= 2) {
            loginLabels[0].textContent = lang === 'en' ? 'Username (युजरनेम):' : 'युजरनेम (Username):';
            loginLabels[1].textContent = lang === 'en' ? 'Password (पासवर्ड):' : 'पासवर्ड (Password):';
        }
        const btnLoginSubmit = document.querySelector('#login-form button');
        if (btnLoginSubmit) {
            btnLoginSubmit.textContent = lang === 'en' ? '🚪 Log In to Portal' : '🚪 प्रणालीमा प्रवेश गर्नुहोस्';
        }
        const loginHelp = document.querySelector('#section-login div p');
        if (loginHelp) {
            loginHelp.textContent = lang === 'en' ? '🔑 Testing Credentials:' : '🔑 परीक्षणका लागि साख विवरण (Credentials):';
        }

        // Translate Judge Portal Section
        const jHeader = document.querySelector('#section-judge .action-row h2');
        if (jHeader) {
            jHeader.textContent = lang === 'en' ? 'Judges Portal Score Sheet' : 'निर्णायक अंक प्रविष्टि तालिका (Judges Portal)';
        }
        const jSub = document.querySelector('#section-judge .action-row p');
        if (jSub) {
            jSub.textContent = lang === 'en' ? 'Select a competitor below to input score evaluations.' : 'सहभागी चयन गरी तत्काल श्रेणीगत अंक प्रविष्ट गर्नुहोस्।';
        }
        
        const judgeFilter = document.getElementById('judge-status-filter');
        if (judgeFilter && judgeFilter.options.length >= 3) {
            judgeFilter.options[0].textContent = lang === 'en' ? 'All Participants (सबै सहभागीहरू)' : 'सबै सहभागीहरू (All)';
            judgeFilter.options[1].textContent = lang === 'en' ? 'Pending Evaluation (बाँकी)' : 'मूल्यांकन बाँकी (Pending)';
            judgeFilter.options[2].textContent = lang === 'en' ? 'Evaluated (मूल्यांकन गरिएका)' : 'मूल्यांकन गरिएका (Evaluated)';
        }

        // Translate Admin Sidebar
        const adminHeader = document.querySelector('#section-admin .action-row h2');
        if (adminHeader) {
            adminHeader.textContent = lang === 'en' ? '⚙️ Control Center (Admin Panel)' : '⚙️ नियन्त्रण कक्ष (Admin Panel)';
        }
        
        const adminSubnavs = document.querySelectorAll('.admin-subnav-btn');
        if (adminSubnavs.length >= 5) {
            adminSubnavs[0].textContent = lang === 'en' ? '👥 Competitors (सहभागी)' : '👥 सहभागी व्यवस्थापन';
            adminSubnavs[1].textContent = lang === 'en' ? '📍 Regions (इलाका)' : '📍 इलाका व्यवस्थापन';
            adminSubnavs[2].textContent = lang === 'en' ? '📢 Announcements (सूचना)' : '📢 सूचना व्यवस्थापन';
            adminSubnavs[3].textContent = lang === 'en' ? '📁 Files & Downloads' : '📁 फाइल डाउनलोड व्यवस्थापन';
            adminSubnavs[4].textContent = lang === 'en' ? '🛠️ Settings & Backups' : '🛠️ प्रणाली सेटिङ र ब्याकअप';
        }
    };

    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            localStorage.setItem('lang', lang);
            window.translateUI(lang);
            window.showToast(lang === 'en' ? 'Language switched to English' : 'भाषा नेपालीमा परिवर्तन भयो');
            
            // Re-render current SPA view to pull new language details instantly
            const activeNavBtn = document.querySelector('.nav-item-btn.active');
            if (activeNavBtn) navigateTo(activeNavBtn.id);
        });
    }

    // 2. SPA Router Engine
    const navButtons = document.querySelectorAll('.nav-item-btn, .brand-section, #nav-login, .nav-dropdown-content button');
    const sections = {
        'nav-org-home': 'section-org-home',
        'nav-about': 'section-about',
        'nav-gallery': 'section-gallery',
        'nav-home': 'section-home',
        'nav-live-score': 'section-live-score',
        'nav-participants': 'section-participants',
        'nav-downloads': 'section-downloads',
        'nav-notices': 'section-notices',
        'nav-contact': 'section-contact',
        'nav-login': 'section-login',
        'nav-admin': 'section-admin',
        'nav-judge': 'section-judge'
    };

    function navigateTo(navId) {
        if (navId === 'nav-tournament-group') return; // Do nothing for dropdown parent

        // Toggle Active nav state
        document.querySelectorAll('.nav-item-btn, .nav-dropdown-content button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === navId) {
                btn.classList.add('active');
                // If it's a dropdown child, also highlight the parent
                if (btn.parentElement.classList.contains('nav-dropdown-content')) {
                    btn.parentElement.previousElementSibling.classList.add('active');
                }
            }
        });

        // Hide all sections, show target
        const targetSectionId = sections[navId] || 'section-org-home';
        Object.values(sections).forEach(secId => {
            const el = document.getElementById(secId);
            if (el) el.classList.add('hidden');
        });
        
        const targetEl = document.getElementById(targetSectionId);
        if (targetEl) targetEl.classList.remove('hidden');

        // Close details modals if any
        closeActiveModals();
        
        // Persist tab
        sessionStorage.setItem('active_tab', navId);

        // Initialize section-specific scripts
        if (navId === 'nav-org-home') {
            // Nothing specific yet
        } else if (navId === 'nav-contact') {
            renderPublicContactInfo();
        } else if (navId === 'nav-home') {
            renderDashboardStats();
            renderPublicTop3();
            renderPublicNotices();
            renderPublicPrizes();
            renderLiveScoreBoard();
        } else if (navId === 'nav-live-score') {
            renderLiveScoreBoard();
        } else if (navId === 'nav-participants') {
            renderPublicParticipants();
        } else if (navId === 'nav-downloads') {
            renderPublicDownloads();
        } else if (navId === 'nav-notices') {
            renderPublicNotices();
        } else if (navId === 'nav-gallery') {
            renderPublicGallerySlider();
        } else if (navId === 'nav-about') {
            renderPublicTeam();
        } else if (navId === 'nav-admin') {
            if (window.adminPanel) window.adminPanel.init();
        } else if (navId === 'nav-judge') {
            if (window.judgePanel) window.judgePanel.init();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            let targetId = btn.id;
            if (btn.classList.contains('brand-section')) {
                targetId = 'nav-home';
            }
            navigateTo(targetId);
            
            // Close mobile menu on nav item click
            const navControls = document.querySelector('.nav-controls');
            if (navControls) {
                navControls.classList.remove('show-mobile');
            }
        });
    });

    // 2.5 Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navControls = document.querySelector('.nav-controls');
    if (mobileToggle && navControls) {
        mobileToggle.addEventListener('click', () => {
            navControls.classList.toggle('show-mobile');
        });
    }

    // Make router available globally
    window.spaRouter = { navigateTo };

    // ── Auto-refresh when Firebase pushes a live update ──────────────────
    // This fires on every device/browser that has the page open.
    window.addEventListener('db_updated', () => {
        const activeBtn = document.querySelector('.nav-item-btn.active');
        if (activeBtn) {
            const navId = activeBtn.id;
            // Re-render data for the current section only (no full page reload)
            if (navId === 'nav-home') {
                renderDashboardStats();
                renderPublicTop3();
                renderPublicPrizes();
                renderLiveScoreBoard();
            } else if (navId === 'nav-org-home') {
                // Countdown updates dynamically via startCountdown setInterval
            } else if (navId === 'nav-gallery') {
                renderPublicGallerySlider();
            } else if (navId === 'nav-live-score') {
                renderLiveScoreBoard();
            } else if (navId === 'nav-participants') {
                renderPublicParticipants();
            } else if (navId === 'nav-notices') {
                renderPublicNotices();
            } else if (navId === 'nav-about') {
                renderPublicTeam();
            } else if (navId === 'nav-admin') {
                if (window.adminPanel) window.adminPanel.init();
            } else if (navId === 'nav-judge') {
                if (window.judgePanel) window.judgePanel.init();
            }
        }
        // Always refresh ticker
        renderTicker();
    });


    // 3. User Mock Authentication System
    const loginForm = document.getElementById('login-form');
    const roleBadge = document.getElementById('user-role-badge');
    const adminNavBtn = document.getElementById('nav-admin');
    const judgeNavBtn = document.getElementById('nav-judge');
    const logoutBtn = document.getElementById('logout-btn');
    const loginNavBtn = document.getElementById('nav-login');

    // Default Role
    window.currentUser = JSON.parse(sessionStorage.getItem('current_user')) || { role: 'viewer', name: 'अतिथि' };

    function updateAuthUI() {
        if (roleBadge) {
            roleBadge.textContent = window.currentUser.role === 'superadmin' ? 'सुपर एडमिन' : 
                                    window.currentUser.role === 'judge' ? 'निर्णायक (Judge)' : 'दर्शक (Viewer)';
        }

        // Show/hide administrative tabs based on auth roles
        if (window.currentUser.role === 'superadmin') {
            adminNavBtn.classList.remove('hidden');
            judgeNavBtn.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            if (loginNavBtn) loginNavBtn.classList.add('hidden');
        } else if (window.currentUser.role === 'judge') {
            adminNavBtn.classList.add('hidden');
            judgeNavBtn.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            if (loginNavBtn) loginNavBtn.classList.add('hidden');
        } else {
            adminNavBtn.classList.add('hidden');
            judgeNavBtn.classList.add('hidden');
            logoutBtn.classList.add('hidden');
            if (loginNavBtn) loginNavBtn.classList.remove('hidden');
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const pass = document.getElementById('login-password').value.trim();
            const authSettings = window.db.getAuthSettings();

            if (username === 'admin' && pass === authSettings.admin_pass) {
                window.currentUser = { role: 'superadmin', name: 'सुपर एडमिन' };
                sessionStorage.setItem('current_user', JSON.stringify(window.currentUser));
                showToast('सुपर एडमिन सफलतापूर्वक लगइन भयो!');
                updateAuthUI();
                navigateTo('nav-admin');
            } else if (username === 'judge' && pass === authSettings.judge_pass) {
                window.currentUser = { role: 'judge', name: 'पास्टर प्रकाश लिम्बु' }; // pre-seeded judge
                sessionStorage.setItem('current_user', JSON.stringify(window.currentUser));
                showToast('निर्णायक सफलतापूर्वक लगइन भयो!');
                updateAuthUI();
                navigateTo('nav-judge');
            } else {
                showToast('गलत युजरनेम वा पासवर्ड!', 'danger');
            }
            loginForm.reset();
        });
    }

    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openPasswordResetModal();
        });
    }

    // Google Authentication & Password Reset Flow
    window.openPasswordResetModal = function() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'password-reset-modal';
        modal.onclick = (e) => { if (e.target === modal) closeActiveModals(); };

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <div class="modal-header">
                    <h3 class="modal-title">🔑 पासवर्ड पुन: प्राप्ति (Reset Password)</h3>
                    <button class="modal-close" onclick="closeActiveModals()">×</button>
                </div>
                <div class="modal-body" id="reset-modal-body">
                    <!-- Step 1: Select Role & Google Sign-In button -->
                    <div id="reset-step-1">
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
                            आफ्नो एडमिन वा जज पासवर्ड रिसेट गर्नका लागि सम्बन्धित खाता रोज्नुहोस् र Google खाता मार्फत सुरक्षित रूपमा लगइन गर्नुहोस्।
                        </p>
                        
                        <div class="form-group">
                            <label class="form-label" for="reset-role-select">कुन खाता रिसेट गर्ने? (Select Account):</label>
                            <select id="reset-role-select" class="form-control" style="font-weight: 600;">
                                <option value="admin">🔧 सुपर एडमिन (Super Admin)</option>
                                <option value="judge">📝 निर्णायक (Judge)</option>
                            </select>
                        </div>
                        
                        <div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                            <!-- Premium Custom Styled Google Sign-In Button -->
                            <button id="google-login-btn" class="btn" style="background: #ffffff; color: #757575; border: 1px solid #dadce0; width: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.2s ease; padding: 0.75rem; cursor: pointer;">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width: 20px; height: 20px; margin-right: 12px; display: block;">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.5 24c0-1.63-.15-3.2-.43-4.72H24v9h12.75c-.55 2.91-2.2 5.38-4.67 7.04l7.26 5.63C43.59 36.4 46.5 30.76 46.5 24z"/>
                                    <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.26-5.63c-2.2 1.47-5.01 2.36-8.63 2.36-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                </svg>
                                Sign in with Google (गूगल मार्फत लगइन)
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeActiveModals()">रद्द गर्नुहोस्</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind Google login click handler
        const googleBtn = modal.querySelector('#google-login-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                const role = modal.querySelector('#reset-role-select').value;
                showSimulatedGooglePopup(role);
            });
        }
    };

    function showSimulatedGooglePopup(role) {
        const popup = document.createElement('div');
        popup.className = 'modal-overlay';
        popup.style.zIndex = '300';
        popup.id = 'google-popup-overlay';

        const roleText = role === 'admin' ? 'सुपर एडमिन (Super Admin)' : 'निर्णायक (Judge)';
        const auth = window.db.getAuthSettings();
        const configuredEmail = role === 'admin' ? auth.admin_recovery_email : auth.judge_recovery_email;
        const fallbackEmail = role === 'admin' ? 'admin@gmail.com' : 'judge@gmail.com';

        popup.innerHTML = `
            <div class="modal-content" style="max-width: 420px; background: #ffffff; border: 1px solid #dadce0; color: #202124; font-family: 'Roboto', 'Arial', sans-serif; box-shadow: 0 12px 36px rgba(0,0,0,0.25); border-radius: 8px;">
                <div style="padding: 2.5rem 2rem 2rem 2rem;">
                    <!-- Google Logo header -->
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="75" height="30" style="display: block; margin: 0 auto;">
                            <path fill="#4285F4" d="M21.35 11.1H12v2.7h5.38C16.88 15.86 14.83 17 12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5c1.23 0 2.37.45 3.27 1.18l2.13-2.13C15.89 4.64 14.07 4 12 4 7.58 4 4 7.58 4 12s3.58 8 8 8c4.4 0 7.4-3.08 7.4-7.5 0-.48-.05-.9-.15-1.4z"/>
                        </svg>
                        <h2 style="font-size: 1.5rem; font-weight: 400; margin-top: 1rem; color: #202124;">Sign in</h2>
                        <p style="font-size: 0.95rem; color: #5f6368; margin-top: 0.5rem;">to continue to Igniter Bible Contest</p>
                    </div>

                    <div style="margin-top: 1rem;">
                        <p style="font-size: 0.9rem; color: #3c4043; margin-bottom: 1.25rem;">
                            You are recovering credentials for: <b style="color: #1a73e8;">${roleText}</b>
                        </p>
                        
                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label class="form-label" style="color: #202124; font-size: 0.85rem; font-weight: 500;" for="google-popup-email">Email or phone</label>
                            <input type="email" id="google-popup-email" class="form-control" style="background: #ffffff; border: 1px solid #dadce0; color: #000000; padding: 0.8rem 1rem; font-size: 1rem; border-radius: 4px;" placeholder="Enter recovery email" required>
                            
                            <div style="margin-top: 0.75rem; font-size: 0.8rem; line-height: 1.4; color: #5f6368; background: #f8f9fa; border: 1px solid #e8eaed; padding: 0.65rem; border-radius: 4px;">
                                💡 <b>Recovery Tip:</b><br>
                                ${configuredEmail ? `तपाईंको लागि सेट गरिएको रिकभरी इमेल: <b>${configuredEmail}</b> हो।` : `तपाईंले रिकभरी इमेल सेट गर्नुभएको छैन। परीक्षणका लागि डिफल्ट ईमेल <b>${fallbackEmail}</b> प्रयोग गर्नुहोस्।`}
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem;">
                            <a href="#" id="google-popup-cancel" style="color: #1a73e8; font-weight: 500; font-size: 0.9rem; text-decoration: none;">Cancel</a>
                            <button id="google-popup-next" class="btn" style="background: #1a73e8; color: #ffffff; padding: 0.6rem 1.5rem; font-weight: 500; font-size: 0.9rem; border-radius: 4px; border: none; cursor: pointer; box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(popup);

        popup.querySelector('#google-popup-cancel').addEventListener('click', (e) => {
            e.preventDefault();
            popup.remove();
        });

        popup.querySelector('#google-popup-next').addEventListener('click', () => {
            const emailInput = popup.querySelector('#google-popup-email').value.trim().toLowerCase();
            const targetEmail = (configuredEmail || fallbackEmail).trim().toLowerCase();

            if (!emailInput) {
                showToast('कृपया ईमेल ठेगाना प्रविष्ट गर्नुहोस्!', 'warning');
                return;
            }

            if (emailInput === targetEmail) {
                showToast('Google प्रमाणीकरण सफल भयो!', 'success');
                popup.remove();
                showPasswordResetForm(role);
            } else {
                showToast('इमेल ठेगाना मिलेन!', 'danger');
            }
        });
    }

    function showPasswordResetForm(role) {
        const modalBody = document.getElementById('reset-modal-body');
        if (!modalBody) return;

        const roleText = role === 'admin' ? 'सुपर एडमिन (Super Admin)' : 'निर्णायक (Judge)';

        modalBody.innerHTML = `
            <div id="reset-step-2">
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
                    गूगल खाता प्रमाणीकरण पूरा भयो! अब <b style="color: var(--text-heading);">${roleText}</b> का लागि नयाँ सुरक्षित पासवर्ड प्रविष्ट गर्नुहोस्।
                </p>
                
                <form id="password-change-form">
                    <div class="form-group">
                        <label class="form-label" for="reset-new-pass">नयाँ पासवर्ड (New Password):</label>
                        <input type="password" id="reset-new-pass" class="form-control" required placeholder="नयाँ पासवर्ड प्रविष्ट गर्नुहोस्" minlength="4">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="reset-confirm-pass">पासवर्ड पुन: पुष्टि गर्नुहोस् (Confirm Password):</label>
                        <input type="password" id="reset-confirm-pass" class="form-control" required placeholder="पासवर्ड पुन: टाइप गर्नुहोस्">
                    </div>
                    
                    <div style="margin-top: 1.5rem;">
                        <button type="submit" class="btn btn-gold" style="width: 100%;">💾 पासवर्ड परिवर्तन गर्नुहोस्</button>
                    </div>
                </form>
            </div>
        `;

        const changeForm = modalBody.querySelector('#password-change-form');
        if (changeForm) {
            changeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newPass = document.getElementById('reset-new-pass').value.trim();
                const confirmPass = document.getElementById('reset-confirm-pass').value.trim();

                if (newPass !== confirmPass) {
                    showToast('पासवर्डहरू मिलेनन्! (Passwords do not match)', 'danger');
                    return;
                }

                const updates = {};
                if (role === 'admin') {
                    updates.admin_pass = newPass;
                } else {
                    updates.judge_pass = newPass;
                }

                window.db.saveAuthSettings(updates);
                showToast('पासवर्ड सफलतापूर्वक परिवर्तन गरियो!', 'success');
                closeActiveModals();
                
                window.dispatchEvent(new Event('db_updated'));
            });
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.currentUser = { role: 'viewer', name: 'अतिथि' };
            sessionStorage.removeItem('current_user');
            showToast('सफलतापूर्वक लगआउट भयो!');
            updateAuthUI();
            navigateTo('nav-home');
        });
    }

    // 4. Live Notice Ticker Runner
    function renderTicker() {
        const ticker = document.getElementById('ticker-marquee');
        if (!ticker) return;
        
        const notices = window.db.getNotices().filter(n => n.is_ticker);
        if (notices.length === 0) {
            ticker.innerHTML = '<span class="ticker-item">बाइबल पद कण्ठस्थ प्रतियोगितामा यहाँहरूलाई स्वागत छ!</span>';
            return;
        }

        const tickerHtml = notices.map(n => `<span class="ticker-item">📢 ${n.title_ne}</span>`).join('');
        ticker.innerHTML = tickerHtml;
    }

    // 5. Event Countdown Timer Engine
    let timerInterval = null;
    function startCountdown() {
        if (timerInterval) clearInterval(timerInterval);

        const updateTimer = () => {
            const settings = window.db.getSettings();
            const wrapper = document.getElementById('org-countdown-wrapper');
            if (!settings.event_date || settings.event_date.trim() === '') {
                if (wrapper) wrapper.classList.add('hidden');
                if (timerInterval) clearInterval(timerInterval);
                return;
            }

            const targetDate = new Date(settings.event_date).getTime();
            if (isNaN(targetDate)) {
                if (wrapper) wrapper.classList.add('hidden');
                if (timerInterval) clearInterval(timerInterval);
                return;
            }

            if (wrapper) wrapper.classList.remove('hidden');

            const now = new Date().getTime();
            const distance = targetDate - now;

            const daysEl = document.getElementById('cd-days');
            const hoursEl = document.getElementById('cd-hours');
            const minutesEl = document.getElementById('cd-minutes');
            const secondsEl = document.getElementById('cd-seconds');

            if (!daysEl) return;

            if (distance < 0) {
                document.getElementById('countdown-title').textContent = 'प्रतियोगिता समाप्त भएको छ वा सुरु भइसकेको छ।';
                daysEl.textContent = '००';
                hoursEl.textContent = '००';
                minutesEl.textContent = '००';
                secondsEl.textContent = '००';
                clearInterval(timerInterval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Pad zeroes
            daysEl.textContent = String(days).padStart(2, '0');
            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
        };

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    // 6. Render Dashboard Widgets & Home View
    function renderDashboardStats() {
        const participants = window.db.getParticipants();
        const illakas = window.db.getIllakas();
        const ranked = window.db.getRankedParticipants();
        
        // Settings details
        const settings = window.db.getSettings();
        document.getElementById('home-event-title').textContent = settings.title_ne;
        document.getElementById('home-event-subtitle').textContent = settings.subtitle_ne;

        // Populate Event Details Card
        const dateObj = new Date(settings.event_date);
        document.getElementById('dashboard-event-date-display').textContent = dateObj.toLocaleDateString('ne-NP', { year: 'numeric', month: 'long', day: 'numeric' });
        
        document.getElementById('dashboard-event-time').textContent = settings.event_time || 'निर्धारित छैन';
        document.getElementById('dashboard-event-address').textContent = settings.event_address || 'निर्धारित छैन';
        
        const mapEl = document.getElementById('dashboard-event-map');
        if (settings.event_location_map) {
            mapEl.src = settings.event_location_map;
            mapEl.parentElement.style.display = 'block';
        } else {
            mapEl.parentElement.style.display = 'none';
        }

        const imgEl = document.getElementById('dashboard-church-image');
        if (settings.event_church_image) {
            window.resolveUrl(settings.event_church_image).then(src => {
                imgEl.src = src;
                imgEl.parentElement.style.display = 'block';
            });
        } else {
            imgEl.parentElement.style.display = 'none';
        }

        // Total Participants Widget
        document.getElementById('widget-total-participants').textContent = participants.length;
        
        // Total Illakas Widget
        document.getElementById('widget-total-illakas').textContent = illakas.length;
        
        // Top Scorer Widget
        const topScorerVal = document.getElementById('widget-top-scorer');
        const topScorerDesc = document.getElementById('widget-top-scorer-desc');

        if (ranked.length > 0 && ranked[0].total_score > 0) {
            topScorerVal.textContent = ranked[0].name_ne;
            topScorerDesc.textContent = `${ranked[0].total_score} अंक (${ranked[0].church_name})`;
        } else {
            topScorerVal.textContent = 'N/A';
            topScorerDesc.textContent = 'अझै मूल्यांकन भएको छैन';
        }
    }

    function renderPublicTop3() {
        const ranked = window.db.getRankedParticipants();
        // Leaderboard Top 3 Cards
        const top3Grid = document.getElementById('top-3-leaderboard');
        if (!top3Grid) return;
        top3Grid.innerHTML = '';

        if (ranked.length === 0) {
            top3Grid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 2rem; color: var(--text-muted);">अंक प्रविष्टि सुरु भएपछि यहाँ उत्कृष्ट ३ प्रतियोगी देखिनेछ।</div>';
            return;
        }

        // Render first 3 participants
        ranked.slice(0, 3).forEach((p, idx) => {
            const card = document.createElement('div');
            card.className = `card card-accent ${idx === 0 ? 'card-champion' : ''}`;

            const isFS = p.photo_url && p.photo_url.startsWith('filestore://');
            const fsKey = isFS ? p.photo_url.slice('filestore://'.length) : '';
            const placeholder = `data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%230a3064%22/><text x=%2250%22 y=%2255%22 font-family=%22sans-serif%22 font-size=%2235%22 fill=%22white%22 text-anchor=%22middle%22>${p.name_ne[0]}</text></svg>`;
            const imgSrc = isFS ? placeholder : (p.photo_url || placeholder);

            card.innerHTML = `
                ${idx === 0 ? '<div class="champion-ribbon">👑</div>' : ''}
                <div class="text-center">
                    <img class="avatar-large" ${isFS ? `data-fs-key="${fsKey}"` : ''} src="${imgSrc}" alt="${p.name_ne}" onerror="this.src='${placeholder}'">
                    <span class="rank-badge rank-${idx + 1}" style="margin-bottom: 0.5rem;">${idx + 1}</span>
                    <h3 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${p.name_ne}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${p.church_name}</p>
                    <p style="font-size: 0.8rem; font-weight: 600; color: var(--gold); margin-top: 0.25rem;">इलाका: ${p.illaka_name}</p>
                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-heading); margin-top: 0.75rem; font-family: var(--font-heading);">
                        ${p.total_score} <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">अंक</span>
                    </div>
                </div>
            `;
            top3Grid.appendChild(card);
        });
        if (window.hydrateImages) window.hydrateImages(top3Grid);
    }

    function renderPublicNotices() {
        const container = document.getElementById('recent-notices-container');
        if (!container) return;
        container.innerHTML = '';

        const notices = window.db.getNotices().slice(0, 3);
        if (notices.length === 0) {
            container.innerHTML = '<div style="color: var(--text-muted);">कुनै सूचनाहरू उपलब्ध छैनन्।</div>';
            return;
        }

        notices.forEach(n => {
            const dateStr = new Date(n.created_at).toLocaleDateString('ne-NP');
            const el = document.createElement('div');
            el.className = 'card';
            el.style.padding = '1rem';
            el.style.marginBottom = '0.75rem';
            el.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                    <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-heading);">${n.title_ne}</h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted);">${n.content_ne || ''}</p>
            `;
            container.appendChild(el);
        });
    }

    // 7. Render Live Scores & Ranks
    function renderLiveScoreBoard() {
        const container = document.getElementById('live-score-table-body');
        if (!container) return;
        container.innerHTML = '';

        const ranked = window.db.getRankedParticipants();
        const settings = window.db.getSettings();

        // Lock / Unlock scores indicator
        const lockIndicator = document.getElementById('score-lock-indicator');
        if (lockIndicator) {
            lockIndicator.className = settings.lock_scores ? 'role-badge danger' : 'role-badge success';
            lockIndicator.textContent = settings.lock_scores ? '🔒 अंक प्रविष्टि लक गरिएको छ' : '🟢 लाइभ अंक प्रविष्टि खुला छ';
        }

        if (ranked.length === 0) {
            container.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-muted);">कुनै प्रतियोगीहरू मूल्यांकन गरिएका छैनन् वा अंक प्रविष्टि गरिएको छैन।</td></tr>`;
            return;
        }

        const categories = window.db.getScoreCategories();

        ranked.forEach((p, idx) => {
            const rankColor = idx < 3 ? 'var(--gold)' : 'var(--text-muted)';
            const rankIcon = idx === 0 ? '👑' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : ''));
            
            const rounds = window.db.getRounds();
            let breakdownHtml = rounds.map(r => {
                const marks = p.round_scores[r.id] || 0;
                const shortName = r.name.substring(0, 15);
                return `<span style="font-size: 0.75rem; background: var(--bg-main); padding: 0.1rem 0.3rem; border-radius: 4px; margin-right: 0.25rem;">${shortName}: ${marks}</span>`;
            }).join('');

            const eliminatedBadge = p.eliminated ? '<br><span class="role-badge warning" style="margin-top: 0.25rem;">बाहिरिएको (Eliminated)</span>' : '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size: 1.25rem; font-weight: 800; color: ${rankColor};">${rankIcon} ${p.rank}</td>
                <td style="font-weight: 700; color: var(--text-heading);">
                    ${p.name_ne}
                    ${eliminatedBadge}
                </td>
                <td>${p.church_name}</td>
                <td><span style="font-weight: 600; color: var(--gold);">${p.illaka_name}</span></td>
                <td><div style="display: flex; flex-wrap: wrap; max-width: 350px;">${breakdownHtml}</div></td>
                <td style="font-size: 1.25rem; font-weight: 800; color: var(--text-heading); font-family: var(--font-heading);">${p.total_score}</td>
                <td><button class="btn btn-outline btn-sm no-print" onclick="viewParticipantDetails('${p.id}')">🔍 विवरण</button></td>
            `;
            container.appendChild(tr);
        });
    }

    // Export scores to CSV
    window.exportLiveScoresToExcel = function() {
        const ranked = window.db.getRankedParticipants();
        if (ranked.length === 0) {
            showToast('निर्यात गर्न कुनै डाटा छैन!', 'danger');
            return;
        }

        const rounds = window.db.getRounds();
        
        // Define CSV Headers
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for Nepali text in Excel
        csvContent += "Rank (स्थान),Name (सहभागी),Church (मण्डली),Illaka (इलाका),Age Group (समुह),Status (स्थिति),";
        rounds.forEach(r => {
            csvContent += `${r.name.replace(/,/g, '')},`;
        });
        csvContent += "Total Score (कुल अंक)\n";

        // Append Data Row
        ranked.forEach(p => {
            const status = p.eliminated ? 'Eliminated' : 'Active';
            let row = `${p.rank},"${p.name_ne}","${p.church_name}","${p.illaka_name}","${p.age_group}","${status}",`;
            rounds.forEach(r => {
                row += `${p.round_scores[r.id] || 0},`;
            });
            row += `${p.total_score}\n`;
            csvContent += row;
        });

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bible_contest_results_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('नतिजा सफलतापूर्वक Excel/CSV मा निर्यात भयो!');
    };

    // Trigger Print layout
    window.printResults = function() {
        window.print();
    };

    // 8. Render Public Participants Directory
    const pSearchInput = document.getElementById('p-search-input');
    const pFilterIllaka = document.getElementById('p-filter-illaka');

    function renderPublicParticipants() {
        const container = document.getElementById('public-participants-grid');
        if (!container) return;
        container.innerHTML = '';

        // Fill Illaka dropdown first
        if (pFilterIllaka && pFilterIllaka.options.length <= 1) {
            const illakas = window.db.getIllakas();
            illakas.forEach(i => {
                const opt = document.createElement('option');
                opt.value = i.id;
                opt.textContent = i.name_ne;
                pFilterIllaka.appendChild(opt);
            });
        }

        const query = pSearchInput ? pSearchInput.value.toLowerCase() : '';
        const illakaFilter = pFilterIllaka ? pFilterIllaka.value : '';

        const participants = window.db.getParticipants();
        const ranked = window.db.getRankedParticipants();

        const filtered = participants.filter(p => {
            const matchesQuery = p.name_ne.toLowerCase().includes(query) || p.church_name.toLowerCase().includes(query);
            const matchesIllaka = illakaFilter === '' || p.illaka_id === illakaFilter;
            return matchesQuery && matchesIllaka;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 3rem; color: var(--text-muted);">कुनै सहभागी फेला परेन।</div>';
            return;
        }

        filtered.forEach(p => {
            const illaka = window.db.getIllakaById(p.illaka_id);
            const scoreObj = ranked.find(r => r.id === p.id);
            const hasEvaluated = scoreObj && scoreObj.evaluated;

            const isFS = p.photo_url && p.photo_url.startsWith('filestore://');
            const fsKey = isFS ? p.photo_url.slice('filestore://'.length) : '';
            const placeholder = `data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%230a3064%22/><text x=%2250%22 y=%2255%22 font-family=%22sans-serif%22 font-size=%2235%22 fill=%22white%22 text-anchor=%22middle%22>${p.name_ne[0]}</text></svg>`;
            const imgSrc = isFS ? placeholder : (p.photo_url || placeholder);

            const card = document.createElement('div');
            card.className = 'card card-accent';
            card.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <img class="avatar-ring" style="width: 60px; height: 60px;" ${isFS ? `data-fs-key="${fsKey}"` : ''} src="${imgSrc}" alt="${p.name_ne}" onerror="this.src='${placeholder}'">
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.1rem; color: var(--text-heading);">${p.name_ne}</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${p.church_name}</p>
                        <p style="font-size: 0.8rem; font-weight: 600; color: var(--gold);">${illaka ? illaka.name_ne : ''}</p>
                    </div>
                </div>
                
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">उमेर समुह:</span>
                        <div style="font-size: 0.85rem; font-weight: 700;">${p.age_group}</div>
                    </div>
                    
                    <div class="text-right">
                        <span style="font-size: 0.75rem; color: var(--text-muted);">अंक स्थिति:</span>
                        <div>
                            ${p.eliminated ? '<span class="role-badge warning">बाहिरिएको (Eliminated)</span>' : (hasEvaluated ? `<span class="role-badge success">${scoreObj.total_score} अंक (Rank: ${scoreObj.rank})</span>` : '<span class="role-badge" style="background: rgba(100,116,139,0.1); color: var(--text-muted); border: 1px solid var(--border)">बाँकी</span>')}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${hasEvaluated ? `
                        <button class="btn btn-gold btn-sm" style="flex: 1; min-width: 120px;" onclick="viewCertificateModal('${p.id}', false)">
                            🏆 प्राप्ति प्रमाणपत्र
                        </button>
                        <button class="btn btn-outline btn-sm" style="flex: 1; min-width: 120px;" onclick="viewParticipantDetails('${p.id}')">
                            📊 स्कोर कार्ड
                        </button>
                    ` : ''}
                    <button class="btn btn-primary btn-sm" style="flex: 1; min-width: 120px;" onclick="viewCertificateModal('${p.id}', true)">
                        🎓 सहभागिता प्रमाणपत्र
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
        if (window.hydrateImages) window.hydrateImages(container);
    }

    if (pSearchInput) pSearchInput.addEventListener('input', renderPublicParticipants);
    if (pFilterIllaka) pFilterIllaka.addEventListener('change', renderPublicParticipants);

    // 9. Render Public Downloads
    function renderPublicDownloads() {
        const container = document.getElementById('public-downloads-grid');
        if (!container) return;
        container.innerHTML = '';

        const materials = window.db.getMaterials();
        if (materials.length === 0) {
            container.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 2rem; color: var(--text-muted);">कुनै डाउनलोड सामग्रीहरू उपलब्ध छैनन्।</div>';
            return;
        }

        materials.forEach(m => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'space-between';
            card.innerHTML = `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <span class="role-badge" style="background: var(--primary); color: white; border: none;">${m.file_type}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">${m.file_size}</span>
                    </div>
                    <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-heading); margin-bottom: 0.75rem;">${m.title_ne}</h4>
                </div>
                <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="triggerDownload('${m.id}')">
                    ⬇️ डाउनलोड गर्नुहोस्
                </button>
            `;
            container.appendChild(card);
        });
    }

    window.triggerDownload = function(id) {
        const materials = window.db.getMaterials();
        const m = materials.find(x => x.id === id);
        if (!m || !m.file_url || m.file_url === '#') {
            showToast('यस सामग्रीको फाइल उपलब्ध छैन।', 'danger');
            return;
        }

        if (m.file_url.startsWith('http')) {
            // External URL (Google Drive, etc.)
            window.open(m.file_url, '_blank');
        } else if (m.file_url.startsWith('filestore://')) {
            // File stored in IndexedDB
            const fsKey = m.file_url.slice('filestore://'.length);
            window.FileStore.get(fsKey).then(data => {
                if (!data) { showToast('फाइल फेला परेन!', 'danger'); return; }
                let ext = m.file_type ? m.file_type.toLowerCase() : 'file';
                if (ext === 'link' || ext === 'external') ext = 'pdf';
                const a = document.createElement('a');
                a.href = data;
                a.download = `${m.title_ne.replace(/ /g, '_')}.${ext}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showToast(`'${m.title_ne}' डाउनलोड सुरु भयो!`);
            }).catch(() => showToast('फाइल डाउनलोड गर्न समस्या भयो!', 'danger'));
        } else if (m.file_url.startsWith('data:')) {
            // Legacy base64 inline data
            let ext = m.file_type ? m.file_type.toLowerCase() : 'file';
            if (ext === 'image') ext = 'png';
            if (ext === 'link' || ext === 'external') ext = 'pdf';
            const link = document.createElement('a');
            link.setAttribute('href', m.file_url);
            link.setAttribute('download', `${m.title_ne.replace(/ /g, '_')}.${ext}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(`'${m.title_ne}' डाउनलोड सुरु भयो!`);
        } else {
            showToast('यस सामग्रीको फाइल उपलब्ध छैन।', 'danger');
        }
    };

    // 10. Render Public Notices
    function renderPublicNotices() {
        const container = document.getElementById('public-notices-container');
        if (!container) return;
        container.innerHTML = '';

        const notices = window.db.getNotices();
        if (notices.length === 0) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">हाल कुनै सूचनाहरू प्रकाशित छैनन्।</div>';
            return;
        }

        notices.forEach(n => {
            const dateStr = new Date(n.created_at).toLocaleDateString('ne-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const card = document.createElement('div');
            card.className = 'card card-accent';
            card.style.marginBottom = '1.25rem';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                    <h3 style="font-size: 1.15rem; color: var(--text-heading);">${n.title_ne}</h3>
                    <span style="font-size: 0.8rem; background: var(--gold-light); padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 600;">${dateStr}</span>
                </div>
                <p style="color: var(--text-main); font-size: 0.95rem;">${n.content_ne || 'विवरण उपलब्ध छैन।'}</p>
            `;
            container.appendChild(card);
        });
    }

    // 10. Render Public Prizes
    function renderPublicPrizes() {
        const container = document.getElementById('public-prizes-grid');
        if (!container) return;
        container.innerHTML = '';

        const prizes = window.db.getPrizes();

        if (prizes.length === 0) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">कुनै पुरस्कार घोषणा गरिएको छैन।</div>';
            return;
        }

        prizes.forEach((p, idx) => {
            const colors = ['#0a3064', '#15803d', '#b45309', '#64748b'];
            const color = colors[idx % colors.length];
            
            const card = document.createElement('div');
            card.className = 'card card-accent';
            card.style.textAlign = 'center';
            card.innerHTML = `
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${idx === 0 ? '🏆' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '🎖️'))}</div>
                <h3 style="font-size: 1.2rem; color: ${color}; margin-bottom: 0.5rem;">${p.title_ne}</h3>
                <div style="font-size: 1.5rem; font-weight: 900; color: var(--gold); margin-bottom: 0.5rem; font-family: var(--font-heading);">${p.amount}</div>
                <p style="color: var(--text-muted); font-size: 0.9rem;">${p.description_ne || ''}</p>
            `;
            container.appendChild(card);
        });
    }

    // --- Render Gallery Slider ---
    let sliderIntervals = [];
    function renderPublicGallerySlider() {
        const sliderIds = ['dashboard-gallery-slider', 'dashboard-gallery-slider-2'];
        
        // Clear old intervals
        sliderIntervals.forEach(interval => clearInterval(interval));
        sliderIntervals = [];

        const gallery = window.db.getGallery();
        const sorted = gallery.slice().sort((a,b) => (a.order || 0) - (b.order || 0));

        sliderIds.forEach(id => {
            const slider = document.getElementById(id);
            if (!slider) return;
            
            // Assume caption has same ID + '-caption' (only the first one had it in old HTML, so we might just find it)
            // Wait, the original HTML had id="dashboard-gallery-caption". I'll use id + '-caption'
            const caption = document.getElementById(id + '-caption');
            slider.innerHTML = '';

            if (gallery.length === 0) {
                slider.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">कुनै तस्बिर उपलब्ध छैन।</div>';
                if (caption) caption.style.display = 'none';
                return;
            }

            sorted.forEach(g => {
                const img = document.createElement('img');
                img.alt = g.title_ne;
                img.style.minWidth = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.dataset.caption = g.title_ne;

                if (g.image_url && g.image_url.startsWith('filestore://')) {
                    const fsKey = g.image_url.slice('filestore://'.length);
                    img.src = ''; // placeholder while loading
                    img.style.background = '#1e293b';
                    window.FileStore.get(fsKey).then(data => {
                        if (data) img.src = data;
                    }).catch(() => {});
                } else {
                    img.src = g.image_url || '';
                }
                slider.appendChild(img);
            });

            // Initialize Slider Animation for this specific slider
            let currentIndex = 0;
            if (caption) {
                caption.style.display = 'block';
                caption.textContent = sorted[0].title_ne;
            }

            if (sorted.length > 1) {
                const interval = setInterval(function() {
                    currentIndex = (currentIndex + 1) % sorted.length;
                    slider.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
                    if (caption) caption.textContent = sorted[currentIndex].title_ne;
                }, 3000);
                sliderIntervals.push(interval);
            }
        });
    }

    // --- Render Public Team ---
    function renderPublicTeam() {
        const container = document.getElementById('public-team-grid');
        if (!container) return;
        container.innerHTML = '';

        const team = window.db.getTeamMembers();
        if (team.length === 0) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">कुनै टिम सदस्य थपिएको छैन।</div>';
            return;
        }

        team.sort(function(a,b) { return (a.order || 0) - (b.order || 0); }).forEach(function(t) {
            const isFS = t.photo_url && t.photo_url.startsWith('filestore://');
            const fsKey = isFS ? t.photo_url.slice('filestore://'.length) : '';
            const imgSrc = isFS ? '' : (t.photo_url && t.photo_url.trim() !== '' ? t.photo_url : 'https://via.placeholder.com/150?text=%F0%9F%91%A4');

            const card = document.createElement('div');
            card.className = 'card card-accent';
            card.style.textAlign = 'center';
            card.innerHTML = '<img '
                + (isFS ? `data-fs-key="${fsKey}"` : `src="${imgSrc}"`)
                + ' style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 1rem auto; display: block; border: 3px solid var(--gold); background: #eee;">'
                + '<h3 style="font-size: 1.2rem; color: var(--text-heading); margin-bottom: 0.25rem;">' + t.name + '</h3>'
                + '<p style="color: var(--text-muted); font-weight: 600; font-size: 0.95rem;">' + t.role + '</p>';
            container.appendChild(card);
        });
        if (window.hydrateImages) window.hydrateImages(container);
    }

    // --- Detail & Action Modals ---
    window.closeActiveModals = function() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
    };

    // Show Participant detail card with score breakdown
    window.viewParticipantDetails = function(participantId) {
        const p = window.db.getParticipantById(participantId);
        const ranked = window.db.getRankedParticipants();
        const scoreObj = ranked.find(r => r.id === participantId);

        if (!p || !scoreObj) return;

        const rounds = window.db.getRounds();
        
        let categoriesHtml = rounds.map(r => `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding: 0.5rem 0;">
                <span style="font-weight: 600;">${r.name}</span>
                <span style="font-weight: 700; color: var(--text-heading); font-family: var(--font-heading);">${scoreObj.round_scores[r.id] || 0}</span>
            </div>
        `).join('');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) closeActiveModals(); };
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">सहभागी मूल्यांकन विवरण</h3>
                    <button class="modal-close" onclick="closeActiveModals()">×</button>
                </div>
                <div class="modal-body" id="score-print-area">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <img class="avatar-large" src="${p.photo_url || 'https://via.placeholder.com/120'}" alt="${p.name_ne}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%230a3064%22/><text x=%2250%22 y=%2255%22 font-family=%22sans-serif%22 font-size=%2235%22 fill=%22white%22 text-anchor=%22middle%22>${p.name_ne[0]}</text></svg>'">
                        <h2 style="color: var(--text-heading);">${p.name_ne}</h2>
                        <p style="color: var(--text-muted);">${p.church_name}</p>
                        <p style="color: var(--gold); font-weight: 600; font-size: 0.9rem;">${scoreObj.illaka_name} | श्रेणी: ${scoreObj.rank}</p>
                    </div>
                    
                    <h4 style="margin-bottom: 0.75rem; border-bottom: 2px solid var(--gold); padding-bottom: 0.25rem;">श्रेणी अंक विवरण:</h4>
                    <div style="margin-bottom: 1.5rem;">
                        ${categoriesHtml}
                    </div>
                    
                    <div style="background: var(--gold-light); color: #000; padding: 1rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 800; font-size: 1.1rem;">कुल प्राप्त अंक:</span>
                        <span style="font-weight: 900; font-size: 1.8rem; font-family: var(--font-heading);">${scoreObj.total_score}</span>
                    </div>
                </div>
                <div class="modal-footer no-print">
                    <button class="btn btn-outline" onclick="closeActiveModals()">बन्द गर्नुहोस्</button>
                    <button class="btn btn-gold" onclick="window.printScoreCard()">🖨️ डाउनलोड स्कोर कार्ड</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.printScoreCard = function() {
        const printContent = document.getElementById('score-print-area').innerHTML;
        
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 2rem;">
                <div style="width: 100%; max-width: 450px; border: 2px solid var(--gold); border-radius: var(--radius-md); padding: 2rem; background: #fff; box-shadow: var(--shadow-lg);">
                    <div style="text-align: center; margin-bottom: 1.5rem; border-bottom: 2px solid var(--gold); padding-bottom: 1rem;">
                        <h2 style="color: var(--text-heading); font-size: 1.5rem; margin-bottom: 0.25rem;">IGNITER TEAM</h2>
                        <p style="font-size: 0.85rem; color: var(--gold); font-weight: bold; text-transform: uppercase;">बाइबल पद कण्ठस्थ प्रतियोगिता - स्कोर कार्ड</p>
                    </div>
                    ${printContent}
                </div>
            </div>
        `;
        window.print();
        location.reload();
    };

    // QR Badge functions removed

    // Show Certificate Viewer Modal
    window.viewCertificateModal = function(participantId, isParticipation = false) {
        const p = window.db.getParticipantById(participantId);
        const ranked = window.db.getRankedParticipants();
        const scoreObj = ranked.find(r => r.id === participantId);

        if (!p) return;
        if (!isParticipation && !scoreObj) return;

        let illakaName = p.illaka_name;
        if (scoreObj) {
             illakaName = scoreObj.illaka_name;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) closeActiveModals(); };
        
        const title = isParticipation ? 'सहभागिताको प्रमाणपत्र' : 'प्राप्ति प्रमाणपत्र (Achievement)';
        
        modal.innerHTML = `
            <div class="modal-content modal-content-lg">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="closeActiveModals()">×</button>
                </div>
                <div class="modal-body text-center" style="background: #e2e8f0; overflow-x: auto; padding: 2rem;">
                    <canvas id="modal-certificate-canvas" style="max-width: 100%; height: auto; display: block; margin: 0 auto; box-shadow: var(--shadow-premium); border-radius: 4px;"></canvas>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeActiveModals()">बन्द गर्नुहोस्</button>
                    <button class="btn btn-gold" onclick="downloadCertificate('${p.name_ne}', ${isParticipation})">🎓 डाउनलोड प्रमाणपत्र</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Render Canvas certificate using our engine
        setTimeout(() => {
            window.CertificateGenerator.render({
                canvasId: 'modal-certificate-canvas',
                name: p.name_ne,
                church: p.church_name,
                illaka: illakaName,
                score: scoreObj ? scoreObj.total_score : 0,
                rank: scoreObj ? (scoreObj.rank === 1 ? 'प्रथम (1st)' : scoreObj.rank === 2 ? 'द्वितीय (2nd)' : scoreObj.rank === 3 ? 'तृतीय (3rd)' : `${scoreObj.rank}औं (${scoreObj.rank}th)`) : '',
                ageGroup: p.age_group,
                isParticipation: isParticipation
            });
        }, 50);
    };

    window.downloadCertificate = function(name, isParticipation) {
        const prefix = isParticipation ? 'सहभागिता_पत्र' : 'प्रशंसा_पत्र';
        window.CertificateGenerator.download('modal-certificate-canvas', `${prefix}_${name.replace(/\s+/g, '_')}.png`);
        showToast('प्रमाणपत्र सफलतापूर्वक डाउनलोड भयो!');
    };

    // 11. Toast System Notification
    window.showToast = function(msg, type = 'success') {
        const oldToast = document.querySelector('.toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        if (type === 'danger') {
            toast.style.borderColor = 'var(--danger)';
            toast.style.background = '#ffebeb';
            toast.style.color = 'var(--danger)';
        } else if (type === 'warning') {
            toast.style.borderColor = 'var(--warning)';
            toast.style.background = '#fff8eb';
            toast.style.color = 'var(--warning)';
        } else {
            toast.style.borderColor = 'var(--gold)';
            toast.style.background = 'var(--primary)';
            toast.style.color = '#ffffff';
        }

        toast.innerHTML = `
            <span>${type === 'danger' ? '❌' : type === 'warning' ? '⚠️' : '✨'} ${msg}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'all 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    };

    // Global listener for database changes (syncs live display)
    window.addEventListener('db_updated', () => {
        const activeNavBtn = document.querySelector('.nav-item-btn.active');
        if (activeNavBtn) {
            navigateTo(activeNavBtn.id);
        }
    });

    // 13. Public Contact Render
    function renderPublicContactInfo() {
        const contactSettings = window.db.getContactSettings ? window.db.getContactSettings() : null;
        if (!contactSettings) return;

        const pTags = document.querySelectorAll('#section-contact .contact-icon-row p');
        if (pTags.length >= 3) {
            pTags[0].textContent = contactSettings.address || '';
            pTags[1].textContent = contactSettings.phone || '';
            pTags[2].textContent = contactSettings.email || '';
        }

        let mapWrapper = document.getElementById('public-map-wrapper');
        if (!mapWrapper) {
            mapWrapper = document.createElement('div');
            mapWrapper.id = 'public-map-wrapper';
            mapWrapper.className = 'card';
            mapWrapper.style.marginTop = '2rem';
            mapWrapper.style.padding = '0';
            mapWrapper.style.overflow = 'hidden';
            
            // Insert it at the end of section-contact
            const sectionContact = document.getElementById('section-contact');
            if (sectionContact) sectionContact.appendChild(mapWrapper);
        }

        if (contactSettings.google_map_url) {
            mapWrapper.innerHTML = `<iframe src="${contactSettings.google_map_url}" width="100%" height="450" style="border:0; display:block;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        } else {
            mapWrapper.innerHTML = '';
        }
    }

    // Contact Form Submit Handler
    const contactForm = document.getElementById('public-contact-form');
    if (contactForm) {
        // Remove the inline onsubmit handler in HTML from earlier and bind it properly here
        contactForm.onsubmit = (e) => {
            e.preventDefault();
            const inputs = contactForm.querySelectorAll('input, textarea');
            if (inputs.length >= 3 && window.db.addMessage) {
                window.db.addMessage({
                    name: inputs[0].value,
                    contact: inputs[1].value,
                    message: inputs[2].value
                });
                showToast('सन्देश सफलतापूर्वक पठाइयो! हामी छिट्टै सम्पर्क गर्नेछौं।', 'success');
                contactForm.reset();
            }
        };
    }

    // 12. App Initialization
    window.translateUI(savedLang);
    updateAuthUI();
    // Start global widgets
    startCountdown();
    renderTicker();

    // Default Load State
    const savedTab = sessionStorage.getItem('active_tab');
    if (savedTab && sections[savedTab]) {
        navigateTo(savedTab);
    } else {
        navigateTo('nav-org-home');
    }

    // Parse URL parameter to show participant detailed marks on QR scan
    const urlParams = new URLSearchParams(window.location.search);
    const qParticipantId = urlParams.get('participant');
    if (qParticipantId) {
        setTimeout(() => {
            const p = window.db.getParticipantById(qParticipantId);
            if (p) {
                const ranked = window.db.getRankedParticipants();
                const scoreObj = ranked.find(r => r.id === qParticipantId);
                
                if (scoreObj && scoreObj.evaluated) {
                    window.viewParticipantDetails(qParticipantId);
                } else {
                    // Show basic info if not evaluated yet
                    const illaka = window.db.getIllakaById(p.illaka_id);
                    const modal = document.createElement('div');
                    modal.className = 'modal-overlay';
                    modal.onclick = (e) => { if (e.target === modal) closeActiveModals(); };
                    modal.innerHTML = `
                        <div class="modal-content" style="max-width: 400px;">
                            <div class="modal-header">
                                <h3 class="modal-title">सहभागी विवरण (Competitor Info)</h3>
                                <button class="modal-close" onclick="closeActiveModals()">×</button>
                            </div>
                            <div class="modal-body text-center">
                                <div style="font-size: 3.5rem; margin-bottom: 1rem;">👤</div>
                                <h2 style="color: var(--text-heading);">${p.name_ne}</h2>
                                <p style="color: var(--text-muted); font-size: 0.95rem;">${p.church_name}</p>
                                <p style="color: var(--gold); font-weight: bold; margin-top: 0.5rem;">${illaka ? illaka.name_ne : ''}</p>
                                
                                <div style="margin-top: 1.5rem; background: #fffbeb; border: 1px solid #fde8c3; color: #b7791f; padding: 1rem; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600;">
                                    ⌛ मूल्यांकन कार्य जारी छ...<br>
                                    (Evaluation Pending)
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-outline" onclick="closeActiveModals()">बन्द गर्नुहोस्</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                }
            } else {
                // Show a premium helpful error modal if the participant doesn't exist in this browser's database (common deployment sync issue)
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                modal.onclick = (e) => { if (e.target === modal) closeActiveModals(); };
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 410px; border-top: 4px solid var(--danger);">
                        <div class="modal-header" style="background: var(--danger); border-bottom: none;">
                            <h3 class="modal-title">⚠️ सहभागी फेला परेन (Not Found)</h3>
                            <button class="modal-close" onclick="closeActiveModals()">×</button>
                        </div>
                        <div class="modal-body text-center" style="padding: 2rem 1.5rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍❌</div>
                            <h3 style="color: var(--danger); margin-bottom: 0.75rem;">सहभागीको विवरण फेला परेन!</h3>
                            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
                                स्क्यान गरिएको QR कोडको सहभागी ID (<b>${qParticipantId}</b>) यस मोबाइल/उपकरणको स्थानीय डाटाबेसमा फेला परेन।
                            </p>
                            
                            <div style="text-align: left; background: var(--bg-main); border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius-sm); font-size: 0.78rem; line-height: 1.45;">
                                💡 <b>किन यसो भयो? (Why did this happen):</b><br>
                                यो प्रतियोगिता <b>अफलाइन-फर्स्ट</b> (Offline-first) भएकोले डाटा सुरक्षित रूपमा तपाइँको ब्राउजरको <code>localStorage</code> मा मात्र भण्डारण हुन्छ।<br><br>
                                🔄 <b>यसलाई कसरी मिलाउने (How to Sync):</b><br>
                                १. जुन कम्प्युटरमा सहभागी दर्ता गर्नुभएको थियो, त्यसको <b>एडमिन प्यानल</b>मा जानुहोस्।<br>
                                २. <b>🛠️ प्रणाली सेटिङ र ब्याकअप</b> मा गई <b>ब्याकअप JSON डाउनलोड गर्नुहोस्</b>।<br>
                                ३. त्यसपछि यो फोनको एडमिन प्यानलमा आई उक्त ब्याकअप फाइल <b>पुनर्स्थापना (Restore)</b> गर्नुहोस्।
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-danger" style="width: 100%;" onclick="closeActiveModals()">बन्द गर्नुहोस् (Close)</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }
        }, 150);
    }
});
