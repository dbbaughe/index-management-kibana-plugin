import _ from 'lodash';
import {Legacy} from "kibana";
import Request = Legacy.Request;
import ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
import ResponseToolkit = Legacy.ResponseToolkit;
import {CLUSTER, INDEX} from '../utils/constants';
import {transformManagedIndexMetaData} from '../utils/helpers';

export default class ManagedIndexService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

  getManagedIndex = async (req: Request, h: ResponseToolkit) => {
    try {
      const { id } = req.params;
      const params = { policyId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const getResponse = await callWithRequest(req, 'ism.getPolicy', params);
      const policy = _.get(getResponse, 'policy', null);
      const seqNo = _.get(getResponse, '_seq_no', null);
      const primaryTerm = _.get(getResponse, '_primary_term', null);
      if (policy) {
        return { ok: true, resp: { id, seqNo, primaryTerm, policy } };
      } else {
        return { ok: false };
      }
    } catch (err) {
      console.error('Index Management - ManagedIndexService - getManagedIndex:', err);
      return { ok: false, resp: err.message };
    }
  };

  getManagedIndices = async (req: Request, h: ResponseToolkit) => {

    // First get ManagedIndexConfigs that match the search, sort, and pagination
    // Then get the ManagedIndexMetaData for each index to get the current state of index
    // The ManagedIndexMetaData could be empty if the index has not been initialized yet
    // Then return List<ManagedIndexItem> types

    try {
      const { from, size, search, sortDirection, sortField } = req.query;

      let must = { match_all: {} };
      if (search.trim()) {
        must = {
          query_string: {
            default_field: 'managed_index.name',
            default_operator: 'AND',
            query: `*${search
              .trim()
              .split(' ')
              .join('* *')}*`,
          },
        };
      }


      const filter = [{ exists: { 'field': 'managed_index' } }];
      const managedIndexSorts = { name: 'managed_index.name.keyword' };
      const managedIndexSortPageData = { size, from };
      if (managedIndexSorts[sortField]) {
        managedIndexSortPageData.sort = [{ [managedIndexSorts[sortField]]: sortDirection }];
      }


      const searchParams = {
        index: INDEX.OPENDISTRO_ISM_CONFIG,
        seq_no_primary_term: true,
        body: {
          ...managedIndexSortPageData,
          query: {
            bool: {
              filter,
              must,
            },
          },
        },
      };

      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.DATA);
      const searchResponse = await callWithRequest(req, 'search', searchParams);

      const indices = searchResponse.hits.hits.map(hit => hit._source.managed_index.index);
      const totalManagedIndices = _.get(searchResponse, 'hits.total.value', 0);

      if (!indices.length) {
        return { ok: true, managedIndices: [], totalManagedIndices: 0 };
      }

      const explainParams = { index: indices.join(',') };
      const { callWithRequest: ismCallWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const explainResponse = await ismCallWithRequest(req, 'ism.explain', explainParams);

      const managedIndices = searchResponse.hits.hits.map(hit => {
        const index = hit._source.managed_index.index;
        return {
          index,
          indexUuid: hit._source.managed_index.index_uuid,
          policyId: hit._source.managed_index.policy_name, // TODO: rename policy_name to policy_id to be more clear
          policySeqNo: hit._source.managed_index.policy_seq_no,
          policyPrimaryTerm: hit._source.managed_index.policy_primary_term,
          policy: hit._source.managed_index.policy,
          enabled: hit._source.managed_index.enabled,
          managedIndexMetaData: transformManagedIndexMetaData(explainResponse[index]), // this will be undefined if we are initializing
        };
      });

      return { ok: true, managedIndices, totalManagedIndices };
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === 'index_not_found_exception') {
        return { ok: true, managedIndices: [], totalManagedIndices: 0 };
      }
      console.error('Index Management - ManagedIndexService - getManagedIndices', err);
      return { ok: false, resp: err.message };
    }
  };

  retryManagedIndexPolicy = async (req: Request, h: ResponseToolkit) => {
    try {
      const { index, state } = req.payload as { index: string[], state: string };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const params = { index: index.join(',') };
      if (state) params.body = { state };
      const retryResponse = await callWithRequest(req, 'ism.retry', params);
      console.log('retryresp:', retryResponse);
      return { ok: true, resp: {} };
    } catch (err) {
      console.error('Index Management - ManagedIndexService - retryManagedIndexPolicy:', err);
      return { ok: false, resp: err.message };
    }
  };
}
