const fs = require('fs')
const EventEmitter = require('events')

class JsonDB extends EventEmitter {
  constructor (saveInterval = 10 * 60 * 1000) {
    super()
    this.saveInterval = saveInterval
    this.saveTimeout = null

    ;['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach(eventType => {
      process.on(eventType, () => {
        if (this.cache) {
          fs.writeFileSync(this.path, JSON.stringify(this.cache))
        }
        if (eventType !== 'exit') {
          process.exit()
        }
      })
    })
  }

  connect (jsonPath) {
    fs.open(jsonPath, 'r+', (err, fd) => {
      if (err) {
        switch (err.code) {
          case 'ENOENT':
            try {
              fs.writeFileSync(jsonPath, '{}')
              this.cache = {}
              this.path = jsonPath
              this.emit('ready', this.cache)
            } catch (err) {
              this.emit('error', err)
            }
            break
          default:
            this.emit('error', err)
        }
      } else {
        try {
          const buffer = fs.readFileSync(fd)
          this.cache = JSON.parse(buffer.toString())
          this.path = jsonPath
          this.emit('ready', this.cache)
        } catch (err) {
          this.emit('error', err)
        }
      }
    })
  }

  _get (path) {
    let node = this.cache
    for (const edge of path) {
      if (node === undefined) {
        return undefined
      } else {
        node = node[edge]
      }
    }
    return node
  }

  _set (path, value) {
    let node = this.cache
    const lastEdge = path.pop()
    for (const edge of path) {
      node = node[edge] === undefined ? (node[edge] = {}) : node[edge]
    }
    node[lastEdge] = value
  }

  get (path) {
    return this._get(Array.isArray(path) ? path : [path])
  }

  set (path, value) {
    this._set(Array.isArray(path) ? path : [path], value)
    if (!this.saveTimeout) {
      this.saveTimeout = setTimeout(() => { this.save() }, this.saveInterval)
    }
  }

  save () {
    const { cache } = this
    this.saveTimeout = null
    if (cache) {
      fs.writeFile(this.path, JSON.stringify(cache), err => {
        if (err) {
          this.emit('error', err)
        } else {
          this.emit('save', cache)
        }
      })
    }
  }
}

module.exports = JsonDB
