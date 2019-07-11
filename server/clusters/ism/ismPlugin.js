import { POLICY_BASE_API, EXPLAIN_BASE_API, RETRY_BASE_API } from '../../utils/constants';

export default function ismPlugin(Client, config, components) {
  const ca = components.clientAction.factory;

  Client.prototype.ism = components.clientAction.namespaceFactory();
  const ism = Client.prototype.ism.prototype;

  ism.getPolicy = ca({
    url: {
      fmt: `${POLICY_BASE_API}/<%=policyId%>`,
      req: {
        policyId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });

  ism.createPolicy = ca({
    url: {
      fmt: `${POLICY_BASE_API}/<%=policyId%>?refresh=wait_for`,
      req: {
        policyId: {
          type: 'string',
          required: true,
        }
      }
    },
    needBody: true,
    method: 'PUT',
  });

  ism.deletePolicy = ca({
    url: {
      fmt: `${POLICY_BASE_API}/<%=policyId%>?refresh=wait_for`,
      req: {
        policyId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'DELETE',
  });

  ism.putPolicy = ca({
    url: {
      fmt: `${POLICY_BASE_API}/<%=policyId%>?if_seq_no=<%=ifSeqNo%>&if_primary_term=<%=ifPrimaryTerm%>&refresh=wait_for`,
      req: {
        policyId: {
          type: 'string',
          required: true,
        },
        ifSeqNo: {
          type: 'string',
          required: true,
        },
        ifPrimaryTerm: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  ism.explain = ca({
    url: {
      fmt: `${EXPLAIN_BASE_API}/<%=index%>`,
      req: {
        index: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });

  ism.retry = ca({
    url: {
      fmt: `${RETRY_BASE_API}/<%=index%>`,
      req: {
        index: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'POST',
  });
}
