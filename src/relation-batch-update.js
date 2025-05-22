import initializeFirebase from './config/firebase.js';
import {processBatch, processInChunks, processInChunksWithChunkedReference} from './utils/batchOperations.js';
import dotenv from 'dotenv';

dotenv.config();


const main = async () => {
    const db = initializeFirebase();
    const collectionRef = db.collection('userStats');

    await processInChunksWithChunkedReference(
        db,
        collectionRef,
        'profiles'  // 참조 컬렉션명
    );
};

main();