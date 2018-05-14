/*
 *
 * Signup Form Rules
 *
 */

export const firstNameRule = {
  rules: [
    {
      required: true,
      message: 'First Name is required',
    },
  ],
};

export const lastNameRule = {
  rules: [
    {
      required: true,
      message: 'Last Name is required',
    },
  ],
};

export const emailRule = {
  rules: [
    {
      type: 'email',
      message: 'Not a valid E-mail',
    },
    {
      required: true,
      message: 'Last Name is required',
    },
  ],
};

export const mobileRule = {
  rules: [
    {
      required: true,
      message: 'Mobile is required',
    },
    {
      pattern: /\+[0-9]{10,15}/,
      message: 'Wrong format.',
    },
    {
      validator: (rule, value, callback) => {
        if (value && (value.length < 11 || value.length > 16)) {
          return callback(
            'Phone number must be entered in the format: +9999999999. 10 to 15 digits allowed.'
          );
        }

        return callback();
      },
    },
  ],
};

export const organizationRule = {
  rules: [
    {
      required: true,
      message: 'Organization is required',
    },
  ],
};

export const passwordRule = {
  rules: [
    {
      required: true,
      message: 'Please enter a password',
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
