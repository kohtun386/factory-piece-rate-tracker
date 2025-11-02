// IMPORTANT: Replace with your actual Firebase project configuration.
// This is placeholder data.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// NOTE: This is a simplified, mock implementation for the browser environment.
// It simulates fetching data from Firestore without a real backend connection.
// In a real application, you would use the Firebase SDK.
// e.g., import { initializeApp } from "firebase/app";
// e.g., import { getFirestore, doc, getDoc } from "firebase/firestore";

import { ClientData } from '../types';

// Mock Firestore database
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


/**
 * Fetches client data from the Firestore 'clients' collection.
 * In a real app, this would be an async call to Firebase.
 * For this environment, it's a synchronous lookup in a mock object.
 * 
 * @param clientId The document ID of the client to fetch.
 * @returns A promise that resolves with the ClientData or null if not found.
 */
export const getClientData = async (clientId: string): Promise<ClientData | null> => {
  console.log(`Simulating Firestore fetch for client: ${clientId}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const clientData = MOCK_FIRESTORE_DB[clientId.toLowerCase().trim()];
  
  if (clientData) {
    console.log("Found client data:", clientData);
    return clientData;
  } else {
    console.log("Client data not found.");
    return null;
  }
};
