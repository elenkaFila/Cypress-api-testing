import { defineConfig } from 'cypress';
import allureWriter from '@shelex/cypress-allure-plugin/writer.js';
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Инициализация задач Allure (включает writeAllureResults и getPendingAllureResults)
      allureWriter(on, config);

      // Дополнительная пользовательская задача
      on('task', {
        logIds(ids) {
          console.log('Booking IDs:', ids);
          return null;
        }
      });

      return config;
    },
    env: {
      allure: true
    }
  },
});
