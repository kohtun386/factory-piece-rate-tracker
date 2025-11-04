// @ts-nocheck
import { ClientData, FirebaseConfig } from '../types';

// Let TypeScript know that 'firebase' is available on the window object
declare const firebase: any;

const FIREBASE_CONFIG_KEY = 'firebaseConfig';
let db: any = null; // This will hold the Firestore instance
let currentClientId: string | null = null;

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
    if (firebase.apps.length) {
      const existingApp = firebase.app();
      if (existingApp.options.projectId !== config.projectId) {
         existingApp.delete();
         firebase.initializeApp(config);
      }
    } else {
        firebase.initializeApp(config);
    }
    
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

export const getClientData = async (clientId: string): Promise<ClientData | null> => {
  const normalizedClientId = clientId.toLowerCase().trim();
  currentClientId = null; // Reset current client on new login attempt
  
  if (db) {
    console.log(`Fetching from REAL Firestore for client: ${normalizedClientId}`);
    try {
      const docRef = db.collection('clients').doc(normalizedClientId);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const data = docSnap.data() as any;
        console.log("Found client data in Firestore:", data);
        currentClientId = normalizedClientId; // Set the current client ID on successful login
        return data as ClientData;
      } else {
        console.log("Client data not found in Firestore.");
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching from Firestore:", error);
      if (error.code === 'permission-denied') {
          throw new Error('PERMISSION_DENIED');
      }
      return null;
    }
  } 
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

// --- Generic Collection/Document Operations ---

/**
 * Fetches all documents from a subcollection for the currently logged-in client.
 * @param collectionName The name of the subcollection (e.g., 'workers').
 * @returns A promise that resolves with an array of documents.
 */
export const getCollection = async <T>(collectionName: string): Promise<T[]> => {
    if (!db || !currentClientId) {
        console.warn(`Firestore not ready or no client logged in. Cannot fetch ${collectionName}.`);
        return [];
    }
    try {
        const snapshot = await db.collection('clients').doc(currentClientId).collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
        console.error(`Error fetching collection ${collectionName}:`, error);
        return [];
    }
};

/**
 * Adds a new document to a subcollection.
 * @param collectionName The name of the subcollection.
 * @param data The data for the new document. The 'id' field will be used as the document ID.
 * @returns The added document's data.
 */
export const addDocument = async <T extends { id: string }>(collectionName: string, data: T): Promise<T> => {
    if (!db || !currentClientId) throw new Error("Firestore not ready or no client logged in.");
    const { id, ...rest } = data;
    await db.collection('clients').doc(currentClientId).collection(collectionName).doc(id).set(rest);
    return data;
};

/**
 * Updates an existing document in a subcollection.
 * @param collectionName The name of the subcollection.
 * @param data The data to update. Must include an 'id'.
 */
export const updateDocument = async <T extends { id: string }>(collectionName: string, data: T): Promise<void> => {
    if (!db || !currentClientId) throw new Error("Firestore not ready or no client logged in.");
    const { id, ...rest } = data;
    await db.collection('clients').doc(currentClientId).collection(collectionName).doc(id).update(rest);
};

/**
 * Deletes a document from a subcollection.
 * @param collectionName The name of the subcollection.
 * @param docId The ID of the document to delete.
 */
export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
    if (!db || !currentClientId) throw new Error("Firestore not ready or no client logged in.");
    await db.collection('clients').doc(currentClientId).collection(collectionName).doc(docId).delete();
};
