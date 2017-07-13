const createSchemas = require('./create-schemas')

const defaultOptions = {
  timeout: 60 * 1000
}

function getResponse (env, timeout) {
  const { client, channel, user } = env

  return new Promise((resolve, reject) => {
    let timeoutId

    // Resolve with the first response from the user
    function responseListener (message) {
      if (message.channel.id === channel.id && message.author.id === user.id) {
        timeoutId && clearTimeout(timeoutId)
        client.removeListener('message', responseListener)
        resolve(message.content)
      }
    }
    client.on('message', responseListener)

    // If no response is made before `timeout`, reject
    timeoutId = timeout > 0 && setTimeout(() => {
      client.removeListener('message', responseListener)
      reject(new Error('Response timed out'))
    }, timeout)
  })
}

async function resolveSchema (env, schema, timeout) {
  const { channel } = env
  let resolved = false
  let resolution

  // Send the initial message
  await channel.send(schema.message)

  while (!resolved) {
    // Wait for a response
    const response = await getResponse(env, timeout)
    resolution = schema.parse(response)

    // If the response did not validate, retry
    const errorMessage = schema.validate(resolution)
    if (errorMessage) {
      await channel.send(errorMessage)
    } else {
      resolved = true
    }
  }

  return {
    path: schema.path,
    resolution
  }
}

async function prompt (channel, user, schemas, options) {
  options = Object.assign({}, defaultOptions, options)
  const { timeout } = options
  const env = { client: this, channel, user }
  const aggregate = {}

  // Resolve all schemas into `aggregate`
  for (const schema of createSchemas(schemas)) {
    const { path, resolution } = await resolveSchema(env, schema, timeout)
    aggregate[path] = resolution
  }

  return aggregate
}

module.exports = prompt
