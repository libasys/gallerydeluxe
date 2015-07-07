<?php
namespace OCA\GalleryDeluxe\AppInfo;

use \OCP\AppFramework\App;
use OCP\IContainer;
use OCP\AppFramework\IAppContainer;

use \OCA\GalleryDeluxe\Controller\PageController;
use \OCA\GalleryDeluxe\Controller\PublicController;
use \OCA\GalleryDeluxe\Controller\ImageController;
use \OCA\GalleryDeluxe\Controller\SettingsController;
use \OCA\GalleryDeluxe\Controller\HelperController;

class Application extends App {
	
	public function __construct (array $urlParams=array()) {
		
		parent::__construct('gallerydeluxe', $urlParams);
        $container = $this->getContainer();
	
	
		$container->registerService('PageController', function($c) {
			return new PageController(
			$c->query('AppName'),
			$c->query('Request'),
			$c->query('UserId'),
			$c->query('L10N'),
			$c->query('HelperController')
			);
		});
		$container->registerService('PublicController', function($c) {
			return new PublicController(
			$c->query('AppName'),
			$c->query('Request'),
			$c->query('L10N'),
			$c->query('Session'),
			$c->query('OCP\AppFramework\Utility\IControllerMethodReflector'),
			$c->query('ServerContainer')->getURLGenerator()
			);
		});
		
		$container->registerService('ImageController', function($c) {
			return new ImageController(
			$c->query('AppName'),
			$c->query('Request'),
			$c->query('UserId'),
			$c->query('L10N'),
			$c->query('HelperController')
			);
		});
		
		
		$container->registerService('HelperController', function(IContainer $c) {
			$server = $c->query('ServerContainer');	
			return new HelperController(
			$c->query('AppName'),
			$c->query('Request'),
			$c->query('UserId'),
			$c->query('L10N'),
			$server->getConfig()
			);
		});
		
		   /**
		 * Core
		 */
		 
		  $container->registerService('URLGenerator', function(IContainer $c) {
			/** @var \OC\Server $server */
			$server = $c->query('ServerContainer');
			return $server->getURLGenerator();
		});
		
		 $container->registerService('Session', function (IAppContainer $c) {
			return $c->getServer()
					 ->getSession();
			}
		);
		 $container->registerService('Token', function (IContainer $c) {
			return $c->query('Request') ->getParam('token');
			}
		);
		 
		$container -> registerService('UserId', function($c) {
			return \OCP\User::getUser();
		});
		
		$container -> registerService('L10N', function($c) {
			return $c -> query('ServerContainer') -> getL10N($c -> query('AppName'));
		});
		
		
	}
	
	
}