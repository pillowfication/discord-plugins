const util = require('util')
const vm = require('vm')

const defaultOptions = {
  name: 'Discord',
  timeout: 1 * 1000,
  globals: {}
}

class DiscordVM {
  constructor (options) {
    options = Object.assign({}, defaultOptions, options)
    this.name = options.name
    this.timeout = options.timeout
    this.globals = options.globals
    this.reset()
  }

  reset () {
    this.context = vm.createContext(Object.assign({}, this.globals))
  }

  eval (code, globals, timeout = this.timeout) {
    const startTime = Date.now()

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
      const vmErrorRegex = /^\s*([A-Za-z]*Error: .*)$/
      const vmStackRegex = new RegExp(`${this.name}:([0-9]+):([0-9]+)`)
      const rawStack = err.stack.split('\n')
      const errorLines = rawStack.filter(line => vmErrorRegex.test(line))
      const stackLines = rawStack.filter(line => vmStackRegex.test(line))

      const message = errorLines[0] && errorLines[0].match(vmErrorRegex)[1]

      let line = null
      let column = null
      if (stackLines[0]) {
        const match = stackLines[0].match(vmStackRegex)
        line = +match[1]
        column = +match[2]
      }

      error = {
        message: message || 'UnknownError: Error could not be determined',
        stack: stackLines,
        line,
        column
      }
    }

    // Prettify the result of execution
    let prettyOutput
    if (error) {
      prettyOutput = error.stack.length
        ? error.message + '\n' + error.stack.join('\n')
        : error.message
      if (error.line && error.column) {
        prettyOutput =
          code.split('\n')[error.line - 1] + '\n' +
          ' '.repeat(error.column - 1) + '^\n' +
          prettyOutput
      }
    } else {
      prettyOutput = util.inspect(output, { depth: null })
    }

    const timeElapsed = Date.now() - startTime
    return { code, output, error, timeElapsed, prettyOutput }
  }
}

module.exports = DiscordVM
