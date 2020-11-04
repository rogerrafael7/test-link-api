module.exports = class AbstractService {
  constructor (req, res, options = {}) {
    this.request = req
    this.response = res
    this.options = options
  }
}
