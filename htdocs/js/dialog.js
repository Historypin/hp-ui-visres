dialog = {}

dialog.init = function(){

	popup = document.querySelector( '.dialog-animate' ),
	cover = document.querySelector( '.dialog-overlay' ),
	container = $('body'),
	currentState = null;

	container.addClass('dialog-ready')
		.delegate(".dialog .close", "click", function(){
			dialog.hide();
			return false;
		})
		.delegate(".dialog .help-on", "click", function(){
			popup.addClass('flipped');
			return false;
		})
		.delegate(".dialog .help-off", "click", function(){
			popup.removeClass('flipped');
			return false;
		});
}

// Deactivate on ESC
dialog.onDocumentKeyUp = function( event ) {
	if( event.keyCode === 27 ) {
		dialog.deactivate();
	}
}

// Deactivate on click outside
dialog.onDocumentClick = function( event ) {
	if( event.target === cover ) {
		dialog.deactivate();
	}
}

dialog.activate  = function( state ) {
	document.addEventListener( 'keyup', dialog.onDocumentKeyUp, false );
	document.addEventListener( 'click', dialog.onDocumentClick, false );
	document.addEventListener( 'touchstart', dialog.onDocumentClick, false );

	popup.removeClass( currentState );
	popup.addClass( 'no-transition' );
	popup.addClass( state );

	setTimeout( function() {
		popup.removeClass( 'no-transition' );
		container.addClass( 'dialog-active' );
	}, 0 );

	currentState = state;
}

dialog.deactivate = function() {
	document.removeEventListener( 'keyup', dialog.onDocumentKeyUp, false );
	document.removeEventListener( 'click', dialog.onDocumentClick, false );
	document.removeEventListener( 'touchstart', dialog.onDocumentClick, false );

	container.removeClass( 'dialog-active' );
	popup.removeClass( 'dialog-animate' );
}

dialog.disableBlur = function() {
	container.addClass( 'no-blur' );
}

dialog.show = function(selector){
	popup = $( selector );
	popup.addClass( 'dialog-animate' );
	dialog.activate();
	return this;
}

dialog.hide = function() {
	dialog.deactivate();
}
