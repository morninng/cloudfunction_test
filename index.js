

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

var bodyParser = require('body-parser');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



app.get('/', (req, res)=> {
  console.log('root is called'); 
  res.send('Hello World firebase ');
});


/*********cloud function same code from here*************/ 


const Calendar = require('./js/calendar.js');
const calendar = new Calendar();
const MyEvent = require('./js/my-event.js');
const my_event = new MyEvent();
const FacebookGraph = require('./js/fb_graph.js');
const fb_graph = new FacebookGraph();
const Message = require('./js/message.js');
const message = new Message();
const Notification = require('./js/notification.js');
const notification = new Notification();

const Group = require('./js/group.js');
const group = new Group();


const Ogp = require('./js/ogp.js');
const ogp = new Ogp();
const OgpGenerate = require('./js/ogp-generate.js');
const ogp_generate = new OgpGenerate();

const Article = require('./js/article.js');
const article = new Article();



app.get('/event/eventcontext/-Ko_W2olTlOq_cKf7DkS', (req, res)=>{
    console.log("test is called", req.originalUrl);
    const origin_url = req.originalUrl;
    

    const full_url = 'https://' + req.headers.host + req.url;


    ogp_generate.get_ogp(full_url, req.url).then((ogp_data)=>{

        console.log(ogp_data);
    }).catch((err)=>{
        console.log(err);
    })

})




app.get('/get_auth_url', (request, response)=> {
  calendar.get_auth_url(request, response);
});



app.get('/store_token', (request, response)=> {
  calendar.store_token(request, response);
});


app.get('/listEvents', (request, response)=> {
  calendar.listEvents(request, response);
});

app.get('/eventchatmain_read', (request, response)=> {

    const event_id = "-Kid148AQD3DC5ftdsuX";
    user_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    console.log("eventchat_read", event_id);
    console.log("eventchat_read", user_id);

    message.eventchat_read(event_id, user_id);

});



app.use(bodyParser.json());
app.post('/ogp_writtendebate_url', (request, response)=> {
    console.log("ogp_writtendebate_url post");
    console.log(request.body);
    const ogp_obj = request.body;
    const url_arr = ogp_obj.url_arr;
    const opinion_item_path = ogp_obj.opinion_item_path;

    ogp.set_writtendebate_opinion_ogp(opinion_item_path, url_arr);
    response.send("url sent");

});


app.get('/set_chat_message', (request, response)=> {

    const message = "https://www.yahoo.co.jp/";
    const message_path = "dddddddddddd";
    const current_full_path = "llllll";
    const chat_data = {user_id:"ssss", message: "llll"}

    ogp.set_chat_message(message, message_path, current_full_path, chat_data);
    response.send("message passed");

});



 const NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_clientrecog = "NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_clientrecog";
 const NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog = "NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog";
 const NOTIFICATION_DESTINATION_ARTICLE_writtendebate2 = "NOTIFICATION_DESTINATION_ARTICLE_writtendebate2";
 const NOTIFICATION_DESTINATION_EVENT = "NOTIFICATION_DESTINATION_EVENT";



app.get('/notification_read', (request, response)=> {

    const event_id = "-Kid148AQD3DC5ftdsuX";
    const user_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const notification_destination = NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog;
    console.log("notification_read " + event_id + "- - " + user_id + "- -" + notification_destination);

    notification.notification_read(event_id, user_id, notification_destination);

});



app.get('/google_profile_monitor', (request, response)=> {

    const user_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    calendar.update_calendar_for_user(user_id);

});



app.get('/event_monitor', (request, response)=> {

    const event_id = "-Kid148AQD3DC5ftdsuX";
    calendar.update_calendar_for_eventupdate(event_id);

});

app.get('/event_monitor_group_copy', (request, response)=> {

    const event_id = "-Kid148AQD3DC5ftdsuX";
    const group_id = "aaa"
    const event_data = {bb:"bb"};
    group.set_groupevent(event_id, group_id, event_data);

});

app.get('/group_member_monitor', (request, response)=> {

    const group_id = "-KoTANyTXhDqffs3_gnl"
    const groupmember_obj = {
        user_aaa:{role:"administrator", join_time:"XXXX", added_by:"sss"},
        user_bbb:{role:"administrator", join_time:"YYYY", added_by:"ttt"}
    };
    
    group.set_group_member( group_id, groupmember_obj);

});


app.get('/set_audiotranscript_to_participant', (request, response)=> {

    const event_id = "-Kl2lXCnBqXP1QnTe0zC"
    article.set_audiotranscript_to_participant( event_id);

});

app.get('/set_writtendebate2_to_participant', (request, response)=> {

    const event_id = "-Kjry3ylbB2kKQLmPMO0"

    
    article.set_writtendebate2_to_participant( event_id );

});


app.get('/audiotranscript_to_sender', (request, response)=> {

    const event_id = "-Kl2lXCnBqXP1QnTe0zC"
    const sender_id = "QWgHYtTwvyNpwEsXjqswL0ZbPFO2"

    article.set_audiotranscript_to_sender( event_id, sender_id );

});


app.get('/writtendebate2_to_sender', (request, response)=> {

    const event_id = "-Kjry3ylbB2kKQLmPMO0"
    const sender_id = "QWgHYtTwvyNpwEsXjqswL0ZbPFO2"

    article.set_writtendebate2_to_sender( event_id, sender_id );

});




const TEAM_PROPOSITION = "proposition";
const TEAM_OPPOSITION = "opposition";
const ParticipateCannotgo = "ParticipateCannotgo";
const ParticipateGoing = "ParticipateGoing";
const ParticipateMaybe = "ParticipateMaybe";
const ParticipateInvited = "ParticipateInvited";
const ParticipateProposition = TEAM_PROPOSITION;
const ParticipateOpposition = TEAM_OPPOSITION;




app.get('/eventparticipate_monitor', (request, response)=> {

    const event_id = "-Kid148AQD3DC5ftdsuX";
    const user_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const participate_value = ParticipateGoing
    const is_event_exist = true;

    my_event.add_event(event_id, user_id, participate_value, is_event_exist);
    calendar.update_calendar_for_eventupdate(event_id);

    notification.event_participate(event_id);
});



app.get('/userregist_monitor', (req, res)=> {

    const user_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const token = "EAAHjdmjMJ6cBAOlQyU8J2PvFhpqunNVZBceJAFj2NZCQ1qoaqd6XFOwPw7ZCS1N6k4wrHrls4j8ZCyOE6HBFjtELZADHBsiLVsJXCsZCLwOfT17wmGBocVY8k4MKPO9MLnZBsVlZCGt99GR72OikPWL8mlwJl7tOhhMJUZCmZAIEJuywZDZD";
    fb_graph.retrieve_and_set_graph_profiledata(user_id, token)


});


app.get('/eventchatmain_monitor', (req, res)=> {

    const event_id = "-Kid148AQD3DC5ftdsuX";
    const sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    message.eventchat_added(event_id, sender_id);

});



app.get('/writtendebate2_opinion_monitor', (req, res)=> {

    const event_id = "-KjGgf5DFaROgdvM9Ebh";
    const sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const opinion_id = "-KjbCrDk1ufFY8GzJblH"

    notification.writtendebate2_add_opinion(event_id, opinion_id, sender_id);

});




app.get('/writtendebate2_votereason_monitor', (req, res)=> {

    const event_id = "-KjGgf5DFaROgdvM9Ebh";
    const sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const vote_id = "-KkyCKTI_9ki0mVPtWbb";

    notification.writtendebate2_add_vote(event_id, vote_id, sender_id);

});


app.get('/audiotranscriptserver_votereason_monitor', (req, res)=> {

    const event_id = "-KjGgf5DFaROgdvM9Ebh";
    const sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const vote_id = "-KkyCKTI_9ki0mVPtWbb";

    notification.audiotranscriptserver_add_vote(event_id, vote_id, sender_id);

});




app.get('/writtendebate2_general_comment_monitor', (req, res)=> {

    const event_id = "-Kjry3ylbB2kKQLmPMO0";
    const sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const general_comment_id = "-KlC0lWosR2Z7MBZRPPH";

    notification.writtendebate2_add_generalcomment(event_id, general_comment_id, sender_id);

});



app.get('/writtendebate2_sentence_comment_monitor', (req, res)=> {

    const event_id = "-KjGgf5DFaROgdvM9Ebh";
    const sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const sentence_id = "47e6360b-7993-10e0-8904-7ea21ec5856d";

    notification.writtendebate2_add_sentencecomment(event_id, sentence_id, sender_id);

});


app.get('/audiotranscriptserver_sentence_comment_monitor', (req, res)=> {

    const event_id = "-KjGgf5DFaROgdvM9Ebh";
    const sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const sentence_id = "47e6360b-7993-10e0-8904-7ea21ec5856d";

    notification.audiotranscriptserver_add_sentencecomment(event_id, sentence_id, sender_id);

});





/*


app.get('/retrieve_future_event', (req, res)=> {
  retrieve_future_event();
  res.send('retrieve_future_event');
});
*/




/*


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
*/

/*
app.get('/add_eventchat', (req, res)=> {
    const event_id = "-KkP5PnOtWRzbys3hu4g";
    sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";

    eventchat_added(event_id, sender_id);

    res.send('add_message2');
});

*/

/*

function eventchat_added(event_id, sender_id){

    const event_ref = "/event_related/event/" + event_id;
    let event_data = {};
    let participants_tobe_notified = [];



    firebase_admin.database().ref(event_ref).once("value")
    .then( (snapshot)=>{
        event_data = snapshot.val() || {};
        for(var key in event_data.participants){
            if(event_data.participants[key] != "ParticipateCannotgo" ){
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
*/

/*
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
*/


/*
function delete_message_notification(reciver_id, existing_message_id){

  var user_message_ref = firebase_admin.database().ref("/users/message/" + reciver_id + "/" + existing_message_id);
  user_message_ref.remove().then(()=>{
    console.log("remove message succeed");
  }).catch((err)=>{
    console.log("error ", err);
  });

}
*/


/*
function add_message_notification_user(reciver_id, message_data){

  var current_time = Date.now();
  var user_message_ref = firebase_admin.database().ref("/users/message/" + reciver_id + "/" + current_time);
  user_message_ref.update(message_data).then(()=>{
    console.log("finish adding data")
  }).catch((err)=>{
    console.log("error ", err);
  });

}
*/


/*

app.get('/eventchat_read', (req, res)=> {
    const event_id = "-Kid148AQD3DC5ftdsuX";
    user_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    console.log("eventchat_read", event_id)
    console.log("eventchat_read", user_id)

    eventchat_read(event_id, user_id);

    res.send('add_message2');
});
*/

/*

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

*/

/*

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

*/

/*

function read_message(message_key, user_id){

    const usermessage_ref = "/users/message/" + user_id + "/" + message_key + "/read";
    firebase_admin.database().ref(usermessage_ref).set(true)
    .then( ()=>{
        console.log("succeed to set as read");
    }).catch(()=>{
        console.log("failed");
    })
}

*/

/*
function delete_message(message_key, user_id){

    const usermessage_ref = "/users/message/" + user_id + "/" + message_key;
    firebase_admin.database().ref(usermessage_ref).remove()
    .then( ()=>{
        console.log("succeed to set delete");
    }).catch(()=>{
        console.log("failed to delete");
    })
}

*/

 const NOTIFICATION_MESSAGE_TYPE_messagelist = "NOTIFICATION_MESSAGE_TYPE_messagelist";
 const NOTIFICATION_MESSAGE_TYPE_notificationlist = "NOTIFICATION_MESSAGE_TYPE_notificationlist";
 const NOTIFICATION_MESSAGE_TYPE_message = "NOTIFICATION_MESSAGE_TYPE_message";




// the notification comment will be
/*
notification titleじたいは、motionのみでいい。
 3 arguments, 2 comments, 9 vote, 3 sentence comments　 are added
 という記載にする。
データ構造は次のような具合
 arguments: [id_1, id_2, , , ]
 opinions: [id_a, id_b]
 general_comments: [id_z, id_x]
 sentence_comment: 
 ここで、設定された、IDをqueryにparameterをつけることで記事に"New"というマークをつける。

 
 argument: [{id:aaa, title:"bbb"}, {id:bbb, title:"ccc"}] 




廃案↓
{general_comment: 1,
 sentence_comment: 2,
 motion: "thw ban tobacco",
 addargument: {arg_id: "1234", signpost:"justification", opinion_num: 2}のような、どのアクションがなされたのかがわかりやすくする。
 addopinion: {arg_id: aaa, title: "", num: 3}
 UIには、5つのargumentと2つのopinionが追加されました
 のようにかく
 どのsignpostにたいして、
ここでの利用方法だが、notificationだけではなく、opinion やargument に　NEWまーくうをつける

                general_comment:[],
                sentence_comment:[],
                argument:[],
                opinion:[],
                vote:[]
 */
// Elementが、ユーザのアクション　monitorするfirebaseのdataにより異なる。
 // comment type for article related notification
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

// when notification is clicked, go to event page
// Destinationが、クリックしたときに行く先。行く先が同じものは、notificationに二ついらないので、過去分はけす。
//  const NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_clientrecog = "NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_clientrecog";
//  const NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog = "NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog";
//  const NOTIFICATION_DESTINATION_ARTICLE_writtendebate2 = "NOTIFICATION_DESTINATION_ARTICLE_writtendebate2";
//  const NOTIFICATION_DESTINATION_EVENT = "NOTIFICATION_DESTINATION_EVENT";
//データ構造
// 一つの destinationにたいして、複数のelementが存在する。
// 過去に同じdestinationのあるものが設定されたばあい、それは削除するが、前のものにたいして、elementのIDを負荷していくことで、
// クライアントがわで何を表示するかを汎用的に変更できる。
// should not add 



/*
app.get('/generalcomment_add_araticleserverrecog', (req, res)=> {
    console.log("generalcomment_add");
    const event_id = "-Kid148AQD3DC5ftdsuX";
    const sender_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const notify_element_type = NOTIFICATION_ELEMENT_addargument
    const notify_element_id =  "-Kkaabbbbaag";
    const destination_type = NOTIFICATION_DESTINATION_ARTICLE_audiotranscript_serverrecog;

    add_notification(event_id, sender_id, destination_type, notify_element_type, notify_element_id );

    res.send('generalcomment_add');
});
*/
/*

function add_commentorinfo_before_notification(){
    // event情報取得：cannot goか、user情報がなかったとき、commentorという役割を設定する。

}
*/

/*

function add_notification(event_id, sender_id, destination_type, notify_element_type, notify_element_id ){

    console.log("add_notification");

    const event_ref = "/event_related/event/" + event_id;
    const participants_tobe_notified = [];

    firebase_admin.database().ref(event_ref).once("value")
    .then( (snapshot)=>{
        event_data = snapshot.val() || {};
        for(var key in event_data.participants){
            if(event_data.participants[key] != "ParticipateCannotgo" ){
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
       // const event_type = event_data.type;

        participants_tobe_notified.forEach((receiver_id)=>{
            add_notification_user(event_id, sender_id, receiver_id, event_title, destination_type, notify_element_type, notify_element_id )
        })
    });
};

*/


/* notificationはもっとシンプル。
 senderにはおくらず。receiverに」見せるのは全員、sender
 過去のがなかったr、しんきでつくる。
 　過去データがあったら、pushで追加

*/
/*

function add_notification_user(event_id, sender_id, receiver_id, event_title, destination_type, notify_element_type, notify_element_id)
{
    console.log("add_notification_user", receiver_id);

    const notification_ref = "users/notification/" + receiver_id;
    firebase_admin.database().ref(notification_ref).once("value")
    .then( (snapshot)=>{
        const existing_notification_data_all = snapshot.val();
        let existing_notification_id = null;
        let existing_notification_data = {};
        let existing_comment_data = {};

        for(let key in existing_notification_data_all){
            if(existing_notification_data_all[key] && existing_notification_data_all[key].event_id === event_id){
                existing_notification_id = key;
                existing_notification_data = existing_notification_data_all[key];
            }
        }

        existing_comment_data = existing_notification_data.comment_data || {};

            // each key should match NOTIFICATION_ELEMENT
        const comment_data = {
            general_comment: existing_comment_data.general_comment || [],
            sentence_comment: existing_comment_data.sentence_comment || [],
            argument: existing_comment_data.argument || [],
            opinion:existing_comment_data.opinion || [],
            vote:existing_comment_data.vote || [],
            like:existing_comment_data.like || [],
            eventinvite:existing_comment_data.eventinvite || [],
            eventmaybe: existing_comment_data.eventmaybe || [],
            eventgoing: existing_comment_data.eventgoing || [],
            eventcannotgo: existing_comment_data.eventcannotgo || []
        }
        comment_data[notify_element_type].push(notify_element_id);

        let new_notification_data = {
            event_id: event_id,
            sender_id: sender_id,
            event_title: event_title,
            read: false,
            destination:destination_type,
            comment_data: comment_data
        }
        console.log("existing_notification_id", existing_notification_id);
        console.log("new_notification_data",new_notification_data);
        add_notification_data_userfield(receiver_id, new_notification_data);

        if(existing_notification_id){
            remove_notification_data_userfield(receiver_id, existing_notification_id);
        }

    });

}

*/

/*

function add_notification_data_userfield(receiver_id, new_notification_data){

    console.log("add_notification_data_userfield", receiver_id);

  var current_time = Date.now();
  var user_notification_ref = firebase_admin.database().ref("/users/notification/" + receiver_id + "/" + current_time);
  user_notification_ref.update(new_notification_data).then(()=>{
    console.log("finish adding data")
  }).catch((err)=>{
    console.log("error ", err);
  });

}

*/

/*
function remove_notification_data_userfield(receiver_id, existing_notification_id){


    console.log("remove_notification_data_userfield", receiver_id);

  var user_notification_ref = firebase_admin.database().ref("/users/notification/" + receiver_id + "/" + existing_notification_id);
  user_notification_ref.remove().then(()=>{
    console.log("finish removing data")
  }).catch((err)=>{
    console.log("error ", err);
  });

}

*/

/*


app.get('/event_invited', (req, res)=> {
    console.log("generalcomment_add");
    const event_id = "-Kid148AQD3DC5ftdsuX";
    const user_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";

    event_invited(event_id, user_id );

    res.send('event_invited');
});


*/

/*

function event_invited(event_id , receiver_id){
    console.log("event_invited");

    const event_ref = "/event_related/event/" + event_id;
    const receiver_notification_ref = "users/notification/" + receiver_id;
    let event_creator_id = null;
    let event_title = null;

    firebase_admin.database().ref(event_ref).once("value")
    .then( (snapshot)=>{
        const event_data = snapshot.val() || {};

        event_creator_id = event_data.created_by;
        event_title = event_data.motion || event_data.title || "";

        if(receiver_id === event_creator_id){
            console.log("creator will not invite by yourself");
            return;
        }

        return firebase_admin.database().ref(receiver_notification_ref).once("value")
    }).then((snapshot)=>{
        const receiver_notification = snapshot.val();

        for(let key in receiver_notification){
            if(receiver_notification[key].event_id === event_id && receiver_notification[key].destination === NOTIFICATION_DESTINATION_EVENT){
                remove_notification_data_userfield(receiver_id, key)
            }
        }
        let new_notification_data = {
            event_id: event_id,
            sender_id: event_creator_id,
            event_title: event_title,
            event_participate_type: NOTIFICATION_ELEMENT_eventinvite,
            date_time_start: event_date_time_start,
            read: false,
            destination:NOTIFICATION_DESTINATION_EVENT,
        }
        add_notification_data_userfield(receiver_id, new_notification_data);

    });
}

*/

/*

app.get('/event_registered', (req, res)=> {
    console.log("event_registered");
    const event_id = "-Kl8BhLS9fI1-UheNI68";

    event_participate(event_id );

    res.send('event_invited');
});

*/


// const TEAM_PROPOSITION = "proposition";
// const TEAM_OPPOSITION = "opposition";
// const ParticipateCannotgo = "ParticipateCannotgo";
// const ParticipateGoing = "ParticipateGoing";
// const ParticipateMaybe = "ParticipateMaybe";
// const ParticipateInvited = "ParticipateInvited";
// const ParticipateProposition = TEAM_PROPOSITION;
// const ParticipateOpposition = TEAM_OPPOSITION;

/*

function event_participate(event_id ){

    console.log("event_participate in notificatoin module");
    const event_ref = "/event_related/event/" + event_id;
    const participants_tobe_notified = [];
    const participants_going = [];
    const participants_maybe = [];
    const participants_invited = [];
    const participants_proposition = [];
    const participants_opposition = [];


    firebase_admin.database().ref(event_ref).once("value")
    .then( (snapshot)=>{
        const event_data = snapshot.val() || {};
        event_creator_id = event_data.created_by;
        for(var key in event_data.participants){
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
        const participant_info = {
            going:participants_going,
            maybe:participants_maybe,
            invited:participants_invited,
            proposition:participants_proposition,
            opposition:participants_opposition
        }

        const event_title = event_data.motion || event_data.title || "";
        const event_date_time_start = event_data.date_time_start;
        const event_notification_data = {
            event_id: event_id,
            sender_id: event_creator_id,
            event_title: event_title,
            participant_info: participant_info,
            date_time_start: event_date_time_start,
            read: false,
            destination:NOTIFICATION_DESTINATION_EVENT
        }
        const event_notify_data_going = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateGoing} )
        const event_notify_data_mayge = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateMaybe} )
        const event_notify_data_invited = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateInvited} )
        const event_notify_data_propositino = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateProposition} )
        const event_notify_data_opposition = Object.assign({}, event_notification_data, {receiver_participate_status: ParticipateOpposition} )

        participants_going.forEach((receiver_id)=>{
            event_participate_user(event_id,  receiver_id, event_notify_data_going)
        })
        participants_maybe.forEach((receiver_id)=>{
            event_participate_user(event_id,  receiver_id, event_notify_data_mayge)
        })
        participants_invited.forEach((receiver_id)=>{
            event_participate_user(event_id,  receiver_id, event_notify_data_invited)
        })
        participants_proposition.forEach((receiver_id)=>{
            event_participate_user(event_id,  receiver_id, event_notify_data_propositino)
        })
        participants_opposition.forEach((receiver_id)=>{
            event_participate_user(event_id,  receiver_id, event_notify_data_opposition)
        })
    });

}

*/

/*

function event_participate_user(event_id,  receiver_id, event_notify_data ){


    console.log("event_registered");

    const event_ref = "/event_related/event/" + event_id;
    const receiver_notification_ref = "users/notification/" + receiver_id;


    firebase_admin.database().ref(receiver_notification_ref).once("value")
    .then((snapshot)=>{
        const receiver_notification = snapshot.val();

        for(let key in receiver_notification){
            if(receiver_notification[key].event_id === event_id && receiver_notification[key].destination === NOTIFICATION_DESTINATION_EVENT){
                remove_notification_data_userfield(receiver_id, key)
            }
        }
        add_notification_data_userfield(receiver_id, event_notify_data);

    });

}

*/

/*

app.get('/notification_read', (req, res)=> {
    console.log("event_read");
    const event_id = "-KjQvh1UqlD4kXefsGuz";
    const user_id = "KmrhWB4uRSR6FkqTpLPFFkIGZr92";
    const notification_destination = "NOTIFICATION_DESTINATION_EVENT";

    notification_read(event_id, user_id, notification_destination);
    res.send('event_invited');
});

*/

/*

function notification_read(event_id, user_id, notification_destination){

    const usernotification_ref = "/users/notification/" + user_id;
    firebase_admin.database().ref(usernotification_ref).once("value")
    .then( (snapshots)=>{
        const notification_arr = [];
        snapshots.forEach((child_snapshot)=>{
            notification_data = child_snapshot.val();
            if(notification_data.event_id === event_id && notification_data.destination === notification_destination){
                notification_arr.push(Object.assign({},child_snapshot.val(), {key:child_snapshot.key}))
            }else{
                return false;
            }
        })

        console.log("notification_arr, ", notification_arr);
        read_notifications(notification_arr, user_id);
    });
}


function read_notifications(notification_arr, user_id){

    if(notification_arr.length === 0){
        return;
    }
    if(notification_arr.length === 1){
        read_notification(notification_arr[0].key, user_id);
        return;
    }

    if(notification_arr.length > 1){

        read_notification(notification_arr[0].key, user_id);
        for(var i=1; i< notification_arr.length; i++){
            delete_notification(notification_arr[i].key, user_id);
        }
    }
}

function read_notification(notification_key, user_id){

    const usernotification_ref = "/users/notification/" + user_id + "/" + notification_key + "/read";
    console.log("usernotification_ref for read ", usernotification_ref);
    firebase_admin.database().ref(usernotification_ref).set(true)
    .then( ()=>{
        console.log("succeed to set as read");
    }).catch(()=>{
        console.log("failed");
    })
}

function delete_notification(notification_key, user_id){

    const usermessage_ref = "/users/notification/" + user_id + "/" + notification_key;
    console.log("usernotification_ref for delete ", usernotification_ref);
    firebase_admin.database().ref(usermessage_ref).remove()
    .then( ()=>{
        console.log("succeed to delete");
    }).catch(()=>{
        console.log("failed to delete");
    })

}

*/








/*

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

*/

