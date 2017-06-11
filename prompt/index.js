const async = require('async');
const createSchemas = require('./createSchemas');
const formats = require('./formats');

module.exports = function prompt(client, gOptions) {
  gOptions = Object.assign({
    timeout: 60 * 1000
  }, gOptions);

  client.prompt = (user, channel, schemas, options) => {
    options = Object.assign({}, gOptions, options);
    schemas = createSchemas(schemas);

    // Query the user for a single response
    function getResponse(message, cb) {
      channel.send(message).catch(err => {
        timeoutId && clearTimeout(timeoutId);
        client.removeListener('message', responseListener);
        cb(err);
      });
      client.on('message', responseListener);

      const timeoutId = options.timeout !== -1 && setTimeout(() => {
        client.removeListener('message', responseListener);
        cb(new Error('Response timed out'));
      }, options.timeout);

      function responseListener(message) {
        if (message.author.id === user.id && message.channel.id === channel.id) {
          timeoutId && clearTimeout(timeoutId);
          client.removeListener('message', responseListener);
          cb(null, message.content);
        }
      }
    }

    // Repeatedly query the user to resolve a specific schema
    function resolveSchema(schema, cb) {
      function _resolveSchema(message) {
        getResponse(message, (err, response) => {
          if (err) {
            return cb(err);
          }
          response = schema.parse(response);

          let error = schema.validator(response);
          if (error) {
            _resolveSchema(error);
          }
          else {
            cb(null, {path: schema.path, response});
          }
        });
      }

      _resolveSchema(schema.description);
    }

    // Resolve all schemas
    return new Promise((resolve, reject) => {
      async.series(
        schemas.map(schema => resolveSchema.bind(null, schema)),
        (err, results) => {
          if (err) {
            return reject(err);
          }

          const aggregate = {};
          for (const result of results) {
            aggregate[result.path] = result.response;
          }
          resolve(aggregate);
        }
      );
    });
  };
};

module.exports.formats = formats;
