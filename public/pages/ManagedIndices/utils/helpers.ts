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

import queryString from "querystring";
import { DEFAULT_QUERY_PARAMS } from "./constants";
import { ManagedIndicesQueryParams } from "../models/interfaces";

export function getURLQueryParams(location: { search: string }): ManagedIndicesQueryParams {
  const {
    from = DEFAULT_QUERY_PARAMS.from,
    size = DEFAULT_QUERY_PARAMS.size,
    search = DEFAULT_QUERY_PARAMS.search,
    sortField = DEFAULT_QUERY_PARAMS.sortField,
    sortDirection = DEFAULT_QUERY_PARAMS.sortDirection,
  } = queryString.parse(location.search);

  return {
    from: isNaN(parseInt(from as string, 10)) ? DEFAULT_QUERY_PARAMS.from : parseInt(from as string, 10),
    size: isNaN(parseInt(size as string, 10)) ? DEFAULT_QUERY_PARAMS.size : parseInt(size as string, 10),
    search: search as string,
    sortField: sortField as string,
    sortDirection: sortDirection as string,
  };
}
