

import * as firebase_admin from 'firebase-admin';

// import * as Promise from 'bluebird';


export class Test{

    constructor(){
    }

    async multiplePromise(): Promise<any> {
        console.log('Test1, multiplePromise')
        const arr = ['aaa', 'bbb'];
        const promise_arr = []
        arr.forEach((value)=>{
            promise_arr.push(this.onePromise(value));
        })
        return Promise.all(promise_arr);

    } 


    async onePromise(value) {
        console.log('Test1 onePromise', value);
        return new Promise((resolve, reject) => {
            setTimeout(()=>{
                resolve('resolve:' + value);
            },100)
        }).then(()=>{
            console.log('finished', value);
        });
    }


}

module.exports = Test;