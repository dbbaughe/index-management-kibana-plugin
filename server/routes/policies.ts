import { Legacy } from 'kibana';
import { Services } from '../types';
import Server = Legacy.Server;

export default function(server: Server, services: Services) {
  const { policyService } = services;

  server.route({
    path: '/api/ism/policies',
    method: 'GET',
    handler: policyService.getPolicies,
  });

  server.route({
    path: '/api/ism/policies/{id}',
    method: 'PUT',
    handler: policyService.putPolicy,
  });

  server.route({
    path: '/api/ism/policies/{id}',
    method: 'GET',
    handler: policyService.getPolicy,
  });

  server.route({
    path: '/api/ism/policies/{id}',
    method: 'DELETE',
    handler: policyService.deletePolicy,
  });
}
