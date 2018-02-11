"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GCS = require("@google-cloud/storage");
const child_process = require("child-process-promise");
const path = require("path");
const os = require("os");
const fs = require("fs");
class PictureResize {
    constructor() {
        /*
        this.gcs = GCS({
            projectId: 'grape-spaceship-123',
            keyFilename: './secret/cloud-function-test-192f31cb3070.json'
        })
        */
    }
    // https://stackoverflow.com/questions/7200909/imagemagick-convert-to-fixed-width-proportional-height
    resize_group_coverphoto(group_id, file_bucket, file_path, file_name) {
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
            this.upload_by_firebasestorage(thumbFilePath);
            return bucket.upload(tempFilePath, { destination: thumbFilePath });
        }).then(() => {
            fs.unlinkSync(tempFilePath);
        }).catch((err) => {
            console.log("error", err);
        });
    }
    upload_by_firebasestorage(thumbFilePath) {
    }
    resize_group_thumbnail(group_id) {
    }
}
exports.PictureResize = PictureResize;
module.exports = PictureResize;
