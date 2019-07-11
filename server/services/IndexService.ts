import { CLUSTER } from '../utils/constants';
import {Legacy} from "kibana";
import Request = Legacy.Request;
import ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
import ResponseToolkit = Legacy.ResponseToolkit;

export default class IndexService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

  search = async (req: Request, h: ResponseToolkit) => {
    try {
      const { query, index, size } = req.payload;
      const params = { index, size, body: query };
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const results = await callWithRequest(req, 'search', params);
      return { ok: true, resp: results };
    } catch (err) {
      console.error('Index Management - ElasticsearchService - search', err);
      return { ok: false, resp: err.message };
    }
  };

  getIndices = async (req: Request, h: ResponseToolkit) => {
    try {
      const { index } = req.payload;
      console.log('index:', index);


      const params = {
        // ignoreUnavailable: true,
        index,
        ignore: [404],
        body: {
          size: 0,
          aggs: {
            indices: {
              terms: {
                field: '_index',
                size: 5,
              }
            }
          },
        }
      };

      try {
        const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
        const searchResponse = await callWithRequest(req, 'search', params);
        if (!searchResponse || searchResponse.error || !searchResponse.aggregations) {
          console.error('error', searchResponse);
        }

        console.log('searchResponse:', searchResponse);
        console.log(searchResponse.aggregations);
        console.log(searchResponse.aggregations.indices.buckets);
      } catch (err) {
        console.error(err);
      }

      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const indicesResponse = await callWithRequest(req, 'cat.indices', {
        index,
        format: 'json',
      //        h: 'health,index,status',
      });
      return { ok: true, resp: indicesResponse };
    } catch (err) {
      // Elasticsearch throws an index_not_found_exception which we'll treat as a success
      if (err.statusCode === 404) {
        return { ok: true, resp: [] };
      } else {
        console.error('Index Management - ElasticsearchService - getIndices:', err);
        return { ok: false, resp: err.message };
      }
    }
  };

  addPolicy = async (req: Request, h: ResponseToolkit) => {
    try {
      const { indices, policyId } = req.payload;
      const { callWithRequest } = this.esDriver.getCluster(CLUSTER.DATA);
      const resp = await callWithRequest(req, 'indices.putSettings', {
        index: indices.join(','),
        body: { "opendistro.index_state_management.policy_name": policyId }
      });
      console.log('res:', resp);
      return { ok: true, resp: indices };
    } catch (err) {
      console.error('Index Management - ElasticsearchService - addPolicy:', err);
      return { ok: false, resp: err.message };
    }
  };
}
