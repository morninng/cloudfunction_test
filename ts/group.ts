const firebase_admin = require('firebase-admin');

export class Group{

    constructor(){}


    set_groupevent = (event_id, group_id, event_data ) => {

        console.log("set_groupevent is called");
        const grouopevent_ref = "/group/group_event/" + group_id + "/" + event_id;

        const group_event_promise = firebase_admin.database().ref(grouopevent_ref).set(event_data)
        group_event_promise.then(()=>{
            console.log("grouopevent is set");
        }).catch((err)=>{
            console.log("set_groupevent failed", err);
        })
        
    }

    set_group_member = (group_id, groupmember_obj) =>{


        const group_path = "/group/group_basic/" + group_id;
        const group_basic_promise = firebase_admin.database().ref(group_path).once("value")
        group_basic_promise.then((snapshot)=>{
            const group_basic_data = snapshot.val();
            if(!group_basic_data){
                return;
            }
            const group_name = group_basic_data.group_name
            // key supposed to be user id
            for(let key in groupmember_obj){
                let user_group_data = (<any>Object).assign( {}, groupmember_obj[key], {group_name:group_name} );
                this.set_group_on_user(key, group_id, user_group_data);
            }
        })
        
    }

    set_group_on_user = (user_id, group_id, user_group_data ) =>{

        const user_groupmember_path = "/users/group_members/" + user_id + "/" + group_id;
        const group_event_promise = firebase_admin.database().ref(user_groupmember_path).set(user_group_data);
        group_event_promise.then(()=>{
            console.log("set_group_on_user succeed");
        }).catch((err)=>{
            console.log("set_group_on_user failed", err);
        })

    }

    // removing the user should be one by one
    remove_user_from_group = (group_id, user_id ) =>{

    }




}


 module.exports = Group;