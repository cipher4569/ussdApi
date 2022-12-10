import * as functions from "firebase-functions";
import {Express} from "express";
import * as express from "express";
import * as cors from "cors";

const app: Express = express();

app.use(cors({origin: true}));

app.post("/session/:sessionId/status", async (req, res) => {
  const sessionId = req.params.sessionId;
  functions.logger.log("sessionId >>", sessionId, {structuredData: true});

  // res.header("Content-Type", "application/xml");
  res.status(200).send("ok");
});

app.post("/session/:sessionId/start", async (req, res) => {
  // const content = req.body;
  // console.log("content >>", content);

  const displayPlayload = {
    shouldClose: false,
    ussdMenu: "George Municipality: \n1.Statement\n2.Log a Fault\n3.Exit",
    responseExitCode: 200,
    responseMessage: "",
  };
  res.status(200).send(displayPlayload);
});

app.put("/session/:sessionId/response", async (req, res) => {
  const content = req.body;

  if (content.text === "2") {
    const displayPlayload = {
      shouldClose: false,
      ussdMenu: "Log a Fault: \n1.fault\n2.Exit",
      responseExitCode: 200,
      responseMessage: "",
    };
    return res.status(200).send(displayPlayload);
  } else if (content.text === "1") {
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

app.put("/session/:sessionId/end", async (req, res) => {
  const displayPlayload = {
    responseExitCode: 200,
    responseMessage: "Thank you for using this service",
  };
  return res.status(200).send(displayPlayload);
});

export const ussdApi = functions.https.onRequest(app);
