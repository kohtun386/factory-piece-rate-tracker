import { ClientData, FirebaseConfig } from '../types';

// Let TypeScript know that 'firebase' is available on the window object
declare const firebase: any;

const FIREBASE_CONFIG_KEY = 'firebaseConfig';
let db: any = null; // This will hold the Firestore instance

// --- Configuration Management ---

export const saveFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
};

export const loadFirebaseConfig = (): FirebaseConfig | null => {
  const configStr = localStorage.getItem(FIREBASE_CONFIG_KEY);
  return configStr ? JSON.parse(configStr) : null;
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
  db = null; // Reset the db instance
};

// --- Firebase Initialization ---

export const initializeFirebase = (config: FirebaseConfig): boolean => {
  try {
    // If an app already exists, delete it and create a new one.
    // This is useful for changing configs without refreshing.
    if (firebase.apps.length) {
      firebase.app().delete();
    }
    
    firebase.initializeApp(config);
    db = firebase.firestore();
    console.log("Firebase initialized successfully with project:", config.projectId);
    return true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    db = null;
    return false;
  }
};


// --- Mock Data (Fallback) ---

const MOCK_FIRESTORE_DB: Record<string, ClientData> = {
  "client-001": {
    clientName: "Thiri Swe Textile Factory",
    subscriptionStatus: "TRIAL",
    trialEndDate: {
      seconds: 1777488000, // Approx. May 1, 2026
      nanoseconds: 0,
      toDate: () => new Date(1777488000 * 1000)
    }
  },
  "client-002": {
    clientName: "Paid Customer Inc.",
    subscriptionStatus: "PAID",
  },
  "client-expired": {
      clientName: "Expired Trial Co.",
      subscriptionStatus: "TRIAL",
      trialEndDate: {
          seconds: 1609459200, // Jan 1, 2021 (in the past)
          nanoseconds: 0,
          toDate: () => new Date(1609459200 * 1000)
      }
  }
};

// --- Data Fetching ---

/**
 * Fetches client data. Uses real Firestore if initialized, otherwise falls back to mock data.
 * @param clientId The document ID of the client to fetch.
 * @returns A promise that resolves with the ClientData or null if not found.
 */
export const getClientData = async (clientId: string): Promise<ClientData | null> => {
  const normalizedClientId = clientId.toLowerCase().trim();
  
  // If a real database connection exists, use it.
  if (db) {
    console.log(`Fetching from REAL Firestore for client: ${normalizedClientId}`);
    try {
      const docRef = db.collection('clients').doc(normalizedClientId);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const data = docSnap.data() as any;
        
        // Firestore Timestamps need to be converted. Our type expects a `toDate` method.
        if (data.trialEndDate && data.trialEndDate.toDate) {
            // This is a Firestore Timestamp object, which is what our type expects.
        }
        
        console.log("Found client data in Firestore:", data);
        return data as ClientData;
      } else {
        console.log("Client data not found in Firestore.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching from Firestore:", error);
      return null;
    }
  } 
  // Otherwise, fall back to mock data.
  else {
    console.log(`Simulating Firestore fetch for client: ${normalizedClientId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const clientData = MOCK_FIRESTORE_DB[normalizedClientId];
    if (clientData) {
      console.log("Found mock data:", clientData);
      return clientData;
    } else {
      console.log("Client data not found in mock DB.");
      return null;
    }
  }
};