const firebase_admin = require('firebase-admin');
import { Speaker } from './interface/speech-status'

export class SpeechStatus{

    // constructor(){}


    async mainspeaker_update(event_id, data: Speaker): Promise<any>{

        console.log('mainspeaker_update', data);
        return this.set_mainspeaker(event_id, data);
        
    }


    poicnadidate_update(event_id, data) {
        console.log('poicnadidate_update', data);
    }

    poispeaker_update(event_id, data) {
        console.log('poispeaker_update', data);
    }



    private async set_mainspeaker(event_id, data: Speaker): Promise<any>{

        const user_id = data.user_id;
        const role_name = data.role_name;

        return firebase_admin.database().ref('event_related/livevideo-debate-role/' + event_id + '/' + role_name).set(user_id)
        .then( () => {
            console.log("role has set", role_name);
        }).catch( () => {
            console.log("setting role failed");
        })
    }

}


//  module.exports = SpeechStatus;
