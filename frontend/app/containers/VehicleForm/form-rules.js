/*
 *
 * Vehicle Form Rules
 *
 */

export const vehicleTypeRule = {
  rules: [
    {
      required: true,
      message: 'Please assign a vehicle type',
    },
  ],
};

export const manufacturerRule = {
  rules: [
    {
      required: true,
      message: 'Please assign a manufacturer',
    },
  ],
};

export const modelRule = {
  rules: [
    {
      required: true,
      message: 'Model is required',
    },
  ],
};

export const serialNumberRule = {
  rules: [
    {
      required: true,
      message: 'Serial Number is required',
    },
  ],
};

export const emptyWeightRule = {
  rules: [
    {
      required: true,
      message: 'This field is required',
    },
  ],
};

export const stateRule = {
  rules: [
    {
      required: true,
      message: 'Please assign a state',
    },
  ],
};
