(function($, ath, undefined) {

  $(document).ready(function() {
    // use ath alias of global window.addToHomescreen
    // http://cubiq.org/add-to-home-screen
    addToHomescreen({
      // wait 0.5 seconds before showing the add to homescreen message
      startDelay: 0.5,
      // turn debug on to show on every browser
      debug: false
    });
  });

})(window.jQuery, window.addToHomescreen, undefined);
