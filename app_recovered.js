/**
 * Igniter Team - Bible Memorization Competition Public View Controller
 * Manages SPA navigation, Widgets, Countdown, Search Filters, Notice Ticker & Theme Toggles
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Configuration
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const theme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            showToast(theme === 'dark' ? 'डार�?�. म�<ड स�.�?रिय भय�<' : 'ला�?�Y म�<ड स�.�?रिय भय�<');
        });
    }

    // 1.5. Bilingual i18n Translation Configuration
    const langSelect = document.getElementById('lang-select');
    const savedLang = localStorage.getItem('lang') || 'ne';
    localStorage.setItem('lang', savedLang);
    
    const TRANSLATIONS = {
        ne: {
            // Header tabs
            'nav-org-home': '�Y?� �-�fहप�fष�?ठ',
            'nav-about': '�Y"- हाम�?र�< बार�?मा (About Us)',
            'nav-tournament-group': '�Y?? प�?रतिय�<�-िता �-�',
            'nav-home': 'ड�?यासब�<र�?ड',
            'nav-live-score': 'ला�?भ नति�oा',
            'nav-participants': 'सहभा�-�?हर�,',
            'nav-downloads': 'डा�?नल�<डहर�,',
            'nav-notices': '�Y"" समा�sार',
            'nav-gallery': '�Y-��? �-�?यालर�?',
            'nav-contact': '�Y"z सम�?पर�?�.',
            'nav-judge': '�Y"? �o�o प�?यानल',
            'nav-admin': '�sT�? �?डमिन प�?यानल',
            'nav-login': '�Y"' ल�-�?न',
            'logout-btn': '�Ys� बाहिरिन�?ह�<स�?',
            
            // Countdown section
            'countdown-title': 'प�?रतिय�<�-िता स�?र�? ह�?न बा�?�.�? समय',
            'home-event-title': 'बा�?बल पद �.ण�?ठस�?थ प�?रतिय�<�-िता २०८३',
            'home-event-subtitle': '�?�-�?ना�?�Yर �Yिम (Igniter Team)',
            
            // System roles
            'role-viewer': 'दर�?श�. (Viewer)',
            'role-judge': 'निर�?णाय�. (Judge)',
            'role-admin': 'स�?पर �?डमिन'
        },
        en: {
            // Header tabs
            'nav-org-home': '�Y?� Home',
            'nav-about': '�Y"- About Us',
            'nav-tournament-group': '�Y?? Tournament �-�',
            'nav-home': 'Dashboard',
            'nav-live-score': 'Live Result',
            'nav-participants': 'Participants',
            'nav-downloads': 'Downloads',
            'nav-notices': '�Y"" News',
            'nav-gallery': '�Y-��? Gallery',
            'nav-contact': '�Y"z Contact',
            'nav-judge': '�Y"? Judge Panel',
            'nav-admin': '�sT�? Admin Panel',
            'nav-login': '�Y"' Login',
            'logout-btn': '�Ys� Logout',
            
            // Countdown section
            'countdown-title': 'Time Remaining Until Competition Starts',
            'home-event-title': 'Bible Reading Memorization Contest 2026',
            'home-event-subtitle': 'Igniter Team �?� Into the Way of Jesus Christ',
            
            // System roles
            'role-viewer': 'Viewer (दर�?श�.)',
            'role-judge': 'Judge (निर�?णाय�.)',
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
        document.title = lang === 'en' ? 'Bible Memorization Contest - Igniter Team' : 'बा�?बल पद �.ण�?ठस�?थ प�?रतिय�<�-िता - �?�-�?ना�?�Yर �Yिम';

        // Translate countdown boxes labels
        const labels = document.querySelectorAll('.countdown-label');
        if (labels.length >= 4) {
            labels[0].textContent = lang === 'en' ? 'Days' : 'दिन';
            labels[1].textContent = lang === 'en' ? 'Hours' : '�~ण�?�Yा';
            labels[2].textContent = lang === 'en' ? 'Minutes' : 'मिन�?�Y';
            labels[3].textContent = lang === 'en' ? 'Seconds' : 'स�?�.�?न�?ड';
        }

        // Translate Stats Widgets
        const widgetTitles = document.querySelectorAll('.widget-title');
        const widgetDescs = document.querySelectorAll('.widget-desc');
        
        if (widgetTitles.length >= 3) {
            widgetTitles[0].textContent = lang === 'en' ? 'Total Participants' : '�.�?ल सहभा�-�?हर�, (Total Participants)';
            widgetTitles[1].textContent = lang === 'en' ? 'Total Regions (Illaka)' : 'सम�?बद�?ध �?ला�.ाहर�, (Total Regions)';
            widgetTitles[2].textContent = lang === 'en' ? 'Top Scorer Competitor' : 'सर�?व�<त�?�.�fष�?�Y प�?रतिय�<�-�? (Top Scorer)';
        }
        
        if (widgetDescs.length >= 3) {
            widgetDescs[0].textContent = lang === 'en' ? 'Competitors registered in the tournament' : 'प�?रतिय�<�-ितामा दर�?ता भ�?�.ा �oम�?मा प�?रतिस�?पर�?ध�?';
            widgetDescs[1].textContent = lang === 'en' ? '4 regions and newly added areas' : '४ �?ला�.ाहर�, र थप नया�? �.�?ष�?त�?रहर�,';
            
            const ranked = window.db.getRankedParticipants();
            if (ranked.length === 0) {
                widgetDescs[2].textContent = lang === 'en' ? 'Not evaluated yet' : '�.�?�^ म�,ल�?या�T�?�.न भ�?�.�< �>�^न';
            }
        }

        // Translate Section Titles (Dashboard Home)
        const top3LeaderTitle = document.getElementById('top-3-leaderboard')?.previousElementSibling;
        if (top3LeaderTitle) {
            top3LeaderTitle.textContent = lang === 'en' ? '�Y?? Top 3 Leaderboard' : '�Y?? श�?र�?ष ३ वि�o�?ताहर�, (Top 3 Leaderboard)';
        }

        const recentNoticesTitle = document.getElementById('recent-notices-container')?.previousElementSibling;
        if (recentNoticesTitle) {
            recentNoticesTitle.textContent = lang === 'en' ? '�Y"� Recent Notices & Updates' : '�Y"� भर�?�-र�^�.ा स�,�sनाहर�, (Recent Updates)';
        }

        // Translate Live Score Section
        const liveScoreHeader = document.querySelector('#section-live-score .action-row h2');
        if (liveScoreHeader) {
            liveScoreHeader.textContent = lang === 'en' ? 'Live Scoreboard & Ranks' : 'ला�?भ स�?�.�<रब�<र�?ड र श�?र�?ण�?�.रण (Live Rankings)';
        }

        const btnExport = document.querySelector('#section-live-score .action-row button[onclick*="exportLiveScores"]');
        if (btnExport) {
            btnExport.textContent = lang === 'en' ? '�Y"S Export Excel/CSV' : '�Y"S Excel/CSV डा�?नल�<ड';
        }

        const btnPrint = document.querySelector('#section-live-score .action-row button[onclick*="print"]');
        if (btnPrint) {
            btnPrint.textContent = lang === 'en' ? '�Y-��? Print Results Table' : '�Y-��? नति�oा प�?रिन�?�Y �-र�?न�?ह�<स�?';
        }

        // Translate table headers
        const tableThs = document.querySelectorAll('#section-live-score table th');
        if (tableThs.length >= 7) {
            tableThs[0].textContent = lang === 'en' ? 'Rank (स�?थान)' : 'स�?थान (Rank)';
            tableThs[1].textContent = lang === 'en' ? 'Competitor Name' : 'सहभा�-�?�.�< नाम (Name)';
            tableThs[2].textContent = lang === 'en' ? 'Church' : 'मण�?डल�? (Church)';
            tableThs[3].textContent = lang === 'en' ? 'Region (Illaka)' : '�?ला�.ा (Area)';
            tableThs[4].textContent = lang === 'en' ? 'Score Categories Breakdown' : 'श�?र�?ण�?�-त �.�,�. (Score Categories Breakdown)';
            tableThs[5].textContent = lang === 'en' ? 'Total Marks' : '�.�?ल प�?राप�?त �.�,�. (Total)';
            tableThs[6].textContent = lang === 'en' ? 'Action' : '�.ार�?य (Action)';
        }

        // Translate Search & Filters
        const searchInput = document.getElementById('p-search-input');
        if (searchInput) {
            searchInput.placeholder = lang === 'en' ? '�Y"? Search competitor name or church...' : '�Y"? सहभा�-�?�.�< नाम वा मण�?डल�?बा�Y �-�<�o�?न�?ह�<स�?...';
        }

        const illakaFilter = document.getElementById('p-filter-illaka');
        if (illakaFilter && illakaFilter.options.length > 0) {
            illakaFilter.options[0].textContent = lang === 'en' ? 'All Areas (सब�^ �?ला�.ाहर�,)' : 'सब�^ �?ला�.ाहर�, (All Areas)';
        }

        const pListHeader = document.querySelector('#section-participants .action-row h2');
        if (pListHeader) {
            pListHeader.textContent = lang === 'en' ? 'Participants Directory' : 'प�?रतिस�?पर�?ध�? स�,�s�? (Participants Directory)';
        }

        // Translate Downloads Section
        const dlHeader = document.querySelector('#section-downloads h2');
        if (dlHeader) {
            dlHeader.textContent = lang === 'en' ? '�Y"� Instruction Guidelines & Downloads' : '�Y"� निर�?द�?शि�.ा र साम�-�?र�? डा�?नल�<ड (Downloads Section)';
        }
        const dlDesc = document.querySelector('#section-downloads p');
        if (dlDesc) {
            dlDesc.textContent = lang === 'en' ? 'Download competition rules, Bible chapters study materials, and event schedules here.' : 'प�?रतिय�<�-ितासम�?बन�?ध�? नियमहर�,, बा�?बल �-ण�?डहर�, र �.ार�?यतालि�.ाहर�, यहा�?बा�Y डा�?नल�<ड �-र�?न स�.�?न�?ह�?न�?�>।';
        }

        // Translate Notice Section
        const nHeader = document.querySelector('#section-notices h2');
        if (nHeader) {
            nHeader.textContent = lang === 'en' ? '�Y"" Official Notice Board' : '�Y"" �?धि�.ारि�. स�,�sना ब�<र�?ड (Notice Board)';
        }
        const nDesc = document.querySelector('#section-notices p');
        if (nDesc) {
            nDesc.textContent = lang === 'en' ? 'The latest official tournament updates, schedules, and decisions are published here.' : '�.ार�?य�.�?रमसम�?बन�?ध�? प�>िल�?ला निर�?णय तथा स�,�sनाहर�, यहा�? प�?र�.ाशन �-रिन�?�>।';
        }

        // Translate Secure Login Card
        const loginHeader = document.querySelector('#section-login h2');
        if (loginHeader) {
            loginHeader.textContent = lang === 'en' ? 'Secure Portal Login' : 'स�?र�.�?षित प�?रणाल�? ल�-�?न';
        }
        const loginSub = document.querySelector('#section-login p');
        if (loginSub) {
            loginSub.textContent = lang === 'en' ? 'Enter judge or administrator credentials' : '�?डमिन वा निर�?णाय�. (Judge) विवरण प�?रविष�?�Y �-र�?न�?ह�<स�?';
        }
        const loginLabels = document.querySelectorAll('#section-login .form-label');
        if (loginLabels.length >= 2) {
            loginLabels[0].textContent = lang === 'en' ? 'Username (य�?�oरन�?म):' : 'य�?�oरन�?म (Username):';
            loginLabels[1].textContent = lang === 'en' ? 'Password (पासवर�?ड):' : 'पासवर�?ड (Password):';
        }
        const btnLoginSubmit = document.querySelector('#login-form button');
        if (btnLoginSubmit) {
            btnLoginSubmit.textContent = lang === 'en' ? '�Ys� Log In to Portal' : '�Ys� प�?रणाल�?मा प�?रव�?श �-र�?न�?ह�<स�?';
        }
        const loginHelp = document.querySelector('#section-login div p');
        if (loginHelp) {
            loginHelp.textContent = lang === 'en' ? '�Y"' Testing Credentials:' : '�Y"' पर�?�.�?षण�.ा ला�-ि सा�- विवरण (Credentials):';
        }

        // Translate Judge Portal Section
        const jHeader = document.querySelector('#section-judge .action-row h2');
        if (jHeader) {
            jHeader.textContent = lang === 'en' ? 'Judges Portal Score Sheet' : 'निर�?णाय�. �.�,�. प�?रविष�?�Yि तालि�.ा (Judges Portal)';
        }
        const jSub = document.querySelector('#section-judge .action-row p');
        if (jSub) {
            jSub.textContent = lang === 'en' ? 'Select a competitor below to input score evaluations.' : 'सहभा�-�? �sयन �-र�? तत�?�.ाल श�?र�?ण�?�-त �.�,�. प�?रविष�?�Y �-र�?न�?ह�<स�?।';
        }
        
        const judgeFilter = document.getElementById('judge-status-filter');
        if (judgeFilter && judgeFilter.options.length >= 3) {
            judgeFilter.options[0].textContent = lang === 'en' ? 'All Participants (सब�^ सहभा�-�?हर�,)' : 'सब�^ सहभा�-�?हर�, (All)';
            judgeFilter.options[1].textContent = lang === 'en' ? 'Pending Evaluation (बा�?�.�?)' : 'म�,ल�?या�,�.न बा�?�.�? (Pending)';
            judgeFilter.options[2].textContent = lang === 'en' ? 'Evaluated (म�,ल�?या�,�.न �-रि�?�.ा)' : 'म�,ल�?या�,�.न �-रि�?�.ा (Evaluated)';
        }

        // Translate Admin Sidebar
        const adminHeader = document.querySelector('#section-admin .action-row h2');
        if (adminHeader) {
            adminHeader.textContent = lang === 'en' ? '�sT�? Control Center (Admin Panel)' : '�sT�? नियन�?त�?रण �.�.�?ष (Admin Panel)';
        }
        
        const adminSubnavs = document.querySelectorAll('.admin-subnav-btn');
        if (adminSubnavs.length >= 5) {
            adminSubnavs[0].textContent = lang === 'en' ? '�Y'� Competitors (सहभा�-�?)' : '�Y'� सहभा�-�? व�?यवस�?थापन';
            adminSubnavs[1].textContent = lang === 'en' ? '�Y"? Regions (�?ला�.ा)' : '�Y"? �?ला�.ा व�?यवस�?थापन';
            adminSubnavs[2].textContent = lang === 'en' ? '�Y"� Announcements (स�,�sना)' : '�Y"� स�,�sना व�?यवस�?थापन';
            adminSubnavs[3].textContent = lang === 'en' ? '�Y"? Files & Downloads' : '�Y"? फा�?ल डा�?नल�<ड व�?यवस�?थापन';
            adminSubnavs[4].textContent = lang === 'en' ? '�Y>��? Settings & Backups' : '�Y>��? प�?रणाल�? स�?�Yि�T र ब�?या�.�.प';
        }
    };

    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            localStorage.setItem('lang', lang);
            window.translateUI(lang);
            window.showToast(lang === 'en' ? 'Language switched to English' : 'भाषा न�?पाल�?मा परिवर�?तन भय�<');
            
            // Re-render current SPA view to pull new language details instantly
            const activeNavBtn = document.querySelector('.nav-item-btn.active');
            if (activeNavBtn) navigateTo(activeNavBtn.id);
        });
    }

    // 2. HYBRID NAVIGATION ENGINE
    // Landing page: scroll-based with scroll-spy
    // Tournament/Admin/Judge: click-to-view with sub-nav
    
    const landingContainer = document.getElementById('landing-page-container');
    const tournamentNavBar = document.getElementById('tournament-nav-bar');
    const tournamentSections = ['section-home', 'section-live-score', 'section-participants', 'section-downloads', 'section-practice'];
    const systemSections = ['section-login', 'section-admin', 'section-judge', 'section-participant-dashboard'];
    const allHiddenSections = [...tournamentSections, ...systemSections, 'section-team'];
    
    let currentMode = 'landing'; // 'landing' | 'tournament' | 'system'

    // === SCROLL LINKS (Landing Page) ===
    document.querySelectorAll('a.nav-item-btn[data-scroll]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentMode !== 'landing') {
                switchToLandingMode();
            }
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Close mobile menu
            const navControls = document.querySelector('.nav-controls');
            if (navControls) navControls.classList.remove('show-mobile');
        });
    });

    // === SCROLL-SPY (highlight active nav link based on scroll position) ===
    function updateScrollSpy() {
        if (currentMode !== 'landing') return;
        const scrollSections = document.querySelectorAll('#landing-page-container .scroll-section');
        const headerHeight = 100;
        let currentSection = '';
        
        scrollSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= headerHeight + 50 && rect.bottom > headerHeight) {
                currentSection = section.id;
            }
        });
        
        if (currentSection) {
            document.querySelectorAll('a.nav-item-btn[data-scroll]').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + currentSection) {
                    link.classList.add('active');
                }
            });
        }
    }
    window.addEventListener('scroll', updateScrollSpy, { passive: true });

    // === TOURNAMENT MODE ===
    function switchToTournamentMode(targetSection) {
        currentMode = 'tournament';
        // Hide landing page
        if (landingContainer) landingContainer.style.display = 'none';
        // Hide all other sections
        allHiddenSections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        // Show tournament nav bar
        if (tournamentNavBar) tournamentNavBar.classList.remove('hidden');
        // Show target tournament section
        const target = targetSection || 'section-home';
        const targetEl = document.getElementById(target);
        if (targetEl) targetEl.classList.remove('hidden');
        // Update tournament nav active state
        document.querySelectorAll('.tournament-nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.target === target) btn.classList.add('active');
        });
        // Remove active from main nav scroll links
        document.querySelectorAll('a.nav-item-btn[data-scroll]').forEach(l => l.classList.remove('active'));
        // Initialize section data
        initTournamentSection(target);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.switchToTournamentMode = switchToTournamentMode;

    function initTournamentSection(sectionId) {
        if (sectionId === 'section-home') {
            renderDashboardStats();
            renderPublicTop3();
            renderPublicNotices();
            renderPublicPrizes();
            renderLiveScoreBoard();
        } else if (sectionId === 'section-live-score') {
            renderLiveScoreBoard();
        } else if (sectionId === 'section-participants') {
            renderPublicParticipants();
        } else if (sectionId === 'section-downloads') {
            renderPublicDownloads();
        } else if (sectionId === 'section-practice') {
            initPracticePortal();
        }
    }

    // === LANDING MODE ===
    function switchToLandingMode() {
        currentMode = 'landing';
        // Show landing page
        if (landingContainer) landingContainer.style.display = '';
        // Hide tournament nav bar
        if (tournamentNavBar) tournamentNavBar.classList.add('hidden');
        // Hide all tournament/system sections
        allHiddenSections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        // Re-initialize landing page data
        renderPublicContactInfo();
        renderPublicTeam();
        renderPublicGallerySlider();
        renderPublicNotices();
        renderHomeEventDetails();
        // Restore scroll-spy
        updateScrollSpy();
    }

    // === SYSTEM SECTIONS (Login, Admin, Judge) ===
    function switchToSystemSection(sectionId) {
        currentMode = 'system';
        // Hide landing page
        if (landingContainer) landingContainer.style.display = 'none';
        // Hide tournament nav bar
        if (tournamentNavBar) tournamentNavBar.classList.add('hidden');
        // Hide all sections
        allHiddenSections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        // Show target section
        const targetEl = document.getElementById(sectionId);
        if (targetEl) targetEl.classList.remove('hidden');
        // Remove active from main nav scroll links
        document.querySelectorAll('a.nav-item-btn[data-scroll]').forEach(l => l.classList.remove('active'));
        // Initialize section
        if (sectionId === 'section-admin' && window.adminPanel) window.adminPanel.init();
        if (sectionId === 'section-judge' && window.judgePanel) window.judgePanel.init();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // === EVENT LISTENERS ===
    
    // Tournament Enter button
    const tournamentEnterBtn = document.getElementById('nav-tournament-enter');
    if (tournamentEnterBtn) {
        tournamentEnterBtn.addEventListener('click', () => {
            switchToTournamentMode('section-home');
            const navControls = document.querySelector('.nav-controls');
            if (navControls) navControls.classList.remove('show-mobile');
        });
    }

    // Tournament nav buttons
    document.querySelectorAll('.tournament-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            // Hide all tournament sections
            tournamentSections.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
            // Show target
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.classList.remove('hidden');
            // Update active state
            document.querySelectorAll('.tournament-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Init data
            initTournamentSection(target);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Tournament back button
    const tournamentBackBtn = document.getElementById('tournament-back-btn');
    if (tournamentBackBtn) {
        tournamentBackBtn.addEventListener('click', () => {
            switchToLandingMode();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Brand section click �?' go to landing home
    const brandSection = document.querySelector('.brand-section');
    if (brandSection) {
        brandSection.addEventListener('click', () => {
            if (currentMode !== 'landing') {
                switchToLandingMode();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Login button
    const loginNavBtn2 = document.getElementById('nav-login');
    if (loginNavBtn2) {
        loginNavBtn2.addEventListener('click', () => {
            switchToSystemSection('section-login');
        });
    }

    // Admin button
    const adminNavBtn2 = document.getElementById('nav-admin');
    if (adminNavBtn2) {
        adminNavBtn2.addEventListener('click', () => {
            switchToSystemSection('section-admin');
            const navControls = document.querySelector('.nav-controls');
            if (navControls) navControls.classList.remove('show-mobile');
        });
    }

    // Judge button
    const judgeNavBtn2 = document.getElementById('nav-judge');
    if (judgeNavBtn2) {
        judgeNavBtn2.addEventListener('click', () => {
            switchToSystemSection('section-judge');
            const navControls = document.querySelector('.nav-controls');
            if (navControls) navControls.classList.remove('show-mobile');
        });
    }

    // 2.5 Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navControls = document.querySelector('.nav-controls');
    if (mobileToggle && navControls) {
        mobileToggle.addEventListener('click', () => {
            navControls.classList.toggle('show-mobile');
        });
    }

    // Make router available globally
    window.spaRouter = {
        navigateTo: function(navId) {
            if (navId === 'nav-home' || navId === 'nav-live-score' || navId === 'nav-participants' || navId === 'nav-downloads') {
                const sectionMap = {
                    'nav-home': 'section-home',
                    'nav-live-score': 'section-live-score',
                    'nav-participants': 'section-participants',
                    'nav-downloads': 'section-downloads'
                };
                switchToTournamentMode(sectionMap[navId]);
            } else if (navId === 'nav-admin') {
                switchToSystemSection('section-admin');
            } else if (navId === 'nav-judge') {
                switchToSystemSection('section-judge');
            } else if (navId === 'nav-login') {
                switchToSystemSection('section-login');
            } else {
                switchToLandingMode();
            }
        }
    };

    // �"?�"? Auto-refresh when Firebase pushes a live update �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?
    window.addEventListener('db_updated', () => {
        if (currentMode === 'tournament') {
            const activeBtn = document.querySelector('.tournament-nav-btn.active');
            if (activeBtn) initTournamentSection(activeBtn.dataset.target);
        } else if (currentMode === 'system') {
            // Re-init admin/judge if active
            const adminEl = document.getElementById('section-admin');
            if (adminEl && !adminEl.classList.contains('hidden') && window.adminPanel) window.adminPanel.init();
            const judgeEl = document.getElementById('section-judge');
            if (judgeEl && !judgeEl.classList.contains('hidden') && window.judgePanel) window.judgePanel.init();
        } else {
            // Landing mode - refresh visible content
            renderPublicNotices();
            renderPublicGallerySlider();
            renderPublicTeam();
            renderHomeEventDetails();
        }
        // Always refresh ticker and portal
        renderTicker();
        renderTournamentPortal();
    });


    // 3. User Mock Authentication System
    const loginForm = document.getElementById('login-form');
    const roleBadge = document.getElementById('user-role-badge');
    const adminNavBtn = document.getElementById('nav-admin');
    const judgeNavBtn = document.getElementById('nav-judge');
    const logoutBtn = document.getElementById('logout-btn');
    const loginNavBtn = document.getElementById('nav-login');

    // Default Role
    window.currentUser = JSON.parse(sessionStorage.getItem('current_user')) || { role: 'viewer', name: '�.तिथि' };

    function updateAuthUI() {
        if (roleBadge) {
            roleBadge.textContent = window.currentUser.role === 'superadmin' ? 'स�?पर �?डमिन' : 
                                    window.currentUser.role === 'judge' ? 'निर�?णाय�. (Judge)' : 'दर�?श�. (Viewer)';
        }

        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const showMenuToggle = window.currentUser.role === 'superadmin' || window.currentUser.role === 'judge';

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

        if (mobileMenuToggle) {
            if (showMenuToggle) {
                mobileMenuToggle.classList.remove('hidden');
            } else {
                mobileMenuToggle.classList.add('hidden');
            }
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const pass = document.getElementById('login-password').value.trim();
            const authSettings = window.db.getAuthSettings();

            if (username === 'admin' && pass === authSettings.admin_pass) {
                window.currentUser = { role: 'superadmin', name: 'स�?पर �?डमिन' };
                sessionStorage.setItem('current_user', JSON.stringify(window.currentUser));
                showToast('स�?पर �?डमिन सफलताप�,र�?व�. ल�-�?न भय�<!');
                updateAuthUI();
                navigateTo('nav-admin');
            } else if (username === 'judge' && pass === authSettings.judge_pass) {
                window.currentUser = { role: 'judge', name: 'पास�?�Yर प�?र�.ाश लिम�?ब�?' }; // pre-seeded judge
                sessionStorage.setItem('current_user', JSON.stringify(window.currentUser));
                showToast('निर�?णाय�. सफलताप�,र�?व�. ल�-�?न भय�<!');
                updateAuthUI();
                navigateTo('nav-judge');
            } else {
                showToast('�-लत य�?�oरन�?म वा पासवर�?ड!', 'danger');
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
                    <h3 class="modal-title">�Y"' पासवर�?ड प�?न: प�?राप�?ति (Reset Password)</h3>
                    <button class="modal-close" onclick="closeActiveModals()">�-</button>
                </div>
                <div class="modal-body" id="reset-modal-body">
                    <!-- Step 1: Select Role & Google Sign-In button -->
                    <div id="reset-step-1">
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
                            �?फ�?न�< �?डमिन वा �o�o पासवर�?ड रिस�?�Y �-र�?न�.ा ला�-ि सम�?बन�?धित �-ाता र�<�o�?न�?ह�<स�? र Google �-ाता मार�?फत स�?र�.�?षित र�,पमा ल�-�?न �-र�?न�?ह�<स�?।
                        </p>
                        
                        <div class="form-group">
                            <label class="form-label" for="reset-role-select">�.�?न �-ाता रिस�?�Y �-र�?न�?? (Select Account):</label>
                            <select id="reset-role-select" class="form-control" style="font-weight: 600;">
                                <option value="admin">�Y"� स�?पर �?डमिन (Super Admin)</option>
                                <option value="judge">�Y"? निर�?णाय�. (Judge)</option>
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
                                Sign in with Google (�-�,�-ल मार�?फत ल�-�?न)
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeActiveModals()">रद�?द �-र�?न�?ह�<स�?</button>
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

        const roleText = role === 'admin' ? 'स�?पर �?डमिन (Super Admin)' : 'निर�?णाय�. (Judge)';
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
                                �Y'� <b>Recovery Tip:</b><br>
                                ${configuredEmail ? `तपा�^�,�.�< ला�-ि स�?�Y �-रि�?�.�< रि�.भर�? �?म�?ल: <b>${configuredEmail}</b> ह�<।` : `तपा�^�,ल�? रि�.भर�? �?म�?ल स�?�Y �-र�?न�?भ�?�.�< �>�^न। पर�?�.�?षण�.ा ला�-ि डिफल�?�Y �^म�?ल <b>${fallbackEmail}</b> प�?रय�<�- �-र�?न�?ह�<स�?।`}
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
                showToast('�.�fपया �^म�?ल ठ�?�-ाना प�?रविष�?�Y �-र�?न�?ह�<स�?!', 'warning');
                return;
            }

            if (emailInput === targetEmail) {
                showToast('Google प�?रमाण�?�.रण सफल भय�<!', 'success');
                popup.remove();
                showPasswordResetForm(role);
            } else {
                showToast('�?म�?ल ठ�?�-ाना मिल�?न!', 'danger');
            }
        });
    }

    function showPasswordResetForm(role) {
        const modalBody = document.getElementById('reset-modal-body');
        if (!modalBody) return;

        const roleText = role === 'admin' ? 'स�?पर �?डमिन (Super Admin)' : 'निर�?णाय�. (Judge)';

        modalBody.innerHTML = `
            <div id="reset-step-2">
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
                    �-�,�-ल �-ाता प�?रमाण�?�.रण प�,रा भय�<! �.ब <b style="color: var(--text-heading);">${roleText}</b> �.ा ला�-ि नया�? स�?र�.�?षित पासवर�?ड प�?रविष�?�Y �-र�?न�?ह�<स�?।
                </p>
                
                <form id="password-change-form">
                    <div class="form-group">
                        <label class="form-label" for="reset-new-pass">नया�? पासवर�?ड (New Password):</label>
                        <input type="password" id="reset-new-pass" class="form-control" required placeholder="नया�? पासवर�?ड प�?रविष�?�Y �-र�?न�?ह�<स�?" minlength="4">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="reset-confirm-pass">पासवर�?ड प�?न: प�?ष�?�Yि �-र�?न�?ह�<स�? (Confirm Password):</label>
                        <input type="password" id="reset-confirm-pass" class="form-control" required placeholder="पासवर�?ड प�?न: �Yा�?प �-र�?न�?ह�<स�?">
                    </div>
                    
                    <div style="margin-top: 1.5rem;">
                        <button type="submit" class="btn btn-gold" style="width: 100%;">�Y'� पासवर�?ड परिवर�?तन �-र�?न�?ह�<स�?</button>
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
                    showToast('पासवर�?डहर�, मिल�?नन�?! (Passwords do not match)', 'danger');
                    return;
                }

                const updates = {};
                if (role === 'admin') {
                    updates.admin_pass = newPass;
                } else {
                    updates.judge_pass = newPass;
                }

                window.db.saveAuthSettings(updates);
                showToast('पासवर�?ड सफलताप�,र�?व�. परिवर�?तन �-रिय�<!', 'success');
                closeActiveModals();
                
                window.dispatchEvent(new Event('db_updated'));
            });
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.currentUser = { role: 'viewer', name: '�.तिथि' };
            sessionStorage.removeItem('current_user');
            showToast('सफलताप�,र�?व�. ल�-�?�?�Y भय�<!');
            updateAuthUI();
            navigateTo('nav-home');
        });
    }

    // 4. Live Notice Ticker Runner
    // Helper: Build Google Maps directions URL from embed URL or address
    function buildMapDirectionsUrl(embedUrl, address) {
        // Try to extract coordinates from Google Maps embed URL
        let lat = null, lng = null;

        if (embedUrl) {
            // Pattern 1: !2d<lng>!3d<lat> (most common in embeds)
            const coordMatch = embedUrl.match(/!2d(-?[\d.]+)!3d(-?[\d.]+)/);
            if (coordMatch) {
                lng = coordMatch[1];
                lat = coordMatch[2];
            }
            
            // Pattern 2: @<lat>,<lng>
            if (!lat) {
                const atMatch = embedUrl.match(/@(-?[\d.]+),(-?[\d.]+)/);
                if (atMatch) {
                    lat = atMatch[1];
                    lng = atMatch[2];
                }
            }

            // Pattern 3: q=<lat>,<lng> or q=<place>
            if (!lat) {
                const qMatch = embedUrl.match(/[?&]q=(-?[\d.]+),(-?[\d.]+)/);
                if (qMatch) {
                    lat = qMatch[1];
                    lng = qMatch[2];
                }
            }

            // Pattern 4: pb= with lat/lng
            if (!lat) {
                const pbMatch = embedUrl.match(/!1d(-?[\d.]+)!2d(-?[\d.]+)/);
                if (pbMatch) {
                    lat = pbMatch[2];
                    lng = pbMatch[1];
                }
            }
        }

        // Build directions URL
        if (lat && lng) {
            return 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng;
        } else if (address) {
            return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(address);
        }
        return 'https://www.google.com/maps';
    }

    function renderTicker() {
        const ticker = document.getElementById('ticker-marquee');
        if (!ticker) return;
        
        const notices = window.db.getNotices().filter(n => n.is_ticker);
        if (notices.length === 0) {
            ticker.innerHTML = '<span class="ticker-item">बा�?बल पद �.ण�?ठस�?थ प�?रतिय�<�-ितामा यहा�?हर�,ला�^ स�?वा�-त �>!</span>';
            return;
        }

        const tickerHtml = notices.map(n => `<span class="ticker-item">�Y"� ${n.title_ne}</span>`).join('');
        ticker.innerHTML = tickerHtml;
    }

    // 5. Event Countdown Timer Engine
    let timerInterval = null;
    function startCountdown() {
        if (timerInterval) clearInterval(timerInterval);

        const updateTimer = () => {
            const settings = window.db.getSettings();
            const wrapper = document.getElementById('org-countdown-wrapper');
            if (settings.show_countdown === false || !settings.event_date || settings.event_date.trim() === '') {
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
                document.getElementById('countdown-title').textContent = 'प�?रतिय�<�-िता समाप�?त भ�?�.�< �> वा स�?र�? भ�?स�.�?�.�< �>।';
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

    // 5.5 Render Event Details on Homepage (controlled by admin toggle)
    function renderHomeEventDetails() {
        const settings = window.db.getSettings();
        const wrapper = document.getElementById('home-event-details-wrapper');
        if (!wrapper) return;

        // Check if admin enabled it
        if (!settings.show_event_homepage) {
            wrapper.classList.add('hidden');
            return;
        }

        // Check if there's any event data to show
        if (!settings.event_address && !settings.event_time && !settings.event_date) {
            wrapper.classList.add('hidden');
            return;
        }

        wrapper.classList.remove('hidden');

        // Populate fields
        const dateObj = new Date(settings.event_date);
        const dateEl = document.getElementById('home-event-date');
        if (dateEl && !isNaN(dateObj.getTime())) {
            dateEl.textContent = dateObj.toLocaleDateString('ne-NP', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        const timeEl = document.getElementById('home-event-time');
        if (timeEl) timeEl.textContent = settings.event_time || 'निर�?धारित �>�^न';

        const addressEl = document.getElementById('home-event-address');
        if (addressEl) addressEl.textContent = settings.event_address || 'निर�?धारित �>�^न';

        // Map
        const mapEl = document.getElementById('home-event-map');
        const mapDirLink = document.getElementById('home-map-directions-link');
        if (mapEl) {
            if (settings.event_location_map) {
                mapEl.src = settings.event_location_map;
                mapEl.parentElement.style.display = 'block';
                if (mapDirLink) mapDirLink.href = buildMapDirectionsUrl(settings.event_location_map, settings.event_address);
            } else {
                mapEl.parentElement.style.display = 'none';
            }
        }

        // Church Image
        const imgEl = document.getElementById('home-church-image');
        if (imgEl) {
            if (settings.event_church_image) {
                window.resolveUrl(settings.event_church_image).then(src => {
                    imgEl.src = src;
                    imgEl.parentElement.style.display = 'block';
                });
            } else {
                imgEl.parentElement.style.display = 'none';
            }
        }
    }

    // 5.6 Render Tournament Portal Button (controlled by admin toggle)
    function renderTournamentPortal() {
        const settings = window.db.getSettings();
        const wrapper = document.getElementById('org-participant-portal-wrapper');
        if (!wrapper) return;
        if (settings.show_tournament_portal !== false) {
            wrapper.classList.remove('hidden');
        } else {
            wrapper.classList.add('hidden');
        }
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
        
        document.getElementById('dashboard-event-time').textContent = settings.event_time || 'निर�?धारित �>�^न';
        document.getElementById('dashboard-event-address').textContent = settings.event_address || 'निर�?धारित �>�^न';
        
        const mapEl = document.getElementById('dashboard-event-map');
        const dashMapDirLink = document.getElementById('dashboard-map-directions-link');
        if (settings.event_location_map) {
            mapEl.src = settings.event_location_map;
            mapEl.parentElement.style.display = 'block';
            if (dashMapDirLink) dashMapDirLink.href = buildMapDirectionsUrl(settings.event_location_map, settings.event_address);
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
            topScorerDesc.textContent = `${ranked[0].total_score} �.�,�. (${ranked[0].church_name})`;
        } else {
            topScorerVal.textContent = 'N/A';
            topScorerDesc.textContent = '�.�?�^ म�,ल�?या�,�.न भ�?�.�< �>�^न';
        }
    }

    function renderPublicTop3() {
        const ranked = window.db.getRankedParticipants();
        // Leaderboard Top 3 Cards
        const top3Grid = document.getElementById('top-3-leaderboard');
        if (!top3Grid) return;
        top3Grid.innerHTML = '';

        if (ranked.length === 0) {
            top3Grid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 2rem; color: var(--text-muted);">�.�,�. प�?रविष�?�Yि स�?र�? भ�?प�>ि यहा�? �?त�?�.�fष�?�Y ३ प�?रतिय�<�-�? द�?�-िन�?�>।</div>';
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
                ${idx === 0 ? '<div class="champion-ribbon">�Y''</div>' : ''}
                <div class="text-center">
                    <img class="avatar-large" ${isFS ? `data-fs-key="${fsKey}"` : ''} src="${imgSrc}" alt="${p.name_ne}" onerror="this.src='${placeholder}'">
                    <span class="rank-badge rank-${idx + 1}" style="margin-bottom: 0.5rem;">${idx + 1}</span>
                    <h3 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${p.name_ne}</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${p.church_name}</p>
                    <p style="font-size: 0.8rem; font-weight: 600; color: var(--gold); margin-top: 0.25rem;">�?ला�.ा: ${p.illaka_name}</p>
                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-heading); margin-top: 0.75rem; font-family: var(--font-heading);">
                        ${p.total_score} <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">�.�,�.</span>
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
            container.innerHTML = '<div style="color: var(--text-muted);">�.�?न�^ स�,�sनाहर�, �?पलब�?ध �>�^नन�?।</div>';
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
            lockIndicator.textContent = settings.lock_scores ? '�Y"' �.�,�. प�?रविष�?�Yि ल�. �-रि�?�.�< �>' : '�YY� ला�?भ �.�,�. प�?रविष�?�Yि �-�?ला �>';
        }

        if (ranked.length === 0) {
            container.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-muted);">�.�?न�^ प�?रतिय�<�-�?हर�, म�,ल�?या�,�.न �-रि�?�.ा �>�^नन�? वा �.�,�. प�?रविष�?�Yि �-रि�?�.�< �>�^न।</td></tr>`;
            return;
        }

        const categories = window.db.getScoreCategories();

        ranked.forEach((p, idx) => {
            const rankColor = idx < 3 ? 'var(--gold)' : 'var(--text-muted)';
            const rankIcon = idx === 0 ? '�Y''' : (idx === 1 ? '�Y�^' : (idx === 2 ? '�Y�?' : ''));
            
            const rounds = window.db.getRounds();
            let breakdownHtml = rounds.map(r => {
                const marks = p.round_scores[r.id] || 0;
                const shortName = r.name.substring(0, 15);
                return `<span style="font-size: 0.75rem; background: var(--bg-main); padding: 0.1rem 0.3rem; border-radius: 4px; margin-right: 0.25rem;">${shortName}: ${marks}</span>`;
            }).join('');

            const eliminatedBadge = p.eliminated ? '<br><span class="role-badge warning" style="margin-top: 0.25rem;">बाहिरि�?�.�< (Eliminated)</span>' : '';

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
                <td><button class="btn btn-outline btn-sm no-print" onclick="viewParticipantDetails('${p.id}')">�Y"? विवरण</button></td>
            `;
            container.appendChild(tr);
        });
    }

    // Export scores to CSV
    window.exportLiveScoresToExcel = function() {
        const ranked = window.db.getRankedParticipants();
        if (ranked.length === 0) {
            showToast('निर�?यात �-र�?न �.�?न�^ डा�Yा �>�^न!', 'danger');
            return;
        }

        const rounds = window.db.getRounds();
        
        // Define CSV Headers
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for Nepali text in Excel
        csvContent += "Rank (स�?थान),Name (सहभा�-�?),Church (मण�?डल�?),Illaka (�?ला�.ा),Age Group (सम�?ह),Status (स�?थिति),";
        rounds.forEach(r => {
            csvContent += `${r.name.replace(/,/g, '')},`;
        });
        csvContent += "Total Score (�.�?ल �.�,�.)\n";

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
        showToast('नति�oा सफलताप�,र�?व�. Excel/CSV मा निर�?यात भय�<!');
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
            container.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 3rem; color: var(--text-muted);">�.�?न�^ सहभा�-�? फ�?ला पर�?न।</div>';
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
                        <span style="font-size: 0.75rem; color: var(--text-muted);">�?म�?र सम�?ह:</span>
                        <div style="font-size: 0.85rem; font-weight: 700;">${p.age_group}</div>
                    </div>
                    
                    <div class="text-right">
                        <span style="font-size: 0.75rem; color: var(--text-muted);">�.�,�. स�?थिति:</span>
                        <div>
                            ${p.eliminated ? '<span class="role-badge warning">बाहिरि�?�.�< (Eliminated)</span>' : (hasEvaluated ? `<span class="role-badge success">${scoreObj.total_score} �.�,�. (Rank: ${scoreObj.rank})</span>` : '<span class="role-badge" style="background: rgba(100,116,139,0.1); color: var(--text-muted); border: 1px solid var(--border)">बा�?�.�?</span>')}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${hasEvaluated ? `
                        <button class="btn btn-gold btn-sm" style="flex: 1; min-width: 120px;" onclick="viewCertificateModal('${p.id}', false)">
                            �Y?? प�?राप�?ति प�?रमाणपत�?र
                        </button>
                        <button class="btn btn-outline btn-sm" style="flex: 1; min-width: 120px;" onclick="viewParticipantDetails('${p.id}')">
                            �Y"S स�?�.�<र �.ार�?ड
                        </button>
                    ` : ''}
                    <button class="btn btn-primary btn-sm" style="flex: 1; min-width: 120px;" onclick="viewCertificateModal('${p.id}', true)">
                        �YZ" सहभा�-िता प�?रमाणपत�?र
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
            container.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 2rem; color: var(--text-muted);">�.�?न�^ डा�?नल�<ड साम�-�?र�?हर�, �?पलब�?ध �>�^नन�?।</div>';
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
                    �?�? डा�?नल�<ड �-र�?न�?ह�<स�?
                </button>
            `;
            container.appendChild(card);
        });
    }

    window.triggerDownload = function(id) {
        const materials = window.db.getMaterials();
        const m = materials.find(x => x.id === id);
        if (!m || !m.file_url || m.file_url === '#') {
            showToast('यस साम�-�?र�?�.�< फा�?ल �?पलब�?ध �>�^न।', 'danger');
            return;
        }

        if (m.file_url.startsWith('http')) {
            // External URL (Google Drive, etc.)
            window.open(m.file_url, '_blank');
        } else if (m.file_url.startsWith('filestore://')) {
            // File stored in IndexedDB
            const fsKey = m.file_url.slice('filestore://'.length);
            window.FileStore.get(fsKey).then(data => {
                if (!data) { showToast('फा�?ल फ�?ला पर�?न!', 'danger'); return; }
                let ext = m.file_type ? m.file_type.toLowerCase() : 'file';
                if (ext === 'link' || ext === 'external') ext = 'pdf';
                const a = document.createElement('a');
                a.href = data;
                a.download = `${m.title_ne.replace(/ /g, '_')}.${ext}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showToast(`'${m.title_ne}' डा�?नल�<ड स�?र�? भय�<!`);
            }).catch(() => showToast('फा�?ल डा�?नल�<ड �-र�?न समस�?या भय�<!', 'danger'));
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
            showToast(`'${m.title_ne}' डा�?नल�<ड स�?र�? भय�<!`);
        } else {
            showToast('यस साम�-�?र�?�.�< फा�?ल �?पलब�?ध �>�^न।', 'danger');
        }
    };

    // 10. Render Public Notices
    function renderPublicNotices() {
        const container = document.getElementById('public-notices-container');
        if (!container) return;
        container.innerHTML = '';

        const notices = window.db.getNotices();
        if (notices.length === 0) {
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">हाल �.�?न�^ स�,�sनाहर�, प�?र�.ाशित �>�^नन�?।</div>';
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
                <p style="color: var(--text-main); font-size: 0.95rem;">${n.content_ne || 'विवरण �?पलब�?ध �>�^न।'}</p>
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
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">�.�?न�^ प�?रस�?�.ार �~�<षणा �-रि�?�.�< �>�^न।</div>';
            return;
        }

        prizes.forEach((p, idx) => {
            const colors = ['#0a3064', '#15803d', '#b45309', '#64748b'];
            const color = colors[idx % colors.length];
            
            const card = document.createElement('div');
            card.className = 'card card-accent';
            card.style.textAlign = 'center';
            card.innerHTML = `
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${idx === 0 ? '�Y??' : (idx === 1 ? '�Y�^' : (idx === 2 ? '�Y�?' : '�YZ-�?'))}</div>
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
                slider.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">�.�?न�^ तस�?बिर �?पलब�?ध �>�^न।</div>';
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
            container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted); grid-column: 1 / -1;">�.�?न�^ �Yिम सदस�?य थपि�?�.�< �>�^न।</div>';
            return;
        }

        const topMembers = team.filter(t => t.group === 'top').sort((a, b) => (a.order || 0) - (b.order || 0));
        const downMembers = team.filter(t => t.group !== 'top').sort((a, b) => (a.order || 0) - (b.order || 0));

        function createCard(t) {
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
            return card;
        }

        topMembers.forEach(t => {
            container.appendChild(createCard(t));
        });

        if (topMembers.length > 0 && downMembers.length > 0) {
            const divider = document.createElement('div');
            divider.style.gridColumn = '1 / -1';
            divider.style.display = 'flex';
            divider.style.alignItems = 'center';
            divider.style.justifyContent = 'center';
            divider.style.margin = '2.5rem 0 1.5rem 0';
            divider.style.width = '100%';
            divider.innerHTML = '<div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: 0.7;"></div>';
            container.appendChild(divider);
        }

        downMembers.forEach(t => {
            container.appendChild(createCard(t));
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

        if (!p || !scoreObj) {
            // Show a premium helpful error modal if the participant doesn't exist in this browser's database (common deployment sync issue)
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.onclick = (e) => { if (e.target === modal) closeActiveModals(); };
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 410px; border-top: 4px solid var(--danger);">
                    <div class="modal-header" style="background: var(--danger); border-bottom: none;">
                        <h3 class="modal-title">? ?????? ???? ???? (Not Found)</h3>
                        <button class="modal-close" onclick="closeActiveModals()">�</button>
                    </div>
                    <div class="modal-body text-center" style="padding: 2rem 1.5rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">???</div>
                        <h3 style="color: var(--danger); margin-bottom: 0.75rem;">???????? ????? ???? ????!</h3>
                        <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
                            ??????? ?????? QR ????? ?????? ID (<b>${participantId}</b>) ?? ??????/??????? ??????? ????????? ???? ?????
                        </p>
                        
                        <div style="text-align: left; background: var(--bg-main); border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius-sm); font-size: 0.78rem; line-height: 1.45;">
                            ?? <b>??? ??? ???? (Why did this happen):</b><br>
                            ?? ??????????? <b>??????-??????</b> (Offline-first) ?????? ???? ???????? ????? ??????? ????????? <code>localStorage</code> ?? ????? ??????? ??????<br><br>
                            ?? <b>????? ???? ??????? (How to Sync):</b><br>
                            ?. ??? ??????????? ?????? ????? ????????? ????, ?????? <b>????? ??????</b>?? ?????????<br>
                            ?. ?? <b>??????? ????? ? ???????</b> ?? ??? <b>??????? JSON ??????? ?????????</b>?<br>
                            ?. ??????? ?? ????? ????? ???????? ?? ???? ??????? ???? <b>???????????? (Restore)</b> ??????????
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-danger" style="width: 100%;" onclick="closeActiveModals()">???? ????????? (Close)</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            return;
        }

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
                    <h3 class="modal-title">?????? ????????? ?????</h3>
                    <button class="modal-close" onclick="closeActiveModals()">�</button>
                </div>
                <div class="modal-body" id="score-print-area">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <img class="avatar-large" src="${p.photo_url || 'https://via.placeholder.com/120'}" alt="${p.name_ne}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%230a3064%22/><text x=%2250%22 y=%2255%22 font-family=%22sans-serif%22 font-size=%2235%22 fill=%22white%22 text-anchor=%22middle%22>${p.name_ne[0]}</text></svg>'">
                        <h2 style="color: var(--text-heading);">${p.name_ne}</h2>
                        <p style="color: var(--text-muted);">${p.church_name}</p>
                        <p style="color: var(--gold); font-weight: 600; font-size: 0.9rem;">${scoreObj.illaka_name} | ??????: ${scoreObj.rank}</p>
                    </div>
                    
                    <h4 style="margin-bottom: 0.75rem; border-bottom: 2px solid var(--gold); padding-bottom: 0.25rem;">?????? ??? ?????:</h4>
                    <div style="margin-bottom: 1.5rem;">
                        ${categoriesHtml}
                    </div>
                    
                    <div style="background: var(--gold-light); color: #000; padding: 1rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 800; font-size: 1.1rem;">??? ??????? ???:</span>
                        <span style="font-weight: 900; font-size: 1.8rem; font-family: var(--font-heading);">${scoreObj.total_score}</span>
                    </div>
                </div>
                <div class="modal-footer no-print">
                    <button class="btn btn-outline" onclick="closeActiveModals()">???? ?????????</button>
                    <button class="btn btn-gold" onclick="window.printScoreCard()">?? ??????? ????? ?????</button>
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
                        <p style="font-size: 0.85rem; color: var(--gold); font-weight: bold; text-transform: uppercase;">????? ?? ??????? ??????????? - ????? ?????</p>
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
        
        const title = isParticipation ? '?????????? ??????????' : '???????? ?????????? (Achievement)';
        
        modal.innerHTML = `
            <div class="modal-content modal-content-lg">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="closeActiveModals()">�</button>
                </div>
                <div class="modal-body text-center" style="background: #e2e8f0; overflow-x: auto; padding: 2rem;">
                    <canvas id="modal-certificate-canvas" style="max-width: 100%; height: auto; display: block; margin: 0 auto; box-shadow: var(--shadow-premium); border-radius: 4px;"></canvas>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeActiveModals()">???? ?????????</button>
                    <button class="btn btn-gold" onclick="downloadCertificate('${p.name_ne}', ${isParticipation})">?? ??????? ??????????</button>
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
                rank: scoreObj ? (scoreObj.rank === 1 ? '????? (1st)' : scoreObj.rank === 2 ? '??????? (2nd)' : scoreObj.rank === 3 ? '????? (3rd)' : `${scoreObj.rank}?? (${scoreObj.rank}th)`) : '',
                ageGroup: p.age_group,
                isParticipation: isParticipation
            });
        }, 50);
    };

    window.downloadCertificate = function(name, isParticipation) {
        const prefix = isParticipation ? '????????_????' : '???????_????';
        window.CertificateGenerator.download('modal-certificate-canvas', `${prefix}_${name.replace(/\s+/g, '_')}.png`);
        showToast('?????????? ??????????? ??????? ???!');
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
            <span>${type === 'danger' ? '?' : type === 'warning' ? '??' : '?'} ${msg}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    };

    // Contact Form Submit Handler
    const contactForm = document.getElementById('public-contact-form');
    if (contactForm) {
        // Remove the inline onsubmit handler in HTML from earlier and bind it properly here
        contactForm.onsubmit = (e) => {
            e.preventDefault();
            const inputs = contactForm.querySelectorAll('input, textarea');
            if (inputs[0].value.trim() && inputs[1].value.trim() && inputs[2].value.trim()) {
                window.db.addMessage({
                    name: inputs[0].value,
                    contact: inputs[1].value,
                    message: inputs[2].value
                });
                showToast(localStorage.getItem('lang') === 'en' ? 'Message sent successfully! We will contact you soon.' : '??????? ?????? ??????????? ??????! ???? ?????? ??????? ?????????', 'success');
                contactForm.reset();
            }
        };
    }

    // ==========================================================
    // ?? PARTICIPANT SELF-PRACTICE & SPEECH RECITATION ENGINE
    // ==========================================================
    let activePracticeMode = 'flashcard'; // 'flashcard' | 'fill' | 'prompt'
    let selectedPracticeVerse = null;
    let recognitionInstance = null;
    let isRecordingRecitation = false;

    function initPracticePortal() {
        const verses = window.db.getPracticeVerses();
        const selectEl = document.getElementById('practice-verse-select');
        if (!selectEl) return;

        // Populate verses dropdown
        selectEl.innerHTML = '';
        verses.forEach((v, index) => {
            const opt = document.createElement('option');
            opt.value = v.id;
            const lang = localStorage.getItem('lang') || 'ne';
            opt.textContent = lang === 'en' ? `${v.ref_en} (${v.text_en.substring(0, 20)}...)` : `${v.ref_ne} (${v.text_ne.substring(0, 15)}...)`;
            if (index === 0) opt.selected = true;
            selectEl.appendChild(opt);
        });

        // Dropdown listener
        selectEl.addEventListener('change', (e) => {
            loadSelectedVerse(e.target.value);
        });

        // Mode switch listeners
        document.querySelectorAll('.practice-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.practice-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activePracticeMode = btn.dataset.mode;
                renderActivePracticeMode();
            });
        });

        // Load initial verse
        if (verses.length > 0) {
            loadSelectedVerse(verses[0].id);
        }

        // Initialize Speech recognition elements
        initSpeechRecitation();

        // Initialize notification simulation triggers
        initAlertSimulators();
    }

    function loadSelectedVerse(id) {
        const verses = window.db.getPracticeVerses();
        selectedPracticeVerse = verses.find(v => v.id === id) || verses[0];

        const refDisplay = document.getElementById('practice-ref-display');
        const textDisplay = document.getElementById('practice-original-text');
        
        if (refDisplay && textDisplay && selectedPracticeVerse) {
            const lang = localStorage.getItem('lang') || 'ne';
            refDisplay.textContent = lang === 'en' ? selectedPracticeVerse.ref_en : selectedPracticeVerse.ref_ne;
            textDisplay.textContent = lang === 'en' ? selectedPracticeVerse.text_en : selectedPracticeVerse.text_ne;
        }

        // Clear speech boxes
        const transp = document.getElementById('practice-transcription');
        const evalBox = document.getElementById('practice-evaluation');
        if (transp) transp.textContent = '';
        if (evalBox) evalBox.textContent = '';

        renderActivePracticeMode();
    }

    function renderActivePracticeMode() {
        const boardContent = document.getElementById('practice-board-content');
        const boardFooter = document.getElementById('practice-board-footer');
        const boardModeBadge = document.getElementById('practice-board-mode');
        
        if (!boardContent || !boardFooter || !selectedPracticeVerse) return;

        const lang = localStorage.getItem('lang') || 'ne';
        const verseText = lang === 'en' ? selectedPracticeVerse.text_en : selectedPracticeVerse.text_ne;
        const verseRef = lang === 'en' ? selectedPracticeVerse.ref_en : selectedPracticeVerse.ref_ne;

        // Reset workspace
        boardContent.innerHTML = '';
        boardFooter.innerHTML = '';

        if (activePracticeMode === 'flashcard') {
            boardModeBadge.textContent = lang === 'en' ? 'Flashcard' : '????????????';
            
            const card = document.createElement('div');
            card.className = 'flashcard-box';
            card.innerHTML = `
                <div class="flashcard-content">
                    <div style="font-size: 0.9rem; color: var(--gold); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: bold;">
                        ${lang === 'en' ? 'Click to Flip' : '????? ??? ????????????'}
                    </div>
                    <div style="font-size: 1.3rem;">?</div>
                </div>
            `;

            let isFlipped = false;
            card.addEventListener('click', () => {
                isFlipped = !isFlipped;
                card.classList.toggle('flipped', isFlipped);
                if (isFlipped) {
                    card.innerHTML = `
                        <div class="flashcard-content" style="transform: rotateY(180deg);">
                            <p style="font-size: 1.05rem; line-height: 1.6; margin-bottom: 0.75rem;">"${verseText}"</p>
                            <span style="font-size: 0.85rem; color: var(--gold); font-weight: bold;">- ${verseRef}</span>
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="flashcard-content">
                            <div style="font-size: 0.9rem; color: var(--gold); margin-bottom: 0.5rem; text-transform: uppercase; font-weight: bold;">
                                ${lang === 'en' ? 'Click to Flip' : '????? ??? ????????????'}
                            </div>
                            <div style="font-size: 1.3rem;">?</div>
                        </div>
                    `;
                }
            });
            boardContent.appendChild(card);

        } else if (activePracticeMode === 'fill') {
            boardModeBadge.textContent = lang === 'en' ? 'Fill In Blanks' : '???? ???? ?????????';

            // Clean & Split verse words
            const words = verseText.split(/\s+/);
            const container = document.createElement('div');
            container.style.fontSize = '1.05rem';
            container.style.lineHeight = '2';
            container.style.textAlign = 'left';
            container.style.width = '100%';

            const blankIndexes = [];
            words.forEach((w, index) => {
                // Hide roughly 30% of the words (every 3rd word, excluding tiny punctuations)
                if (index > 0 && index % 3 === 0 && w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").length > 1) {
                    blankIndexes.push(index);
                    
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'practice-blank-input';
                    input.dataset.correct = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                    input.style.width = `${Math.max(w.length * 15, 60)}px`;
                    input.style.border = 'none';
                    input.style.borderBottom = '1.5px solid var(--gold)';
                    input.style.background = 'rgba(255,255,255,0.08)';
                    input.style.color = 'var(--text-main)';
                    input.style.padding = '0 0.25rem';
                    input.style.margin = '0 0.25rem';
                    input.style.textAlign = 'center';
                    input.style.outline = 'none';
                    input.style.borderRadius = '2px';
                    
                    container.appendChild(input);
                    // Add back punctuation if word had any
                    const punctuation = w.match(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g);
                    if (punctuation) {
                        const span = document.createElement('span');
                        span.textContent = punctuation.join('') + ' ';
                        container.appendChild(span);
                    } else {
                        container.appendChild(document.createTextNode(' '));
                    }
                } else {
                    const span = document.createElement('span');
                    span.textContent = w + ' ';
                    container.appendChild(span);
                }
            });

            boardContent.appendChild(container);

            // Add "Check Answers" controls in footer
            boardFooter.innerHTML = `
                <button class="btn btn-gold btn-sm" id="btn-check-fill" style="width: auto;">�o"�? �oा�?�s�?न�?ह�<स�? (Check Blanks)</button>
                <div id="fill-result-msg" style="margin-top: 0.5rem; font-weight: bold; font-size: 0.85rem;"></div>
            `;

            document.getElementById('btn-check-fill').addEventListener('click', () => {
                const inputs = container.querySelectorAll('.practice-blank-input');
                let correctCount = 0;
                inputs.forEach(inp => {
                    const userVal = inp.value.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                    const correctVal = inp.dataset.correct.toLowerCase();
                    if (userVal === correctVal) {
                        inp.style.borderBottom = '2px solid #10b981';
                        inp.style.background = 'rgba(16, 185, 129, 0.1)';
                        correctCount++;
                    } else {
                        inp.style.borderBottom = '2px solid #ef4444';
                        inp.style.background = 'rgba(239, 68, 68, 0.1)';
                        inp.title = `Correct: ${inp.dataset.correct}`;
                    }
                });

                const msg = document.getElementById('fill-result-msg');
                if (correctCount === inputs.length) {
                    msg.textContent = lang === 'en' ? '�YZ? Perfect! All blanks are correct.' : '�YZ? �?त�?�.�fष�?�Y! सब�^ �-ाल�? ठा�?�?हर�, सह�? �>न�?।';
                    msg.style.color = '#10b981';
                } else {
                    msg.textContent = lang === 'en' ? `�s��? Correct: ${correctCount}/${inputs.length}. Hover red blanks to see hints.` : `�s��? सह�? परिणाम: ${correctCount}/${inputs.length}। �-लत ठा�?�?मा स�,�.�?त ह�?र�?न मा�?स ल�^�oान�?ह�<स�?।`;
                    msg.style.color = '#f59e0b';
                }
            });

        } else if (activePracticeMode === 'prompt') {
            boardModeBadge.textContent = lang === 'en' ? 'First Letter' : 'पहिल�< �.�.�?षर स�T�?�.�?त';

            const words = verseText.split(/\s+/);
            const container = document.createElement('div');
            container.style.fontSize = '1.05rem';
            container.style.lineHeight = '2';
            container.style.textAlign = 'left';
            container.style.width = '100%';

            words.forEach(w => {
                const cleanWord = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
                if (cleanWord.length > 0) {
                    const firstChar = cleanWord.charAt(0);
                    const restLength = cleanWord.length - 1;
                    const underscores = '_'.repeat(restLength);
                    
                    // Replace in string
                    const promptWord = w.replace(cleanWord, `${firstChar}${underscores}`);
                    
                    const span = document.createElement('span');
                    span.textContent = promptWord + ' ';
                    container.appendChild(span);
                } else {
                    const span = document.createElement('span');
                    span.textContent = w + ' ';
                    container.appendChild(span);
                }
            });

            boardContent.appendChild(container);
            boardFooter.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">�Y'� प�?रत�?य�?�. शब�?द�.�< पहिल�< �.�.�?षर द�?�-ा�?�?�.�< �>, यसल�? �.ण�?ठस�?थता बलिय�< पार�?�>।</span>`;
        }
    }

    // ==========================================================
    // Speech Recognition Evaluation Logic
    // ==========================================================
    function initSpeechRecitation() {
        const micBtn = document.getElementById('practice-mic-btn');
        const statusText = document.getElementById('practice-speech-status');
        const transpBox = document.getElementById('practice-transcription');
        const evalBox = document.getElementById('practice-evaluation');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            if (statusText) {
                statusText.textContent = "�s��? Browser voice input not supported (Chrome recommended)";
                statusText.style.color = 'var(--danger)';
            }
            if (micBtn) micBtn.disabled = true;
            return;
        }

        // Set up SpeechRecognition configuration
        recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;

        micBtn.addEventListener('click', () => {
            if (isRecordingRecitation) {
                stopRecitationRecording();
            } else {
                startRecitationRecording();
            }
        });

        recognitionInstance.onstart = () => {
            isRecordingRecitation = true;
            statusText.textContent = "�YZT�? स�?निरह�?�.�< �>... �.ण�?ठ स�?ना�?न�?ह�<स�? (Listening...)";
            statusText.style.color = 'var(--success)';
            micBtn.style.background = 'var(--danger)';
            micBtn.querySelector('.mic-pulse-ring').style.display = 'block';
        };

        recognitionInstance.onerror = (e) => {
            console.error('Speech Recognition Error', e);
            statusText.textContent = `Error: ${e.error || 'Unknown error occurred'}`;
            statusText.style.color = 'var(--danger)';
            stopRecitationRecording();
        };

        recognitionInstance.onend = () => {
            stopRecitationRecording();
        };

        recognitionInstance.onresult = (e) => {
            const resultText = e.results[0][0].transcript;
            if (transpBox) transpBox.textContent = resultText;
            evaluateRecitationText(resultText);
        };
    }

    function startRecitationRecording() {
        if (!recognitionInstance || !selectedPracticeVerse) return;
        
        // Dynamically set recognition language based on system active locale
        const isEnglish = (localStorage.getItem('lang') || 'ne') === 'en';
        recognitionInstance.lang = isEnglish ? 'en-US' : 'ne-NP';
        
        try {
            recognitionInstance.start();
        } catch (err) {
            console.error(err);
        }
    }

    function stopRecitationRecording() {
        isRecordingRecitation = false;
        const micBtn = document.getElementById('practice-mic-btn');
        const statusText = document.getElementById('practice-speech-status');
        
        if (statusText) {
            statusText.textContent = "मा�?�. बन�?द �> (Click button to start)";
            statusText.style.color = 'var(--text-muted)';
        }
        if (micBtn) {
            micBtn.style.background = 'var(--primary)';
            const pulse = micBtn.querySelector('.mic-pulse-ring');
            if (pulse) pulse.style.display = 'none';
        }
        
        if (recognitionInstance) {
            try {
                recognitionInstance.stop();
            } catch(e){}
        }
    }

    function evaluateRecitationText(spokenText) {
        const evalBox = document.getElementById('practice-evaluation');
        if (!evalBox || !selectedPracticeVerse) return;

        const lang = localStorage.getItem('lang') || 'ne';
        const targetText = lang === 'en' ? selectedPracticeVerse.text_en : selectedPracticeVerse.text_ne;

        // Clean formatting helper
        const clean = (str) => {
            return str.toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?।]/g,"")
                .trim()
                .split(/\s+/);
        };

        const targetWords = clean(targetText);
        const spokenWords = clean(spokenText);

        evalBox.innerHTML = '';

        // Match spoken words to target words
        targetWords.forEach(word => {
            const matchIndex = spokenWords.indexOf(word);
            const span = document.createElement('span');
            span.textContent = word;
            
            if (matchIndex !== -1) {
                // Word matched successfully
                span.className = 'practice-word-correct';
                // Remove matched word from index so it doesn't double-match
                spokenWords.splice(matchIndex, 1);
            } else {
                // Word was missed
                span.className = 'practice-word-missing';
            }
            evalBox.appendChild(span);
            evalBox.appendChild(document.createTextNode(' '));
        });
    }

    // ==========================================================
    // �Y"� Simulated Notifications & Alerts Engine
    // ==========================================================
    function initAlertSimulators() {
        const btnSimScore = document.getElementById('btn-simulate-score');
        const btnSimSms = document.getElementById('btn-simulate-sms');

        if (btnSimScore) {
            btnSimScore.addEventListener('click', () => {
                simulateNotification('score');
            });
        }
        if (btnSimSms) {
            btnSimSms.addEventListener('click', () => {
                simulateNotification('sms');
            });
        }
    }

    window.simulateNotification = function(type) {
        const lang = localStorage.getItem('lang') || 'ne';
        let title = '';
        let msg = '';
        let borderClass = 'success';

        if (type === 'score') {
            title = lang === 'en' ? '�Y?. Leaderboard Updated!' : '�Y?. नया�? स�?�.�<र प�?र�.ाशित!';
            msg = lang === 'en' ? 'Abhishek Rai has scored 91 marks in Final Round!' : '�.भिष�?�. रा�^ल�? फा�?नल �sरणमा ९१ �.�,�. हासिल �-र�?न�?भ�?�.�< �>!';
            borderClass = 'success';
        } else {
            title = lang === 'en' ? '�Y"� SMS Sent to Participant' : '�Y"� प�?रतिस�?पर�?ध�?ला�^ SMS पठा�?य�<';
            msg = lang === 'en' ? 'SMS Alert sent: "Dear Prasamsa, it is your turn next. Please proceed to Judge Panel 1."' : '�?स�?म�?स �.लर�?�Y: "�?दरण�?य प�?रश�,सा, �.ब तपा�?�?�.�< पाल�< भ�?�.�< �>। �.�fपया �o�o प�?यानल १ मा �oान�?ह�<ला।"';
            borderClass = 'warning';
        }

        // Show a premium toast alert
        showFloatingPushToast(title, msg, borderClass);
    };

    function showFloatingPushToast(title, msg, borderType) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderColor = borderType === 'success' ? 'var(--success)' : 'var(--gold)';
        
        toast.innerHTML = `
            <div>
                <div style="font-weight: 800; color: #fff; font-size: 0.95rem; margin-bottom: 0.2rem;">${title}</div>
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.95); line-height: 1.4;">${msg}</div>
            </div>
        `;
        document.body.appendChild(toast);

        // Slide out and remove toast
        setTimeout(() => {
            toast.style.animation = 'slideInLeft 0.3s reverse forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    }

    window.initPracticePortal = initPracticePortal;

    // 12. App Initialization
    window.translateUI(savedLang);
    updateAuthUI();
    // Start global widgets
    startCountdown();
    renderTicker();
    renderTournamentPortal();

    // Default Load State - Initialize all landing page content
    const savedTab = sessionStorage.getItem('active_tab');
    if (savedTab && (savedTab === 'nav-admin' || savedTab === 'nav-judge')) {
        window.spaRouter.navigateTo(savedTab);
    } else if (savedTab && (savedTab === 'nav-home' || savedTab === 'nav-live-score' || savedTab === 'nav-participants' || savedTab === 'nav-downloads')) {
        window.spaRouter.navigateTo(savedTab);
    } else {
        // Landing mode - initialize all visible sections
        renderPublicContactInfo();
        renderPublicTeam();
        renderPublicGallerySlider();
        renderPublicNotices();
        renderHomeEventDetails();
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
                                <h3 class="modal-title">सहभा�-�? विवरण (Competitor Info)</h3>
                                <button class="modal-close" onclick="closeActiveModals()">�-</button>
                            </div>
                            <div class="modal-body text-center">
                                <div style="font-size: 3.5rem; margin-bottom: 1rem;">�Y'�</div>
                                <h2 style="color: var(--text-heading);">${p.name_ne}</h2>
                                <p style="color: var(--text-muted); font-size: 0.95rem;">${p.church_name}</p>
                                <p style="color: var(--gold); font-weight: bold; margin-top: 0.5rem;">${illaka ? illaka.name_ne : ''}</p>
                                
                                <div style="margin-top: 1.5rem; background: #fffbeb; border: 1px solid #fde8c3; color: #b7791f; padding: 1rem; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600;">
                                    म�,ल्या�T्�.न हुन बाँ�.�? �>...<br>
                                    (Evaluation Pending)
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-outline" onclick="closeActiveModals()">बन्द �-र्नुह�<स्</button>
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
                            <h3 class="modal-title">�s�️ सहभा�-�? फ�?ला पर�?न (Not Found)</h3>
                            <button class="modal-close" onclick="closeActiveModals()">�-</button>
                        </div>
                        <div class="modal-body text-center" style="padding: 2rem 1.5rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">�Y"��O</div>
                            <h3 style="color: var(--danger); margin-bottom: 0.75rem;">सहभा�-�?�.�< विवरण फ�?ला पर�?न!</h3>
                            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
                                स्�.्यान �-रिए�.�< QR �.�<ड�.�< सहभा�-�? ID (<b>${qParticipantId}</b>) यस म�<बा�?ल/�?प�.रण�.�< स्थान�?य डा�Yाब�?समा फ�?ला पर�?न।
                            </p>
                            
                            <div style="text-align: left; background: var(--bg-main); border: 1px solid var(--border); padding: 0.85rem; border-radius: var(--radius-sm); font-size: 0.78rem; line-height: 1.45;">
                                �Y'� <b>�.िन यस�< भय�<? (Why did this happen):</b><br>
                                य�< प्रतिय�<�-िता <b>�.फला�?न-फर्स्�Y</b> (Offline-first) भए�.�<ल�? डा�Yा सुर�.्षित र�,पमा�, तपा�^�,�.�< ब्रा�?�oर�.�< <code>localStorage</code> मा मात्र भण्डारण हुन्�>।<br><br>
                                �Y"" <b>यसला�^ �.सर�? मिला�?न�? (How to Sync):</b><br>
                                १. �oुन �.म्प्यु�Yरमा सहभा�-�? दर्ता �-र्नुभए�.�< थिय�<, त्यस�.�< <b>एडमिन प्यानल</b>मा �oानुह�<स्।<br>
                                २. �Y>� <b>प्रणाल�? स�?�Yि�T र ब्या�.�.प</b> मा �-रि <b>ब्या�.�.प JSON डा�?नल�<ड �-र्नुह�<स्</b>।<br>
                                ३. त्यसप�>ि य�< फ�<न�.�< एडमिन प्यानलमा �?�^ �?�.्त ब्या�.�.प फा�?ल <b>पुनर्स्थापना (Restore)</b> �-र्नुह�<स्।
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-danger" style="width: 100%;" onclick="closeActiveModals()">बन्द �-र्नुह�<स् (Close)</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }
        }, 150);
    }
});

