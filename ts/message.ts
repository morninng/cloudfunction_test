

 import * as firebase_admin from 'firebase-admin';


import { TEAM_OPPOSITION, ParticipateCannotgo, ParticipateGoing,
ParticipateMaybe,ParticipateInvited, ParticipateProposition, ParticipateOpposition } from './interface/participate'



interface  MessageData  {
    event_id: string;
    sender_id?: string;
    title: string;
    read: boolean;
    notified_user?: string;
    only_notify?: boolean;
    counter?: number;
}
;
export class Message{


    // constructor(){}

    async eventchat_added(event_id, sender_id): Promise<any> {

        const event_ref = "/event_related/event/" + event_id;
        // let event_data = {};
        const participants_tobe_notified = [];

        return firebase_admin.database().ref(event_ref).once("value")
        .then( (snapshot)=>{
            const event_data = snapshot.val() || {};
            for(const key in event_data.participants){
                if(event_data.participants[key] != ParticipateCannotgo /* || event_data.participants[key] != "ParticipateInvited" */){
                    participants_tobe_notified.push(key);
                }
            }

            const promise_arr: Promise<any>[] = [];

            if(participants_tobe_notified.length === 0){
                console.log('no participants to be notified');
            }else if(participants_tobe_notified.length === 1 && participants_tobe_notified[0] === sender_id){
                console.log('only sender is participants');
            }else{
                const event_title = event_data.motion || event_data.title || "";
                participants_tobe_notified.forEach((receiver_id)=>{
                    promise_arr.push (this.add_message_notification(event_id, sender_id, receiver_id, event_title, participants_tobe_notified));
                })
            }
            return Promise.all(promise_arr);

        }).catch(()=>{

        });

    }





    private async add_message_notification(event_id, sender_id, reciver_id, event_title, participants_tobe_notified): Promise<any>{
        const message_ref = "users/message/" + reciver_id;
        return firebase_admin.database().ref(message_ref).once("value")
        .then( (snapshot)=>{
            const message = snapshot.val();
            let existing_message_id = null;
            let existing_message_data = null;
            let original_sender_id = null;

            for(let key in message){
                if(message[key] && message[key].event_id === event_id){
                    existing_message_id = key;
                    existing_message_data = message[key];
                    original_sender_id = message[key].sender_id;
                }
            }

            const messaging_promise: Promise<any>[] = []

            // no other participants has sent a message in this event before other than receiver
            if( reciver_id === sender_id && (reciver_id === original_sender_id || !original_sender_id )){
                
                let notified_user = null
                participants_tobe_notified.forEach((user_id)=>{
                    if(user_id !== reciver_id){
                        notified_user = user_id;
                    }
                })
                const message_data :MessageData = {
                    event_id: event_id,
                    notified_user: notified_user,
                    title: event_title,
                    read: true,
                    only_notify: true
                }
                messaging_promise.push( this.add_message_notification_user(reciver_id, message_data));

            }else{

                const notified_user_id = sender_id || original_sender_id;
                // receiver is the sender and previously someone has sent a message before
                // it is used to check have an chat field for the sender
                if(sender_id === reciver_id){
                    const message_data = {
                        event_id: event_id,
                        sender_id: notified_user_id,
                        title: event_title,
                        read: true,
                        counter: 0
                    }
                    messaging_promise.push( this.add_message_notification_user(reciver_id, message_data));
                }else{
                    // message has been ever sent and increment the unread number
                    if(existing_message_data && existing_message_data.read === false){
                        const  current_counter =  Number(existing_message_data.counter) || 1;
                        const message_data : MessageData= {
                            event_id: event_id,
                            sender_id: notified_user_id,
                            title: event_title,
                            read: false,
                            counter: current_counter + 1
                        }
                        messaging_promise.push( this.add_message_notification_user(reciver_id, message_data));
                    }else{
                        //all the other cases
                        const message_data :MessageData = {
                            event_id: event_id,
                            sender_id: notified_user_id,
                            title: event_title,
                            read: false
                        }
                        messaging_promise.push( this.add_message_notification_user(reciver_id, message_data));
                    }
                }
            }

            if(existing_message_id){
                messaging_promise.push( this.delete_message_notification(reciver_id, existing_message_id));
            }
            return Promise.all(messaging_promise)
        });
    }

    private async delete_message_notification(reciver_id, existing_message_id): Promise<any>{

        const user_message_ref = firebase_admin.database().ref("/users/message/" + reciver_id + "/" + existing_message_id);
        return user_message_ref.remove().then(()=>{
            console.log("remove message succeed");
        }).catch((err)=>{
            console.log("error ", err);
        });

    }


    private async add_message_notification_user(reciver_id, message_data): Promise<any>{

        const current_time = Date.now();
        const user_message_ref = firebase_admin.database().ref("/users/message/" + reciver_id + "/" + current_time);
        return user_message_ref.update(message_data).then(()=>{
            console.log("finish adding data")
        }).catch((err)=>{
            console.log("error ", err);
        });
    }


    async eventchat_read(event_id, user_id): Promise<any>{

        const usermessage_ref = "/users/message/" + user_id;
        return firebase_admin.database().ref(usermessage_ref).once("value")
        .then( (snapshot)=>{

            console.log("aaa");
            const message_arr = [];
            snapshot.forEach((child_snapshot)=>{
                if(child_snapshot.val().event_id === event_id){
                    message_arr.push(Object.assign({},child_snapshot.val(), {key:child_snapshot.key}))
                }else{
                    return false;
                }
            })

            console.log(message_arr, user_id);
            return this.read_messages(message_arr, user_id);
        });
    }


    private async read_messages(message_arr, user_id): Promise<any>{

         const promise_arr = [];

        if(message_arr.length === 1){
            promise_arr.push(this.read_message(message_arr[0].key, user_id));
        }else if(message_arr.length > 1){

            promise_arr.push(this.read_message(message_arr[0].key, user_id));
            for(let i=1; i< message_arr.length; i++){
                promise_arr.push(this.delete_message(message_arr[i].key, user_id));
            }
        }
        return Promise.all(promise_arr);

    }

    private async read_message(message_key, user_id): Promise<any>{

        const usermessage_ref = "/users/message/" + user_id + "/" + message_key;
        return firebase_admin.database().ref(usermessage_ref).update({
            read:true,
            counter:0
        })
        .then( ()=>{
            console.log("succeed to set as read");
        }).catch(()=>{
            console.log("failed");
        })
    }

    private async delete_message(message_key, user_id): Promise<any>{

        const usermessage_ref = "/users/message/" + user_id + "/" + message_key;
        return firebase_admin.database().ref(usermessage_ref).remove()
        .then( ()=>{
            console.log("succeed to set delete");
        }).catch(()=>{
            console.log("failed to delete");
        })

    }

}

// module.exports = Message;
