import _ from 'lodash';

let env;

// For our stage and prod environments we want to
// toggle certain behavior, e.g., auth prompt.
export function isPublicAppDomain() {
  return _.includes(['stage', 'prod'], env.appDomain);
}

export function initialize({ appDomain }) {
  env = {
    appDomain,
  };
}
