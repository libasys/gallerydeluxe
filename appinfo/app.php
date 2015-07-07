<?php

/**
 * ownCloud - gallery application
 *
 * @author Bartek Przybylski
 * @copyright 2012 Bartek Przybylski bart.p.pl@gmail.com
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


namespace OCA\GalleryDeluxe\AppInfo;

$app = new Application();
$c = $app->getContainer();
// add an navigation entry
$galleryAppname = $c->getAppName();
$navigationEntry = function () use ($c) {
	return [
		'id' => $c->getAppName(),
		'order' => 3,
		'name' => $c->query('L10N')->t('Gallery Dl'),
		'href' => $c->query('URLGenerator')->linkToRoute($c->getAppName().'.page.index'),
		'icon' => $c->query('URLGenerator')->imagePath($c->getAppName(), 'app.svg'),
	];
};
$c->getServer()->getNavigationManager()->add($navigationEntry);



$request = $c->query('Request');
if (!\OCP\App::isEnabled('galleryplus')) {
	if (isset($request->server['REQUEST_URI'])) {
			
		$url = $request->server['REQUEST_URI'];
		if (preg_match('%index.php/apps/files(/.*)?%', $url)	|| preg_match('%index.php/s/(/.*)?%', $url)) {
			// make slideshow available in files and public shares
			\OCP\Util::addStyle($galleryAppname, '3rdparty/fontello/css/fontello');	
			\OCP\Util::addStyle($galleryAppname, 'slideshow');
			\OCP\Util::addScript($galleryAppname, 'jquery.scrollTo');
			\OCP\Util::addScript($galleryAppname, 'public');
			\OCP\Util::addScript($galleryAppname, 'jquery.mousewheel-3.1.1');
			\OCP\Util::addScript($galleryAppname, 'jquery.touchwipe.1.1.1');
			\OCP\Util::addScript($galleryAppname, 'bigshot');
			\OCP\Util::addScript($galleryAppname, 'slideshow');
			
		}
	}
}
