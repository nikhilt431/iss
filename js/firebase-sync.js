/**
 * Firebase Firestore Real-Time Sync Layer
 * Igniter Team - Bible Memorization Competition
 *
 * HOW TO SET UP (one-time, takes 5 minutes):
 * 1. Go to https://console.firebase.google.com
 * 2. Click "Add project" → name it "igniter-bible-quiz" → click through
 * 3. In the left panel click "Firestore Database" → "Create database" → "Start in test mode" → choose any location → Done
 * 4. In the left panel click the gear ⚙️ → "Project settings" → scroll to "Your apps" → click </> (Web)
 * 5. Register app name "igniter" → copy the firebaseConfig values below
 * 6. Replace the placeholder values in FIREBASE_CONFIG below with your real values
 * 7. Re-deploy to Vercel (just push to GitHub — Vercel auto-deploys)
 * 8. Done! Everyone who opens the URL will now share the same live database.
 */

// ============================================================
// ⚠️  PASTE YOUR FIREBASE CONFIG HERE  ⚠️
// ============================================================
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUJDhHzlVvJCg9t-nprm260STeEHb4RjY",
  authDomain: "igniter-bible-quiz.firebaseapp.com",
  projectId: "igniter-bible-quiz",
  storageBucket: "igniter-bible-quiz.firebasestorage.app",
  messagingSenderId: "1051270611799",
  appId: "1:1051270611799:web:0cee4be47ecd941c96f412",
  measurementId: "G-8JJVQDJE3F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
};
// ============================================================

const FIRESTORE_COLLECTION = 'bible_quiz';
const FIRESTORE_DOC        = 'main_data';

window.FirebaseSync = (function () {

    let db       = null;   // Firestore instance
    let unsubscribe = null; // real-time listener handle
    let isConfigured = false;

    // Check if the user has replaced the placeholder values
    function checkConfigured() {
        return FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY';
    }

    /**
     * Initialise Firebase and start real-time listener.
     * Called once from db.js after window.db is ready.
     */
    async function init() {
        if (!checkConfigured()) {
            console.warn(
                '[FirebaseSync] Firebase not configured. ' +
                'Edit js/firebase-sync.js and fill in FIREBASE_CONFIG to enable real-time sync.'
            );
            showSyncBanner('offline');
            return;
        }

        try {
            // Firebase v9 compat CDN (loaded in index.html)
            firebase.initializeApp(FIREBASE_CONFIG);
            db = firebase.firestore();
            isConfigured = true;

            console.log('[FirebaseSync] Firebase initialised ✅');

            // --- First load: pull cloud data into local state ---
            await pullFromCloud();

            // --- Real-time listener: push cloud changes to all clients ---
            startListener();

            showSyncBanner('online');

        } catch (err) {
            console.error('[FirebaseSync] Init error:', err);
            showSyncBanner('error');
        }
    }

    /** Pull the entire database document from Firestore into window.db.state */
    async function pullFromCloud() {
        if (!db) return;
        try {
            const docRef = db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC);
            const snap   = await docRef.get();

            if (snap.exists) {
                const cloudData = snap.data();
                // Merge cloud data, preferring cloud values
                window.db.state = { ...window.db.state, ...cloudData };
                // Also update localStorage cache
                localStorage.setItem('bible_quiz_db_state', JSON.stringify(window.db.state));
                // Refresh the visible UI
                window.dispatchEvent(new Event('db_updated'));
                console.log('[FirebaseSync] Data pulled from cloud ✅');
            } else {
                // First time: push our seed data to cloud
                await pushToCloud(window.db.state);
                console.log('[FirebaseSync] Initial data pushed to cloud ✅');
            }
        } catch (err) {
            console.error('[FirebaseSync] Pull error:', err);
        }
    }

    /** Push the full db state to Firestore (called on every save) */
    async function pushToCloud(state) {
        if (!db || !isConfigured) return;
        try {
            const docRef = db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC);
            await docRef.set(state);
        } catch (err) {
            console.error('[FirebaseSync] Push error:', err);
            showSyncBanner('error');
        }
    }

    /** Real-time onSnapshot listener — updates all open browsers instantly */
    function startListener() {
        if (!db) return;
        const docRef = db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC);

        unsubscribe = docRef.onSnapshot((snap) => {
            if (!snap.exists) return;

            const cloudData = snap.data();

            // Only update if the data actually changed (avoid echo from own saves)
            const localStr = JSON.stringify(window.db.state);
            const cloudStr = JSON.stringify(cloudData);
            if (localStr === cloudStr) return;

            window.db.state = { ...window.db.state, ...cloudData };
            localStorage.setItem('bible_quiz_db_state', JSON.stringify(window.db.state));

            // Tell the SPA to re-render current view
            window.dispatchEvent(new Event('db_updated'));
            console.log('[FirebaseSync] Live update received from cloud 🔄');
            showSyncBanner('online');
        }, (err) => {
            console.error('[FirebaseSync] Listener error:', err);
            showSyncBanner('error');
        });
    }

    /** Show a small sync status indicator in the header */
    function showSyncBanner(status) {
        let badge = document.getElementById('firebase-sync-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'firebase-sync-badge';
            badge.style.cssText = [
                'position: fixed',
                'bottom: 1rem',
                'right: 1rem',
                'padding: 0.3rem 0.75rem',
                'border-radius: 50px',
                'font-size: 0.75rem',
                'font-weight: 700',
                'z-index: 9999',
                'transition: all 0.4s ease',
                'box-shadow: 0 2px 8px rgba(0,0,0,0.25)',
                'cursor: default'
            ].join(';');
            document.body.appendChild(badge);
        }

        if (status === 'online') {
            badge.textContent  = '🟢 Live Sync ON';
            badge.style.background = '#10b981';
            badge.style.color      = '#ffffff';
            badge.title = 'Real-time sync is active. All viewers see the same data.';
        } else if (status === 'offline') {
            badge.textContent  = '🟡 Offline Mode';
            badge.style.background = '#f59e0b';
            badge.style.color      = '#000000';
            badge.title = 'Firebase not configured. Only this browser sees the data.';
        } else {
            badge.textContent  = '🔴 Sync Error';
            badge.style.background = '#ef4444';
            badge.style.color      = '#ffffff';
            badge.title = 'Cloud sync failed. Check Firebase config.';
        }
    }

    // Public API
    return {
        init,
        pushToCloud
    };
})();
