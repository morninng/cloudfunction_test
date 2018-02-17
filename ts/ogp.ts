

import * as firebase_admin from 'firebase-admin';

import * as crypto from 'crypto';
// import * as ogp_parser from 'ogp-parser';


import * as ogp_scraper from 'open-graph-scraper';

export class OGP{

    constructor(){
    }

    async set_writtendebate_opinion_ogp(opinion_path, url_arr): Promise<any> {

        const promise_arr = [];
        url_arr.forEach((url)=>{
            const hash = crypto.createHash('sha256');
            hash.update(url);
            const data = hash.digest("base64");
            const hashed_key = data.replace( /\//g , "" ) ;

            promise_arr.push(this.register_ogp_writtendebate_opinion(hashed_key, url, opinion_path))
        })
        return Promise.all(promise_arr);
    }

    async set_chat_message(message, message_path, current_full_path, chat_data): Promise<any> {

        const regexp = /(((https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g;
        const url_arr = message.match(regexp);
        if(!url_arr || url_arr.length === 0){
            console.log("url does not match")
            return new Promise(()=>{});
        }
        const url = url_arr[0];
        const hash = crypto.createHash('sha256');
        hash.update(url);
        const data = hash.digest("base64");
        const hashed_key = data.replace( /\//g , "" ) ;

        return this.retrieve_ogp(url, hashed_key)
        .then((ogp_value)=>{
            ogp_value["hashed_key"] = hashed_key;
            const ogp_obj = {ogp: ogp_value}
            const chat_data_with_ogp = Object.assign({}, {ogp: ogp_value},  chat_data);
            console.log("ogp_value is retrieved either after registration or already exist");
            return firebase_admin.database().ref(message_path).push(chat_data_with_ogp);
        }).then(()=>{
            console.log("ogp data is set on chat");
            return firebase_admin.database().ref(current_full_path).remove();
        }).then(()=>{
            console.log("deleting original data succeed");
        }).catch(()=>{
            console.log("ogp handling feiled")
        })

    }



    private async register_ogp_writtendebate_opinion(hashed_key, url, opinion_path): Promise<any> {

        console.log("hashed_data",hashed_key);
        console.log("url",url);

        return this.retrieve_ogp(url, hashed_key)
        .then((ogp_value)=>{
            console.log("ogp_value is retrieved either after registration or already exist");
            return firebase_admin.database().ref(opinion_path + "/" + hashed_key).set(ogp_value);
        }).then(()=>{
            console.log("ogp data is set")
        }).catch(()=>{
            console.log("ogp handling feiled")
        });
    }



    private async retrieve_ogp(url, hashed_key): Promise<any>{
        return new Promise((resolve, reject)=>{
            let ogp_value = null;


            const ogp_ref = "/ogp/" + hashed_key;
            firebase_admin.database().ref(ogp_ref).once("value").then(
            (snapshot)=>{
                ogp_value = snapshot.val();
                if(ogp_value){
                    resolve(ogp_value);
                    return Promise.reject("ogp already exist");
                }else{
                    return ogp_scraper({url:url});
                }
            }).then((result)=>{
                if(result && result.success){

                    ogp_value = Object.assign({}, {url:url}, result.data);
                    console.log("retrieve ogp data succeed", ogp_value);
                    for(const key in ogp_value){
                        if(!ogp_value[key]){
                            delete ogp_value[key];
                        }
                    }
                    // const ogp_ref = "/ogp/" + hashed_key;
                    return firebase_admin.database().ref(ogp_ref).set(ogp_value);
                } else {
                    reject(new Error("retrieving ogp failed"));
                }
            }).then(()=>{
                console.log("register ogp success");
                resolve(ogp_value);

            }).catch((error) => {
                console.error(error);
                reject(new Error('retrieving ogp failed'));
            });
        })
    }

}

// module.exports = OGP;
