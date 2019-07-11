import React from 'react';
import { EuiButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';

const PLUGIN_NAME = "index_management_kibana";
const filterText =
  'There are no managed indices matching your applied filters. Reset your filters to view your managed indices.';
const emptyPolicyText =
  'There are no existing managed indices. Create a policy to add to an index.';
const loadingText = 'Loading policies...';
const createPolicyButton = (
  <EuiButton fill href={`${PLUGIN_NAME}#/create-policy`}>
    Create policy
  </EuiButton>
);
const resetFiltersButton = (resetFilters: Function) => (
  <EuiButton fill onClick={resetFilters}>
    Reset Filters
  </EuiButton>
);

const getMessagePrompt = ({ filterIsApplied, loading }: { filterIsApplied: boolean, loading: boolean }) => {
  if (loading) return loadingText;
  if (filterIsApplied) return filterText;
  return emptyPolicyText;
};

const getActions = ({ filterIsApplied, loading, resetFilters }: { filterIsApplied: boolean, loading: boolean, resetFilters: Function }) => {
  if (loading) return null;
  if (filterIsApplied) return resetFiltersButton(resetFilters);
  return createPolicyButton;
};

const ManagedIndexEmptyPrompt = (props: { filterIsApplied: boolean, loading: boolean, resetFilters: Function }) => (
  <EuiEmptyPrompt
    style={{ maxWidth: '45em' }}
    body={
      <EuiText>
        <p>{getMessagePrompt(props)}</p>
      </EuiText>
    }
    actions={getActions(props)}
  />
);

export default ManagedIndexEmptyPrompt;
