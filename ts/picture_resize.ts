
import * as firebase_admin from 'firebase-admin';


import * as GCS from '@google-cloud/storage';
import * as child_process from 'child-process-promise';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';



export class PictureResize{


    constructor(){
        /*
        this.gcs = GCS({
            projectId: 'grape-spaceship-123',
            keyFilename: './secret/cloud-function-test-192f31cb3070.json'
        })
        */
    }

 // https://stackoverflow.com/questions/7200909/imagemagick-convert-to-fixed-width-proportional-height


    resize_group_coverphoto( group_id: string, file_bucket: string , file_path: string, file_name: string ){

        // Download file from bucket.
        const bucket = GCS.bucket(file_bucket);
        const tempFilePath = path.join(os.tmpdir(), file_name);

        bucket.file(file_path).download({
            destination: tempFilePath
        }).then(() => {
            console.log('Image downloaded locally to', tempFilePath);
            return child_process.spawn('convert', [tempFilePath, '-resize', '100x>', tempFilePath]);
        }).then(() => {
            console.log('Thumbnail created at', tempFilePath);
            const small_file_name = `small_${file_name}`;
            const thumbFilePath = path.join(path.dirname(file_path), small_file_name);

            this.upload_by_firebasestorage(thumbFilePath)

            return bucket.upload(tempFilePath, {destination: thumbFilePath});
        }).then(() => {
            fs.unlinkSync(tempFilePath
        )}).catch((err)=>{
            console.log("error", err);
        });

    }


    upload_by_firebasestorage(thumbFilePath){



    }



    resize_group_thumbnail( group_id ){


    }


}

module.exports = PictureResize;

