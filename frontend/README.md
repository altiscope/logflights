# Front-end Architecture

## Libraries Used

* React - Main front-end framework
* Redux - state management
* Redux Saga - Manage app side effects
* Reselect - Selector Library for Redux
  * Selectors can compute derived data, allowing Redux to store the minimal possible state.
  * Selectors are efficient. A selector is not recomputed unless one of its arguments change.
  * Selectors are composable. They can be used as input to other selectors.
* Immutable JS - provides many Persistent Immutable data structures including: List, Stack, Map, OrderedMap, Set, OrderedSet and Record.
* Styled Components - Visual primitives for the component age. Use the best bits of ES6 and CSS to style your apps without stress
* Babel - enables es6/es7 syntax. All js files are written in es6
* ES Lint - maintain code quality

*refer to package.json for versions*

## Architecture

### Parts and Connections

#### Component
The component is rendered with a set of props that get passed down from it’s parent component. In this case it is a template, but let’s not fool ourselves, a template, a component, and even a container is just a component. It is a set of code that uses properties and can call other components and gives them properties.

```
const LoadingIndicator = () => (
  <Wrapper>
    <Circle />
    <Circle rotate={30} delay={-1.1} />
    <Circle rotate={60} delay={-1} />
    <Circle rotate={90} delay={-0.9} />
    <Circle rotate={120} delay={-0.8} />
    <Circle rotate={150} delay={-0.7} />
    <Circle rotate={180} delay={-0.6} />
    <Circle rotate={210} delay={-0.5} />
    <Circle rotate={240} delay={-0.4} />
    <Circle rotate={270} delay={-0.3} />
    <Circle rotate={300} delay={-0.2} />
    <Circle rotate={330} delay={-0.1} />
  </Wrapper>
);
```

#### Container
The container is the glue that connects react to redux. It connects it in a lot of ways. This is where the react-redux module is used and I usually call that connect as that is what I use it for. It takes three arguments, an object that maps state to props — mapStateToProps, an object that maps actions to dispatch (these are used to wire events to actions) — mapActionsToDispatch, and mergeProperties merges all the properties together and passes them to react for rendering.

```

export class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        log.flights
      </div>
    );
  }
}

HomePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  homepage: makeSelectHomePage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'homePage', reducer });
const withSaga = injectSaga({ key: 'homePage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(HomePage);
```

#### Actions & Action Creators

* Action: This is an object that contains the type of action and the state that was changed because of the action.
* Action Creator: This is the code that is called to create an action and send it along to the reducer.

```
import {
  DEFAULT_ACTION,
} from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}
```

#### Reducer

The key thing to know about a reducer is that for every dispatch every reducer is called and given the dispatched action. Then it is up to the reducer to handle it or pass it on.

```

import { fromJS } from 'immutable';

import {
  LOAD_REPOS_SUCCESS,
  LOAD_REPOS,
  LOAD_REPOS_ERROR,
} from './constants';

// The initial state of the App
const initialState = fromJS({
  loading: false,
  error: false,
  currentUser: false,
  userData: {
    repositories: false,
  },
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_REPOS:
      return state
        .set('loading', true)
        .set('error', false)
        .setIn(['userData', 'repositories'], false);
    case LOAD_REPOS_SUCCESS:
      return state
        .setIn(['userData', 'repositories'], action.repos)
        .set('loading', false)
        .set('currentUser', action.username);
    case LOAD_REPOS_ERROR:
      return state
        .set('error', action.error)
        .set('loading', false);
    default:
      return state;
  }
}

export default appReducer;
```

#### Selector
The selector is how you would get data out of your store in the container.

```
import { createSelector } from 'reselect';

const selectGlobal = (state) => state.get('global');

const selectRoute = (state) => state.get('route');

const makeSelectCurrentUser = () => createSelector(
  selectGlobal,
  (globalState) => globalState.get('currentUser')
);

const makeSelectLoading = () => createSelector(
  selectGlobal,
  (globalState) => globalState.get('loading')
);

const makeSelectError = () => createSelector(
  selectGlobal,
  (globalState) => globalState.get('error')
);

const makeSelectRepos = () => createSelector(
  selectGlobal,
  (globalState) => globalState.getIn(['userData', 'repositories'])
);

const makeSelectLocation = () => createSelector(
  selectRoute,
  (routeState) => routeState.get('location').toJS()
);

export {
  selectGlobal,
  makeSelectCurrentUser,
  makeSelectLoading,
  makeSelectError,
  makeSelectRepos,
  makeSelectLocation,
};
```
