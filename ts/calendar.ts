

import * as firebase_admin from 'firebase-admin';


import {client_secret} from './../secret/client_secret_mixideaproject'


import {TEAM_PROPOSITION, TEAM_OPPOSITION, ParticipateCannotgo, ParticipateGoing,
ParticipateMaybe,ParticipateInvited, ParticipateProposition, ParticipateOpposition } from './../interface/participate'

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

import * as google from 'googleapis';
import * as googleAuth from 'google-auth-library';

export class Calendar{

    constructor(){}

    // http function
    get_auth_url(req, res){

        const oauth2Client = this.get_oauth2Client();
        if(!oauth2Client){
            res.send("client_secret is not proper");
        }
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        res.send("auth url : " + authUrl );

    }


    // http function
    store_token(req, res){
        const token_code = req.query.token;

        const oauth2Client = this.get_oauth2Client();
        if(!oauth2Client){
            res.send("client_secret is not proper");
        }
        oauth2Client.getToken(token_code, (err, token_store) => {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                res.send("Error while trying to retrieve access token");
                return;
            }
            console.log("token_store", token_store);
            this.store_token_firebase(token_store, req, res)
        });
    }



    // http function
    private store_token_firebase = (token_store, req, res) =>{
        const token_ref = "/admin/google_token/";
        firebase_admin.database().ref(token_ref).set(token_store).then(
            () => {
                console.log("token is saved");
                if(res){
                    res.send("token is saved");
                }
                return;
            }).catch(()=>{
                console.log("saving token is failed");
                if(res){
                    res.send("saving token is failed");
                }
                return;
        });
    }

    // http function
    listEvents(req, res){

        const token_ref = "/admin/google_token/";
        firebase_admin.database().ref(token_ref).once("value", 
            (token_snapshot)=> {
                const token = token_snapshot.val()
                console.log("token", token);
                if(!token){
                    res.send("no token exist");
                    return;
                }
                const oauth2Client = this.get_oauth2Client();
                if(!oauth2Client){
                    res.send("client_secret is not proper");
                }
                oauth2Client.credentials = token;
                this.listEvents_execute(req, res, oauth2Client);
            },
            (error)=>{
                res.send("token retrieve error");
                return;
            });

    }




    private gettoken_executeAPI = (callback, data) =>{

        console.log("gettoken_executeAPI");
        const token_ref = "/admin/google_token/";
        firebase_admin.database().ref(token_ref).once("value", 
            (token_snapshot)=> {
                const token = token_snapshot.val()
                console.log("token", token);
                if(!token){
                    console.log("no token exist");
                    return;
                };
                console.log("token", token);

                const oauth2Client = this.get_oauth2Client();
                if(!oauth2Client){
                    console.log("client_secret is not proper");
                }
                oauth2Client.credentials = token;

                if(oauth2Client.credentials.expiry_date < Date.now()){
                    console.log("access token is expired");
                    this.reflesh_access_token(oauth2Client, callback, data);
                }else{
                    console.log("access token is NOT expired");
                    callback(data, oauth2Client);
                }
            },
            (error)=>{
                console.log("token retrieve error");
                return;
            });
    }


    private reflesh_access_token = (oauth2Client, callback, data) => {
    if(oauth2Client.credentials && oauth2Client.credentials.refresh_token){
        const reflesh_token = oauth2Client.credentials.refresh_token;
        oauth2Client.refreshAccessToken( (err, refreshed_tokens)=>{
        if(!err){
            console.log(refreshed_tokens)
        }
        console.log("refleshed token", refreshed_tokens)
        oauth2Client.credentials = refreshed_tokens;
        callback(data, oauth2Client);
        this.store_token_firebase(refreshed_tokens, null, null);

        })
    }

    }


    update_calendar_for_eventupdate = (event_id) =>{


        const participant_arr = [];
        const participant_gmail_arr = []
        let event_data = null;

        const event_ref = "/event_related/event/" + event_id;
        const google_profile_ref = "/users/google_profile";
        const calendar_event_id_ref = "/event_related/calendar_event/" + event_id;
        firebase_admin.database().ref(event_ref).once("value")
        .then( (snapshot)=>{
            event_data = snapshot.val();
            console.log("event_data", event_data);

            const participant_obj = event_data.participants || {};

            for(let key in participant_obj){
                if(participant_obj[key]==='ParticipateGoing' || participant_obj[key]==='ParticipateMaybe'){
                    participant_arr.push(key);
                }
            }
            console.log("participant_arr", participant_arr);

            return firebase_admin.database().ref(google_profile_ref).once("value");

        }).then((snapshot)=>{
            const google_profile = snapshot.val() || {};

            participant_arr.forEach((element)=>{
                if(element && google_profile && google_profile[element] && google_profile[element].email){
                    participant_gmail_arr.push(google_profile[element].email);
                }
            })
            console.log("participant_gmail_arr", participant_gmail_arr);
            if(participant_gmail_arr.length == 0){
                throw new Error("no gmail info, so get out from promise chain");
            }

            return firebase_admin.database().ref(calendar_event_id_ref).once("value");
        }).then((snapshot)=>{
            const previous_calendar_event_id = snapshot.val();
            console.log("previous_calendar_id", previous_calendar_event_id);

            this.gettoken_executeAPI(this.update_googlecalendar_event, {event_id, event_data, participant_gmail_arr, previous_calendar_event_id})


        }).catch((err)=>{
            console.log("error", err);
        })
    }


    private update_googlecalendar_event = (data, auth) => {

        console.log("create_googlecalendar_event");
        const event_data = data.event_data
        const participant_gmail_arr = data.participant_gmail_arr;
        const event_id = data.event_id
        const previous_calendar_event_id = data.previous_calendar_event_id;

        const attendees = [];

        participant_gmail_arr.forEach((element)=>{
            attendees.push({email: element});
        })
        const date_time_start = new Date( event_data.date_time_start);
        const date_time_finish = new Date( event_data.date_time_finish);
        const date_time_start_iso = date_time_start.toISOString();
        const date_time_finish_iso = date_time_finish.toISOString();

        const event_url = "https://mixidea.org/event/eventcontext/" + event_id;

        var calendar_event = {
            'summary': 'online debate: ' + event_data.title,
            'location': 'from your home computer',
            'description': 
                "go to event page from here" + 
                "\n " + event_url +
                "\n" +
                "\n You need to prepare following items" + 
                "\n - Google Chrome browser" + 
                "\n - headset with microphone" + 
                "\n - Desktop , Laptop, Netbook" + 
                "\n\n   (*) iphone, ipad is NOT available!!" +
                "\n\n",
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
        console.log("calendar_event", calendar_event);


        var calendar = google.calendar('v3');

        if(previous_calendar_event_id){
            calendar.events.update(
                {auth: auth,calendarId: 'primary',resource: calendar_event, eventId: previous_calendar_event_id},
                (err, calendar_event)=> {
                    if (err) {
                        console.log('updating calendar event error ' + err);
                        return;
                    }
                    console.log('Event updated: %s', calendar_event.htmlLink);
                    console.log('updated event id', calendar_event.id)
                }
            );

        }else{

            calendar.events.insert(
                {auth: auth,calendarId: 'primary',resource: calendar_event},
                (err, calendar_event)=> {
                    if (err) {
                        console.log('insert calendar event error: ' + err);
                        return;
                    }
                    console.log('Event created: %s', calendar_event.htmlLink);
                    console.log('event id', calendar_event.id)
                    this.save_calendar_event_id(event_id, calendar_event.id)
                }
            );
        }
    }


    private save_calendar_event_id = (event_id, calendar_event_id)=> {

        const calendar_event_id_ref = "/event_related/calendar_event/" + event_id;


        firebase_admin.database().ref(calendar_event_id_ref).set(calendar_event_id).then(
            () => {
                console.log("calendar_eventid is saved");
                return;
            }).catch(()=>{
                console.log("saving calendar_eventid is failed");
                return;
        });
    }




    create_newuser_calendar = (user_id, gmail_address) => {
        // 1.gmailのデータ追加、変更をsubscribe
        // 2. その人が参加している未来のイベントを抽出
        // 3. update_calendar_for_eventupdateを呼び出す。

    }




    private get_oauth2Client = ()=>{

        if(!client_secret || !client_secret.installed){
            console.log("slient_secret does not exist");
            return null;
        }
        var clientSecret = client_secret.installed.client_secret;
        var clientId = client_secret.installed.client_id;
        var redirectUrl = client_secret.installed.redirect_uris[0];
        if(!clientId || !clientSecret || !redirectUrl){
            console.log("client_secret is not proper");
            return null;
        }
        var auth = new googleAuth();
        const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        return oauth2Client;
    }


    private listEvents_execute = (req, res, auth)=>{

        var calendar = google.calendar('v3');
        calendar.events.list({
            auth: auth,
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
        }, (err, response) => {
            if (err) {
            console.log('The API returned an error: ' + err);
            return;
            }
            var events = response.items;
            if (events.length == 0) {
                console.log('No upcoming events found.');
                res.send("No upcoming events found.");
                return;
            } else {
            console.log('Upcoming 10 events:');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
            console.log('Upcoming 10 events:' + JSON.stringify(events));
            res.send('Upcoming 10 events:' + JSON.stringify(events));

            return;
            }
        });
    }

    update_calendar_for_user = (user_id)=>{
        console.log("update_calendar_for_user");

        const current_time = Date.now();
        console.log("current_time", current_time);
        const retrieve_start_time = current_time - 3*24*60*60*1000;

        const my_event_ref = firebase_admin.database().ref("users/my_event/" + user_id);
        my_event_ref.orderByChild("date_time_start").startAt(retrieve_start_time).on("child_added",
            (snapshot)=>{
                console.log("my event value", snapshot.val());
                console.log("my event key", snapshot.key);
                const event_id = snapshot.key;
                console.log("event id of google profile change", event_id)
                const event_type = snapshot.val().type;
                if(event_type == ParticipateGoing || event_type == ParticipateMaybe){
                    console.log("going or maybe event", snapshot.key);
                    this.update_calendar_for_eventupdate(event_id);
                }
            }
        )


    }

}

module.exports = Calendar;