import ismPlugin from './ismPlugin';
import { CLUSTER, DEFAULT_HEADERS } from '../../utils/constants';

export default function createISMCluster(server) {
  const { customHeaders, ...rest } = server.config().get('elasticsearch');
  server.plugins.elasticsearch.createCluster(CLUSTER.ISM, {
    plugins: [ismPlugin],
    customHeaders: { ...customHeaders, ...DEFAULT_HEADERS },
    ...rest,
  });
}
