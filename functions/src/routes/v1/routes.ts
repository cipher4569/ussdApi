/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable new-cap */
import * as functions from "firebase-functions";
import {Router} from "express";
import {firestore} from "../../firestore";
import * as admin from "firebase-admin";
// import {generateCollectionID} from "../../helper/collectionIDGeneration";

const router = Router();

router.post("/session/:sessionId/status", async (req, res) => {
  const sessionId = req.params.sessionId;
  functions.logger.log("sessionId >>", sessionId, {structuredData: true});
  res.status(200).send("ok");
});

router.post("/session/:sessionId/start", async (req, res) => {
  const content = req.body;
  const sessionIdFromRequest = req.params.sessionId;
  functions.logger.log("session start >>", content, {structuredData: true});
  const group = content.shortCode.split("*")[1];
  const getService = content.shortCode.split("*")[2];
  const service = getService.split("#")[0];
  const getUssdCollection = firestore.collection("registry").doc("ussd");
  const getUssdGroupDoc = await getUssdCollection
      .collection(group)
      .doc(service)
      .get();
  if (getUssdGroupDoc.exists) {
    // check if mobile number has an ongoing session
    const sessionList = getUssdGroupDoc.data()?.sessions;
    const ifPreviousSession = sessionList.find((item: any) => item.mobile_number === content.msisdn);
    // if previous sessions continue with the session
    if (ifPreviousSession) {
      const getSessionId = ifPreviousSession.sessionRef.path;
      const sessionId = getSessionId.split("ussd_sessions/")[1];
      functions.logger.log("session id >>>", sessionId, {structuredData: true});
      const getSessionDocs = await firestore.collection("ussd_sessions").doc(sessionIdFromRequest).get();
      const currentSessionPosition = getSessionDocs.data()?.position.current;
      const previousSessionPosition = getSessionDocs.data()?.position.previous;

      if (currentSessionPosition === "0" && previousSessionPosition === "none") {
        const languageDefault = getSessionDocs.data()?.position.language;
        const dbData = {
          ...getUssdGroupDoc.data(),
        };
        let menu = dbData[`${languageDefault}`]["menu"].replace(":", ":\n");
        menu = menu.replace("1. English", "1. English\n");
        const displayPlayload = {
          shouldClose: false,
          ussdMenu: menu,
          responseExitCode: 200,
          responseMessage: "",
        };
        return res.status(200).send(displayPlayload);
      }// select from last sesssion
    } else {
      const languageDefault = getUssdGroupDoc.data()?.default;
      if (languageDefault === "english") {
        let menu = getUssdGroupDoc.data()?.english.menu.replace(":", ":\n");
        menu = menu.replace("1. English", "1. English\n");
        const registryRef = getUssdCollection.collection(group).doc(service).path;
        // const generateID = generateCollectionID(content.msisdn);
        const payloadToInsertDb = {
          position: {
            current: "0",
            language: "english",
            previous: "none",
          },
          response: [],
          service: firestore.doc(registryRef),
        };
        await firestore.collection("ussd_sessions").doc(sessionIdFromRequest).create(payloadToInsertDb);
        const sessionData = {
          mobile_number: content.msisdn,
          sessionRef: firestore.doc(firestore.collection("ussd_sessions").doc(sessionIdFromRequest).path),
        };
        getUssdCollection.collection(group).doc(service).update({sessions: admin.firestore.FieldValue.arrayUnion(sessionData)});
        const displayPlayload = {
          shouldClose: false,
          ussdMenu: menu,
          responseExitCode: 200,
          responseMessage: "",
        };
        return res.status(200).send(displayPlayload);
      } else {
        // zulu
        const menu = getUssdGroupDoc.data()?.zulu.menu;
        const displayPlayload = {
          shouldClose: false,
          ussdMenu: menu,
          responseExitCode: 200,
          responseMessage: "",
        };
        return res.status(200).send(displayPlayload);
      }
    }
  } else {
    const displayPlayload = {
      shouldClose: true,
      responseExitCode: 400,
      responseMessage: "Invalid code",
    };
    return res.status(200).send(displayPlayload);
  }
});

router.put("/session/:sessionId/response", async (req, res) => {
  const content = req.body;
  functions.logger.log("body content >>", content, {structuredData: true});
  // check msisdn and see if theres still an active session;

  if (content.text === "1") {
    const displayPlayload = {
      shouldClose: false,
      ussdMenu: "Log a Fault: \n1.fault\n2.Exit",
      responseExitCode: 200,
      responseMessage: "",
    };
    return res.status(200).send(displayPlayload);
  } else if (content.text === "2") {
    const displayPlayload = {
      shouldClose: false,
      ussdMenu: "Statement: \n1.statement\n2.Exit",
      responseExitCode: 200,
      responseMessage: "",
    };
    return res.status(200).send(displayPlayload);
  } else {
    const displayPlayload = {
      responseExitCode: 200,
      responseMessage: "Thank you for using this service",
    };
    return res.status(200).send(displayPlayload);
  }
});

router.put("/session/:sessionId/end", async (req, res) => {
  functions.logger.log("session end >>", req.body, {structuredData: true});
  let {exitCode, reason} = req.body;
  if (exitCode == 510) {
    reason = reason.split("(")[1];
    const resObj = reason.split(")")[0];
    const errorRes = resObj.split("HTTP status code 400 with message")[1];
    // const parseError
    const obj = errorRes;
    console.log("obj >>", typeof obj);
    functions.logger.log("response message >>", obj, {structuredData: true});
  }
  const displayPlayload = {
    responseExitCode: 200,
    responseMessage: "Thank you for using this service",
  };
  return res.status(200).send(displayPlayload);
});

export default router;

