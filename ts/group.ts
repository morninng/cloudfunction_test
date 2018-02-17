const firebase_admin = require('firebase-admin');

export class Group{

    // constructor(){}


    async set_groupevent(event_id, group_id, event_data ): Promise<any> {

        console.log("set_groupevent is called");
        const grouopevent_ref = "/group/group_event/" + group_id + "/" + event_id;

        return firebase_admin.database().ref(grouopevent_ref)
        .set(event_data)
        .then(()=>{
            console.log("grouopevent is set");
        }).catch((err)=>{
            console.log("set_groupevent failed", err);
        })
        
    }

    async set_group_member(group_id, groupmember_obj): Promise<any>{


        const group_path = "/group/group_basic/" + group_id;
        return firebase_admin.database().ref(group_path).once("value")
        .then((snapshot)=>{
            const group_basic_data = snapshot.val();
            if(!group_basic_data){
                return;
            }
            const group_name = group_basic_data.group_name
            // key supposed to be user id
            const promise_arr = []
            for(const key in groupmember_obj){
                const user_group_data = Object.assign( {}, groupmember_obj[key], {group_name:group_name} );
                promise_arr.push(this.set_group_on_user(key, group_id, user_group_data))
            }
            return Promise.all(promise_arr);
        })
        
    }

    async set_group_on_user(user_id, group_id, user_group_data ): Promise<any>{

        const user_groupmember_path = "/users/group_members/" + user_id + "/" + group_id;
        return firebase_admin.database().ref(user_groupmember_path)
        .set(user_group_data)
        .then(()=>{
            console.log("set_group_on_user succeed");
        }).catch((err)=>{
            console.log("set_group_on_user failed", err);
        })

    }

    // removing the user should be one by one
    remove_user_from_group = (group_id, user_id ) =>{
        console.log('remove_user_from_group');
    }




}


//  module.exports = Group;