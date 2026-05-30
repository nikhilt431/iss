/**
 * Firebase Firestore Real-Time Sync Layer
 * Igniter Team - Bible Memorization Competition
 *
 * Uses Firebase v9 Compat SDK (loaded via CDN in index.html).
 * This file must be loaded BEFORE db.js.
 */

// ── Your Firebase project config ─────────────────────────────────────────────
const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyBUJDhHzlVvJCg9t-nprm260STeEHb4RjY",
    authDomain:        "igniter-bible-quiz.firebaseapp.com",
    projectId:         "igniter-bible-quiz",
    storageBucket:     "igniter-bible-quiz.firebasestorage.app",
    messagingSenderId: "1051270611799",
    appId:             "1:1051270611799:web:0cee4be47ecd941c96f412",
    measurementId:     "G-8JJVQDJE3F"
};
// ─────────────────────────────────────────────────────────────────────────────

const FIRESTORE_COLLECTION = 'bible_quiz';
const FIRESTORE_DOC        = 'main_data';

window.FirebaseSync = (function () {

    let fsdb        = null;  // Firestore instance
    let unsubscribe = null;  // real-time listener handle
    let isReady     = false;

    // ── Initialise Firebase and start listener ────────────────────────────
    async function init() {
        try {
            // firebase global is provided by the compat CDN in index.html
            // Prevent "already initialized" error if called twice
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            fsdb    = firebase.firestore();
            isReady = true;

            console.log('[FirebaseSync] ✅ Firebase connected to project:', FIREBASE_CONFIG.projectId);

            // Pull latest cloud data into this browser first
            await pullFromCloud();

            // Then start listening for changes from any device
            startListener();

            showBadge('online');

        } catch (err) {
            console.error('[FirebaseSync] ❌ Init error:', err);
            showBadge('error');
        }
    }

    // ── Pull cloud → local ────────────────────────────────────────────────
    async function pullFromCloud() {
        if (!fsdb) return;
        try {
            const docRef = fsdb.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC);
            const snap   = await docRef.get();

            if (snap.exists) {
                const cloudData = snap.data();
                window.db.state = { ...window.db.state, ...cloudData };
                localStorage.setItem('bible_quiz_db_state', JSON.stringify(window.db.state));
                window.dispatchEvent(new Event('db_updated'));
                console.log('[FirebaseSync] 📥 Data pulled from cloud');
            } else {
                // First ever run — seed the cloud with local data
                await pushToCloud(window.db.state);
                console.log('[FirebaseSync] 📤 Initial data seeded to cloud');
            }
        } catch (err) {
            console.error('[FirebaseSync] Pull error:', err);
        }
    }

    // ── Push local → cloud (called by db.save()) ─────────────────────────
    async function pushToCloud(state) {
        if (!fsdb || !isReady) return;
        try {
            const docRef = fsdb.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC);
            await docRef.set(state);
        } catch (err) {
            console.error('[FirebaseSync] Push error:', err);
            showBadge('error');
        }
    }

    // ── Real-time listener — fires on EVERY connected browser ────────────
    function startListener() {
        if (!fsdb) return;
        const docRef = fsdb.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC);

        unsubscribe = docRef.onSnapshot((snap) => {
            if (!snap.exists) return;

            const cloudData = snap.data();
            const localStr  = JSON.stringify(window.db.state);
            const cloudStr  = JSON.stringify(cloudData);

            // Skip if nothing changed (avoids echo from our own saves)
            if (localStr === cloudStr) return;

            window.db.state = { ...window.db.state, ...cloudData };
            localStorage.setItem('bible_quiz_db_state', JSON.stringify(window.db.state));

            // Tell the SPA to re-render the current section
            window.dispatchEvent(new Event('db_updated'));
            console.log('[FirebaseSync] 🔄 Live update received — UI refreshed');
            showBadge('online');

        }, (err) => {
            console.error('[FirebaseSync] Listener error:', err);
            showBadge('error');
        });
    }

    // ── Status badge (bottom-right corner of screen) ──────────────────────
    function showBadge(status) {
        let badge = document.getElementById('firebase-sync-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'firebase-sync-badge';
            badge.style.cssText = [
                'position:fixed',
                'bottom:1rem',
                'right:1rem',
                'padding:0.3rem 0.8rem',
                'border-radius:50px',
                'font-size:0.72rem',
                'font-weight:700',
                'z-index:9999',
                'letter-spacing:0.03em',
                'box-shadow:0 2px 10px rgba(0,0,0,0.3)',
                'transition:all 0.4s ease'
            ].join(';');
            document.body.appendChild(badge);
        }

        const MAP = {
            online:  { text: '🟢 Live Sync ON',  bg: '#10b981', color: '#fff',  tip: 'Real-time sync active — all viewers see the same data.' },
            offline: { text: '🟡 Offline Mode',  bg: '#f59e0b', color: '#000',  tip: 'Only this device sees data. Configure Firebase to sync.' },
            error:   { text: '🔴 Sync Error',    bg: '#ef4444', color: '#fff',  tip: 'Cloud sync failed. Check browser console for details.' }
        };
        const s = MAP[status] || MAP.offline;
        badge.textContent       = s.text;
        badge.style.background  = s.bg;
        badge.style.color       = s.color;
        badge.title             = s.tip;
    }

    // Public API
    return { init, pushToCloud };

})();
