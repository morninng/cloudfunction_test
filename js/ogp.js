"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin = require("firebase-admin");
const crypto = require("crypto");
// import * as ogp_parser from 'ogp-parser';
const ogp_scraper = require("open-graph-scraper");
class OGP {
    constructor() {
        this.set_writtendebate_opinion_ogp = (opinion_path, url_arr) => {
            url_arr.forEach((url) => {
                const hash = crypto.createHash('sha256');
                hash.update(url);
                const data = hash.digest("base64");
                const hashed_key = data.replace(/\//g, "");
                this.register_ogp_writtendebate_opinion(hashed_key, url, opinion_path);
            });
        };
        this.register_ogp_writtendebate_opinion = (hashed_key, url, opinion_path) => {
            console.log("hashed_data", hashed_key);
            console.log("url", url);
            this.retrieve_ogp(url, hashed_key)
                .then((ogp_value) => {
                console.log("ogp_value is retrieved either after registration or already exist");
                return firebase_admin.database().ref(opinion_path + "/" + hashed_key).set(ogp_value);
            }).then(() => {
                console.log("ogp data is set");
            }).catch(() => {
                console.log("ogp handling feiled");
            });
            console.log("check");
        };
    }
    retrieve_ogp(url, hashed_key) {
        return new Promise((resolve, reject) => {
            let ogp_value = null;
            const ogp_ref = "/ogp/" + hashed_key;
            firebase_admin.database().ref(ogp_ref).once("value").then((snapshot) => {
                const ogp_value = snapshot.val();
                if (ogp_value) {
                    resolve(ogp_value);
                    return Promise.reject("ogp already exist");
                }
                else {
                    return ogp_scraper({ url: url });
                }
            }).then((result) => {
                if (result && result.success) {
                    ogp_value = Object.assign({}, { url: url }, result.data);
                    console.log("retrieve ogp data succeed", ogp_value);
                    for (let key in ogp_value) {
                        if (!ogp_value[key]) {
                            delete ogp_value[key];
                        }
                    }
                    const ogp_ref = "/ogp/" + hashed_key;
                    return firebase_admin.database().ref(ogp_ref).set(ogp_value);
                }
                else {
                    reject(new Error("retrieving ogp failed"));
                    return Promise.reject("retrieving ogp failed");
                }
            }).then(() => {
                console.log("register ogp success");
                resolve(ogp_value);
            }).catch((error) => {
                console.error(error);
            });
        });
    }
}
exports.OGP = OGP;
module.exports = OGP;