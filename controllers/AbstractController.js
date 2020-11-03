module.exports = class AbstractController {
  constructor (req, res, options = {}) {
    this.request = req
    this.response = res
    this.options = options
  }
}
