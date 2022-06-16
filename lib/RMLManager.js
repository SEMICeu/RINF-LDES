import { request } from 'undici';
import formUrlEncoded from 'form-urlencoded';
import contentDisposition from 'content-disposition';
import path from 'path';
import fs from 'fs';
import unzipper from 'unzipper';
import util from 'util';
import { exec } from 'child_process';
import del from 'del';

const asyncExec = util.promisify(exec);

async function* mapRINFSources(countries) {
    // Start by getting an auth token for the RINF API
    const token = await getRINFAuthToken();

    // Fetch latest RINF XML sources for each country
    for await (const country of countries) {
        try {
            console.log('*********************************************');
            console.log(`Fetching XML source for ${country}...`);
            const source = await getRINFXmlSource(country, token);
            // Measure mapping time
            const t0 = new Date();
            // Make sure the output folder exists
            if (!fs.existsSync(path.resolve(`output/${country}`))) {
                fs.mkdirSync(path.resolve(`output/${country}`));
            }
            // Make copy of RML mapping template
            const mappings = `mappings/${country}-SoLTracks-LDES.rml.ttl`
            fs.copyFileSync('mappings/SoLTracks-LDES.rml.ttl', mappings);

            // Set RML mapping variables
            const outputPath = path.resolve(`output/${country}/sol-tracks.json`);
            await asyncExec(`sed -i 's/\${RINF_SOURCE}/${source.replace(/\//g, '\\/')}/g; \
                    s/\${OUTPUT_FILE_PATH}/${outputPath.replace(/\//g, '\\/')}/g; \
                    s/\${COUNTRY}/${country}/g' ${mappings}`);

            console.log(`Executing RML mappings for ${country}'s data...`);
            // Execute RML mappings
            await asyncExec(`java -jar rmlmapper-5.0.0.jar -s JSON-LD -m ${mappings}`);
            console.log(`RML mapping process for ${country} completed in ${new Date() - t0} ms`);
            // Delete processed mapping file
            await del([mappings], { force: true });

            yield {
                path: outputPath,
                country: country
            };
        } catch (err) {
            if (err) {
                console.error(err);
                console.error('Happened processing: ' + country);
            } else {
                console.log(`No data found for ${country}`);
            }
        }
    }
}

async function getRINFAuthToken() {
    // TODO: Put these params as repo secrets
    const res = await request('https://rinf.era.europa.eu/api/token', {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: formUrlEncoded({
            "grant_type": "password",
            "username": "julianandres.rojasmelendez@ugent.be",
            "password": "Jr1061698729"
        })
    });

    return (await res.body.json());
}

function getRINFXmlSource(country, token) {
    return new Promise(async (resolve, reject) => {
        try {
            // Condition only for demo purposes. This needs to be removed
            /*if(country === 'BE') {
                const filepath = path.resolve(`data/dummy-data/BEDataset-dummy-${Math.floor(Math.random() * 6)}.xml`);
                console.log(`Processing dummy file: ${filepath}`);
                resolve(filepath);
            }*/
            // Create country folder if it does not exist yet
            if (!fs.existsSync(path.resolve(`data/RINF-XML/${country}`))) {
                fs.mkdirSync(path.resolve(`data/RINF-XML/${country}`));
            }

            const res = await request(`https://rinf.era.europa.eu/api/XmlDatasets/${country}`, {
                method: "GET",
                headers: { authorization: `${token.token_type} ${token.access_token}` }
            });

            if (res.headers['content-disposition']) {
                const filename = contentDisposition.parse(res.headers['content-disposition'])
                    .parameters.filename.replace(/\s/g, '').split('.')[0];
                const filepath = path.resolve(`data/RINF-XML/${country}/${filename}.xml`);

                if (!fs.existsSync(filepath)) {
                    console.log(`Downloading new RINF source: ${filename}.zip`);
                    res.body.pipe(unzipper.ParseOne())
                        .pipe(fs.createWriteStream(path.resolve(filepath), 'utf-8'))
                        .on('finish', () => { resolve(filepath) });
                } else {
                    resolve(filepath);
                }
            } else {
                reject();
            }
        } catch (err) {
            reject(err);
        }
    });
}

export default {
    mapRINFSources
};