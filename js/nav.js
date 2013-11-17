nav = {}

nav.init = function(){

	$('nav a, #tabs a').click(function(){
		var section = $(this).attr('data-layout');
		if( section ) app.changeSection( section );

		$(this).parent().addClass('active').siblings().removeClass('active');

		return false;
	});

	$('#login-toggle').click(function(){
		dialog.show("#login");
	});

	$('#profile-toggle').click(function(){
		dialog.show("#profile");
	});

	$('.toggle-date-filter').click(function(){
		
		$body = $('body');
		
		$body.toggleClass('map').toggleClass('map-filtered');
		$(this).toggleClass('active');
	});

	$('.login-button').click(function(){
		
		$('body').addClass('logged');
		$('#login .close').click();

	});

	$('#logout-toggle').click(function(){
		
		$('body').removeClass('logged');

	});

}


