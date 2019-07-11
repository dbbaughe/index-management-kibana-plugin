import { Legacy } from 'kibana';
import { Services } from '../types';
import Server = Legacy.Server;

export default function(server: Server, services: Services) {
  const { managedIndexService } = services;

  server.route({
    path: '/api/ism/indices',
    method: 'GET',
    handler: managedIndexService.getManagedIndices,
  });

  server.route({
    path: '/api/ism/indices/{id}',
    method: 'GET',
    handler: managedIndexService.getManagedIndex,
  });

  server.route({
    path: '/api/ism/retry',
    method: 'POST',
    handler: managedIndexService.retryManagedIndexPolicy,
  });

  // change
  // add
  // remove
}
