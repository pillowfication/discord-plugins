const createMatcher = require('../utils/create-matcher')

class Schema {
  constructor (options) {
    const parse = createParser(options.type, options.separator)
    const before = options.before
    const pattern = !options.validator && createMatcher(options.pattern)
    const message = options.message

    this.path = options.name
    this.message = options.description
    this.parse = before ? value => before(parse(value)) : parse
    this.validate = options.validator || (value => !pattern(value) && message)
  }
}

function createParser (type, separator) {
  switch (type) {
    case 'string':
      return String
    case 'number':
      return Number
    case 'integer':
      return parseInt
    case 'array':
      return value => String(value).split(separator)
    default:
      return value => value
  }
}

function createSchemas (schemas) {
  if (schemas && schemas.__no_parse) {
    return schemas
  }

  schemas = Array.isArray(schemas) ? schemas : [ schemas ]
  schemas = schemas.map(schema => {
    if (typeof schema !== 'object') {
      schema = { name: schema }
    }

    return new Schema(Object.assign({
      name: undefined,
      description: schema.name,
      type: 'string',
      separator: ',',
      before: value => typeof value === 'string' ? value.trim() : value,
      pattern: () => true,
      message: 'Validation failed',
      validator: undefined
    }, schema))
  })

  schemas.__no_parse = true
  return schemas
}

module.exports = createSchemas
