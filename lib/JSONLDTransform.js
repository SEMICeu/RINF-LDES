import { Transform } from "stream";
import jsonld from 'jsonld';

export const JSONLDTransform = context => {
    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,

        async transform(member, encoding, done) {
            // Compact JSON-LD object
            const compacted = await jsonld.compact(member.value, context);
            // Remove @context
            delete compacted['@context'];
            // Convert xsd:dateTime props to proper dates
            handleDates(compacted, context);
            this.push(compacted);
            done();
        },
    });
}

function handleDates(obj, context) {
    for (const prop of Object.keys(context)) {
        if (context[prop]['@type'] === 'xsd:dateTime') {
            obj[prop] = new Date(obj[prop]);
        }
    }
}