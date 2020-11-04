const AbstractService = require('./AbstractService')
const lib = require('pipedrive')
const OportunidadesModel = require('../models/oportunidadesModel')
const axios = require('axios')
const moment = require('moment')
const FormData = require('form-data')

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
  async syncOportunidades () {}

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
    const {
      id,
      status,
      title,
      value
    } = deal

    const cancelarPedidoBling = async (oportunidade) => {
      if (oportunidade && oportunidade.idPedidoCompra) {
        const formData = new FormData()
        formData.append('apikey', process.env.BLING_API_KEY)
        formData.append('xml', `
            <pedidocompra>
                <situacao>${2}</situacao>
            </pedidocompra>
            `.replace(/[\n\t\r]/, ''))

        await axios.put(`https://bling.com.br/Api/v2/pedidocompra/${oportunidade.idPedidoCompra}/json`, formData, {
          headers: formData.getHeaders()
        })
      }
    }

    const reabrirPedidoBling = async (oportunidade) => {
      if (oportunidade && oportunidade.idPedidoCompra) {
        const formData = new FormData()
        formData.append('apikey', process.env.BLING_API_KEY)
        formData.append('xml', `
            <pedidocompra>
                <situacao>${3}</situacao>
            </pedidocompra>
            `.replace(/[\n\t\r]/, ''))
        await axios.put(`https://bling.com.br/Api/v2/pedidocompra/${oportunidade.idPedidoCompra}/json`, formData, { headers: formData.getHeaders() })
      }
    }

    const inserirNovoPedidoBling = async () => {
      const { data: { retorno: { contatos = [] } } } = await axios.get(`https://bling.com.br/Api/v2/contatos/json?apikey=${process.env.BLING_API_KEY}`)
      const unicoContatoFornecedor = (contatos[0] || {}).contato

      const { data: { retorno: { produtos = [] } } } = await axios.get(`https://bling.com.br/Api/v2/produtos/json?apikey=${process.env.BLING_API_KEY}`)
      const unicoProduto = (produtos[0] || {}).produto

      const formData = new FormData()
      formData.append('apikey', process.env.BLING_API_KEY)
      formData.append('xml', `
            <pedidocompra>
                <numeropedido>1</numeropedido>
                <datacompra>${moment().format('DD/MM/YYYY')}</datacompra>
                <fornecedor>
                    <id>${unicoContatoFornecedor.id}</id>
                    <nome>${unicoContatoFornecedor.nome}</nome>
                    <tipopessoa>${unicoContatoFornecedor.tipo}</tipopessoa>
                    <cpfcnpj>${unicoContatoFornecedor.cnpj}</cpfcnpj>
                    <contribuinte>${unicoContatoFornecedor.contribuinte}</contribuinte>
                    <endereco>${unicoContatoFornecedor.endereco}</endereco>
                    <cep>${unicoContatoFornecedor.cep}</cep>
                    <cidade>${unicoContatoFornecedor.cidade}</cidade>
                    <uf>${unicoContatoFornecedor.uf}</uf>
               </fornecedor>
               <itens>
                 <item>
                     <codigo>${unicoProduto.codigo}</codigo>
                     <descricao>${unicoProduto.descricao}</descricao>
                     <un/>
                     <qtde>1</qtde>
                     <valor>${unicoProduto.preco}</valor>
                  </item>
               </itens>
            </pedidocompra>
          `.replace(/[\n\t\r]/, ''))
      const { data: { retorno: { pedidoscompra = [] } } } = await axios.post('https://bling.com.br/Api/v2/pedidocompra/json', formData, { headers: formData.getHeaders() })
      return (pedidoscompra[0] || {}).pedidocompra
    }

    const mapActions = {
      open: async () => {
        if (id) {
          const oportunidade = await OportunidadesModel.findOne({
            idOrigin: id
          })
          if (oportunidade) {
            await cancelarPedidoBling(oportunidade)
            oportunidade.nomeNegocio = title
            oportunidade.valorFinal = value
            oportunidade.status = 'reaberto'
            await oportunidade.save()
            return oportunidade
          }
        }
      },
      won: async () => {
        if (id) {
          let oportunidade = await OportunidadesModel.findOne({
            idOrigin: id
          })
          let idPedidoCompra = null
          if (oportunidade) {
            await reabrirPedidoBling(oportunidade)
            oportunidade.nomeNegocio = title
            oportunidade.valorFinal = value
            oportunidade.status = 'ganho'
            await oportunidade.save()
          } else {
            const { id } = await inserirNovoPedidoBling()
            idPedidoCompra = id
            oportunidade = await new OportunidadesModel({
              idOrigin: id,
              idPedidoCompra: idPedidoCompra,
              nomeNegocio: title,
              valorFinal: value,
              status: 'ganho'
            }).save({ idOrigin: id })
          }
          return oportunidade
        }
      },
      lost: async () => {
        if (id) {
          const oportunidade = await OportunidadesModel.findOne({
            idOrigin: id
          })
          if (oportunidade) {
            await cancelarPedidoBling(oportunidade)
            oportunidade.nomeNegocio = title
            oportunidade.valorFinal = value
            oportunidade.status = 'perdido'
            await oportunidade.save()
            return oportunidade
          }
        }
      },
      deleted: async () => {
        const oportunidade = await OportunidadesModel.findOne({
          idOrigin: id
        })
        if (oportunidade) {
          await cancelarPedidoBling(oportunidade)
          oportunidade.nomeNegocio = title
          oportunidade.valorFinal = value
          oportunidade.status = 'removido'
          await oportunidade.save()
          return oportunidade
        }
      }
    }
    console.log(status, deal)
    return mapActions[status] ? mapActions[status]() : undefined
  }
}

module.exports = OportunidadesService
