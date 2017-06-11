const createMatcher = require('../utils/createMatcher');

module.exports = function ping(client, options) {
  options = Object.assign({
    match: `${client.settings.prefix}ping`,
    response: 'pong',
    onError: err => Promise.reject(err)
  }, options);

  const pattern = createMatcher(options.match);
  const match = message => pattern(message.content);
  const response = typeof options.response === 'function'
    ? options.response
    : () => String(options.response);
  const onError = options.onError;

  client.on('message', message => {
    if (match(message)) {
      const _response = response(message);
      _response && message.channel.send(_response)
        .catch(onError);
    }
  });
};
