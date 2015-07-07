/* global OC */
  
$(document).ready(function () {
	var button;

	if ($('#body-login').length > 0) {
		return true; //deactivate on login page
	}
   
 $('#body-public').addClass('appbody-gallerydeluxe');

	function onFileListUpdated() {
		var hasImages = !!$("#fileList").find("tr[data-mime^='image']:first").length;

		button.toggleClass('hidden', !hasImages);
	}
	if ($('#filesApp').val() && $('#isPublic').val()) {

		$('#fileList').on('updated', onFileListUpdated);

		// toggle for opening shared file list as picture view
		// TODO find a way to not need to use inline CSS
		var button = $('<button/>').attr({'class':'button','title':t('gallerydeluxe', 'Picture view')}).css({'position':'absolute','right':'10px','top':'4px'}).html('<i class="ioc ioc-gallery"></i>');
		
		//OC.Breadcrumb.push(albumName, '#');
		button.click( function (event) {
			
			var testHref= window.location.href;
			var link = testHref.replace('index.php/s/','index.php/apps/gallerydeluxe/s/');
			 link = link.split('#');
		//	var hash = testHref.replace('?path=%2F', '#');
			//	  hash = testHref.replace('#', '');
			window.location =link[0] ;
			
			//$('#linkText').val($('#linkText').val().replace('index.php/s/', 'index.php/apps/gallery/s/'));
		});

		$('#controls').append(button);
		
		
		
	}
});
