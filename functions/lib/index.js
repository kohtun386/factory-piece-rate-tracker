"use strict";
// --- functions/src/index.ts (Final Fixed Version for ALL Flaws) ---
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteSupervisor = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
// Set the region for all functions in this file
(0, v2_1.setGlobalOptions)({ region: "asia-east1" });
// 2. Declare variables but DO NOT initialize them in the global scope.
let app;
let db;
let auth;
// 3. Create a lazy initialization function
function initializeAdminSDK() {
    // Only initialize if the app hasn't been initialized yet
    if (!app) {
        app = (0, app_1.initializeApp)();
        db = (0, firestore_1.getFirestore)(app);
        auth = (0, auth_1.getAuth)(app);
    }
}
exports.inviteSupervisor = (0, https_1.onCall)(async (request) => {
    var _a;
    // --- Safely get email *before* the try block (Retained from v5) ---
    const supervisorEmail = (_a = request.data) === null || _a === void 0 ? void 0 : _a.supervisorEmail;
    try {
        // 🚨 FINAL FIX: Initialize the Admin SDK INSIDE the try block to catch all init errors.
        initializeAdminSDK();
        if (!request.auth) {
            throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
        }
        const ownerUid = request.auth.uid;
        if (!supervisorEmail) {
            throw new https_1.HttpsError("invalid-argument", "The function must be called with a 'supervisorEmail' argument.");
        }
        // 1. Verify Owner Status
        const clientsRef = db.collection("clients");
        const querySnapshot = await clientsRef.where("ownerUid", "==", ownerUid).get();
        // ... (rest of the try block logic)
        if (querySnapshot.empty) {
            throw new https_1.HttpsError("permission-denied", "Only owners can invite supervisors.");
        }
        const clientId = querySnapshot.docs[0].id;
        const clientData = querySnapshot.docs[0].data();
        // 2. Create Auth User
        const userRecord = await auth.createUser({
            email: supervisorEmail,
            emailVerified: false
        });
        const newSupervisorUid = userRecord.uid;
        // 3. Generate the "Set Password" link
        const actionLink = await auth.generatePasswordResetLink(supervisorEmail);
        // 4. Create an email document in the 'mail' collection
        await db.collection("mail").add({
            to: [supervisorEmail],
            message: {
                subject: `You've been invited to ${clientData.factoryName}`,
                html: `
              <p>Hello,</p>
              <p>You have been invited to join the '${clientData.factoryName}' team on Digital Piece-Rate Tracker.</p>
              <p>Please click the link below to set your password and activate your account:</p>
              <p><a href="${actionLink}">Set Your Password</a></p>
              <p>Thanks,</p>
              <p>The Digital Piece-Rate Tracker Team</p>
            `,
            },
        });
        // 5. Update Firestore
        await db.collection("clients").doc(clientId).update({
            supervisorUids: firestore_1.FieldValue.arrayUnion(newSupervisorUid),
        });
        return { status: "success", message: "Supervisor invited successfully." };
    }
    catch (error) {
        // --- FINAL & SYNTAX-CORRECT BULLETPROOF CATCH BLOCK ---
        // This is the safety net that is now guaranteed to catch the initialization error.
        // 1. Sentinel log to confirm the catch block was REACHED.
        console.log("CATCH_BLOCK_ENTERED: True");
        // 2. Log primitive components of the error (safest method to ensure log output).
        if (error && typeof error === 'object') {
            console.error("FATAL_ERROR_INVITE_SUPERVISOR_CODE:", error.code || 'NO_CODE_PROPERTY');
            console.error("FATAL_ERROR_INVITE_SUPERVISOR_MESSAGE:", error.message || String(error));
        }
        else {
            console.error("FATAL_ERROR_INVITE_SUPERVISOR_MESSAGE:", String(error));
        }
        // 3. Handle specific Auth error safely.
        if (error && typeof error === 'object' && error.code === 'auth/email-already-exists') {
            console.warn("Attempted to invite existing user. Throwing ALREADY_EXISTS HttpsError.");
            throw new https_1.HttpsError("already-exists", "The user with this email already exists. Please use the 'Add Existing Supervisor' feature or contact support.");
        }
        // 4. Re-throw HttpsError instances
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        // 5. Final fallback for all other unhandled errors.
        throw new https_1.HttpsError("internal", "An unhandled internal error occurred. Please check function logs for 'FATAL_ERROR_INVITE_SUPERVISOR'.");
    }
});
//# sourceMappingURL=index.js.map