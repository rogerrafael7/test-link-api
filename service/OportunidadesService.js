const AbstractService = require('./AbstractService')
const lib = require('pipedrive')
const OportunidadesModel = require('../models/oportunidadesModel')

class OportunidadesService extends AbstractService {
  /**
   * Retornará os dados dos Deals vindos direto do Pipedrive
   * @return {Promise<*>}
   */
  async getOportunidadesFromOrigin () {
    return lib.DealsController.getAllDeals({
      userId: this.request.pipedriveUser.id
    })
  }

  /**
   * Método resopnsável por sincronizar os dados do Pipedrive com os desta aplicação
   * @return {Promise<void>}
   */
  async syncOportunidades () {

  }

  /**
   * Retorna os indicadores agregando e filtrando os dados salvos no mongodb
   * @return {Promise<void>}
   */
  async getKpis () {
    // todo: agregar resultados da collection de oportunidades e retornar informações, prever filtros
  }

  /**
   * Retorna todos os dados salvos no mongodb da collection de oportunidades
   * @return {Promise<*>}
   */
  async getOportunidades () {
    return OportunidadesModel.find()
  }

  /**
   * Método responsável por salvar uma oportunidade a partir de informações extraídas de um Deal do PipeDrive.
   * Este método também é mapeado para ser utilizado no WebHook do PipeDrive sempre q houver uma alteração num Deal
   * @return {Promise<void>}
   */
  async saveOportunidade (deal = {}) {
    // todo: salva no mongodb uma oportunidade enviada pelo WebHook registrado no pipedrive.
    // Obs.: GANHO salva, PERDIDO salva tmb, se voltar para andamento sendo q já estava salvo no banco, ai o remove do mongo
    // as mesmas ações feitas no banco tmb devem refletir no Bling, insere novo pedido no caso de GANHO e remove um pedido(se já existente) se for diferente de GANHO

    if (['won', 'lost', 'deleted'].includes(deal.status)) {
      const {
        id,
        status,
        title,
        value
      } = deal

      const mapActions = {
        won: async () => {
          return OportunidadesModel.update({ idOrigin: id }, {
            nomeNegocio: title,
            valorFinal: value,
            status: 'ganho'
          }, { upsert: true })
        },
        lost: async () => {
          return OportunidadesModel.update({ idOrigin: id }, {
            nomeNegocio: title,
            valorFinal: value,
            status: 'perdido'
          }, { upsert: true })
        },
        deleted: async () => {
          return OportunidadesModel.deleteOne({
            idOrigin: id
          })
        }
      }
      return mapActions[status] ? mapActions[status]() : undefined
    } else {
      console.log(deal)
    }
  }
}

module.exports = OportunidadesService
