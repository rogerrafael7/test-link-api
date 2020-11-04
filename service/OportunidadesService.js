const AbstractService = require('./AbstractService')
const lib = require('pipedrive')
const OportunidadesModel = require('../models/oportunidadesModel')
const axios = require('axios')
const moment = require('moment')

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
        await axios.put(`https://bling.com.br/Api/v2/pedidocompra/${oportunidade.idPedidoCompra}/json`, {
          apikey: process.env.BLING_API_KEY,
          xml: `
            <?xml version="1.0" encoding="UTF-8"?>
            <pedidocompra>
                <situacao>${2}</situacao>
            </pedidocompra>
            `.replace(/[\n\t\r]/, '')
        })
      }
    }

    const reabrirPedidoBling = async (oportunidade) => {
      if (oportunidade && oportunidade.idPedidoCompra) {
        await axios.put(`https://bling.com.br/Api/v2/pedidocompra/${oportunidade.idPedidoCompra}/json`, {
          apikey: process.env.BLING_API_KEY,
          xml: `
            <?xml version="1.0" encoding="UTF-8"?>
            <pedidocompra>
                <situacao>${3}</situacao>
            </pedidocompra>
            `.replace(/[\n\t\r]/, '')
        })
      }
    }

    const inserirNovoPedidoBling = async () => {
      const { data: { retorno: { contatos = [] } } } = await axios.get(`https://bling.com.br/Api/v2/contatos/json?apikey=${process.env.BLING_API_KEY}`)
      const unicoContatoFornecedor = (contatos[0] || {}).contato

      const { data: { retorno: { produtos = [] } } } = await axios.get(`https://bling.com.br/Api/v2/produtos/json?apikey=${process.env.BLING_API_KEY}`)
      const unicoProduto = (produtos[0] || {}).produto

      const { data: { retorno: { pedidoscompra = [] } } } = await axios.post('https://bling.com.br/Api/v2/pedidocompra/json', {
        apikey: process.env.BLING_API_KEY,
        xml: `
            <?xml version="1.0" encoding="utf-8" ?>
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
          `.replace(/[\n\t\r]/, '')
      })
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
            return oportunidade.remove()
          }
        }
      },
      won: async () => {
        if (id) {
          const oportunidade = await OportunidadesModel.findOne({
            idOrigin: id
          })
          let idPedidoCompra = null
          if (oportunidade) {
            idPedidoCompra = oportunidade.idPedidoCompra
            await reabrirPedidoBling(oportunidade)
          } else {
            const { id } = await inserirNovoPedidoBling()
            idPedidoCompra = id
          }
          OportunidadesModel.update({ idOrigin: id }, {
            idPedidoCompra: idPedidoCompra,
            nomeNegocio: title,
            valorFinal: value,
            status: 'ganho'
          }, { upsert: true })
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
          }
          await OportunidadesModel.update({ idOrigin: id }, {
            nomeNegocio: title,
            valorFinal: value,
            status: 'perdido'
          }, { upsert: true })

          return oportunidade
        }
      },
      deleted: async () => {
        const oportunidade = await OportunidadesModel.findOne({
          idOrigin: id
        })
        if (oportunidade) {
          await cancelarPedidoBling(oportunidade)
        }
        return OportunidadesModel.deleteOne({
          idOrigin: id
        })
      }
    }
    return mapActions[status] ? mapActions[status]() : undefined
  }
}

module.exports = OportunidadesService
