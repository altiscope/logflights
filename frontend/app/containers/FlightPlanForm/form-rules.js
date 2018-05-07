/*
 *
 * FlightPlanForm Form Rules
 *
 */

/*
Flight id: input
Vehicle: dropdown
Mission type: dropdown
Estimated departure time: date time picker
Estimated arrival time: date time picker
Payload weight (kg): numeric up down
Upload waypoints: file upload
*/

export const requiredRule = (message = 'This field is required') => ({
  rules: [{
    required: true,
    message,
  }],
});

export const arrivalDateRule = (validator = () => true) => ({
  rules: [{
    required: true,
    message: 'Arrival date is required',
  }, {
    validator,
  }],
});
