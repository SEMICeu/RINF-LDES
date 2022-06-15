import { MongoClient } from 'mongodb';

async function getMongoClient(address) {
    return await new MongoClient(address).connect();
}

async function getTimeSeries(name, db) {
    // Check if collection exists already, create it otherwise
    if (!(await db.listCollections().toArray()).find(coll => coll.name === name)) {
        const ts = await db.createCollection(name, {
            timeseries: {
                timeField: 'dct:modified',
                metaField: 'dct:isVersionOf',
                granularity: 'hours'
            }
        });
        // Create temporal index
        await ts.createIndex({ 'dct:modified': 1 });
        return ts;
    } else {
        return await db.collection(name);
    }
}

async function getLastPageIndex({ country, fragmentSize, db }) {
    const ts = await db.collection(`${country}_sol_tracks_ldes`);
    const count = await ts.countDocuments();

    if(count % fragmentSize === 0) {
        return Math.floor(count / fragmentSize) - 1;
    } else {
        return Math.floor(count / fragmentSize);
    }
}

async function getPageData({ country, fragmentSize, page, db }) {
    const ts = await db.collection(`${country}_sol_tracks_ldes`);
    const count = await ts.countDocuments();
    const data = (await ts.find()
        .hint('dct:modified_1')
        .project({ _id: 0 })
        .skip(page * fragmentSize)
        .limit(fragmentSize).toArray());

    return {
        data,
        lastPageIndex: Math.floor(count / fragmentSize)
    };
}

export default {
    getMongoClient,
    getTimeSeries,
    getLastPageIndex,
    getPageData
}