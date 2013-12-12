app = {}

app.views = {
	explore: {}
}

app.init = function(){
	app.views.explore = $('#explore');
}

app.changeSection = function(section, pin){

	if ( section )
	{
		$('body').addClass(section);
	}

}

app.openPin = function(data){
	
	var pin = data;
	var sectionPinView = $('#pin');

	sectionPinView.find('article').remove();

	$pin = 
	'<article>' +
		'<div class="image">' +
			'<img src="' + hp.urls.image(pin.i, 600, 600, 80, false) + '">' +
		'</div>' +
		'<header>' +
			'<h2>' + pin.c + '</h2>' +
			'<p><strong>' + pin.d + '</strong>, Pinned by <a href="#">' + pin.u + '</a></p>' +
		'</header>' +
		'<section>' +
			'<p>' + pin.C + '</p>' +
		'</section>' +
		'<footer>' +
			'<p><strong>Archive:</strong> ' + pin.u + '</p>' +
			//'<p><strong>Author:</strong> ' + data.info.author + '</p>' +
			//'<p><strong>License:</strong> ' + data.info.license + '</p>' +
			//'<p><strong>Copyright:</strong> ' + data.info.copyright + '</p>' +
			'<p><strong>Tags:</strong> ' + pin.K + '</p>' +
		'</footer>' +
	'</article>';
	
	sectionPinView.append($pin);
}

$(function(){

	if (navigator.onLine) {

		dialog.init();
		map.init();
		app.init();
		nav.init();

		//console.log('ONLINE!');
		
	} else {

		//console.log('Connection flaky');
		alert("It looks like the internet connections is flaky");

	}

});


var VISRES = (function (VISRES, $) {

    VISRES.susyOffCanvasToggle = {
        init: function (triggers) {

            $(triggers).click(function (e) {
                e.preventDefault();
                VISRES.susyOffCanvasToggle.toggleClasses(this);
                VISRES.susyOffCanvasToggle.toggleText(triggers);
            });

            return triggers;
        },
        toggleClasses: function (el) {

            var body = $('body');
            var dir = $(el).attr('href');

            if (dir === '#left') {
                body.toggleClass('show-left').removeClass('show-right');
            }

            if (dir === '#right') {
                body.toggleClass('show-right').removeClass('show-left');
            }

            return body.attr('class');
        },
        toggleText: function (triggers) {

            var left = $(triggers).filter('[href="#left"]');
            var right = $(triggers).filter('[href="#right"]');
            var body = $('body');

            if (body.hasClass('show-left')) {
                left.text('hide left');
            } else {
                left.text('show left');
            }
            if (body.hasClass('show-right')) {
                right.text('hide right');
            } else {
                right.text('show right');
            }
        }
    };

    $(function () {
        VISRES.susyOffCanvasToggle.init($('.toggle'));
    });

    return VISRES;

}(VISRES || {}, jQuery));
