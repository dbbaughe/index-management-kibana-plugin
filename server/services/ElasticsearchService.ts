import { CLUSTER } from '../utils/constants';
import {Legacy} from "kibana";
import Request = Legacy.Request;
import ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
import ResponseToolkit = Legacy.ResponseToolkit;

export default class ElasticsearchService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

  search = async (req: Request, h: ResponseToolkit) => {
    try {
      const { query, index, size } = req.payload as { query: object, index: string, size: number };
      const params = { index, size, body: query };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const results = await callWithRequest(req, 'search', params);
      return { ok: true, resp: results };
    } catch (err) {
      console.error('Index Management - ElasticsearchService - search', err);
      return { ok: false, resp: err.message };
    }
  };
}
