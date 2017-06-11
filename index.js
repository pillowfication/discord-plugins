module.exports = {
  setup(client, options) {
    client.settings = Object.assign({
      prefix: '!'
    }, options);

    client.use = function use(plugin, options) {
      plugin(client, options);
    };
  },

  ping: require('./ping'),
  prompt: require('./prompt')
};
