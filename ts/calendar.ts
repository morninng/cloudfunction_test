

import * as firebase_admin from 'firebase-admin';


import { client_secret } from './secret/client_secret_mixideaproject'


import { ParticipateGoing, ParticipateMaybe, } from './interface/participate'
import { EventData } from './interface/event-data';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

import * as google from 'googleapis';
import * as googleAuth from 'google-auth-library';

const TOKEN_AVAILABLE = 'TOKEN_AVAILABLE';
const TOKEN_EXPIRED = 'TOKEN_EXPIRED';

export class Calendar {


    // http function
    async get_auth_url(): Promise<any> {

        return new Promise((resolve, reject) => {
            const oauth2Client = this.get_oauth2Client();
            if (!oauth2Client) {
                reject(new Error("client_secret is not proper"));
            }
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES
            });
            resolve("auth url : " + authUrl);
        });
    }


    // http function api
    async store_token(token_code): Promise<any> {
        return new Promise((resolve, reject) => {
            const oauth2Client = this.get_oauth2Client();
            if (!oauth2Client) {
                reject(　new Error("client_secret is not proper"));
            }
            oauth2Client.getToken(token_code, (err, token_store) => {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    reject(　new Error("Error while trying to retrieve access token"));
                } else {
                    console.log("token_store", token_store);
                    resolve(token_store);
                }
            });
        }).then((token_store) => {
            return this.store_token_firebase(token_store);
        });
    }


    // http function
    private async store_token_firebase(token_store): Promise<void> {
        const token_ref = "/admin/google_token/";
        return firebase_admin.database().ref(token_ref).set(token_store)
            .then(() => {
                console.log("token is saved");
            }).catch(() => {
                console.log("saving token is failed");
                throw new Error("saving token is failed");
            });
    }

    // http function
    listEvents(): Promise<string> {

        return new Promise((resolve, reject) => {

            const token_ref = "/admin/google_token/";
            firebase_admin.database().ref(token_ref).once("value",
                (token_snapshot) => {
                    const token = token_snapshot.val()
                    console.log("token", token);
                    if (!token) {
                        reject(new Error("no token exist"))
                    }
                    const oauth2Client = this.get_oauth2Client();
                    if (!oauth2Client) {
                        console.log("client_secret is not proper")
                        reject(new Error("client_secret is not proper"))
                    }
                    oauth2Client.credentials = token;
                    // return this.listEvents_execute( oauth2Client);
                    resolve(oauth2Client);
                },
                (error) => {
                    console.log("token retrieve error")
                    reject(new Error("token retrieve error"))
                    return;
                }
            );

        }).then((oauth2Client) => {
            return this.listEvents_execute(oauth2Client);
        });
    }

    private async gettoken_executeAPI(callback: (data: any, auth: any) => Promise<any>, data: any): Promise<any> {

        console.log("gettoken_executeAPI");
        const token_ref = "/admin/google_token/";
        let oauth2Client = null;

        return new Promise((resolve, reject) => {

            firebase_admin.database().ref(token_ref).once("value",
                (token_snapshot) => {
                    const token = token_snapshot.val()
                    console.log("token", token);
                    if (!token) {
                        console.log("no token exist");
                        return;
                    };
                    console.log("token", token);

                    oauth2Client = this.get_oauth2Client();
                    if (!oauth2Client) {
                        console.log("client_secret is not proper");
                    }
                    oauth2Client.credentials = token;

                    if (oauth2Client.credentials.expiry_date < Date.now()) {
                        console.log("access token is expired");
                        resolve(TOKEN_EXPIRED);

                    } else {
                        console.log("access token is NOT expired");
                        resolve(TOKEN_AVAILABLE);
                    }
                },
                (error) => {
                    console.log("token retrieve error");
                    return;
                }
            );
        }).then((token_status) => {

            if (token_status === TOKEN_AVAILABLE) {

                return callback(data, oauth2Client);

            } else if (token_status === TOKEN_EXPIRED) {
                return this.reflesh_access_token(oauth2Client, callback, data);
            }
        })

    }


    private reflesh_access_token(oauth2Client, callback: (data: any, auth: any) => Promise<any>, data): Promise<any> {

        return new Promise((resolve, reject) => {

            if (oauth2Client.credentials && oauth2Client.credentials.refresh_token) {
                // const reflesh_token = oauth2Client.credentials.refresh_token;
                oauth2Client.refreshAccessToken((err, refreshed_tokens) => {
                    if (!err) {
                        console.log(refreshed_tokens)
                    }
                    console.log("refleshed token", refreshed_tokens)
                    oauth2Client.credentials = refreshed_tokens;

                    resolve(refreshed_tokens);

                })
            } else {
                throw new Error('refreshing token failed');
            }
        }).then((refreshed_tokens) => {
            return this.store_token_firebase(refreshed_tokens);
        }).then(() => {
            return callback(data, oauth2Client);
        })



    }


    async update_calendar_for_eventupdate(event_id): Promise<void> {


        const participant_arr = [];
        const participant_gmail_arr = []
        let event_data = null;

        const event_ref = "/event_related/event/" + event_id;
        const google_profile_ref = "/users/google_profile";
        const calendar_event_id_ref = "/event_related/calendar_event/" + event_id;
        return firebase_admin.database().ref(event_ref).once("value")
            .then((snapshot) => {
                event_data = snapshot.val();
                console.log("event_data", event_data);

                const participant_obj = event_data.participants || {};

                for (const key in participant_obj) {
                    if (participant_obj[key] === 'ParticipateGoing' || participant_obj[key] === 'ParticipateMaybe') {
                        participant_arr.push(key);
                    }
                }
                console.log("participant_arr", participant_arr);

                return firebase_admin.database().ref(google_profile_ref).once("value");

            }).then((snapshot) => {
                const google_profile = snapshot.val() || {};

                participant_arr.forEach((element) => {
                    if (element && google_profile && google_profile[element] && google_profile[element].email) {
                        participant_gmail_arr.push(google_profile[element].email);
                    }
                })
                console.log("participant_gmail_arr", participant_gmail_arr);
                if (participant_gmail_arr.length === 0) {
                    throw new Error('no gmail for this user');
                }

                return firebase_admin.database().ref(calendar_event_id_ref).once("value");
            }).then((snapshot) => {
                const previous_calendar_event_id = snapshot.val();
                console.log("previous_calendar_id", previous_calendar_event_id);

                return this.gettoken_executeAPI(
                    this.update_googlecalendar_event,
                    { event_id, event_data, participant_gmail_arr, previous_calendar_event_id }
                )


            }).catch((err) => {
                console.log("error", err);
            })
    }


    private async update_googlecalendar_event(data, auth): Promise<any> {

        console.log("create_googlecalendar_event");
        const event_data = data.event_data
        const participant_gmail_arr = data.participant_gmail_arr;
        const event_id = data.event_id
        const previous_calendar_event_id = data.previous_calendar_event_id;

        const attendees = [];

        participant_gmail_arr.forEach((element) => {
            attendees.push({ email: element });
        })
        const date_time_start = new Date(event_data.date_time_start);
        const date_time_finish = new Date(event_data.date_time_finish);
        const date_time_start_iso = date_time_start.toISOString();
        const date_time_finish_iso = date_time_finish.toISOString();

        const event_url = "https://mixidea.org/event/eventcontext/" + event_id;

        const calendar_event = {
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
                    { 'method': 'email', 'minutes': 10 * 60 },
                    { 'method': 'popup', 'minutes': 10 },
                ],
            }
        };
        console.log("calendar_event", calendar_event);


        const calendar = google.calendar('v3');


        if (previous_calendar_event_id) {
            return new Promise((resolve, reject) => {

                calendar.events.update(
                    { auth: auth, calendarId: 'primary', resource: calendar_event, eventId: previous_calendar_event_id },
                    (err, calendar_event_data) => {
                        if (err) {
                            console.log('updating calendar event error ' + err);
                            reject('updating calendar event error ')
                            return;
                        } else {
                            console.log('Event updated: %s', calendar_event_data.htmlLink);
                            console.log('updated event id', calendar_event_data.id)
                            resolve('updated event id' + calendar_event_data.id);
                            return;
                        }
                    }
                );

            })
        } else {

            return new Promise((resolve, reject) => {

                calendar.events.insert(
                    { auth: auth, calendarId: 'primary', resource: calendar_event },
                    (err, calendar_event_data) => {
                        if (err) {
                            console.log('insert calendar event error: ' + err);
                            reject(new Error('insert calendar event error: ' + err));
                            return;
                        }
                        console.log('Event created: %s', calendar_event_data.htmlLink);
                        console.log('event id', calendar_event_data.id)
                        resolve(calendar_event);
                    }
                );
            }).then((calendar_event_data: any) => {
                return this.save_calendar_event_id(event_id, calendar_event_data.id)

            });
        }
    }


    private async save_calendar_event_id(event_id, calendar_event_id): Promise<any> {

        const calendar_event_id_ref = "/event_related/calendar_event/" + event_id;


        return firebase_admin.database().ref(calendar_event_id_ref).set(calendar_event_id).then(
            () => {
                console.log("calendar_eventid is saved");
                return;
            }).catch(() => {
                console.log("saving calendar_eventid is failed");
                return;
            });
    }




    create_newuser_calendar = (user_id, gmail_address) => {
        // 1.gmailのデータ追加、変更をsubscribe
        // 2. その人が参加している未来のイベントを抽出
        // 3. update_calendar_for_eventupdateを呼び出す。

    }




    private get_oauth2Client = () => {

        if (!client_secret || !client_secret.installed) {
            console.log("slient_secret does not exist");
            return null;
        }
        const clientSecret = client_secret.installed.client_secret;
        const clientId = client_secret.installed.client_id;
        const redirectUrl = client_secret.installed.redirect_uris[0];
        if (!clientId || !clientSecret || !redirectUrl) {
            console.log("client_secret is not proper");
            return null;
        }
        const auth = new googleAuth();
        const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        return oauth2Client;
    }


    private listEvents_execute(auth): Promise<string> {
        console.log('listEvents_execute start')

        return new Promise((resolve, reject) => {
            const calendar = google.calendar('v3');
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
                    reject(new Error('The API returned an error: ' + err));
                    return;
                }
                const events = response.items;
                console.log('events', events);
                if (events.length === 0) {
                    console.log('No upcoming events found.');
                    resolve("No upcoming events found.");
                    return;
                } else {
                    for (let i = 0; i < events.length; i++) {
                        const event = events[i];
                        const start = event.start.dateTime || event.start.date;
                        console.log('%s - %s', start, event.summary);
                    }
                    console.log('Upcoming 10 events:' + JSON.stringify(events))
                    resolve('Upcoming 10 events:' + JSON.stringify(events));
                    return;
                }
            });
        })
    }

    async update_calendar_for_user(user_id): Promise<any> {
        console.log("update_calendar_for_user");
        const current_time = Date.now();
        console.log("current_time", current_time);
        const retrieve_start_time = current_time - 3 * 24 * 60 * 60 * 1000;

        return new Promise((resolve, reject) => {
            const my_event_ref = firebase_admin.database().ref("users/my_event/" + user_id);
            my_event_ref.once("value",
                (snapshot) => {

                    const event_arr = snapshot.val();
                    if (event_arr) {
                        resolve(event_arr);
                    } else {
                        reject();
                    }
                }
            )
        }).then((event_arr) => {
            const promise_arr: Promise<void>[] = [];
            for (const key in event_arr) {
                const event_data: EventData = event_arr[key];
                const event_id = key;
                const event_type = event_data.type;
                if ((event_data.date_time_start > retrieve_start_time) && (event_type === ParticipateGoing || event_type === ParticipateMaybe)) {
                    promise_arr.push(this.update_calendar_for_eventupdate(event_id))
                }
            }
            return Promise.all(promise_arr);
        })
    }

}
