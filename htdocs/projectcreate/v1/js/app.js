$(function(){

	// Init SmartPlaceholders.js
	$( '.js-float-label-wrapper' ).FloatLabel();

	// Ladda buttons init
	Ladda.bind( '.ladda-button', { timeout: 1300 } );

	// Bind progress buttons and simulate loading progress
	Ladda.bind( '#cnt-photo .ladda-button', {
		callback: function( instance ) {
			var progress = 0;
			var interval = setInterval( function() {
				progress = Math.min( progress + Math.random() * 0.1, 1 );
				instance.setProgress( progress );

				if( progress === 1 ) {
					instance.stop();
					clearInterval( interval );
					$('#cnt-photo .ladda-button')
						.attr('data-color', 'green')
						.text('Upload succesful!')
						.css('marginTop', '2em')
						.next().css('opacity', '0');
				}
			}, 100 );
		}, 
		timeout: 5000
	} );

	// Tabs
	$('.tabs li a').click(function(){
		
		$(this).parent().addClass('active').siblings().removeClass('active');

		$('#' + $(this).attr("href").substr(1, 10) ).addClass('selected').siblings().removeClass('selected');

		return false;
	});

	$('section.step .header').append('<span class="ss-icon ss-check"></span><span class="edit"><span class="ss-icon ss-write"></span> Update info</span>');
	$('section.step .list-content ul li').append('<span class="ss-icon ss-starframe"></span>');
	
	$('section.step:eq(0)').addClass('active');
	
	$('section.step .list-content ul li').click(function(){
		$(this).toggleClass('selected');
	});

	// Main nav
	$( "#container" ).delegate( "section.step .btn-next", "click", function() {
		
		var $step = $(this).parents('.step');
		var $stepHeader = $step.find('.header');

		var $stepNext = $step.next();
		var $stepNextHeader = $stepNext.find('.header');

		setTimeout(function(){
			
			$step.removeClass('active').addClass('finished');

			setTimeout(function(){
				$step.next().addClass('active');
			}, 500);

		}, 1000);

	});
	
	// Main nav
	$( "#container" ).delegate( "section.step.finished .header", "click", function() {
		
		var $step = $(this).parents('.step');
		var $stepHeader = $(this);
			
		$step.siblings().removeClass('active');

		setTimeout(function(){
			$step.addClass('active').removeClass('finished');
		}, 150);

	});

	// Control - list
	$('.add-row').click(function(){
		
		$row = $(this).parent().parent().find('.row.hidden');
		$row.clone().appendTo( $row.parents('.control') ).removeClass('hidden');

		return false;

	});

	$( ".control" ).delegate( ".btn-remove", "click", function() {

		$(this).parents('.row').remove();

		return false;
	});

});
