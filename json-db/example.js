const Discord = require('discord.js')
const client = new Discord.Client()
const { JsonDB } = require('.')

const db = new JsonDB(500000) // Save every 5 seconds
db.connect(require('path').resolve(__dirname, './data/example.json'))
db.on('error', err => console.error(err))

client.on('message', async message => {
  if (message.content === 'my data') {
    message.channel.send(`\`\`\`\n${JSON.stringify(await db.get([message.author.id]), null, 2)}\n\`\`\``)
  }

  // Remember the last message from each person
  db.set([message.author.id], {
    message: message.content,
    timestamp: Date.now()
  })
})

client.on('ready', () => console.log('ready'))
client.login(require('../example-settings').token)
