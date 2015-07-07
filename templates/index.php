
<div id="loading">
	<i style="margin-top:20%;" class="ioc-spinner ioc-spin"></i>
</div>

<input type="hidden" name="mailNotificationEnabled" id="mailNotificationEnabled" value="<?php p($_['mailNotificationEnabled']) ?>" />
<input type="hidden" name="allowShareWithLink" id="allowShareWithLink" value="<?php p($_['allowShareWithLink']) ?>" />
<div id="controls">

<div id="breadcrumbs"></div>
<div id="loaderCaching"></div>
<div class="rightControls">
	<div class="button-group">
	<button class="button sort toolTip" title="<?php p($l->t("sorty by name asc desc")); ?>"><?php p($l->t("Name")); ?> <i class="ioc ioc-angle-down"></i></button>
	<button class="button sortdate toolTip" title="<?php p($l->t("sorty by date asc desc")); ?>"><?php p($l->t("Date")); ?> <i class="ioc ioc-angle-down"></i></button>	
	<a class="share button toolTip" 
	data-item-type="folder" 
	data-item="" 
	data-link="true"
	title="<?php p($l->t("Share")); ?>"
	data-possible-permissions=""><?php p($l->t("Share")); ?></a>
	<a href="<?php ?>" class="button keepActive toolTip" id="linkToDir"  title="<?php p($l->t("Show directory content in files app")); ?>"><i class="ioc ioc-list"></i></a>
	<button class="button settings keepActive icon-settings toolTip" title="<?php p($l->t("Show your settings")); ?>">&nbsp;</button>	

	</div>	
</div>
</div>
<div id="gallery" class="hascontrols"></div>

<div id="emptycontent" class="hidden"><?php p($l->t("No pictures found! If you upload or rename a jpeg file to cover.jpg, the folder  will displayed as an album in your gallery!")); ?></div>
<div id="appsettings" class="popup topright hidden"></div>