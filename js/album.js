function Album(path, subAlbums, images, name, id, permissions, owner, token) {
	this.token = token;
	this.path = path;
	this.albumid = id;
	this.subAlbums = subAlbums;
	this.images = images;
	this.imageCoverThumb=null;
	this.viewedItems = 0;
	this.name = name;
	this.title = name;
	this.domDef = null;
	this.preloadOffset = 0;
	this.firstInit = true;
	this.owner= owner;
	this.iPause = 0;
	
	this.permissions = permissions;
	

}

Album.prototype.getThumbnail = function() {
	
	if(this.imageCoverThumb === null){
		this.imageCoverThumb = this.images[0];
	}
	return this.imageCoverThumb.getThumbnail(true);
	
};

Album.prototype.getThumbnailWidth = function() {
	return this.getThumbnail().then(function(img) {

		return img.originalWidth;
	});
};

/**
 *@param {GalleryImage} image
 * @param {number} targetHeight
 * @param {number} calcWidth
 * @param {object} a
 * @returns {a}
 */
Album.prototype.getOneImage = function(image, targetHeight, calcWidth, a, square) {

	var parts = image.src.split('/');
	parts.shift();
	var path = parts.join('/');
	var albumpath = this.path;
	//var gm = new GalleryImage(image.src, path, image.title ,image.mtime,image.fileid);
	Gallery.imageMap[image.src].getThumbnail(square).then(function(img) {
			a.append(img);
			img.height = (targetHeight / 2);
			img.width = calcWidth;

			$(img).attr({
				'width' : calcWidth,
				'height' : (targetHeight / 2)
			});
		

	});

};


Album.prototype.getDom = function(targetHeight) {
	var album = this;

	return this.getThumbnail().then(function(img) {
		
		
		var a = $('<a/>').addClass('album').attr({'href': '#' + album.path,'data-albumid':album.albumid});
		var addShareInfo='';
		if( OC.currentUser != album.owner){
			addShareInfo=$('<i/>').attr({'class':'ioc ioc-shared','title':t('gallerydeluxe','Owner')+' '+album.owner});
		}
		
		var	addShareLink=$('<a/>')
		.attr({
			'class':'ioc ioc-share share',
			'data-item-type':'folder',
			'data-item':album.albumid,
			'data-link' : 'true',
			'data-title' : album.name,
			'data-possible-permissions' : album.permissions,
			'title' : t('core','Share')
			}
		);
		a.append(addShareLink);
		
		var aFolder = $('<a/>').addClass('album-name album-id-'+album.albumid).attr({
			'title' : album.name,
		}).text(album.name);
		var label = $('<label/>').addClass('descr');
		
		if(addShareInfo !== ''){
			label.append(addShareInfo);
		}
		label.append(aFolder);
		a.append(label);

		var ratio = Math.round(img.ratio * 100) / 100;

		//var ratio = 1;
		var calcWidth = (targetHeight * ratio) / 2;

		a.width(calcWidth * 2);
		a.height(targetHeight);

			a.append(img);
			img.height = targetHeight;
			img.width = (targetHeight * ratio);
			$(img).click(function() {
				window.location = '#' + album.path;
			});
		

		

		return a;
	});
};

/**
 *
 * @param {number} width
 * @returns {$.Deferred<Row>}
 */
Album.prototype.getNextRow = function(width) {
	/**
	 * Add images to the row until it's full
	 *
	 * @param {Album} album
	 * @param {Row} row
	 * @param {GalleryImage[]} images
	 * @returns {$.Deferred<Row>}
	 */

	var addImages = function(album, row, images) {

		if ((album.viewedItems + 5) > album.preloadOffset) {
			album.preload(20);
			
		}

		var image = images[album.viewedItems];

		return row.addImage(image).then(function(more) {
			album.viewedItems++;

			if (more && album.viewedItems < images.length) {
				return addImages(album, row, images);
			} else {
				return row;
			}
		});
	};
	var items = this.subAlbums.concat(this.images);
	var row = new Row(width);

	return addImages(this, row, items);
};

Album.prototype.getThumbnailPaths = function(count) {
	var paths = [];
	var items = this.images.concat(this.subAlbums);

	for (var i = 0; i < items.length && i < count; i++) {
		paths = paths.concat(items[i].getThumbnailPaths(count));
	}

	return paths;
};

Album.prototype.getThumbnailIds = function(count) {
	var ids = [];
	var items = this.images.concat(this.subAlbums);

	for (var i = 0; i < items.length && i < count; i++) {
		ids = ids.concat(items[i].getThumbnailIds(count));
	}

	return ids;
};

/**
 * preload the first $count thumbnails
 * @param count
 */
Album.prototype.preload = function(count) {

	var items = this.subAlbums.concat(this.images);
	var paths = [];
	var squarePaths = [];
	var fileIds = [];
	var squareFileIds = [];
	
	for (var i = this.preloadOffset; i < this.preloadOffset + count && i < items.length; i++) {
		if (items[i].subAlbums) {
			squarePaths = squarePaths.concat(items[i].getThumbnailPaths(1));
			squareFileIds = squareFileIds.concat(items[i].getThumbnailIds(1));
		} else {
			fileIds = fileIds.concat(items[i].getThumbnailIds());
			paths = paths.concat(items[i].getThumbnailPaths());
		}
	}
	this.preloadOffset = i;
	Thumbnail.loadBatch(paths, fileIds, false, this.token);
	Thumbnail.loadBatch(squarePaths, squareFileIds, true, this.token);
	
};

function Row(targetWidth) {
	this.targetWidth = targetWidth;
	this.items = [];
	this.width = 8;
	// 4px margin to start with

}

/**
 * @param {GalleryImage} image
 * @return {$.Deferred<bool>} true if more images can be added to the row
 */
Row.prototype.addImage = function(image) {
	var row = this;
	var def = new $.Deferred();

	image.getThumbnailWidth().then(function(width) {
		//.click(function(){window.location='#'+encodeURI(image.path);})

		row.items.push(image);

		row.width += width + 4;
		// add 4px for the margin
		def.resolve(!row.isFull());
		//def.resolve(false);
	}, function() {
		console.log('Error getting thumbnail for ' + image);
		def.resolve(true);
	});
	return def;
};

Row.prototype.getDom = function() {
	var scaleRation = (this.width > this.targetWidth) ? this.targetWidth / this.width : 1;

	var targetHeight = 200 * scaleRation;
	var row = $('<div/>').addClass('row loading');
	/**
	 * @param row
	 * @param {GalleryImage[]} items
	 * @param i
	 * @returns {*}
	 */
	var addImageToDom = function(row, items, i) {
		return items[i].getDom(targetHeight).then(function(itemDom) {
			i++;
			row.append(itemDom);

			if (i < items.length) {

				return addImageToDom(row, items, i);
			} else {
				return row;
			}
		});
	};

	return addImageToDom(row, this.items, 0);
};

/**
 * @returns {boolean}
 */
Row.prototype.isFull = function() {
	return this.width > this.targetWidth;
};

function GalleryImage(src, path, title, name, mtime, fileid, permissions, token) {
	this.token = token;
	this.src = src;
	this.path = path;
	this.title = title;
	this.name = name;
	this.mtime = mtime;
	this.fileid = fileid;
	this.permissions = permissions;
	this.thumbnail = null;
	this.domDef = null;
	this.domHeigth = null;
	this.status = 'ok';
}

GalleryImage.prototype.getThumbnailPaths = function() {

	return [this.path];

};
GalleryImage.prototype.getThumbnailIds = function() {

	return [this.fileid];
};
GalleryImage.prototype.getThumbnail = function(square) {

	return Thumbnail.get(this.src, square, this.token).queue();
};

GalleryImage.prototype.getThumbnailWidth = function() {
	return this.getThumbnail().then(function(img) {

		return img.originalWidth;
	});
};

GalleryImage.prototype.getDom = function(targetHeight) {
	var image = this;
	if (this.domDef === null || this.domHeigth !== targetHeight) {
		this.domHeigth = targetHeight;
		this.domDef = this.getThumbnail(false).then(function(img) {
			
			var a = $('<a/>').addClass('image').attr('data-path', image.path).attr('href', '#' + encodeURI(image.path)).attr('data-path', image.path);
			img.height = targetHeight;
			img.width = targetHeight * img.ratio;
			$(img).attr('width', 'auto');
			imgName = image.title;

			var externLink = '';
			var DownloadLinkSrc = '';
			if (image.token !== '' && image.token !== undefined) {
				 DownloadLinkSrc = OC.generateUrl('apps/gallerydeluxe/downloadimage?file={file}&token={token}', {
					file : encodeURIComponent(image.path),
					token : image.token
				});
			} else {
				 DownloadLinkSrc = OC.generateUrl('apps/gallerydeluxe/downloadimage?file={file}', {
					file : encodeURIComponent(image.path)
				});
			}
			externLink = ' <a href="' + DownloadLinkSrc + '" class="ioc ioc-download" title="'+t('gallerydeluxe','Download Original Image')+'"></a>';
			
		
			if(image.name.toLowerCase() == 'cover.jpg'){
				a.append($('<div/>').attr({'class':'cover','title':t('gallerydeluxe','Cover File contains information about current Album'),'data-name':imgName}).text('c'));
			}
			
			a.append($('<label/>').attr('class', 'descr').html('<span class="title-img-'+image.fileid+'">'+imgName+'</span>' + externLink));
			a.append(img);
			return a;
		});
	}
	return this.domDef;
};
