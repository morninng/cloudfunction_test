/// <reference path="./../node_modules/@types/node/index.d.ts" />

import * as firebase_admin from 'firebase-admin';

import * as http from 'http';
import * as https from 'https';



export class FacebookGraph{

    constructor(){}

    retrieve_and_set_graph_profiledata = (user_id, token) => {

        const options = {
            hostname: 'graph.facebook.com',
            protocol: 'https',
            port: 80,
            path: '//v2.7/me?access_token=' + token + '&fields=id,cover,name,first_name,last_name,age_range,link,gender,locale,picture,timezone,updated_time,verified&redirect=true',
            method: 'GET',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        https.get(options, (res) =>{
        let body = '';
        res.on('data', (chunk)=>{
            body += chunk;
        })
        res.on('end',(response)=>{
            const graph_data = JSON.parse(body);
            console.log(graph_data);

            const short_name = graph_data.first_name || graph_data.last_name || graph_data.name;
            const user_basic_obj = {
            full_name: graph_data.name,
            fb_id: graph_data.id,
            short_name: short_name
            }
            const user_basic_ref = "/users/user_basic/" + user_id;

            firebase_admin.database().ref(user_basic_ref).update(user_basic_obj).then((snapshot) => {
                console.log("user basic info set ");
                return;
            }).catch(()=>{
                console.log("saving data user basic failed ");
                return;
            });

            const fb_graph_ref = "/users/fb_graph/" + user_id;
            firebase_admin.database().ref(fb_graph_ref).update(graph_data).then((snapshot) => {
                console.log("fb graph data is set ");
                return;
            }).catch(()=>{
                console.log("saving rb graph data failed ");
                return;
            });

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
            firebase_admin.database().ref(search_ref).update(search_data).then((snapshot) => {
                console.log("user search data is saved ");
                return;
            }).catch(()=>{
                console.log("saving search data failed ");
                return;
            });

        })
        }).on('error', (e)=>{
        console.log("retrieving graph data failed", e.message);
        })
    }


}

module.exports = FacebookGraph;