/* global Gallery, Thumbnail */

/**
 *
 * @param {jQuery} container
 * @param {{name:string, url: string, path: string}[]} images
 * @param {int} interval
 * @param {int} maxScale
 * @constructor
 */
var SlideShow = function(container, images, interval, maxScale) {
	this.container = container;
	this.mainContainer = $('#slideshow');
	this.previewContainer = $('#previewContainerInner');
	this.images = images;
	this.previewImages = images;
	this.preloadOffset = 0;
	this.interval = interval | 5000;
	this.maxScale = maxScale | 2;
	this.playTimeout = 0;
	this.current = 0;
	this.imageCache = {};
	this.imagePreviewCache = {};
	this.bMetaInfo = false;
	this.metaInformation = {};
	this.playing = false;
	this.progressBar = this.mainContainer.children('.slideshow-progress');
	this.currentImage = null;
	this.onStop = null;
	this.active = false;
	this.zoomable = null;
	this.fullScreen = null;
	this.canFullScreen = false;
	this.zoomActiveMode = 0;
	this.bMinimal = false;
	this.bPreviewImages = false;
	this.userconfig={};
	
};
SlideShow.prototype.minimalView = function(bActive) {
	this.bMinimal = bActive;
};

SlideShow.prototype.init = function(play) {
	this.active = true;
	
	if(typeof Gallery === 'undefined'){
		this.userconfig.thumbnailpreview = 'false';
		this.userconfig.controlsalways = 'false';
		this.userconfig.download = 'false';
		this.userconfig.zoom = 'false';
		this.userconfig.share = 'false';
		this.userconfig.info = 'false';
		this.userconfig.fullscreen = 'true';
		this.userconfig.darkdesign ='true';
		this.userconfig.share ='false';
		this.userconfig.edit ='false';
	}else{
		this.userconfig=Gallery.userConfig;	
	}
	
			
			
	
	
	
		
	this.container.children('img').remove();
	this.mainContainer.children('label.labelBigImage').hide();
	// detect fullscreen capability (mobile)
	var e = this.container.get(0);
	
	this.canFullScreen = e.requestFullscreen !== undefined || e.mozRequestFullScreen !== undefined || e.webkitRequestFullscreen !== undefined || e.msRequestFullscreen !== undefined;

	var tokenCheck = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';

	// makes UI controls work in mobile version
	var browser = new bigshot.Browser();
	this.container.find('button.button').each(function(i, e) {
		browser.registerListener(e, "click", browser.stopEventBubblingHandler(), false);
		browser.registerListener(e, "touchstart", browser.stopEventBubblingHandler(), false);
		browser.registerListener(e, "touchend", browser.stopEventBubblingHandler(), false);
	});
	

	// hide arrows and play/pause when only one pic
	this.mainContainer.find('.next, .previous').toggle(this.images.length > 1);
	
	if (this.images.length === 1) {
		this.mainContainer.find('.play, .pause').hide();
	}

	// hide fullscreen icon if not fullscreen-capable
	this.mainContainer.find('.fullscreen-start').toggle(this.canFullScreen);

	var makeCallBack = function(handler) {
		return function(evt) {
			if (!this.active) {
				return;
			}
			evt.stopPropagation();
			handler.call(this);
		}.bind(this);
	}.bind(this);

	this.mainContainer.children('.previewNext').hide();
	this.mainContainer.children('.previewPrevious').hide();
	if (this.bMinimal === false) {
		//this.initPreviewImages();
		//Preview Images Navi
		if(this.userconfig.thumbnailpreview === 'true'){
			this.mainContainer.find('.previewGal').attr('title',t('gallerydeluxe','Show preview thumbnails')).click(makeCallBack(this.initPreviewImages));
			this.mainContainer.find('.previewGal').show();
		}else{
			this.mainContainer.find('.previewGal').hide();
		}
		if(this.userconfig.controlsalways === 'true'){
			this.mainContainer.find('.controlsOn').attr('title',t('gallerydeluxe','Show controls always')).click(makeCallBack(this.controlsAlwaysOn));
			this.mainContainer.find('.controlsOn').show();
		}else{
			this.mainContainer.find('.controlsOn').hide();
		}
		if(this.userconfig.download === 'true'){
			this.mainContainer.find('.downloadImage').attr('title',t('gallerydeluxe','Download Original Image')).click(makeCallBack(this.getImageDownload));
			this.mainContainer.find('.downloadImage').show();
		}else{
			this.mainContainer.find('.downloadImage').hide();
		}
		if(this.userconfig.zoom === 'true'){
			this.mainContainer.find('.zoomToFitHeight').click(makeCallBack(this.zoomToFitHeight));
			this.mainContainer.find('.zoomToFitWidth').click(makeCallBack(this.zoomToFitWidth));
			this.mainContainer.find('.zoomToFit').click(makeCallBack(this.zoomToFit));
			this.mainContainer.find('.zoomToFitHeight').show();
			this.mainContainer.find('.zoomToFitWidth').show();
			this.mainContainer.find('.zoomToFit').show();
		}else{
			this.mainContainer.find('.zoomToFitHeight').hide();
			this.mainContainer.find('.zoomToFitWidth').hide();
			this.mainContainer.find('.zoomToFit').hide();
		}
	   
		if (tokenCheck === '') {
				if(this.userconfig.share === 'true'){
					this.mainContainer.find('a.share').show();
				}else{
					this.mainContainer.find('a.share').hide();
				}
				if(this.userconfig.edit === 'true'){
					this.mainContainer.find('.editMetadata').attr('title',t('gallerydeluxe','Edit IPTC Data of image')).click(makeCallBack(this.metaInfoEdit));
					this.mainContainer.find('.editMetadata').show();
				}else{
					this.mainContainer.find('.editMetadata').hide();
				}
		} else {
			this.mainContainer.find('.editMetadata').hide();
		}
	} else {
		this.mainContainer.find('.previewNext').hide();
		this.mainContainer.find('.previewPrevious').hide();
		this.mainContainer.find('.editMetadata').hide();
		//this.mainContainer.children('.infoMeta').hide();
		this.mainContainer.find('.downloadImage').hide();
		this.mainContainer.find('.previewGal').hide();
		
		this.mainContainer.find('.controlsOn').hide();
		this.mainContainer.find('.zoomToFitHeight').hide();
		this.mainContainer.find('.zoomToFitWidth').hide();
		this.mainContainer.find('.zoomToFit').hide();
		this.mainContainer.find('a.share').hide();
	}

	this.mainContainer.find('.next').click(makeCallBack(this.next));
	this.mainContainer.find('.previous').click(makeCallBack(this.previous));
	
	this.mainContainer.find('.exit').click(makeCallBack(this.stop));
	
	this.mainContainer.find('.pause').click(makeCallBack(this.pause));
	this.mainContainer.find('.play').click(makeCallBack(this.play));
	
	if(this.userconfig.info === 'true'){
		this.mainContainer.find('.infoMeta').attr('title',t('gallerydeluxe','Show info')).click(makeCallBack(this.metaInfoShow));
		this.mainContainer.find('.infoMeta').show();
	}else{
		this.mainContainer.find('.infoMeta').hide();
	}
	
	
		
	if(this.userconfig.fullscreen === 'true'){	
		this.mainContainer.find('.fullscreen-start').click(makeCallBack(this.fullScreenStart));
		this.mainContainer.find('.fullscreen-exit').click(makeCallBack(this.fullScreenExit));
		this.mainContainer.find('.fullscreen-start').show();
	}else{
		this.mainContainer.find('.fullscreen-start').hide();
	}

	//Design switch
	
	if(this.userconfig.darkdesign === 'true'){	
		this.mainContainer.find('.button i.ioc').removeClass('darkColor');
		this.mainContainer.find('.button i.ioc').addClass('lightColor');
		this.mainContainer.removeClass('lightBg');
		this.mainContainer.addClass('darkBg');
	}else{
		this.mainContainer.find('.button i.ioc').addClass('darkColor');
		this.mainContainer.find('.button i.ioc').removeClass('lightColor');
		this.mainContainer.addClass('lightBg');
		this.mainContainer.removeClass('darkBg');
	}

		this.mainContainer.touchwipe({
				wipeLeft : function() {
					
					if((this.container.children('img').width() <= this.container.width()) || this.zoomActiveMode == 1 &&
					 (this.container.children('img').height() <= this.container.height()) || this.zoomActiveMode == 2){
						makeCallBack(this.next());
					}
				}.bind(this),
				wipeRight : function() {
					if((this.container.children('img').width() <= this.container.width()) || this.zoomActiveMode == 1 &&
					 (this.container.children('img').height() <= this.container.height()) || this.zoomActiveMode == 2){
						makeCallBack(this.previous());
					}
				}.bind(this),
				min_move_x : 50,
				min_move_y : 700,
				preventDefaultEvents : true
			});

	$(document).keyup( function(evt) {
	
		if (evt.keyCode === 27) {// esc
			if (!this.mainContainer.children('.editMetadata').hasClass('activeEditModeImage')) {
				makeCallBack(this.stop)(evt);
			}
		} else if (evt.keyCode === 37) {// left
			if (!this.mainContainer.children('.editMetadata').hasClass('activeEditModeImage')) {
				makeCallBack(this.previous)(evt);
			}
		} else if (evt.keyCode === 38) {// up
			if (!this.mainContainer.children('.editMetadata').hasClass('activeEditModeImage')) {
				this.mainContainer.addClass('active');
				this.mainContainer.children('.controlsOn').addClass('showControl');
			}

		} else if (evt.keyCode === 40) {// down
			if (!this.mainContainer.children('.editMetadata').hasClass('activeEditModeImage')) {
				this.mainContainer.removeClass('active');
				this.mainContainer.children('.controlsOn').removeClass('showControl');
			}

		} else if (evt.keyCode === 39) {// right
			if (!this.mainContainer.children('.editMetadata').hasClass('activeEditModeImage')) {
				makeCallBack(this.next)(evt);
			}

		} else if (evt.keyCode === 32) {// space
			if (!this.mainContainer.children('.editMetadata').hasClass('activeEditModeImage')) {
				if(!this.mainContainer.find('.pause').is(':visible')){
					makeCallBack(this.play)(evt);
				}else{
					makeCallBack(this.pause)(evt);
				}
				
			}
		} else if (evt.keyCode === 70) {// f (fullscreen)
			if (!this.mainContainer.children('.editMetadata').hasClass('activeEditModeImage')) {
				makeCallBack(this.fullScreenToggle)(evt);
			}
		} else if (evt.keyCode === 84) {// ctrl t (preview image gallery)
			if(this.userconfig.thumbnailpreview === 'true'){
				if (!this.mainContainer.children('.editMetadata').hasClass('activeEditModeImage')) {
					makeCallBack(this.initPreviewImages)(evt);
				}
			}
		}else if (evt.keyCode === 73) {// ctrl i (show info)
			if(this.userconfig.info === 'true'){
				if (!this.mainContainer.children('.editMetadata').hasClass('activeEditModeImage')) {
					makeCallBack(this.metaInfoShow)(evt);
				}
			}
		}
		 else if (evt.keyCode === 48 || evt.keyCode === 96) {// zero
			makeCallBack(this.zoomToFit)(evt);
		}
	}.bind(this));

	jQuery(window).resize( function() {
		this.zoomToFit();
	}.bind(this));

	if (play) {
		this.play();
	} else {
		this.pause();
	}
};

SlideShow.prototype.controlsAlwaysOn = function() {
	if (this.mainContainer.hasClass('active')) {
		this.mainContainer.removeClass('active');
		this.mainContainer.find('.controlsOn').removeClass('showControl');
	} else {
		this.mainContainer.addClass('active');
		this.mainContainer.find('.controlsOn').addClass('showControl');
	}
};

SlideShow.prototype.metaInfoShow = function() {

	if (this.bMetaInfo === true) {
		this.mainContainer.find('.infoMeta').removeClass('showMeta');
		this.bMetaInfo = false;
		this.mainContainer.children('label.labelBigImage').hide();
	} else {
		this.bMetaInfo = true;
		this.mainContainer.find('.infoMeta').addClass('showMeta');
		this.getMetaInfo(this.images[this.current].path);
		//this.mainContainer.children('label.labelBigImage').css('left', this.container.children('img').offset().left + 'px');
		this.mainContainer.children('label.labelBigImage').show();
	}
};

SlideShow.prototype.saveMetaData = function() {

	$.getJSON(OC.generateUrl('apps/gallerydeluxe/savemetadataimage'), {
		title : $('#mTitle').val(),
		descr : $('#mDescr').val(),
		location : $('#mAddr').val(),
		city : $('#mCity').val(),
		country : $('#mCountry').val(),

		file : this.images[this.current].path
	}, function(result) {
		if (this.bMetaInfo === true) {
			this.getMetaInfo(this.images[this.current].path);
			this.mainContainer.children('label.labelBigImage').show();
		}
        var editTitle= $('#mTitle').val();
        
		Gallery.imageMap[this.images[this.current].path].title = editTitle;
		var album = Gallery.albumMap[Gallery.currentAlbum];
		
		var images = album.images;
		images[this.current].title =editTitle;
		var editId=this.images[this.current].fileid;
		$('.title-img-'+editId).text(editTitle);
		if($('#mFilename').val().toLowerCase() == 'cover.jpg'){
			Gallery.albumMap[Gallery.currentAlbum].name= editTitle;
			if($('.album-id-'+Gallery.albumMap[Gallery.currentAlbum].albumid).length > 0){
				$('.album-id-'+Gallery.albumMap[Gallery.currentAlbum].albumid).text(editTitle);
			}
		
		}	
		//$('button.sort').addClass('arrowDown');
		$('#dMessage').text(result);
		Gallery.sortImagesRefresh();

		
	}.bind(this));
};
SlideShow.prototype.metaInfoEdit = function() {

	if (!this.mainContainer.find('.editMetadata').hasClass('activeEditModeImage')) {

		var Close = $('<button/>').attr('id', 'dClose').text(t('gallerydeluxe','Close')).click( function() {
			$('#dialog').hide();
			$('#dialog').empty();
			$('#overlayEdit').hide();
			this.mainContainer.find('.editMetadata').removeClass('activeEditModeImage');

		}.bind(this));

		var Save = $('<button/>').text(t('gallerydeluxe','Save')).attr('id', 'dSave').click( function() {
			this.saveMetaData();
		}.bind(this));
		this.mainContainer.find('.editMetadata').addClass('activeEditModeImage');
		var token = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';

		path = this.images[this.current].path;
		$.getJSON(OC.generateUrl('apps/gallerydeluxe/getmetadataimage'), {
			file : path,
			token : token
		}, function(result) {
			
			$('#overlayEdit').show();
			var html = '';
 			if(result.success){
				 html = $('<div/>').html(
					'<label>'+t('gallerydeluxe','Edit IPTC Metadata')+'</label><div id="dMessage"></div>' 
					+'<label class="metaDescr">'+t('gallerydeluxe','Title')+'</label> <input type="text" placeholder="'+t('gallerydeluxe','Title')+'" id="mTitle" style="width:64%;" value="' + result.title + '" />' 
					+'<label class="metaDescr">'+t('gallerydeluxe','Description')+'</label><input type="text" style="width:64%;" placeholder="'+t('gallerydeluxe','Description')+'" id="mDescr" value="' + result.description + '" />' 
					+'<label class="metaDescr">'+t('gallerydeluxe','Address')+'</label><input type="text" style="width:64%;" placeholder="'+t('gallerydeluxe','Address')+'" id="mAddr" value="' + result.location + '" />' 
					+'<label class="metaDescr">'+t('gallerydeluxe','City')+'</label><input type="text" style="width:64%;" placeholder="'+t('gallerydeluxe','City')+'" id="mCity" value="' + result.city + '" />' 
					+'<label class="metaDescr">'+t('gallerydeluxe','Country')+'</label><input type="text" style="width:64%;" placeholder="'+t('gallerydeluxe','Country')+'" id="mCountry" value="' + result.country + '" />' + '<br />'
					+'<label class="metaDescr">'+t('gallerydeluxe','Filename')+'</label><input type="text" style="width:64%;" readonly="readonly" placeholder="'+t('gallerydeluxe','Filename')+'" id="mFilename" value="' + result.filename + '" /><br /><br />'

					);
				$('#dialog').append(html);
				$('#dialog').append(Save);
			}else{
				 html="<label>"+t('gallerydeluxe','Information')+"</label><br />"+t('gallerydeluxe','Not Supported Image Format, only JPEG Files are editable!')+"<br /><br />";
				$('#dialog').append(html);
			}
			
			$('#dialog').append(Close);

			$('#dialog').show();
			$('#mTitle').focus();
		});
	}

};

SlideShow.prototype.preloadPreview = function(count) {
	var items = this.images;
	var fileIds = [];
	for (var i = this.preloadOffset; i < this.preloadOffset + count && i < items.length; i++) {
		fileIds = fileIds.concat(items[i].fileid);
		this.loadBatchPreviewImage(fileIds, this.token);
		this.preloadOffset = i;
	}
};
SlideShow.prototype.loadPreviewImage = function(image,token,i) {
	
	if (!this.imagePreviewCache[image.fileid]) {
			
		 var imgSrcUrl = OC.generateUrl('apps/gallerydeluxe/getsmallpreviewimage?file={file}&fileId={fileId}&scale={scale}&token={token}', {
					file : image.path,
					fileId : image.fileid,
					scale : 1,
					token : token
				});
			$this = this;
			this.imagePreviewCache[image.fileid] = new jQuery.Deferred();
						var img = new Image();
						 $(img).hide();
						$(img).load(function(){
							if (img) {
								
							 	$(this).fadeIn(800);
							 	 $(img).width=72;
							 	 $(img).height=72;
							}
							if ($this.imagePreviewCache[image.fileid]) {
								$this.imagePreviewCache[image.fileid].resolve(img);
							}
						}).error(function(){
							alert(image.path);
							if ($this.imagePreviewCache[image.fileid]) {
								$this.imagePreviewCache[image.fileid].reject(image.fileid);
							}
						}).attr({
							 	'data-index': i,
							 	'class':'imagePreview',
							 	'width':72,
							 	'height':72
							 })
		                    .on('click', function() {
		                    
							this.current = parseInt($(img).attr('data-index'));
							this.show(this.current);
		
						}.bind(this));
						
						img.src = imgSrcUrl;	
					}
					return this.imagePreviewCache[image.fileid];
};

SlideShow.prototype.initPreviewImages = function() {

	if (this.mainContainer.find('.previewGal').hasClass('showGal')) {
		this.mainContainer.find('.previewGal').removeClass('showGal');
		this.previewContainer.hide();
		this.bPreviewImages = false;
		this.mainContainer.children('.previewNext').hide();
		this.mainContainer.children('.previewPrevious').hide();
	} else {
		this.mainContainer.find('.previewGal').addClass('showGal');
		this.mainContainer.children('.previewNext').show();
		this.mainContainer.children('.previewPrevious').show();
		this.bPreviewImages = true;

		if ($('.imagePreview').length >= 1) {
			this.previewContainer.show();
			this.scrollToPreview(this.current);
		} else {

			var makeCallBack = function(handler) {
				return function(evt) {
					if (!this.active) {
						return;
					}
					evt.stopPropagation();
					handler.call(this);
				}.bind(this);
			}.bind(this);

			this.mainContainer.children('.previewNext').click(makeCallBack(this.nextPagePreview));
			this.mainContainer.children('.previewPrevious').click(makeCallBack(this.previousPagePreview));

			this.previewContainer.width((this.images.length * 76) * 2);
 			this.previewContainer.show();
 			
			var token = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';
			var myThis = this;
			var imgDiv = [];
			
			$.each(this.previewImages, function(i, image) {
                
                 if(image.status === 'ok'){
                  imgDiv[i]=$('<div/>')
					.attr({
						'class':'imageDivPreview icon-loading',
						'data-index': i,
						})
					.css({'text-align':'center'});
			   
				this.loadPreviewImage(image,token,i).then(function(img){
					imgDiv[i].removeClass('icon-loading');
					imgDiv[i].append(img);
				});
				
			}
				
			}.bind(this));

			this.previewContainer.append(imgDiv);
            this.scrollToPreview(this.current);
           
			var browser = new bigshot.Browser();

			this.previewContainer.children('img').each(function(i, e) {
				browser.registerListener(e, "click", browser.stopEventBubblingHandler(), false);
				browser.registerListener(e, "touchstart", browser.stopEventBubblingHandler(), false);
				browser.registerListener(e, "touchend", browser.stopEventBubblingHandler(), false);

			});
/*
			this.previewContainer.touchwipe({
				wipeLeft : function() {
					this.nextPagePreview();
				}.bind(this),
				wipeRight : function() {
					this.previousPagePreview();
				}.bind(this),
				min_move_x : 20,
				min_move_y : 20,
				preventDefaultEvents : true
			});*/
		}
	}
};

SlideShow.prototype.nextPagePreview = function() {
	var imgCount = this.images.length;
	var picsPerPage = 8;
	
	if (this.currentIndex === null || this.currentIndex === undefined) {
		this.currentIndex = this.current;
	}
	
	if (this.currentIndex === 0) {
		this.currentIndex = 1;
	}
	
	if (imgCount > this.currentIndex) {
		this.currentIndex +=  picsPerPage ;
		if (imgCount < this.currentIndex) {
			this.currentIndex-=picsPerPage;
		}
	}
	

	
	this.scrollToPreview(this.currentIndex);

};

SlideShow.prototype.scrollToPreview = function(index) {
	if (this.bMinimal === false && this.bPreviewImages === true) {
		$('.imageDivPreview').removeClass('prev-image-active');
		$('.imageDivPreview[data-index=' + index + ']').addClass('prev-image-active');
		$('#previewContainer').scrollTo($('.imageDivPreview[data-index=' + index + ']'), 800);
		
	}

};

SlideShow.prototype.previousPagePreview = function() {

	var picsPerPage = 8;

	if (this.currentIndex === null || this.currentIndex === undefined) {
		this.currentIndex = this.current;
	}
	if (this.currentIndex === 0) {
		this.currentIndex = 1;
	}

	if (this.currentIndex > 0) {
		this.currentIndex -= picsPerPage;
		if(this.currentIndex < 0){
			this.currentIndex = 0;
		} 
	}

	this.scrollToPreview(this.currentIndex);

};

SlideShow.prototype.getImageDownload=function(){
	var tokenCheck = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';
	
	window.location=OC.generateUrl('apps/gallerydeluxe/downloadimage?file={file}&token={token}',{file: encodeURIComponent(this.images[this.current].path),token : tokenCheck});
	return false;
};

SlideShow.prototype.zoomToFit = function() {
	if (this.zoomable !== null) {
		this.zoomable.flyZoomToFit();
		this.zoomActiveMode = 0;
		this.mainContainer.children('button.activeMode').removeClass('activeZoom');
		this.mainContainer.children('button.zoomToFit').addClass('activeZoom');
	}
};

SlideShow.prototype.zoomToFitHeight = function() {
	if (this.zoomable !== null) {
		this.zoomable.zoomToFitHeight();
		this.zoomActiveMode = 1;
		this.mainContainer.children('button.activeMode').removeClass('activeZoom');
		this.mainContainer.children('button.zoomToFitHeight').addClass('activeZoom');
	}
};

SlideShow.prototype.zoomToFitWidth = function() {
	if (this.zoomable !== null) {
		this.zoomable.zoomToFitWidth();
		this.zoomActiveMode = 2;
		this.mainContainer.children('button.activeMode').removeClass('activeZoom');
		this.mainContainer.children('button.zoomToFitWidth').addClass('activeZoom');
	}
};

SlideShow.prototype.fullScreenStart = function() {
	if (!this.canFullScreen) {
		return;
	}
	this.fullScreen = new bigshot.FullScreen(this.mainContainer.get(0));
	this.fullScreen.open();
	this.mainContainer.find('.fullscreen-start').hide();
	this.mainContainer.find('.fullscreen-exit').show();
	if(!this.bMinimal){
		this.mainContainer.children('.editMetadata').hide();
	}
	this.fullScreen.addOnClose( function(evt) {
		this.fullScreenExit();
	}.bind(this));
};

SlideShow.prototype.fullScreenExit = function() {
	this.mainContainer.find('.fullscreen-exit').hide();
	this.mainContainer.find('.fullscreen-start').show();
	if (this.fullScreen === null) {
		return;
	}
	this.fullScreen.close();
	if(!this.bMinimal){
		this.mainContainer.children('.editMetadata').show();
		
	}
	this.fullScreen = null;
};

SlideShow.prototype.fullScreenToggle = function() {
	if (this.zoomable === null)
		return;
	if (this.fullScreen !== null) {
		this.fullScreenExit();
	} else {
		this.fullScreenStart();
	}
};

SlideShow.prototype.onKeyUp = function(e) {

};

SlideShow.prototype.getMetaInfo = function(path) {
	
	this.mainContainer.children('label.labelBigImage').html('');
	this.mainContainer.children('label.labelBigImage').hide();
	
	if (this.bMetaInfo === true) {
		var token = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';
		var metaInfo = '';
		
		$.getJSON(OC.generateUrl('apps/gallerydeluxe/getmetadataimage'), {
			file : path,
			token : token
		}, function(result) {
            if(result.success){
				if (result.title !== '') {
					metaInfo += '<label class="mTitle">' + result.title + '</label><br>';
				}
				if (result.description !== '') {
					metaInfo += '<label class="mDescr">' + result.description + '</label><br>';
				}
				if (result.creation_date !== '') {
					metaInfo += '<label class="mDate">' + result.creation_date + '</label><br>';
				}
				if (result.location !== '') {
					metaInfo += result.location + '<br>';
				}
				if (result.city !== '') {
					metaInfo += result.city + ' ';
				}
				if (result.country !== '') {
					metaInfo += result.country + '<br>';
				} else {
					metaInfo += '<br>';
				}
				if (result.size !== '') {
					metaInfo += '<label class="mInfo">' + result.size + '/ ' + result.fSize + ' (' + result.filename + ')</label><br>';
				}
	
				if (result.latitude !== '' && result.longitude !== '') {
					metaInfo +=t('gallerydeluxe','Location Map')+':<br /><img class="map" id="geoloc" title="location" style="opacity:0.6;" src="http://maps.google.com/maps/api/staticmap?zoom=15&size=250x300&maptype=terrain&sensor=false&center=' + result.latitude + ',' + result.longitude + '&markers=color:blue%7Clabel:S%7C' + result.latitude + ',' + result.longitude + '"><br>';
					this.container.children('label.labelBigImage').css('left','10px');
				}
	            this.mainContainer.children('label.labelBigImage').css('left',this.container.children('img').offset().left+'px');
				this.mainContainer.children('label.labelBigImage').html(metaInfo);
				this.mainContainer.children('label.labelBigImage').show();
           }else{
           	    if (result.size !== '') {
					metaInfo = '<label class="mTitle">' + result.filename + '</label><br>';
					metaInfo += '<label class="mDate">' + result.creation_date + '</label><br>';
					metaInfo += '<label class="mInfo">' + result.size + '/ ' + result.fSize + '</label><br>';
				}
				
           	    this.mainContainer.children('label.labelBigImage').css('left',this.container.children('img').offset().left+'px');
				this.mainContainer.children('label.labelBigImage').html(metaInfo);
				this.mainContainer.children('label.labelBigImage').show();
           }
		}.bind(this));

		return false;
	}

};

SlideShow.prototype.show = function(index) {
    this.mainContainer.show();
	this.container.show();
	this.current = index;
	this.container.css('background-position', 'center');
	if (OC.Share.droppedDown) {
		OC.Share.hideDropDown();
	}

	return this.loadImage(this.images[index].url, this.images[index].path).then( function(image) {
		this.container.css('background-position', '-10000px 0');
		
		// check if we moved along while we were loading
		if (this.current === index) {
			
			
			this.currentImage = image;
			
			if (this.zoomable !== null) {
				this.zoomable.dispose();
				this.zoomable = null;
			}
		//	this.container.children('img').remove();
		//	this.container.append(image);
			
			
			this.getMetaInfo(this.images[index].path);
			
			this.mainContainer.find('a.sharefile').data({
				'item':this.images[index].fileid,
				'title' : this.images[index].name,
				'possible-permissions' : this.images[index].permissions
			});
			
			jQuery(image).css({
				'position' : 'absolute',
			});
			
			var scale=1;
			if(($(image).height() > $(image).width()) && $(image).height() > $(window).height()){
				  scale=0.5;
			}
		 	  
			
			
			this.container.children('img').remove();
			this.container.append(image);
			
				this.zoomable = new bigshot.SimpleImage(new bigshot.ImageParameters({
						container : this.container.get(0),
						maxZoom : 2,
						minZoom : -2,
						touchUI : false,
						width : ($(image).width() * scale),
						height : ($(image).height() * scale)
					}), image);
				/*	
				this.container.children('img').animate({
					'opacity':1
				},1000);*/
			
			

			// prevent zoom-on-doubleClick
			this.zoomable.addEventListener("dblclick", function(ie) {
				this.zoomToFit();
				ie.preventDefault();
			}.bind(this));
         

			if (this.zoomActiveMode === 0) {
				this.zoomToFit();
			} else if (this.zoomActiveMode === 1) {
				this.zoomToFitHeight();
			} else if (this.zoomActiveMode === 2) {
				this.zoomToFitWidth();
			}
			
			this.setUrl(this.images[index].path);
			if (this.playing) {
				this.setTimeout();
			}

		}
		
		if (this.bPreviewImages === true) {
			$('.imagePreview').removeClass('active');
			$('.imagePreview[data-index=' + index + ']').addClass('active');
	
			this.scrollToPreview(this.current);
		}
		
	}.bind(this));

};

SlideShow.prototype.setUrl = function(path) {
	if (history && history.replaceState) {
		history.replaceState('', '', '#' + encodeURI(path));
	}
};

SlideShow.prototype.loadImage = function(url, path) {

	if (!this.imageCache[url]) {
		this.imageCache[url] = new jQuery.Deferred();
		var image = new Image();

		image.onload = function() {
			if (image) {
				image.natWidth = image.width;
				image.natHeight = image.height;
			}
			if (this.imageCache[url]) {
				this.imageCache[url].resolve(image);
			}
		}.bind(this);
		image.onerror = function() {
			
			if (this.imageCache[url]) {
				this.imageCache[url].reject(url);
			}
			//this.images.splice(this.current,1);
		}.bind(this);
		image.src = url;
	}
	// this.container.children('label.labelBigImage').html('');

	return this.imageCache[url];
};

SlideShow.prototype.setTimeout = function() {
	this.clearTimeout();
	this.playTimeout = setTimeout(this.next.bind(this), this.interval);
	this.progressBar.stop();
	
	this.progressBar.css({'display':'block'});
	
	this.progressBar.animate({
		'width' :$(window).width()
	}, this.interval, 'linear');
};

SlideShow.prototype.clearTimeout = function() {
	if (this.playTimeout) {
		clearTimeout(this.playTimeout);
	}
	this.progressBar.stop();
	this.progressBar.css({'display':'none','width':'0%'});
	this.playTimeout = 0;
};

SlideShow.prototype.play = function() {
	this.playing = true;
	this.mainContainer.find('.pause').show();
	
	this.mainContainer.find('.play').hide();
	if(!this.bMinimal){
		this.mainContainer.children('.editMetadata').hide();
	}
	this.setTimeout();
};

SlideShow.prototype.pause = function() {
	this.playing = false;
	this.mainContainer.find('.pause').hide();
	this.mainContainer.find('.play').show();
	if(!this.bMinimal){
		//this.mainContainer.children('.editMetadata').show();
		
	}
	this.clearTimeout();
};

SlideShow.prototype.next = function() {
	if (this.zoomable !== null) {
		this.zoomable.stopFlying();
	}
   
	this.current = (this.current + 1) % this.images.length;
	var next = (this.current + 1) % this.images.length;
	this.show(this.current).then( function() {
		// preload the next image
		this.loadImage(this.images[next].url, this.images[next].path);
	}.bind(this));
};

SlideShow.prototype.previous = function() {
	if (this.zoomable !== null) {
		this.zoomable.stopFlying();
	}
	this.current = (this.current - 1 + this.images.length) % this.images.length;
	var previous = (this.current - 1 + this.images.length) % this.images.length;
	this.show(this.current).then( function() {
		// preload the next image
		this.loadImage(this.images[previous].url, this.images[previous].path);
	}.bind(this));
};

SlideShow.prototype.stop = function() {
	if (this.fullScreen !== null) {
		this.fullScreenExit();
	}
	$('#previewContainerInner').empty();
	this.mainContainer.find('.infoMeta').removeClass('showMeta');
	//this.mainContainer.children('.previewGal').removeClass('showGal');
	
	if (this.mainContainer.hasClass('active')) {
		this.mainContainer.removeClass('active');
		this.mainContainer.find('.controlsOn').removeClass('showControl');
	}
		this.mainContainer.find('.previewGal').removeClass('showGal');
		this.previewContainer.hide();
		this.bPreviewImages = false;
		this.mainContainer.children('.previewNext').hide();
		this.mainContainer.children('.previewPrevious').hide();
	
	
	this.bPreviewImages=false;
	this.zoomActiveMode = 0;
	
	this.clearTimeout();
	this.container.hide();
	this.mainContainer.hide();
	if (this.zoomable !== null) {
		this.zoomable.dispose();
		this.zoomable = null;
	}
	this.active = false;
	if (this.onStop) {
		this.onStop();
	}
	//document.location.hash = '';
	//return false;
};

SlideShow.prototype.hideImage = function() {
	this.container.children('img').remove();
};

SlideShow.prototype.togglePlay = function() {
	if (this.playing) {
		this.pause();
	} else {
		this.play();
	}
};

SlideShow._getSlideshowTemplate = function() {
	var defer = $.Deferred();
	if (!this.$slideshowTemplate) {
		var self = this;
		$.get(OC.filePath('gallerydeluxe', 'templates', 'slideshow.html'), function(tmpl) {
			self.$slideshowTemplate = $(tmpl);
			defer.resolve(self.$slideshowTemplate);
		}).fail(function() {
			defer.reject();
		});
	} else {
		defer.resolve(this.$slideshowTemplate);
	}
	return defer.promise();
};
window.onhashchange = function() {
	var path = decodeURI(location.hash).substr(1);
	
};

$(document).ready(function() {
	if ($('#body-login').length > 0) {
		return true;
		//deactivate slideshow on login page
	}

	$.when(SlideShow._getSlideshowTemplate()).then(function($tmpl) {
		$('body').append($tmpl);
		//move the slideshow outside the content so we can hide the content

		var inactiveCallback = function() {
			$('#slideshow').addClass('inactive');
		};
		var inactiveTimeout = setTimeout(inactiveCallback, 3000);

		$('#slideshow').mousemove(function() {
			$('#slideshow').removeClass('inactive');
			clearTimeout(inactiveTimeout);
			inactiveTimeout = setTimeout(inactiveCallback, 3000);
		});

		if (!SVGSupport()) {//replace all svg images with png images for browser that dont support svg
			OC.Util.replaceSVG();
		}
	}).fail(function() {
		OC.Notification.show(t('core', 'Error loading slideshow template'));
	});

	if (OCA.Files && OCA.Files.fileActions) {
		
			
		
		OCA.Files.fileActions.register('image', 'View', OC.PERMISSION_READ, '', function(filename, context) {
			var imageUrl, files = context.fileList.files;
			var start = 0;
			var images = [];
			var dir = context.dir + '/';
			var user = OC.currentUser;
			var width = $(document).width() * window.devicePixelRatio;
			var height = $(document).height() * window.devicePixelRatio;
			
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				if (file.mimetype && file.mimetype.indexOf('image') >= 0) {
					if (file.mimetype === 'image/tiff') {
					   continue;
					}
					else if (file.mimetype === 'image/svg+xml') {
						 continue;
					} else {
						imageUrl = OC.generateUrl('/core/preview.png?file={file}&x={x}&y={y}&a=true&scalingup=0', {
							x : width,
							y : height,
							file :dir + file.name
						});

						if (!user) {
							imageUrl = OC.generateUrl('/apps/files_sharing/publicpreview?file={file}&x={x}&y={y}&a=true&t={t}&scalingup=0', {
								file : dir + file.name,
								x : width,
								y : height,
								t : $('#sharingToken').val()
							});
						}
					}
					
					images.push({
						name : file.name,
						path : dir + file.name,
						url : imageUrl
					});
				}
			}
			
			for ( i = 0; i < images.length; i++) {
				if (images[i].name === filename) {
					start = i;
				}
			}
			var slideShow = new SlideShow($('#viewportImage'), images);
			slideShow.minimalView(true);
			slideShow.init();
			slideShow.show(start);
		});
		OCA.Files.fileActions.setDefault('image', 'View');
		OCA.Files.fileActions.setDefault('image/tiff', 'Download');
		OCA.Files.fileActions.setDefault('image/svg+xml', 'Edit');
	}
});
