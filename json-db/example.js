const Discord = require('discord.js')
const client = new Discord.Client()
const { JsonDB } = require('.')

const db = new JsonDB()
db.connect(require('path').resolve(__dirname, './data/example.json'))
  .then(() => console.log(`json-db connected to ${db.path}`))
  .catch(() => console.error('error initializing json-db'))

client.on('message', async message => {
  if (message.content === 'my data') {
    message.channel.send(`\`\`\`\n${JSON.stringify(await db.get([ message.author.id ]), null, 2)}\n\`\`\``)
  }

  // Remember the last message from each person
  db.set([ message.author.id ], {
    message: message.content,
    timestamp: Date.now()
  })
})

client.on('ready', () => console.log('ready'))
client.login(require('../example-settings').token)
