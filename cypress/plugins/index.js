
module.exports = (on, config) => {
  on('task', {
    log(message) {
      console.log(message);
      return null;
    },
    error(message) {
      console.error(message);
      return null;
    }
  });
};