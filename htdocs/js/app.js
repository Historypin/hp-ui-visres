map = {
	globals: {},
	instance: {}
}

map.globals = {
	//pinList: [ 7130177 ],
	pinList: [ 7130177,6042084,6655115,7074021,7202238,6290144,6467781,6498053,2512044,7187505,7127021 ],
	curLatLng: new google.maps.LatLng(51.42802, -0.175099),
}

map.init = function(){

	map.instance = new GMaps({
		div: '#map-holder',
		zoom: 5,
		lat: 51.42802,
		lng: -0.175099,

		click: function(e) {
			//console.log('click');
		},

		dragend: function(e) {
			//console.log('dragend');
		}
	});

	var defaultIcon = new google.maps.MarkerImage(
		
		'http://google.com/mapfiles/ms/micons/red-dot.png',

		// This marker is 32 pixels wide by 32 pixels tall.
		new google.maps.Size(32, 32),
		
		// The origin for this image is 0,0.
		new google.maps.Point(0,0),
		
		// The anchor for this image is the base of the flagpole at 0,32.
		new google.maps.Point(16, 32)
	);

	var shadow = new google.maps.MarkerImage(
		
		'http://google.com/mapfiles/ms/micons/msmarker.shadow.png',
		
		// The shadow image is larger in the horizontal dimension
		// while the position and offset are the same as for the main image.
		new google.maps.Size(59, 32),
		new google.maps.Point(0,0),
		new google.maps.Point(16, 32)
	);

	var activeIcon = new google.maps.MarkerImage(
		
		'http://google.com/mapfiles/ms/micons/yellow-dot.png',
	
		// This marker is 20 pixels wide by 32 pixels tall.
		new google.maps.Size(32, 32),

		// The origin for this image is 0,0.
		new google.maps.Point(0,0),

		// The anchor for this image is the base of the flagpole at 0,32.
		new google.maps.Point(16, 32)
	);

	var shadow = new google.maps.MarkerImage(
		
		'http://www.google.com/mapfiles/shadow50.png',
		
		// The shadow image is larger in the horizontal dimension
		// while the position and offset are the same as for the main image.
		new google.maps.Size(59, 32),
		new google.maps.Point(0,0),
		new google.maps.Point(16, 32)
	);

	// Shapes define the clickable region of the icon.The type defines an HTML &lt;area&gt; element 'poly' which
	// traces out a polygon as a series of X,Y points. The final coordinate closes the poly by connecting to the first coordinate.
	var shape = {
		coord: [9,0,6,1,4,2,2,4,0,8,0,12,1,14,2,16,5,19,7,23,8,26,9,30,9,34,11,34,11,30,12,26,13,24,14,21,16,18,18,16,20,12,20,8,18,4,16,2,15,1,13,0],
		type: 'poly'
	};

	$.each(map.globals.pinList, function(){
		
		var pinID = this+'';

		hp.get.pin(pinID).done(function(data){

			var pin = data.data;
			map.instance.addMarker({
				lat: pin.t,
				lng: pin.g,
				animation: google.maps.Animation.DROP,
				icon: defaultIcon,
				title: pin.c,
				infoWindow: {
					content: pin.c
				},
				click: function(e) {
					
					//console.log('You clicked in this marker');
					
					this.setIcon(activeIcon);
					app.openPin(pin);

					//google.maps.event.trigger(map.instance, 'resize'); 
					//map.instance.setZoom(17);
					//map.globals.curLatLng = ''+pin.t, pin.g+'';
					//map.instance.setCenter(pin.t, pin.g);

				}
			});

		});

	});
	
}



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

app.openPin = function(pin){
	
	var sectionPinView = $('#pin');

	sectionPinView.find('article').remove();

	$('#explore').addClass("pin-active");

	console.log(pin);

	$pin = 
	'<article>' +
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
	
	sectionPinView.append($pin);
}

var windowWidth = $(window).width(),		
	windowHeight = $(window).height();	

function setMapHeight(){
	console.log( $(window).height() - ( $('#header').height() + $('#footer').height() ) );
	$('#map-holder').height( $(window).height() - ( $('#header').height() + $('#footer').height() ) );
	google.maps.event.trigger(map.instance, 'resize');
}

$(window).resize(function() {
	setMapHeight();
});

$(function(){

	//$('#banner').css('margin-top', -$('#banner').height());
	//$('body').css('padding-top', +$('#banner').height());
	
	if (navigator.onLine) {

		dialog.init();
		map.init();
		app.init();
		nav.init();

		setMapHeight();
		//console.log('ONLINE!');
		
	} else {
		alert("It looks like the internet connections is flaky");
	}

	setTimeout(function(){
		$(window).resize();
	},2000);

});


