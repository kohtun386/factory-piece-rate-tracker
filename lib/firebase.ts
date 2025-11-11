import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { 
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    Firestore 
} from "firebase/firestore";
import { ClientData, FirebaseConfig, Worker, RateCardEntry, JobPosition, ProductionEntry, PaymentLog, AuditEntry } from '../types';

const FIREBASE_CONFIG_KEY = 'firebaseConfig';
let db: Firestore | null = null;
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
    let app: FirebaseApp;
    // Initialize the main Firebase App
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    
    // Attempt to initialize Firestore with modern persistence settings
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true, // Helps bypass WebSocket issues in restricted environments
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
      console.log("Firestore offline persistence enabled via modern API.");

    } catch (e) {
      // This can happen if Firestore is already initialized (e.g., with hot-reloading)
      // In this case, just get the existing instance.
      console.warn("Re-initialization of Firestore caught, getting existing instance.");
      db = getFirestore(app);
    }

    console.log("Firebase initialized successfully with project:", config.projectId);
    return true;

  } catch (error) {
    console.error("Firebase initialization failed:", error);
    db = null;
    return false;
  }
};


// --- Mock Data (Fallback) ---
interface MockCollections {
    workers: Worker[];
    rateCard: RateCardEntry[];
    jobPositions: JobPosition[];
    productionEntries: ProductionEntry[];
    paymentLogs: PaymentLog[];
    auditLog: AuditEntry[];
}

interface MockClient {
    clientData: ClientData;
    collections: MockCollections;
}


const MOCK_FIRESTORE_DB: Record<string, MockClient> = {
  "client-001": {
    clientData: {
        clientName: "Thiri Swe Textile Factory",
        subscriptionStatus: "TRIAL",
        ownerPassword: "123",
        trialEndDate: {
          seconds: 1777488000, // Approx. May 1, 2026
          nanoseconds: 0,
          toDate: () => new Date(1777488000 * 1000)
        }
    },
    collections: {
        jobPositions: [
            { id: 'JP001', englishName: 'Loom Operator', myanmarName: 'စက်ယက္ကန်းသမား', notes: 'Operates weaving looms.' },
            { id: 'JP002', englishName: 'Seamstress', myanmarName: 'ချုပ်စပ်သူ', notes: 'Stitches garments.' },
            { id: 'JP003', englishName: 'Quality Control', myanmarName: 'အရည်အသွေးစစ်', notes: 'Inspects final products.' },
        ],
        workers: [
            { id: 'W001', name: 'Aung Aung', positionId: 'JP001' },
            { id: 'W002', name: 'Ma Aye', positionId: 'JP002' },
            { id: 'W003', name: 'Ko Mya', positionId: 'JP001' },
            { id: 'W004', name: 'Su Su', positionId: 'JP003' },
        ],
        rateCard: [
            { id: 'T01', taskName: 'Weaving - Pattern A', unit: 'meter', rate: 150 },
            { id: 'T02', taskName: 'Stitching - Shirt', unit: 'piece', rate: 250 },
            { id: 'T03', taskName: 'QC Check', unit: 'piece', rate: 10 },
        ],
        productionEntries: [
            { id: 'E1', date: '2025-11-08', shift: 'Day', workerName: 'Aung Aung', taskName: 'Weaving - Pattern A', completedQuantity: 50, defectQuantity: 2, pieceRate: 150, basePay: 7500, deductionAmount: 300 },
            { id: 'E2', date: '2025-11-08', shift: 'Day', workerName: 'Ma Aye', taskName: 'Stitching - Shirt', completedQuantity: 20, defectQuantity: 1, pieceRate: 250, basePay: 5000, deductionAmount: 250 },
            { id: 'E3', date: '2025-11-08', shift: 'Night', workerName: 'Ko Mya', taskName: 'Weaving - Pattern A', completedQuantity: 65, defectQuantity: 0, pieceRate: 150, basePay: 9750, deductionAmount: 0 },
            { id: 'E4', date: '2025-11-07', shift: 'Day', workerName: 'Aung Aung', taskName: 'Weaving - Pattern A', completedQuantity: 48, defectQuantity: 3, pieceRate: 150, basePay: 7200, deductionAmount: 450 },
            { id: 'E5', date: '2025-11-07', shift: 'Day', workerName: 'Su Su', taskName: 'QC Check', completedQuantity: 150, defectQuantity: 0, pieceRate: 10, basePay: 1500, deductionAmount: 0 },
        ],
        paymentLogs: [
            { id: 'P1', workerId: 'W001', workerName: 'Aung Aung', date: '2025-11-05', amount: 10000, notes: 'Advance for week' },
            { id: 'P2', workerId: 'W002', workerName: 'Ma Aye', date: '2025-11-06', amount: 4000 },
        ],
        auditLog: []
    }
  },
  "client-002": {
    clientData: {
        clientName: "Paid Customer Inc.",
        subscriptionStatus: "PAID",
        ownerPassword: "123",
    },
    collections: { jobPositions: [], workers: [], rateCard: [], productionEntries: [], paymentLogs: [], auditLog: [] }
  },
  "client-expired": {
    clientData: {
        clientName: "Expired Trial Co.",
        subscriptionStatus: "TRIAL",
        trialEndDate: {
            seconds: 1609459200, // Jan 1, 2021 (in the past)
            nanoseconds: 0,
            toDate: () => new Date(1609459200 * 1000)
        }
    },
    collections: { jobPositions: [], workers: [], rateCard: [], productionEntries: [], paymentLogs: [], auditLog: [] }
  }
};

// --- Data Fetching ---

export const getClientData = async (clientId: string): Promise<ClientData | null> => {
  const normalizedClientId = clientId.toLowerCase().trim();
  currentClientId = null; // Reset current client on new login attempt
  
  if (db) {
    console.log(`Fetching from REAL Firestore for client: ${normalizedClientId}`);
    try {
      const docRef = doc(db, 'clients', normalizedClientId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
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
    const client = MOCK_FIRESTORE_DB[normalizedClientId];
    if (client) {
      console.log("Found mock data:", client.clientData);
      currentClientId = normalizedClientId; // Set current client ID for mock data access
      return client.clientData;
    } else {
      console.log("Client data not found in mock DB.");
      return null;
    }
  }
};

// --- Generic Collection/Document Operations ---

/**
 * Fetches all documents from a subcollection for the currently logged-in client.
 */
export const getCollection = async <T>(collectionName: string): Promise<T[]> => {
    if (!currentClientId) {
        console.warn(`No client logged in. Cannot fetch ${collectionName}.`);
        return [];
    }
    
    // Use Real Firestore if available
    if (db) {
        try {
            const collectionRef = collection(db, 'clients', currentClientId, collectionName);
            const snapshot = await getDocs(collectionRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        } catch (error) {
            console.error(`Error fetching collection ${collectionName}:`, error);
            return [];
        }
    }
    
    // Fallback to Mock Data
    const clientMockData = MOCK_FIRESTORE_DB[currentClientId];
    if (clientMockData && clientMockData.collections[collectionName as keyof MockCollections]) {
        // Return a copy to prevent direct mutation of the mock data store
        // FIX: Cast to unknown first to satisfy TypeScript's strict type checking for generics. This is safe because we assume getCollection is called with the correct collection name for type T.
        return [...clientMockData.collections[collectionName as keyof MockCollections]] as unknown as T[];
    }
    return [];
};

/**
 * Adds a new document to a subcollection.
 */
export const addDocument = async <T extends { id: string }>(collectionName: string, data: T): Promise<T> => {
    if (!currentClientId) throw new Error("No client logged in.");
    
    if (db) {
        const { id, ...rest } = data;
        const docRef = doc(db, 'clients', currentClientId, collectionName, id);
        await setDoc(docRef, rest);
    } else {
        const collection = MOCK_FIRESTORE_DB[currentClientId]?.collections[collectionName as keyof MockCollections];
        if (collection) {
            // FIX: Cast to unknown first to satisfy TypeScript's strict type checking for generics. This is safe because we assume addDocument is called with the correct collection name for type T.
            (collection as unknown as T[]).push(data);
        }
    }
    return data;
};

/**
 * Updates an existing document in a subcollection.
 */
export const updateDocument = async <T extends { id: string }>(collectionName: string, data: T): Promise<void> => {
    if (!currentClientId) throw new Error("No client logged in.");

    if (db) {
        const { id, ...rest } = data;
        const docRef = doc(db, 'clients', currentClientId, collectionName, id);
        await updateDoc(docRef, rest);
    } else {
        const collection = MOCK_FIRESTORE_DB[currentClientId]?.collections[collectionName as keyof MockCollections] as T[] | undefined;
        if (collection) {
            const index = collection.findIndex(item => item.id === data.id);
            if (index !== -1) {
                collection[index] = data;
            }
        }
    }
};

/**
 * Deletes a document from a subcollection.
 */
export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
    if (!currentClientId) throw new Error("No client logged in.");
    
    if (db) {
        const docRef = doc(db, 'clients', currentClientId, collectionName, docId);
        await deleteDoc(docRef);
    } else {
        const collection = MOCK_FIRESTORE_DB[currentClientId]?.collections[collectionName as keyof MockCollections] as { id: string }[] | undefined;
        if (collection) {
            const index = collection.findIndex(item => item.id === docId);
            if (index > -1) {
                collection.splice(index, 1);
            }
        }
    }
};