/**
 *
 * Asynchronously loads the component for CreateNewPasswordForm
 *
 */

import Loadable from 'react-loadable';

export default Loadable({
  loader: () => import('./index'),
  loading: () => null,
});
