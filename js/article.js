"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin = require("firebase-admin");
const participate_1 = require("./../interface/participate");
class Article {
    constructor() { }
    set_audiotranscript_to_participant(event_id) {
        const article_type = "ARTICLETYPE_ONLINE_LIVEVIDEO_serverrecognition";
        this.set_article_to_participant(event_id, article_type);
    }
    set_writtendebate2_to_participant(event_id) {
        const article_type = "ARTICLETYPE_WRITTENDEBATE2";
        this.set_article_to_participant(event_id, article_type);
    }
    set_audiotranscript_to_sender(event_id, sender_id) {
        const article_type = "ARTICLETYPE_ONLINE_LIVEVIDEO_serverrecognition";
        this.set_article_to_sender(event_id, article_type, sender_id);
    }
    set_writtendebate2_to_sender(event_id, sender_id) {
        const article_type = "ARTICLETYPE_WRITTENDEBATE2";
        this.set_article_to_sender(event_id, article_type, sender_id);
    }
    set_article_to_participant(event_id, article_type) {
        console.log("set_audiotranscript_to_participant", event_id);
        firebase_admin.database().ref('/event_related/event/' + event_id).once('value').then((snapshot) => {
            const event_data = snapshot.val() || {};
            const participants = event_data.participants;
            const motion = event_data.motion;
            const article_obj = {
                motion, article_type
            };
            for (let key in participants) {
                if (participants[key] !== participate_1.ParticipateCannotgo || participants[key] !== participate_1.ParticipateInvited)
                    this.add_article_to_users(key, event_id, article_obj);
            }
        });
    }
    set_article_to_sender(event_id, article_type, sender_id) {
        firebase_admin.database().ref('/event_related/event/' + event_id).once('value').then((snapshot) => {
            const event_data = snapshot.val() || {};
            const motion = event_data.motion;
            const article_obj = {
                motion, article_type
            };
            this.add_article_to_users(sender_id, event_id, article_obj);
        });
    }
    add_article_to_users(user_id, event_id, article_obj) {
        firebase_admin.database().ref('/users/article/' + user_id + '/' + event_id).update(article_obj)
            .then(() => {
            console.log("article data added to", user_id);
        }).catch(() => {
            console.log("add article for");
        });
    }
}
exports.Article = Article;
module.exports = Article;
