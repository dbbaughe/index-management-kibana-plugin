import { Legacy } from 'kibana';
import { Services } from '../types';
import Server = Legacy.Server;

export default function(server: Server, services: Services) {
  const { indexService } = services;

  server.route({
    path: '/api/ism/_search',
    method: 'POST',
    handler: indexService.search,
  });

  server.route({
    path: '/api/ism/_indices',
    method: 'POST',
    handler: indexService.getIndices,
  });

  server.route({
    path: '/api/ism/addPolicy',
    method: 'POST',
    handler: indexService.addPolicy,
  })
}
