/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import _ from "lodash";
import { Legacy } from "kibana";
import { CLUSTER, INDEX } from "../utils/constants";
import {
  DeletePolicyParams,
  DeletePolicyResponse,
  GetPoliciesResponse,
  GetPolicyResponse,
  PutPolicyParams,
  PutPolicyResponse,
  SearchResponse,
  ServerResponse,
} from "../models/interfaces";
import { getMustQuery } from "../utils/helpers";
import { PoliciesSort } from "../models/types";

import Request = Legacy.Request;
import ElasticsearchPlugin = Legacy.Plugins.elasticsearch.Plugin;
import ResponseToolkit = Legacy.ResponseToolkit;

export default class PolicyService {
  esDriver: ElasticsearchPlugin;

  constructor(esDriver: ElasticsearchPlugin) {
    this.esDriver = esDriver;
  }

  /**
   * Calls backend Put Policy API
   */
  putPolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<PutPolicyResponse>> => {
    try {
      const { id } = req.params;
      const { ifSeqNo, ifPrimaryTerm } = req.query as { ifSeqNo?: string; ifPrimaryTerm?: string };
      let method = "ism.putPolicy";
      let params: PutPolicyParams = { policyId: id, ifSeqNo: ifSeqNo, ifPrimaryTerm: ifPrimaryTerm, body: JSON.stringify(req.payload) };
      if (ifSeqNo === undefined || ifPrimaryTerm === undefined) {
        method = "ism.createPolicy";
        params = { policyId: id, body: JSON.stringify(req.payload) };
      }
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const response = await callWithRequest(req, method, params);
      return { response: response };
    } catch (err) {
      console.error("Index Management - PolicyService - putPolicy:", err);
      return { error: err.message };
    }
  };

  /**
   * Calls backend Delete Policy API
   */
  deletePolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<boolean>> => {
    try {
      const { id } = req.params;
      const params: DeletePolicyParams = { policyId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const response: DeletePolicyResponse = await callWithRequest(req, "ism.deletePolicy", params);
      if (response.result !== "deleted") {
        return { error: response.result };
      }
      return { response: true };
    } catch (err) {
      console.error("Index Management - PolicyService - deletePolicy:", err);
      return { error: err.message };
    }
  };

  /**
   * Calls backend Get Policy API
   */
  getPolicy = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<GetPolicyResponse>> => {
    try {
      const { id } = req.params;
      const params = { policyId: id };
      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.ISM);
      const getResponse = await callWithRequest(req, "ism.getPolicy", params);
      const policy = _.get(getResponse, "policy", null);
      const seqNo = _.get(getResponse, "_seq_no", null);
      const primaryTerm = _.get(getResponse, "_primary_term", null);
      if (policy) {
        return { response: { id, seqNo, primaryTerm, policy } };
      } else {
        return { error: "Failed to load policy" };
      }
    } catch (err) {
      console.error("Index Management - PolicyService - getPolicy:", err);
      return { error: err.message };
    }
  };

  /**
   * Performs a fuzzy search request on policy id
   */
  getPolicies = async (req: Request, h: ResponseToolkit): Promise<ServerResponse<GetPoliciesResponse>> => {
    try {
      const { from, size, search, sortDirection, sortField } = req.query as {
        from: string;
        size: string;
        search: string;
        sortDirection: string;
        sortField: string;
      };

      // TODO change policy.name to policy.policy_id when it's available from backend fix
      const policySorts: PoliciesSort = { name: "policy.name.keyword" };
      const params = {
        index: INDEX.OPENDISTRO_ISM_CONFIG,
        seq_no_primary_term: true,
        body: {
          size,
          from,
          sort: policySorts[sortField] ? [{ [policySorts[sortField]]: sortDirection }] : [],
          query: {
            bool: {
              filter: [{ exists: { field: "policy" } }],
              // TODO change policy.name to policy.policy_id when it's available from backend fix
              must: getMustQuery("policy.name", search),
            },
          },
        },
      };

      const { callWithRequest } = await this.esDriver.getCluster(CLUSTER.DATA);
      const searchResponse: SearchResponse<any> = await callWithRequest(req, "search", params);

      const totalPolicies = searchResponse.hits.total.value;
      const policies = searchResponse.hits.hits.map(hit => ({
        seqNo: hit._seq_no as number,
        primaryTerm: hit._primary_term as number,
        id: hit._id,
        policy: hit._source,
      }));

      return { response: { policies: policies, totalPolicies } };
    } catch (err) {
      if (err.statusCode === 404 && err.body.error.type === "index_not_found_exception") {
        return { response: { policies: [], totalPolicies: 0 } };
      }
      console.error("Index Management - PolicyService - getPolicies", err);
      return { error: err.message };
    }
  };
}
