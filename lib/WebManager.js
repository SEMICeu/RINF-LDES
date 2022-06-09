import fastify from 'fastify';
import MongoManager from './MongoManager.js';


async function ldes(fastify, { db, config }) {

    fastify.get(`/rinf-ldes/:country`, async (request, reply) => {
        const country = request.params.country;
        const page = request.query.page;
        const fragmentSize = config.fragmentSize;

        reply.header('Access-Control-Allow-Origin', '*');

        if (!page) {
            try {
                const lastPageIndex = await MongoManager.getLastPageIndex({
                    country,
                    fragmentSize,
                    db
                });
                reply.code(303).redirect(`/rinf-ldes/${country}?page=${lastPageIndex}`);
                return;
            } catch(err) {
                reply.code(404).send('Not Found');
                return;
            }
        } else {
            try {
                const { data, lastPageIndex } = await MongoManager.getPageData({
                    country,
                    fragmentSize,
                    page,
                    db
                });
                if (data.length > 0) {
                    reply.header('content-type', 'application/ld+json; charset=UTF-8');
                    return getLDESMetadata({
                        country,
                        page: parseInt(page),
                        lastPageIndex: parseInt(lastPageIndex),
                        members: data,
                        context: config['@context'],
                        baseURI: config.baseURI
                    });
                } else {
                    reply.code(404).send('Not Found');
                    return;
                }
            } catch (err) {
                console.error(err);
                reply.code(404).send('Not Found');
                return;
            }
        }
    });
}

function getLDESMetadata({ country, page, lastPageIndex, members, context, baseURI }) {
    // Define relations based on page position and last page
    const relations = [];
    if (page > 0) {
        // Previous page
        relations.push({
            "@id": `${baseURI}/rinf-ldes/${country}?page=${page - 1}`,
            "@type": "tree:LessThanRelation",
            "tree:path": "dct:modified",
            "tree:value": members[0]["dct:modified"]
        });
    }
    if (page < lastPageIndex) {
        // Next page
        relations.push({
            "@id": `${baseURI}/rinf-ldes/${country}?page=${page + 1}`,
            "@type": "tree:GreaterThanRelation",
            "tree:path": "dct:modified",
            "tree:value": members[members.length - 1]["dct:modified"]
        });
    }

    return {
        "@context": context,
        "@id": `${baseURI}/rinf-ldes/${country}?page=${page}`,
        "@type": "tree:Node",
        "ldesInfo": {
            "@id": `${baseURI}/rinf-ldes/${country}`,
            "@type": "ldes:EventStream",
            "tree:shape": `${baseURI}/rinf-ldes/shape`,
            "ldes:timestampPath": { "@id": "dct:modified" },
            "ldes:versionOfPath": { "@id": "dct:isVersionOf" }
        },
        "tree:relation": relations,
        "members": members
    }
}

export function Server(config) {
    const server = fastify({
        logger: "debug",
    });

    server.register(ldes, config);

    return server;
}