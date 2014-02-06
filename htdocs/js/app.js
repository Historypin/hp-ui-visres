var debug = false;
var smallBannerHeight = 100;

var windowWidth = $(window).width();		
var windowHeight = $(window).height();	

var pinIcon = '../images/pin.png';
var pinIconSelected = '../images/pin-selected.png';

function de(data){
	if(debug){
		console.log(data);
	}
}

// ----------------------------------------------- 
app = {}

app.globals = {
	//pinList: [ 7130177 ],
	pinList: [ 7130177, 6042084, 6655115, 7074021, 7202238, 6290144, 6467781, 6498053, 2512044, 7187505, 7127021, 2865, 210485, 1446, 857, 26367, 34188 ],
	curLatLng: new google.maps.LatLng(51.42802, -0.175099),
}

app.recalculateHeight = function(){
	
	var	scrollTop = $(window).scrollTop();
	
	de( 
	   'scrollTop: '			+ scrollTop  + ', ' +
	   'mapHeight: '			+ ($(window).height() - ( $('#header').height() + smallBannerHeight + $('#footer').height() )) + ', ' +
	   'bbh: '					+ $('.banner').height() + ', ' +
	   'sbh: '					+ smallBannerHeight + ', ' +
	   'windowHeight: '			+ $(window).height() + ', ' 
	);

	// Calculate the space avalable for the map
	$('#map-holder').height( $(window).height() - ( $('#header').height() + smallBannerHeight + $('#footer').height() ) );

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
				icon: pinIcon,
				title: pin.c,
				snippet: pin.d,
				infoWindow: {
					content: pin.c
				},
				click: function(e) {
					
					if( this.active != true ){

						$.each(map.markers, function(){
							this.setIcon(pinIcon);
							this.active = false;
						});

						this.active = true;
						this.setIcon(pinIconSelected);

						$('#explore').addClass("pin-active");

						app.loadPin(pin);
						//map.setZoom(17);
						map.refresh();
						map.setCenter(pin.t, pin.g);
						
					} else {

						this.active = false;

						$('#explore').removeClass("pin-active");

						app.clearLoadedPins();

						map.refresh();

					}

				}
			});

		});

	});

	// Make sure the map is resized with the window
	$(window)
		.resize(app.recalculateHeight)
		.scroll(app.recalculateHeight)
		.trigger('scroll')
		.trigger('resize');
}

app.clearLoadedPins = function(){
	$('#pin').find('article').remove();
}

app.loadPin = function(pin){

	// TODO: Add debug info

	$pin = 
	'<article class="pin">' +
		'<header>' +
			'<h2>' + pin.c + '</h2>' +
			'Pinned by <a href="#">' + pin.u + '</a></p>' +
		'</header>' +
		'<div class="image">' +
			'<img src="' + hp.urls.image(pin.i, 600, 600, 80, false) + '">' +
		'</div>' +
		'<section class="content">' +
			((pin.C != undefined) ? '<p><strong>Description</strong><br>' + pin.C + '</p>' : '') +
			((pin.C != undefined) ? '<p>' + pin.C + '</p>' : '') +
			((pin.C != undefined) ? '<p>' + pin.C + '</p>' : '') +
			((pin.C != undefined) ? '<p>' + pin.C + '</p>' : '') +
			((pin.C != undefined) ? '<p>' + pin.C + '</p>' : '') +
			((pin.C != undefined) ? '<p>' + pin.C + '</p>' : '') +
			((pin.C != undefined) ? '<p>' + pin.C + '</p>' : '') +
			((pin.C != undefined) ? '<p>' + pin.C + '</p>' : '') +
			((pin.K != undefined) ? '<p><strong>Tags</strong><br>' + pin.K + '</p>' : '') +
		'</section>' +
		'<footer>' +
			'<p><strong>' + pin.d + '</strong>, ' + pin.G + '<br>' +
			((pin.u != undefined) ? '<p><strong>Archive:</strong> ' + pin.u + '</p>' : '') +
		'</footer>' +
	'</article>';
	
	app.clearLoadedPins();

	$('#pin').append($pin);

}

// On document load initialize the app
$(function(){
	app.init();
});

