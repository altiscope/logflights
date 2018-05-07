/*
 *
 * UserProfileForm FormRules
 *
 */

export const requiredRule = (message = 'This field is required') => ({
  rules: [{
    required: true,
    message,
  }],
});
