<header>
	<div id="header">
		<a href="<?php print_unescaped(link_to('', 'index.php')); ?>"
			title="<?php p($theme -> getLogoClaim()); ?>" id="owncloud">
			<div class="logo-icon svg"></div>
		</a>
		<div id="logo-claim" style="display:none;"><?php p($theme -> getLogoClaim()); ?></div>
		<div class="header-right">
			<span id="details"><?php p($l->t('shared by %s', $_['displayName'])) ?></span>
		</div>
	</div>
</header>
<div id="content-wrapper">
<div id="loading">
	<i style="margin-top:20%;" class="ioc-spinner ioc-spin"></i>
</div>
<div id="content" data-albumname="">
	<div id="controls">
		<div id="breadcrumbs"></div>
		<!-- toggle for opening shared picture view as file list -->
		
		<button id="openAsFileListButton" class="button" title="<?php p($l -> t('File list')); ?>"><i class="ioc ioc-list"></i></button>
		<button class="button sort" title="<?php p($l -> t('Sort by Name')); ?>"><?php p($l -> t("Name")); ?> <i class="ioc ioc-angle-down"></i></button>
        <button class="button sortdate" title="<?php p($l -> t('Sort by Date')); ?>"><?php p($l -> t("Date")); ?> <i class="ioc ioc-angle-down"></i></button>
	</div>

	<div id='gallery' class="hascontrols" data-requesttoken="<?php p($_['requesttoken'])?>" data-token="<?php isset($_['token']) ? p($_['token']) : p(false) ?>"></div>
</div>
</div>
<br> <br>
<footer>
	<div class="info">
		<?php print_unescaped($theme -> getLongFooter()); ?>
	</div>
</footer>
