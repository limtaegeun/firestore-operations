const processBatch = async (db, docs, updateFunction) => {
    const batch = db.batch();
    let count = 0;

    try {
        docs.forEach((doc) => {
            const updatedData = updateFunction(doc.data(), doc.id);
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

const forEachInChunks = async (db, collectionRef, updateFunction, chunkSize = 500) => {
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

            for (const doc of snapshot.docs) {
                await updateFunction(doc.data(), doc.id);
                totalProcessed++;
            }

            lastDoc = snapshot.docs[snapshot.docs.length - 1];

            console.log(`Total processed so far: ${totalProcessed}`);
        }

        return totalProcessed;
    } catch (error) {
        console.error('Error in batch processing:', error);
        throw error;
    }
};

// 청크 단위로 참조 데이터를 가져오는 최적화된 방법
const processBatchWithChunkedReference = async (db, docs, referenceCollectionName) => {
    const batch = db.batch();
    let count = 0;

    try {
        // 현재 청크의 모든 docId 수집
        const docIds = docs.map(doc => doc.id);

        // 참조 문서들을 배치로 가져오기
        const referencePromises = docIds.map(id =>
            db.collection(referenceCollectionName).doc(id).get()
        );

        const referenceDocs = await Promise.all(referencePromises);

        // 참조 데이터 맵 생성
        const referenceMap = new Map();
        referenceDocs.forEach((refDoc, index) => {
            if (refDoc.exists) {
                referenceMap.set(docIds[index], refDoc.data());
            }
        });


        docs.forEach((doc) => {
            const data = doc.data();
            const referenceData = referenceMap.get(doc.id);

            let updatedData = { ...data };

            if (referenceData) {
                // todo: 여기에 참조 데이터를 사용한 업데이트 로직 구현
                if (referenceData.gender !== undefined) {
                    updatedData.gender = referenceData.gender;
                }
                updatedData.recommendWeight = 0;

                // if (referenceData.category && data.value) {
                //     const multiplier = referenceData.category === 'premium' ? 1.5 : 1.0;
                //     updatedData.adjustedValue = data.value * multiplier;
                // }
            }

            batch.update(doc.ref, updatedData);
            count++;
        });

        await batch.commit();
        console.log(`Successfully processed ${count} documents`);
        return count;
    } catch (error) {
        console.error('Error processing batch with reference:', error);
        throw error;
    }
};

// 청크 단위 참조 조회용 processInChunks
const processInChunksWithChunkedReference = async (db, collectionRef, referenceCollectionName, chunkSize = 500) => {
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

            const processedCount = await processBatchWithChunkedReference(
                db,
                snapshot.docs,
                referenceCollectionName
            );
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


export { processBatch, processInChunks, forEachInChunks, processInChunksWithChunkedReference };