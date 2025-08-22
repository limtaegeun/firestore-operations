import initializeFirebase from './config/firebase.js';
import {processInChunks} from './utils/batchOperations.js';
import dotenv from 'dotenv';
import {Timestamp} from "@google-cloud/firestore/build/src/index.js";

dotenv.config();

const updateFunction = (data, id) => {
    console.log(id)
    // 여기에 각 문서를 어떻게 업데이트할지 정의
    return {
        ...data,
        profileId: id
    };
};

const main = async () => {
    try {
        const db = initializeFirebase();
        // const collectionRef = db.collection('profiles');
        const collectionRef = db.collectionGroup('following');

        console.log('Starting batch operations...');
        const totalProcessed = await processInChunks(db, collectionRef, updateFunction);

        console.log(`Batch operations completed. Total documents processed: ${totalProcessed}`);
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1);
    }
};

main();