<?php

namespace OCA\GalleryDeluxe\Controller;

use \OCP\AppFramework\Controller;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\IRequest;
use \OCP\AppFramework\Http\JSONResponse;
use \OCA\GalleryDeluxe\Http\ImageResponse;

/**
 * Controller class for main page.
 */
class PageController extends Controller {

	private $userId;
	private $l10n;
	private static $sortType = 'title';
	private $helperController;
	
	public function __construct($appName, IRequest $request, $userId, $l10n, $helperController) {
		parent::__construct($appName, $request);
		$this -> userId = $userId;
		$this -> l10n = $l10n;
		$this->helperController = $helperController;
	}

	/**
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 */
	public function index() {
			
		\OCP\Util::addScript($this->appName, 'jquery.scrollTo');
		\OCP\Util::addScript($this->appName, 'jquery.mousewheel-3.1.1');
		\OCP\Util::addScript($this->appName, 'bigshot');
		\OCP\Util::addScript($this->appName, 'slideshow');
		\OCP\Util::addScript($this->appName, 'jquery.touchwipe.1.1.1');	
		\OCP\Util::addStyle($this->appName, 'slideshow');
	
		\OCP\Util::addStyle($this->appName, '3rdparty/fontello/css/animation');
		\OCP\Util::addStyle($this->appName, '3rdparty/fontello/css/fontello');	
		\OCP\Util::addStyle($this->appName, 'styles');
		\OCP\Util::addStyle($this->appName, 'mobile');
		\OCP\Util::addScript($this->appName, 'album');
		\OCP\Util::addScript($this->appName, 'gallery');
		\OCP\Util::addScript($this->appName, 'thumbnail');

		$config = \OC::$server -> getConfig();
		$csp = new \OCP\AppFramework\Http\ContentSecurityPolicy();
		$csp->addAllowedImageDomain('*');
		
		$config = \OC::$server -> getConfig();
		$previewMaxX= $config -> getAppValue('core', 'preview_max_x', '2048');
		$previewMaxY= $config -> getAppValue('core', 'preview_max_y', '2048');
		
		$response = new TemplateResponse($this->appName, 'index');
		
		if(!$config -> getUserValue($this -> userId,$this->appName, 'userconfig')){
			$userConfig='{"download":"false","info":"false","thumbnailpreview":"false","zoom":"false","edit":"false","controlsalways":"false","share":"false","fullscreen":"true","darkdesign":"true","thumbdarkdesign":"false"}';
			$userConfig = json_decode($userConfig);
			$config -> setUserValue($this -> userId,$this->appName, 'userconfig', json_encode($userConfig));
		}else{
			//default init
			
		}
		$response -> setParams([
			'allowShareWithLink' => $config -> getAppValue('core', 'shareapi_allow_links', 'yes'), 
			'mailNotificationEnabled' => $config -> getAppValue('core', 'shareapi_allow_mail_notification', 'no'),
			'previewMax' =>  $previewMaxX.'x'.$previewMaxY,
		]);
		$response->setContentSecurityPolicy($csp);
		
		return $response;

	}

	/**
	 * @NoAdminRequired
	 * 
	 */
	public function settingsIndex() {
		$config = \OC::$server -> getConfig();	
		$previewMaxX= $config -> getAppValue('core', 'preview_max_x', '2048');
		$previewMaxY= $config -> getAppValue('core', 'preview_max_y', '2048');
		$userConfig = json_decode($config -> getUserValue($this -> userId, $this->appName, 'userconfig'));	
		$params=[
			'previewMax' =>  $previewMaxX.'x'.$previewMaxY,
			'userConfig' => $userConfig
		];	
		$response = new TemplateResponse($this->appName, 'settingsindex',$params,'');
		
		return $response;
	}
		
	/**
	 * @NoAdminRequired
	 * 
	 */
	public function saveUserSettings() {
		$checked = $this -> params('checked');
		$pName = $this -> params('name');	
	
		$config = \OC::$server -> getConfig();
		
		$userConfig = '';
		if(!$config -> getUserValue($this -> userId, $this->appName, 'userconfig')){
			$userConfig='{"download":"true","info":"true","thumbnailpreview":"true","zoom":"true","edit":"true","controlsalways":"true","share":"true","fullscreen":"true","darkdesign":"true","thumbdarkdesign":"true"}';
			$userConfig = json_decode($userConfig);
		}else{
			$userConfig = json_decode($config -> getUserValue($this -> userId, $this->appName, 'userconfig'));
		}

		$userConfig ->$pName = $checked;
		
		$config -> setUserValue($this -> userId, $this->appName, 'userconfig',json_encode($userConfig));
		$data = [
			'status' => 'success',
			'data' => ['name' => $pName,'checked' => $checked],
			'msg' => 'Saving success!'
		];	
		$response = new JSONResponse();
		$response -> setData($data);
		return $response;
	}
	
	/**
	*@PublicPage
	 * @NoCSRFRequired
	 * 
	 */
	public function getUserSettings() {
			
		$config = \OC::$server -> getConfig();		
		if ($config -> getUserValue($this -> userId, $this->appName, 'userconfig')) {	
			$userConfig = json_decode($config -> getUserValue($this -> userId, $this->appName, 'userconfig'));
		}else{
			//Guest Config Public Page	
			$userConfig='{"download":"true","info":"false","thumbnailpreview":"false","zoom":"false","edit":"false","controlsalways":"false","share":"false","fullscreen":"true","darkdesign":"true","thumbdarkdesign":"false"}';
			$userConfig = json_decode($userConfig);
		}
		
		$data = [
				'status' => 'success',
				'userConfig' => $userConfig
			];	
		$response = new JSONResponse();
		$response -> setData($data);
		return $response;
	}
	

	/**
	 * @NoAdminRequired
	 */
	public function loadGallery() {
		$gallery = $this -> params('gallery');
	
		
		\OC::$server->getSession()->close();
		$view = new \OC\Files\View('/' . $this -> userId . '/files/');
		
		$bShared = false;
		$meta = $view -> getFileInfo('/' . $gallery);
		$owner = (string)$view -> getOwner('/' . $gallery);

		if ($owner !== $this -> userId) {
			$bShared = true;
		}
	
		$data = array();
		$data['fileid'] = $meta['fileid'];
		$data['permissions'] = $meta['permissions'];
		$data['owner'] = $owner;
		$data['isshared'] = $bShared;
		$response = new JSONResponse();
		$response -> setData($data);
		return $response;
	}

	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */

	public function getImagesPublic($token) {

		$path = null;
		if (!empty($token)) {

			$linkItem = \OCP\Share::getShareByToken($token);
			if (is_array($linkItem) && isset($linkItem['uid_owner'])) {
				// seems to be a valid share
				$type = $linkItem['item_type'];
				$fileSource = $linkItem['file_source'];
				$shareOwner = $linkItem['uid_owner'];

				$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
				$fileOwner = $rootLinkItem['uid_owner'];
				
				$this->helperController->prepareSetupSharing($fileOwner);
			
				// The token defines the target directory (security reasons)
				$path = \OC\Files\Filesystem::getPath($linkItem['file_source']);
				$dir = \OC\Files\Filesystem::normalizePath($path);
				$images = \OC\Files\Filesystem::getDirectoryContent($dir);

				$result = array();
				\OC::$server->getSession()->close();
				$previewManager=\OC::$server ->getPreviewManager();
				foreach ($images as $image) {
				
					if ($previewManager->isMimeSupported($image['mimetype'])) {
							
						$title = $image['name'];
						$mtime = $image['mtime'];
						$id = $image['fileid'];
						$relPathImg = $image['path'];
						 
						if (stristr($image['path'], 'files/')) {
							$relPathImg = substr($image['path'], 6);
						}
						if(strtolower($image['name']) === 'cover.jpg'){
							
							$local = \OC\Files\Filesystem::getLocalFile($relPathImg);
		
							$size = getimagesize($local, $info);
		
							if (is_array($info) && array_key_exists('APP13', $info)) {
								$iptc = iptcparse($info["APP13"]);
								if (array_key_exists('2#105', $iptc)) {
									$title = $iptc['2#105'][0];
		
								}
							}
						}
						
	
						$imagePath = trim($relPathImg, '/');
	
						$result[] = array('path' => $image['name'], 'nameraw' => $image['name'], 'name' => $image['name'], 'title' => $title, 'mtime' => $mtime, 'fileid' => $id);
					}
				}

				$result = self::sortPictures($result, 'title');

				$response = new JSONResponse();
				$response -> setData($result);
				return $response;
			}
		}
	}

	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */

	public function getImageData() {
		$token = $this -> params('token');
		if (!empty($token)) {
			return $this -> getImagesPublic($token);
		} else {
			return $this -> getImages();
		}

	}

	/**
	 * @NoAdminRequired
	 */
	public function getImages() {

		$result = array();
		$path = '';
		$allowedMimeTypes = array('image/jpeg' => 1, 'image/jpg' => 1, 'image/png' => 1, 'image/gif' => 1);

		

		$view = new \OC\Files\View('/' . $this -> userId . '/files');
		\OC::$server->getSession()->close();
		
		$Subfolder = $this -> params('currentpath');
		$firstLoad = $this -> params('firstloading');
		$resultFolder='';
		if ($firstLoad === 'true') {
			
			$searchCoverFiles = $view -> searchRaw('cover.jpg');

			$FolderTempCover = array();

			if (is_array($searchCoverFiles)) {
				foreach ($searchCoverFiles as $files) {

					$pathCover = $view -> getPath($files['fileid']);

					$relPathCover = substr($pathCover, 0, strlen($pathCover) - strlen($files['name']));
					
					$local = $view -> getLocalFile($pathCover);

					$size = getimagesize($local, $info);
					$title = '';
					if (isset($info['APP13'])) {
						$iptc = iptcparse($info["APP13"]);
						if (is_array($iptc)) {
							if (array_key_exists('2#105', $iptc)) {
								$title = $iptc['2#105'][0];
							}
						}
					}
					$row = $view -> getFileInfo($relPathCover);
					$owner = $view -> getOwner($relPathCover);
					$row['owner'] = $owner;
					if ($title !== '') {
						$row['name'] = $title;
					}
					$relPath = substr($relPathCover, 1);
					$row['path'] = $relPath;

					$row['nameraw'] = $files['name'];

					$row['isshared'] = $row -> isShared();

					$FolderTempCover[$row['fileid']] = $row;
				}
			}

			if (is_array($FolderTempCover)) {
				foreach ($FolderTempCover as $folder) {
					$relPath = $folder['path'];
					if (stristr($folder['path'], 'files/')) {
						$relPath = substr($folder['path'], 6);
					}
					$rowInfo = $view -> getFileInfo($relPath . $folder['nameraw']);
					$resultFolder[] = array('path' => $relPath . $folder['nameraw'], 'nameraw' => $folder['nameraw'], 'name' => $folder['name'], 'title' => $folder['name'], 'mtime' => $rowInfo['mtime'], 'fileid' => $rowInfo['fileid'], 'folderid' => $folder['fileid'], 'permissions' => $folder['permissions'], 'owner' => $folder['owner'], 'isshared' => $folder['isshared']);
				}
				if($resultFolder !== ''){
					$resultFolder = self::sortPictures($resultFolder, 'name');
				}
			}
		}
		$sizeMax = 1024;
		$resultImages='';
		if ($firstLoad === 'false' || ($firstLoad === 'true' && $Subfolder !== '/')) {
			
			$imagesTmp = \OC\Files\Filesystem::getDirectoryContent($path . $Subfolder);

			
			if (is_array($imagesTmp)) {

				$bCoverFound = false;
				$previewManager=\OC::$server ->getPreviewManager();
				foreach ($imagesTmp as $image) {
				
					//if (array_key_exists(strtolower($image['mimetype']), $allowedMimeTypes)) {
					if ($previewManager->isMimeSupported($image['mimetype'])) {
		
						if (strtolower($image['name']) === 'cover.jpg') {
							$bCoverFound = true;
						}
						$title = $image['name'];
						$mtime = $image['mtime'];
						$id = $image['fileid'];
						$permissions = $image['permissions'];
						$rawName = $title;
						
						$relPath = \OC\Files\Filesystem::getPath($id);

						$imagePath = trim($relPath, '/');
						$showPath = substr($imagePath, strlen($path));

						if (strtolower($image['name']) !== 'cover.jpg') {
							$resultImages[] = array('path' => $showPath, 'nameraw' => $image['name'], 'name' => $image['name'], 'title' => $title, 'mtime' => $mtime, 'fileid' => $id, 'permissions' => $permissions);
						}
					}

				}
				if($resultImages !== ''){
					$resultImages = self::sortPictures($resultImages, 'title');
				}

				if ($bCoverFound === false) {
					unset($resultImages);
					$resultImages = array();
				}
			}
		}
		if (is_array($resultImages)) {
			if (is_array($resultFolder)) {
				$result = array_merge($resultFolder, $resultImages);
			} else {
				$result = $resultImages;
			}
		} else {
			$result = $resultFolder;
		}

		$response = new JSONResponse();
		$response -> setData($result);
		return $response;
	}

	public static function sortPictures($files, $sortAttribute = 'title', $sortDescending = false) {
		$sortFunc = 'comparePictureNames';
		self::$sortType = $sortAttribute;
		usort($files, array('\OCA\GalleryDeluxe\Controller\PageController', $sortFunc));
		if ($sortDescending) {
			$files = array_reverse($files);
		}
		return $files;
	}

	public static function comparePictureNames($a, $b) {
		return \OCP\Util::naturalSortCompare($a[self::$sortType], $b[self::$sortType]);
	}

	/**
	 * @NoAdminRequired
	 */
	public function getImagesCaching() {

		$toCacheImage = $this -> params('imagePath');
		
		\OC::$server->getSession()->close();
		$userView = new \OC\Files\View('/' . $this -> userId);
		$fileInfo = $userView -> getFileInfo('files/'. $toCacheImage);

		$sizeMax = 1024;
		$sizeMaxSmall = 400;
		$message = '';

		$previewBigImage = new \OC\Preview($this -> userId, 'files', $path . $toCacheImage, $sizeMax, $sizeMax);
		$previewBigImage -> setKeepAspect(true);
		$preview = new \OC\Preview($this -> userId, 'files', $path . $toCacheImage, $sizeMaxSmall, 200);
		$preview -> setKeepAspect(true);

		if ($previewBigImage -> isCached($fileInfo -> getId())) {
			$message .= 'Preview 1024 exist for ' . $toCacheImage . '<br />';

		} else {
			$previewBigImage -> getPreview();
			$message .= 'Indexing 1024 ... ' . $toCacheImage . '<br />';
		}

		if ($preview -> isCached($fileInfo -> getId())) {
			$message .= 'Preview 400 exist for ' . $toCacheImage . '<br />';
		} else {
			$preview -> getPreview();
			$message .= 'Indexing 400 ... ' . $toCacheImage;
		}

		return $message;
	}

}
