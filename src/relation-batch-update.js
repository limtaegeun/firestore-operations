import initializeFirebase from './config/firebase.js';
import {processBatch, processInChunks} from './utils/batchOperations.js';
import dotenv from 'dotenv';

dotenv.config();

async function update(ref) {
    let lastDoc = null;
    let totalProcessed = 0;

    try {
        while (true) {
            let query = collectionRef.limit(chunkSize);
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const snapshot = await query.get();
            if (snapshot.empty) break;

            const processedCount = await processBatch(db, snapshot.docs, updateFunction);
            totalProcessed += processedCount;
            lastDoc = snapshot.docs[snapshot.docs.length - 1];

            console.log(`Total processed so far: ${totalProcessed}`);
        }

        return totalProcessed;
    } catch (error) {
        console.error('Error in batch processing:', error);
        throw error;
    }
}

const main = async () => {
    try {
        const db = initializeFirebase();
        const collectionRef = db.collection('events');

        console.log('Starting batch operations...');
        update(collectionRef);

        console.log(`Batch operations completed. Total documents processed: ${totalProcessed}`);
    } catch (error) {
        console.error('Error in main process:', error);
        process.exit(1);
    }
};

main();