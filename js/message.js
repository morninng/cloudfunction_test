"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin = require("firebase-admin");
const participate_1 = require("./../interface/participate");
class Message {
    constructor() {
        this.eventchat_added = (event_id, sender_id) => {
            const event_ref = "/event_related/event/" + event_id;
            let event_data = {};
            let participants_tobe_notified = [];
            firebase_admin.database().ref(event_ref).once("value")
                .then((snapshot) => {
                const event_data = snapshot.val() || {};
                for (var key in event_data.participants) {
                    if (event_data.participants[key] != participate_1.ParticipateCannotgo /* || event_data.participants[key] != "ParticipateInvited" */) {
                        participants_tobe_notified.push(key);
                    }
                }
                if (participants_tobe_notified.length === 0) {
                    return;
                }
                if (participants_tobe_notified.length === 1 && participants_tobe_notified[0] === sender_id) {
                    return;
                }
                const event_title = event_data.motion || event_data.title || "";
                participants_tobe_notified.forEach((receiver_id) => {
                    this.add_message_notification(event_id, sender_id, receiver_id, event_title, participants_tobe_notified);
                });
            });
        };
        this.eventchat_read = function (event_id, user_id) {
            const usermessage_ref = "/users/message/" + user_id;
            firebase_admin.database().ref(usermessage_ref).once("value")
                .then((snapshot) => {
                console.log("aaa");
                const message_arr = [];
                snapshot.forEach((child_snapshot) => {
                    if (child_snapshot.val().event_id === event_id) {
                        message_arr.push(Object.assign({}, child_snapshot.val(), { key: child_snapshot.key }));
                    }
                    else {
                        return false;
                    }
                });
                console.log(message_arr, user_id);
                this.read_messages(message_arr, user_id);
            });
        };
    }
    add_message_notification(event_id, sender_id, reciver_id, event_title, participants_tobe_notified) {
        const message_ref = "users/message/" + reciver_id;
        firebase_admin.database().ref(message_ref).once("value")
            .then((snapshot) => {
            const message_data = snapshot.val();
            let existing_message_id = null;
            let existing_message_data = null;
            let original_sender_id = null;
            for (let key in message_data) {
                if (message_data[key] && message_data[key].event_id === event_id) {
                    existing_message_id = key;
                    existing_message_data = message_data[key];
                    original_sender_id = message_data[key].sender_id;
                }
            }
            // no other participants has sent a message in this event before other than receiver
            if (reciver_id === sender_id && (reciver_id === original_sender_id || !original_sender_id)) {
                let notified_user = null;
                participants_tobe_notified.forEach((user_id) => {
                    if (user_id !== reciver_id) {
                        notified_user = user_id;
                    }
                });
                const message_data = {
                    event_id: event_id,
                    notified_user: notified_user,
                    title: event_title,
                    read: true,
                    only_notify: true
                };
                this.add_message_notification_user(reciver_id, message_data);
            }
            else {
                const notified_user_id = sender_id || original_sender_id;
                // receiver is the sender and previously someone has sent a message before
                // it is used to check have an chat field for the sender
                if (sender_id === reciver_id) {
                    const message_data = {
                        event_id: event_id,
                        sender_id: notified_user_id,
                        title: event_title,
                        read: true,
                        counter: 0
                    };
                    this.add_message_notification_user(reciver_id, message_data);
                }
                else {
                    // message has been ever sent and increment the unread number
                    if (existing_message_data && existing_message_data.read === false) {
                        const current_counter = Number(existing_message_data.counter) || 1;
                        const message_data = {
                            event_id: event_id,
                            sender_id: notified_user_id,
                            title: event_title,
                            read: false,
                            counter: current_counter + 1
                        };
                        this.add_message_notification_user(reciver_id, message_data);
                    }
                    else {
                        //all the other cases
                        const message_data = {
                            event_id: event_id,
                            sender_id: notified_user_id,
                            title: event_title,
                            read: false
                        };
                        this.add_message_notification_user(reciver_id, message_data);
                    }
                }
            }
            if (existing_message_id) {
                this.delete_message_notification(reciver_id, existing_message_id);
            }
        });
    }
    delete_message_notification(reciver_id, existing_message_id) {
        var user_message_ref = firebase_admin.database().ref("/users/message/" + reciver_id + "/" + existing_message_id);
        user_message_ref.remove().then(() => {
            console.log("remove message succeed");
        }).catch((err) => {
            console.log("error ", err);
        });
    }
    add_message_notification_user(reciver_id, message_data) {
        var current_time = Date.now();
        var user_message_ref = firebase_admin.database().ref("/users/message/" + reciver_id + "/" + current_time);
        user_message_ref.update(message_data).then(() => {
            console.log("finish adding data");
        }).catch((err) => {
            console.log("error ", err);
        });
    }
    read_messages(message_arr, user_id) {
        if (message_arr.length === 0) {
            return;
        }
        if (message_arr.length === 1) {
            this.read_message(message_arr[0].key, user_id);
            return;
        }
        if (message_arr.length > 1) {
            this.read_message(message_arr[0].key, user_id);
            for (var i = 1; i < message_arr.length; i++) {
                this.delete_message(message_arr[i].key, user_id);
            }
        }
    }
    read_message(message_key, user_id) {
        const usermessage_ref = "/users/message/" + user_id + "/" + message_key;
        firebase_admin.database().ref(usermessage_ref).update({
            read: true,
            counter: 0
        })
            .then(() => {
            console.log("succeed to set as read");
        }).catch(() => {
            console.log("failed");
        });
    }
    delete_message(message_key, user_id) {
        const usermessage_ref = "/users/message/" + user_id + "/" + message_key;
        firebase_admin.database().ref(usermessage_ref).remove()
            .then(() => {
            console.log("succeed to set delete");
        }).catch(() => {
            console.log("failed to delete");
        });
    }
}
exports.Message = Message;
module.exports = Message;
