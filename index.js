import { resolve } from 'path';
import { existsSync } from 'fs';

import { createISMCluster } from './server/clusters';
import { ElasticsearchService, PolicyService, ManagedIndexService, IndexService } from './server/services';
import { elasticsearch, indices, policies, managedIndices } from './server/routes';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'index_management_kibana',
    uiExports: {
      app: {
        title: 'Index Management Kibana',
        description: 'Kibana plugin for Index Management',
        main: 'plugins/index_management_kibana/app',
      },
      hacks: [],
      styleSheetPaths: [resolve(__dirname, 'public/app.scss'), resolve(__dirname, 'public/app.css')].find(p => existsSync(p)),
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) { // eslint-disable-line no-unused-vars
      // Create clusters
      createISMCluster(server);

      // Initialize services
      const esDriver = server.plugins.elasticsearch;
      // const elasticsearchService = new ElasticsearchService(esDriver);
      const indexService = new IndexService(esDriver);
      const policyService = new PolicyService(esDriver);
      const managedIndexService = new ManagedIndexService(esDriver);
      const services = {
        // elasticsearchService,
        indexService,
        policyService,
        managedIndexService,
      };

      // Add server routes
      // elasticsearch(server, services);
      indices(server, services);
      policies(server, services);
      managedIndices(server, services);
    }
  });
}
