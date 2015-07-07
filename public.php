<?php

use OCA\GalleryDeluxe\AppInfo\Application;

//\OC_App::loadApps();

 if (\OC::$server->getAppConfig()->getValue('core', 'shareapi_allow_links', 'yes') !== 'yes') {
	header('HTTP/1.0 404 Not Found');
	$tmpl = new \OCP\Template('', '404', 'guest');
	$tmpl->printPage();
	exit();
}
 
\OCP\JSON::checkAppEnabled('gallerydeluxe');

$app = new Application();
$container = $app->getContainer();
$publicController = $container->query('PublicController');

$publicController->index();