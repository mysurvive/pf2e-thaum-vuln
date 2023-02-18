'use strict';

var stream$1 = require('stream');
var rollup = require('rollup');

const build = async (options, stream) => {
    const bundle = await rollup.rollup(options);
    stream.emit('bundle', bundle);
    const { output } = await bundle.generate(options.output);
    for (const chunk of output) {
        if (chunk.type === 'asset') {
            stream.push(chunk.source);
        }
        else {
            stream.push(chunk.code);
            if (chunk.map) {
                stream.push(`\n//# sourceMappingURL=${chunk.map.toUrl()}`);
            }
        }
    }
    // signal end of write
    stream.push(null);
};
const stream = (options) => {
    const result = new stream$1.Readable({
        // stub _read() as it's not available on Readable stream, needed by gulp et al
        read: () => { }
    });
    build(options, result).catch((error) => {
        result.emit('error', error);
    });
    return result;
};

module.exports = stream;
