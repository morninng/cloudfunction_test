
import * as firebase_admin from 'firebase-admin';

// import * as http from 'http';
import * as https from 'https';

import { UserBasic, UserFbGraph } from './interface/User';

export class FacebookGraph{

    // constructor(){}

    async retrieve_and_set_graph_profiledata(user_id, token): Promise<any>{

        const options = {
            hostname: 'graph.facebook.com',
            protocol: 'https:',
            port: 443,
            path: '//v2.7/me?access_token=' + token + '&fields=id,cover,name,first_name,last_name,age_range,link,gender,locale,picture,timezone,updated_time,verified&redirect=true',
            method: 'GET',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        // const graph_request_url = 
        // "https://graph.facebook.com/v2.7/me?access_token=" + token + 
        // "&fields=id,cover,name,first_name,last_name,age_range,link,gender,locale,picture,timezone,updated_time,verified&redirect=true";
        // console.log(graph_request_url);


        return new Promise<UserFbGraph>( (resolve, reject)=> {

            https.get(options, (res) =>{
                let body = '';
                res.on('data', (chunk)=>{
                    body += chunk;
                })
                res.on('end',(response)=>{
                    const graph_data: UserFbGraph = JSON.parse(body);
                    console.log('graph_data', graph_data);
                    if(graph_data &&graph_data.id && graph_data.name){
                        resolve(graph_data);
                    }else{
                        reject(new Error('invalid graph data'));
                    }
                })
                res.on('error', (e)=>{
                    console.log("retrieving graph data failed", e.message);
                    reject(new Error(e.message));
                })
            })

        }).then((graph_data: UserFbGraph)=>{

            const short_name: string = graph_data.first_name || graph_data.last_name || graph_data.name;
            const user_basic_obj: UserBasic = {
            full_name: graph_data.name,
            fb_id: graph_data.id,
            short_name: short_name
            }
            const user_basic_ref = "/users/user_basic/" + user_id;

            const fb_graph_ref = "/users/fb_graph/" + user_id;

            let fullname_lowercase = "";
            let first_name_lowercase = "";
            let last_name_lowercase = "";

            if(graph_data.name){
            fullname_lowercase = graph_data.name.toLowerCase() 
            }
            if(graph_data.first_name){
            first_name_lowercase = graph_data.first_name.toLowerCase() 
            }
            if(graph_data.last_name){
            last_name_lowercase = graph_data.last_name.toLowerCase() 
            }
            const search_data = {
            full_name: graph_data.name,
            fb_id: graph_data.id,
            short_name,
            fullname_lowercase,
            first_name_lowercase,
            last_name_lowercase
            }

            const search_ref = "/users/search/" + user_id;
            const updateObject = {}
            updateObject[user_basic_ref] = user_basic_obj;
            updateObject[fb_graph_ref] = graph_data;
            updateObject[search_ref] = search_data;
            console.log("updateObject", updateObject);

            return firebase_admin.database().ref().update(updateObject)
        })
    }


}

// module.exports = FacebookGraph;