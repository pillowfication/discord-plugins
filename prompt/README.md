# prompt

Adds the capability to prompt the user for a series of answers. Care should be
added to make sure that at most only one prompt session is active at any time
in a single channel.

See [`example.js`](example.js).

## Options

**Defaults**
```js
{
  exit: undefined,
  timeout: 60 * 1000
}
```

 - `exit` (*Array|Function|RegExp|String|undefined*): A condition to terminate
    a prompt session, or `undefined` for none. See
    [`create-matcher.js`](../utils/create-matcher.js).
 - `timeout` *(Number)*: If no responses are made within `timeout`ms, then
    prompt exits with an error. A nonpositive `timeout` indicates no timeout.

## async prompt(channel, user, schemas, [options])

**Arguments**

 - `user` *(User)*: The person to query. Prompt will ignore other users' inputs.
 - `channel` *(TextBasedChannel)*: The channel to send queries and listen for
    responses.
 - `schemas` *(Array|Object|String)*: See below.
 - `options` *(Object)*: See above.

**Returns**

 - *(Promise)*: Resolves with an object containing all queried values. Throws if
    a query timed out.

## Schemas

A schema represents how to resolve a query. The steps of resolution are:

 1. Send user `description`.
 2. Wait for a *response*.
 3. (If *response* triggers the exit condition or no *response* was made before
    `timeout`, throw)
 4. Parse *response* by
    - If `type === 'string'`, use `String(response)`
    - If `type === 'number'`, use `Number(response)`
    - If `type === 'integer'`, use `parseInt(response)`
    - If `type === 'array'`, use `String(response).split(separator)`
 5. Pass parsed *response* through `before` to get *value*.
 6. Validate *value* and get the *error* by
    - If `validator` is defined, let *error* be `validator(value)`
    - Else, let *error* be `pattern(response) ? false : message`
 7. If the *error* is not `false`, send the user *error* and go to 2.
 8. Resolve with *value*.

**Defaults**
```js
{
  name: undefined,
  description: schema.name,
  type: 'string',
  separator: ',',
  before: value => typeof value === 'string' ? value.trim() : value,
  pattern: () => true,
  message: 'Validation failed',
  validator: undefined
}
```

 - `name` *(String)*: The name of the variable so that the value is accessible
    through `results[name]`.
 - `description` *(StringResolvable)*: The initial message to send to query the
    user.
 - `type` *(String)*: One of `'string'`, `'number'`, `'integer'`, `'array'`. For
    custom types, use the `before` option.
 - `separator` *(String|RegExp)*: If `type` is `'array'` the response is split
    using `separator`.
 - `before` *(Function)*: After the response is parsed, it is passed through
    this function before validation.
 - `pattern` *(Array|Function|RegExp|String)*: The pattern to use for
    validation. See [`create-matcher.js`](../utils/create-matcher.js).
 - `message` *(StringResolvable)*: The message to send to requery the user if
    validation fails.
 - `validator` *(Function)*: Custom validator function. Overrides both `pattern`
    and `message`. This function must return falsy if validation passes, or a
    StringResolvable to use as `message` if validation fails.

## Examples

```js
const plugins = require('discord-plugins')
client.prompt = plugins.prompt

// Basic functionality
let schemas = [{
  name: 'name',
  type: 'string',
  description: 'Please enter a name:',
  pattern: /^[a-z ]+$/i,
  message: 'Name can only contain letters. Try again:'
}, {
  name: 'age',
  type: 'integer',
  description: 'Now enter an age:',
  pattern: age => age > 0,
  message: 'That was not a valid age. Try again:'
}]

client.prompt(channel, user, schemas)
  .then(results => {
    console.log(results.name)
    console.log(results.age)
  })
  .catch(err => {
    console.log(err.message)
  })

// Prompt for numbers
schemas = {
  name: 'answer',
  type: 'number',
  pattern: value => !isNaN(value)
}

// Prompt for specific values
schemas = {
  name: 'choice',
  type: 'integer',
  description: 'Pick a number (1 - 4)',
  pattern: [ 1, 2, 3, 4 ]
}

// Prompt for an array, using a custom validator
schemas = {
  name: 'colors',
  type: 'array',
  separator: ',',
  description: 'Give me some colors (comma separated):',

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
}
```
