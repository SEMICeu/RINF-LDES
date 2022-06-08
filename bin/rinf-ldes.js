import { Server } from '../lib/WebManager.js';
import MongoManager from '../lib/MongoManager.js';
import RMLManager from '../lib/RMLManager.js';
import { JSONLDTransform } from '../lib/JSONLDTransform.js';
import StreamArray from 'stream-json/streamers/StreamArray.js';
import fs from 'fs';
import { CronJob } from 'cron';

async function run() {
    // Load config params
    const config = JSON.parse(fs.readFileSync('config/config.json', 'utf-8'));
    // Create required folders
    initDirs();
    // Setup conection to MongoDB
    const mongoClient = await MongoManager.getMongoClient('mongodb://localhost:27017');
    const db = mongoClient.db('rinf_db');

    // Start Web server
    const server = Server({ db, config });
    server.listen('8080', '0.0.0.0', (err, address) => {
        if (err) {
            server.log.error(err)
            process.exit(1)
        }
        console.log(`server listening on ${address}`);
    });

    // Run a full process for initializing all countries
    await processSources({
        db,
        sources: config.countries,
        context: config['@context']
    });

    // Schedule recurrent processing job
    new CronJob({
        //cronTime: '0 0 3 * * *',
        cronTime: '*/15 * * * * *',
        onTick: () => {
            processSources({
                db,
                //sources: config.countries,
                sources: ['BE'],
                context: config['@context']
            });
        },
        start: true
    });

    //mongoClient.close(true);
}


async function processSources({ db, sources, context }) {
    // Start RML mapping process for all sources
    for await (const mappedFile of RMLManager.mapRINFSources(sources)) {
        const t0 = new Date();
        // Create a time-series collection per country
        const rinfLdes = await MongoManager.getTimeSeries(`${mappedFile.country}_sol_tracks_ldes`, db);

        // Stream-read mapped JSON-LD file and adjust it as required by MongoDB Time Series collections
        const jsonldStream = fs.createReadStream(mappedFile.path, 'utf-8')
            .pipe(StreamArray.withParser())
            .pipe(JSONLDTransform(context));

        // Create Bulk ingestion process for MongoDB
        const bulk = rinfLdes.initializeUnorderedBulkOp();
        // Counter of materialized members
        let counter = 0;

        for await (const member of jsonldStream) {
            counter++;
            bulk.insert(member);
        }

        // Execute bulk insert only if there were new materialized members
        if (counter > 0) await bulk.execute();

        console.log(`Processed and ingested ${counter} members for ${mappedFile.country} in ${new Date() - t0} ms`);
    }
}

function initDirs() {
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }

    if (!fs.existsSync('data/RINF-XML')) {
        fs.mkdirSync('data/RINF-XML');
    }

    if (!fs.existsSync('output')) {
        fs.mkdirSync('output');
    }

    if (!fs.existsSync('ldes-state')) {
        fs.mkdirSync('ldes-state');
    }
}

run();