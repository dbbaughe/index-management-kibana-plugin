import React, { Component } from 'react';
import {
  EuiBasicTable,
  EuiHorizontalRule,
  EuiLink,
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiCodeBlock,
} from '@elastic/eui';
import chrome from 'ui/chrome';
import queryString from 'query-string';
import _ from 'lodash';
import moment from 'moment';
import ContentPanel from "../../../components/ContentPanel/ContentPanel";
import PolicyActions from "../components/PolicyActions/PolicyActions";
import PolicyControls from "../components/PolicyControls/PolicyControls";
import PolicyEmptyPrompt from "../components/PolicyEmptyPrompt/PolicyEmptyPrompt";
import {IHttpResponse, IHttpService} from "angular";
import {RouteComponentProps} from "react-router";

const renderTime = time => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a');
  return '-';
};
export const PLUGIN_NAME = 'index_management_kibana';
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
export const DEFAULT_QUERY_PARAMS = {
  from: 0,
  size: 20,
  search: '',
  sortField: 'name',
  sortDirection: 'desc',
};


interface PolicyItem {
  id: string;
  seqNo: number;
  primaryTerm: number;
  policy: object; // only dumped to view as JSON, don't need to type
}


export function getURLQueryParams(location: { search: string }) {
  const {
    from = DEFAULT_QUERY_PARAMS.from,
    size = DEFAULT_QUERY_PARAMS.size,
    search = DEFAULT_QUERY_PARAMS.search,
    sortField = DEFAULT_QUERY_PARAMS.sortField,
    sortDirection = DEFAULT_QUERY_PARAMS.sortDirection,
  } = queryString.parse(location.search);

  return {
    from: isNaN(parseInt(from, 10)) ? DEFAULT_QUERY_PARAMS.from : parseInt(from, 10),
    size: isNaN(parseInt(size, 10)) ? DEFAULT_QUERY_PARAMS.size : parseInt(size, 10),
    search,
    sortField,
    sortDirection,
  };
}

interface PoliciesProps extends RouteComponentProps {
  httpClient: IHttpService;
}

interface PoliciesState {
  totalPolicies: number;
  page: number;
  size: number;
  search: string;
  sortField: string;
  sortDirection: string;
  selectedItems: PolicyItem[];
  policies: PolicyItem[];
  loadingPolicies: boolean;
  modalPolicy: PolicyItem | null;

}

class Policies extends Component<PoliciesProps, PoliciesState> {

  columns: object[];
  static getItemId = (item: PolicyItem) => `${item.id}`;

  constructor(props: PoliciesProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(
      this.props.location
    );

    this.state = {
      totalPolicies: 0,
      page: Math.floor(from / size),
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      policies: [],
      loadingPolicies: true,
      modalPolicy: null,
    };

    this.getPolicies = _.debounce(this.getPolicies.bind(this), 500, { leading: true });
    this.onTableChange = this.onTableChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.deletePolicy = this.deletePolicy.bind(this);
    this.onClickEdit = this.onClickEdit.bind(this);
    this.onClickDelete = this.onClickDelete.bind(this);
    this.onPageClick = this.onPageClick.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.onClickModalEdit = this.onClickModalEdit.bind(this);

    this.columns = [
      {
        field: 'id',
        name: 'Policy',
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: '150px',
        render: (name: string, item: PolicyItem) => (
          <EuiLink
            // href={`${PLUGIN_NAME}#/policies/${item.id}`}
            onClick={() => this.showModal(item)}
          >{name}</EuiLink>
        ),
      },
      {
        field: 'policy.policy.name',
        name: 'Description',
        sortable: false,
        truncateText: true,
        textOnly: true,
        width: '150px',
      },
      {
        field: 'affectedIndices',
        name: 'Number of affected indices',
        sortable: false,
        truncateText: false,
        width: '100px',
        render: () => '#'
      },
      {
        field: 'policy.policy.last_updated_time',
        name: 'Last updated time',
        sortable: true,
        truncateText: false,
        render: renderTime,
        dataType: 'date',
        width: '150px',
      }
    ];
  }

  async componentDidMount() {
    chrome.breadcrumbs.set([{ text: 'Index Management', href: '#/' }, { text: 'Policies', href: '#/policies' }]);
    await this.getPolicies();
  }

  async componentDidUpdate(prevProps: PoliciesProps, prevState: PoliciesState) {
    const prevQuery = Policies.getQueryObjectFromState(prevState);
    const currQuery = Policies.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getPolicies();
    }
  }

  static getQueryObjectFromState({
    page,
    size,
    search,
    sortField,
    sortDirection
  }: PoliciesState) {
    return {
      page,
      size,
      search,
      sortField,
      sortDirection,
    };
  }

  async getPolicies() {
    this.setState({ loadingPolicies: true });
    try {
      const { page, size, search, sortField, sortDirection } = this.state;
      const params = { from: page * size, size, search, sortField, sortDirection };
      const queryParamsString = queryString.stringify(params);
      const { httpClient, history } = this.props;
      history.replace({ ...this.props.location, search: queryParamsString });
      const response: IHttpResponse<{ ok: boolean, policies: PolicyItem[], totalPolicies: number }> = await httpClient.get(`../api/ism/policies?${queryString.stringify(params)}`);
      if (response.data.ok) {
        const { data: { policies, totalPolicies } } = response;
        this.setState({ policies, totalPolicies });
      } else {
        console.log('error getting policies:', response);
      }
    } catch (err) {
      console.error(err);
    }
    this.setState({ loadingPolicies: false });
  }

  onTableChange({ page: tablePage, sort }: { page: { index: number, size: number }, sort: { field: string, direction: string } }) {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ page, size, sortField, sortDirection });
  }

  onSelectionChange(selectedItems: PolicyItem[]) {
    this.setState({ selectedItems });
  }

  onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ page: 0, search: e.target.value });
  }

  async deletePolicy(item: PolicyItem) {
    const { httpClient } = this.props;
    try {
      const { id } = item;
      const response = await httpClient.delete(`../api/ism/policies/${id}`);
      console.log('response:', response);
    } catch (err) {
      console.error(err);
    }
  }

  onClickEdit() {
    const { selectedItems: [{ id }] } = this.state;
    if (id) this.props.history.push(`/edit-policy?id=${id}`);
  }

  async onClickDelete() {
    const { selectedItems } = this.state;
    if (selectedItems.length !== 1) return;
    await this.deletePolicy(selectedItems[0]);
    await this.getPolicies();
  }

  onPageClick(page: number) {
    this.setState({ page });
  }

  onClickModalEdit() {
    const { modalPolicy } = this.state;
    this.closeModal();
    if (!modalPolicy || !modalPolicy.id) return;
    this.props.history.push(`/edit-policy?id=${modalPolicy.id}`);
  }

  closeModal() {
    this.setState({ modalPolicy: null });
  }

  showModal(item: PolicyItem) {
    this.setState({ modalPolicy: item });
  }

  resetFilters(): void {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search });
  }

  render() {
    const {
      totalPolicies,
      page,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems,
      policies,
      loadingPolicies,
      modalPolicy,
    } = this.state;

    const filterIsApplied = !!search;

    const pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Math.min(10000, totalPolicies),
    };

    const sorting = {
      sort: {
        direction: sortDirection,
        field: sortField,
      },
    };

    const selection = {
      onSelectionChange: this.onSelectionChange,
      selectableMessage: (selectable: boolean) => (selectable ? undefined : undefined),
    };

    let modal;

    if (modalPolicy) {
      modal = (
        <EuiOverlayMask>
          <EuiModal onCancel={this.closeModal} onClose={this.closeModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>{modalPolicy.id}</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <EuiCodeBlock language="json" fontSize="m">
                {JSON.stringify(modalPolicy.policy, null, 4)}
              </EuiCodeBlock>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={this.closeModal}>Close</EuiButtonEmpty>

              <EuiButton onClick={this.onClickModalEdit} fill>
                Edit
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }


    return (
      <ContentPanel
        actions={
          <PolicyActions
            isEditDisabled={selectedItems.length !== 1}
            onClickEdit={this.onClickEdit}
            isDeleteDisabled={selectedItems.length !== 1}
            onClickDelete={this.onClickDelete}
          />
        }
        bodyStyles={{ padding: 'initial' }}
        title="Policies"
      >
        <PolicyControls
          activePage={page}
          pageCount={Math.ceil(totalPolicies / size) || 1}
          search={search}
          onSearchChange={this.onSearchChange}
          onPageClick={this.onPageClick}
          onRefresh={this.getPolicies}
        />

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={this.columns}
          isSelectable={true}
          itemId={Policies.getItemId}
          items={policies}
          noItemsMessage={
            <PolicyEmptyPrompt
              filterIsApplied={filterIsApplied}
              loading={loadingPolicies}
              resetFilters={this.resetFilters}
            />
          }
          onChange={this.onTableChange}
          pagination={pagination}
          selection={selection}
          sorting={sorting}
        />

        {modal}
      </ContentPanel>
    );
  }
}

export default Policies;
