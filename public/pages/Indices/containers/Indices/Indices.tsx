import React, { Component } from 'react';
import {
  EuiBasicTable,
  EuiHorizontalRule,
  EuiLink,
  EuiHealth,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiButton,
  EuiButtonEmpty,
  EuiComboBox,
  EuiText,
} from '@elastic/eui';
import queryString from 'query-string';
import _ from 'lodash';
import ContentPanel from '../../../../components/ContentPanel';
import IndexActions from "../../components/IndexActions";
import IndexControls from "../../components/IndexControls";
import IndexEmptyPrompt from "../../components/IndexEmptyPrompt";
import { DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_QUERY_PARAMS } from "../../utils/constants";
import chrome from "ui/chrome";
import {RouteComponentProps} from "react-router";
import {IHttpService} from "angular";





const allOptions = [
  {
    label: 'Titan',
    'data-test-subj': 'titanOption',
  },
  {
    label: 'Enceladus',
  },
  {
    label: 'Mimas',
  },
  {
    label: 'Dione',
  },
  {
    label: 'Iapetus',
  },
  {
    label: 'Phoebe',
  },
  {
    label: 'Rhea',
  },
  {
    label:
      "Pandora is one of Saturn's moons, named for a Titaness of Greek mythology",
  },
  {
    label: 'Tethys',
  },
  {
    label: 'Hyperion',
  },
];






export function getURLQueryParams(location: { search: string }) {
  const {
    from = DEFAULT_QUERY_PARAMS.from,
    size = DEFAULT_QUERY_PARAMS.size,
    search = DEFAULT_QUERY_PARAMS.search,
    sortField = 'index',
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

interface IndicesProps extends RouteComponentProps {
  httpClient: IHttpService;
}

interface IndicesState {
  totalIndices: number;
  page: number;
  size: number;
  search: string;
  sortField: string;
  sortDirection: string;
  selectedItems: IndexItem[];
  indices: IndexItem[];
  loadingIndices: boolean;
  showAddModal: boolean;


  isLoading: boolean;
  isPopoverOpen: boolean;
  selectedOptions: object[];
  options: object[];
}

interface IndexItem {
  index: string;
  indexUuid: string;
}

const HEALTH_TO_COLOR: {
  [health: string]: string;
  green: string;
  yellow: string;
  red: string;
  undefined: string;
} = {
  green: 'success',
  yellow: 'warning',
  red: 'danger',
  undefined: 'subdued',
};

export default class Indices extends Component<IndicesProps, IndicesState> {

  columns: object[];

  constructor(props: IndicesProps) {
    super(props);

    const { from, size, search, sortField, sortDirection } = getURLQueryParams(
      this.props.location
    );

    this.state = {
      totalIndices: 0,
      page: Math.floor(from / size),
      size,
      search,
      sortField,
      sortDirection,
      selectedItems: [],
      indices: [],
      loadingIndices: true,
      showAddModal: false,



      isLoading: false,
      isPopoverOpen: false,
      selectedOptions: [],
      options: [],
    };

    this.getIndices = _.debounce(this.getIndices.bind(this), 500, { leading: true });
    this.onTableChange = this.onTableChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onPageClick = this.onPageClick.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.onClickAdd = this.onClickAdd.bind(this);
    this.onAddPolicy = this.onAddPolicy.bind(this);
    this.onCloseAddModal = this.onCloseAddModal.bind(this);

    this.columns = [
      {
        field: 'index',
        name: 'Index',
        sortable: true,
        truncateText: true,
        textOnly: true,
        width: '250px',
        render: (index: string) => (<EuiLink>{index}</EuiLink>),
      },
      {
        field: 'health',
        name: 'Health',
        sortable: true,
        truncateText: true,
        textOnly: true,
        align: 'right',
        render: (health: string) => (
          <EuiHealth color={HEALTH_TO_COLOR[health]}>
            {health}
          </EuiHealth>
          ),
      },
      {
        field: 'status',
        name: 'Status',
        sortable: true,
        truncateText: true,
        textOnly: true,
        align: 'right',
      },
      {
        field: 'store.size',
        name: 'Total size',
        sortable: true,
        truncateText: true,
        textOnly: true,
        dataType: 'number',
      },
      {
        field: 'pri.store.size',
        name: 'Primaries size',
        sortable: true,
        truncateText: true,
        textOnly: true,
        dataType: 'number',
      },
      {
        field: 'docs.count',
        name: 'Total documents',
        sortable: true,
        truncateText: true,
        textOnly: true,
        dataType: 'number',
      },
      {
        field: 'docs.deleted',
        name: 'Deleted documents',
        sortable: true,
        truncateText: true,
        textOnly: true,
        dataType: 'number',
      },
      {
        field: 'pri',
        name: 'Primaries',
        sortable: true,
        truncateText: true,
        textOnly: true,
        dataType: 'number',
      },
      {
        field: 'rep',
        name: 'Replicas',
        sortable: true,
        truncateText: true,
        textOnly: true,
        dataType: 'number',
      }
    ];
  }

  async componentDidMount() {
    chrome.breadcrumbs.set([{ text: 'Index Management', href: '#/' }, { text: 'Indices', href: '#/indices' }]);
    await this.getIndices();
  }

  async componentDidUpdate(prevProps: IndicesProps, prevState: IndicesState) {
    const prevQuery = Indices.getQueryObjectFromState(prevState);
    const currQuery = Indices.getQueryObjectFromState(this.state);
    if (!_.isEqual(prevQuery, currQuery)) {
      await this.getIndices();
    }
  }

  static getQueryObjectFromState({
    page,
    size,
    search,
    sortField,
    sortDirection
  }: IndicesState) {
    return {
      page,
      size,
      search,
      sortField,
      sortDirection,
    };
  }

  async getIndices() {
    this.setState({ loadingIndices: true });
    try {
      const body = { index: '*' };
      const { httpClient, history } = this.props;
      // history.replace({ ...this.props.location, search: queryParamsString });
      const response = await httpClient.post(`../api/ism/_indices`, body);
      if (response.data.ok) {
        console.log('response:', response.data.resp[0]);
        const { data: { resp: indices } } = response;
        this.setState({ indices, totalIndices: indices.length });
      } else {
        console.log('error getting indices:', response);
      }
    } catch (err) {
      console.error(err);
    }
    this.setState({ loadingIndices: false });
  }

  onTableChange({ page: tablePage, sort }: { page: { index: number, size: number }, sort: { field: string, direction: string } }) {
    const { index: page, size } = tablePage;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({ page, size, sortField, sortDirection });
  }

  onSelectionChange(selectedItems: IndexItem[]) {
    this.setState({ selectedItems });
  }

  onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ page: 0, search: e.target.value });
  }

  onPageClick(page: number) {
    this.setState({ page });
  }

  resetFilters(): void {
    this.setState({ search: DEFAULT_QUERY_PARAMS.search });
  }

  onClickAdd(): void {
    this.setState({ showAddModal: true });
  }

  async onAddPolicy(): Promise<void> {
    const { selectedOptions, selectedItems } = this.state;
    const policyId = selectedOptions[0].label;
    const body = { indices: selectedItems.map(item => item.index), policyId };
    const resp = await this.props.httpClient.post("../api/ism/addPolicy", body);
    if (resp.data.ok) {
      this.onCloseAddModal();
    } else {
      console.error(resp);
    }
  }

  onCloseAddModal(): void {
    this.setState({ showAddModal: false });
  }



  onChange = selectedOptions => {
    this.setState({
      selectedOptions,
    });
  };


  onPolicySearchChange = async searchValue => {
    this.setState({
      isLoading: true,
      options: [],
    });

    try {
      const idQuery = {
        query_string: {
          default_field: 'policy.name', // TODO to search the policy ID we need to index it as we can't do fuzzy matching on _id
          default_operator: 'AND',
          query: `*${searchValue
          .trim()
          .split(' ')
          .join('* *')}*`,
        },
      };
      const body = { index: ".opendistro-ism-config", size: 10, query: { _source: false, query: { bool: { must: [idQuery, { exists: { field: 'policy' } }] } } } };
      const response = await this.props.httpClient.post('../api/ism/_search', body);
      if (response.data.ok) {
        this.setState({
          options: response.data.resp.hits.hits.map(hit => ({ label: hit._id }))
        });
      }
    } catch (err) {
      console.error(err);
    }

    this.setState({ isLoading: false });
  };



  render() {
    const {
      totalIndices,
      page,
      size,
      search,
      sortField,
      sortDirection,
      selectedItems,
      indices,
      loadingIndices,
      showAddModal,
    } = this.state;

    const filterIsApplied = !!search;

    const pagination = {
      pageIndex: page,
      pageSize: size,
      pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
      totalItemCount: Math.min(10000, totalIndices),
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



    const { selectedOptions, isLoading, options } = this.state;

    let modal;

    if (showAddModal) {
      modal = (
        <EuiOverlayMask>
          <EuiModal onCancel={this.onCloseAddModal} onClose={this.onCloseAddModal}>
            <EuiModalHeader>
              <EuiModalHeaderTitle>Add policy</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <EuiComboBox
                placeholder="Search policies"
                async
                options={options}
                singleSelection
                selectedOptions={selectedOptions}
                isLoading={isLoading}
                onChange={this.onChange}
                onSearchChange={this.onPolicySearchChange}
              />
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={this.onCloseAddModal}>Close</EuiButtonEmpty>

              <EuiButton disabled={selectedOptions.length !== 1} onClick={this.onAddPolicy} fill>
                Add
              </EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }






    return (
      <ContentPanel
        actions={
          <IndexActions
            isAddDisabled={!selectedItems.length}
            onClickAdd={this.onClickAdd}
          />
        }
        bodyStyles={{ padding: 'initial' }}
        title="Indices"
      >
        <IndexControls
          activePage={page}
          pageCount={Math.ceil(totalIndices / size) || 1}
          search={search}
          onSearchChange={this.onSearchChange}
          onPageClick={this.onPageClick}
          onRefresh={this.getIndices}
        />

        <EuiHorizontalRule margin="xs" />

        <EuiBasicTable
          columns={this.columns}
          isSelectable={true}
          itemId="index"
          items={indices}
          noItemsMessage={
            <IndexEmptyPrompt
              filterIsApplied={filterIsApplied}
              loading={loadingIndices}
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
