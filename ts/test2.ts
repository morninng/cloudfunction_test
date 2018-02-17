

import * as firebase_admin from 'firebase-admin';
// import * as Promise from 'bluebird';



export class Test2{

    // constructor(){}

    async multiplePromise(): Promise<any> {
        console.log('Test2, multiplePromise')
        const arr = ['aaa', 'bbb'];
        const promise_arr = []
        arr.forEach((value)=>{
            promise_arr.push(this.onePromise(value));
        })
        return Promise.all(promise_arr);

    } 


    async onePromise(value): Promise<string> {
        console.log('Test2 onePromise', value);
        return new Promise<string>((resolve, reject) => {
            setTimeout(()=>{
                resolve('resolve:' + value);
            },100)
        })
    }


}
