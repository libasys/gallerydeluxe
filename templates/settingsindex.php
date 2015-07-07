<div id="gallerysettings">
<br />
<h3 ><?php p($l->t('Slideshow Controls')); ?></h3>

<input class="slideshowsettings" type="checkbox" name="download" id="downloadbutton" <?php ($_['userConfig']->{'download'} === 'true')?print_unescaped('checked="checked"') :''; ?> >
&nbsp;
<label for="downloadbutton"><i class="ioc ioc-download"></i> <?php p($l->t('Show download')); ?></label>
<br />
<input class="slideshowsettings" type="checkbox" name="info" id="infobutton" <?php ($_['userConfig']->{'info'} === 'true')?print_unescaped('checked="checked"') :''; ?>>
&nbsp;
<label for="infobutton"><i class="ioc ioc-info"></i> <?php p($l->t('Show info')); ?></label>
<br />
<input class="slideshowsettings" type="checkbox" name="thumbnailpreview" id="thumbnailpreviewbutton" <?php ($_['userConfig']->{'thumbnailpreview'} === 'true')?print_unescaped('checked="checked"') :''; ?>>
&nbsp;
<label for="thumbnailpreviewbutton"><i class="ioc ioc-thumbs"></i> <?php p($l->t('Show thumbnail preview')); ?></label>
<br />
<input class="slideshowsettings" type="checkbox" name="zoom" id="zoombuttons" <?php ($_['userConfig']->{'zoom'} === 'true')?print_unescaped('checked="checked"') :''; ?>>
&nbsp;
<label for="zoombuttons"><i class="ioc ioc-zoom-in"></i> <?php p($l->t('Show zooming')); ?></label>
<br />
<input class="slideshowsettings" type="checkbox" name="edit" id="editbutton" <?php ($_['userConfig']->{'edit'} === 'true')?print_unescaped('checked="checked"') :''; ?>>
&nbsp;
<label for="editbutton"><i class="ioc ioc-edit"></i> <?php p($l->t('Show edit')); ?></label>
<br />
<input class="slideshowsettings" type="checkbox" name="controlsalways" id="controlbutton" <?php ($_['userConfig']->{'controlsalways'} === 'true')?print_unescaped('checked="checked"') :''; ?>>
&nbsp;
<label for="controlbutton"><i class="ioc ioc-eye"></i> <?php p($l->t('Show controls always')); ?></label>
<br />
<input class="slideshowsettings" type="checkbox" name="share" id="sharebutton" <?php ($_['userConfig']->{'share'} === 'true')?print_unescaped('checked="checked"') :''; ?>>
&nbsp;
<label for="sharebutton"><i class="ioc ioc-share"></i>  <?php p($l->t('Show share')); ?></label>
<br />
<input class="slideshowsettings" type="checkbox" name="fullscreen" id="fullscreenbutton" <?php ($_['userConfig']->{'fullscreen'} === 'true')?print_unescaped('checked="checked"') :''; ?>>
&nbsp;
<label for="fullscreenbutton"><i class="ioc ioc-resize-full-1"></i>  <?php p($l->t('Show fullscreen')); ?></label>
<br />
<input class="slideshowsettings" type="checkbox" name="darkdesign" id="darkdesignbutton" <?php ($_['userConfig']->{'darkdesign'} === 'true')?print_unescaped('checked="checked"') :''; ?>>
&nbsp;
<label for="darkdesign">  <?php p($l->t('Show dark Background')); ?></label>
<br />
<h3 ><?php p($l->t('Thumbnails')); ?></h3>	
<input class="thumbsettings" type="checkbox" name="thumbdarkdesign" id="thumbdarkdesign" <?php ($_['userConfig']->{'thumbdarkdesign'} === 'true')?print_unescaped('checked="checked"') :''; ?>>
&nbsp;
<label for="darkdesign">  <?php p($l->t('Show dark Background')); ?></label>
<br />
<button class="button batch toolTipSettings" title="<?php p($l->t("Scan all thumbnails of album and create thumbnails size: 400px and").' '.$_['previewMax'].'px'); ?>"><i class="ioc ioc-thumbs"></i> <?php p($l->t("Scan")); ?></button>
<button class="button RegenBatch toolTipSettings" title="<?php p($l->t("Deletes and regenerates all thumbnails of a album new!")); ?>"><i class="ioc ioc-thumbs"></i> <?php p($l->t("Regenerate")); ?></button>
</div>				