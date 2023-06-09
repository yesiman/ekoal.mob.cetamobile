const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const axios = require('axios');
const cors = require('cors')({ origin: true });
const admin = require("firebase-admin");
admin.initializeApp();

exports.replicateForFo = functions.firestore
  .document("devices/{deviceUid}/observations/{documentId}")
  .onCreate((snap, context) => {
    let doc = snap.data();
    functions.logger.log("doc", doc);
    return axios.post('http://ns3192284.ip-5-39-73.eu/echouage/api/v1/sync/new',doc)
          .then(response => {
            functions.logger.log("response", response);
            return false;
          })
          .catch(err => {
            functions.logger.log("err", err);
            return false;
          })
  });