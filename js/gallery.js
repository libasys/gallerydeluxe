var Gallery = {};
Gallery.images = [];
Gallery.currentAlbum = '';
Gallery.users = [];
Gallery.albumMap = {};
Gallery.imageMap = {};
Gallery.folderSharees = {};
Gallery.init = false;
Gallery.bSort = true;
Gallery.userConfig = {};


Gallery.getAlbum = function(path, token) {
	
	if (!Gallery.albumMap[path]) {
		Gallery.albumMap[path] = new Album(path, [], [], OC.basename(path), token);
		if (path !== '') {
			var parent = OC.dirname(path);
			if (parent === path) {
				parent = '';
			}
			Gallery.getAlbum(parent, token).subAlbums.push(Gallery.albumMap[path]);
			//Gallery.getAlbum(parent, token);
		}
	}
	
	return Gallery.albumMap[path];
};

// fill the albums from Gallery.images

Gallery.fillAlbums = function(currentpath) {
	var sortFunction = function(a, b) {
		if (a.title !== undefined) {
			//Files
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
		} else {
			//Folders
			return a.path.toLowerCase().localeCompare(b.path.toLowerCase());
		}
	};
	
	var token = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';
	
	
	
	var album, image;
	return $.getJSON(OC.generateUrl('apps/gallerydeluxe/getimages'), {
		token : token,
		currentpath:'/'+currentpath,
		firstloading:Gallery.init
	}).then(function(data) {
		Gallery.images = data;
	   	var bLock=false;
	   	
	   	if(!Gallery.albumMap['']){
			if(token === ''){
				
				Gallery.albumMap[''] = new Album('', [], [], 'Album',0,31, OC.currentUser, token);
			}else{
				Gallery.albumMap[''] = new Album('', [], [], 'Album',0,11,'', token);
			}
			
			Gallery.albumMap[''].fullLoad=true;
			
		}
	   
		
        $.each(Gallery.images,function(i,el){
     
        	var path = el.path;
       
        	if(!Gallery.imageMap[el.path]){
     			
	        	var image = new GalleryImage(el.path, path, el.title, el.nameraw, el.mtime, el.fileid, el.permissions, token);
	        	 var dir = OC.dirname(path);
					
					if (dir === path) {
						dir = '';
					}
				
				//album = Gallery.getAlbum(dir,token);
			
				if (!Gallery.albumMap[dir]) {
						
					Gallery.albumMap[dir] = new Album(dir, [], [], el.name,el.folderid,el.permissions,el.owner, token);
					Gallery.albumMap[''].subAlbums.push(Gallery.albumMap[dir]);
				}
				
				Gallery.albumMap[dir].images.push(image);
				
				Gallery.imageMap[image.path] = image;
				
				
				if(token !== ''){
					
					if(el.nameraw.toLowerCase() == 'cover.jpg' && el.title.toLowerCase() != 'cover.jpg'){
						 Gallery.albumMap[''].name=el.title;
					}
						
				}
				
				
			}
			
			
			 
        });
 		 	
 		 	if(!Gallery.albumMap[currentpath]){
			  Gallery.showEmpty();
			  return;
		}
 		 	
		    Gallery.albumMap[currentpath].fullLoad=true;
		  
	});
	

};
Gallery.getAlbumInfoAsap = function(album) {
	
	if (album === $('#gallery').data('token')) {
		return [];
		
	}
 
	if (!Gallery.getAlbumInfo.cache[album]) {
		$.getJSON(OC.generateUrl('apps/gallerydeluxe/loadgallery?gallery={gallery}', {
			gallery : album
		}), function(data) {
			Gallery.getAlbumInfo.cache[album] = data;
          
		});
		
	}
	return Gallery.getAlbumInfo.cache[album];
};

Gallery.getAlbumInfo = function(album) {
	
	if (album === $('#gallery').data('token')) {
		return [];
	}
 
	if (!Gallery.getAlbumInfo.cache[album]) {
		var def = new $.Deferred();
		Gallery.getAlbumInfo.cache[album] = def;
		$.getJSON(OC.generateUrl('apps/gallerydeluxe/loadgallery?gallery={gallery}', {
			gallery : album
		}), function(data) {
			def.resolve(data);
          
		});
		
	}
	return Gallery.getAlbumInfo.cache[album];
};
Gallery.getAlbumInfo.cache = {};
Gallery.getImage = function(image,imageid) {
	var token = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';
	return OC.generateUrl('apps/gallerydeluxe/getbigpreviewimage?file={file}&fileId={fileId}&token={token}', {
		file : image,
		fileId : imageid,
		token : token
	});
};

Gallery.view = {};
Gallery.view.element = null;
Gallery.view.clear = function() {
	Gallery.view.element.empty();
	Gallery.showLoading();
};
Gallery.view.cache = {};

Gallery.view.viewAlbum = function(albumPath) {
	var i, crumbs, path;
	albumPath = albumPath || '';
	
	if (!Gallery.albumMap[albumPath]) {

		return;
	}
    
	Gallery.view.clear();
	if (albumPath !== Gallery.currentAlbum) {
		Gallery.view.loadVisibleRows.loading = false;

	}
	Gallery.currentAlbum = albumPath;

	if (albumPath === '' || $('#gallery').data('token')) {
		$('a.share').hide();
		$('a#linkToDir').hide();
		$('button.batch').hide();
		//$('button.RegenBatch').hide();
	} else {
		$('a.share').show();
		$('a#linkToDir').show();
		$('button.batch').show();
		//$('button.RegenBatch').show();
	}

	OC.Breadcrumb.clear();
	var albumName = $('#content').data('albumname');
	if (!albumName) {
		albumName = t('gallerydeluxe', 'Album');
	}
	OC.Breadcrumb.push(albumName, '#');
	
	path = '';
	crumbs = albumPath.split('/');
	
	for ( i = 0; i < crumbs.length; i++) {
		if (crumbs[i]) {
			if (path) {
				path += '/' + crumbs[i];
			} else {
				path += crumbs[i];
			}
			if(i == (crumbs.length-1)){
				Gallery.view.pushBreadCrumb(Gallery.albumMap[path].name, path);
			}
		}
	}
	
	if ($('#gallery').data('token')) {
		Gallery.view.pushBreadCrumb(Gallery.albumMap[''].name, '');
	}
	if (! $('#gallery').data('token')) {
			$('#controls a.share').data({
				'item': Gallery.albumMap[albumPath].albumid,
				'possible-permissions':Gallery.albumMap[albumPath].permissions,
				'title':Gallery.albumMap[albumPath].name
				});
		   
		    var albumInfo = OC.Share.loadItem('folder',Gallery.albumMap[albumPath].albumid);
		    var sInfoShare='';
		    $.each(albumInfo.shares,function(i,el){
		    	if(el.share_type === 3){
		    		sInfoShare='<i class="ioc ioc-publiclink" title="shared by link"></i>';
		    	}
		    	if(el.share_type === 0){
		    		sInfoShare+='<i class="ioc ioc-user" title="shared with user '+el.share_with+'"></i>';
		    	}
		    	if(el.share_type === 1){
		    		sInfoShare+='<i class="ioc ioc-users" title="shared with group '+el.share_with+'"></i>';
		    	}
		    });
		    if(sInfoShare === ''){
		    	sInfoShare=t('gallerydeluxe','Share');
		    }
		    
		    $('#controls a.share').html(sInfoShare);
		    
		 
		var urlToDir= OC.generateUrl('apps/files?dir={dir}',{dir:Gallery.currentAlbum});
		$('#linkToDir').attr('href',urlToDir);
		    
   }
	Gallery.albumMap[albumPath].viewedItems = 0;
	
//	setTimeout(function() {
	Gallery.view.loadVisibleRows.activeIndex = 0;
	Gallery.view.loadVisibleRows(Gallery.albumMap[Gallery.currentAlbum], Gallery.currentAlbum);
	//}, iTimeOut);
};

Gallery.view.loadVisibleRows = function(album, path) {
  
   	if (Gallery.view.loadVisibleRows.loading && Gallery.view.loadVisibleRows.loading.state() !== 'resolved') {
		return Gallery.view.loadVisibleRows.loading;
	}
	// load 2 windows worth of rows
	var scroll = $('#content-wrapper').scrollTop() + $(window).scrollTop();
	var targetHeight = ($(window).height() * 2) + scroll;
	var windowWidth=$(window).width();
	
	var showRows = function(album) {
		
		if (!(album.viewedItems < album.subAlbums.length + album.images.length)) {
			Gallery.view.loadVisibleRows.loading = null;
			
			return;
		}
		
		
		return album.getNextRow(windowWidth).then(function(row) {
			
			return row.getDom().then(function(dom) {
				// defer removal of loading class to trigger CSS3 animation
				
				_.defer(function() {
					dom.removeClass('loading');
				});
				if (Gallery.currentAlbum !== path) {
				
					Gallery.view.loadVisibleRows.loading = null;
					return;
					//throw away the row if the user has navigated away in the meantime
				}
				if (Gallery.view.element.length == 1) {
					Gallery.showNormal();
				}
				Gallery.view.element.append(dom);
				
				if (album.viewedItems < album.subAlbums.length + album.images.length && Gallery.view.element.height() < targetHeight) {
					 
					 return showRows(album);
				} else {
				
					Gallery.view.loadVisibleRows.loading = null;
					if (!(album.viewedItems < album.subAlbums.length + album.images.length)) {
				   		$('#controls button').removeAttr('disabled').addClass('isActive');
				   		
				  	}
				}
			}, function() {
				Gallery.view.loadVisibleRows.loading = null;
			});
		});
	};
	
	if (Gallery.view.element.height() < targetHeight) {
		
		Gallery.view.loadVisibleRows.loading = true;
		Gallery.view.loadVisibleRows.loading = showRows(album);
		
	 	return Gallery.view.loadVisibleRows.loading;
	}
};
Gallery.view.loadVisibleRows.loading = false;

Gallery.view.pushBreadCrumb = function(text, path) {
	
	OC.Breadcrumb.push(text, '#' + path);
};

Gallery.showEmpty = function() {
	$('#controls').addClass('hidden');
	$('#emptycontent').removeClass('hidden');
	$('#loading').hide();
};

Gallery.showLoading = function() {
	$('#emptycontent').addClass('hidden');
	$('#controls').removeClass('hidden');
	$('#loading').show();
};

Gallery.showNormal = function() {
	$('#emptycontent').addClass('hidden');
	$('#controls').removeClass('hidden');
	$('#loading').hide();
};

Gallery.slideShow = function(images, startImage, autoPlay) {
	var start = images.indexOf(startImage);

	images = images.map(function(image) {
			
			return {
				name : OC.basename(image.path),
				url : Gallery.getImage(image.src,image.fileid),
				fileid : image.fileid,
				path : image.path,
				status : image.status,
				permissions : image.permissions,
			};
		
	});

	var slideShow = new SlideShow($('#viewportImage'), images);
	Thumbnail.concurrent = 1;

	slideShow.onStop = function() {
		Gallery.activeSlideShow = null;

		$('#content').show();
		location.hash = encodeURI(Gallery.currentAlbum);
		
		Thumbnail.concurrent = 3;
	};
	Gallery.activeSlideShow = slideShow;

	slideShow.init(autoPlay);
	slideShow.show(start);
};

Gallery.sortImagesRefresh = function() {
	var sortFunction = function(a, b) {
		//Files
		return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
	};
	
	var path = Gallery.currentAlbum;
	var albumPath = path;
	var album = Gallery.albumMap[albumPath];
	var images = album.images;
    
     $.each(Gallery.albumMap,function(path){
         	Gallery.albumMap[path].images.sort(sortFunction);
       });
    
	
	Gallery.view.viewAlbum(Gallery.currentAlbum);
};


Gallery.sortActive = function(bActive) {
	Gallery.bSort = bActive;
};
Gallery.sortImagesByName = function() {
	var sortFunction = function(a, b) {
			
			return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
	};
	
	if (Gallery.bSort === true) {
        
		if ($('button.sort i').hasClass('ioc-rotate-180')) {
			$('button.sort i').removeClass('ioc-rotate-180');

		} else {
			$('button.sort i').addClass('ioc-rotate-180');

		}
        
		
         $.each(Gallery.albumMap,function(path){
         	Gallery.albumMap[path].images.sort(sortFunction);
			Gallery.albumMap[path].subAlbums.sort(sortFunction);
			//Sort DESC
			if ($('button.sort i').hasClass('ioc-rotate-180')) {
				Gallery.albumMap[path].images.reverse();
				Gallery.albumMap[path].subAlbums.reverse();
			}
       });
       /*
		var path = Gallery.currentAlbum;
		var albumPath = path;
		var album = Gallery.albumMap[albumPath];
		var images = album.images;*/

	
		Gallery.view.viewAlbum(Gallery.currentAlbum);
		Gallery.bSort = true;
		
	}
};

Gallery.sortImagesByDate = function() {
	var sortFunction = function(a, b) {
		//Files
		//return a.mtime.localeCompare(b.mtime);
		return a.mtime - b.mtime;
	};
	
   
	if ($('button.sortdate i').hasClass('ioc-rotate-180')) {
		$('button.sortdate i').removeClass('ioc-rotate-180');

	} else {
		$('button.sortdate i').addClass('ioc-rotate-180');

	}
	if (Gallery.bSort === true) {
		var path = Gallery.currentAlbum;
		var albumPath = path;
		var album = Gallery.albumMap[albumPath];
		var images = album.images;

		 $.each(Gallery.albumMap,function(path){
         	Gallery.albumMap[path].images.sort(sortFunction);
			Gallery.albumMap[path].subAlbums.sort(sortFunction);
			//Sort DESC
			if ($('button.sortdate i').hasClass('ioc-rotate-180')) {
				Gallery.albumMap[path].images.reverse();
				Gallery.albumMap[path].subAlbums.reverse();
			}
       });

		
		Gallery.view.viewAlbum(albumPath);
		Gallery.bSort = true;
	}
};

Gallery.batchPreviewImages = function() {
		
		var iCount=Gallery.images.length;
		var sumImages=20;
		var iCurrent=0;
		$('#notification').html(t('gallerydeluxe','Init Scan Images ...'));
		$('#notification').slideDown();
		
		 
		var scanForImages=function(imageCount){
			var aBatch=[];
			if(iCurrent > 0) iCurrent+=1;
			for(var i = iCurrent; i < imageCount; i++){
				if(Gallery.images[i]){
					aBatch.push(Gallery.images[i].fileid);
				}
				iCurrent=i;
				
			}
			
			var url=OC.generateUrl('apps/gallerydeluxe/getbatchimagesall?images={images}&current={current}',{
				images : aBatch.join(';'),
				current : iCurrent,
			});
			
			$.getJSON(url, function(jsondata) {
					$('#notification').html(jsondata.data.message);
						if(iCurrent < iCount){
							
							var tempSumImages=iCurrent+sumImages;
							if(tempSumImages>iCount){
								tempSumImages=iCount;
							}
							scanForImages(tempSumImages);
						}
						
						if(iCurrent >= iCount){
							 
							 $('#notification').text(t('gallerydeluxe','Scanning finished! All is well!'));
							 $('#notification').slideDown();
							 window.setTimeout(function(){$('#notification').slideUp();}, 3000);
						}
					
			});
			
		};
		
		
		if(iCurrent === 0){
			
			scanForImages(sumImages);
		}
		
		

};
Gallery.batchRegenerateImages=function(){
		var iCount=Gallery.albumMap[Gallery.currentAlbum].images.length;
		
		var sumImages=5;
		var iCurrent=0;
		$('#notification').html(t('gallerydeluxe','Init Regeneration Images ...'));
		$('#notification').slideDown();
		var bSquare = false;
		//Regenerate only Cover files square
		if(Gallery.currentAlbum === ''){
			bSquare = true;
			var iCountSquare=0;
			var aSquare = [];
			$.each(Gallery.imageMap,function(i,el){
				if(el.name.toLowerCase() === 'cover.jpg'){
					aSquare.push(el.fileid);
					iCountSquare++;
				}
			});
			iCount = iCountSquare;
		}
		
		var scanForImages=function(imageCount){
			var aBatch=[];
			if(iCurrent > 0) iCurrent+=1;
			
			for(var i = iCurrent; i < imageCount; i++){
				if(bSquare === false){
					if(Gallery.albumMap[Gallery.currentAlbum].images[i]){
						aBatch.push(Gallery.albumMap[Gallery.currentAlbum].images[i].fileid);
					}
				}
				if(bSquare === true){
					if(aSquare[i]){
						aBatch.push(aSquare[i]);
					}
				}
				iCurrent=i;
				
			}
			
			var url=OC.generateUrl('apps/gallerydeluxe/getbatchimagesall?images={images}&current={current}&square={square}&regenerate=true',{
				images : aBatch.join(';'),
				current : iCurrent,
				square : (bSquare) ? 1 : 0
			});
			
			$.getJSON(url, function(jsondata) {
						if(iCurrent < iCount){
							$('#notification').html(jsondata.data.message);
							var tempSumImages=iCurrent+sumImages;
							if(tempSumImages>iCount){
								tempSumImages=iCount;
							}
							scanForImages(tempSumImages);
						}
						if(iCurrent >= iCount){
							//Gallery.view.viewAlbum(Gallery.currentAlbum);
							 $('#notification').html(t('gallerydeluxe','Regeneration finished! All is well!'));
							 $('#notification').slideDown();
							 window.setTimeout(function(){$('#notification').slideUp();}, 3000);
							 
						}
					
			});
			
		};
		
		
		if(iCurrent == 0){
			
			if(iCount > sumImages){
				scanForImages(sumImages);
			}else{
				scanForImages(iCount);
			} 
			
		}
};

Gallery.openSettingsDialog = function(event){
	event.preventDefault();
		var popup = $('#appsettings_popup');
		if(popup.length === 0) {
			$('body').prepend('<div class="popup hidden" id="appsettings_popup"></div>');
			popup = $('#appsettings_popup');
			popup.addClass($('#appsettings').hasClass('topright') ? 'topright' : 'bottomleft');
		}
		if(popup.is(':visible')) {
			if(OC.Share.droppedDown){
				OC.Share.hideDropDown();
			}
			popup.hide().remove();
		} else {
			var arrowclass = $('#appsettings').hasClass('topright') ? 'up' : 'left';
			
			var url = OC.generateUrl('apps/gallerydeluxe/settingsindex');
			
			$.ajax({
				type : 'GET',
				url : url,
				success : function(data) {
					
					popup.html(data);
					
					popup.prepend('<span class="arrow '+arrowclass+'"></span><h2>'+t('core', 'Settings')+'</h2><a class="close svg"></a>').show();
					popup.find('.close').bind('click', function() {
						if(OC.Share.droppedDown){
							OC.Share.hideDropDown();
						}
						popup.remove();
					});
					$('button.batch').click(Gallery.batchPreviewImages);
					$('button.RegenBatch').click(Gallery.batchRegenerateImages);
					$('.slideshowsettings, .thumbsettings').change( function(){
						$.post( OC.generateUrl('apps/gallerydeluxe/saveusersettings'), {
							'checked' : $(this).is(':checked'),
							'name' : $(this).attr('name')
						}, function(jsondata){
							if(jsondata.status == 'success'){
								Gallery.userConfig[jsondata.data.name] = jsondata.data.checked;
								
								if(jsondata.data.name === 'thumbdarkdesign'){
									if(jsondata.data.checked === 'true'){
									$('#content').addClass('dark-design');
									}else{
										if($('#content').hasClass('dark-design')){
											$('#content').removeClass('dark-design');
										}
									}
								}
								
							}
							//OC.msg.finishedSaving('.msgTzd', jsondata);
						});
						return false;
					});
					
					/*
					$.getScript(OC.filePath('gallery', 'js', 'settings.js'))
						.fail(function(jqxhr, settings, e) {
							throw e;
						});*/
					
					
					popup.show();
					
					
				}
			});
		}
};

Gallery.activeSlideShow = null;

$(document).ready(function() {
	Gallery.init = true;
	 $('.toolTip').tipsy({
				html : true,
				className:'.toolTip',
				gravity : $.fn.tipsy.autoNS
			});
	
	//Gallery.userConfig //getusersettings
	$.getJSON(OC.generateUrl('apps/gallerydeluxe/getusersettings'),function(result){
			if(result.status==='success'){
				Gallery.userConfig = result.userConfig;
				
				if(Gallery.userConfig.thumbdarkdesign === 'true'){
					$('#content').addClass('dark-design');
					
				}else{
					if($('#content').hasClass('dark-design')){
						$('#content').removeClass('dark-design');
					}
				}
			}
	});
	
	$(document).on('click', '#dropdown #dropClose', function(event) {
		event.preventDefault();
		event.stopPropagation();
		OC.Share.hideDropDown();
		return false;
	});	
	
	$(document).on('click', 'a.share', function(event) {
	//	if (!OC.Share.droppedDown) {
		event.preventDefault();
		event.stopPropagation();
		var imgShow='';
		var AddDescr =t('gallerydeluxe','Picture')+' ';
		if($('a[data-albumid="'+$(this).data('item')+'"]').length === 1){
		var imgSrc = $('a[data-albumid="'+$(this).data('item')+'"]').find('img').attr('src');
			imgShow= '<img src="'+imgSrc+'" width="30" style="float:left; margin-right:5px;" /> ';
			AddDescr=t('gallerydeluxe','Album')+' ';
		}
		if($(this).data('item-type') === 'folder' && $('a[data-albumid="'+$(this).data('item')+'"]').length === 0){
			AddDescr=t('gallerydeluxe','Album')+' ';
		}
		var itemSource = $(this).data('title');
			  itemSource = imgShow+'<div>'+AddDescr+itemSource+'</div><div id="dropClose"><i class="ioc ioc-close" style="font-size:22px;"></i></div>';
			  
		if (!$(this).hasClass('shareIsOpen') && $('a.share.shareIsOpen').length === 0) {
			$('#infoShare').remove();
			$( '<div id="infoShare">'+itemSource+'</div>').prependTo('#dropdown');
				
		}else{
			$('a.share').removeClass('shareIsOpen');
			$(this).addClass('shareIsOpen');
			//OC.Share.hideDropDown();
		}
		//if (!OC.Share.droppedDown) {
			$('#dropdown').css('opacity',0);
			$('#dropdown').animate({
				'opacity': 1,
			},500);
		//}
    
		(function() {
			
			var targetShow = OC.Share.showDropDown;
			
			OC.Share.showDropDown = function() {
				var r = targetShow.apply(this, arguments);
				$('#infoShare').remove();
				$( '<div id="infoShare">'+itemSource+'</div>').prependTo('#dropdown');
				
				return r;
			};
			var target = OC.Share.showLink;
			OC.Share.showLink = function() {
				
				var r = target.apply(this, arguments);
				$('#linkText').val($('#linkText').val().replace('index.php/s/', 'index.php/apps/gallerydeluxe/s/'));
				//$('#linkText').val($('#linkText').val().replace('index.php/s/', 'public.php?service=gallery&t='));
				return r;
			};
		})();
		if (!$('#linkCheckbox').is(':checked')) {
				$('#linkText').hide();
		}
		return false;
		//}
	});

	Gallery.showLoading();

	Gallery.view.element = $('#gallery');
	var mypath = decodeURI(location.hash).substr(1);
	//path=OC.dirname(mypath);
	
	isImage=(mypath.lastIndexOf('.')+1);

	myImgPath='';
	if(isImage>0){
		myImgPath=mypath;
		last = mypath.substr(mypath.lastIndexOf('/') + 1);
		iLength=mypath.length-last.length;
		mypath=mypath.substr(0,iLength-1);
	}
	
	
	var token = ($('#gallery').data('token') !== undefined) ? $('#gallery').data('token') : '';
	
	Gallery.fillAlbums(mypath).then(function() {
		
		Gallery.init=false;
		Gallery.currentAlbum=mypath;
		if (Gallery.images.length === 0 ) {
			Gallery.showEmpty();
			
		}
		
		
		OC.Breadcrumb.container = $('#breadcrumbs');
		
			if(Gallery.imageMap[myImgPath]){
				
				
				var album = Gallery.albumMap[mypath];
				var images = album.images;
				
				var startImage = Gallery.imageMap[myImgPath];
				
				Gallery.slideShow(images, startImage);
			}
		if (Gallery.images.length > 0 ) {
			Gallery.view.viewAlbum(mypath);
		}
		
		//$('button.share').click(Gallery.share);
		
		
		$('button.sort').click(Gallery.sortImagesByName);
		$('button.sortdate').click(Gallery.sortImagesByDate);
		$('button.settings').click(Gallery.openSettingsDialog);
		
		$('#content-wrapper').scroll(function() {
			Gallery.view.loadVisibleRows(Gallery.albumMap[Gallery.currentAlbum], Gallery.currentAlbum);
		});
		
	});
   
	$('#openAsFileListButton').click(function(event) {
		window.location.href = window.location.href.replace('index.php/apps/gallerydeluxe/s/','index.php/s/');
	});
	
	
	
    /*
	$(window).scroll(function() {
		Gallery.view.loadVisibleRows(Gallery.albumMap[Gallery.currentAlbum], Gallery.currentAlbum);
	});*/
	

	

	if ($('#gallery').data('requesttoken')) {
		oc_requesttoken = $('#gallery').data('requesttoken');
	}
});

$(window).resize(_.throttle(function() {
		Gallery.view.viewAlbum(Gallery.currentAlbum);
	}, 500));
	
window.onhashchange = function() {
	var path = decodeURI(location.hash).substr(1);

	if (Gallery.albumMap[path]) {
		
		
		if (Gallery.activeSlideShow) {
			Gallery.activeSlideShow.stop();
		}
		
		path = decodeURIComponent(path);
		
		if (Gallery.currentAlbum !== path) {
  		
  			$('#controls button').attr('disabled','disabled').removeClass('isActive');
  			$('#controls button.keepActive').removeAttr('disabled','').addClass('isActive');
  			
  				var bLoad=false;
				
				if(Gallery.albumMap[path].fullLoad === true){
					bLoad=true;
					
				}
					
  				if(!bLoad){
	  					Gallery.showLoading();
	  		
	  				Gallery.fillAlbums(path).done(function () {
						Gallery.view.viewAlbum(path);
					});
				}else{
					Gallery.view.viewAlbum(path);
				}

		}
        
 

	} else if (!Gallery.activeSlideShow) {
		
		var albumPath = OC.dirname(path);
		if (albumPath === path) {
			albumPath = '';
		}
   
		if (Gallery.currentAlbum !== albumPath) {
			
			//Gallery.view.viewAlbum(albumPath);
			
		}
		var album = Gallery.albumMap[albumPath];
		var images = album.images;
		
		var startImage = Gallery.imageMap[path];
		Gallery.slideShow(images, startImage);
	}

};
