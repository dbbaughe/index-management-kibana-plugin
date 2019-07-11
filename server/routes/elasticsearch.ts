import { Legacy } from 'kibana';
import { Services } from '../types';
import Server = Legacy.Server;

export default function(server: Server, services: Services) {
  server.plugins.elasticsearch
  const { elasticsearchService } = services;

  server.route({
    path: '/api/ism/_search',
    method: 'POST',
    handler: elasticsearchService.search,
  });

  server.route({
    path: '/api/ism/_indices',
    method: 'POST',
    handler: elasticsearchService.getIndices,
  });

  server.route({
    path: '/api/ism/_aliases',
    method: 'POST',
    handler: elasticsearchService.getAliases,
  });

  server.route({
    path: '/api/ism/_mappings',
    method: 'POST',
    handler: elasticsearchService.getMappings,
  });
}
