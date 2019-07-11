import _ from 'lodash';
import {Legacy} from "kibana";
import Request = Legacy.Request;
import ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
import ResponseToolkit = Legacy.ResponseToolkit;
import { CLUSTER } from '../utils/constants';
// import { INDEX } from '../../utils/constants';
const INDEX = '.opendistro-ism-config';

export default class PolicyService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

  putPolicy = async (req: Request, h: ResponseToolkit) => {
    try {
      const { id } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query;
      console.log('id:', id, 'ifSeqNo:', ifSeqNo, 'ifPrimaryTerm', ifPrimaryTerm);
      let method = 'ism.putPolicy';
      let params = { policyId: id, ifSeqNo, ifPrimaryTerm, body: JSON.stringify(req.payload) };
      if (ifSeqNo === undefined || ifPrimaryTerm === undefined) {
        method = 'ism.createPolicy';
        params = { policyId: id, body: JSON.stringify(req.payload) };
      }
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      console.log('calling', method, 'with', params);
      const response = await callWithRequest(req, method, params);
      //const updateResponse = await callWithRequest(req, 'ism.updatePolicy', params);
      //       const { _version, _id } = updateResponse;
      return { ok: true, resp: response };
    } catch (err) {
      console.error('Index Management - PolicyService - putPolicy:', err);
      return { ok: false, resp: err.message };
    }
  };

  deletePolicy = async (req: Request, h: ResponseToolkit) => {
    try {
      const { id } = req.params;
      const params = { policyId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const response = await callWithRequest(req, 'ism.deletePolicy', params);
      return { ok: response.result === 'deleted' };
    } catch (err) {
      console.error('Index Management - PolicyService - deletePolicy:', err);
      return { ok: false, resp: err.message };
    }
  };

  getPolicy = async (req: Request, h: ResponseToolkit) => {
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
      console.error('Index Management - PolicyService - getPolicy:', err);
      return { ok: false, resp: err.message };
    }
  };

  getPolicies = async (req: Request, h: ResponseToolkit) => {
    try {
      const { from, size, search, sortDirection, sortField } = req.query;

      let must = { match_all: {} };
      if (search.trim()) {
        // This is an expensive wildcard query to match policy names such as: "This is a long policy name"
        // search query => "long pol"
        // This is acceptable because we will never allow more than 1,000 policies
        must = {
          query_string: {
            default_field: 'policy.name',
            default_operator: 'AND',
            query: `*${search
              .trim()
              .split(' ')
              .join('* *')}*`,
          },
        };
      }

      const filter = [{ exists: { 'field': 'policy' } }];
      const policySorts = { name: 'policy.name.keyword' };
      const policySortPageData = { size: 1000 };
      if (policySorts[sortField]) {
        policySortPageData.sort = [{ [policySorts[sortField]]: sortDirection }];
        policySortPageData.size = _.defaultTo(size, 1000);
        policySortPageData.from = _.defaultTo(from, 0);
      }

      const params = {
        index: ".opendistro-ism-config",
        seq_no_primary_term: true,
        body: {
          ...policySortPageData,
          query: {
            bool: {
              filter,
              must,
            },
          },
        },
      };

      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.DATA);
      const getResponse = await callWithRequest(req, 'search', params);

      const totalPolicies = _.get(getResponse, 'hits.total.value', 0);
      const policies = _.get(getResponse, 'hits.hits', []).map(hit => ({
        seqNo: hit._seq_no,
        primaryTerm: hit._primary_term,
        id: hit._id,
        policy: hit._source,
      }));

      return { ok: true, policies: policies, totalPolicies };
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === 'index_not_found_exception') {
        return { ok: true, policies: [], totalPolicies: 0 };
      }
      console.error('Index Management - PolicyService - getPolicies', err);
      return { ok: false, resp: err.message };
    }
  };
}
