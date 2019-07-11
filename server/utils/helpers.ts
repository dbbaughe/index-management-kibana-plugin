export function transformManagedIndexMetaData(metaData) {
  if (!metaData) return null;
  if (!metaData.index) return null;
  return {
    index: metaData.index,
    indexUuid: metaData.index_uuid,
    policyName: metaData.policy_name,
    policySeqNo: metaData.policy_seq_no,
    policyPrimaryTerm: metaData.policy_primary_term,
    policyCompleted: metaData.policy_completed,
    rolledOver: metaData.rolled_over,
    transitionTo: metaData.transition_to,
    state: metaData.state,
    stateStartTime: metaData.state_start_time,
    action: metaData.action,
    actionIndex: metaData.action_index,
    actionStartTime: metaData.action_start_time,
    consumedRetries: metaData.consumed_retries,
    failed: metaData.failed,
    info: metaData.info,
  };
}
