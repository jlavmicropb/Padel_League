// =========================================================================
// CONFIGURATION - Change provider to switch data source
// =========================================================================
//
// provider: 'local' | 'firebase' | 'supabase'
//   - 'local'    : Reads from data/league-data.json (default, works on GitHub Pages as-is)
//   - 'firebase' : Reads/writes from Firebase Firestore (fill in firebase settings below)
//   - 'supabase' : Reads/writes from Supabase (fill in supabase settings below)
//

const CONFIG = {
    provider: 'local',

    // ---------- Firebase ----------
    // 1. Go to https://console.firebase.google.com
    // 2. Create a project (free Spark plan)
    // 3. Go to Project Settings > General > Your apps > Add web app
    // 4. Copy the config values below
    firebase: {
        apiKey: 'YOUR_API_KEY',
        authDomain: 'YOUR_PROJECT.firebaseapp.com',
        projectId: 'YOUR_PROJECT',
        storageBucket: 'YOUR_PROJECT.appspot.com',
        messagingSenderId: 'YOUR_SENDER_ID',
        appId: 'YOUR_APP_ID'
    },

    // ---------- Supabase ----------
    // 1. Go to https://supabase.com/dashboard
    // 2. Create a project (free plan)
    // 3. Go to Settings > API
    // 4. Copy the URL and anon key below
    supabase: {
        url: 'https://YOUR_PROJECT.supabase.co',
        anonKey: 'YOUR_ANON_KEY'
    }
};
