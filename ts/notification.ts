


 import * as firebase_admin from 'firebase-admin';

 const NOTIFICATION_ELEMENT_generalcomment = "general_comment";
 const NOTIFICATION_ELEMENT_sentencecomment = "sentence_comment";
 const NOTIFICATION_ELEMENT_like = "like";
 const NOTIFICATION_ELEMENT_addargument = "argument";
 const NOTIFICATION_ELEMENT_addopinion = "opinion";
 const NOTIFICATION_ELEMENT_vote = "vote";


interface CommentData {
    general_comment?:Array<string>;
    sentence_comment?:Array<string>;
    argument?:Array<string>;
    opinion?:Array<string>;
    vote?:Array<string>;
    like?:Array<string>;
}

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
 const NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog_2 = "NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog_2";
 const NOTIFICATION_DESTINATION_ARTICLE_writtendebate2 = "NOTIFICATION_DESTINATION_ARTICLE_writtendebate2";
 const NOTIFICATION_DESTINATION_EVENT = "NOTIFICATION_DESTINATION_EVENT";


import {TEAM_PROPOSITION, TEAM_OPPOSITION, ParticipateCannotgo, ParticipateGoing,
ParticipateMaybe,ParticipateInvited, ParticipateProposition, ParticipateOpposition } from './interface/participate'




interface ParticipatInfo{
    going:Array<string>;
    maybe:Array<string>;
    invited:Array<string>;
    proposition:Array<string>;
    opposition:Array<string>;
}

interface NotificationData_article{
    event_id: string;
    sender_id: string;
    event_title: string;
    read: boolean;
    destination: string;

    comment_data?: CommentData;
}

interface  NotificatoinData_event  {
    event_id: string;
    sender_id: string;
    event_title: string;
    read: boolean;
    destination:string;

    participant_info: ParticipatInfo
    date_time_start: Number;
    receiver_participate_status:string;
}

interface NotificatoinData_event_article{
    event_id: string;
    sender_id: string;
    event_title: string;
    read: boolean;
    destination: string;

    comment_data?: CommentData;
    participant_info?: ParticipatInfo
    date_time_start?: Number;

}




export class Notification{

    // constructor(){}

    async writtendebate2_add_opinion(event_id, opinion_id, sender_id): Promise<any> {
        return this.article_action(event_id, opinion_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_writtendebate2, NOTIFICATION_ELEMENT_addopinion);
    }

    async writtendebate2_add_vote(event_id, vote_id, sender_id): Promise<any>{
        return this.article_action(event_id, vote_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_writtendebate2, NOTIFICATION_ELEMENT_vote);
    }

    async audiotranscriptserver_add_vote(event_id, vote_id, sender_id): Promise<any> {
        this.article_action(event_id, vote_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog, NOTIFICATION_ELEMENT_vote);
    }
    async audiotranscriptserver_2_add_vote (event_id, vote_id, sender_id): Promise<any> {
        return this.article_action(event_id, vote_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog_2, NOTIFICATION_ELEMENT_vote);
    };
    
    async writtendebate2_add_generalcomment (event_id, general_comment_id, sender_id): Promise<any> {
        return this.article_action(event_id, general_comment_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_writtendebate2, NOTIFICATION_ELEMENT_generalcomment);
    }

    async audiotranscriptserver_add_generalcomment (event_id, general_comment_id, sender_id): Promise<any> {
        return this.article_action(event_id, general_comment_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog, NOTIFICATION_ELEMENT_generalcomment);
    }

    async audiotranscriptserver_2_add_generalcomment(event_id, general_comment_id, sender_id): Promise<any> {
        return this.article_action(event_id, general_comment_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog_2, NOTIFICATION_ELEMENT_generalcomment);
    };

    async writtendebate2_add_sentencecomment(event_id, sentence_id, sender_id): Promise<any>{
        return this.article_action(event_id, sentence_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_writtendebate2, NOTIFICATION_ELEMENT_sentencecomment);
    }

    async audiotranscriptserver_add_sentencecomment(event_id, sentence_id, sender_id): Promise<any>{
    
        return this.article_action(event_id, sentence_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog, NOTIFICATION_ELEMENT_sentencecomment);

    }

    async audiotranscriptserver_2_add_sentencecomment (event_id, sentence_id, sender_id): Promise<any> {
        return this.article_action(event_id, sentence_id, sender_id, NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog_2, NOTIFICATION_ELEMENT_sentencecomment);
    };

    private async article_action(event_id :string , notify_element_id: string , sender_id : string, destination_type : string, notify_element_type : string ): Promise<any>{

        console.log("article_action");

        const event_ref = "/event_related/event/" + event_id;
        const participants_tobe_notified = [];

        return firebase_admin.database().ref(event_ref).once("value")
        .then( (snapshot)=>{
            const event_data = snapshot.val() || {};
            for(const key in event_data.participants){
                if(event_data.participants[key] !== ParticipateCannotgo /* || event_data.participants[key] != "ParticipateInvited" */){
                    participants_tobe_notified.push(key);
                }
            }

            const promise_arr: Promise<any>[] = [];

            if(participants_tobe_notified.length === 0){
                console.log("add_notification finish because there is no participants in the event");
            }else if(participants_tobe_notified.length === 1 && participants_tobe_notified[0] === sender_id){
                console.log("add_notification finish because participants is only the sender");
            } else {
                const event_title = event_data.motion || event_data.title || "";
            // const event_type = event_data.type;

                participants_tobe_notified.forEach((receiver_id)=>{
                    if(sender_id !==receiver_id){
                        promise_arr.push(this.article_action_user(event_id, sender_id, receiver_id, event_title, destination_type, notify_element_type, notify_element_id ));
                    }
                })
            }
            return Promise.all(promise_arr)
        });
    };


    private async article_action_user(event_id, sender_id, receiver_id, event_title, destination_type, notify_element_type, notify_element_id): Promise<any>
    {
        console.log("article_action_user", receiver_id);
        const notification_ref = "users/notification/" + receiver_id;
        return firebase_admin.database().ref(notification_ref).once("value")
        .then( (snapshot)=>{
            const existing_notification_data_all = snapshot.val();
            let existing_notification_id_arr = [];
            let existing_notification_data : NotificationData_article = {
                        event_id: "",
                        sender_id: "",
                        event_title: "",
                        read: false,
                        destination: "",
                        comment_data: {}
                    };

            for(let key in existing_notification_data_all){
                if(existing_notification_data_all[key] && existing_notification_data_all[key].event_id === event_id && existing_notification_data_all[key].destination === destination_type){
                    existing_notification_id_arr.push(key);
                    existing_notification_data = existing_notification_data_all[key];
                }
            }

            const existing_comment_data : CommentData
                         = existing_notification_data.comment_data || 
                         {
                            general_comment:[],
                            sentence_comment:[],
                            argument:[],
                            opinion:[],
                            vote:[],
                            like:[],
                        };

                // each key should match NOTIFICATION_ELEMENT
            const new_comment_data : CommentData = {
                general_comment: existing_comment_data.general_comment || [],
                sentence_comment: existing_comment_data.sentence_comment || [],
                argument: existing_comment_data.argument || [],
                opinion:existing_comment_data.opinion || [],
                vote:existing_comment_data.vote || [],
                like:existing_comment_data.like || []
            }
            new_comment_data[notify_element_type].push(notify_element_id);

            let new_notification_data : NotificationData_article = {
                event_id: event_id,
                sender_id: sender_id,
                event_title: event_title,
                read: false,
                destination:destination_type,
                comment_data: new_comment_data
            }
            console.log("existing_notification_id_arr", existing_notification_id_arr);
            console.log("new_notification_data",new_notification_data);

            const promise_arr: Promise<any>[] = []
            promise_arr.push(this.add_notification_data_userfield(receiver_id, new_notification_data));

            if(existing_notification_id_arr.length>0){
                existing_notification_id_arr.forEach((existing_notification_id)=>{
                    promise_arr.push(this.remove_notification_data_userfield(receiver_id, existing_notification_id));
                })
            }
            return Promise.all(promise_arr);
        });
    }





    private async add_notification_data_userfield(receiver_id : string, new_notification_data : NotificatoinData_event_article): Promise<any>{

        console.log("add_notification_data_userfield", receiver_id);

        const current_time = Date.now();
        const user_notification_ref = firebase_admin.database().ref("/users/notification/" + receiver_id + "/" + current_time);
        return user_notification_ref.update(new_notification_data).then(()=>{
            console.log("finish adding data")
        }).catch((err)=>{
            console.log("error ", err);
        });

    }


    private async remove_notification_data_userfield(receiver_id, existing_notification_id): Promise<any>{

        console.log("remove_notification_data_userfield", receiver_id);

        const user_notification_ref = firebase_admin.database().ref("/users/notification/" + receiver_id + "/" + existing_notification_id);
        return user_notification_ref.remove().then(()=>{
            console.log("finish removing data")
        }).catch((err)=>{
            console.log("error ", err);
        });

    }



    event_participate(event_id ){

        console.log("event_participate in notificatoin module");
        const event_ref = "/event_related/event/" + event_id;
        const participants_tobe_notified = [];
        const participants_going = [];
        const participants_maybe = [];
        const participants_invited = [];
        const participants_proposition = [];
        const participants_opposition = [];


        return firebase_admin.database().ref(event_ref).once("value")
        .then( (snapshot)=>{
            const event_data = snapshot.val() || {};
            const event_creator_id = event_data.created_by;
            // current event participants data is set to array
            for(const key in event_data.participants){
                if(event_data.participants[key] === ParticipateGoing ){
                    participants_going.push(key);
                }
                if(event_data.participants[key] === ParticipateMaybe ){
                    participants_maybe.push(key);
                }
                if(event_data.participants[key] === ParticipateInvited ){
                    participants_invited.push(key);
                }
                if(event_data.participants[key] === ParticipateProposition ){
                    participants_proposition.push(key);
                }
                if(event_data.participants[key] === ParticipateOpposition ){
                    participants_opposition.push(key);
                }
            }
            const participant_info : ParticipatInfo = {
                going:participants_going,
                maybe:participants_maybe,
                invited:participants_invited,
                proposition:participants_proposition,
                opposition:participants_opposition
            }

            const event_title = event_data.motion || event_data.title || "";
            const event_date_time_start = event_data.date_time_start;
            const event_notification_data : NotificatoinData_event= {
                event_id: event_id,
                sender_id: event_creator_id,
                event_title: event_title,
                read: false,
                destination:NOTIFICATION_DESTINATION_EVENT,
                participant_info: participant_info,
                date_time_start: event_date_time_start,
                receiver_participate_status:null
            }
            const event_notify_data_going : NotificatoinData_event = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateGoing} )
            const event_notify_data_mayge : NotificatoinData_event = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateMaybe} )
            const event_notify_data_invited : NotificatoinData_event = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateInvited} )
            const event_notify_data_propositino : NotificatoinData_event = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateProposition} )
            const event_notify_data_opposition : NotificatoinData_event = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateOpposition} )

            const promise_arr: Promise<any>[] = []

            participants_going.forEach((receiver_id)=>{
                promise_arr.push(this.event_participate_user(event_id,  receiver_id, event_notify_data_going));
            })
            participants_maybe.forEach((receiver_id)=>{
                promise_arr.push(this.event_participate_user(event_id,  receiver_id, event_notify_data_mayge));
            })
            participants_invited.forEach((receiver_id)=>{
                promise_arr.push(this.event_participate_user(event_id,  receiver_id, event_notify_data_invited));
            })
            participants_proposition.forEach((receiver_id)=>{
                promise_arr.push(this.event_participate_user(event_id,  receiver_id, event_notify_data_propositino));
            })
            participants_opposition.forEach((receiver_id)=>{
                promise_arr.push(this.event_participate_user(event_id,  receiver_id, event_notify_data_opposition));
            })
            return Promise.all(promise_arr);
        });

    }


    private async event_participate_user(event_id,  receiver_id, event_notify_data: NotificatoinData_event ){


        console.log("event_registered");

        const event_ref = "/event_related/event/" + event_id;
        const receiver_notification_ref = "users/notification/" + receiver_id;


        return firebase_admin.database().ref(receiver_notification_ref).once("value")
        .then((snapshot)=>{
            const receiver_notification = snapshot.val();

            const promise_arr: Promise<any>[] = [];

            for(let key in receiver_notification){
                if(receiver_notification[key].event_id === event_id && receiver_notification[key].destination === NOTIFICATION_DESTINATION_EVENT){
                    promise_arr.push(this.remove_notification_data_userfield(receiver_id, key));
                }
            }
            promise_arr.push(this.add_notification_data_userfield(receiver_id, event_notify_data));
            return Promise.all(promise_arr);

        });

    }

    notification_read = (event_id, user_id, notification_destination ) => {
        console.log("notification_read");

        const usernotification_ref = "/users/notification/" + user_id;
        return firebase_admin.database().ref(usernotification_ref).once("value")
        .then( (snapshots)=>{
            const notification_arr = [];
            snapshots.forEach((child_snapshot)=>{
                const notification_data = child_snapshot.val();
                if(notification_data.event_id === event_id && notification_data.destination === notification_destination){
                    notification_arr.push(Object.assign({},child_snapshot.val(), {key:child_snapshot.key}))
                }else{
                    return false;
                }
            })

            console.log("notification_arr, ", notification_arr);
            return this.read_notifications(notification_arr, user_id);
        });
    }


    private async read_notifications(notification_arr, user_id){


        const promise_arr: Promise<any>[] = []
        if(notification_arr.length === 1){
            promise_arr.push(this.read_notification(notification_arr[0].key, user_id));
            return;
        }else if(notification_arr.length > 1){

            this.read_notification(notification_arr[0].key, user_id);
            for(let i=1; i< notification_arr.length; i++){
                promise_arr.push(this.remove_notification_data_userfield(user_id, notification_arr[i].key ));
            }
        }
        return Promise.all(promise_arr);
    }


    private async read_notification(notification_key, user_id){

        const usernotification_ref = "/users/notification/" + user_id + "/" + notification_key + "/read";
        console.log("usernotification_ref for read ", usernotification_ref);
        return firebase_admin.database().ref(usernotification_ref).set(true)
        .then( ()=>{
            console.log("succeed to set as read");
        }).catch(()=>{
            console.log("failed");
        })
    }



}



//  module.exports = Notification;
