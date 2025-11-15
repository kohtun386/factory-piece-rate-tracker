import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp();

export const inviteSupervisor = onCall(async (request: CallableRequest) => {
  // Get auth from request.auth
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const ownerUid = request.auth.uid;

  // Get data from request.data
  const supervisorEmail = request.data.supervisorEmail;

  if (!supervisorEmail) {
    throw new HttpsError("invalid-argument", "The function must be called with a 'supervisorEmail' argument.");
  }

  const db = getFirestore();
  const auth = getAuth();

  try {
    // Verify Owner Status
    const clientsRef = db.collection("clients");
    const querySnapshot = await clientsRef.where("ownerUid", "==", ownerUid).get();

    if (querySnapshot.empty) {
      throw new HttpsError("permission-denied", "Only owners can invite supervisors.");
    }
    const clientId = querySnapshot.docs[0].id;

    // Create Auth User
    const userRecord = await auth.createUser({ email: supervisorEmail });
    const newSupervisorUid = userRecord.uid;

    // Update Firestore
    await db.collection("clients").doc(clientId).update({
      supervisorUids: FieldValue.arrayUnion(newSupervisorUid),
    });

    return { status: "success", message: "Supervisor invited successfully." };

  } catch (error: any) {
    // Handle known errors
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError("already-exists", "This email is already in use.");
    }
    // Re-throw HttpsError instances
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error.message);
  }
});
