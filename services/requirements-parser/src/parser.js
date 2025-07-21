const nlp = require('compromise');

function parseRequirements(text) {
    const doc = nlp(text);

    const sentences = doc.sentences().out('array');

    const functional = sentences.filter(s => 
        /must|should|allow|can|enable|permit/i.test(s)
    );

    const nonFunctional = sentences.filter(s =>
        /scalable|responsive|secure|available|fast|uptime|latency|performance/i.test(s)
    );

    const entities = doc.nouns().out('array');

    const constraints = sentences.filter(s =>
        /at least|no more than|less than|within|under|not exceed/i.test(s)
    );

    return {
        functional,
        nonFunctional,
        entities: Array.from(new Set(entities)),
        constraints
    }
}

module.exports = {parseRequirements};

