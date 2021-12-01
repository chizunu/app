import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { NavLink, Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import ServerConsole from '@/components/server/ServerConsole';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import DatabasesContainer from '@/components/server/databases/DatabasesContainer';
import FileManagerContainer from '@/components/server/files/FileManagerContainer';
import { CSSTransition } from 'react-transition-group';
import SuspenseSpinner from '@/components/elements/SuspenseSpinner';
import FileEditContainer from '@/components/server/files/FileEditContainer';
import SettingsContainer from '@/components/server/settings/SettingsContainer';
import ScheduleContainer from '@/components/server/schedules/ScheduleContainer';
import ScheduleEditContainer from '@/components/server/schedules/ScheduleEditContainer';
import UsersContainer from '@/components/server/users/UsersContainer';
import Can from '@/components/elements/Can';
import BackupContainer from '@/components/server/backups/BackupContainer';
import Spinner from '@/components/elements/Spinner';
import ScreenBlock, { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import SubNavigation from '@/components/elements/SubNavigation';
import NetworkContainer from '@/components/server/network/NetworkContainer';
import InstallListener from '@/components/server/InstallListener';
import StartupContainer from '@/components/server/startup/StartupContainer';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faTerminal, faFile, faDatabase, faCalendarAlt, faCloudDownloadAlt, faNetworkWired, faCogs, faUser, faPlayCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import RequireServerPermission from '@/hoc/RequireServerPermission';
import ServerInstallSvg from '@/assets/images/server_installing.svg';
import ServerRestoreSvg from '@/assets/images/server_restore.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';
import { ApplicationStore } from '@/state';

const ConflictStateRenderer = () => {
    const status = ServerContext.useStoreState(state => state.server.data ?.status || null);
    const isTransferring = ServerContext.useStoreState(state => state.server.data ?.isTransferring || false);

    return (
        status === 'installing' || status === 'install_failed' ?
            <ScreenBlock
                title={'Running Installer'}
                image={ServerInstallSvg}
                message={'Your server should be ready soon, please try again in a few minutes.'}
            />
            :
            status === 'suspended' ?
                <ScreenBlock
                    title={'Server Suspended'}
                    image={ServerErrorSvg}
                    message={'This server is suspended and cannot be accessed.'}
                />
                :
                <ScreenBlock
                    title={isTransferring ? 'Transferring' : 'Restoring from Backup'}
                    image={ServerRestoreSvg}
                    message={isTransferring ? 'Your server is being transfered to a new node, please check back later.' : 'Your server is currently being restored from a backup, please check back in a few minutes.'}
                />
    );
};

const ServerRouter = ({ match, location }: RouteComponentProps<{ id: string }>) => {
    const rootAdmin = useStoreState(state => state.user.data!.rootAdmin);
    const [error, setError] = useState('');

    const id = ServerContext.useStoreState(state => state.server.data ?.id);
    const uuid = ServerContext.useStoreState(state => state.server.data ?.uuid);
    const inConflictState = ServerContext.useStoreState(state => state.server.inConflictState);
    const serverId = ServerContext.useStoreState(state => state.server.data ?.internalId);
    const getServer = ServerContext.useStoreActions(actions => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions(actions => actions.clearServerState);
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);

    useEffect(() => () => {
        clearServerState();
    }, []);

    useEffect(() => {
        setError('');

        getServer(match.params.id)
            .catch(error => {
                console.error(error);
                setError(httpErrorToHuman(error));
            });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    return (
        <React.Fragment key={'server-router'}>
            <NavigationBar />
            {(!uuid || !id) ?
                error ?
                    <ServerError message={error} />
                    :
                    <Spinner size={'large'} centered />
                :
                <>
                    <CSSTransition timeout={150} classNames={'fade'} appear in>
                        <SubNavigation>
                            <div>
                                <Link to={'/'}>
                                    <FontAwesomeIcon className="listicon" icon={faHome}/><span className="navigationtext">Pagina Inicial</span>
                                    </Link>
                                <NavLink to={`${match.url}`} exact><FontAwesomeIcon className="listicon" icon={faTerminal}/><span className="navigationtext">Console</span></NavLink>
                                <Can action={'file.*'}>
                                    <NavLink to={`${match.url}/files`}><FontAwesomeIcon className="listicon" icon={faFile}/><span className="navigationtext">Gerenciador de Arquivos</span></NavLink>
                                </Can>
                                <Can action={'database.*'}>
                                    <NavLink to={`${match.url}/databases`}><FontAwesomeIcon className="listicon" icon={faDatabase}/><span className="navigationtext">Databases</span></NavLink>
                                </Can>
                                <Can action={'schedule.*'}>
                                    <NavLink to={`${match.url}/schedules`}><FontAwesomeIcon className="listicon" icon={faCalendarAlt}/><span className="navigationtext">Agenda</span></NavLink>
                                </Can>
                                <Can action={'user.*'}>
                                    <NavLink to={`${match.url}/users`}><FontAwesomeIcon className="listicon" icon={faUser}/><span className="navigationtext">Usuarios</span></NavLink>
                                </Can>
                                <Can action={'backup.*'}>
                                    <NavLink to={`${match.url}/backups`}><FontAwesomeIcon className="listicon" icon={faCloudDownloadAlt}/><span className="navigationtext">Backups</span></NavLink>
                                </Can>
                                <Can action={'allocation.*'}>
                                    <NavLink to={`${match.url}/network`}><FontAwesomeIcon className="listicon" icon={faNetworkWired}/><span className="navigationtext">Conexão</span></NavLink>
                                </Can>
                                <Can action={'startup.*'}>
                                    <NavLink to={`${match.url}/startup`}><FontAwesomeIcon className="listicon" icon={faPlayCircle}/><span className="navigationtext">Inicialização</span></NavLink>
                                </Can>
                                <Can action={['settings.*', 'file.sftp']} matchAny>
                                    <NavLink to={`${match.url}/settings`}><FontAwesomeIcon className="listicon" icon={faCogs}/><span className="navigationtext">Configurações</span></NavLink>
                                </Can>
                                {rootAdmin &&
                                    <a href={'/admin/servers/view/' + serverId} rel="noreferrer" target={'_blank'}>
                                        <FontAwesomeIcon className="listicon" icon={faExternalLinkAlt}/><span className="navigationtext">Admin</span>
                                    </a>
                                }
                            </div>
                        </SubNavigation>
                    </CSSTransition>
                    <InstallListener />
                    <TransferListener />
                    <WebsocketHandler />
                    {(inConflictState && (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`)))) ?
                        <ConflictStateRenderer />
                        :
                        <ErrorBoundary>
                            <TransitionRouter>
                                <Switch location={location}>
                                    <Route path={`${match.path}`} component={ServerConsole} exact />
                                    <Route path={`${match.path}/files`} exact>
                                        <RequireServerPermission permissions={'file.*'}>
                                            <FileManagerContainer />
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/files/:action(edit|new)`} exact>
                                        <SuspenseSpinner>
                                            <FileEditContainer />
                                        </SuspenseSpinner>
                                    </Route>
                                    <Route path={`${match.path}/databases`} exact>
                                        <RequireServerPermission permissions={'database.*'}>
                                            <DatabasesContainer />
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/schedules`} exact>
                                        <RequireServerPermission permissions={'schedule.*'}>
                                            <ScheduleContainer />
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/schedules/:id`} exact>
                                        <ScheduleEditContainer />
                                    </Route>
                                    <Route path={`${match.path}/users`} exact>
                                        <RequireServerPermission permissions={'user.*'}>
                                            <UsersContainer />
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/backups`} exact>
                                        <RequireServerPermission permissions={'backup.*'}>
                                            <BackupContainer />
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/network`} exact>
                                        <RequireServerPermission permissions={'allocation.*'}>
                                            <NetworkContainer />
                                        </RequireServerPermission>
                                    </Route>
                                    <Route path={`${match.path}/startup`} component={StartupContainer} exact />
                                    <Route path={`${match.path}/settings`} component={SettingsContainer} exact />
                                    <Route path={'*'} component={NotFound} />
                                </Switch>
                            </TransitionRouter>
                        </ErrorBoundary>
                    }
                </>
            }
        </React.Fragment>
    );
};

export default (props: RouteComponentProps<any>) => (
    <ServerContext.Provider>
        <ServerRouter {...props} />
    </ServerContext.Provider>
);
