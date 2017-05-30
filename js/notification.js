"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin = require("firebase-admin");
const NOTIFICATION_ELEMENT_generalcomment = "general_comment";
const NOTIFICATION_ELEMENT_sentencecomment = "sentence_comment";
const NOTIFICATION_ELEMENT_like = "like";
const NOTIFICATION_ELEMENT_addargument = "argument";
const NOTIFICATION_ELEMENT_addopinion = "opinion";
const NOTIFICATION_ELEMENT_vote = "vote";
// comment type for event related notification
const NOTIFICATION_ELEMENT_eventinvite = "eventinvite";
const NOTIFICATION_ELEMENT_eventmaybe = "eventmaybe";
const NOTIFICATION_ELEMENT_eventgoing = "eventgoing";
const NOTIFICATION_ELEMENT_eventcannotgo = "eventcannotgo";
const NOTIFICATION_ELEMENT_eventcreated = "eventcreated";
// when notification is clicked, go to event page
// Destinationが、クリックしたときに行く先。行く先が同じものは、notificationに二ついらないので、過去分はけす。
const NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_clientrecog = "NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_clientrecog";
const NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog = "NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog";
const NOTIFICATION_DESTINATION_ARTICLE_writtendebate2 = "NOTIFICATION_DESTINATION_ARTICLE_writtendebate2";
const NOTIFICATION_DESTINATION_EVENT = "NOTIFICATION_DESTINATION_EVENT";
const participate_1 = require("./../interface/participate");
class Notification {
    constructor() {
        this.writtendebate2_add_opinion = (event_id, opinion_id, sender_id) => {
            this.article_action(event_id, opinion_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_writtendebate2, NOTIFICATION_ELEMENT_addopinion);
        };
        this.writtendebate2_add_vote = (event_id, vote_id, sender_id) => {
            this.article_action(event_id, vote_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_writtendebate2, NOTIFICATION_ELEMENT_vote);
        };
        this.audiotranscriptserver_add_vote = (event_id, vote_id, sender_id) => {
            this.article_action(event_id, vote_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog, NOTIFICATION_ELEMENT_vote);
        };
        this.writtendebate2_add_generalcomment = (event_id, general_comment_id, sender_id) => {
            this.article_action(event_id, general_comment_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_writtendebate2, NOTIFICATION_ELEMENT_generalcomment);
        };
        this.audiotranscriptserver_add_generalcomment = (event_id, general_comment_id, sender_id) => {
            this.article_action(event_id, general_comment_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog, NOTIFICATION_ELEMENT_generalcomment);
        };
        this.writtendebate2_add_sentencecomment = (event_id, sentence_id, sender_id) => {
            this.article_action(event_id, sentence_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_writtendebate2, NOTIFICATION_ELEMENT_sentencecomment);
        };
        this.audiotranscriptserver_add_sentencecomment = (event_id, sentence_id, sender_id) => {
            this.article_action(event_id, sentence_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog, NOTIFICATION_ELEMENT_sentencecomment);
        };
        this.article_action = (event_id, notify_element_id, sender_id, destination_type, notify_element_type) => {
            console.log("article_action");
            const event_ref = "/event_related/event/" + event_id;
            const participants_tobe_notified = [];
            firebase_admin.database().ref(event_ref).once("value")
                .then((snapshot) => {
                const event_data = snapshot.val() || {};
                for (var key in event_data.participants) {
                    if (event_data.participants[key] != participate_1.ParticipateCannotgo /* || event_data.participants[key] != "ParticipateInvited" */) {
                        participants_tobe_notified.push(key);
                    }
                }
                if (participants_tobe_notified.length === 0) {
                    console.log("add_notification finish because there is no participants in the event");
                    return;
                }
                if (participants_tobe_notified.length === 1 && participants_tobe_notified[0] === sender_id) {
                    console.log("add_notification finish because participants is only the sender");
                    return;
                }
                const event_title = event_data.motion || event_data.title || "";
                // const event_type = event_data.type;
                participants_tobe_notified.forEach((receiver_id) => {
                    if (sender_id !== receiver_id) {
                        this.article_action_user(event_id, sender_id, receiver_id, event_title, destination_type, notify_element_type, notify_element_id);
                    }
                });
            });
        };
        this.event_participate = (event_id) => {
            console.log("event_participate in notificatoin module");
            const event_ref = "/event_related/event/" + event_id;
            const participants_tobe_notified = [];
            const participants_going = [];
            const participants_maybe = [];
            const participants_invited = [];
            const participants_proposition = [];
            const participants_opposition = [];
            firebase_admin.database().ref(event_ref).once("value")
                .then((snapshot) => {
                const event_data = snapshot.val() || {};
                const event_creator_id = event_data.created_by;
                // current event participants data is set to array
                for (var key in event_data.participants) {
                    if (event_data.participants[key] === participate_1.ParticipateGoing) {
                        participants_going.push(key);
                    }
                    if (event_data.participants[key] === participate_1.ParticipateMaybe) {
                        participants_maybe.push(key);
                    }
                    if (event_data.participants[key] === participate_1.ParticipateInvited) {
                        participants_invited.push(key);
                    }
                    if (event_data.participants[key] === participate_1.ParticipateProposition) {
                        participants_proposition.push(key);
                    }
                    if (event_data.participants[key] === participate_1.ParticipateOpposition) {
                        participants_opposition.push(key);
                    }
                }
                const participant_info = {
                    going: participants_going,
                    maybe: participants_maybe,
                    invited: participants_invited,
                    proposition: participants_proposition,
                    opposition: participants_opposition
                };
                const event_title = event_data.motion || event_data.title || "";
                const event_date_time_start = event_data.date_time_start;
                const event_notification_data = {
                    event_id: event_id,
                    sender_id: event_creator_id,
                    event_title: event_title,
                    read: false,
                    destination: NOTIFICATION_DESTINATION_EVENT,
                    participant_info: participant_info,
                    date_time_start: event_date_time_start,
                    receiver_participate_status: null
                };
                const event_notify_data_going = Object.assign({}, event_notification_data, { receiver_participate_status: participate_1.ParticipateGoing });
                const event_notify_data_mayge = Object.assign({}, event_notification_data, { receiver_participate_status: participate_1.ParticipateMaybe });
                const event_notify_data_invited = Object.assign({}, event_notification_data, { receiver_participate_status: participate_1.ParticipateInvited });
                const event_notify_data_propositino = Object.assign({}, event_notification_data, { receiver_participate_status: participate_1.ParticipateProposition });
                const event_notify_data_opposition = Object.assign({}, event_notification_data, { receiver_participate_status: participate_1.ParticipateOpposition });
                participants_going.forEach((receiver_id) => {
                    this.event_participate_user(event_id, receiver_id, event_notify_data_going);
                });
                participants_maybe.forEach((receiver_id) => {
                    this.event_participate_user(event_id, receiver_id, event_notify_data_mayge);
                });
                participants_invited.forEach((receiver_id) => {
                    this.event_participate_user(event_id, receiver_id, event_notify_data_invited);
                });
                participants_proposition.forEach((receiver_id) => {
                    this.event_participate_user(event_id, receiver_id, event_notify_data_propositino);
                });
                participants_opposition.forEach((receiver_id) => {
                    this.event_participate_user(event_id, receiver_id, event_notify_data_opposition);
                });
            });
        };
        this.notification_read = (event_id, user_id, notification_destination) => {
            console.log("notification_read");
            const usernotification_ref = "/users/notification/" + user_id;
            firebase_admin.database().ref(usernotification_ref).once("value")
                .then((snapshots) => {
                const notification_arr = [];
                snapshots.forEach((child_snapshot) => {
                    const notification_data = child_snapshot.val();
                    if (notification_data.event_id === event_id && notification_data.destination === notification_destination) {
                        notification_arr.push(Object.assign({}, child_snapshot.val(), { key: child_snapshot.key }));
                    }
                    else {
                        return false;
                    }
                });
                console.log("notification_arr, ", notification_arr);
                this.read_notifications(notification_arr, user_id);
            });
        };
    }
    article_action_user(event_id, sender_id, receiver_id, event_title, destination_type, notify_element_type, notify_element_id) {
        console.log("article_action_user", receiver_id);
        const notification_ref = "users/notification/" + receiver_id;
        firebase_admin.database().ref(notification_ref).once("value")
            .then((snapshot) => {
            const existing_notification_data_all = snapshot.val();
            let existing_notification_id_arr = [];
            let existing_notification_data = {
                event_id: "",
                sender_id: "",
                event_title: "",
                read: false,
                destination: "",
                comment_data: {}
            };
            for (let key in existing_notification_data_all) {
                if (existing_notification_data_all[key] && existing_notification_data_all[key].event_id === event_id && existing_notification_data_all[key].destination === destination_type) {
                    existing_notification_id_arr.push(key);
                    existing_notification_data = existing_notification_data_all[key];
                }
            }
            const existing_comment_data = existing_notification_data.comment_data ||
                {
                    general_comment: [],
                    sentence_comment: [],
                    argument: [],
                    opinion: [],
                    vote: [],
                    like: [],
                };
            // each key should match NOTIFICATION_ELEMENT
            const new_comment_data = {
                general_comment: existing_comment_data.general_comment || [],
                sentence_comment: existing_comment_data.sentence_comment || [],
                argument: existing_comment_data.argument || [],
                opinion: existing_comment_data.opinion || [],
                vote: existing_comment_data.vote || [],
                like: existing_comment_data.like || []
            };
            new_comment_data[notify_element_type].push(notify_element_id);
            let new_notification_data = {
                event_id: event_id,
                sender_id: sender_id,
                event_title: event_title,
                read: false,
                destination: destination_type,
                comment_data: new_comment_data
            };
            console.log("existing_notification_id_arr", existing_notification_id_arr);
            console.log("new_notification_data", new_notification_data);
            this.add_notification_data_userfield(receiver_id, new_notification_data);
            if (existing_notification_id_arr.length > 0) {
                existing_notification_id_arr.forEach((existing_notification_id) => {
                    this.remove_notification_data_userfield(receiver_id, existing_notification_id);
                });
            }
        });
    }
    add_notification_data_userfield(receiver_id, new_notification_data) {
        console.log("add_notification_data_userfield", receiver_id);
        var current_time = Date.now();
        var user_notification_ref = firebase_admin.database().ref("/users/notification/" + receiver_id + "/" + current_time);
        user_notification_ref.update(new_notification_data).then(() => {
            console.log("finish adding data");
        }).catch((err) => {
            console.log("error ", err);
        });
    }
    remove_notification_data_userfield(receiver_id, existing_notification_id) {
        console.log("remove_notification_data_userfield", receiver_id);
        var user_notification_ref = firebase_admin.database().ref("/users/notification/" + receiver_id + "/" + existing_notification_id);
        user_notification_ref.remove().then(() => {
            console.log("finish removing data");
        }).catch((err) => {
            console.log("error ", err);
        });
    }
    event_participate_user(event_id, receiver_id, event_notify_data) {
        console.log("event_registered");
        const event_ref = "/event_related/event/" + event_id;
        const receiver_notification_ref = "users/notification/" + receiver_id;
        firebase_admin.database().ref(receiver_notification_ref).once("value")
            .then((snapshot) => {
            const receiver_notification = snapshot.val();
            for (let key in receiver_notification) {
                if (receiver_notification[key].event_id === event_id && receiver_notification[key].destination === NOTIFICATION_DESTINATION_EVENT) {
                    this.remove_notification_data_userfield(receiver_id, key);
                }
            }
            this.add_notification_data_userfield(receiver_id, event_notify_data);
        });
    }
    read_notifications(notification_arr, user_id) {
        if (notification_arr.length === 0) {
            return;
        }
        if (notification_arr.length === 1) {
            this.read_notification(notification_arr[0].key, user_id);
            return;
        }
        if (notification_arr.length > 1) {
            this.read_notification(notification_arr[0].key, user_id);
            for (var i = 1; i < notification_arr.length; i++) {
                this.remove_notification_data_userfield(user_id, notification_arr[i].key);
            }
        }
    }
    read_notification(notification_key, user_id) {
        const usernotification_ref = "/users/notification/" + user_id + "/" + notification_key + "/read";
        console.log("usernotification_ref for read ", usernotification_ref);
        firebase_admin.database().ref(usernotification_ref).set(true)
            .then(() => {
            console.log("succeed to set as read");
        }).catch(() => {
            console.log("failed");
        });
    }
}
exports.Notification = Notification;
module.exports = Notification;
