<?php
namespace OCA\GalleryDeluxe\Controller;
use \OCP\AppFramework\Controller;
use \OCP\IRequest;
use \OCP\AppFramework\Http\JSONResponse;
use \OCP\AppFramework\Http\DataDownloadResponse;

class ImageController extends Controller {
	
	private $userId;
	private $l10n;
	private $helperController;

	public function __construct($appName, IRequest $request, $userId, $l10n, $helperController) {
		parent::__construct($appName, $request);
		$this -> userId = $userId;
		$this->l10n = $l10n;
		$this->helperController = $helperController;
	}
	
	
	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function getBigPreviewImage(){
		
		
		
		$img = $this->params('file');
		$imgId	= $this->params('fileId');
		$ptoken = $this->params('token');		
		
		
		if (!empty($ptoken)) {
			$linkItem = \OCP\Share::getShareByToken($ptoken);
			if (!(is_array($linkItem) && isset($linkItem['uid_owner']))) {
				exit ;
			}
			// seems to be a valid share
			$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
			$user = $rootLinkItem['uid_owner'];
			
			$this->helperController->prepareSetupSharing($user);
		
			$fullPath = \OC\Files\Filesystem::getPath($linkItem['file_source']);
			$img = trim($fullPath . '/' . $img);
		} else {
			\OCP\JSON::checkLoggedIn();
			$user = $this->userId;
			
		}
			
		\OC::$server->getSession()->close();
		
		$config = \OC::$server -> getConfig();
		$previewMaxX= $config -> getAppValue('core', 'preview_max_x', '2048');
		$previewMaxY= $config -> getAppValue('core', 'preview_max_y', '2048');
		
		$ownerView = new \OC\Files\View('/' . $user . '/files');
		$fileInfo = $ownerView -> getFileInfo($img);
		$mimeType = $fileInfo->getMimetype();
				
		$preview = new \OC\Preview($user, 'files','/'.$img, $previewMaxX , $previewMaxY);
		$preview->setKeepAspect(true);
		
		
		if ($path = $preview->isCached($fileInfo->getId())) {
			
			\OCP\Response::setContentDispositionHeader(basename($img), 'inline');
			header('Content-Type:image/jpeg');
			$userView = new \OC\Files\View('/' . $user);
			$userView -> readfile('/' . $path);
			
		}else{
			    $local = $ownerView -> getLocalFile($img);	
				if(stristr($mimeType,'image') && $mimeType !== 'image/svg+xml' && exif_imagetype($local) === false){
					$image = new \OCP\Image();
					$brokenImage=  'apps/gallerydeluxe/img/broken-big.jpg';
					if($image->load($brokenImage)) {
						$image -> fixOrientation();
					    $image -> show();
					}
				}else{
					
					$preview->showPreview();
				}
		}
		
		exit();
		
	}
	
	
	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function getSmallPreviewImage(){
		
		
		$pScale = $this->params('scale');	
		$img = $this->params('file');
		$imgId	= $this->params('fileId');
		$ptoken = $this->params('token');		
		
		$scale = isset($pScale) ?$pScale : 1;
		
		
		if (!empty($ptoken)) {
			$linkItem = \OCP\Share::getShareByToken($ptoken);
			if (!(is_array($linkItem) && isset($linkItem['uid_owner']))) {
				exit();
			}
			// seems to be a valid share
			$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
			$user = $rootLinkItem['uid_owner'];
		
			$this->helperController->prepareSetupSharing($user);
		
		} else {
			\OCP\JSON::checkLoggedIn();
			$user = $this->userId;
		}
		
		\OC::$server->getSession()->close();
		
		$ownerView = new \OC\Files\View('/' . $user . '/files');
		$view = new \OC\Files\View('/' . $user . '/files');
		$mime = $ownerView -> getMimeType($img);
			
		$userView = new \OC\Files\View('/' . $user);
		$path= $userView->getPath($imgId);
		$relPath= substr($path,6);
		
		$preview = new \OC\Preview($user, 'files',$relPath, 72  , 72 );
		$preview->setKeepAspect(false);	
		
		$previewPath = $preview->getThumbnailsFolder() . '/' . $imgId . '/';
		$previewName = $previewPath . '72-72.png';
		$userView = new \OC\Files\View('/' . $user);
		
		if($userView->file_exists($previewName)){
			
				\OCP\Response::setContentDispositionHeader(basename($img), 'inline');
					header('Content-Type: image/png');
					$userView -> readfile($previewName);
				
		}else{
				$local = $ownerView -> getLocalFile($img);	
				if(stristr($mime,'image') && $mime !== 'image/svg+xml' && exif_imagetype($local) === false){
					$image = new \OCP\Image();
					$brokenImage=  'apps/'.$this->appName.'/img/broken-small.png';
					if($image->load($brokenImage)) {
						$image -> fixOrientation();
					    $image -> show();
					}
				}else{	
					$preview->showPreview();
				}
		}
		
		exit();
		
	}
	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function getThumbnail(){
		$pScale = $this->params('scale');
		$pSquare = $this->params('square');		
		$scale = isset($pScale) ? $pScale : 1;
		$square = isset($pSquare) ? (bool)$pSquare : false;
		$img =  $this->params('file');
		$pToken =  $this->params('token');
		
		//$linkItem = \OCP\Share::getShareByToken($owner);
		
		if (!empty($pToken)) {
			$linkItem = \OCP\Share::getShareByToken($pToken);
			if (!(is_array($linkItem) && isset($linkItem['uid_owner']))) {
				exit;
			}
			// seems to be a valid share
			$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
			$user = $rootLinkItem['uid_owner'];
		
			$this->helperController->prepareSetupSharing($user);
		   
			$fullPath = \OC\Files\Filesystem::getPath($linkItem['file_source']);
			$img = trim($fullPath . '/' . $img);
		} else {
			\OCP\JSON::checkLoggedIn();
			$user = $this->userId;
			
		}
		
		\OC::$server->getSession()->close();
		
		if ($square) {
			$ownerView = new \OC\Files\View('/' . $user . '/files');
			$fileInfo = $ownerView -> getFileInfo($img);
			$mime = $ownerView -> getMimeType($img);
			$preview = new \OC\Preview($user, 'files','/'.$img, 200 * $scale, 200 * $scale);
			$previewPath = $preview->getThumbnailsFolder() . '/' . $fileInfo->getId() . '/';
			$previewName = $previewPath . '200-200.png';
			$userView = new \OC\Files\View('/' . $user);
			
			if($userView->file_exists($previewName)){
				\OCP\Response::setContentDispositionHeader(basename($img), 'inline');
					header('Content-Type: ' . $mime);
					$userView -> readfile($previewName);
			}else{
				 $preview->showPreview();
			}
			
		} else {
			$preview = new \OC\Preview($user, 'files','/'.$img, 400 * $scale, 200 * $scale);
			$preview->setKeepAspect(true);
			 $preview->showPreview();
		}
		
		exit();
	}
	
	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function getBatchImages(){
		
		$pSquare = $this->params('square');	
		$pScale = $this->params('scale');	
		$pImageIds = $this->params('image');	
		$ptoken = $this->params('token');		
		
		$square = isset($pSquare) ? (bool)$pSquare : false;
		$scale = isset($pScale) ? $pScale : 1;
		$imageIds = explode(';', $pImageIds);
		
		$listenMode = 'preview';
		$scale=1;	
		
		if(isset($ptoken) && $ptoken !== ''){
			$linkItem = \OCP\Share::getShareByToken($ptoken);
			if (!(is_array($linkItem) && isset($linkItem['uid_owner']))) {
				exit();
			}
			// seems to be a valid share
			$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
			$user = $rootLinkItem['uid_owner'];
			
		    $this->helperController->prepareSetupSharing($user);
  
			$startPath = \OC\Files\Filesystem::getPath($linkItem['file_source']) . '/';
		}else{
			$user = $this->userId;
			$startPath = '/';
		}
		
		$userView = new \OC\Files\View('/' . $user);

		\OC::$server->getSession()->close();
		
		$EventSource = \OC::$server->createEventSource();
		$EventSource->send('start', array('mode' => $listenMode));
		
		foreach ($imageIds as $imageId) {
			
			$height = 200 * $scale;
			if ($square) {
				$width = 200 * $scale ;
			} else {
				$width = 400 * $scale ;
			}
			
			$path= $userView->getPath($imageId);
			$mimeType = $userView->getMimeType($path);
			
			$relPath= substr($path,6);
			
			$preview = new \OC\Preview($user, 'files',$relPath, $width, $height);
			$preview->setKeepAspect(!$square);
			
			$imageName = substr($relPath,strlen($startPath));
			
			
			$previewPath = $preview->getThumbnailsFolder() . '/' . $imageId . '/';
			$previewName = $previewPath . strval($width) . '-' . strval($height);
			
			if (!$square) {
				$previewName .= '-with-aspect';
			}
			$previewName .= '.png';
			
			
			if($userView->file_exists($previewName)){
				$EventSource->send($listenMode, array(
					'image' => $imageName,
					'imgid' => $imageId,
					'preview' => base64_encode($userView->file_get_contents('/' . $previewName))
				));
				
			} else {
				
				$local = $userView -> getLocalFile($path);	
				if(stristr($mimeType,'image') && $mimeType !== 'image/svg+xml' && exif_imagetype($local) === false){
						
					
					$image = new \OCP\Image();
					$brokenImage=  'apps/'.$this->appName.'/img/broken-small.png';
					
					$imgString='';
					if($image->load($brokenImage)) {
						$imgString=$image->__toString();
						\OCP\Util::writeLog($this->appName,'Broken IMAGE is corrupted:'.$brokenImage,\OCP\Util::ERROR);	
					}
					$EventSource->send($listenMode, array(
								'image' => $imageName,
								'imgid' => $imageId,
								'preview' => $imgString
					 ));	
				}else{
					$EventSource->send($listenMode, array(
								'image' => $imageName,
								'imgid' => $imageId,
								'preview' => (string)$preview->getPreview()
					));	
				}	
					
						
				
			}
			
		}
		
		$EventSource->send('done', array('mode' =>$listenMode));
		$EventSource->close();
		exit();
	}
	
	/**
	 *
	 * @NoAdminRequired
	 * 
	 */
	public function getBatchImagesAll(){
		
		$pImageIds = $this->params('images');	
		$pRegenerate = $this->params('regenerate');	
		$pSquare = $this->params('square');
		$iCurrent=$this->params('current');
		$imageIds = explode(';', $pImageIds);

		$bRegenerate = isset($pRegenerate) ? (bool)$pRegenerate : false;
		$bSquare = isset($pSquare) ? (bool)$pSquare : false;
	
		$user = $this->userId;
			
		$userView = new \OC\Files\View('/' . $user);
		
		\OC::$server->getSession()->close();
		
		$config = \OC::$server -> getConfig();
		$previewMaxX= $config -> getAppValue('core', 'preview_max_x', '2048');
		$previewMaxY= $config -> getAppValue('core', 'preview_max_y', '2048');
		
		$height = 200 ;	
		if ($bSquare) {
				$width = 200 ;
			} else {
				$width = 400 ;
			}
		$saveCoverFile='';
		
		foreach ($imageIds as $imageId) {
			
			$message='';
			$path= $userView->getPath($imageId);
			$fileInfo = $userView->getFileInfo($path);
			$relPath= substr($path,6);
			$imageName = substr($relPath,1);
			$mimeType = $userView->getMimeType($path);
			
			if($bRegenerate === true){
				$preview = new \OC\Preview($user, 'files',$relPath);
				$preview->deleteAllPreviews();
				$message.=(string)$this->l10n->t('Delete all thumbnails of').' '.$imageName.' ...<br />';
				
				if(!$bSquare){
					if(strtolower($fileInfo['name']) === 'cover.jpg'){
							$previewSquare = new \OC\Preview($user, 'files',$relPath,200,200);
							$previewSquare->setKeepAspect(false);
							$previewSquare->getPreview();
					}
				}
			}
			
			
			$previewSmall = new \OC\Preview($user, 'files',$relPath,$width,$height);
			$previewSmall->setKeepAspect(!$bSquare);
			
			$previewPath = $previewSmall->getThumbnailsFolder() . '/' . $imageId . '/';
			$previewName = $previewPath . strval($width) . '-' . strval($height).'-with-aspect.png';
			
			if($userView->file_exists($previewName) && $bRegenerate === false){
				$message.=(string)$this->l10n->t('Preview 400px and Preview Max exist  for').' '.$imageName.' ...<br />';
			}else {
				$local = $userView -> getLocalFile($path);	
				if(stristr($mimeType,'image') && $mimeType !== 'image/svg+xml' && exif_imagetype($local) === false){
					
				}else{
					$previewSmall->getPreview();
					$message.=(string)$this->l10n->t('Generating Preview 400px and Preview Max').' '.$previewMaxX.'px '.(string)$this->l10n->t('for').' '.$imageName.' ... <br />';
				}
				
			}
			
		}

			$result=[
				'status' => 'success',
				'data' => ['message' => $message]
			];
			
			$response = new JSONResponse();
			$response -> setData($result);
			return $response;
	}
	
	
	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function downloadImage(){
			
		$filename = urldecode($this->params('file'));
		$pToken = $this->params('token');
		
		if (!empty($pToken)) {
			$linkItem = \OCP\Share::getShareByToken($pToken);
			if (!(is_array($linkItem) && isset($linkItem['uid_owner']))) {
				exit;
			}
			// seems to be a valid share
			$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
			$user = $rootLinkItem['uid_owner'];
		
			$this->helperController->prepareSetupSharing($user);
		   
			$fullPath = \OC\Files\Filesystem::getPath($linkItem['file_source']);
			$img = trim($fullPath . '/' . $filename);
		} else {
			\OCP\JSON::checkLoggedIn();
			$user = $this->userId;
			$img = trim($filename);
		}
		
		\OC::$server->getSession()->close();
		if(!\OC\Files\Filesystem::file_exists($img)) {
			$params = [
				'status' => 'error',
			];
			$response = new JSONResponse($params);
			return $response;
		}
		//$ftype = \OC_Helper::getSecureMimeType(\OC\Files\Filesystem::getMimeType($img));
		$ftype = 'application/octet-stream';
		$response = new DataDownloadResponse(\OC\Files\Filesystem::file_get_contents($img), $filename, $ftype);
			
		return $response;	

		
	}
	
	
	/**
	 *
	 * @NoCSRFRequired
	 * @PublicPage
	 */
	public function getMetadataImage(){
		
		$img=$this->params('file');
		$token=$this->params('token');	
		
		
		
		if (!empty($token)) {
			$linkItem = \OCP\Share::getShareByToken($token);
			if (!(is_array($linkItem) && isset($linkItem['uid_owner']))) {
				exit ;
			}
			// seems to be a valid share
			$rootLinkItem = \OCP\Share::resolveReShare($linkItem);
			$user = $rootLinkItem['uid_owner'];
			
			$this->helperController->prepareSetupSharing($user);
		
			$fullPath = \OC\Files\Filesystem::getPath($linkItem['file_source']);
			$img = trim($fullPath . '/' . $img);
			
		} else {
		
			$user=$this->userId;
		}
		
		\OC::$server->getSession()->close();
		
		$ownerView = new \OC\Files\View('/' . $user . '/files');
		$mimeType = $ownerView -> getMimeType($img);
	
		   $fileInfo = $ownerView -> getFileInfo($img);
			if ($fileInfo['encrypted'] === true) {
				$local = $ownerView -> toTmpFile($img);
			} else {
				$local = $ownerView -> getLocalFile($img);
			}
			
		if ($mimeType === 'image/jpeg' || $mimeType === 'image/jpg') {
			
			$rotate = false;
			if (is_callable('exif_read_data')) {
				$exif = @exif_read_data($local);
			}
			
				$size = getimagesize($local, $info);
				$result=array('description' => '', 'title' => '', 'creation_date' => '', 'country' => '', 'size' => '', 'fSize' => '', 'latitude' => '', 'longitude' => '', 'city' => '', 'location' => '', 'filename' => '');
				
				$result['size'] = $size[0] . ' x ' . $size[1] . ' px';
				
				if(isset($info['APP13'])){
					$iptc = iptcparse($info["APP13"]);
					if (is_array($iptc)) { 
						if(array_key_exists('2#120', $iptc)){
							$result['description'] = $iptc['2#120'][0];
						}
						if(array_key_exists('2#105', $iptc)){
							$result['title'] = $iptc['2#105'][0];
						}
						if(array_key_exists('2#055', $iptc)){
							$dateTime=new \DateTime($iptc['2#055'][0]);
							$result['creation_date']=$dateTime->format('d-m-Y');
						}
						if(array_key_exists('2#101', $iptc)){
							$result['country'] = $iptc['2#101'][0];
						}
						if(array_key_exists('2#090', $iptc)){
							$result['city'] = $iptc['2#090'][0];
						}
						if(array_key_exists('2#092', $iptc)){
							$result['location'] = $iptc['2#092'][0];
						}
					}
	
				}
				
				if ($result['title'] === '' && is_array($exif)) {
					
				    if(isset($exif['FileDateTime'])){
						$dateTime=date("d-m-Y",$exif['FileDateTime']);
						$result['creation_date']=$dateTime;
			        }
					 if(isset($exif['FileName'])){
			        	
						$result['title']=$fileInfo->getName();
						
			        }
				}
				
				if (is_array($exif)) {
				 	
				 $result['filename'] = $fileInfo->getName();
					
				 
				if(isset($exif['DateTimeDigitized']) && strlen($exif['DateTimeDigitized']) >= 8){
					$dateTime=new \DateTime($exif["DateTimeDigitized"]);
					$result['creation_date']=$dateTime->format('d.m.Y H:i');
				}
				
				if(isset($exif['GPSLatitude'])){
						$latitude = $this->gps($exif["GPSLatitude"], $exif['GPSLatitudeRef']);
					    $result['latitude']=$latitude;
						$longitude = $this->gps($exif["GPSLongitude"], $exif['GPSLongitudeRef']);
						$result['longitude']=$longitude;
						
						
				}
			
				if(isset($exif['FileSize'])){
						$result['fSize']=\OCP\Util::humanFileSize($exif['FileSize']);
			        }
			     }
				
			if (!is_array($info) && !is_array($exif)) {
				$result['fSize']=\OCP\Util::humanFileSize($fileInfo['size']);
				$result['filename']=$fileInfo->getName();
				$result['title']=$fileInfo->getName();
			}
		
		 $result['success'] = 1;
		
		}else{
			$size = getimagesize($local);
			$result['size'] = $size[0] . ' x ' . $size[1] . ' px';
			$result['fSize']=\OCP\Util::humanFileSize($fileInfo['size']);
			$result['filename']=$fileInfo->getName();
			$dateTime=date("d-m-Y",$fileInfo['mtime']);
			$result['creation_date']=$dateTime;
			$result['success']=0;
			
		}
		$response = new JSONResponse();
		$response -> setData($result);
		return $response;
		
		
	}
	
	/**
	 * @NoAdminRequired
	 *
	 */
	public function saveMetadataImage(){
			
			$title=$this->params('title');
			$descr=$this->params('descr');	
			$location=$this->params('location');	
			$city=$this->params('city');	
			$country=$this->params('country');	
			$img=$this->params('file');	
		
			$title = filter_var($title,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
			$descr = filter_var($descr,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
			$location = filter_var($location,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
			$city = filter_var($city,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
			$country = filter_var($country,FILTER_SANITIZE_STRING,FILTER_FLAG_NO_ENCODE_QUOTES);
				 
			$path='/'.$img;
			$meta = \OC\Files\Filesystem::getFileInfo($path);
				
			if(\OC\Files\Filesystem::isUpdatable($path) && ($meta['permissions'] & \OCP\PERMISSION_UPDATE)) {
				 	
				 \OC::$server->getSession()->close();
					
				 $ownerView = new \OC\Files\View('/' . $this->userId . '/files');
			     $local = $ownerView -> getLocalFile($img);
			 	
				$metaData='';
				
				 if($descr !== '' ) {
				 	$metaData.=$this->iptc_make_tag(2, '120', $descr);
				 }
				 if($title !== '' ){
				 	$metaData.=$this->iptc_make_tag(2, '105', $title);
				 } 
				 if($country !== '' ){
				 	$metaData.=$this->iptc_make_tag(2, '101', $country);
				 } 
				 if($city !== '' ){
				 	$metaData.=$this->iptc_make_tag(2, '090', $city);
				 } 
				 if($location !== '' ){
				 	$metaData.=$this->iptc_make_tag(2, '092', $location);
				 } 
				 
				 $content = iptcembed($metaData, $local);
				// $filecontents = iconv(mb_detect_encoding($content), "UTF-8", $content);
				\OC\Files\Filesystem::file_put_contents($path, $content);
				// Clear statcache
				clearstatcache();
				// Get new mtime
				$newmtime = \OC\Files\Filesystem::filemtime($path);
				$newsize = \OC\Files\Filesystem::filesize($path);
				$result= (string)  $this->l10n->t("Success editing IPTC Metadata!");
			}else{
				$result= (string) $this->l10n->t("Error! No Write Access! Missing Permissions!");
			}
				
		   	$response = new JSONResponse();
			$response -> setData($result);
			return $response;
		
	}
	
   private function gps($coordinate, $hemisphere) {
	  for ($i = 0; $i < 3; $i++) {
	    $part = explode('/', $coordinate[$i]);
	    if (count($part) === 1) {
	      $coordinate[$i] = $part[0];
	    } else if (count($part) === 2) {
	      $coordinate[$i] = floatval($part[0])/floatval($part[1]);
	    } else {
	      $coordinate[$i] = 0;
	    }
	  }
	  list($degrees, $minutes, $seconds) = $coordinate;
	  $sign = ($hemisphere === 'W' || $hemisphere === 'S') ? -1 : 1;
	  return $sign * ($degrees + $minutes/60 + $seconds/3600);
	}
	
	
	private function iptc_make_tag($rec, $data, $value){
    	
	    $length = strlen($value);
	    $retval = chr(0x1C) . chr($rec) . chr($data);
	
	    if($length < 0x8000){
	        $retval .= chr($length >> 8) .  chr($length & 0xFF);
	    }else{
	        $retval .= chr(0x80) . 
	                   chr(0x04) . 
	                   chr(($length >> 24) & 0xFF) . 
	                   chr(($length >> 16) & 0xFF) . 
	                   chr(($length >> 8) & 0xFF) . 
	                   chr($length & 0xFF);
	    }
	
	    return $retval . $value;
	}
	

	
}