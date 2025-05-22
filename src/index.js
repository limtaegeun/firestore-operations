import initializeFirebase from './config/firebase.js';
import {processInChunks} from './utils/batchOperations.js';
import dotenv from 'dotenv';

dotenv.config();

const updateFunction = (data) => {
    console.log(data.id)
    // 여기에 각 문서를 어떻게 업데이트할지 정의
    return {
        ...data,
        recommendWeight: 0
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