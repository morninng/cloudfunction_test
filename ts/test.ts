

import * as firebase_admin from 'firebase-admin';

// import * as Promise from 'bluebird';


export class Test1{

    // constructor(){}

    async multiplePromise(): Promise<any> {
        console.log('Test1, multiplePromise')
        // const arr = ['aaa', 'bbb'];
        const arr = [];
        const promise_arr = []
        arr.forEach((value)=>{
            promise_arr.push(this.onePromise(value));
        })
        return Promise.all(promise_arr);

    } 


    async onePromise(value): Promise<void> {
        console.log('Test1 onePromise', value);

        if(value === 'aaa'){
            return this.secondlayerPromise('sss');
        } else{
            return new Promise((resolve, reject) => {
                setTimeout(()=>{
                    resolve('resolve:' + value);
                },100)
            }).then(()=>{
                console.log('finished', value);
            });
        }
    }

    async secondlayerPromise(value): Promise<void>{
        console.log('Test2 onePromise', value);
        return new Promise<string>((resolve, reject) => {
            setTimeout(()=>{
                resolve('resolve:' + value);
            },100)
        })
        .then(()=>{
            console.log('secondlayerPromise finished');
        })
    }


}
