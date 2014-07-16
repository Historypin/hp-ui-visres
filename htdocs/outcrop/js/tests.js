/**
 * Outcrop javascript
 * QUnit test harness
 */
(function($, undefined) {

  // ---------
  // CONSTANTS
  // ---------

  var imagePath = 'img/AH180.jpg';
  var imageWidth = 2940;
  var imageHeight = 1960;
  var imageLandscape = true;

  // ---------
  // FUNCTIONS
  // ---------

  this.init = function() {
    console.log('Running test suite');
    // write harness into page
    var qs = '<div id="qunit"></div><div id="qunit-fixture"></div>';
    $('body').prepend(qs);
    // execute tests
    this.tests();
  };

  // -----
  // TESTS
  // -----

  /**
   * execute tests
   */
  this['tests'] = function() {
    QUnit.init();

    // clear cookies because they interfere with the tests of defaults
    var index, demos = ['demo_x', 'demo_y', 'demo_zoom'];
    for (index = 0; index < demos.length; ++index) {
      $.removeCookie(demos[index], { path: '/', expires: 7 });
    }

    test( 'set up and tear down outcrop (sutdo)', function() {
      // add small fixed-size container
      $('#qunit-fixture').append('<div id="qunit-sutdo" class="outcrop" style="width: 200px; height: 150px;"></div>');
      // put a big image inside it
      var jq = $('#qunit-sutdo').append('<img alt="big image of cars from 1980" src="'+imagePath+'" />');
      // outcrop it (read-mode, default options but force to ignore form fields)
      jq.outcrop({});
      // test that the container is being marked
      ok( jq.hasClass('outcrop'), 'outcrop container marked outcrop');
      ok( jq.find('.cropped').length > 0, 'introduced inner container');
      // test outcrop mode
      ok( jq.outcrop('option', 'mode') == 'read', 'outcrop setup in read-mode');
      QUnit.stop();
      setTimeout(function() {
        // read out (default) x, y and zoom
        if (imageLandscape) {
          ok( jq.outcrop('option', 'x') == 0, 'aligned left');
        } else {
          ok( jq.outcrop('option', 'y') == 0, 'aligned top');
        }
        ok( jq.outcrop('option', 'zoom') == 0.1, 'zoomed all the way out, fit horizontally to fixed width (@'+(jq.outcrop('option', 'zoom'))+'%)');
        jq.outcrop('destroy');
        QUnit.start();
      }, 100);
    });

    test( 'big image fixed container drag (bigfix)', function() {
      // add small fixed-size container
      $('#qunit-fixture').append('<div id="qunit-bigfix" class="outcrop" style="width: 200px; height: 150px;"></div>');
      // put a big image inside it
      var jq = $('#qunit-bigfix').append('<img alt="big image of cars from 1980" src="img/AH180.jpg" />');
      // outcrop it (edit-mode, top-left at 100%)
      jq.outcrop( { 'mode': 'edit', 'x': 0, 'y': 0, 'zoom': 100 });
      // test outcrop mode
      ok( jq.outcrop('option', 'mode') == 'edit', 'outcrop setup in edit-mode');
      // read out values in one go
      var values = jq.outcrop('values');
      ok( values.x == 0, 'aligned left');
      ok( values.y == 0, 'aligned left');
      ok( values.zoom == 100, 'zoomed all the way in');
      // @todo do a small drag, check ok
      // @todo try and do a massive drag, check that it clipped against edges
    });

    test( 'big image fluid container (bigflu)', function() {
      // add fluid container inside fixed-size container (modelling browser viewport)
      $('#qunit-fixture').append('<div style="width: 250px; height: 200px;"><div id="qunit-bigflu" class="outcrop" style="width: 80%; height: 75%;"></div></div>');
      // test container size
      var jq = $('#qunit-bigflu');
      ok ( jq.width() == 200 && jq.height() == 150, 'outcrop container correct size');
      // put a big image inside it
      jq.append('<img alt="big image of cars from 1980" src="img/AH180.jpg" />');
      // outcrop it (edit-mode, top-left at 100%)
      jq.outcrop( { 'mode': 'edit', 'x': 0, 'y': 0, 'zoom': 100 });

      // START HERE
      // jq.outcrop('centre');

      // read out values in one go
      var values = jq.outcrop('values');
      ok( values.x == 0, 'aligned left');
      ok( values.y == 0, 'aligned left');
      ok( values.zoom == 100, 'zoomed all the way in');
    });

    test( 'zoom slider in reverse (slidrev)', function() {
      // add small fixed-size container
      $('#qunit-fixture').append('<div id="qunit-slidrev" class="outcrop" style="width: 200px; height: 150px;"></div>');
      // put a big image inside it
      var jq = $('#qunit-slidrev').append('<img alt="big image of cars from 1980" src="img/AH180.jpg" />');
      // outcrop it (edit-mode, top-left at 100%)
      jq.outcrop( { 'mode': 'edit', 'x': 0, 'y': 0, 'zoom': 100 } );
      // get slider position for zoom 100%
      var jqSlider = jq.outcrop('option', 'jqSlider');
      ok( jqSlider.slider('value') == 100, 'normal-mode, zoom 100% at slider left ('+jqSlider.slider('value')+' value)' );
      jq.outcrop('destroy');
      // test at 70%
      jq.outcrop( { 'mode': 'edit', 'x': 0, 'y': 0, 'zoom': 70 } );
      ok( jqSlider.slider('value') == 70, 'normal-mode, zoom 70% near slider left ('+jqSlider.slider('value')+' value)' );
      jq.outcrop('destroy');
      // create outcrop again, but in reverse slider
      jq.outcrop( { 'mode': 'edit', 'x': 0, 'y': 0, 'zoom': 100, 'sliderReverse': true } );
      ok( jqSlider.slider('value') == 0, 'reverse-mode, zoom 100% at slider right ('+jqSlider.slider('value')+' value)' );
      jq.outcrop('destroy');
      // test at 70% in reverse slider
      jq.outcrop( { 'mode': 'edit', 'x': 0, 'y': 0, 'zoom': 70, 'sliderReverse': true } );
      ok( jqSlider.slider('value') == 30, 'reverse-mode, zoom 70% near slider right ('+jqSlider.slider('value')+' value)' );
      jq.outcrop('destroy');
    });

    test( 'zoom slider at 200% limit (slid200)', function() {
      // add small fixed-size container
      $('#qunit-fixture').append('<div id="qunit-slid200" class="outcrop" style="width: 200px; height: 150px;"></div>');
      // put a big image inside it
      var jq = $('#qunit-slid200').append('<img alt="big image of cars from 1980" src="img/AH180.jpg" />');
      // outcrop it (edit-mode, top-left at 100%)
      jq.outcrop( { 'mode': 'edit', 'x': 0, 'y': 0, 'zoom': 200, 'sliderZoomLimit': 200 } );
      // get slider position (slider still on 0-100 scale)
      var jqSlider = jq.outcrop('option', 'jqSlider');
      ok( jqSlider.slider('value') == 100, 'slider at full ('+jqSlider.slider('value')+')' );
      // get the image size, check 200%
      ok( jq.find('.cropped img').width() == imageWidth * 200 / 100, 'image at 200%' );
      jq.outcrop('destroy');
    });

  }

  // call init function
  this.init();

})(jQuery, undefined);