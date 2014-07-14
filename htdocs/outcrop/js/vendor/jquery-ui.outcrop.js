/**
 * outcrop
 * v0.9.7
 * @copyright Shift/We Are What We Do (http://wearewhatwedo.org/)
 * @license http://www.apache.org/licenses/LICENSE-2.0 Apache 2 Open source licence
 * @author  Alex Stanhope (alex_stanhope@hotmail.com)
 */

  (function( $ ) {
  // static variable
  var intseq = 0;
  
  $.widget( "shift.outcrop", {

    // default options
    options: {
      // settings

      // debug mode, send debugging messages to console if true
      debug: false,
      // @todo when a drag operation hits the corners, animate crop marks
      bounceCorners: true,
      // listen for container resize event, for responsive containers
      watchResize: true,
      // @todo show a shadow image during dragging operations
      showShadow: false,
      // show a message
      showMessage: 'Drag to move<br />Scroll to zoom',
      // name of form field to write 'x' coord into
      name_x: 'x',
      // name of form field to write 'y' coord into
      name_y: 'y',
      // name of form field to write zoom coord into
      name_zoom: 'zoom',
      // scaling factor applied to mousescroll events
      sliderZoomScalingFactor: 0.2,
      // maximum zoom
      sliderZoomLimit: 100,
      // by default, slider is appended to outcrop container
      sliderZoomAttachPoint: null,
      // by default the slider zooms in going left
      sliderReverse: false,
      // default intial values
      default_x: 0,
      default_y: 0,
      default_zoom: 0.1, // zoomed all the way out, approximates 0 without div/zero errors
      // reset to centre of image on edit
      resetToCentreOnFirstRun: false,

      // state
      clear: null,
      mode: 'read',
      id: null,
      jq: null,
      jqImg: null,
      jqImgClone: null,
      jqSlider: null,
      // x offset in pixels
      x: null,
      // y offset in pixels
      y: null,
      // zoom value as image size percentage (e.g. 200% for 2x zoom)
      zoom: null,
      dragging: false,
    },

    // setup the widget
    _create: function() {
      var that = this, loadingMess;
      // assign this instance an ID
      this.options.id = intseq++;
      // make sure we've got the outcrop class on the called container $('<x>').outcrop();
      this.element.addClass('outcrop');
      // fill in attach point if unset
      if (this.options.sliderZoomAttachPoint == null) {
        this.options.sliderZoomAttachPoint = this.element;
      }
      // find the contained image
      this.options.jqImg = this.element.find('img');
      // hide it right away, until we've computed correct size
      this.options.jqImg.hide().css('opacity', 0.0);
      // wrap the image in a cropping div
      this.options.jqImg.wrap('<div id="outcrop-wrapid-' + this.options.id + '" class="cropped"></div>');
      // read back the wrapper's jQuery object
      this.options.jq = $('#outcrop-wrapid-' + this.options.id);
      // show a loading message in the middle of the crop area
      this.options.jq.append('<div class="message"><span>Large image<br />loading...</span></div>');
      loadingMess = this.options.jq.find('.message');
      // read x, y and zoom out of the form elements only if not already explicitly set
      if (this.options.x == null) { this.options.x = parseInt($('input[name="'+this.options.name_x+'"]').val(),10); }
      if (this.options.y == null) { this.options.y = parseInt($('input[name="'+this.options.name_y+'"]').val(),10); }
      if (this.options.zoom == null) { this.options.zoom = parseInt($('input[name="'+this.options.name_zoom+'"]').val(),10); }
      // setup defaults if form fields empty
      if (isNaN(this.options.x)) this.options.x = this.options.default_x;
      if (isNaN(this.options.y)) this.options.y = this.options.default_y;
      if (isNaN(this.options.zoom)) this.options.zoom = this.options.default_zoom;
      // once image is loaded, read dimensions and prep
      this.options.jqImg.one('load', function() {
        // read image dimensions
        that.options.imageWidthNative = this.width, that.options.imageHeightNative = this.height;
        // create handler, which moves/scales the image to this coord
        that.options.moveZoomHandler = that.getMoveZoomHandler(that.options.x, that.options.y, that.options.zoom, true);
        // hide the loading message
        loadingMess.remove();
        // show image
        $(this).show().animate( { opacity: 1.0 }, 200);
      }).each(function() {
        if(this.complete) $(this).load();
      });
      // if responsive container, bind to container resize
      if (this.options.watchResize) {
        this.options.jq.resize(function () {
          // reset handler
          that.options.moveZoomHandler = that.getMoveZoomHandler(that.options.x, that.options.y, that.options.zoom, false);
        });
      }
      // if we're launching straight into an edit, set it up
      if (this.options.mode == 'edit') {
        this.setupEdit();
      }
    },

    // Use the _setOption method to respond to changes to options
    _setOption: function( key, value ) {
      switch( key ) {
        case 'clear':
          // handle changes to clear option
          break;
        case 'mode':
          if (value == 'edit') {
            this.setupEdit();
          } else {
            this.teardownEdit();
          }
      }

      // In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
      $.Widget.prototype._setOption.apply( this, arguments );
      // In jQuery UI 1.9 and above, you use the _super method instead
      this._super( "_setOption", key, value );
    },
    
    setupEdit: function() {
      var that = this;
      // show the drag cursor
      this.options.jq.addClass('edit');
      // show a message in the middle of the crop area if set, and not already there
      if (this.options.showMessage != false) {
        this.options.jq.append('<div class="message"><span>'+this.options.showMessage+'</span></div>');
      }
      // create handler
      this.options.moveZoomHandler = this.getMoveZoomHandler(this.options.x, this.options.y, this.options.zoom, true);
      // show a zoom slider underneath the image
      var sliderValue = (that.options.zoom / that.options.sliderZoomLimit) * 100;
      this.options.sliderZoomAttachPoint.append('<div id="outcrop-zoomslider" class="slider"></div>');
      this.options.jqSlider = $('#outcrop-zoomslider').slider( {
        // slider value is always between 0 and 100
        value: (that.options.sliderReverse ? 100 - sliderValue : sliderValue),
        slide: function(event, ui) {
          // indirect handler so that it always uses the latest stored that.options.moveZoomHandler
          return that.options.moveZoomHandler(event, ui);
        },
        start: function(event, ui) {
          that.moveZoomStart();
          // refresh local 'slide' callback with new handler
          $(this).slider( 'option', 'slide', that.options.moveZoomHandler);
        },
        stop: function() {
          that.moveZoomStop();
        }
      });
      // make the image draggable (can't use jQuery UI version)
      this.makeDraggable();
      // add a mousewheel handler for scroll events
      this.options.jq.mousewheel(this.getMousewheelHandler());
    },

    teardownEdit: function() {
      this.options.jq.removeClass('edit');
      // drop message if it exists
      this.options.jq.find('.message').remove();
      // drop slider
      this.options.jqSlider.remove();
      // stop being draggable
      this.options.jq.unbind('mousedown');
    },

    makeDraggable: function() {
      var that = this;
      // catch initial mousedown
      this.options.jq.mousedown(function(event) {
        that.options.dragging = true;
        that.moveZoomStart();
        // catch all mouse movement while down
        $(window).mousemove(that.options.moveZoomHandler);
        // stop bubble to avoid image thumbnail dragging
        event.preventDefault();
        // catch mouse up (end of drag) anywhere
        $(window).mouseup(function(event) {
          // stop listening for mouse movements
          $(window).unbind('mousemove');
          $(window).unbind('mouseup');
          // flag no longer dragging
          that.moveZoomStop();
          that.options.dragging = false;
          // stop bubble to avoid image thumbnail dragging
          event.preventDefault();
        });
      });
    },
    
    moveZoomStart: function() {
      var that = this;
      // refresh closure constants in handler for mouse move
      that.options.moveZoomHandler = that.getMoveZoomHandler(that.options.x, that.options.y, that.options.zoom, false);
    },
    
    moveZoomStop: function moZoSto() {
      var that = this;
      // if we've already got a callback defined, clear it and reset
      if (typeof moZoSto.callback != 'undefined') {
        moZoSto.callback = clearTimeout(moZoSto.callback);
      }
      // callback in a short while
      moZoSto.callback = setTimeout(function() {
        if (that.options.jqImgClone != null) {
            // destory clone
            that.options.jqImgClone.animate({ 'opacity': 0}, 200, function() { $(this).remove(); } );
            that.options.jqImgClone = null;
        }
        // store coordinates back into form and trigger change listeners
        that.writeOutFormValues();
        // refresh closure constants in handler for mouse move
        that.options.moveZoomHandler = that.getMoveZoomHandler(that.options.x, that.options.y, that.options.zoom, false);
      // callback in just X ms; long enough only to avoid repeat scrollevents
      }, 20);
    },

    getMousewheelHandler: function() {
      var that = this;
      return function(event) {
        var sliderValue, inc, minBound;
        if (that.options.debug) {
          console.log('scroll dx[' + event.deltaX + '] dy[' + event.deltaY + '] factor[' + event.deltaFactor + '] offsetX[' + event.offsetX + '] offsetY[' + event.offsetY + ']');
        }
        // get the slider's current value
        sliderValue = that.options.jqSlider.slider('value');
        // increment based on scroll but always at least +/-1 slider unit
        inc = event.deltaFactor * (0 - event.deltaY) * that.options.sliderZoomScalingFactor;
        inc = ( inc > 0 ? Math.max(inc, 1) : Math.min(inc, -1) );
        // apply new value to slider
        that.options.jqSlider.slider('value', sliderValue + inc);
        // call zoom handler to react manually to slider change
        that.options.moveZoomHandler( { type: 'scrollzoom', offsetX: event.offsetX, offsetY: event.offsetY }, { value: (sliderValue + inc) } );
        // do a moveZoomStop() to put the changed values back into the form
        that.moveZoomStop();
        // stop event from bubbling up
        event.preventDefault();
        return false;
      };
    },

    /**
     * @return value rounded to 2 decimal places
     */
    round: function(value) {
      return Math.round(value * 100)/100;
    },

    /**
     * @param off input value to bound
     * @param min minimum bound
     * @param max maximum bound
     */
    calcBounded: function(off, min, max) {
      // swap min and max if set the wrong way around
      if (min > max) {
        var t = min;
        min = max;
        max = t;
      }
      return Math.max(Math.min(off, max), min);
    },
      
    /**
     * getMoveZoomHandler is called frequently during the life of an outcrop controller.  It's called at start-up, then again
     *   when the image finishes loading.
     * x and y refer to coords (e.g. mouse)
     * l and t refer to offsets (e.g. css top and left)
     * @param x positive coordinate of image (in native pixels) to show in top-left of container
     * @param y positive coordinate of image (in native pixels) to show in top-left of container
     * @param zoom scale of image (as a percentage) where 100 is full-resolution (1:1 px) and 0 is container width
     * @param firstRun true if this is the first time we're initialising this handler
     */
    getMoveZoomHandler: function(x, y, zoom, firstRun) {
      var imageWidthScaled, imageHeightScaled;
      var imageWidthSDiff, imageHeightSDiff;
      // setup context for use in returned function
      var that = this;
      // find container position and dimensions
      var containerTop = this.options.jq.offset().top, containerLeft = this.options.jq.offset().left;
      var containerWidth = this.options.jq.width(), containerHeight = this.options.jq.height();
      // calculate minimum width
      var imageWidthMinimum = containerWidth, imageHeightMinimum = containerHeight;
      // flag that we haven't captured the drag start coords yet
      var mouseDragStartX = -1, mouseDragStartY = -1;
      // capture input zoom as start value (unscaled coords)
      var imageNormCoordZ = zoom / 100; // 0-1 (for 100%) or 0-2 (for 200%)
      // if this a firstRun setup and we're supposed to resetToCentreOnFirstRun
      if (firstRun && that.options.resetToCentreOnFirstRun) {
        // set zoom to default
        imageNormCoordZ = that.options.default_zoom / that.options.sliderZoomLimit;
      }
      // compute the minimum zoom amount that's needed for this image to fill its container
      imageNormCoordZMin = Math.max(containerWidth / that.options.imageWidthNative, containerHeight / that.options.imageHeightNative);
      imageNormCoordZMax = that.options.sliderZoomLimit / 100;
      // crop imageNormCoordZ using computed imageNormCoordZmin, otherwise we can initialise to less than the minimum width/height
      imageNormCoordZ = that.calcBounded(imageNormCoordZ, imageNormCoordZMin, imageNormCoordZMax);
      // calculate offsets (scaled offsets)
      imageWidthScaled = that.options.imageWidthNative * imageNormCoordZ;
      imageHeightScaled = that.options.imageHeightNative * imageNormCoordZ;
      imageWidthSDiff = imageWidthScaled - imageWidthMinimum;
      imageHeightSDiff = imageHeightScaled - imageHeightMinimum;
      // work out major axis by comparing the amount of slack on x vs y axes
      var majorWidth = (imageWidthSDiff > imageHeightSDiff);
      if (false) {
        console.log('imageWidthSDiff['+imageWidthSDiff+'] imageHeightSDiff['+imageHeightSDiff+'] majorWidth['+majorWidth+']');        
      }
      // check that there major axis has some slack (i.e. the image is bigger than the container along the major axis)
      if ((majorWidth && imageWidthSDiff <= 0) || (!majorWidth && imageHeightSDiff <= 0)) {
        // use defaults
        that.options.x = that.options.default_x;
        that.options.y = that.options.default_y;
        that.options.zoom = that.options.default_zoom;
        that.writeOutFormValues();
        // force image to fill container
        this.options.jqImg.css( {
          'top': 0,
          'left': 0,
          'width': (majorWidth ? 'auto' : '100%'),
          'height': (majorWidth ? '100%' : 'auto'),
        });
        // return inactive event handler, because we can't do any zooming/dragging
        return function(event, ui) { };
      }
      // capture input x,y as start values (unscaled coords)
      var imageNativeCoordX = x, imageNativeCoordY = y;
      // if this a firstRun setup and we're supposed to resetToCentreOnFirstRun
      if (firstRun && that.options.resetToCentreOnFirstRun) {
        // set the imageNativeCoordX/Y as the image centre, which means it displays slightly off-centre, but that's ok
        imageNativeCoordX = (that.options.imageWidthNative / 2) - (containerWidth / 2);
        imageNativeCoordY = (that.options.imageHeightNative / 2) - (containerHeight / 2);
        // store back modified coords, as if we'd done a drag and finished there
        that.options.x = imageNativeCoordX;
        that.options.y = imageNativeCoordY;
        // zoom is normCoord (0 < imageNormCoordZMax), e.g. could be 0-2.0, so x100
        that.options.zoom = imageNormCoordZ * 100;
        that.writeOutFormValues();
      }
      // output debugging information for cropped x,y,zoom
      if (that.options.debug) {
        // optional debugging output
        console.log('imageNativeCoordX['+imageNativeCoordX+'] imageNativeCoordY['+imageNativeCoordY+'] imageNormCoordZ['+imageNormCoordZ+']');
      }
      // use zoom and input coords to calculate scaled cropped offsets
      var imageOffsetWidth = imageWidthScaled;
      var imageOffsetLeft = that.calcBounded(-imageNativeCoordX * imageNormCoordZ, -imageWidthSDiff, 0);
      var imageOffsetTop = that.calcBounded(-imageNativeCoordY * imageNormCoordZ, -imageHeightSDiff, 0);
      // create start variants, necessary for drag comparison
      var imageOffsetStartLeft = imageOffsetLeft;
      var imageOffsetStartTop = imageOffsetTop;
      // apply initial values to image
      this.options.jqImg.css( {
        'top': that.round(imageOffsetTop) + 'px',
        'left': that.round(imageOffsetLeft) + 'px',
        'width': that.round(imageOffsetWidth) + 'px',
        'height': 'auto',
      });
      // flag that clone is created but not visible yet
      var cloneVisible = false;
      
      // return the actual handler
      return function(event, ui) {
        // off_ is the new offset computed as part of this move/zoom
        var offl, offt, offw;
        // dx/dy is the change in x/y for a mouse move
        var dx, dy;
        // coordinates of pointer as if directly over native image
        var pointerNativeX, pointerNativeY;
        // coordinates of pointer normalised
        var pointerNormX, pointerNormY;
        // if zooming without scrolling, make effective mouse position be the centre of the container
        if (event.type == 'slide') {
          event.offsetX = containerWidth / 2;
          event.offsetY = containerHeight / 2;
        }
        // compute based on the type of event we're handling
        if (event.type == 'mousemove') {
          // capture mouse start coords if unset
          if (mouseDragStartX == -1) {
            mouseDragStartX = event.pageX;
          }
          if (mouseDragStartY == -1) {
            mouseDragStartY = event.pageY;
          }
          // compute difference between mouse start coord and current coord
          dx = event.pageX - mouseDragStartX;
          dy = event.pageY - mouseDragStartY;
        } else if ((event.type == 'slide') || (event.type == 'scrollzoom')) {
          // work out position of pointer using native coord and scaled current position (offsetX)
          pointerNativeX = imageNativeCoordX + (event.offsetX / imageWidthScaled) * that.options.imageWidthNative;
          pointerNativeY = imageNativeCoordY + (event.offsetY / imageHeightScaled) * that.options.imageHeightNative;
          // normalise coordinates
          pointerNormX = pointerNativeX / that.options.imageWidthNative;
          pointerNormY = pointerNativeY / that.options.imageHeightNative;
          // slider returns values from 0-100, optionally reverse to 100-0, then scale to sliderZoomLimit
          var sliderValue = (that.options.sliderReverse ? 100 - ui.value : ui.value) * imageNormCoordZMax;
          // calculate new normalized coord, between sliderZoomLimit/100 and near 0, say 2-0.15 (imageNormCoordZMin)
          imageNormCoordZ = that.calcBounded((sliderValue / 100) + 0.0001, imageNormCoordZMin, imageNormCoordZMax);
        }
        // recalc block
        imageWidthScaled = that.options.imageWidthNative * imageNormCoordZ;
        imageHeightScaled = that.options.imageHeightNative * imageNormCoordZ;
        imageWidthSDiff = imageWidthScaled - imageWidthMinimum;
        imageHeightSDiff = imageHeightScaled - imageHeightMinimum;
        // action-specific calculation
        if (event.type == 'mousemove') {
          // compute offset of image to container, then bound between 0 and max real image dimensions
          offl = that.calcBounded(imageOffsetStartLeft + dx, -imageWidthSDiff, 0);
          offt = that.calcBounded(imageOffsetStartTop + dy, -imageHeightSDiff, 0);
          // used to bound by that.options.imageWidthNative, but smaller-than-container images need to fill container (therefore > native)
          offw = that.calcBounded(imageWidthScaled, containerWidth, imageWidthScaled);
          if (that.options.debug) {
            // optional debugging output
            console.log('imageOffsetStartLeft['+imageOffsetStartLeft+'] imageOffsetStartTop['+imageOffsetStartTop+'] imageNormCoordZ['+imageNormCoordZ+'] px['+event.pageX+'] py['+event.pageY+'] dx['+dx+'] dy['+dy+'] offl['+offl+'] offt['+offt+'] offw['+offw+']');
          }
        } else if ((event.type == 'slide') || (event.type == 'scrollzoom')) {
          // new coord is normalised pointer coord mapped back onto image, translated back to cursor position, then bound between 0 and max real image dimensions
          offl = that.calcBounded(-pointerNormX * imageWidthScaled + event.offsetX, -imageWidthSDiff, 0);
          offt = that.calcBounded(-pointerNormY * imageHeightScaled + event.offsetY, -imageHeightSDiff, 0);
          offw = that.calcBounded(imageWidthScaled, containerWidth, imageWidthScaled);
          if (that.options.debug) {
            // optional debugging output
            console.log('imageOffsetLeft['+imageOffsetLeft+'] imageOffsetTop['+imageOffsetTop+'] imageWidthSDiff['+imageWidthSDiff+'] imageHeightSDiff['+imageHeightSDiff+'] imageNormCoordZ['+imageNormCoordZ+'] offsetX['+event.offsetX+'] offsetY['+event.offsetY+'] offl['+offl+'] offt['+offt+'] offw['+offw+']');
          }
        }
        // if there's been a coordinate change
        if ((offl != imageOffsetLeft) || (offt != imageOffsetTop) || (offw != imageOffsetWidth)) {
          // write to coordinates of image
          that.options.jqImg.css( {
            // image_width - container_width > x > 0
            'left': that.round(offl) + 'px',
            // image_height - container_height > x > 0
            'top': that.round(offt) + 'px',
            // image zoom reflected by image width
            'width': that.round(offw) + 'px'
          });
          if (that.options.showShadow) {
            // calculate coords on image from window reference
            if (that.options.jqImgClone == null) {
              // create a semi-transparent copy of the image
              that.options.jqImgClone = that.options.jqImg.clone().addClass('outcrop-clone').appendTo(that.element.parent());
            }
            if (that.options.jqImgClone != null) {
              that.options.jqImgClone.css( {
                'left': that.round(containerLeft + offl) + 'px',
                'top': that.round(containerTop + offt) + 'px',
                'width': that.round(offw) + 'px',
                'opacity': 0.5,
                'display': 'block'
              } );
            }
          }
          // store coords in case this is the last frame before dragEnd/sliderStop
          that.options.x = imageNativeCoordX = Math.max((0 - offl) / imageNormCoordZ, 0);
          that.options.y = imageNativeCoordY = Math.max((0 - offt) / imageNormCoordZ, 0);
          that.options.zoom = that.calcBounded(imageNormCoordZ * 100, 0, that.options.sliderZoomLimit);
          // if option set, bounce corners
          if (that.options.bounceCorners) {
            if ((offl == 0) && (offt == 0)) {
              that.bounceCorner(0,0);
            }
            if ((offl == 0+containerWidth-that.options.imageWidthNative) && (offt == 0+containerHeight-that.options.imageHeightNative)) {
              that.bounceCorner(containerWidth, containerHeight);
            }
          }
          // remember computed offset for comparison next time
          imageOffsetLeft = offl;
          imageOffsetTop = offt;
          imageOffsetWidth = offw;
        }
      };
    },
    
    bounceCorner: function(x, y) {
      // console.log('bounce x['+x+'] y['+y+']');
      // @todo animate a square div behind the container (looks like cropmarks)
      // solid to start, then border on two sides
    },
    
    values: function() {
      return {
        'x': this.options.x,
        'y': this.options.y,
        'zoom': this.options.zoom,
      }
    },

    writeOutFormValues: function() {
      $('input[name="'+this.options.name_x+'"]').val(this.round(this.options.x)).trigger('change');
      $('input[name="'+this.options.name_y+'"]').val(this.round(this.options.y)).trigger('change');
      $('input[name="'+this.options.name_zoom+'"]').val(this.round(this.options.zoom)).trigger('change');
    },

    // Use the destroy method to clean up any modifications your widget has made to the DOM
    destroy: function() {
      // In jQuery UI 1.8, you must invoke the destroy method from the base widget
      $.Widget.prototype.destroy.call( this );
      // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
    }
  });
}( window.jQuery ) );
