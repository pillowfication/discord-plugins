const fs = require('fs')

class JsonDB {
  connect (jsonPath) {
    return new Promise((resolve, reject) => {
      fs.open(jsonPath, 'r+', async (err, fd) => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.writeFile(jsonPath, '{}', err => {
              if (err) return reject(err)
              this.data = {}
              this.path = jsonPath
              resolve(this.data)
            })
          } else {
            reject(err)
          }
        } else {
          fs.readFile(fd, (err, raw) => {
            if (err) return reject(err)
            raw = raw.toString()
            try {
              this.data = raw ? JSON.parse(raw) : {}
              this.path = jsonPath
              resolve(this.data)
            } catch (err) {
              reject(err)
            }
          })
        }
      })
    })
  }

  async _getData () {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, (err, raw) => {
        if (err) return reject(err)
        raw = raw.toString()
        try {
          this.data = raw ? JSON.parse(raw) : {}
          resolve(this.data)
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  async get (path) {
    if (!Array.isArray(path)) {
      throw new Error('Invalid `path`')
    }

    let node = await this._getData()
    for (const edge of path) {
      if (node[edge] !== undefined) {
        node = node[edge]
      } else {
        return undefined
      }
    }
    return node
  }

  async set (path, value) {
    if (!Array.isArray(path) || path.length === 0) {
      throw new Error('Invalid `path`')
    }

    let node = await this._getData()
    const lastEdge = path.pop()
    for (const edge of path) {
      node = node[edge] || (node[edge] = {})
    }
    node[lastEdge] = value

    return new Promise((resolve, reject) => {
      fs.writeFile(this.path, JSON.stringify(this.data), err => {
        if (err) return reject(err)
        resolve(value)
      })
    })
  }
}

module.exports = JsonDB
