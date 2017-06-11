# prompt

Adds the capability to prompt the user for a series of answers.

## Options

**Defaults:**
```js
{
  timeout: 60 * 1000
}
```

 - `timeout` *(Number)*: If no responses are made within `timeout`ms, then
    prompt exits with an error.

Options defined here can be overridden with options supplied to each
`client.prompt()` call.

## client.prompt(user, channel, schemas, options)

**Arguments**

 - `user` *(User)*: The person to query. Prompt will ignore other users' inputs.
 - `channel` *(TextBasedChannel)*: The channel to send queries and listen for
    responses.
 - `schemas` *(Array|Object|String)*: See below.
 - `options` *(Object)*: See above.

**Returns**

 - *(Promise)*: Resolves with an object containing all queried values. Throws if
    a query timed out.

## client.prompt.formats

An object of predefined formats.

 - `'email'`
 - `'ip-address'`
 - `'ipv6'`
 - `'date-time'`
 - `'date'`
 - `'time'`
 - `'color'`
 - `'host-name'`
 - `'utc-millisec'`
 - `'regex'`

## Schemas

A schema represents how to resolve a query. The steps of resolution are:

 1. Send user `description`.
 2. Wait for a *response*.
 3. Parse *response* by
    - If `type === 'string'`, use `String(response)`
    - If `type === 'number'`, use `Number(response)`
    - If `type === 'integer'`, use `parseInt(response, 10)`
    - If `type === 'array'`, use `response.split(separator)`
 4. Pass parsed *response* through `before` to get *value*.
 5. Validate *value* and get the *error* by
    - If `validator` is defined, let *error* be `validator(value)`
    - Else, let *error* be `pattern(response) ? false : message`
 6. If the *error* is not `false`, send the user *error* and go to 2.
 7. Resolve with *value*.

**Defaults:**
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
    validation. See `utils/createMatcher.js`. Predefined formats also available
    in `prompt.formats`.
 - `message` *(StringResolvable)*: The message to send the user if validation
    fails, to requery.
 - `validator` *(Function)*: Custom validator function. Overrides both `pattern`
    and `message`. This function must return `false` if validation passes, or a
    String to use as `message` if validation fails.

## Examples

```js
client.use(plugins.prompt);

// Basic functionality
client.prompt(user, channel, 'username')
  .then(results => { console.log(results.username); })
  .catch(err => { console.log(err.message); })

// Better example
client.prompt(user, channel, {
  name: 'username',
  description: 'Please enter a username:',
  pattern: /[A-Z]+/i,
  message: 'Username can only contain letters. Try again:'
});

// Prompt for multiple values
client.prompt(user, channel, [
  {
    name: 'username',
    pattern: /[A-Z]+/i,
  },
  {
    name: 'email',
    pattern: plugins.prompt.formats.email
  }
]).then(results => {
  console.log(`Username: ${results.username}`);
  console.log(`Email: ${results.email}`);
});

// Prompt for numbers
client.prompt(user, channel, {
  name: 'num',
  type: 'number',
  pattern: value => !isNaN(value)
});

// Prompt for specific values
client.prompt(user, channel, {
  name: 'choice',
  description: 'Pick a number (1 - 4):',
  type: 'integer',
  pattern: [1, 2, 3, 4]
});

// Prompt for an array, using a custom validator
client.prompt(user, channel, {
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
});
```
