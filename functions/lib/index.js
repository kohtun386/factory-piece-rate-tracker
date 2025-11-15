"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteSupervisor = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
(0, app_1.initializeApp)();
exports.inviteSupervisor = (0, https_1.onCall)(async (request) => {
    // Get auth from request.auth
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const ownerUid = request.auth.uid;
    // Get data from request.data
    const supervisorEmail = request.data.supervisorEmail;
    if (!supervisorEmail) {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with a 'supervisorEmail' argument.");
    }
    const db = (0, firestore_1.getFirestore)();
    const auth = (0, auth_1.getAuth)();
    try {
        // Verify Owner Status
        const clientsRef = db.collection("clients");
        const querySnapshot = await clientsRef.where("ownerUid", "==", ownerUid).get();
        if (querySnapshot.empty) {
            throw new https_1.HttpsError("permission-denied", "Only owners can invite supervisors.");
        }
        const clientId = querySnapshot.docs[0].id;
        // Create Auth User
        const userRecord = await auth.createUser({ email: supervisorEmail });
        const newSupervisorUid = userRecord.uid;
        // Update Firestore
        await db.collection("clients").doc(clientId).update({
            supervisorUids: firestore_1.FieldValue.arrayUnion(newSupervisorUid),
        });
        return { status: "success", message: "Supervisor invited successfully." };
    }
    catch (error) {
        // Handle known errors
        if (error.code === 'auth/email-already-exists') {
            throw new https_1.HttpsError("already-exists", "This email is already in use.");
        }
        // Re-throw HttpsError instances
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=index.js.map