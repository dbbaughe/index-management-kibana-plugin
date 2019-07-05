export default function (server) {

  server.route({
    path: '/api/index-management-kibana/example',
    method: 'GET',
    handler() {
      return { time: (new Date()).toISOString() };
    }
  });

}
