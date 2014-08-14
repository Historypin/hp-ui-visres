(function($, undefined) {

  // once the HTML is loaded, 
  $(document).ready(function() {

    // demo-only: hunt for cookie, if set apply to form fields, watch for changes
    var index, demos = ['demo_x', 'demo_y', 'demo_zoom'];
    for (index = 0; index < demos.length; ++index) {
      var name = demos[index], jq = $('#'+name);
      if ($.cookie(name) != undefined) {
        jq.val($.cookie(name));
      }
      jq.change(function(event) { 
        // console.log('updated '+event.target.id+' '+$(this).val());
        $.cookie(event.target.id, $(this).val(), { path: '/', expires: 7 });
      });
    }

    // demo-only: clear cookie button
    $('#out-1-clearcookie').click(function() {
      for (index = 0; index < demos.length; ++index) {
        $.removeCookie(demos[index], { path: '/', expires: 7 });
      }
    });

    // turn all classed images into outcrops using jQuery UI widget
    $('.outcrop').outcrop({ 'mode': 'read', 'sliderZoomLimit': 300 });

    // when the edit button is clicked, make one outcrop editable
    $('#out-1-edit').click(function(event) {
      if ($('#out-1').outcrop('option', 'mode') == 'read') {
        $('#out-1').outcrop({ 'mode': 'edit', 'sliderZoomLimit': 300, 'debug': true });
        // update message to done
        $(this).html('Done');
      } else {
        $('#out-1').outcrop({ 'mode': 'read', 'sliderZoomLimit': 300 });
        $(this).html('Edit');
      }
      // interrupt link to avoid # being appended to URL
      event.preventDefault();
    });
    
  });

})(window.jQuery, undefined);

