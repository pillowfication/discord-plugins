const Discord = require('discord.js')
const client = new Discord.Client()
const prompt = require('.')

client.prompt = prompt

const schemas = [{
  name: 'name',
  type: 'string',
  description: 'Please enter your name:',
  pattern: /^[a-z ]+$/i,
  message: 'Name can only contain letters. Try again:'
}, {
  name: 'age',
  type: 'integer',
  description: 'How old are you?',
  pattern: age => age > 0,
  message: 'That was not a valid age. Try again:'
}, {
  name: 'gender',
  type: 'string',
  description: 'Are you a `boy` or a `girl`?',
  pattern: [ 'boy', 'girl' ],
  message: 'I didn\'t quite get that. `boy` or `girl`?'
}, {
  name: 'colors',
  type: 'array',
  separator: ',',
  description: 'Give me some of your favorite colors (comma separated):',

  // Trim entries and remove empty ones
  before: value => value.map(entry => entry.trim()).filter(entry => entry),

  // Make sure all entries are valid colors
  validator: value => {
    if (value.length === 0) {
      return 'You didn\'t provide any colors! Try again:'
    }

    let colorRegex = /^#[a-z0-9]{6}|#[a-z0-9]{3}|(?:rgb\(\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*\))aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow$/i
    for (const entry of value) {
      if (!colorRegex.test(entry)) {
        return `Sorry, \`${entry}\` is not a color. Try again:`
      }
    }

    return false
  }
}]

// This is to ensure that multiple prompts will not occur at once
const promptChannels = {}

client.on('message', message => {
  if (message.content === '~/prompt') {
    const channel = message.channel

    if (promptChannels[channel.id]) {
      return
    } else {
      promptChannels[channel.id] = true
    }

    client.prompt(channel, message.author, schemas, { exit: 'EXIT', timeout: 60 * 1000 })
      .then(result => channel.send(
        'You said...\n\n' +
        `- Name: \`${result.name}\`\n` +
        `- Age: \`${result.age}\`\n` +
        `- Gender: \`${result.gender}\`\n` +
        `- Colors: ${result.colors.map(color => `\`${color}\``).join(', ')}`
      ))
      .catch(err => channel.send(
        err.message // Probably timed out or exit condition reached
      ))
      .then(() => {
        delete promptChannels[channel.id]
      })
  }
})

client.on('ready', () => console.log('ready'))
client.login(require('../example-settings').token)
