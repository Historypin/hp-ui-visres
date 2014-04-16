(function($, google, undefined) {
  var geomap = {
      
    map: null,
      
    initialize : function() {
      var mapOptions = {
        zoom : 8,
        center : new google.maps.LatLng(-34.397, 150.644)
      };
      // turn map canvas into a Google Map
      this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    },

    
    /*
     * Spinner to show when we're seeking the location (can be slow)
     */
    
    spinner_start : function() {
      $('#ajax-loader').show();
    },
    
    spinner_stop : function() {
      $('#ajax-loader').hide();
    },

    spinner_timeout : null,
    
    
    /*
     * Geolocation success and failure callbacks
     */
    
    locationcb : function() {
      var that = this;
      return (function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        // round to look the same as creepy polaroid (for Jon, Sasho don't do this)
        lat = Math.floor(lat * 10000) / 10000;
        lon = Math.floor(lon * 10000) / 10000;
        // centre the map
        that.map.setCenter(new google.maps.LatLng(lat, lon));
        that.map.setZoom(20);
        // output debugging info
        console.log('position returned ' + lat + ', ' + lon);
        // stop the spinner (if not already stopped by timeout)
        that.spinner_stop();
        // request an image from Google Streetview
        var url = 'http://maps.googleapis.com/maps/api/streetview?size=1000x1000&sensor=true&location=' + lat + ',' + lon;
        $('#streetview').append('<img src="'+url+'" alt="Street view from ' + lat + ', ' + lon + '" />');
      });
    },

    failcb : function() {
      var that = this;
      return (function(error) {
        // cancel the timeout
        if (that.spinner_timeout != null) {
          that.spinner_timeout = clearTimeout(that.spinner_timeout);
        }
        // stop the spinner
        that.spinner_stop();
        if (typeof error == 'undefined') {
          error = { code: -2, PERMISSION_TIMEOUT: -2 };
        }
        switch (error.code) {
          case error.PERMISSION_DENIED:
            // soft-fail: user changed his/her mind
            console.log('permission to get location denied');
            break;
          case error.PERMISSION_TIMEOUT:
            // soft-fail: user changed his/her mind
            console.log('permission to get location denied (timeout expired)');
            break;
          case error.NO_API_SUPPORT:
            // soft-fail: no API support; maybe try a fallback?
            console.log('unable to get location (no API support)');
            break;
          default : 
            // hard-fail
            alert('Sorry, we were unable to get information on your location.');
            // $('#findme').hide();
        }
      });
    },

    
    /*
     * Find me link click event handler
     */
    
    findme : function() {
      var timeoutLenPermit = 10 * 1000;
      this.spinner_start();
      if (Modernizr.geolocation) {
        // clear any old timeouts if one set
        if (this.spinner_timeout != null) {
          this.spinner_timeout = clearTimeout(this.spinner_timeout);
        }
        // set a timeout on granting permission (to cover 'silent deny' problem in Firefox)
        this.spinner_timeout = setTimeout(this.failcb(), timeoutLenPermit);
        // fire request for location with success and failure callbacks (each with module context)
        navigator.geolocation.getCurrentPosition(this.locationcb(), this.failcb(), { });
      }
      else {
        // get the callback, then execute it to fail (no api support)
        this.failcb()( { code: -1, NO_API_SUPPORT: -1 } );
      }
    },

    last_var_no_comma : 0
  };

  $(document).ready(function() {
    geomap.initialize();
    if (Modernizr.geolocation) {
      $('#findme').click(function(ev) {
        geomap.findme();
        ev.preventDefault();
        return false;
      });    
    } else {
      $('#findme').hide();
    }
  });

})(window.jQuery, window.google, undefined);
