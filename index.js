

const express = require('express');
const http = require('http');


const firebase_admin = require("firebase-admin");


/*

// commercial site datas
firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert("secret/mixidea-91a20-firebase-adminsdk.json"),
  databaseURL: "https://mixidea-91a20.firebaseio.com"
});
*/


var serviceAccount = require("./secret/mixidea-test-a2f1f-firebase-adminsdk-3os68-99265568e8.json");
firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert(serviceAccount),
  databaseURL: "https://mixidea-test-a2f1f.firebaseio.com"
});



const serverPort = 3000;
//const serverPort = 80;
const serverHost = "127.0.0.1";

const app = express();
const httpServer = http.createServer(app);
const server = httpServer.listen(serverPort,  serverHost, ()=> {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});


app.get('/', (req, res)=> {
  console.log('root is called'); 
  res.send('Hello World recording server!');
});

app.get('/retrieve_future_event', (req, res)=> {
  retrieve_future_event();
  res.send('retrieve_future_event');
});




 const NOTIFICATION_MESSAGE_TYPE_messagelist = "NOTIFICATION_MESSAGE_TYPE_messagelist";
 const NOTIFICATION_MESSAGE_TYPE_notificationlist = "NOTIFICATION_MESSAGE_TYPE_notificationlist";
 const NOTIFICATION_MESSAGE_TYPE_message = "NOTIFICATION_MESSAGE_TYPE_message";



 const NOTIFICATION_SRCTYPE_ARTICLE_writtendebate2 = "NOTIFICATION_SRCTYPE_ARTICLE_writtendebate2";
 const NOTIFICATION_SRCTYPE_ARTICLE_audiotranscriptserverrecog = "NOTIFICATION_SRCTYPE_ARTICLE_audiotranscriptserverrecog";
 const NOTIFICATION_SRCTYPE_EVENT = "NOTIFICATION_SRCTYPE_EVENT";
 const NOTIFICATION_NOTIFTYPE_generalcomment = "NOTIFICATION_NOTIFTYPE_generalcomment";
 const NOTIFICATION_NOTIFTYPE_sentencecomment = "NOTIFICATION_NOTIFTYPE_sentencecomment";
 const NOTIFICATION_NOTIFTYPE_like = "NOTIFICATION_NOTIFTYPE_like";

 const NOTIFICATION_NOTIFTYPE_addargument = "NOTIFICATION_NOTIFTYPE_addargument";
 const NOTIFICATION_NOTIFTYPE_addopinion = "NOTIFICATION_NOTIFTYPE_addopinion";
 const NOTIFICATION_NOTIFTYPE_eventinvite = "NOTIFICATION_NOTIFTYPE_eventinvite";
 const NOTIFICATION_NOTIFTYPE_eventmaybe = "NOTIFICATION_NOTIFTYPE_eventmaybe";
 const NOTIFICATION_NOTIFTYPE_eventgoing = "NOTIFICATION_NOTIFTYPE_eventgoing";

 const NOTIFICATION_MESSAGETYPE_event = "NOTIFICATION_MESSAGETYPE_event";
 const NOTIFICATION_MESSAGETYPE_interpersonal = "NOTIFICATION_MESSAGETYPE_interpersonal";


app.get('/add_notification', (req, res)=> {

  var notification_content = {
      user_id:"BPDem9DVQkdP1cuoV9d9IMzQfHy1",
      event_id: "aaa",
      src_type: NOTIFICATION_SRCTYPE_ARTICLE_writtendebate2,
      notif_type: NOTIFICATION_NOTIFTYPE_addargument,
      title:"thw ban tobacco"
  }
  var current_time = Date.now();
  var user_notify_ref = firebase_admin.database().ref("/users/notification/" + "KmrhWB4uRSR6FkqTpLPFFkIGZr92" + "/" + current_time);
  user_notify_ref.update(notification_content).then(()=>{

    res.send('add_notification');
  }).catch(()=>{

    res.send('add_notification');
  });


});


app.get('/add_message', (req, res)=> {

  var message_content = {
      user_id:"BPDem9DVQkdP1cuoV9d9IMzQfHy1",
      event_id: "aaa",
      type:NOTIFICATION_MESSAGETYPE_event,
      title:"aaaaaaaaaaaaaaaaaaaa"
  }
  var current_time = Date.now();
  var user_message_ref = firebase_admin.database().ref("/users/message/" + "KmrhWB4uRSR6FkqTpLPFFkIGZr92" + "/" + current_time);
  user_message_ref.update(message_content).then(()=>{

    res.send('add_message');
  }).catch(()=>{

    res.send('add_message');
  });
});


app.get('/add_eventchat', (req, res)=> {
    const event_id = "-KkP5PnOtWRzbys3hu4g";
    sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";

    eventchat_added(event_id, sender_id);

    res.send('add_message2');
});

function eventchat_added(event_id, sender_id){

    const event_ref = "/event_related/event/" + event_id;
    let event_data = {};
    let participants_tobe_notified = [];



    firebase_admin.database().ref(event_ref).once("value")
    .then( (snapshot)=>{
        event_data = snapshot.val() || {};
        for(var key in event_data.participants){
            if(event_data.participants[key] != "ParticipateCannotgo" /* || event_data.participants[key] != "ParticipateInvited" */){
                participants_tobe_notified.push(key);
            }
        }
        if(participants_tobe_notified.length === 0){
            returen;
        }
        if(participants_tobe_notified.length === 1 && participants_tobe_notified[0] === sender_id){
            returen;
        }
        const event_title = event_data.motion || event_data.title || "";

        participants_tobe_notified.forEach((receiver_id)=>{
            add_message_notification(event_id, sender_id, receiver_id, event_title, participants_tobe_notified)

        })
    });
}


function add_message_notification(event_id, sender_id, reciver_id, event_title, participants_tobe_notified){

    const message_ref = "users/message/" + reciver_id;
    firebase_admin.database().ref(message_ref).once("value")
    .then( (snapshot)=>{
        const message_data = snapshot.val();
        let existing_message_id = null;
        let existing_message_data = null;
        let original_sender_id = null;

        for(let key in message_data){
            if(message_data[key] && message_data[key].event_id === event_id){
                existing_message_id = key;
                existing_message_data = message_data[key];
                original_sender_id = message_data[key].sender_id;
            }
        }

        if( reciver_id === sender_id && (reciver_id === original_sender_id || !original_sender_id )){
            
            let notified_user = null
            participants_tobe_notified.forEach((user_id)=>{
                if(user_id !== reciver_id){
                    notified_user = user_id;
                }
            })
            const message_data = {
                event_id: event_id,
                sender_id: notified_user,
                title: event_title,
                read: true,
                only_notify: true
            }
            add_message_notification_user(reciver_id, message_data);

        }else{

            const notified_user_id = sender_id || original_sender_id;

            if(sender_id === reciver_id){
                const message_data = {
                    event_id: event_id,
                    sender_id: notified_user_id,
                    title: event_title,
                    read: true,
                    counter: 0
                }
                add_message_notification_user(reciver_id, message_data);
            }else{

                if(existing_message_data && existing_message_data.read === false){
                    const  current_counter =  Number(existing_message_data.counter) || 0;
                    const message_data = {
                        event_id: event_id,
                        sender_id: notified_user_id,
                        title: event_title,
                        read: false,
                        counter: current_counter + 1
                    }
                    add_message_notification_user(reciver_id, message_data);
                }else{
                    const message_data = {
                        event_id: event_id,
                        sender_id: notified_user_id,
                        title: event_title,
                        read: false
                    }
                    add_message_notification_user(reciver_id, message_data);
                }
            }
        }

        if(original_sender_id){
            delete_message_notification(reciver_id, existing_message_id);
        }
    });
}


function delete_message_notification(reciver_id, existing_message_id){

  var user_message_ref = firebase_admin.database().ref("/users/message/" + reciver_id + "/" + existing_message_id);
  user_message_ref.remove().then(()=>{
    console.log("remove message succeed");
  }).catch((err)=>{
    console.log("error ", err);
  });

}



function add_message_notification_user(reciver_id, message_data){

  var current_time = Date.now();
  var user_message_ref = firebase_admin.database().ref("/users/message/" + reciver_id + "/" + current_time);
  user_message_ref.update(message_data).then(()=>{
    console.log("finish adding data")
  }).catch((err)=>{
    console.log("error ", err);
  });

}




app.get('/eventchat_read', (req, res)=> {
    const event_id = "-Kid148AQD3DC5ftdsuX";
    user_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    console.log("eventchat_read", event_id)
    console.log("eventchat_read", user_id)

    eventchat_read(event_id, user_id);

    res.send('add_message2');
});

function eventchat_read(event_id, user_id){
    console.log("eventchat_read", event_id);
    console.log("eventchat_read", user_id);


    const usermessage_ref = "/users/message/" + user_id;
    firebase_admin.database().ref(usermessage_ref).once("value")
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
        read_messages(message_arr, user_id);
    });
}


function read_messages(message_arr, user_id){

    if(message_arr.length === 0){
        return;
    }
    if(message_arr.length === 1){
        read_message(message_arr[0].key, user_id);
        return;
    }

    if(message_arr.length > 1){

        read_message(message_arr[0].key, user_id);
        for(var i=1; i< message_arr.length; i++){
            delete_message(message_arr[i].key, user_id);
        }
    }
}

function read_message(message_key, user_id){

    const usermessage_ref = "/users/message/" + user_id + "/" + message_key + "/read";
    firebase_admin.database().ref(usermessage_ref).set(true)
    .then( ()=>{
        console.log("succeed to set as read");
    }).catch(()=>{
        console.log("failed");
    })
}

function delete_message(message_key, user_id){

    const usermessage_ref = "/users/message/" + user_id + "/" + message_key;
    firebase_admin.database().ref(usermessage_ref).remove()
    .then( ()=>{
        console.log("succeed to set delete");
    }).catch(()=>{
        console.log("failed to delete");
    })

}




app.get('/calendar', (req, res)=> {


    const event_id = "-KiVNmX97hxjAp3_dYVn";
    const participant_arr = [];
    const participant_gmail_arr = []
    let event_data = null;

    const event_ref = "/event_related/event/" + event_id;
    const google_profile_ref = "/users/google_profile";
    const calendar_ref = "/event_related/calendar/" + event_id;
    firebase_admin.database().ref(event_ref).once("value")
    .then( (snapshot)=>{
        event_data = snapshot.val();
        console.log(event_data);

        const participant_obj = event_data.participants || {};

        for(let key in participant_obj){
            if(participant_obj[key]==='ParticipateGoing' || participant_obj[key]==='ParticipateMaybe'){
                participant_arr.push(key);
            }
        }
        console.log(participant_arr);

        return firebase_admin.database().ref(google_profile_ref).once("value");

    }).then((snapshot)=>{
        const google_profile = snapshot.val() || {};

        participant_arr.forEach((element)=>{
            if(element && google_profile && google_profile[element] && google_profile[element].email){
                participant_gmail_arr.push(google_profile[element].email);
            }
        })
        console.log(participant_gmail_arr);

        return firebase_admin.database().ref(calendar_ref).once("value");
       // res.send(participant_gmail_arr);
    }).then((snapshot)=>{
        const previous_calendar_id = snapshot.val();
        console.log(previous_calendar_id)

        create_event(event_data, participant_gmail_arr);


    }).catch((err)=>{
        console.log("error", err);
        res.send("error");
    })
});

function retrieve_future_event(){
    const user_id = "By9wCZOaxNdgyE6dNzPS0qoJ7zB2"
    const current_time = Date.now();
    console.log("current_time", current_time);
    const retrieve_start_time = current_time - 3*24*60*60*1000;

    const my_event_ref = firebase_admin.database().ref("users/my_event/" + user_id);
    my_event_ref.orderByChild("date_time_start").startAt(retrieve_start_time).on("child_added",
        (snapshot)=>{
            console.log("my event value", snapshot.val());
            console.log("my event key", snapshot.key);
            const event_type = snapshot.val().type;
            if(event_type == 'ParticipateGoing' || event_type == 'ParticipateMaybe'){
                console.log("going or maybe event", snapshot.key);
            }
        }
    )
}


function delete_calendar(calendar_id){

}



function create_event(event_data, participant_gmail_arr){

    const attendees = [];

    participant_gmail_arr.forEach((element)=>{
        attendees.push({email: element});
    })
    const date_time_start = new Date( event_data.date_time_start);
    console.log("date_time_start toDateString", date_time_start.toDateString());
    console.log("date_time_start toISOString", date_time_start.toISOString());
    console.log("date_time_start toLocaleDateString", date_time_start.toLocaleDateString());
//    console.log("date_time_start toLocaleFormat", date_time_start.toLocaleFormat());
//    console.log("date_time_start toLocaleString", date_time_start.toLocaleString());
//    console.log("date_time_start toLocaleTimeString", date_time_start.toLocaleTimeString());
    console.log("date_time_start toString", date_time_start.toString());
    console.log("date_time_start toTimeString", date_time_start.toTimeString());
    console.log("date_time_start toDateStoUTCString", date_time_start.toUTCString());
    console.log("date_time_start valueOf", date_time_start.valueOf());


    const date_time_finish = new Date( event_data.date_time_finish);

    const date_time_start_iso = date_time_start.toISOString();
    const date_time_finish_iso = date_time_finish.toISOString();


    var event = {
        'summary': 'Google I/O 2015',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
            'dateTime': date_time_start_iso
        },
        'end': {
            'dateTime': date_time_finish_iso,
        },
        'attendees': attendees,
        'reminders': {
            'useDefault': false,
            'overrides': [
            {'method': 'email', 'minutes': 10 * 60},
            {'method': 'popup', 'minutes': 10},
            ],
        }
    };


}



