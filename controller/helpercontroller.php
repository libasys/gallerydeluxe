<?php
namespace OCA\GalleryDeluxe\Controller;
use \OCP\AppFramework\Controller;
use \OCP\IRequest;
use \OCP\AppFramework\Http\JSONResponse;
use OCP\IConfig;



class HelperController extends Controller {
	
	private $userId;
	private $l10n;
	private $config;

	public function __construct($appName, IRequest $request, $userId, $l10n, IConfig $config) {
		parent::__construct($appName, $request);
		$this -> userId = $userId;
		$this->l10n = $l10n;
		$this->config = $config;
	}
	
	public function prepareSetupSharing($fileOwner){
			
		\OCP\JSON::checkUserExists($fileOwner);
		\OC_Util::tearDownFS();
		\OC_Util::setupFS($fileOwner);
		
	}
	
}
