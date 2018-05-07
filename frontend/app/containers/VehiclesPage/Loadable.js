/**
 *
 * Asynchronously loads the component for VehiclesPage
 *
 */

import Loadable from 'react-loadable';
import LoadingIndicator from 'components/LoadingIndicator';

export default Loadable({
  loader: () => import('./index'),
  loading: () => LoadingIndicator(),
});
