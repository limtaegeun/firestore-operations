import initializeFirebase from './config/firebase.js';
import {forEachInChunks} from './utils/batchOperations.js';
import dotenv from 'dotenv';
import {Timestamp} from "@google-cloud/firestore/build/src/index.js";
import {Client} from "@elastic/elasticsearch";


dotenv.config();
const client = new Client({
    node: "https://d480816fbf69467c9f5e62f27b5216ac.asia-northeast3.gcp.elastic-cloud.com:443",
    auth: {
        apiKey: "YlRiQ3Y1UUJiOGFGMjZYU0hRQy06bWI0OGJzMTdUNXV6X0sxV2VfR0JSQQ==",
    },
});
const index = 'events_dev';
const updateFunction = async (data, id) => {
    // 여기에 각 문서를 어떻게 업데이트할지 정의
    if (data.indexId) {
        console.log(id,  {
            like_count: data.likedCount || 0,
            left_seats: data.countLimit ? data.countLimit - data.members.length : 99,
            default_score: 1
        },)
        return client.update({
            index,
            id: data.indexId,
            doc: {
                like_count: data.likedCount || 0,
                left_seats: data.countLimit ? data.countLimit - data.members.length : 99,
                default_score: 1
            },
        });
    }
};

const main = async () => {
    try {
        const db = initializeFirebase();
        // const collectionRef = db.collection('profiles');
        const collectionRef = db.collectionGroup('events');

        console.log('Starting batch operations...');
        const totalProcessed = await forEachInChunks(db, collectionRef, updateFunction);

        console.log(`Batch operations completed. Total documents processed: ${totalProcessed}`);
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1);
    }
};

main();