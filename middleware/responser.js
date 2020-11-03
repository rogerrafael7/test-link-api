module.exports = (req, res, next) => {
  try {
    res.error = (error) => {
      let info = {
        message: 'Houve um problema neste processamento! Desculpe por isso! Nosso time resolverá este problema o mais breve possível',
        type: 'INTERNAL_ERROR',
        status: 500
      }
      try {
        console.error(error)
        if (error instanceof CustomException) {
          info = {
            message: error.message,
            type: error.type,
            status: error.status
          }
        }
      } catch (error) {
        info.status = 500
        console.error(error)
      } finally {
        res.status(info.status || 500).json({
          info
        })
      }
    }
    res.success = (info) => {
      if (typeof info === 'object') {
        res.json(info)
      } else if (info === undefined) {
        res.status(204).end()
      } else {
        res.send(info)
      }
    }
    next()
  } catch (error) {
    res.error(error)
  }
}
