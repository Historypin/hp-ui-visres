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
      var jq = $('#qunit-sutdo');
      jq.append('<img alt="big image of cars from 1980" src="'+imagePath+'" />');
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
      var jq = $('#qunit-bigfix');
      jq.append('<img alt="big image of cars from 1980" src="img/AH180.jpg" />');
      // outcrop it (edit-mode, top-left at 100%)
      jq.outcrop( { 'mode': 'edit', 'x': 0, 'y': 0, 'zoom': 100 });
      // test outcrop mode
      ok( jq.outcrop('option', 'mode') == 'edit', 'outcrop setup in edit-mode');
      // read out values in one go
      var values = jq.outcrop('values');
      ok( values.x == 0, 'aligned left');
      ok( values.y == 0, 'aligned left');
      ok( values.zoom == 100, 'zoomed all the way in');
    });

/*
    test( 'reres of first page of images', function() {
      sfun.api_triggerKeypress(sfun.KEY_HOME);
      ok( $('ul.flow .selectablecell.selected').data('seq') == 0, 'Home selected #0 image' );
      QUnit.stop();
      setTimeout(function() {
        $('ul.flow .selectablecell.visible .reresable').each(function() {
          var imw = $(this).width(), imh = $(this).height();
          var jqEnt = $(this).parents('li');
          var lodw = $(this).data('loaded-width'), lodh = $(this).data('loaded-height');
          ok( imw <= lodw && imh <= lodh, 'image #'+jqEnt.data('seq')+' ('+imw+'x'+imh+') loaded('+lodw+'x'+lodh+')');
        });
        window.location.hash = '';
        QUnit.start();
      }, 1);
    });
*/

  }

  // call init function
  this.init();

})(jQuery, undefined);