const util = require('util')
const vm = require('vm')

const defaultOptions = {
  name: 'Discord',
  timeout: 1 * 1000
}

class DiscordVM {
  constructor (globals = {}, options) {
    options = Object.assign({}, defaultOptions, options)
    this.name = options.name
    this.timeout = options.timeout
    this.globals = globals
    this.reset()
  }

  reset () {
    this.context = vm.createContext(Object.assign({}, this.globals))
  }

  eval (code, globals, timeout = this.timeout) {
    // Reassign global variables
    Object.assign(this.context, globals)

    // Execute the code and capture the output or error
    let output
    let error = null

    try {
      output = vm.runInContext(code, this.context, {
        filename: this.name,
        lineOffset: 0,
        columnOffset: 0,
        displayErrors: true,
        timeout
      })
    } catch (err) {
      const vmStackRegex = new RegExp(`${this.name}:([0-9]+):([0-9]+)`)
      const rawStack = err.stack.split('\n')

      const message = rawStack[0]
      const stack = rawStack.filter(desc => vmStackRegex.test(desc))

      let line = null
      let column = null
      const match = stack[0] && stack[0].match(vmStackRegex)
      if (match) {
        line = +match[1]
        column = +match[2]
      }

      error = { message, stack, line, column }
    }

    // Prettify the result of execution
    let prettyOutput
    if (error) {
      prettyOutput = error.message + '\n' + error.stack.join('\n')
      if (error.line && error.column) {
        prettyOutput =
          code.split('\n')[error.line - 1] + '\n' +
          ' '.repeat(error.column - 1) + '^\n' +
          prettyOutput
      }
    } else {
      prettyOutput = util.inspect(output, { depth: null })
    }

    return { code, output, error, prettyOutput }
  }
}

module.exports = DiscordVM
