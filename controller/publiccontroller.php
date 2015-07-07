<?php

namespace OCA\GalleryDeluxe\Controller;
use \OCP\AppFramework\Controller;
use \OCP\IRequest;
use OCP\IURLGenerator;
use OCP\ISession;
use OCP\Share;
use OCP\Security\IHasher;

use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Utility\IControllerMethodReflector;
use OCP\AppFramework\Http\TemplateResponse;
/**
 * Controller class for main page.
 */
class PublicController extends Controller {
	
	
	private $l10n;
	
	/** @var \OC\URLGenerator */
	protected $urlGenerator;
	
	/**
	 * @type ISession
	 * */
	private $session;
	
	/**
	 * @type IControllerMethodReflector
	 */
	protected $reflector;

	private $token;

	public function __construct($appName, IRequest $request, $l10n, ISession $session, IControllerMethodReflector $reflector, IURLGenerator $urlGenerator) {
		parent::__construct($appName, $request);
		
		$this->l10n = $l10n;
		$this->urlGenerator = $urlGenerator;
		$this->session = $session;
		$this->reflector=$reflector;
		
	}

	public function beforeController($controller, $methodName) {
		if ($this->reflector->hasAnnotation('Guest')) {
			return;
		}
		$isPublicPage = $this->reflector->hasAnnotation('PublicPage');
		if ($isPublicPage) {
			$this->validateAndSetTokenBasedEnv();
		} else {
			//$this->environment->setStandardEnv();
		}
	}
	
	private function validateAndSetTokenBasedEnv() {
			$this->token = $this->request->getParam('t');
	}
	/**
	*@PublicPage
	 * @NoCSRFRequired
	 * @UseSession
	 */
	public function index($token) {
			
		\OCP\Util::addStyle($this->appName, 'styles');
		\OCP\Util::addStyle($this->appName, 'mobile');
		
		
		if ($token) {
		
				$linkItem = \OCP\Share::getShareByToken($token, false);
				if (is_array($linkItem) && isset($linkItem['uid_owner'])) {
					$type = $linkItem['item_type'];
					$fileSource = $linkItem['file_source'];
					$shareOwner = $linkItem['uid_owner'];
					$path = null;
					$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
					$fileOwner = $rootLinkItem['uid_owner'];
					$albumName = trim($linkItem['file_target'], '//');
					
					$ownerDisplayName = \OCP\User::getDisplayName($fileOwner);
					
					// stupid copy and paste job
					if (isset($linkItem['share_with'])) {
						// Authenticate share_with
						
						$password=$this->params('password');
						
						if (isset($password)) {
							
							if ($linkItem['share_type'] === \OCP\Share::SHARE_TYPE_LINK) {
								// Check Password
								$newHash = '';
								if(\OC::$server->getHasher()->verify($password, $linkItem['share_with'], $newHash)) {
									
									\OCP\Util::writeLog('share', 'Token  Pass Controller '.$token.$linkItem['id'], \OCP\Util::DEBUG);
									$this->session->set('public_link_authenticated', $linkItem['id']);
									///s/{token}
									//return new RedirectResponse($this->urlGenerator->linkToRoute('gallerydeluxe/s/{token}', array('token' => $token)));
									if(!empty($newHash)) {

									}
								} else {
									\OCP\Util::addStyle('files_sharing', 'authenticate');
									$params=array(
									'wrongpw'=>true
									);
									return new TemplateResponse('files_sharing', 'authenticate', $params, 'guest');
									
								}
							} else {
								\OCP\Util::writeLog('share', 'Unknown share type '.$linkItem['share_type']
										.' for share id '.$linkItem['id'], \OCP\Util::ERROR);
									return false;
							}
			
						} else {
							// Check if item id is set in session
							if ( ! $this->session->exists('public_link_authenticated') || $this->session->get('public_link_authenticated') !== $linkItem['id']) {
								// Prompt for password
								\OCP\Util::addStyle('files_sharing', 'authenticate');
								
									$params=array();
									return new TemplateResponse('files_sharing', 'authenticate', $params, 'guest');
								
							}
						}
					}
					\OCP\Util::addStyle($this->appName, '3rdparty/fontello/css/animation');
					\OCP\Util::addStyle($this->appName, '3rdparty/fontello/css/fontello');	
					\OCP\Util::addScript($this->appName, 'jquery.scrollTo');
					\OCP\Util::addScript($this->appName, 'jquery.mousewheel-3.1.1');
					\OCP\Util::addScript($this->appName, 'bigshot');
					\OCP\Util::addScript($this->appName, 'slideshow');
					\OCP\Util::addScript($this->appName, 'jquery.touchwipe.1.1.1');	
					\OCP\Util::addStyle($this->appName, 'slideshow');
					\OCP\Util::addScript($this->appName, 'album');
					\OCP\Util::addScript($this->appName, 'gallery');
					\OCP\Util::addScript($this->appName, 'thumbnail');
					\OCP\Util::addStyle($this->appName, 'public');
					
								$params=array(
									'token'=>$token,
									'requesttoken'=> \OCP\Util::callRegister(),
									'displayName'=>$ownerDisplayName,
									'albumName'=>$albumName,
									);
							$csp = new \OCP\AppFramework\Http\ContentSecurityPolicy();
							$csp->addAllowedImageDomain('data:');		
							
							$response = new TemplateResponse($this->appName, 'public', $params, 'base');
							$response->setContentSecurityPolicy($csp);		
									
							return $response;
					
				}
			}
			
			$tmpl = new \OCP\Template('', '404', 'guest');
			$tmpl->printPage();
		
	}
	
}