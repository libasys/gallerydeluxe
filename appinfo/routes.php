<?php
/**
 * Copyright (c) 2014 Robin Appelman <icewind@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OCA\GalleryDeluxe;


use \OCA\GalleryDeluxe\AppInfo\Application;

$application = new Application();

$application->registerRoutes($this, ['routes' => [
	['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
	['name' => 'public#index','url'  => '/s/{token}', 'verb' => 'GET'],
	['name' => 'page#settingsIndex', 'url' => '/settingsindex', 'verb' => 'GET'],
	['name' => 'page#saveUserSettings', 'url' => '/saveusersettings', 'verb' => 'POST'],
	['name' => 'page#getUserSettings', 'url' => '/getusersettings', 'verb' => 'GET'],
	['name' => 'public#index','url'  => '/s/{token}', 'verb' => 'POST', 'postfix' => 'auth'],
	['name' => 'page#loadGallery', 'url' => '/loadgallery', 'verb' => 'GET'],
	['name' => 'image#getMetadataImage', 'url' => '/getmetadataimage', 'verb' => 'GET'],
	['name' => 'image#saveMetadataImage', 'url' => '/savemetadataimage', 'verb' => 'GET'],
	['name' => 'image#getBatchImages', 'url' => '/getbatchimages', 'verb' => 'GET'],
	['name' => 'image#getBatchImagesAll', 'url' => '/getbatchimagesall', 'verb' => 'GET'],
	['name' => 'image#getSmallPreviewImage', 'url' => '/getsmallpreviewimage', 'verb' => 'GET'],
	['name' => 'image#getBigPreviewImage', 'url' => '/getbigpreviewimage', 'verb' => 'GET'],
	['name' => 'image#getThumbnail', 'url' => '/getthumbnail', 'verb' => 'GET'],
	['name' => 'image#downloadImage', 'url' => '/downloadimage', 'verb' => 'GET'],
	['name' => 'page#getImageData', 'url' => '/getimages', 'verb' => 'GET'],
	['name' => 'page#getImagesCaching', 'url' => '/getimagescaching', 'verb' => 'GET'],
	['name' => 'settings#personal', 'url' => '/settings', 'verb' => 'POST'],
	]]);
	
	