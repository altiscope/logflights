/*
 *
 * ChangePasswordForm form-rules
 *
 */

export const requiredRule = {
  rules: [
    {
      required: true,
      message: 'This field is required',
    },
  ],
};

export const confirmPasswordRule = (validator) => ({
  rules: [
    {
      required: true,
      message: 'Please enter a password',
    },
    {
      validator,
    },
  ],
});
