const Discord = require('discord.js');
const client = new Discord.Client();
const plugins = require('.');

client.on('ready', () => {
  console.log('ready!');
});

plugins.setup(client, {
  prefix: '!'
});

// ping
client.use(plugins.ping, {
  response: () => `Pong! (${Math.round(client.ping)}ms)`
});

// prompt
client.use(plugins.prompt);
const schemas = [{
  // Basic prompt for a String matching a specified RegExp
  name: 'username',
  description: 'What is your name?',
  before: value => value.trim().toUpperCase(),
  pattern: /^[A-Z ]+$/,
  message: 'The name can only contain letters'
}, {
  // Using a predefined format
  name: 'email',
  description: 'Now enter a valid email...',
  pattern: plugins.prompt.formats.email,
  message: 'That is not a valid email'
}, {
  // Using the `number` type
  name: 'age',
  description: 'Please enter an age (this value is casted to a Number)',
  type: 'number',
  pattern: value => !isNaN(value),
  message: 'Sorry, that is not a number...'
}, {
  // Using a list of values/patterns
  name: 'gender',
  description: 'Are you a `boy` or a `girl`?',
  pattern: [ 'boy', 'girl' ],
  message: 'I didn\'t quite get that'
}, {
  // Using the `array` type with a custom validator
  name: 'colors',
  description: 'Give me some colors (comma separated)',
  type: 'array',
  separator: ',',
  before: value => value.map(entry => entry.trim()).filter(entry => entry),
  validator: value => {
    if (!value.length) {
      return 'You didn\'t provide any colors';
    }

    for (const entry of value) {
      if (!plugins.prompt.formats.color(entry)) {
        return `\`${entry}\` is not a color`;
      }
    }

    return false;
  }
}];

client.on('message', message => {
  if (message.content === `${client.settings.prefix}prompt`) {
    const channel = message.author.dmChannel || message.channel;

    client.prompt(message.author, channel, schemas).then(result =>
      channel.send(
        `Name: ${result.name}\n` +
        `E-mail: ${result.email}\n` +
        `Age: ${result.age}\n` +
        `Colors: ${result.colors.join(', ')}`
      )
    ).catch(err =>
      channel.send(err.message) // Probably timed out
    );
  }
});

client.login(require('./exampleSettings').token);
