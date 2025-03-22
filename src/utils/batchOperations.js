const processBatch = async (db, docs, updateFunction) => {
    const batch = db.batch();
    let count = 0;

    try {
        docs.forEach((doc) => {
            const updatedData = updateFunction(doc.data());
            batch.update(doc.ref, updatedData);
            count++;
        });

        await batch.commit();
        console.log(`Successfully processed ${count} documents`);
        return count;
    } catch (error) {
        console.error('Error processing batch:', error);
        throw error;
    }
};

const processInChunks = async (db, collectionRef, updateFunction, chunkSize = 500) => {
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
};

export { processBatch, processInChunks };