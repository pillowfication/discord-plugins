const Discord = require('discord.js')
const client = new Discord.Client()
const { DiscordVM } = require('.')

// Store instances of DiscordVMs in use, keyed by channel ID
const contexts = {}
function getContext (channelId) {
  let context = contexts[channelId]
  if (context) {
    return context
  } else {
    context = new DiscordVM()
    contexts[channelId] = context
    return context
  }
}

client.on('message', message => {
  if (message.content === '~/eval reset') {
    getContext(message.channel.id).reset()
    message.channel.send('Context reset.')
  } else if (message.content.startsWith('~/eval') /* && message.author.id === ID */) {
    const match = message.content.match(/```(?:js\b)?([\s\S]*)```/)
    if (match) {
      const context = getContext(message.channel.id)
      const code = match[1]
      const result = context.eval(code, { message }) // Note: `message` contains references to the entire client
      message.channel.send(result.prettyOutput.substring(0, 100), { code: 'js' })
    } else {
      message.channel.send('No code block found to eval.')
    }
  }
})

client.on('ready', () => console.log('ready'))
client.login(require('../example-settings').token)
