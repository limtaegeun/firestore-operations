import initializeFirebase from './config/firebase.js';
import {processInChunks} from './utils/batchOperations.js';
import dotenv from 'dotenv';
import {Timestamp} from "@google-cloud/firestore/build/src/index.js";

dotenv.config();

const updateFunction = (data) => {
    console.log(data.id)
    // 여기에 각 문서를 어떻게 업데이트할지 정의
    let interests = [];
    if (data.interestTag) {
        interests = Object.keys(data.interestTag);
    } else {
        let tags = Object.entries(data.interestTags)
        tags.sort((a, b) => {
            return b[1] - a[1];
        });
        interests = tags.slice(0, 3).map(tag => tag[0]);
    }

    return {
        ...data,
        interests: data.interests || interests,
        reviewCount: data.reviewCount || 0,
        // 필요한 필드 수정
    };
};

const main = async () => {
    try {
        const db = initializeFirebase();
        const collectionRef = db.collection('userStats');

        console.log('Starting batch operations...');
        const totalProcessed = await processInChunks(db, collectionRef, updateFunction);

        console.log(`Batch operations completed. Total documents processed: ${totalProcessed}`);
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1);
    }
};

main();