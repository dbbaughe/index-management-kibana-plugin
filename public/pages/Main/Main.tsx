import React, { Component } from 'react';
import {Switch, Route, Redirect, RouteComponentProps} from 'react-router-dom';
import {
  EuiSideNav,
  EuiPage,
  EuiPageBody,
  EuiPageSideBar,
} from '@elastic/eui';
import Policies from '../Policies';
import ManagedIndices from '../ManagedIndices';
import Indices from '../Indices';
import CreatePolicy from '../CreatePolicy';
import {IHttpService} from "angular";

const NAV: {
  POLICIES: string;
  MANAGED_INDICES: string;
  INDICES: string;
} = {
  POLICIES: 'Policies',
  MANAGED_INDICES: 'Managed Indices',
  INDICES: 'Indices',
};

const PATHNAME: {
  ROOT: string;
  POLICIES: string;
  MANAGED_INDICES: string;
  INDICES: string;
} = {
  ROOT: '/',
  POLICIES: '/policies',
  MANAGED_INDICES: '/managed-indices',
  INDICES: '/indices',
};

const PATHNAME_TO_NAV = {
  [PATHNAME.ROOT]: NAV.POLICIES,
  [PATHNAME.POLICIES]: NAV.POLICIES,
  [PATHNAME.MANAGED_INDICES]: NAV.MANAGED_INDICES,
  [PATHNAME.INDICES]: NAV.INDICES,
};

interface MainProps extends RouteComponentProps {
  httpClient: IHttpService;
}

interface MainState {
  selectedItemName: string;
}

class Main extends Component<MainProps, MainState> {

  constructor(props: MainProps) {
    super(props);

    this.state = { selectedItemName: PATHNAME_TO_NAV[props.location.pathname] };
  }

  selectItem = (name: string) => {
    this.setState({
      selectedItemName: name,
    });
  };

  render() {
    const { httpClient } = this.props;
    const sideNav = [
      {
        name: 'Index Management',
        id: 0,
        href: `#${PATHNAME.POLICIES}`,
        onClick: () => this.selectItem(NAV.POLICIES),
        items: [
          {
            name: NAV.POLICIES,
            id: 1,
            href: `#${PATHNAME.POLICIES}`,
            onClick: () => this.selectItem(NAV.POLICIES),
            isSelected: this.state.selectedItemName === NAV.POLICIES,
          },
          {
            name: 'Managed Indices',
            id: 2,
            href: `#${PATHNAME.MANAGED_INDICES}`,
            onClick: () => this.selectItem(NAV.MANAGED_INDICES),
            isSelected: this.state.selectedItemName === NAV.MANAGED_INDICES,
          },
          {
            name: 'Indices',
            id: 3,
            href: `#${PATHNAME.INDICES}`,
            onClick: () => this.selectItem(NAV.INDICES),
            isSelected: this.state.selectedItemName === NAV.INDICES,
          }
        ],
      },
    ];
    return (
      <EuiPage>
        <EuiPageSideBar style={{ minWidth: 150 }}>
          <EuiSideNav
            style={{ width: 150 }}
            items={sideNav}
          />
        </EuiPageSideBar>
        <EuiPageBody>
          <Switch>
            <Route
              path="/create-policy"
              render={(props: RouteComponentProps) => (
                <CreatePolicy {...props} httpClient={httpClient} />
              )}
            />
            <Route
              path="/edit-policy"
              render={(props: RouteComponentProps) => (
                <CreatePolicy {...props} edit httpClient={httpClient} />
              )}
            />
            <Route
              path="/policies"
              render={(props: RouteComponentProps) => (
                <div style={{ padding: '25px 25px' }}>
                  <Policies {...props} httpClient={httpClient} />
                </div>
              )}
            />
            <Route
              path="/managed-indices"
              render={(props: RouteComponentProps) => (
                <div style={{ padding: '25px 25px' }}>
                  <ManagedIndices {...props} httpClient={httpClient} />
                </div>
              )}
            />
            <Route
              path="/indices"
              render={(props: RouteComponentProps) => (
                <div style={{ padding: '25px 25px' }}>
                  <Indices {...props} httpClient={httpClient} />
                </div>
              )}
            />
            <Redirect from="/" to="/policies" />
          </Switch>
        </EuiPageBody>
      </EuiPage>
    );
  }
}

export default Main;
