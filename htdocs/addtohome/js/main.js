(function($, ath, undefined) {

  var localInstance;

  $(document).ready(function() {
    // use ath alias of global window.addToHomescreen
    // http://cubiq.org/add-to-home-screen
    localInstance = ath({
      // wait 0.5 seconds before showing the add to homescreen message
      startDelay: 0.5,
      // only ever show the call out once
      maxDisplayCount: 1,
      // turn debug on to show on every browser
      debug: false,
    });

    // TESTING ONLY

    // bind to buttons
    $('#removecook').click(function(event) {
      ath.removeSession();
      event.preventDefault();
    });

  });

})(window.jQuery, window.addToHomescreen, undefined);
