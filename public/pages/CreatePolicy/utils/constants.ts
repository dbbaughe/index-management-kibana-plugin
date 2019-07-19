export const DEFAULT_POLICY = JSON.stringify(
  {
    policy: {
      name: "Default policy",
      default_state: "Ingest",
      states: [
        {
          name: "Ingest",
          actions: [{ rollover: { min_doc_count: 10000000 } }],
          transitions: [{ state_name: "Search" }],
        },
        {
          name: "Search",
          actions: [],
          transitions: [
            {
              state_name: "Delete",
              conditions: { index_age: "30d" },
            },
          ],
        },
        {
          name: "Delete",
          actions: [{ delete: {} }],
          transitions: [],
        },
      ],
    },
  },
  null,
  4
);
