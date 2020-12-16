export const environment = {
  production: true,
  apiKey: 'AIzaSyADUNrRkAQSclYoRhi_9y-sb1FDEHCmuE8',
  authDomain: 'livecoach-dev.firebaseapp.com',
  databaseURL: 'https://livecoach-dev.firebaseio.com',
  projectId: 'livecoach-dev',
  storageBucket: 'livecoach-dev.appspot.com',
  messagingSenderId: '1000559055215',
  appId: '1:1000559055215:web:33ebbc33ff1f23c203189a',
  measurementId: 'G-S4801FLL5M',
  algoliaApiKey: '2fb04a22ac2afb05afcf086bbf5289e3',
  algoliaApplicationID: 'T46GDX1NCS',
  algoliaAdminApiKey: '28976e526c24cb1c59f96b78213aaf90', // This key is needed to be imported in cloud functions (functions/index.ts/ 'const algolia')
  twilioAccountSID: 'AC7cea98ce8762206b3f5af09b63e9ebbf', // There are test credentials. Need to be changed for prod
  twilioAuthToken: 'c9775bfe4f0fd11c71b935dfb45f81c7',
  stripeClientId: '&client_id=ca_Gl8JdfxtwHJFDika4cUSThpPTDfCYZa3',
  stripeJsClientKey: 'pk_test_HtSpdTqwGC86g7APo4XLBgms00TVXJLOf8',
  stripeRedirectUri: 'redirect_uri=http://livecoach-dev.web.app/account/stripe/oauth',
  baseUrl: 'https://livecoach-dev.web.app'
};
