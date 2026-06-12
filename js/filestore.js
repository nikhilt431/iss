/**
 * Igniter Team - FileStore
 * Uses IndexedDB to store binary data (images, PDFs) separately from localStorage.
 * This bypasses the 5MB localStorage limit for file uploads.
 *
 * API:
 *   FileStore.put(key, dataUrl)  → Promise<void>
 *   FileStore.get(key)           → Promise<string|null>
 *   FileStore.del(key)           → Promise<void>
 *   FileStore.clear()            → Promise<void>
 */

const FileStore = (() => {
    const DB_NAME = 'IgniterFileStore';
    const STORE_NAME = 'files';
    const DB_VERSION = 1;

    let _db = null;

    function openDB() {
        if (_db) return Promise.resolve(_db);
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            req.onsuccess = (e) => {
                _db = e.target.result;
                resolve(_db);
            };
            req.onerror = (e) => {
                console.error('FileStore: IndexedDB open error', e.target.error);
                reject(e.target.error);
            };
        });
    }

    function put(key, dataUrl) {
        return openDB().then(db => new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put(dataUrl, key);
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e.target.error);
        }));
    }

    function get(key) {
        return openDB().then(db => new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);
            req.onsuccess = (e) => resolve(e.target.result || null);
            req.onerror = (e) => reject(e.target.error);
        }));
    }

    function del(key) {
        return openDB().then(db => new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.delete(key);
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e.target.error);
        }));
    }

    function clear() {
        return openDB().then(db => new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e.target.error);
        }));
    }

    return { put, get, del, clear };
})();

window.FileStore = FileStore;


