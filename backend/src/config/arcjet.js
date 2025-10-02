
/** Import Arcjet and other protection rules 
* arcjet - used to create an Arcjet client instance
* shield - used for protection against malicious requests
* detectBot - used for detecting and filtering bot traffic

*/


import arcjet, { shield, detectBot } from '@arcjet/node';

/**
 * Create an Arcjet client and configure with rules - this client will be used for the entire application
 */
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE',
        'CATEGORY:PREVIEW',
      ],
    }),
  ],
});
export default aj;