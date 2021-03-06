import Vue from 'vue';
import App from './App.vue';
import store from './store';

import './components';
import './style/loader.scss';
import './plugins/bootstrap-vue';
import './style/smart-mirror.scss';
import { helperFunctions } from './core/HelperFunctions';
import { trafficFunctions } from './core/TrafficFunctions';
import { weatherFunctions } from './core/WeatherFunctions';
import { errorBox, warningBox, successBox } from './data/cssConsoleProperties';

Vue.config.productionTip = false;

new Vue({
  store,
  async created() {
    this.$store.dispatch('loading/SET_LOADING', true);
    window.ipc.on('GET_MAILS', payload => {
      console.log(payload);
      let normalizedPayload = helperFunctions.CreateNormalizedPayloadForEmail(payload);
      console.log(normalizedPayload);
      this.$store.dispatch('email/SET_EMAILS', normalizedPayload);
    });
    await InitApp();
    UpdateApp();
    this.$store.dispatch('loading/SET_LOADING', false);
  },
  render: h => h(App),
}).$mount('#app');

async function InitApp() {
  try {
    console.log('%c[Smart Mirror] App init started', warningBox);
    window.ipc.send('GET_MAILS');
    await weatherFunctions.SetForecastState();
    await weatherFunctions.SetCurrentWeatherState();
    await trafficFunctions.GetTrafficByMultipleTravelMode();
    console.log('%c[Smart Mirror] App startup complete', successBox);
  } catch (error) {
    console.log(`%c[Smart Mirror] App startup failed!\t${error.message}`, errorBox);
    process.exit(1);
  }
}

async function UpdateApp() {
  window.setInterval(async () => {
    window.ipc.send('GET_MAILS');
    await weatherFunctions.SetForecastState();
    await weatherFunctions.SetCurrentWeatherState();
    await trafficFunctions.GetTrafficByMultipleTravelMode(this.$store);
  }, 1800000);
}
