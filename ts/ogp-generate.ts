

import * as firebase_admin from 'firebase-admin';
// import * as Promise from 'bluebird';



export class OgpGenerate{

    constructor(){
    }



    private get_fixed_ogp_meta(full_url){
        const ogp_url = '<meta property="og:url" content="' + full_url + '" />';
        const ogp_title = '<meta property="og:title" content="online debate platform" />';
        const ogp_description = '<meta property="og:description" content=" online debate platform" />'
        const image_url = "https://storage.googleapis.com/mixidea_resource/icon_withname.png";
        const ogp_image = '<meta property="og:image" content="' + image_url + '" />';
        const ogp_facebook_appid = '<meta property="fb:app_id" content="922863714492725" />'

        const ogp_meta_text =  ogp_url + ogp_title + ogp_description + ogp_image + ogp_facebook_appid;
        console.log(ogp_meta_text);
        return ogp_meta_text;
    }


    private get_ogp_meta( full_url , title, description ){

        const ogp_url = '<meta property="og:url" content="' + full_url + '" />';
        const ogp_title = '<meta property="og:title" content="' + title  + '" />';
        const ogp_description = '<meta property="og:description" content="' + description + '" />'
        const image_url = "https://storage.googleapis.com/mixidea_resource/icon_withname.png";
        const ogp_image = '<meta property="og:image" content="' + image_url + '" />';
        const ogp_facebook_appid = '<meta property="fb:app_id" content="922863714492725" />'

        const ogp_meta_text =  ogp_url + ogp_title + ogp_description + ogp_image + ogp_facebook_appid;
        console.log(ogp_meta_text);
        return ogp_meta_text;

    }

    private get_eventlist_ogp_meta( full_url ){

        const ogp_url = '<meta property="og:url" content="' + full_url + '" />';
        const ogp_title = '<meta property="og:title" content="online debate platform" />';
        const ogp_description = '<meta property="og:description" content="event list for chosing the event" />'
        const image_url = "https://storage.googleapis.com/mixidea_resource/icon_withname.png";
        const ogp_image = '<meta property="og:image" content="' + image_url + '" />';
        const ogp_facebook_appid = '<meta property="fb:app_id" content="922863714492725" />'

        const ogp_meta_text =  ogp_url + ogp_title + ogp_description + ogp_image + ogp_facebook_appid;
        console.log(ogp_meta_text);
        return ogp_meta_text;

    }


    private get_articlelist_ogp_meta( full_url ){

        const ogp_url = '<meta property="og:url" content="' + full_url + '" />';
        const ogp_title = '<meta property="og:title" content="online debate platform" />';
        const ogp_description = '<meta property="og:description" content="article list for reading all article" />'
        const image_url = "https://storage.googleapis.com/mixidea_resource/icon_withname.png";
        const ogp_image = '<meta property="og:image" content="' + image_url + '" />';
        const ogp_facebook_appid = '<meta property="fb:app_id" content="922863714492725" />'

        const ogp_meta_text =  ogp_url + ogp_title + ogp_description + ogp_image + ogp_facebook_appid;
        console.log(ogp_meta_text);
        return ogp_meta_text;

    }






    get_ogp(full_url, url_path): Promise<any>{

        return new Promise((resolve, reject)=>{

            const url_arr = url_path.split("/");
            console.log(url_arr);

            if( url_arr[1]==="event" && url_arr[2]==="eventcontext" && url_arr[3]){
                const event_id = url_arr[3];
                this.retrieve_event_ogp( full_url, event_id).then((html_text)=>{

                    resolve(html_text);
                });
            }else if (url_arr[1]==="livevideo-debate-audio-serverrecognition" && url_arr[2]){
                console.log("categirized as livevideo-debate-audio-serverrecognition ")
                const event_id = url_arr[2];
                this.retrieve_audioserverrecognition_ogp( full_url, event_id).then((html_text)=>{
                    resolve(html_text);
                });
            }else if (url_arr[1]==="writtendebate-article2" && url_arr[2]){
                console.log("writtendebate-article2 ")
                const event_id = url_arr[2];
                this.retrieve_writtendebatearticle2_ogp( full_url, event_id).then((html_text)=>{
                    return resolve(html_text);
                });
            }else if(url_arr[1]==="livevideo-debate-audio" && url_arr[2]){
                const event_id = url_arr[2];
                this.retrieve_audio_ogp( full_url, event_id).then((html_text)=>{
                    resolve(html_text);
                });
            }else if (url_arr[1]==="event" && url_arr[2]==="eventlist"){

                const html_text =  this.get_eventlist_ogp_meta(full_url)
                resolve(html_text);

            }else if (url_arr[1]==="article" && url_arr[2]==="articlelist"){

                const html_text =  this.get_articlelist_ogp_meta(full_url)
                resolve(html_text);

            } else {
                const html_text = this.get_fixed_ogp_meta(full_url);
                resolve(html_text);
            }


        })
    }






    private retrieve_event_ogp( full_url, event_id){

        return new Promise((resolve, reject)=>{

            const event_ref = "/event_related/event/" + event_id;
            firebase_admin.database().ref(event_ref).once("value")
            .then( (snapshot)=>{
                const event_context = snapshot.val();
                console.log(event_context);
                let title_text = " online debate"


                const start_time = new Date(event_context.date_time_start);
                const start_time_str = start_time.toUTCString()
                const event_title = event_context.title;

                if(event_context.type === "ONLINE_DEBATE_LIVEVIDEO"){
                    title_text = "Online Live Video Debate Event from " + start_time_str  + "&nbsp; (Differnt by the time zone)"
                    const detail_text =  event_title;
                    const html_text = this.get_ogp_meta(full_url, title_text, detail_text);
                    return resolve(html_text);
                }else if(event_context.type === "ONLINE_DEBATE_WRITTEN"){

                    const finish_time = new Date(event_context.date_time_finish);
                    const finish_time_str = finish_time.toUTCString()
                    title_text = "Online Written Debate Event &nbsp; --&nbsp; from " + start_time_str  + "&nbsp; --&nbsp; to &nbsp; -- &nbsp;" +  finish_time_str + " (Differnt by the time zone)"
                    const detail_text =  event_title + " &nbsp; --  &nbsp; " + event_context.motion;
                    const html_text = this.get_ogp_meta(full_url, title_text, detail_text);
                    return resolve(html_text);
                }



            }).catch((err)=>{
                console.log("error to retrieve event info from firebase", err);

                return resolve("");
            })
        })

    }

    private retrieve_audioserverrecognition_ogp( full_url, event_id){


        return new Promise((resolve, reject)=>{

            const event_ref = "/event_related/audio_transcriptserver/" + event_id;
            firebase_admin.database().ref(event_ref).once("value")
            .then( (snapshot)=>{
                const aurioarticle_context = snapshot.val();
                console.log("event_context", aurioarticle_context);
                const title_text = "speech and transcription of online debate"
                const detail_text =  aurioarticle_context.motion;
                const html_text = this.get_ogp_meta(full_url, title_text, detail_text);
                return resolve(html_text);

            }).catch((err)=>{
                console.log("error to retrieve event info from firebase", err);
                // const html_text = get_fixed_ogphtml(full_url);
                const html_text = this.get_fixed_ogp_meta(full_url);;
                return resolve(html_text);

            })

        })

    }

    private retrieve_writtendebatearticle2_ogp( full_url, event_id){


        return new Promise((resolve, reject)=>{

            const event_ref = "/event_related/event/" + event_id;
            firebase_admin.database().ref(event_ref).once("value")
            .then( (snapshot)=>{
                const event_context = snapshot.val();
                console.log("event_context", event_context);
                const title_text = "online written debate "
                const detail_text =  event_context.motion;
                const html_text = this.get_ogp_meta(full_url, title_text, detail_text);
                return resolve(html_text);

            }).catch((err)=>{
                console.log("error to retrieve event info from firebase, respond_writtendebatearticle2_ogp, ", err);
                // const html_text = get_fixed_ogphtml(full_url);
                const html_text = this.get_fixed_ogp_meta(full_url);;
                return resolve(html_text);
            })

        })
    }


    private retrieve_audio_ogp( full_url, event_id){


        return new Promise((resolve, reject)=>{

            const event_ref = "/event_related/audio_transcript/" + event_id;
            firebase_admin.database().ref(event_ref).once("value")
            .then( (snapshot)=>{
                const auriotranscript_context = snapshot.val();
                console.log("event_context", auriotranscript_context);
                const title_text = "speech and transcription of online debate";
                const detail_text =  auriotranscript_context.motion;
                const html_text = this.get_ogp_meta(full_url, title_text, detail_text);
                return resolve(html_text);

            }).catch((err)=>{
                console.log("error to retrieve event info from firebase, respond_audio_ogp, ", err);
                // const html_text = get_fixed_ogphtml(full_url);
                const html_text = this.get_fixed_ogp_meta(full_url);;
                return resolve(html_text);
            })

        })


    }




}

module.exports = OgpGenerate;
