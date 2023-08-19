const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const axios = require('axios');
const cors = require('cors')({ origin: true });
const admin = require("firebase-admin");
const { resolve } = require("dns");
admin.initializeApp();

exports.replicateForFo = functions.firestore
  .document("devices/{deviceUid}/observations/{documentId}")
  .onWrite((change, context) => {
    let doc = change.after.data();
    //functions.logger.log("doc", doc);
    //CHECK SI TOUTES IMAGES SONT PRESENTES/UPLOADEES:AVEC URL
    if (doc.images && (doc.images.length > 0)) {
      for (let reliFiles = 0;reliFiles < doc.images.length;reliFiles++) 
      {
        //functions.logger.log("doc.images[reliFiles]", doc.images[reliFiles]);
        if (!doc.images[reliFiles].url) {
          return new Promise((resolve, reject) => {
            resolve("Not all urls presence");
          });
        }
      }
    }
    //AJOUT DE LOBS DANS DATAS PUBLIQUES POUR MAP
      //DATE
      //COORDS
      //IMAGES
    let mapObj = {
      uid:doc.uid,
      dateObs:doc.dateObs,
      lat:doc.lat,
      long:doc.long,
      espece:doc.espece
    }
    if (doc.images && (doc.images.length > 0)) {
      mapObj.images = doc.images;
    }
    admin.firestore().collection("map").add(mapObj);
    //SI URLs ON ENVOIE SUR SERVEUR BO
    return axios.post('http://ns3192284.ip-5-39-73.eu/echouage/api/v1/sync/new',doc)
      .then(response => {
        functions.logger.log("response", response);
        //return false;
      })
      .catch(err => {
        functions.logger.log("err", err);
        //return false;
      })
});