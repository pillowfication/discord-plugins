# eval

A class for executing JavaScript tailored for use in Discord.

See [`example.js`](example.js).

Note: The vm module is not a security mechanism. **Do not use it to run
untrusted code.** Understand the risks of using this module. See
[Node's VM module](https://nodejs.org/api/vm.html).

## class eval.DiscordVM([options])

**Arguments**

 - `options` *(Object)*: See below.

**Options**
```js
{
  name: 'Discord',
  timeout: 1 * 1000,
  globals: {}
}
```

 - `name` (*String*): Filename used for stack traces.
 - `timeout` (*Number*): Maximum time in milliseconds to execute code. This can
    be overridden in `DiscordVM.eval()` calls.
 - `globals` (*Object*): *Undocumented*

## discordVM.eval(code, [globals], [timeout])

**Arguments**

 - `code` (*String*): JavaScript code to execute.
 - `globals` (*Object*): Set any global variables prior to executing.
    **WARNING** - these variables will persist in the context.
 - `timeout` (*Number*): Maximum time in milliseconds to execute code.

**Returns**

 - (*Object*)
   - `code` (*String*): The code executed.
   - `output` (*Any*): The completion value of evaluating the given code.
   - `error` (*Object?*): This is NOT an Error but a plain object. It expresses
      an error thrown by execution or by timeout.
     - `message` (*String*): Description of the error.
     - `stack` (*Array<String>*): The stack trace filtered to only include
        those in the code executed. Could be an empty Array in the case of
        timeout.
     - `line` (*Number?*): Line number of the error. Could be `null` in the case
        of timeout.
     - `column` (*Number?*): Column number of the error. Could be `null` in the
        case of timeout.
   - `timeElapsed` (*Number*): Time elapsed in milliseconds during execution.
   - `prettyOutput` (*String*): To prettify `output` it is passed through
      `util.inspect()`. If there was an error, the offending line and stack
      trace is returned.

## discordVM.reset()

A new context is created for the DiscordVM clearing out all variables, local
and global.

## Examples

```js
const plugins = require('discord-plugins')
const { DiscordVM } = plugins.eval

// Initialize a context
const vm = new DiscordVM({ timeout: 1000 })

// Execute code
vm.eval('1 + 1')
/**/ {
/**/   code: '1 + 1',
/**/   output: 2,
/**/   error: null,
/**/   timeElapsed: 1,
/**/   prettyOutput: '2'
/**/ }

// Inject global variables
vm.eval('`Hello, ${name}`', { name: 'Pillow' })
/**/ {
/**/   code: '`Hello, ${name}`',
/**/   output: 'Hello, Pillow',
/**/   error: null,
/**/   timeElapsed: 1,
/**/   prettyOutput: '\'Hello, Pillow\''
/**/ }

// Variables are preserved
vm.eval('name').output
/**/ 'Pillow'

// Reset the context
vm.reset()
vm.eval('name').error
/**/ {
/**/   message: 'ReferenceError: name is not defined',
/**/   stack: [ '    at Discord:1:1' ],
/**/   line: 1,
/**/   column: 1
/**/ }

// Set timeouts
vm.eval('while (true) { }', null, 1000).error
/**/ {
/**/   message: 'Error: Script execution timed out.',
/**/   stack: [],
/**/   line: null,
/**/   column: null
/**/ }
```

Sample `prettyOutput`:

```js
const code =
  'foo()\n' +
  'function foo () { bar() }\n' +
  'function bar () { quux() }\n' +
  'function quux () { throw new Error(\'some error\') }'
const { prettyOutput } = vm.eval(code)
console.log(prettyOutput)
```

```
function quux () { throw new Error('some error') }
                         ^
Error: some error
    at quux (Discord:4:26)
    at bar (Discord:3:19)
    at foo (Discord:2:19)
    at Discord:1:1
```
