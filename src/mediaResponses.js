const fs = require('fs');
const path = require('path');

const streamFile = (file, request, response) => {
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') { response.writeHead(404); }
      return response.end(err);
    }

    let { range } = request.headers;
    if (!range) { range = 'bytes=0-'; }

    const positions = range.replace(/bytes=/, '').split('-');
    let start = parseInt(positions[0], 10);
    const end = positions[1] ? parseInt(positions[1], 10) : stats.size - 1;

    if (start > end) { start = end - 1; }

    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stats.size}`, // start-end/total
      'Accept-Ranges': 'bytes',
      'Content-Length': (end - start) + 1,
      'Content-Type': 'video/mp4',
    });

    const stream = fs.createReadStream(file, { start, end });
    stream.on('open', () => { stream.pipe(response); });
    stream.on('error', (streamErr) => { response.end(streamErr); });

    return stream;
  });
};

const getParty = (request, response) => {
  const file = path.resolve(__dirname, '../client/party.mp4');
  streamFile(file, request, response);
};

const getBling = (request, response) => {
  const file = path.resolve(__dirname, '../client/bling.mp3');
  streamFile(file, request, response);
};

const getBird = (request, response) => {
  const file = path.resolve(__dirname, '../client/bird.mp4');
  streamFile(file, request, response);
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
