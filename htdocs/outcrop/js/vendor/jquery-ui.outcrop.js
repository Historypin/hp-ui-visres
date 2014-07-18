/**
 * outcrop
 * v0.9.11
 * @copyright Shift/We Are What We Do (http://wearewhatwedo.org/)
 * @license http://www.apache.org/licenses/LICENSE-2.0 Apache 2 Open source licence
 * @author  Alex Stanhope (alex_stanhope@hotmail.com)
 */

  (function( $ ) {
  // static variable
  var intseq = 0;
  
  $.widget( "shift.outcrop", {

    // internal calculation context
    cc: null,

    // default options
    options: {
      // settings

      // debug mode, send debugging messages to console if true
      debug: false,
      // @todo when a drag operation hits the corners, animate crop marks
      _bounceCorners: true,
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
      // x positive coordinate of image (in scaled pixels) to show in top-left of container
      x: null,
      // y positive coordinate of image (in scaled pixels) to show in top-left of container
      y: null,
      // zoom scale of image (as a percentage) where 100 is full-resolution (1:1 px), 200 is double-sized (2:1px) and 0 is container width
      zoom: null,
      dragging: false,
    },

    // EXTERNAL API FUNCTIONS

    // centre the image within the container
    'centre': function() {
      this.cc.init(this, true);
    },

    // @return {object} all the form values
    'values': function() {
      return {
        'x': this.options.x,
        'y': this.options.y,
        'zoom': this.options.zoom,
      }
    },

    // setup the widget
    '_create': function() {
      var that = this, loadingMess;
      var deferred = $.Deferred();
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
        that.options.imageNativeWidth = this.width, that.options.imageNativeHeight = this.height;
        // create handler, which moves/scales the image to this coord
        that.options.moveZoomHandler = that._getMoveZoomHandler(true);
        // hide the loading message
        loadingMess.remove();
        // show image
        $(this).show().animate( { opacity: 1.0 }, 200);
        // resolve deferred
        deferred.resolve();
      }).each(function() {
        if(this.complete) $(this).load();
      });
      // if we're launching straight into an edit, set it up
      if (this.options.mode == 'edit') {
        this._setupEdit();
      }
      // wait until image is loaded before triggering 'ready' event
      deferred.then(function() {
        // fire ready event
        that._trigger('ready');
      });
    },

    // use the destroy method to clean up any modifications your widget has made to the DOM
    'destroy': function() {
      this._destroy();
      // In jQuery UI 1.8, you must invoke the destroy method from the base widget
      $.Widget.prototype.destroy.call( this );
      // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
    },

    '_destroy': function() {
      this._super();
    },

    // Use the _setOption method to respond to changes to options
    '_setOption': function( key, value ) {
      switch( key ) {
        case 'clear':
          // handle changes to clear option
          break;
        case 'mode':
          if (value == 'edit') {
            this._setupEdit();
          } else {
            this._teardownEdit();
          }
      }

      // In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
      $.Widget.prototype._setOption.apply( this, arguments );
      // In jQuery UI 1.9 and above, you use the _super method instead
      this._super( "_setOption", key, value );
    },
    
    _setupEdit: function() {
      var that = this;
      // show the drag cursor
      this.options.jq.addClass('edit');
      // show a message in the middle of the crop area if set, and not already there
      if (this.options.showMessage != false) {
        this.options.jq.append('<div class="message"><span>'+this.options.showMessage+'</span></div>');
      }
      // create handler
      this.options.moveZoomHandler = this._getMoveZoomHandler(true);
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
          that._moveZoomStart();
          // refresh local 'slide' callback with new handler
          $(this).slider( 'option', 'slide', that.options.moveZoomHandler);
        },
        stop: function() {
          that._moveZoomStop();
        }
      });
      // make the image draggable (can't use jQuery UI version)
      this._makeDraggable();
      // add a mousewheel handler for scroll events
      this.options.jq.mousewheel(this._getMousewheelHandler());
      // if responsive, bind to window resize
      if (this.options.watchResize) {
        // $(window).resize(function () {
        //   console.log('caught resize');
        //   // reset handler
        //   that.options.moveZoomHandler = that._getMoveZoomHandler(false);
        // });
        // feed resize event into handler
        $(window).on('resize',this.options.moveZoomHandler);
      }
    },

    _teardownEdit: function() {
      this.options.jq.removeClass('edit');
      // drop message if it exists
      this.options.jq.find('.message').remove();
      // drop slider
      this.options.jqSlider.remove();
      // stop being draggable
      this.options.jq.unbind('mousedown');
      // stop being resizable
      $(window).off('resize');
    },

    _makeDraggable: function() {
      var that = this;
      // catch initial mousedown
      this.options.jq.mousedown(function(event) {
        that.options.dragging = true;
        that._moveZoomStart();
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
          that._moveZoomStop();
          that.options.dragging = false;
          // stop bubble to avoid image thumbnail dragging
          event.preventDefault();
        });
      });
    },
    
    _moveZoomStart: function() {
      var that = this;
      // refresh closure constants in handler for mouse move
      that.options.moveZoomHandler = that._getMoveZoomHandler(false);
    },
    
    _moveZoomStop: function moZoSto() {
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
        that._writeOutFormValues();
        // refresh closure constants in handler for mouse move
        that.options.moveZoomHandler = that._getMoveZoomHandler(false);
      // callback in just X ms; long enough only to avoid repeat scrollevents
      }, 20);
    },

    _getMousewheelHandler: function() {
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
        // do a _moveZoomStop() to put the changed values back into the form
        that._moveZoomStop();
        // stop event from bubbling up
        event.preventDefault();
        return false;
      };
    },

    /**
     * @return value _rounded to 2 decimal places
     */
    _round: function(value) {
      return Math.round(value * 100)/100;
    },

    /**
     * @param off input value to bound
     * @param min minimum bound
     * @param max maximum bound
     */
    _calcBounded: function(off, min, max) {
      // swap min and max if set the wrong way a_round
      if (min > max) {
        var t = min;
        min = max;
        max = t;
      }
      return Math.max(Math.min(off, max), min);
    },

    /**
     * @return {object} a calculation context for computing image properties
     */
    _getCalcContext: function() {
      if (this.cc == null) {
        this.cc = {

          // VARIABLES

          'imageScaledWidth': 0,
          'imageScaledHeight': 0,
          'imageScaledCoordX': 0,
          'imageScaledCoordY': 0,
          'imageSDiffWidth': 0,
          'imageSDiffHeight': 0,
          'imageOffsetStartLeft': 0,
          'imageOffsetStartTop': 0,
          'imageOffsetLeft': 0,
          'imageOffsetTop': 0,
          'imageOffsetWidth': 0,
          'containerTop': 0,
          'containerLeft': 0,
          'containerWidth': 0,
          'containerHeight': 0,
          'imageMinimumWidth': 0,
          'imageMinimumHeight': 0,
          'imageNormCoordZ': 0,
          'imageNormCoordZMin': 0,
          'imageNormCoordZMax': 0,

          // FUNCTIONS

          /**
           * read container dimensions and calculate mins
           */
          'calcContainer': function(jq) {
            var cc = this;
            // find container position and dimensions
            cc.containerTop = jq.offset().top;
            cc.containerLeft = jq.offset().left;
            cc.containerWidth = jq.width();
            cc.containerHeight = jq.height();
            // calculate minimum width
            cc.imageMinimumWidth = cc.containerWidth;
            cc.imageMinimumHeight = cc.containerHeight;
          },

          /**
           * recalculate the scaled image size and the slack a_round the edges of the container
           */
          'recalcBlock': function(that) {
            var cc = this;
            cc.imageScaledWidth = that.options.imageNativeWidth * cc.imageNormCoordZ;
            cc.imageScaledHeight = that.options.imageNativeHeight * cc.imageNormCoordZ;
            cc.imageSDiffWidth = cc.imageScaledWidth - cc.imageMinimumWidth;
            cc.imageSDiffHeight = cc.imageScaledHeight - cc.imageMinimumHeight;
          },

          /**
           * centre the image afresh
           */
          'centre': function(that) {
            var cc = this;
            // image could have been scaled, so need to calc centre based on scaled coords
            that.options.x = Math.max(cc.imageSDiffWidth / 2, 0) / cc.imageNormCoordZ;
            that.options.y = Math.max(cc.imageSDiffHeight / 2, 0) / cc.imageNormCoordZ;
            // zoom is normCoord (0 < cc.imageNormCoordZMax), e.g. could be 0-2.0, so x100
            that.options.zoom = cc.imageNormCoordZ * 100;
            that._writeOutFormValues();
          },

          /**
           * setup the calculations
           */
          'init': function(that, centre) {
            var cc = this;
            cc.calcContainer(that.options.jq);
            // compute the minimum zoom amount that's needed for this image to fill its container, and the maximum based on slideZoomLimit
            cc.imageNormCoordZMin = Math.max(cc.containerWidth / that.options.imageNativeWidth, cc.containerHeight / that.options.imageNativeHeight);
            cc.imageNormCoordZMax = that.options.sliderZoomLimit / 100;
            // crop cc.imageNormCoordZ [0-1 (for 100%) or 0-2 (for 200%)] using computed cc.imageNormCoordZmin, otherwise we can initialise to less than the minimum width/height
            cc.imageNormCoordZ = that._calcBounded(that.options.zoom / 100 , cc.imageNormCoordZMin, cc.imageNormCoordZMax);
            // calculate offsets (scaled offsets)
            cc.recalcBlock(that);
            // if we should re-centre the image
            if (centre) {
              cc.centre(that);
            }
            // capture input x,y (start values) as scaled coords
            cc.imageScaledCoordX = that.options.x;
            cc.imageScaledCoordY = that.options.y;
            // use zoom and input coords to calculate scaled cropped offsets
            cc.imageOffsetWidth = cc.imageScaledWidth;
            cc.imageOffsetLeft = that._calcBounded(-cc.imageScaledCoordX * cc.imageNormCoordZ, -cc.imageSDiffWidth, 0);
            cc.imageOffsetTop = that._calcBounded(-cc.imageScaledCoordY * cc.imageNormCoordZ, -cc.imageSDiffHeight, 0);
            // create start copies, necessary for drag comparison
            cc.imageOffsetStartLeft = cc.imageOffsetLeft;
            cc.imageOffsetStartTop = cc.imageOffsetTop;
          }
        };      
      }
      return this.cc;
    },

    /**
     * _getMoveZoomHandler is called frequently during the life of an outcrop controller.  It's called at start-up, then again
     *   when the image finishes loading.
     * x and y refer to coords (e.g. mouse)
     * l and t refer to offsets (e.g. css top and left)
     * @param firstRun true if this is the first time we're initialising this handler
     */
    _getMoveZoomHandler: function(firstRun) {
      // setup execution context for use in returned function
      var that = this;
      // setup calculation context
      var cc = this._getCalcContext();
      if (firstRun && that.options.resetToCentreOnFirstRun) {
        // set zoom to default
        zoom = that.options.default_zoom;
        // setup and centre
        cc.init(this, true);
      } else {
        // setup, don't centre
        cc.init(this, false);
      }
      // flag that we haven't captured the drag start coords yet
      var mouseDragStartX = -1, mouseDragStartY = -1;
      // flag the intial container size for resize comparison
      var containerStartWidth = cc.containerWidth;
      var containerStartHeight = cc.containerHeight;
      // work out major axis by comparing the amount of slack on x vs y axes
      var majorWidth = (cc.imageSDiffWidth > cc.imageSDiffHeight);
      // output debugging information
      if (that.options.debug && false) {
        // optional debugging output
        console.log('cc.imageSDiffWidth['+cc.imageSDiffWidth+'] cc.imageSDiffHeight['+cc.imageSDiffHeight+'] majorWidth['+majorWidth+']');        
        console.log('cc.imageScaledCoordX['+cc.imageScaledCoordX+'] cc.imageScaledCoordY['+cc.imageScaledCoordY+'] cc.imageNormCoordZ['+cc.imageNormCoordZ+']');
      }
      // check that there major axis has some slack (i.e. the image is bigger than the container along the major axis)
      if ((majorWidth && cc.imageSDiffWidth <= 0) || (!majorWidth && cc.imageSDiffHeight <= 0)) {
        // use defaults
        that.options.x = that.options.default_x;
        that.options.y = that.options.default_y;
        that.options.zoom = that.options.default_zoom;
        that._writeOutFormValues();
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
      // apply initial values to image
      this.options.jqImg.css( {
        'top': that._round(cc.imageOffsetTop) + 'px',
        'left': that._round(cc.imageOffsetLeft) + 'px',
        'width': that._round(cc.imageOffsetWidth) + 'px',
        'height': 'auto',
      });
      
      // return the actual handler
      return function(event, ui) {
        // off_ is the new offset computed as part of this move/zoom
        var offl, offt, offw;
        // dx/dy is the change in x/y for a mouse move
        var dx, dy;
        // coordinates of pointer as if directly over scaled image
        var pointerScaledX, pointerScaledY;
        // coordinates of pointer normalised
        var pointerNormX, pointerNormY;
        // if zooming without scrolling, make effective mouse position be the centre of the container
        if (event.type == 'slide') {
          event.offsetX = cc.containerWidth / 2;
          event.offsetY = cc.containerHeight / 2;
        }
        // compute based on the type of event we're handling
        switch (event.type) {
          case 'resize':
            // treat a resize like a small drag in the opposite direction
            // read the container size now
            cc.calcContainer(that.options.jq);
            // diff the container size (delta width/height)
            var dw = cc.containerWidth - containerStartWidth;
            var dh = cc.containerHeight - containerStartHeight;
            // nudge by half the deltas
            dx = dw / 2;
            dy = dh / 2;
            // now if dx+containerWidth or dy+containerHeight exceed the bounds of the image, we may have to zoom
            if ((dx + cc.containerWidth) > cc.imageScaledWidth || (dy + cc.containerHeight) > cc.imageScaledHeight) {
              // compute independent scaling factors for x and y
              var sfacDx = (dx + cc.containerWidth) / that.options.imageNativeWidth;
              var sfacDy = (dy + cc.containerHeight) / that.options.imageNativeHeight;
              // then take max zoom to cover all of container
              cc.imageNormCoordZ = Math.max(sfacDx, sfacDy);
            }
            break;
          case 'mousemove':
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
            break;
          case 'slide':
          case 'scrollzoom':
            // work out position of pointer using scaled coord and scaled current position (offsetX)
            pointerScaledX = cc.imageScaledCoordX + (event.offsetX / cc.imageScaledWidth) * that.options.imageNativeWidth;
            pointerScaledY = cc.imageScaledCoordY + (event.offsetY / cc.imageScaledHeight) * that.options.imageNativeHeight;
            // normalise coordinates
            pointerNormX = pointerScaledX / that.options.imageNativeWidth;
            pointerNormY = pointerScaledY / that.options.imageNativeHeight;
            // slider returns values from 0-100, optionally reverse to 100-0, then scale to sliderZoomLimit
            var sliderValue = (that.options.sliderReverse ? 100 - ui.value : ui.value) * cc.imageNormCoordZMax;
            // calculate new normalized coord, between sliderZoomLimit/100 and near 0, say 2-0.15 (cc.imageNormCoordZMin)
            cc.imageNormCoordZ = that._calcBounded((sliderValue / 100) + 0.0001, cc.imageNormCoordZMin, cc.imageNormCoordZMax);
            break;
        }
        // recalc block
        cc.recalcBlock(that);
        // action-specific calculation
        switch (event.type) {
          case 'resize':
          case 'mousemove':
            // compute offset of image to container, then bound between 0 and max real image dimensions
            offl = that._calcBounded(cc.imageOffsetStartLeft + dx, -cc.imageSDiffWidth, 0);
            offt = that._calcBounded(cc.imageOffsetStartTop + dy, -cc.imageSDiffHeight, 0);
            // used to bound by that.options.imageNativeWidth, but smaller-than-container images need to fill container (therefore > native)
            offw = that._calcBounded(cc.imageScaledWidth, cc.containerWidth, cc.imageScaledWidth);
            if (that.options.debug && false) {
              // optional debugging output
              console.log('cc.imageOffsetStartLeft['+cc.imageOffsetStartLeft+'] cc.imageOffsetStartTop['+cc.imageOffsetStartTop+'] cc.imageNormCoordZ['+cc.imageNormCoordZ+'] px['+event.pageX+'] py['+event.pageY+'] dx['+dx+'] dy['+dy+'] offl['+offl+'] offt['+offt+'] offw['+offw+']');
            }
            break;
          case 'slide':
          case 'scrollzoom':
            // new coord is normalised pointer coord mapped back onto image, translated back to cursor position, then bound between 0 and max real image dimensions
            offl = that._calcBounded(-pointerNormX * cc.imageScaledWidth + event.offsetX, -cc.imageSDiffWidth, 0);
            offt = that._calcBounded(-pointerNormY * cc.imageScaledHeight + event.offsetY, -cc.imageSDiffHeight, 0);
            offw = that._calcBounded(cc.imageScaledWidth, cc.containerWidth, cc.imageScaledWidth);
            if (that.options.debug && false) {
              // optional debugging output
              console.log('cc.imageOffsetLeft['+cc.imageOffsetLeft+'] cc.imageOffsetTop['+cc.imageOffsetTop+'] cc.imageSDiffWidth['+cc.imageSDiffWidth+'] cc.imageSDiffHeight['+cc.imageSDiffHeight+'] cc.imageNormCoordZ['+cc.imageNormCoordZ+'] offsetX['+event.offsetX+'] offsetY['+event.offsetY+'] offl['+offl+'] offt['+offt+'] offw['+offw+']');
            }
            break;
        }
        // if there's been a coordinate change
        if ((offl != cc.imageOffsetLeft) || (offt != cc.imageOffsetTop) || (offw != cc.imageOffsetWidth)) {
          // write to coordinates of image
          that.options.jqImg.css( {
            // image_width - container_width > x > 0
            'left': that._round(offl) + 'px',
            // image_height - container_height > x > 0
            'top': that._round(offt) + 'px',
            // image zoom reflected by image width
            'width': that._round(offw) + 'px'
          });
          if (that.options.showShadow) {
            // calculate coords on image from window reference
            if (that.options.jqImgClone == null) {
              // create a semi-transparent copy of the image
              that.options.jqImgClone = that.options.jqImg.clone().addClass('outcrop-clone').appendTo(that.element.parent());
            }
            if (that.options.jqImgClone.length) {
              that.options.jqImgClone.css( {
                'left': that._round(cc.containerLeft + offl) + 'px',
                'top': that._round(cc.containerTop + offt) + 'px',
                'width': that._round(offw) + 'px',
                'opacity': 0.5,
                'display': 'block'
              } );
            }
          }
          // store coords in case this is the last frame before dragEnd/sliderStop
          that.options.x = cc.imageScaledCoordX = Math.max(-offl / cc.imageNormCoordZ, 0);
          that.options.y = cc.imageScaledCoordY = Math.max(-offt / cc.imageNormCoordZ, 0);
          that.options.zoom = that._calcBounded(cc.imageNormCoordZ * 100, 0, that.options.sliderZoomLimit);
          // if option set, bounce corners
          if (that.options._bounceCorners) {
            if ((offl == 0) && (offt == 0)) {
              that._bounceCorner(0,0);
            }
            if ((offl == 0+cc.containerWidth-that.options.imageNativeWidth) && (offt == 0+cc.containerHeight-that.options.imageNativeHeight)) {
              that._bounceCorner(cc.containerWidth, cc.containerHeight);
            }
          }
          // remember computed offset for comparison next time
          cc.imageOffsetLeft = offl;
          cc.imageOffsetTop = offt;
          cc.imageOffsetWidth = offw;
        }
      };
    },
    
    _bounceCorner: function(x, y) {
      // console.log('bounce x['+x+'] y['+y+']');
      // @todo animate a square div behind the container (looks like cropmarks)
      // solid to start, then border on two sides
    },
    
    _writeOutFormValues: function() {
      $('input[name="'+this.options.name_x+'"]').val(this._round(this.options.x)).trigger('change');
      $('input[name="'+this.options.name_y+'"]').val(this._round(this.options.y)).trigger('change');
      $('input[name="'+this.options.name_zoom+'"]').val(this._round(this.options.zoom)).trigger('change');
    },

    lastElementIgnore: 0
  });
}( window.jQuery ) );

/**
 * jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL
 */

(function($) {

  var o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

}(window.jQuery));
