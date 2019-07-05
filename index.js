import { resolve } from 'path';
import { existsSync } from 'fs';

import exampleRoute from './server/routes/example';

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
      hacks: [
        'plugins/index_management_kibana/hack'
      ],
      styleSheetPaths: [resolve(__dirname, 'public/app.scss'), resolve(__dirname, 'public/app.css')].find(p => existsSync(p)),
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) { // eslint-disable-line no-unused-vars
      // Add server routes and initialize the plugin here
      exampleRoute(server);
    }
  });
}
