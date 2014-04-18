  (function( $ ) {
  // static variable
  var intseq = 0;
  
  $.widget( "shift.outcrop", {

    // default options
    options: { 
      // settings

      // debug mode, send debugging messages to console if true
      debug: true,
      // when a drag operation hits the corners, animate crop marks
      bounceCorners: true,
      // listen for container resize event, for responsive containers
      watchResize: true,
      // show a shadow image during dragging operations
      showShadow: false,
      // name of form field to write 'x' coord into
      name_x: 'x',
      // name of form field to write 'y' coord into
      name_y: 'y',
      // name of form field to write zoom coord into
      name_zoom: 'zoom',
      // scaling factor applied to mousescroll events
      sliderZoomScalingFactor: 0.2,

      // state
      clear: null,
      mode: 'read',
      id: null,
      jq: null,
      jqImg: null,
      jqImgClone: null,
      jqSlider: null,
      x: 0,
      y: 0,
      zoom: 0,
      dragging: false,
    },

    // setup the widget
    _create: function() {
      var that = this, proxyImg;
      // assign this instance an ID
      this.options.id = intseq++;
      // find the contained image
      this.options.jqImg = this.element.find('img');
      // hide it right away, until we've computed correct size
      this.options.jqImg.hide().css('opacity', 0.0);
      // wrap the image in a cropping div
      this.options.jqImg.wrap('<div id="outcrop-wrapid-' + this.options.id + '" class="cropped"></div>');
      // read back the wrapper's jQuery object
      this.options.jq = $('#outcrop-wrapid-' + this.options.id);
      // read x and y out of the form elements
      this.options.x = parseInt(this.element.find('input[name="'+this.options.name_x+'"]').val(),10);
      this.options.y = parseInt(this.element.find('input[name="'+this.options.name_y+'"]').val(),10);
      this.options.zoom = parseInt(this.element.find('input[name="'+this.options.name_zoom+'"]').val(),10);
      // once image is loaded, read dimensions and prep
      this.options.jqImg.one('load', function() {
        // read image dimensions
        that.options.imageWidthNative = $(this).width(), that.options.imageHeightNative = $(this).height();
        // create handler, which moves/scales the image to this coord
        that.options.moveZoomHandler = that.getMoveZoomHandler(that.options.x, that.options.y, that.options.zoom);        
        // show image
        $(this).show().animate( { opacity: 1.0 }, 200);
      }).each(function() {
        if(this.complete) $(this).load();
      });
      // if responsive container, bind to container resize
      if (this.options.watchResize) {
        this.options.jq.resize(function () {
          // reset handler
          that.options.moveZoomHandler = that.getMoveZoomHandler(that.options.x, that.options.y, that.options.zoom);        
        });
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
      // show a message in the middle of the crop area
      this.options.jq.append('<div class="message"><span>Drag to move<br />Scroll to zoom</span></div>');
      // create handler
      this.options.moveZoomHandler = this.getMoveZoomHandler(this.options.x, this.options.y, this.options.zoom);
      // show a zoom slider underneath the image
      this.options.jq.parent().append('<div id="outcrop-zoomslider" class="slider"></div>');
      this.options.jqSlider = $('#outcrop-zoomslider').slider( {
        value: 100 - that.options.zoom,
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
      // drop message
      this.options.jq.find('.message').remove();
      // drop slider
      this.options.jq.parent().find('.slider').remove();
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
        });
      });
    },
    
    moveZoomStart: function() {
      var that = this;
      // refresh closure constants in handler for mouse move
      that.options.moveZoomHandler = that.getMoveZoomHandler(that.options.x, that.options.y, that.options.zoom);
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
        that.element.find('input[name="'+that.options.name_x+'"]').val(that.options.x).trigger('change');
        that.element.find('input[name="'+that.options.name_y+'"]').val(that.options.y).trigger('change');
        that.element.find('input[name="'+that.options.name_zoom+'"]').val(that.options.zoom).trigger('change');
        // refresh closure constants in handler for mouse move
        that.options.moveZoomHandler = that.getMoveZoomHandler(that.options.x, that.options.y, that.options.zoom);
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
        // increment based on scroll but always at least +/-1 percentage point
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
     * x and y refer to coords (e.g. mouse)
     * l and t refer to offsets (e.g. css top and left)
     * @param x positive coordinate of image (in native pixels) to show in top-left of container
     * @param y positive coordinate of image (in native pixels) to show in top-left of container
     * @param zoom scale of image (as a normalised percentage) where 100 is full-resolution (1:1 px) and 0 is container width
     */
    getMoveZoomHandler: function(x, y, zoom) {
      var imageWidthScaled, imageHeightScaled;
      var imageWidthSDiff, imageHeightSDiff;
      // setup context for use in returned function
      var that = this;
      // find container position and dimensions
      var containerTop = this.options.jq.offset().top, containerLeft = this.options.jq.offset().left;
      var containerWidth = this.options.jq.width(), containerHeight = this.options.jq.height();
      // calculate minimum width, @todo while still filling container
      var imageWidthMinimum = containerWidth, imageHeightMinimum = containerHeight;
      // flag that we haven't captured the drag start coords yet
      var mouseDragStartX = -1, mouseDragStartY = -1;
      // capture input x,y,zoom as start values (unscaled coords)
      var imageNativeCoordX = x, imageNativeCoordY = y;
      var imageNormCoordZ = zoom / 100; // 0-1
      // calculate offsets (scaled offsets)
      imageWidthScaled = that.options.imageWidthNative * imageNormCoordZ;
      imageHeightScaled = that.options.imageHeightNative * imageNormCoordZ;
      imageWidthSDiff = imageWidthScaled - imageWidthMinimum;
      imageHeightSDiff = imageHeightScaled - imageHeightMinimum;
      // compute the minimum zoom amount that's needed for this image to fill its container
      imageNormCoordZMin = Math.max(containerWidth / that.options.imageWidthNative, containerHeight / that.options.imageHeightNative);
      // use zoom and input coords to calculate scaled offsets
      var imageOffsetWidth = imageWidthScaled;
      var imageOffsetLeft = -imageNativeCoordX * imageNormCoordZ;
      var imageOffsetTop = -imageNativeCoordY * imageNormCoordZ;
      // create start variants, necessary for drag comparison
      var imageOffsetStartLeft = imageOffsetLeft;
      var imageOffsetStartTop = imageOffsetTop;
      // apply initial values to image
      this.options.jqImg.css( {
        'top': imageOffsetTop + 'px',
        'left': imageOffsetLeft + 'px',
        'width': imageOffsetWidth + 'px'
      });
      // flag that clone is created but not visible yet
      var cloneVisible = false;
      
      var calcBounded = function(off, max, min) {
        return Math.max(Math.min(off, max), min);
      } 
      
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
          // slider returns values from 0-100, reverse to 100-0
          var sliderValue = 100 - ui.value;
          // calculate new normalized coord, between 1 and say 0.15 (imageNormCoordZMin)
          imageNormCoordZ = calcBounded((sliderValue / 100) + 0.0001, 1, imageNormCoordZMin);
        }
        // recalc block
        imageWidthScaled = that.options.imageWidthNative * imageNormCoordZ;
        imageHeightScaled = that.options.imageHeightNative * imageNormCoordZ;
        imageWidthSDiff = imageWidthScaled - imageWidthMinimum;
        imageHeightSDiff = imageHeightScaled - imageHeightMinimum;
        // action-specific calculation
        if (event.type == 'mousemove') {
          // compute offset of image to container, then bound between 0 and max real image dimensions
          offl = calcBounded(imageOffsetStartLeft + dx, 0, -imageWidthSDiff);
          offt = calcBounded(imageOffsetStartTop + dy, 0, -imageHeightSDiff);
          offw = calcBounded(imageWidthScaled, that.options.imageWidthNative, containerWidth);
          if (that.options.debug) {
            // optional debugging output
            console.log('imageOffsetStartLeft['+imageOffsetStartLeft+'] imageOffsetStartTop['+imageOffsetStartTop+'] imageNormCoordZ['+imageNormCoordZ+'] px['+event.pageX+'] py['+event.pageY+'] dx['+dx+'] dy['+dy+'] offl['+offl+'] offt['+offt+'] offw['+offw+']');          
          }
        } else if ((event.type == 'slide') || (event.type == 'scrollzoom')) {
          // new coord is normalised pointer coord mapped back onto image, translated back to cursor position, then bound between 0 and max real image dimensions
          offl = calcBounded(-pointerNormX * imageWidthScaled + event.offsetX, 0, -imageWidthSDiff);
          offt = calcBounded(-pointerNormY * imageHeightScaled + event.offsetY, 0, -imageHeightSDiff);
          offw = calcBounded(imageWidthScaled, that.options.imageWidthNative, containerWidth);
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
            'left': offl + 'px',
            // image_height - container_height > x > 0
            'top': offt + 'px',
            // image zoom reflected by image width
            'width': offw + 'px'
          });
          if (that.options.showShadow) {
            // calculate coords on image from window reference
            if (that.options.jqImgClone == null) {
              // create a semi-transparent copy of the image
              that.options.jqImgClone = that.options.jqImg.clone().addClass('outcrop-clone').appendTo(that.element.parent());
            }
            if (that.options.jqImgClone != null) {
              that.options.jqImgClone.css( {
                'left': (containerLeft + offl) + 'px',
                'top': (containerTop + offt) + 'px',
                'width': offw + 'px',
                'opacity': 0.5,
                'display': 'block'
              } );
            }
          }
          // store coords in case this is the last frame before dragEnd/sliderStop
          that.options.x = imageNativeCoordX = (0 - offl) / imageNormCoordZ;
          that.options.y = imageNativeCoordY = (0 - offt) / imageNormCoordZ;
          that.options.zoom = imageNormCoordZ * 100;
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
    
    // Use the destroy method to clean up any modifications your widget has made to the DOM
    destroy: function() {
      // In jQuery UI 1.8, you must invoke the destroy method from the base widget
      $.Widget.prototype.destroy.call( this );
      // In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
    }
  });
}( window.jQuery ) );