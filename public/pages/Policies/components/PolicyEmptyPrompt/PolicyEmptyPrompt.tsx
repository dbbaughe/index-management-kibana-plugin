import React from 'react';
import { EuiButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';

const PLUGIN_NAME = "index_management_kibana";
const filterText =
  'There are no policies matching your applied filters. Reset your filters to view your policies.';
const emptyPolicyText =
  'There are no existing policies. Create a policy to apply to your indices.';
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

const PolicyEmptyPrompt = (props: { filterIsApplied: boolean, loading: boolean, resetFilters: Function }) => (
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

export default PolicyEmptyPrompt;
