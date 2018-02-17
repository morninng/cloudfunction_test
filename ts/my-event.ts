
const firebase_admin = require('firebase-admin');

import {TEAM_PROPOSITION, TEAM_OPPOSITION, ParticipateCannotgo, ParticipateGoing,
ParticipateMaybe,ParticipateInvited, ParticipateProposition, ParticipateOpposition } from './interface/participate'


interface  UserEventData  {
    type:string;
    date_time_start: number;
}

export class MyEvent{

    // constructor(){}


    async add_event(event_id, user_id, participate_value, is_event_exist): Promise<any> {

        console.log("my_event add_event is called");
        const user_event_ref = "/users/my_event/" + user_id + "/" + event_id;
        console.log("user participate event with userid :" + user_id  + " event id :" +  event_id + " participate_value :" + participate_value);

        let start_time = null;
        let user_event_data :UserEventData = null;

        if(!is_event_exist){

            console.log("no data for user participant");
            return firebase_admin.database().ref(user_event_ref)
            .remove()
            .then((snapshot) => {
                console.log("data is removed ");
                return;
            }).catch(()=>{
                console.log("removing data fail ");
                return;
            });

        }else{

            // read the event start time
            const event_starttime_ref = "/event_related/event/" + event_id + "/date_time_start";
            console.log("event_starttime_ref", event_starttime_ref);

            return firebase_admin.database().ref(event_starttime_ref).once("value", (snapshot)=>{
                start_time = snapshot.val();
                console.log("event start time", start_time);
                if(participate_value && start_time){
                    user_event_data = {
                        type:participate_value,
                        date_time_start: start_time
                    }
                }
                console.log("user_event_ref", user_event_ref)
                console.log("user_event_data", user_event_data);
                //set the event data for user notification 
                return firebase_admin.database().ref(user_event_ref).set(user_event_data)
            }).then(()=>{


                if(participate_value !== ParticipateInvited){
                    // return Promise.reject("cloud messaging won't be sent other than invited");
                    throw new Error("cloud messaging won't be sent other than invited");
                }

                // retrieve user service worker token
                const user_cloudmessaging_token_ref = "/users/serviceworker_token/" + user_id;
                console.log("user_cloudmessaging_token_ref", user_cloudmessaging_token_ref)
                return firebase_admin.database().ref(user_cloudmessaging_token_ref).once('value');
            }).then((snapshot)=>{
                let user_token_arr = [];
                const token_data = snapshot.val();
                for(let key in token_data){
                    user_token_arr.push(token_data[key]);
                }
                console.log("user_token_arr", user_token_arr);
                if(user_token_arr.length === 0){
                    console.log("no token found for this user");
                    return;
                }
                // send cloud messaging

                const payload = {
                    data : {
                    type: "event_invitation",
                    title : "Invitation of debate event",
                    start_time: String(start_time),
                    click_url: "https://mixidea.org/event/eventcontext/" + event_id
                    }
                };
                console.log("payload",payload);

                let timeToLive = (start_time - Date.now()) / 1000;
                timeToLive = Math.floor(timeToLive);
                if(timeToLive < 0){
                    timeToLive = 1
                }
                if(timeToLive > 2419200){
                    timeToLive = 2419100
                }
                const options = {
                    priority:"high",
                    timeToLive,
                    collapseKey:"abcde"
                }
                console.log("options", options)
                return firebase_admin.messaging().sendToDevice(user_token_arr, payload, options);
            }).then(()=>{
                console.log("user invitation or cloud messaging succeed");
            }).catch((err)=>{
                console.log("user invitation or cloud messaging failed", err);
            })
        }
    }


    update_event = ()=>{

    }



}


//  module.exports = MyEvent;
