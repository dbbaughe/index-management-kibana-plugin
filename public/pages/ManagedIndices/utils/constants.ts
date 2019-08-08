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

import { Actions, ManagedIndicesQueryParams } from "../models/interfaces";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
export const DEFAULT_QUERY_PARAMS: ManagedIndicesQueryParams = {
  from: 0,
  size: 20,
  search: "",
  sortField: "name",
  sortDirection: "desc",
};

export const ACTIONS: Actions = {
  rollover: "Rollover",
  delete: "Delete",
  transition: "Transition",
  open: "Open",
  close: "Close",
  read_only: "Read Only",
  read_write: "Read Write",
};
