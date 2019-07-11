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
  EuiRadioGroup,
  EuiSelect,
  EuiText,
  EuiSpacer,
  EuiToolTip,
} from '@elastic/eui';
import queryString from 'query-string';
import _ from 'lodash';
import ContentPanel from '../../../../components/ContentPanel';
import ManagedIndexActions from "../../components/ManagedIndexActions";
import ManagedIndexControls from "../../components/ManagedIndexControls";
import ManagedIndexEmptyPrompt from "../../components/ManagedIndexEmptyPrompt";
import { ACTIONS, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import chrome from "ui/chrome";
import {RouteComponentProps} from "react-router";
import {IHttpService} from "angular";
import {DEFAULT_EMPTY_DATA} from "../../../../utils/constants";

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

interface ManagedIndicesProps extends RouteComponentProps {
  httpClient: IHttpService;
}

interface ManagedIndicesState {
  totalManagedIndices: number;
  page: number;
  size: number;
  search: string;
  sortField: string;
  sortDirection: string;
  selectedItems: ManagedIndexItem[];
  managedIndices: ManagedIndexItem[];
  loadingManagedIndices: boolean;
  modalManagedIndex: ManagedIndexItem | null;
  showRetryModal: boolean;
  radioIdSelected: string;
  stateSelected: string;
}

interface ManagedIndexItem {
  index: string;
  indexUuid: string;
  policyId: string;
  policySeqNo: number;
  policyPrimaryTerm: number;
  policy: object; // We only ever dump this as JSON in a view so we don't need to type it
  enabled: boolean;
  managedIndexMetaData: ManagedIndexMetaData | null;
}

interface ManagedIndexMetaData {
  index: string;
  indexUuid: string;
  policyName: string;
  policySeqNo?: number;
  policyPrimaryTerm?: number;
  policyCompleted?: boolean;
  rolledOver?: boolean;
  transitionTo?: string;
  state?: string;
  stateStartTime?: number;
  action?: string;
  actionIndex?: number;
  actionStartTime?: number;
  consumedRetries?: number;
  failed?: boolean;
  info?: object;
}

export default class ManagedIndices extends Component<ManagedIndicesProps, ManagedIndicesState> {

  columns: object[];
  radios: { id: string, label: string }[];

  constructor(props: ManagedIndicesProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(
      this.props.location
    );

    this.state = {
      totalManagedIndices: 0,
      page: Math.floor(from / size),
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      managedIndices: [],
      loadingManagedIndices: true,
      modalManagedIndex: null,
      showRetryModal: false,
      radioIdSelected: 'from-current',
      stateSelected: '',
    };

    this.getManagedIndices = _.debounce(this.getManagedIndices.bind(this), 500, { leading: true });
    this.onTableChange = this.onTableChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onPageClick = this.onPageClick.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.onClickModalEdit = this.onClickModalEdit.bind(this);
    this.onRetry = this.onRetry.bind(this);
    this.onOpenRetryModal = this.onOpenRetryModal.bind(this);
    this.onCloseRetryModal = this.onCloseRetryModal.bind(this);

    this.columns = [
      {
        field: 'index',
        name: 'Index',
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: '150px',
        render: (index: string, item: ManagedIndexItem) => (
          <EuiLink
            // href={`${PLUGIN_NAME}#/managed-index/${item.id}`}
            onClick={() => this.showModal(item)}
          >{index}</EuiLink>
        ),
      },
      {
        field: 'policyId',
        name: 'Policy',
        sortable: false,
        truncateText: true,
        textOnly: true,
        width: '150px',
        render: (policyId: string, item: ManagedIndexItem) => (
          <EuiLink onClick={() => this.showModal(item)}>{policyId}</EuiLink>
        ),
      },
      {
        field: 'managedIndexMetaData.state',
        name: 'State',
        sortable: true,
        truncateText: false,
        width: '150px',
        render: (state: string) => _.defaultTo(state, DEFAULT_EMPTY_DATA),
      },
      {
        field: 'managedIndexMetaData.action',
        name: 'Action',
        sortable: true,
        truncateText: false,
        width: '150px',
        render: (action: string) => _.defaultTo(ACTIONS[action], DEFAULT_EMPTY_DATA),
      },
      {
        field: 'managedIndexMetaData.info',
        name: 'Info',
        sortable: false,
        truncateText: true,
        textOnly: true,
        width: '150px',
        render: (info: object) => (
          <EuiToolTip content={JSON.stringify(info, null, 4)}>
            <EuiText size="s">{_.get(info, 'message', DEFAULT_EMPTY_DATA)}</EuiText>
          </EuiToolTip>
        ),
      },
      {
        field: 'index', // we don't care about the field as we're using the whole item in render
        name: 'Status',
        sortable: true,
        truncateText: false,
        width: '150px',
        render: (index: string, item: ManagedIndexItem) => {
          if (!item.managedIndexMetaData) return 'Initializing';
          if (item.managedIndexMetaData.failed) return 'Failed';
          return 'Running';
        },
      }
    ];

    this.radios = [
      {
        id: 'from-current',
        label: 'Retry policy from current action',
      },
      {
        id: 'from-state',
        label: 'Retry policy from selected state',
      }
    ];
  }

  async componentDidMount() {
    chrome.breadcrumbs.set([{ text: 'Index Management', href: '#/' }, { text: 'Managed Indices', href: '#/managed-indices' }]);
    await this.getManagedIndices();
  }

  async componentDidUpdate(prevProps: ManagedIndicesProps, prevState: ManagedIndicesState) {
    const prevQuery = ManagedIndices.getQueryObjectFromState(prevState);
    const currQuery = ManagedIndices.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getManagedIndices();
    }
  }

  static getQueryObjectFromState({
    page,
    size,
    search,
    sortField,
    sortDirection
  }: ManagedIndicesState) {
    return {
      page,
      size,
      search,
      sortField,
      sortDirection,
    };
  }

  async getManagedIndices() {
    this.setState({ loadingManagedIndices: true });
    try {
      const { page, size, search, sortField, sortDirection } = this.state;
      const params = { from: page * size, size, search, sortField, sortDirection };
      const queryParamsString = queryString.stringify(params);
      const { httpClient, history } = this.props;
      history.replace({ ...this.props.location, search: queryParamsString });
      const response = await httpClient.get(`../api/ism/indices?${queryString.stringify(params)}`);
      if (response.data.ok) {
        console.log('response:', response);
        const { data: { managedIndices, totalManagedIndices } } = response;
        this.setState({ managedIndices, totalManagedIndices });
      } else {
        console.log('error getting managedIndices:', response);
      }
    } catch (err) {
      console.error(err);
    }
    this.setState({ loadingManagedIndices: false });
  }

  onTableChange({ page: tablePage, sort }: { page: { index: number, size: number }, sort: { field: string, direction: string } }) {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ page, size, sortField, sortDirection });
  }

  onSelectionChange(selectedItems: ManagedIndexItem[]) {
    this.setState({ selectedItems });
  }

  onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ page: 0, search: e.target.value });
  }

  onPageClick(page: number) {
    this.setState({ page });
  }

  onClickModalEdit() {
    this.closeModal();
    const { modalManagedIndex } = this.state;
    if (!modalManagedIndex || !modalManagedIndex.policyId) return;
    this.props.history.push(`/edit-policy?id=${modalManagedIndex.policyId}`);
  }

  closeModal() {
    this.setState({ modalManagedIndex: null });
  }

  showModal(item: ManagedIndexItem) {
    this.setState({ modalManagedIndex: item });
  }

  resetFilters(): void {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search });
  }

  async onRetry(): Promise<void> {
    const { selectedItems, radioIdSelected, stateSelected } = this.state;
    try {
      const body = { index: selectedItems.map(item => item.index), state: radioIdSelected == 'from-state' ? stateSelected : null };
      const resp = await this.props.httpClient.post('../api/ism/retry', body);
      console.log('resp:', resp);
      this.onCloseRetryModal();
    } catch (err) {
      console.error(err);
    }
  }

  onOpenRetryModal(): void {
    this.setState({ showRetryModal: true });
  }

  onCloseRetryModal(): void {
    this.setState({ showRetryModal: false });
  }

  onChange = optionId => {
    this.setState({
      radioIdSelected: optionId,
    });
  };

  onSelectChange = e => {
    this.setState({
      stateSelected: e.target.value,
    });
  };

  render() {
    const {
      totalManagedIndices,
      page,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems,
      managedIndices,
      loadingManagedIndices,
      modalManagedIndex,
      showRetryModal,
    } = this.state;

    const filterIsApplied = !!search;

    const pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Math.min(10000, totalManagedIndices),
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

    if (modalManagedIndex) {
      modal = (
        <EuiOverlayMask>
          <EuiModal onCancel={this.closeModal} onClose={this.closeModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>{modalManagedIndex.policyId}</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <EuiCodeBlock language="json" fontSize="m">
                {JSON.stringify(modalManagedIndex.policy, null, 4)}
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

    if (showRetryModal) {
      modal = (
        <EuiOverlayMask>
          <EuiModal onCancel={this.onCloseRetryModal} onClose={this.onCloseRetryModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                Retry policy
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <EuiRadioGroup
                options={this.radios}
                idSelected={this.state.radioIdSelected}
                onChange={this.onChange}
              />

              <EuiSpacer size="s" />

              <EuiText size="xs">
                <strong>Start state</strong>
              </EuiText>
              <EuiSelect
                disabled={this.state.radioIdSelected !== 'from-state'}
                options={_.uniqBy(_.flatten(this.state.selectedItems.map(item => {
                  if (!item.policy || !item.policy.states) return [];
                  return item.policy.states.map(state => ({ value: state.name, text: state.name }));
                })), 'value')}
                value={this.state.stateSelected}
                onChange={this.onSelectChange}
                aria-label="Use aria labels when no actual label is in use"
              />
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={this.onCloseRetryModal}>Close</EuiButtonEmpty>

              <EuiButton onClick={this.onRetry} fill>
                Retry
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }


    return (
      <ContentPanel
        actions={
          <ManagedIndexActions
            isRemoveDisabled={!selectedItems.length}
            onClickRemove={() => { console.log('onClickRemove'); }}
            isRetryDisabled={!selectedItems.length}
            onClickRetry={this.onOpenRetryModal}
            isChangeDisabled={!selectedItems.length}
            onClickChange={() => { console.log('onClickChange'); }}
          />
        }
        bodyStyles={{ padding: 'initial' }}
        title="Managed Indices"
      >
        <ManagedIndexControls
          activePage={page}
          pageCount={Math.ceil(totalManagedIndices / size) || 1}
          search={search}
          onSearchChange={this.onSearchChange}
          onPageClick={this.onPageClick}
          onRefresh={this.getManagedIndices}
        />

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={this.columns}
          isSelectable={true}
          itemId="index"
          items={managedIndices}
          noItemsMessage={
            <ManagedIndexEmptyPrompt
              filterIsApplied={filterIsApplied}
              loading={loadingManagedIndices}
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
