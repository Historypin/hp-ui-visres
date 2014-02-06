
var debug = true;

var windowWidth = $(window).width();		
var windowHeight = $(window).height();	

function de(data){
	if(debug){
		console.log(data);
	}
}

// ----------------------------------------------- 
app = {}

app.globals = {
	//pinList: [ 7130177 ],
	pinList: [ 7130177, 6042084, 6655115, 7074021, 7202238, 6290144, 6467781, 6498053, 2512044, 7187505, 7127021 ],
	curLatLng: new google.maps.LatLng(51.42802, -0.175099),
}

app.recalculateHeight = function(){
	
	// Calculate the space avalable for the map
	$('#map-holder').height( $(window).height() - ( $('#header').height() + $('#footer').height() ) );

	// Resize the map to fit the avalable space
	google.maps.event.trigger(map, 'resize');

}

app.init = function(){

	nav.init();
	dialog.init();

	map = new GMaps({
		div: '#map-holder',
		disableDefaultUI: true,
		zoom: 5,
		lat: 51.42802,
		lng: -0.175099
	});

	$.each(app.globals.pinList, function(){
		
		var pinID = this+'';

		hp.get.pin(pinID).done(function(data){

			var pin = data.data;

			map.addMarker({
				lat: pin.t,
				lng: pin.g,
				animation: google.maps.Animation.DROP,
				title: pin.c,
				infoWindow: {
					content: pin.c
				},
				click: function(e) {
					
					//de('You clicked in this marker');
					
					app.openPin(pin);
					google.maps.event.trigger(map, 'resize'); 
					map.setCenter(pin.t, pin.g);

					//map.setZoom(17);
					//app.globals.curLatLng = ''+pin.t, pin.g+'';

				}
			});

		});

	});
	
	app.recalculateHeight();

	// Make sure the map is resized with the window
	$(window).resize(function() {
		app.recalculateHeight();
	});
}

app.openPin = function(pin){
	
	$('#explore').addClass("pin-active");

	// TODO: Add debug info
	// de(pin);

	$pin = 
	'<article class="pin">' +
		'<div class="image">' +
			'<img src="' + hp.urls.image(pin.i, 600, 600, 80, false) + '">' +
		'</div>' +
		'<header>' +
			'<h2>' + pin.c + '</h2>' +
			'<p>' + pin.G + '<br>' +
			'<strong>' + pin.d + '</strong>, Pinned by <a href="#">' + pin.u + '</a></p>' +
		'</header>' +
		'<section>' +
			'<p>' + pin.C + '</p>' +
		'</section>' +
		'<footer>' +
			'<p><strong>Archive:</strong> ' + pin.u + '</p>' +
			//'<p><strong>Author:</strong> ' + data.info.author + '</p>' +
			//'<p><strong>License:</strong> ' + data.info.license + '</p>' +
			//'<p><strong>Copyright:</strong> ' + data.info.copyright + '</p>' +
			((pin.K != undefined) ? '<p><strong>Tags:</strong> ' + pin.K + '</p>' : '') +
		'</footer>' +
	'</article>';
	
	$('#pin').append($pin);
}

// On document load initialize the app
$(function(){
	app.init();
});

