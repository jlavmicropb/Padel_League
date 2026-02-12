// =========================================================================
// DATA SERVICE - Abstraction layer over local JSON / Firebase / Supabase
// =========================================================================
//
// Usage:
//   const data = await DB.getAllData();       // Returns full DATA object
//   await DB.submitResult(location, league, group, week, result);
//
// The rest of the site calls these functions. Switching provider in
// config.js swaps the backend with zero changes to rendering code.
// =========================================================================

const DB = (function () {

    // ----- Local provider (reads data/league-data.json) -----

    const localProvider = {
        async getAllData() {
            const resp = await fetch('data/league-data.json');
            if (!resp.ok) throw new Error('Failed to load local data');
            return resp.json();
        },

        async submitResult(location, league, group, week, result) {
            console.warn('Local mode: results cannot be saved. Switch to Firebase or Supabase to enable writes.');
            return false;
        }
    };

    // ----- Firebase provider -----

    const firebaseProvider = {
        _db: null,

        _init() {
            if (this._db) return;
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded. Add the Firebase scripts to index.html.');
            }
            firebase.initializeApp(CONFIG.firebase);
            this._db = firebase.firestore();
        },

        async getAllData() {
            this._init();
            const doc = await this._db.collection('leagues').doc('data').get();
            if (doc.exists) return doc.data();
            // First run: seed Firestore from local JSON then return it
            const seed = await localProvider.getAllData();
            await this._db.collection('leagues').doc('data').set(seed);
            return seed;
        },

        async submitResult(location, league, group, week, result) {
            this._init();
            const doc = this._db.collection('leagues').doc('data');
            const snap = await doc.get();
            const data = snap.data();

            if (!data[location][league].groups[group].results) {
                data[location][league].groups[group].results = {};
            }
            if (!data[location][league].groups[group].results[week]) {
                data[location][league].groups[group].results[week] = [];
            }
            data[location][league].groups[group].results[week].push(result);

            await doc.set(data);
            return true;
        }
    };

    // ----- Supabase provider -----

    const supabaseProvider = {
        _client: null,

        _init() {
            if (this._client) return;
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase SDK not loaded. Add the Supabase script to index.html.');
            }
            this._client = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
        },

        async getAllData() {
            this._init();
            const { data, error } = await this._client
                .from('league_data')
                .select('data')
                .eq('id', 'main')
                .single();

            if (error || !data) {
                // First run: seed from local JSON
                const seed = await localProvider.getAllData();
                await this._client.from('league_data').upsert({ id: 'main', data: seed });
                return seed;
            }
            return data.data;
        },

        async submitResult(location, league, group, week, result) {
            this._init();
            const allData = await this.getAllData();

            if (!allData[location][league].groups[group].results) {
                allData[location][league].groups[group].results = {};
            }
            if (!allData[location][league].groups[group].results[week]) {
                allData[location][league].groups[group].results[week] = [];
            }
            allData[location][league].groups[group].results[week].push(result);

            const { error } = await this._client
                .from('league_data')
                .upsert({ id: 'main', data: allData });

            if (error) { console.error('Supabase write error:', error); return false; }
            return true;
        }
    };

    // ----- Pick the active provider based on config -----

    function getProvider() {
        switch (CONFIG.provider) {
            case 'firebase': return firebaseProvider;
            case 'supabase': return supabaseProvider;
            default: return localProvider;
        }
    }

    // ----- Public API -----

    return {
        async getAllData() {
            return getProvider().getAllData();
        },

        async submitResult(location, league, group, week, result) {
            return getProvider().submitResult(location, league, group, week, result);
        }
    };

})();
