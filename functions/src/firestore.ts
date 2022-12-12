import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


admin.initializeApp({
  credential: admin.credential.cert({
    privateKey: functions.config().private.key.replace(/\\n/g, "\n"),
    projectId: functions.config().project.id,
    clientEmail: functions.config().client.email,
  }),
  databaseURL: "https://pivotal-development-e0d3c.firebaseio.com",
});
export const firestore = admin.firestore();
