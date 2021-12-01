import React from 'react';
import { NavLink, Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import AccountOverviewContainer from '@/components/dashboard/AccountOverviewContainer';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import AccountApiContainer from '@/components/dashboard/AccountApiContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import SubNavigation from '@/components/elements/SubNavigation';
import { faCogs, faLock, faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

export default ({ location }: RouteComponentProps) => {
    return (
        <>
            <NavigationBar />
            {location.pathname.startsWith('/account') &&
                <SubNavigation>
                    <div>
                        <Link to={'/'}>
                            <FontAwesomeIcon className="listicon" icon={faHome}/><span className="navigationtext">Return Home</span>
                        </Link>
                        <NavLink to={'/account'} exact><FontAwesomeIcon className="listicon" icon={faCogs}/><span className="navigationtext">Settings</span></NavLink>
                        <NavLink to={'/account/api'}><FontAwesomeIcon className="listicon" icon={faLock}/><span className="navigationtext">API Credentials</span></NavLink>
                    </div>
                </SubNavigation>
            }
            <TransitionRouter>
                <Switch location={location}>
                    <Route path={'/'} component={DashboardContainer} exact />
                    <Route path={'/account'} component={AccountOverviewContainer} exact />
                    <Route path={'/account/api'} component={AccountApiContainer} exact />
                    <Route path={'*'} component={NotFound} />
                </Switch>
            </TransitionRouter>
        </>
    );
};
