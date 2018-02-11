const functions = require('firebase-functions');
import * as firebase_admin from "firebase-admin";
const cors = require('cors')({origin: true});

firebase_admin.initializeApp(functions.config().firebase);



import { Calendar } from './calendar';
const calendar = new Calendar();

import { MyEvent } from './my-event';
const my_event = new MyEvent();

import { FacebookGraph } from './fb_graph';
const fb_graph = new FacebookGraph();

import { Message } from './message';
const message = new Message();

import { Notification } from './notification';
const notification = new Notification();

import { Group } from './group';
const group = new Group();

import { Article } from './article';
const article = new Article();

import { OGP } from './ogp';
const ogp = new OGP();

import { OgpGenerate } from './ogp-generate';
const ogp_generate = new OgpGenerate();

import { PictureResize } from './picture_resize';
const picture_resize = new PictureResize();

import { SpeechStatus } from './speech-status';
const speech_status = new SpeechStatus();


/****** hosting ******/ 


const express = require('express');
const ECT = require('ect');
// const compression = require('compression');
const ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });

const app = express();
//app.use(compression());
app.engine('ect', ectRenderer.render);
app.set('view engine', 'ect');



app.get('/**', (req, res)=>{
    const origin_url = req.originalUrl;
    if(!origin_url || origin_url === '/undefined'){
      console.log("origin_url does not exist !!!");
      res.render('index', {ogp_data:''});
      return;
    }

    const x_original_url = req.headers["x-original-url"];
    console.log("x_original_url", x_original_url)
    

    const x_forwarded_host = req.headers["x-forwarded-host"];
    console.log("x_forwarded_host", x_forwarded_host);

    const full_url = 'https://' + x_forwarded_host + x_original_url;


    ogp_generate.get_ogp(full_url, x_original_url).then((ogp_data)=>{

      res.render('index', {ogp_data: ogp_data});

    })
    return;
})


exports.app = functions.https.onRequest(app);




/***************-- http api ************************/

 exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
 })

exports.getAuthUrl = functions.https.onRequest((request, response) => {


  // return calendar.get_auth_url()
  // .then((data)=>{
  //   response.send(data);
  // }).catch((err)=>{
  //   response.error(err);
  // });


  try {
    const auth_data = calendar.get_auth_url()
    response.send(auth_data);
    return;
  }
  catch(err){
    response.error(err);
  }


});


exports.storeToken = functions.https.onRequest((request, response) => {

  calendar.store_token(request, response);
});

exports.listEvents = functions.https.onRequest((request, response) => {

  return calendar.listEvents()
  .then((data)=>{
    console.log("listEvents then")
    response.send(data);
  }).catch((err)=>{
    console.log("listEvents error", err);
    response.error(err);
  });

});

 exports.eventchatmainRead = functions.https.onRequest((request, response) => {

  const event_id = request.query.event_id;
  const user_id = request.query.user_id;
  console.log("eventchatmain_read " + event_id + "- - " + user_id);
  
  message.eventchat_read(event_id, user_id)

  cors(request, response, () => {
    response.send("Hello from Firebase!");
  });

 })


/******************* */

exports.testFbSignup = functions.https.onRequest((request, response) => {

  const userId = "111";
  const token = "EAAHjdmjMJ6cBADhei3oELroUHSSZCNDd7ZAtZB26etvofADM11wfwBiZCPzbbpPjN4KKHmZCPfPNur9yvIsZBTqfRPpdjZBb1LnKcCJ0SBqncPGyeWHAdC7wK10SLM37AB7Jk9eptnh6JXGZAXEtHvbIHZCY06yjbTs54pFd5aqe0JAZDZD";


  console.log('testFbSignup');
  return fb_graph.retrieve_and_set_graph_profiledata(userId, token)
    .then((data)=>{
      response.send(data);
    }).catch((err)=>{
      response.error(err);
    });

});



 /******************* */

 exports.notificationRead = functions.https.onRequest((request, response) => {

  const event_id = request.query.event_id;
  const user_id = request.query.user_id;
  const notification_destination = request.query.destination;
  console.log("notification_read " + event_id + "- - " + user_id + "- -" + notification_destination);

  notification.notification_read(event_id, user_id, notification_destination)

  cors(request, response, () => {    
    response.send("Hello from Firebase!");
  });

 })

 exports.dateRetrieve = functions.https.onRequest((request, response) => {

  const current_time = Date.now();

  cors(request, response, () => {
    response.send(String(current_time));
  });

 })


  exports.ogpWrittendebateUrl = functions.https.onRequest((request, response) => {

    cors(request, response, () => {

      console.log("ogp_writtendebate_url");
      const ogp_obj = request.body;
      console.log("request body", request.body);
      const url_arr = ogp_obj.url_arr;
      const opinion_item_path = ogp_obj.opinion_item_path;

      response.send("url sent");
      ogp.set_writtendebate_opinion_ogp(opinion_item_path, url_arr);
    });


 })


/*************   monitoring storage event ***************/





 exports.testThumbnail = functions.https.onRequest((request, response) => {

  const event_obj = {
    bucket: 'mixidea-test-a2f1f.appspot.com',
    name: 'group/-KoXL3VEaBumgmm4auiG/cover.jpg',
    contentType: 'image/jpeg',
    resourceState: 'exists',
    metageneration: 1
  }
   picture_resize.resize(event_obj);

  response.send("test_generateThumbnail");


 })

exports.generateThumbnail = functions.storage.object().onChange(event => {

  picture_resize.resize(event.data);

})

/*************   monitoring database event ***************/




exports.mainspeaker_monitor = functions.database.ref('/event_related/livevideo-debate-speechstatus/{event_id}/speech_status/main_speaker')
    .onWrite(event => {
      const event_id = event.params.event_id;
      const data = event.data.val()
      speech_status.mainspeaker_update(event_id, data);
    });

/*test */
//  exports.TestMainspeaker = functions.https.onRequest((request, response) => {

//   const event_id = '-KtfMBS6u-CMeR-LvBN1';
//   const data = {
//     role_name: 'NA_MG',
//     role_num: 3,
//     speech_start_time: 1505213204360,
//     team_name: 'gov',
//     team_side: 'LEFT',
//     user_id: 'KmrhWB4uRSR6FkqTpLPFFkIGZr92' 
//   }

//   speech_status.mainspeaker_update(event_id, data);
//   response.send("Hello");

//  })



exports.poicnadidate_monitor = functions.database.ref('/event_related/livevideo-debate/{event_id}/speech_status/poi_candidates')
    .onWrite(event => {
      const event_id = event.params.event_id;
      const data = event.data.val()
      speech_status.poicnadidate_update(event_id, data);
    });

/*test */
//  exports.TestPoicnadidate = functions.https.onRequest((request, response) => {
//       const event_id = '-KtfMBS6u-CMeR-LvBN1';
//       const data = { QWgHYtTwvyNpwEsXjqswL0ZbPFO2: true }
//       speech_status.poicnadidate_update(event_id, data);
//       response.send("Hello");
//  })


exports.poispeaker_monitor = functions.database.ref('/event_related/livevideo-debate/{event_id}/speech_status/poi_speaker')
    .onWrite(event => {
      const event_id = event.params.event_id;
      const data = event.data.val()
      speech_status.poispeaker_update(event_id, data);
    });

/*test */
//  exports.TestPoispeaker = functions.https.onRequest((request, response) => {
//       const event_id = '-KtfMBS6u-CMeR-LvBN1';
//       const data = { user_id: 'QWgHYtTwvyNpwEsXjqswL0ZbPFO2' };
//       speech_status.poispeaker_update(event_id, data);
//       response.send("Hello");
//  })

exports.joinroom_que_monitor = functions.database.ref('/event_related/join_room_que/{room_name}/{user_id}')
    .onWrite(event => {
      if(!event.data.exists()){
        return;
      }
      setTimeout(()=>{
        const room_que_ref = event.data.ref;
        room_que_ref.remove();
      },10);
      return;
    });


exports.google_profile_monitor = functions.database.ref('/users/google_profile/{user_id}')
  .onWrite((event)=>{
    console.log("google_profile_monitor");
    if(!event.data.exists()){
      return;
    }
    const user_id = event.params.user_id;

    const google_profile = event.data.val() || {};
    if(!google_profile.email){
      return;
    }

    calendar.update_calendar_for_user(user_id)

  });


exports.event_monitor = functions.database.ref('/event_related/event/{event_id}')
    .onWrite(event => {

      console.log("event_monitor", event.data.val());
      const event_data = event.data.val()
      const event_id = event.params.event_id;

      if(event_data){
        calendar.update_calendar_for_eventupdate(event_id);
        if(event_data.group_data && event_data.group_data.group_id){
          const group_id = event_data.group_data.group_id;
          console.log("group exist in event", group_id)
          group.set_groupevent(event_id, group_id, event_data);
        }
      }
    });

exports.group_member_monitor = functions.database.ref('/group/group_member/{group_id}')
    .onWrite(event => {

    const group_id = event.params.group_id;
    const groupmember_obj = event.data.val();
    
    group.set_group_member( group_id, groupmember_obj);


});




exports.eventparticipate_monitor = functions.database.ref('/event_related/event/{event_id}/participants/{user_id}')
    .onWrite(event => {
      console.log("eventparticipate_monitor is called");
      const is_event_exist = event.data.exists();
      const participate_value = event.data.val();
      const event_id = event.params.event_id;
      const user_id = event.params.user_id;
      my_event.add_event(event_id, user_id, participate_value, is_event_exist);
      calendar.update_calendar_for_eventupdate(event_id);

      notification.event_participate(event_id);


    });


exports.userregist_monitor = functions.database.ref('/users/fb_token/{user_id}')
    .onWrite(event => {
      console.log("userregist_monitor is called");
      const user_id = event.params.user_id;
      console.log(user_id);
      const user_data = event.data.val();
      console.log(user_data);
      if(user_data && user_data.token && user_id){
        console.log(user_data.token);
        return fb_graph.retrieve_and_set_graph_profiledata(user_id, user_data.token)
      }
      return;

    });

// https://developers.facebook.com/docs/facebook-login/permissions/


exports.eventchatmain_monitor = functions.database.ref('/event_related/event_chat/{event_id}/main/{chat_id}')
  .onWrite((event)=>{
    console.log("eventchatmain_monitor");
    const chat_data = event.data.val();
    const sender_id = chat_data.user_id;
    const event_id = event.params.event_id;
    console.log("sender_id", sender_id);
    console.log("event_id", event_id);
    message.eventchat_added(event_id, sender_id);

  })

exports.eventchat_all_monitor = functions.database.ref('/event_related/event_chat/{event_id}/{team_name}/{chat_id}')
  .onWrite((event)=>{

    console.log("eventchat_all_monitor");
    
    if (!event.data.exists()) {
      console.log("chat is removed");
      return;
    }

    const chat_data = event.data.val();

    const message_data = chat_data.message;
    const existing_ogp_data = chat_data.ogp;
    if(!message_data || existing_ogp_data){
      console.log("existing ogp exist or message does not exist and finish")
      return;
    }
    const event_id = event.params.event_id;
    const team_name = event.params.team_name;
    const chat_id = event.params.chat_id;
    const message_path = "/event_related/event_chat/" + event_id + "/" + team_name;
    const current_full_path = "/event_related/event_chat/" + event_id + "/" + team_name + "/" + chat_id;



    console.log("message_path", message_path);
    console.log("message", message_data);
    ogp.set_chat_message(message_data, message_path, current_full_path, chat_data);

  })




exports.writtendebate2_opinion_monitor = functions.database.ref('/event_related/written_debate2/{event_id}/arguments/{argument_id}/opinion/{opinion_id}')
  .onWrite((event)=>{
    console.log("writtendebate2_opinion_monitor");
    const opinion_data = event.data.val();
    const opinion_id = event.params.opinion_id
    const argument_id = event.params.argument_id;
    const event_id = event.params.event_id;
    const sender_id = opinion_data.author
    console.log("opinion_id", opinion_id);
    console.log("argument_id", argument_id);
    console.log("event_id", event_id);
    console.log("opinion_data", opinion_data);
    notification.writtendebate2_add_opinion(event_id, opinion_id, sender_id);

    article.set_writtendebate2_to_participant( event_id);

  })


exports.audiotranscriptserver_audio_monitor = functions.database.ref('/event_related/audio_transcriptserver/{event_id}/{deb_style}/{role}/{speech_id}/audio/')
    .onWrite(event => {

    const event_id = event.params.event_id;    
    return article.set_audiotranscript_to_participant( event_id);

});

exports.audiotranscriptserver_2_audio_monitor = functions.database.ref('/event_related/audio_transcriptserver_2/{event_id}/{deb_style}/{role}/{speech_id}/audio/')
    .onWrite(event => {

    const event_id = event.params.event_id;    
    return article.set_audiotranscript_2_to_participant( event_id);

});


exports.writtendebate2_votereason_monitor = functions.database.ref('/event_related/vote_reason_writtendebate2/{event_id}/content/{vote_id}/')
  .onWrite((event)=>{
    console.log("writtendebate2_votereason_monitor");
    const vote_data = event.data.val();
    const event_id = event.params.event_id;
    const vote_id = event.params.vote_id;
    const sender_id = vote_data.user
    console.log("event_id", event_id);
    console.log("vote_id", vote_id);
    console.log("vote_data", vote_data);
    notification.writtendebate2_add_vote(event_id, vote_id, sender_id);

    article.set_writtendebate2_to_sender( event_id, sender_id );
  })



exports.audiotranscriptserver_votereason_monitor = functions.database.ref('/event_related/vote_reason_audiotranscriptserver/{event_id}/content/{vote_id}/')
  .onWrite((event)=>{
    console.log("audiotranscriptserver_votereason_monitor");
    const vote_data = event.data.val();
    const event_id = event.params.event_id;
    const vote_id = event.params.vote_id;
    const sender_id = vote_data.user
    console.log("event_id", event_id);
    console.log("vote_id", vote_id);
    console.log("vote_data", vote_data);
    notification.audiotranscriptserver_add_vote(event_id, vote_id, sender_id);

    article.set_audiotranscript_to_sender( event_id, sender_id );
  })

exports.audiotranscriptserver_2_votereason_monitor = functions.database.ref('/event_related/vote_reason_audiotranscriptserver_2/{event_id}/content/{vote_id}/')
  .onWrite((event)=>{
    console.log("audiotranscriptserver_2_votereason_monitor");
    const vote_data = event.data.val();
    const event_id = event.params.event_id;
    const vote_id = event.params.vote_id;
    const sender_id = vote_data.user
    console.log("event_id", event_id);
    console.log("vote_id", vote_id);
    console.log("vote_data", vote_data);
    notification.audiotranscriptserver_2_add_vote(event_id, vote_id, sender_id);

    article.set_audiotranscript_2_to_sender( event_id, sender_id );
  })


exports.writtendebate2_general_comment_monitor = functions.database.ref('/event_related/general_commentt_writtendebate2/{event_id}/content/{comment_id}/')
  .onWrite((event)=>{
    console.log("writtendebate2_general_comment_monitor");
    const generalcomment_data = event.data.val();
    const event_id = event.params.event_id;
    const general_comment_id = event.params.comment_id;
    const sender_id = generalcomment_data.user_id;
    console.log("event_id", event_id);
    console.log("comment_id", general_comment_id);
    console.log("generalcomment_data", generalcomment_data);
    notification.writtendebate2_add_generalcomment(event_id, general_comment_id, sender_id);

    article.set_writtendebate2_to_sender( event_id, sender_id );
  })






exports.audiotranscriptserver_general_comment_monitor = functions.database.ref('/event_related/general_comment_audiotranscriptserver/{event_id}/content/{comment_id}/')
  .onWrite((event)=>{
    console.log("audiotranscriptserver_general_comment_monitor");
    const generalcomment_data = event.data.val(); 
    const event_id = event.params.event_id; 
    const general_comment_id = event.params.comment_id; 
    const sender_id = generalcomment_data.user_id; 
    console.log("event_id", event_id); 
    console.log("comment_id", general_comment_id); 
    console.log("generalcomment_data", generalcomment_data); 
    notification.audiotranscriptserver_add_generalcomment(event_id, general_comment_id, sender_id);

    article.set_audiotranscript_to_sender( event_id, sender_id );


  }) //

exports.audiotranscriptserver_2_general_comment_monitor = functions.database.ref('/event_related/general_comment_audiotranscriptserver_2/{event_id}/content/{comment_id}/')
  .onWrite((event)=>{
    console.log("audiotranscriptserver_2_general_comment_monitor");
    const generalcomment_data = event.data.val(); 
    const event_id = event.params.event_id; 
    const general_comment_id = event.params.comment_id; 
    const sender_id = generalcomment_data.user_id; 
    console.log("event_id", event_id); 
    console.log("comment_id", general_comment_id); 
    console.log("generalcomment_data", generalcomment_data); 
    notification.audiotranscriptserver_2_add_generalcomment(event_id, general_comment_id, sender_id);

    article.set_audiotranscript_2_to_sender( event_id, sender_id );


  }) //



exports.writtendebate2_sentence_comment_monitor = functions.database.ref('/event_related/sentence_comment_writtendebate2/{event_id}/{sentence_id}/{sentence_comment_id}/')
  .onWrite((event)=>{
    console.log("writtendebate2_sentence_comment_monitor");
    const sentencecomment_data = event.data.val();
    const event_id = event.params.event_id;
    const sentence_id = event.params.sentence_id;
    const sender_id = sentencecomment_data.user_id;
    console.log("event_id", event_id);
    console.log("sentence_id", sentence_id);
    console.log("sentencecomment_data", sentencecomment_data);
    notification.writtendebate2_add_sentencecomment(event_id, sentence_id, sender_id);


    article.set_writtendebate2_to_sender( event_id, sender_id );

  })

exports.audiotranscriptserver_sentence_comment_monitor = functions.database.ref('/event_related/sentence_comment_audiotranscriptserver/{event_id}/{sentence_id}/{sentence_comment_id}/')
  .onWrite((event)=>{
    console.log("audiotranscriptserver_sentence_comment_monitor");
    const sentencecomment_data = event.data.val();
    const event_id = event.params.event_id;
    const sentence_id = event.params.sentence_id;
    const sender_id = sentencecomment_data.user_id;
    console.log("event_id", event_id);
    console.log("sentence_id", sentence_id);
    console.log("sentencecomment_data", sentencecomment_data);
    notification.audiotranscriptserver_add_sentencecomment(event_id, sentence_id, sender_id);

    article.set_audiotranscript_to_sender( event_id, sender_id );
  })

exports.audiotranscriptserver_2_sentence_comment_monitor = functions.database.ref('/event_related/sentence_comment_audiotranscriptserver_2/{event_id}/{sentence_id}/{sentence_comment_id}/')
  .onWrite((event)=>{
    console.log("audiotranscriptserver_2_sentence_comment_monitor");
    const sentencecomment_data = event.data.val();
    const event_id = event.params.event_id;
    const sentence_id = event.params.sentence_id;
    const sender_id = sentencecomment_data.user_id;
    console.log("event_id", event_id);
    console.log("sentence_id", sentence_id);
    console.log("sentencecomment_data", sentencecomment_data);
    notification.audiotranscriptserver_2_add_sentencecomment(event_id, sentence_id, sender_id);

    article.set_audiotranscript_2_to_sender( event_id, sender_id );
  })



