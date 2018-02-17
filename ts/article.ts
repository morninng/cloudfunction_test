

import * as firebase_admin from 'firebase-admin';


import {  ParticipateCannotgo, ParticipateInvited,  } from './interface/participate'




export class Article{


    async set_audiotranscript_to_participant(event_id): Promise<any>{
        console.log("set_audiotranscript_to_participant");
        const article_type = "ARTICLETYPE_ONLINE_LIVEVIDEO_serverrecognition"
        return this.set_article_to_participant(event_id, article_type);
    }

    async set_audiotranscript_2_to_participant(event_id): Promise<any>{
        console.log("set_audiotranscript_2_to_participant");
        const article_type = "ARTICLETYPE_ONLINE_LIVEVIDEO_serverrecognition_2"
        return this.set_article_to_participant(event_id, article_type);
    }

    async set_writtendebate2_to_participant(event_id): Promise<any>{
        console.log("set_writtendebate2_to_participant");
        const article_type = "ARTICLETYPE_WRITTENDEBATE2"
        return this.set_article_to_participant(event_id, article_type);
    }

    async set_audiotranscript_to_sender(event_id, sender_id): Promise<any>{
        console.log("set_audiotranscript_to_sender");
        const article_type = "ARTICLETYPE_ONLINE_LIVEVIDEO_serverrecognition"
        return this.set_article_to_sender(event_id,article_type, sender_id)
    }

    async set_audiotranscript_2_to_sender(event_id, sender_id): Promise<any>{
        console.log("set_audiotranscript_2_to_sender");
        const article_type = "ARTICLETYPE_ONLINE_LIVEVIDEO_serverrecognition_2"
        return this.set_article_to_sender(event_id,article_type, sender_id)
    }

    async set_writtendebate2_to_sender(event_id, sender_id): Promise<any>{
        console.log("set_writtendebate2_to_sender");
        const article_type = "ARTICLETYPE_WRITTENDEBATE2"
        return this.set_article_to_sender(event_id,article_type, sender_id)
    }

    private async set_article_to_participant(event_id, article_type): Promise<any>{
        console.log("set_article_to_participant", article_type);

        return firebase_admin.database().ref('/event_related/event/' + event_id).once('value')
        .then((snapshot)=>{
            const event_data = snapshot.val() || {}; 
            const participants = event_data.participants;
            const motion = event_data.motion;
            const article_obj = {
                motion,article_type
            }
            const promise_arr = []
            for(const key in participants){
                if(participants[key] !== ParticipateCannotgo && participants[key] !== ParticipateInvited)
                promise_arr.push(this.add_article_to_users(key, event_id , article_obj))
            }
            return Promise.all(promise_arr);
        });
    }

    private async set_article_to_sender(event_id,article_type, sender_id): Promise<void>{
        console.log("set_article_to_sender", article_type);

        return firebase_admin.database().ref('/event_related/event/' + event_id).once('value')
        .then((snapshot)=>{
            const event_data = snapshot.val() || {}; 
            const motion = event_data.motion;
            const article_obj = {
                motion,article_type
            }
            console.log('article_obj', article_obj);
            return this.add_article_to_users(sender_id, event_id , article_obj)
        });
    }


    private async add_article_to_users(user_id, event_id , article_obj): Promise<void>{
        console.log("add_article_to_users--", user_id);

        return firebase_admin.database().ref('/users/article/' + user_id + '/' + event_id).update(article_obj)
        .then(()=>{
            console.log("article data added to", user_id);
            return;
        }).catch(()=>{
            console.log("add article for");
        });
    }

}

// module.exports = Article;
