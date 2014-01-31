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

	$('#explore').toggleClass("pin-active");
	
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

var windowWidth = $(window).width(),		
	windowHeight = $(window).height();	

function setMapHeight(){
	$('#map-holder').height( $(window).height() - ( $('#header').height() + $('#footer').height() ) );
}

$(window).resize(function() {
	google.maps.event.trigger(map.instance, 'resize');
	setMapHeight();
});

$(function(){

	setMapHeight();

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

	setTimeout(function(){ 
		$(window).resize();
	}, 1000);
});


