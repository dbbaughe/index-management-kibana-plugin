export const API_ROUTE_PREFIX = '/_opendistro/_ism';
export const POLICY_BASE_API = `${API_ROUTE_PREFIX}/policies`;
export const EXPLAIN_BASE_API = `${API_ROUTE_PREFIX}/explain`;
export const RETRY_BASE_API = `${API_ROUTE_PREFIX}/retry`;
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
export const CLUSTER = {
  ADMIN: 'admin',
  ISM: 'opendistro_ism',
  DATA: 'data',
};
export const INDEX = {
  OPENDISTRO_ISM_CONFIG: ".opendistro-ism-config",
};
