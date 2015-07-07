


if (!self["monochrome"]) {
    self.monochrome = {};
}

function getWindowHeight () {
    if (window.innerHeight) {
        return window.innerHeight;
    }
    if (document.documentElement && document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
    }
    return 0;
}

function getPosition (element) {
    var result = {};
    if (element.ownerDocument && element.ownerDocument.documentElement && element.getBoundingClientRect) {
        var box = element.getBoundingClientRect ();
        var doc = element.ownerDocument;
        var docElem = doc.documentElement;
        
        var clientTop = docElem.clientTop || 0;
        var clientLeft = docElem.clientLeft || 0;
        result.x = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft;
        result.y = box.top  + (self.pageYOffset || docElem.scrollTop ) - clientTop;
    } else {
        var x = 0;
        var y = 0;
        var obj = element.offsetParent;
        while (obj != null){
            x += obj.offsetLeft;
            y += obj.offsetTop;
            obj = obj.offsetParent;
        }
        result.x = x;
        result.y = y;
    }
    return result;
}

var onLoaded = onLoaded || new Array ();
var onResized = onResized || new Array ();
var onScroll = onScroll || new Array ();
var onDomReady = onDomReady || [];

function monochromeOnDomReady () {
    if (self["monochromeOnDomReadyHasRun"]) {
        return;
    }
    
    self.monochromeOnDomReadyHasRun = true;
    
    for (var n = 0; n < onDomReady.length; ++n) {
        onDomReady[n]();
    }
    onDomReady = {
        push : function (f) {
            f();
        }
    };
}

function monochromeOnLoad () {
    if (self["monochromeOnLoadHasRun"]) {
        return;
    }
    
    self.monochromeOnLoadHasRun = true;
    
    document.body.addEventListener ("orientationchange", monochromeOnOrientationChange);
    window.addEventListener ("resize", monochromeOnResize);
    loadMathJax ();
    
    for (var n = 0; n < onLoaded.length; ++n) {
        onLoaded[n]();
    }
    onLoaded = {
        push : function (f) {
            f();
        }
    };
    
    var FLOW_CONTROL_KEYWORDS = ["break,continue,do,else,for,if,return,while"];
    var C_KEYWORDS = [FLOW_CONTROL_KEYWORDS,"auto,case,char,const,default," + 
        "double,enum,extern,float,goto,int,long,register,short,signed,sizeof," +
            "static,struct,switch,typedef,union,unsigned,void,volatile"];
    var COMMON_KEYWORDS = [C_KEYWORDS,"catch,class,delete,false,import," +
        "new,operator,private,protected,public,this,throw,true,try,typeof"];
    var AS3_KEYWORDS = [COMMON_KEYWORDS,
        "debugger,eval,export,function,get,null,set,undefined,var,with," +
            "Infinity,NaN"];
    
    PR.registerLangHandler(PR.sourceDecorator({
                'keywords': AS3_KEYWORDS,
                'cStyleComments': true,
                'regexLiterals': true
            }), ['as3']);
    
    if (navigator.userAgent.indexOf ("Kindle/") > -1) {
        document.body.className = "kindle " + document.body.className;
        setTimeout (monochromeOnResize, 50);
    }
    
    var insertZWS = function () {
        var aElems = document.getElementsByTagName ("span");
        for (var i=aElems.length - 1; i>0; --i) {
            var span = aElems[i];
            var prevSpan = span.previousSibling;
            if (prevSpan != null && span.className == "pun") {
                var breakBefore = false;
                var textContent = span.textContent;
                if (textContent.length >= 1) {
                    if (textContent.charAt (0) == '<' ||
                            textContent.charAt (0) == '.') {
                                breakBefore = true;
                            }
                }
                if (breakBefore) {
                    span.textContent = ("\u200b" + span.textContent);
                }
            }
        }
    }
    
    prettyPrint (insertZWS);
}

function loadMathJax () {
    var conf = document.createElement ("script");
    conf.type="text/x-mathjax-config";
    conf.text = (
        "MathJax.Hub.Config({" + 
            "config: ['MMLorHTML.js']," + 
            "messageStyle: 'none'," + 
            "asciimath2jax: { " + 
            "delimiters: [['\u200a','\u200a']]," + 
            "processClass: 'equation'," + 
            "skipTags: ['script','noscript','style','textarea','pre','code']," + 
            "}," + 
            "jax: ['input/AsciiMath', 'input/MathML','output/HTML-CSS','output/NativeMML']," + 
            "extensions: ['asciimath2jax.js', 'mml2jax.js','MathMenu.js','MathZoom.js']" + 
            "});"
    );
    document.body.appendChild (conf);
    
    var script = document.createElement ("script");
    script.type = "text/javascript";
    script.src = "http://cdn.mathjax.org/mathjax/2.2-latest/MathJax.js";
    document.body.appendChild (script);
}

function monochromeAddOnLoad (callback) {
    onLoaded.push (callback);
}

function monochromeAddOnResize (callback) {
    onResized.push (callback);
}

function monochromeAddOnScroll (callback) {
    onScroll.push (callback);
}

function flowPlayerConfig () {
    return { 
        plugins:  { 
            controls: {             
                backgroundGradient: 'none', 
                backgroundColor: "#303030",
                bufferColor: '#111111', 
                progressColor: '#404040',             
                buttonColor: '#020202', 
                buttonOverColor: '#606060', 
                timeColor: '#c0c0c0', 
                durationColor: '#a0a0a0', 
                timeBgColor: '#020202', 
                progressGradient: 'none',
                volumeColor : '#020202',
                volumeSliderColor : '#000000',
                opacity: 0.80,
                hideDelay: 1000,
                width: '95%',  
                bottom: 5, 
                left: '50%', 
                borderRadius: 15,
                height: 24,
                autoHide: 'always',
                tooltipColor: '#020202',
                tooltipTextColor: '#a0a0a0',
                tooltips: { 
                    buttons: true, 
                    fullscreen: 'Fullscreen'
                } 
            }
        }
    };
}

function centerWindow (element, width, height, orientation) {
    if (orientation == 'vertical') {
        var pos = (height - element.clientHeight) / 2;
        if (pos > 0) {
            element.scrollTop = pos;
        }
    } else {
        var pos = (width - element.clientWidth) / 2;
        if (pos > 0) {
            element.scrollLeft = pos;
        }
    }    
}

function showBigImageMarker (x, y, w, h, text, owidth, oheight) {
    var marker = document.getElementById ("big_image_marker");
    var markerFrame = document.getElementById ("big_image_marker_frame");
    var markerText = document.getElementById ("big_image_marker_text");
    var image = document.getElementById ("big-image-img");
    
    if (!marker || !markerFrame || !markerText || !image) {
        return;
    }
    
    var p = getPosition (image);
    p.y = 16;
    var s = {
        w : image.offsetWidth,
        h : image.offsetHeight
    };
    
    var xs = s.w / owidth;
    var ys = s.h / oheight;
    
    markerText.innerHTML = text.replace (/[ ]/g, "&#160;");
    
    var textOffset = 0;
    if (markerText.offsetWidth > w) {
        textOffset = -((markerText.offsetWidth - w) / 2);
    }
    
    marker.style.top = (p.y + y * ys - 2) + "px";
    marker.style.left = (p.x + x * xs + textOffset - 2) + "px";
    markerFrame.style.left = (-textOffset) + "px";
    markerFrame.style.width = (w * xs - 2) + "px";
    markerFrame.style.height = (h * ys - 2) + "px";
    
    marker.style.visibility = '';
}

monochromeResizeHotspot = function (id, x, y, w, h, owidth, oheight) {
    var layout = function () {
        var marker = document.getElementById (id);
        var image = document.getElementById ("big-image-img");
        
        if (!marker || !image) {
            return;
        }
        
        var p = getPosition (image);
        if (document.body.offsetWidth <= 600) {
            p.y = 0;
        } else {
            p.y = 16;
        }
        
        var s = {
            w : image.offsetWidth,
            h : image.offsetHeight
        };
        
        var xs = s.w / owidth;
        var ys = s.h / oheight;
        
        marker.style.top = (p.y + y * ys) + "px";
        marker.style.left = (p.x + x * xs) + "px";
        marker.style.width = (w * xs - 2) + "px";
        marker.style.height = (h * ys - 2) + "px";
    };
    onResized.push (layout);
    onLoaded.push (layout);
}

function hideBigImageMarker () {
    var marker = document.getElementById ("big_image_marker");
    if (marker) {
        marker.style.visibility = 'hidden';
    }
}

translateEvent = function (event) {
    if (event.clientX) {
        return event;
    } else {
        return {
            clientX : event.changedTouches[0].clientX,
            clientY : event.changedTouches[0].clientY
        };
    };
};

addClickHandler = function (element, handler) {
    var data = {
    };
    var b = new bigshot.Browser ();
    var onDown = function (e) {
        data.t = new Date ().getTime ();
        data.x = e.clientX;
        data.y = e.clientY;
        data.down = true;
    };
    b.registerListener (element, "mousedown", onDown);
    b.registerListener (element, "touchstart", function (e) {
            onDown (translateEvent (e));
        });
    
    var onUp = function (e) {
        if (data.down) {
            var dx = Math.abs (data.x - e.clientX);
            var dy = Math.abs (data.y - e.clientY);
            var dt = Math.abs (data.t - new Date ().getTime ());
            if (dx < 4 && dy < 4 && dt < 300) {
                handler ();
            }
        }
        data.down = false;
    };
    b.registerListener (element, "mouseup", onUp);
    b.registerListener (element, "touchend", function (e) {
            onUp (translateEvent (e));
        });
};

addBigImageSizer = function (sizeContainer, chained) {
    var sizer = function () {
        if (document.body.offsetWidth <= 600) {
            sizeContainer.style.width = (document.getElementById ("main_column").offsetWidth - 1) + "px";
            sizeContainer.style.height = (window.innerHeight - 32) + "px";
            var ipnt = document.getElementById ("image-page-nav-tab");
            if (ipnt == null) {
                ipnt = document.getElementById ("right_column_inner").firstChild.firstChild;
            }
            document.getElementById ("right_column_inner").style.marginTop = (window.innerHeight - (ipnt != null ? ipnt.offsetHeight : 16) - document.getElementById ("main_column").offsetHeight) + "px";
        } else {
            document.getElementById ("right_column_inner").style.marginTop = "0px";
            sizeContainer.style.width = (document.getElementById ("main_column").offsetWidth - 1) + "px";
            console.log (document.getElementById ("main_table").offsetWidth);
            console.log (document.getElementById ("right_column_inner").offsetWidth);
            sizeContainer.style.height = (window.innerHeight) + "px";
        }
        if (chained) {
            chained ();     
        }
    };
    monochromeAddOnResize (sizer);
    sizer ();
}


addImagePageLayout = function () {
    var bi = document.getElementById ("big-image");
    var bii = document.getElementById ("big-image-img");
    var imWidth = -1;
    var imHeight = -1;
    if (bii) {
        imWidth = bii.width;
        imHeight = bii.height;
    }
    
    var getSize = function (e) {
        var img2 = document.createElement ("img");
        img2.addEventListener ("load", function (e) {
                imWidth = img2.width;
                imHeight = img2.height;
            });
        img2.src = bii.src;
    };
    
    if (imWidth == 0 || imHeight == 0) {
        imWidth = 1;
        imHeight = 1;
        bii.addEventListener ("load", getSize);
    } else if (bii) {
        getSize ();
    }
    
    var sizer = function () {
        var hasSpecials = false;
        for (var k in vrs) {
            hasSpecials = true;
        }
        for (var k in zoomables) {
            hasSpecials = true;
        }
        if (hasSpecials) {
            bi.style.position = "static";
            return;
        }
        if (document.body.offsetWidth <= 600) {
            bi.style.position = "static";
            if (bii) {
                bii.style.height = "";
                bii.style.width = "";
            }
        } else {
            bi.style.position = "relative";
            if (bii) {
                var boxWidth = window.innerWidth - 211;
                var boxHeight = window.innerHeight - 32;
                
                var aspect = imWidth / imHeight;
                
                var finalWidth = imWidth;
                var finalHeight = imHeight;
                if (boxWidth < finalWidth) {
                    finalHeight *= boxWidth / finalWidth;
                    finalWidth = boxWidth;
                }
                
                if (boxHeight < finalHeight) {
                    finalWidth *= boxHeight / finalHeight;
                    finalHeight = boxHeight;
                }
                
                var bit = (boxHeight - finalHeight) / 2;
                if (bit < 0) {
                    bit = 0;
                }
                bi.style.top = bit + "px";
                
                bii.style.height = finalHeight + "px";
                bii.style.width = finalWidth + "px";
            } else {
                var bit = (window.innerHeight - bi.offsetHeight) / 2;
                if (bit < 0) {
                    bit = 0;
                }
                bi.style.top = bit + "px";
            }
        }
    };
    monochromeAddOnResize (sizer);
    sizer ();
}


// VR


var vrs = {};
var vrsFullScreen = {};

function monochromeAddVr (imageId, source, y0, p0, r0) {
    if (Modernizr.csstransforms3d || Modernizr.webgl) {
        var linear = null;
        if (bigshot.WebGLUtil.isWebGLSupported ()) {
            linear = bigshot.WebGLUtil.createContext (document.createElement ("canvas")).LINEAR;
        }
        if (!y0) {
            y0 = 0;
        }
        if (!p0) {
            p0 = 0;
        }
        if (!r0) {
            r0 = 0;
        }
        
        var container = document.getElementById (imageId + "_vrContainer");
        var outerContainer = document.getElementById (imageId + "_vrContainerOuter");
        
        var bvr = new bigshot.VRPanorama (
            new bigshot.VRPanoramaParameters ({
                    container : container,
                    basePath : "/bigshot.php?file=" + source + ".bigshot&entry=",
                    fileSystemType : "dzi",
                    textureMinFilter : linear,
                    textureMagFilter : linear,
                    //maxTesselation : 1,
                    maxTextureMagnification : 1.5,
                    yawOffset : y0,
                    pitchOffset : p0,
                    rollOffset : r0
                }));
        
        addBigImageSizer (outerContainer, function () {
                bvr.onresize ();
                bvr.render ();
            });
        
        //bvr.autoRotateWhenIdle (3);
        bvr.setDragMode (bigshot.VRPanorama.DRAG_GRAB);
        bvr.autoResizeContainer (document.getElementById (imageId + "_vrContainerSize"));
        bvr.onresize ();
        bvr.render ();
        
        new bigshot.Browser ().registerListener (window, "keyup", function (e) {
                console.log (e.keyCode);
                if (e.keyCode == 80) {
                    console.log ("Y:" + ((bvr.getYaw () + y0 + 360) % 360) + ", P:" + bvr.getPitch () + ", F:" + bvr.getFov ());
                }
            });
        
        vrs[imageId] = bvr;
    } else {
        var vrControls = document.getElementById (imageId + "_vrControls");
        vrControls.parentNode.removeChild (vrControls);
        
        // Set up Salado player
        
        var flashvars = {};
        flashvars.xml = source + ".xml";
        var params = {};
        params.play = "true";
        params.loop = "false";
        params.menu = "false";
        params.quality = "high";
        params.scale = "showall";
        params.wmode = "window";
        params.bgcolor = "#FFFFFF";
        params.devicefont = "false";
        params.allowfullscreen = "true";
        params.allowscriptaccess = "sameDomain";
        var attributes = {};
        swfobject.embedSWF("/SaladoPlayer.swf", imageId + "_vrContainer", "100%", "100%", "10.0.0", "flashExpressInstall.swf", flashvars, params, attributes);
    }
    monochromeOnResize ();
}

function monochromeVrFullScreen (vr) {
    if (vrsFullScreen[vr]) {
        vrsFullScreen[vr]();
    } else {
        var zi = vrs[vr];
        var vrControls = document.getElementById (vr + "_vrControls");
        var vrContainer = document.getElementById (vr + "_vrContainer");
        savedParent = vrControls.parentNode;
        
        var div = document.createElement ("div");
        div.style.position = "fixed";
        div.style.top = "0px";
        div.style.left = "50%";
        div.style.zIndex = "9999";
        
        var outer = document.createElement ("div");
        outer.className = "vrContainerOuterFullScreen";
        
        outer = div.appendChild (outer);
        vrControls = outer.appendChild (vrControls);
        div = document.body.appendChild (div);
        
        vrsFullScreen[vr] = zi.fullScreen (function () {
                delete vrsFullScreen[vr];
                savedParent.appendChild (vrControls);
                document.body.removeChild (div);
                vrContainer.style.width = "";
                vrContainer.style.height = "";
            });
    }
}

function monochromeVrZoomOut (zoomable) {
    var zi = vrs[zoomable];
    zi.setFov (Math.min (zi.getFov () * 1.2, 90));
    zi.render ();
}

function monochromeVrZoomIn (zoomable) {
    var zi = vrs[zoomable];
    zi.setFov (Math.max (zi.getFov () * 0.8, zi.getMinFovFromViewportAndImage ()));
    zi.render ();
}

function monochromeVrZoomTo (zoomable, fraction) {
    var zi = vrs[zoomable];
    var base = zi.getMinFovFromViewportAndImage ();
    var range = 90 - base;
    var newZoom = base + fraction * range;
    zi.setFov (newZoom);
    zi.render ();
}

function monochromeVrZoomToFit (zoomable) {
    var zi = vrs[zoomable];
    zi.setFov (60);
    zi.render ();
}



// ZOOMABLE

var zoomables = {};
var zoomablesFullScreen = {};

function monochromeAddZoomable (imageId, source, parameterSetup, zoomableSetup) {
    var containerOuter = document.getElementById (imageId + "_zoomableContainerOuter");
    var container = document.getElementById (imageId + "_zoomContainer");
    var controls = document.getElementById (imageId + "_zoomControls");
    
    //new bigshot.Browser ().stopMouseEventBubbling (controls);
    
    var zoomable = null;
    if (source.substring (source.length - 8) == ".bigshot") {
        zoomable = new bigshot.Image (
            parameterSetup (
                new bigshot.ImageParameters ({
                        basePath : "/bigshot.php?file=" + source,
                        fileSystemType : "archive",
                        container : container,
                        maxTextureMagnification : 1.4,
                        touchUI : false
                    })));
    } else {
        zoomable = new bigshot.SimpleImage (
            parameterSetup (
                new bigshot.ImageParameters ({
                        basePath : source,
                        container : container,
                        minZoom : -5,
                        maxZoom : 0,
                        touchUI : false
                    })));
    }
    
    zoomableSetup (zoomable);
    
    addBigImageSizer (containerOuter, function () {
            zoomable.onresize ();
        });
    
    zoomable.onresize ();
    zoomable.zoomToFill ();
    
    zoomables[imageId] = zoomable;
    monochromeOnResize ();
}

function monochromeZoomableZoomOut (zoomable) {
    var zi = zoomables[zoomable];
    zi.flyTo (null, null, zi.getZoom () - 0.1);
}

function monochromeZoomableZoomIn (zoomable) {
    var zi = zoomables[zoomable];
    zi.flyTo (null, null, zi.getZoom () + 0.1);
}

function monochromeZoomableZoomTo (zoomable, fraction) {
    var zi = zoomables[zoomable];
    var newZoom = zi.getZoomToFitValue () * fraction;
    zi.flyTo (null, null, newZoom);
}

function monochromeZoomableZoomToFit (zoomable) {
    var zi = zoomables[zoomable];
    zi.flyZoomToFit ();
}

function monochromeZoomableZoomToFitWidth (zoomable) {
    var zi = zoomables[zoomable];
    zi.flyZoomToFitWidth ();
}

function monochromeZoomableZoomToFitHeight (zoomable) {
    var zi = zoomables[zoomable];
    zi.flyZoomToFitHeight ();
}

function monochromeZoomableFullScreen (zoomable) {
    var zi = zoomables[zoomable];
    
    if (zoomablesFullScreen[zoomable]) {
        zoomablesFullScreen[zoomable]();
    } else {
        var vrControls = document.getElementById (zoomable + "_zoomControls");
        var vrContainer = document.getElementById (zoomable + "_zoomContainer");
        savedParent = vrControls.parentNode;
        
        var div = document.createElement ("div");
        div.style.position = "fixed";
        div.style.top = "0px";
        div.style.left = "50%";
        div.style.zIndex = "9999";
        
        var outer = document.createElement ("div");
        outer.className = "vrContainerOuterFullScreen";
        
        outer = div.appendChild (outer);
        vrControls = outer.appendChild (vrControls);
        div = document.body.appendChild (div);
        
        zoomablesFullScreen[zoomable] = zi.fullScreen (function () {
                delete zoomablesFullScreen[zoomable];
                savedParent.appendChild (vrControls);
                document.body.removeChild (div);
                vrContainer.style.width = "";
                vrContainer.style.height = "";
            });
    }
}

//-----------------

delayImages = {};

function addDelayLoadImage (id, image, src) {
    if (!delayImages[id]) {
        delayImages[id] = {};
    }
    delayImages[id][image] = src;
}

function loadDelayedImages (id) {
    var images = delayImages[id];
    if (images) {
        for (var k in images) {
            var img = document.getElementById (k);
            img.src = images[k];
        }
    }
}

function openMobileEntry (entry) {
    loadDelayedImages (entry);
    
    var div = document.getElementById (entry + "_body");
    div.style.display='block'; 
    
}

//---------------------

function resizeFullEntryMap (id) {
    var mf = document.getElementById (id);
    if (mf) {
        mf.style.height = Math.max (getWindowHeight () - mf.offsetTop - 52, 200) + "px";
        if (mf.mmap) {
            mf.mmap.onResize ();
        }
    }
}

function monochromeOnScroll () {
    for (var n = 0; n < onScroll.length; ++n) {
        onScroll[n]();
    }
}

function monochromeOnResize () {
    resizeFullEntryMap ('bigphotomapframe'); 
    resizeFullEntryMap ('bigmapframe');
    for (var n = 0; n < onResized.length; ++n) {
        onResized[n]();
    }
}

function monochromeOnOrientationChange () {
    resizeFullEntryMap ('bigphotomapframe'); 
    resizeFullEntryMap ('bigmapframe');
    for (var n = 0; n < onResized.length; ++n) {
        onResized[n]();
    }
}

//---------------------

monochromeRecipe = function () {
    var that = this;
    
    var Ingredient = function (recipe, amount, unit, element) {
        this.recipe = recipe;
        this.amount = amount;
        this.unit = unit;
        this.element = element;
        
        this.recalculate = function (servings) {
            if (amount >= 0) {
                var newAmount = amount * servings / recipe.baseServings;
                var text = newAmount + " " + unit;
                element.innerHTML = text;
            }
        }
    };
    
    this.ingredients = [];
    this.selector = null;
    this.baseServings = 1;
    
    this.addIngredient = function (amount, unit, element) {
        var ing = new Ingredient (this, amount, unit, element);
        this.ingredients.push (ing);
    }
    
    this.setBaseServings = function (base) {
        this.baseServings = base;
    }
    
    this.setSelector = function (selector) {
        this.selector = selector;
        this.selector.onchange = function () {
            that.onchange ();
        };
        
    };
    
    this.onchange = function () {
        var newServings = parseInt (this.selector.value);
        for (var i = 0; i < this.ingredients.length; ++i) {
            this.ingredients[i].recalculate (newServings);
        }
    }
};

//---- ROLLOVERS

monochromeRollover = function (imageId, defaultSrc) {
    var that = this;
    
    this.browser = new bigshot.Browser ();
    
    this.image = document.getElementById (imageId);
    this.tabs = new Array ();
    
    this.add = function (tabId, src, imageOver) {
        var tab = document.getElementById (tabId);
        this.tabs.push (tab);
        
        var handler = function (e) {
            that.switchTo (tab, src);
        };
        this.browser.registerListener (tab, "mouseover", handler, false);
        if (imageOver) {
            this.browser.registerListener (this.image, "mouseover", handler, false);
            
            var outHandler = function (e) {
                that.switchTo (document.getElementById (imageId + "_defaultRollover"), defaultSrc);
            };
            this.browser.registerListener (this.image, "mouseout", outHandler, false);
        }
    }
    
    this.switchTo = function (tab, src) {
        this.image.src = src;
        for (var i = 0; i < this.tabs.length; ++i) {
            this.tabs[i].className = "rollover";
        }
        tab.className = "rollover_selected";
    }
    
}

// --- Image page

imagePagePopups = [ "imageInfo", "imageExif", "imageMap", "tool-column" ];
imagePageCurrentPopup = "imageInfo";
imagePageButtons = true;

imagePageShowPopup = function (id) {
    if (imagePageCurrentPopup == id) {
        if (imagePageCurrentPopup != null) {
            document.getElementById (imagePageCurrentPopup).style.display = "none";
        }
        imagePageCurrentPopup = null;
    } else {
        for (var i = 0; i < imagePagePopups.length; ++i) {
            document.getElementById (imagePagePopups[i]).style.display = "none";
        }
        if (id != null) {
            document.getElementById (id).style.display = "block";
        }
        if (id == "imageMap") {
            document.getElementById ("imageMapMap").mmap.onResize ();
            document.getElementById ("imageMapMap").mmap.zoomToFit ();
        }
        imagePageCurrentPopup = id;
    }
}

monochromeImagePageInit = function () {
    addImagePageLayout ();
}

monochromeImagePageToggleButtons = function () {
    return false;
}

monochromeImagePageInfoButton = function () {
    imagePageShowPopup ("imageInfo");    
}

monochromeImagePageMapButton = function () {
    imagePageShowPopup ("imageMap");    
}

monochromeImagePageExifButton = function () {
    imagePageShowPopup ("imageExif");    
}

monochromeImagePageMoreButton = function () {
    imagePageShowPopup ("tool-column");    
}

monochromeMainColumnWidth = function () {
    var cWidth = window.innerWidth;
    if (cWidth > 600) {
        cWidth -= 211 + 4; // Max width of right column + 4px margin;
    }
    return cWidth;
}

monochromeAddClass = function (element, className) {
    var names = element.className != null ? element.className.toString ().split (/ +/) : [];
    if (names.indexOf (className) < 0) {
        names.push (className);
    }
    element.className = names.join (" ");
}

monochromeRemoveClass = function (element, className) {
    var names = element.className != null ? element.className.toString ().split (/ +/) : [];
    var idx = names.indexOf (className);
    if (idx >= 0) {
        names.splice (idx, 1);
    }
    element.className = names.join (" ");
}

monochromeHasClass = function (element, className) {
    var names = element.className != null ? element.className.toString ().split (/ +/) : [];
    var idx = names.indexOf (className);
    return idx >= 0;
}

onLoaded.push (monochromeOnDomReady);
if (document.readyState === "interactive" || document.readyState === "complete") {
    monochromeOnDomReady ();
} else {
    document.addEventListener ("DOMContentLoaded", monochromeOnDomReady, false);
}

if (self["monochromeLoaded"]) {
    monochromeOnLoad ();
} else {
    window.addEventListener ("load", monochromeOnLoad);
    window.addEventListener ("scroll", monochromeOnScroll);
}



monochrome.LazyLoader = function () {
    this.images = [];
    var imgNodes = document.getElementsByClassName ("lazy-img-load");
    for (var i = 0; i < imgNodes.length; ++i) {
        this.images.push (imgNodes[i]);
        this.resizePlaceholder (imgNodes[i]);        
    }
    
    var that = this;
    this.handler = function () {
        if (that.checkVisibility ()) {
            setTimeout (function () {
                    that.checkVisibility ();
                }, 100);
        }
    }
};

monochrome.LazyLoader.prototype = {
    resizePlaceholder : function (element) {
        var w = element.attributes["width"] != null ? parseInt (element.attributes["width"].value) : -1;
        var h = element.attributes["height"] != null ? parseInt (element.attributes["height"].value) : -1;
        
        if (w > 0 && h > 0) {
            var realW = element.offsetWidth;
            var realH = Math.round (realW * h / w);
            element.style.height = realH + "px";
        }
    },
    
    makeOnImgLoad : function (element) {
        return function () {
            element.style.height = "";
            element.style.opacity = 1.0;
        };      
    },
    
    isPending : function (element) {
        if (monochromeHasClass (element, "layout-pending")) {
            return true;
        }
        if (element.parentNode != null) {
            return this.isPending (element.parentNode);
        } else {
            return false;
        }
    },
    
    checkVisibility : function () {
        var w = 0;
        var viewportHeight = window.innerHeight;
        
        for (var i = 0; i < this.images.length; ++i) {
            var img = this.images[i];
            if (this.isPending (img)) {
                setTimeout (this.handler, 500);
                return false;
            }
        }
        for (var i = 0; i < this.images.length; ++i) {
            var img = this.images[i];
            var rect = img.getBoundingClientRect ();
            var visible = 
            (rect.bottom >= 0 && rect.bottom < viewportHeight) || 
            (rect.top >= 0 && rect.top < viewportHeight) ||
            (rect.top <= 0 && rect.bottom >= viewportHeight)
            ;
            if (visible) {
                img.addEventListener ("load", this.makeOnImgLoad (img));
                img.src = img.attributes["data-src"].value;                
            } else {
                this.resizePlaceholder (img);
                this.images[w] = img;
                ++w;
            }
        }
        if (w != this.images.length) {
            this.images = this.images.slice (0, w);
        }        
        return true;
    },
    
    getHandler : function () {
        return this.handler;
    }
};

// --- Add layout handlers for lazy-loaded images

onLoaded.push (function () {
        var lazyLoader = new monochrome.LazyLoader ();
        var handler = lazyLoader.getHandler ();
        
        onScroll.push (handler);
        onResized.push (handler);
        setTimeout (handler, 1);
    });


monochrome.Masonry = function (element) {
    monochromeAddClass (element, "layout-pending");
    this.container = element;
    this.container.style.position = "relative";
    this.tiles = this.container.getElementsByClassName ("image_list_row_image_div");
    this.innerContainer = this.container.getElementsByClassName ("image-list-row-inner")[0];
    this.innerContainer.style.position = "relative";
    this.innerContainer.style.margin = "0 auto";
    this.preserveOrder = (this.container.attributes["data-preserve-order"] != null && this.container.attributes["data-preserve-order"].value == "true");
    this.layoutState = 0;
    this.firstLayout = true;
    
    var images = this.container.getElementsByTagName ("img");
    var that = this;
    for (var i = 0; i < images.length; ++i) {
        images[i].addEventListener ("load", function (e) {
                that.layout ();
            });
    }
    
    for (var i = 0; i < this.tiles.length; ++i) {
        var tile = this.tiles[i];
        var colspan = 1;
        if (tile.attributes["data-colspan"] != null) {
            colspan = parseInt (tile.attributes["data-colspan"].value);
        }
        tile.monochromeMasonryColspan = colspan;
    }
};

monochrome.Masonry.prototype = {
    layout : function () {
        this.layoutState = 0;
        
        var cWidth = monochromeMainColumnWidth ();
        cWidth -= 32;
        this.tileWidth = 256;
        this.columnWidth = this.tileWidth + 16;
        
        this.columns = Math.round (cWidth / this.columnWidth);
        if (this.columns == 0) {
            this.columns = 1;
        }
        var sumOfColSpans = 0;
        for (var i = 0; i < this.tiles.length; ++i) {
            var tile = this.tiles[i];
            sumOfColSpans += tile.monochromeMasonryColspan;
        }
        if (this.columns > sumOfColSpans) {
            this.columns = sumOfColSpans;
        }
        this.columnWidth = Math.min (256 + 16, Math.floor (cWidth / this.columns));
        this.tileWidth = this.columnWidth - 16;
        
        for (var i = 0; i < this.tiles.length; ++i) {
            var tile = this.tiles[i];
            tile.style.position = "absolute";
            var colspan = Math.min (this.columns, tile.monochromeMasonryColspan);
            tile.style.width = (colspan - 1) * this.columnWidth + this.tileWidth + "px";
        }
        
        
        var that = this;
        this.layoutState = 1;
        setTimeout (function () {
                that.postLayout ();
            }, 0);
    },
    
    postLayout : function () {
        if (this.layoutState == 1) {
            var pos = [];
            for (var i = 0; i < this.columns; ++i) {
                pos.push (0);
            }
            
            for (var i = 0; i < this.tiles.length; ++i) {
                var column = 0;
                var tile = this.tiles[i];
                var colspan = Math.min (this.columns, tile.monochromeMasonryColspan);
                
                if (this.preserveOrder) {
                    column = i % this.columns;
                    
                    if (column > this.columns - colspan) {
                        column = 0;
                    }
                    
                    if (column == 0) {
                        var maxPos = pos[0];
                        for (var j = 0; j < this.columns; ++j) {
                            maxPos = Math.max (pos[j], maxPos);
                        }                
                        for (var j = 0; j < this.columns; ++j) {
                            pos[j] = maxPos;
                        }
                    }
                } else {
                    var maxOf = function (start, len) {
                        var m = pos[start];
                        for (var k = start + 1; k < start + len; ++k) {
                            if (pos[k] > m) {
                                m = pos[k];
                            }
                        }
                        return m;
                    };
                    var mpos = maxOf (0, colspan);
                    for (var j = 0; j <= this.columns - colspan; ++j) {
                        var cpos = maxOf (j, colspan);
                        if (cpos < mpos) {
                            column = j;
                            mpos = cpos;
                        }
                    }
                    for (var j = column; j < column + colspan; ++j) {
                        pos[j] = mpos;
                    }
                }
                
                var tile = this.tiles[i];
                tile.style.position = "absolute";
                tile.style.top = pos[column] + "px";
                tile.style.left = (column * this.columnWidth + 8) + "px";
                
                for (var j = column; j < column + colspan; ++j) {
                    pos[j] += tile.offsetHeight + 16;
                }
                
            }
            
            var maxPos = 0;
            for (var i = 0; i < this.columns; ++i) {
                maxPos = Math.max (pos[i], maxPos);
            }
            this.container.style.height = maxPos + "px";
            this.innerContainer.style.width = (this.columns * this.columnWidth) + "px";
            this.layoutState = 0;
            
            if (this.firstLayout) {
                var that = this;
                setTimeout (function () {
                        for (var i = 0; i < that.tiles.length; ++i) {
                            var tile = that.tiles[i];
                            tile.firstChild.style.width = "";
                            tile.firstChild.style.height = "";
                        }
                        setTimeout (function () {
                                monochromeRemoveClass (that.container, "layout-pending");
                                setTimeout (that.getHandler (), 500);
                            }, 1);
                    }, 1);
                this.firstLayout = false;
            }
        }
    },
    
    getHandler : function () {
        var that = this;
        return function () {
            that.layout ();
        };
    }
};


onDomReady.push (function () {
        var lists = document.getElementsByClassName ("image-list-row-outer");
        for (var i = 0; i < lists.length; ++i) {
            var m = new monochrome.Masonry (lists[i]);
            onResized.push (m.getHandler ());
            m.layout ();
        }
    });


// --- General iframe embedding layout (for Google Docs, for example)

monochrome.FixedAspectIframeLayout = function (iframeElement, width, height, fixedWidth, fixedHeight, margin) {
    this.iframeElement = iframeElement;
    this.fixedWidth = fixedWidth;
    this.fixedHeight = fixedHeight;
    this.width = width;
    this.height = height;
    this.margin = margin;
};

monochrome.FixedAspectIframeLayout.prototype = {
    layout : function () {
        var w = monochromeMainColumnWidth () - this.margin - this.fixedWidth;
        var h = Math.floor (this.height * w / this.width);
        
        var maxH = window.innerHeight - this.fixedHeight;
        if (h > maxH) {
            h = maxH;
            w = Math.floor (h * this.width / this.height);
        }
        
        w += this.fixedWidth;
        h += this.fixedHeight;
        this.iframeElement.style.width = (w) + "px";
        this.iframeElement.style.height = (h) + "px";
        this.iframeElement.width = w;
        this.iframeElement.height = h;
    },
    
    getHandler : function () {
        var that = this;
        return function () {
            that.layout ();
        };
    }
}

// --- Load

// --- Add layout handlers for embedded google docs in article text

onDomReady.push (function () {
        var elements = document.getElementsByClassName ("embed-google-docs-presentation");
        for (var i = 0; i < elements.length; ++i) {
            var m = new monochrome.FixedAspectIframeLayout (elements[i], 480, 360, 0, 29, 64);
            onResized.push (m.getHandler ());
            m.layout ();
        }
    });


monochrome.YouTubePlayerLayout = function (sizeElement, iframeElement, width, height, margin) {
    this.sizeElement = sizeElement;
    this.iframeElement = iframeElement;
    this.width = width;
    this.height = height;
    this.margin = margin;
};

monochrome.YouTubePlayerLayout.prototype = {
    layout : function () {
        var w = monochromeMainColumnWidth () - this.margin;
        var h = Math.floor (this.height * w / this.width);
        
        var maxH = window.innerHeight;
        if (h > maxH) {
            h = maxH;
            w = Math.floor (h * this.width / this.height);
        }
        
        if (this.sizeElement) {
            this.sizeElement.style.width = (w) + "px";
            this.sizeElement.style.height = (h) + "px";
        }
        this.iframeElement.style.width = (w) + "px";
        this.iframeElement.style.height = (h) + "px";
        this.iframeElement.width = w;
        this.iframeElement.height = h;
    },
    
    getHandler : function () {
        var that = this;
        return function () {
            that.layout ();
        };
    }
}

// --- Add layout handlers for youtube players in article text

onDomReady.push (function () {
        var elements = document.getElementsByClassName ("youtube");
        for (var i = 0; i < elements.length; ++i) {
            var iframes = elements[i].getElementsByClassName ("youtube-player");
            var m = new monochrome.YouTubePlayerLayout (elements[i], iframes[0], 16, 9, 64);
            onResized.push (m.getHandler ());
            m.layout ();
        }
    });

// --- Add layout handlers for youtube players on image page               
onDomReady.push (function () {
        var elements = document.getElementsByClassName ("big-image");
        for (var i = 0; i < elements.length; ++i) {
            var iframes = elements[i].getElementsByClassName ("youtube-player");
            if (iframes.length > 0) {
                var m = new monochrome.YouTubePlayerLayout (null, iframes[0], 16, 9, 1);
                onResized.push (m.getHandler ());
                m.layout ();
            }
            
        }
    });


// --- Add layout handlers for vimeo players in article text

onDomReady.push (function () {
        var elements = document.getElementsByClassName ("vimeo");
        for (var i = 0; i < elements.length; ++i) {
            var iframes = elements[i].getElementsByClassName ("vimeo-player");
            var m = new monochrome.YouTubePlayerLayout (elements[i], iframes[0], 16, 9, 64);
            onResized.push (m.getHandler ());
            m.layout ();
        }
    });

// --- Add layout handlers for vimeo players on image page               
onDomReady.push (function () {
        var elements = document.getElementsByClassName ("big-image");
        for (var i = 0; i < elements.length; ++i) {
            var iframes = elements[i].getElementsByClassName ("vimeo-player");
            if (iframes.length > 0) {
                var m = new monochrome.YouTubePlayerLayout (null, iframes[0], 16, 9, 1);
                onResized.push (m.getHandler ());
                m.layout ();
            }
            
        }
    });

var monochrome = monochrome || {};

monochrome.Future = function () {
    this.result = null;
    this.errorResult = null;
    this.completed = false;
    this.listeners = [];
}

monochrome.Future.prototype = {
    checkCompleted : function () {
        if (this.completed) {
            throw new Error ("Future already completed with " + result + "; " + errorResult);
        }
    },
    
    complete : function (result) {
        this.checkCompleted ();
        this.result = result;
        this.completed = true;
        this.fire ();
    },
    
    error : function (errorResult) {
        this.checkCompleted ();
        this.errorResult = errorResult;
        this.completed = true;
        this.fire ();
    },
    
    fire : function () {
        for (var i = 0; i < this.listeners.length; ++i) {
            this.listeners[i](this.result, this.errorResult);
        }
    },
    
    join : function (f) {
        if (this.completed) {
            f(this.result, this.errorResult);
        } else {
            this.listeners.push (f);
        }
        return this;
    }
};

monochrome.Future.allOf = function (futures) {
    var fd = {
        left : futures.length,
        future : new monochrome.Future ()
    };
    
    var decrementer = function () {
        fd.left--;
        if (fd.left == 0) {
            fd.future.complete ();
        }
    };
    
    for (var i = 0; i < futures.length; ++i) {
        futures[i].join (decrementer);
    }
    if (futures.length == 0) {
        fd.future.complete ();
    }
    return fd.future;
}

/**
 * @name MarkerManager v3
 * @version 1.0
 * @copyright (c) 2007 Google Inc.
 * @author Doug Ricket, Bjorn Brala (port to v3), others,
 *
 * @fileoverview Marker manager is an interface between the map and the user,
 * designed to manage adding and removing many points when the viewport changes.
 * <br /><br />
 * <b>How it Works</b>:<br/> 
 * The MarkerManager places its markers onto a grid, similar to the map tiles.
 * When the user moves the viewport, it computes which grid cells have
 * entered or left the viewport, and shows or hides all the markers in those
 * cells.
 * (If the users scrolls the viewport beyond the markers that are loaded,
 * no markers will be visible until the <code>EVENT_moveend</code> 
 * triggers an update.)
 * In practical consequences, this allows 10,000 markers to be distributed over
 * a large area, and as long as only 100-200 are visible in any given viewport,
 * the user will see good performance corresponding to the 100 visible markers,
 * rather than poor performance corresponding to the total 10,000 markers.
 * Note that some code is optimized for speed over space,
 * with the goal of accommodating thousands of markers.
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

/**
 * @name MarkerManagerOptions
 * @class This class represents optional arguments to the {@link MarkerManager}
 *     constructor.
 * @property {Number} maxZoom Sets the maximum zoom level monitored by a
 *     marker manager. If not given, the manager assumes the maximum map zoom
 *     level. This value is also used when markers are added to the manager
 *     without the optional {@link maxZoom} parameter.
 * @property {Number} borderPadding Specifies, in pixels, the extra padding
 *     outside the map's current viewport monitored by a manager. Markers that
 *     fall within this padding are added to the map, even if they are not fully
 *     visible.
 * @property {Boolean} trackMarkers=false Indicates whether or not a marker
 *     manager should track markers' movements. If you wish to move managed
 *     markers using the {@link setPoint}/{@link setLatLng} methods, 
 *     this option should be set to {@link true}.
 */

MarkerManagerLoader = function () {

/**
 * Creates a new MarkerManager that will show/hide markers on a map.
 *
 * Events:
 * @event changed (Parameters: shown bounds, shown markers) Notify listeners when the state of what is displayed changes.
 * @event loaded MarkerManager has succesfully been initialized.
 *
 * @constructor
 * @param {Map} map The map to manage.
 * @param {Object} opt_opts A container for optional arguments:
 *   {Number} maxZoom The maximum zoom level for which to create tiles.
 *   {Number} borderPadding The width in pixels beyond the map border,
 *                   where markers should be display.
 *   {Boolean} trackMarkers Whether or not this manager should track marker
 *                   movements.
 */
MarkerManager = function MarkerManager(map, opt_opts) {
  var me = this;
  me.map_ = map;
  me.mapZoom_ = map.getZoom();
  
  me.projectionHelper_ = new ProjectionHelperOverlay(map);
    me.initFuture = new monochrome.Future ();
  google.maps.event.addListener(me.projectionHelper_, 'ready', function () {
    me.initialize(map, opt_opts);
  });
    
}

MarkerManager.prototype.getInitFuture = function () {
    return this.initFuture;
}

MarkerManager.prototype.initialize = function (map, opt_opts) {
  var me = this;
  
  opt_opts = opt_opts || {};
  me.projection_ = me.projectionHelper_.getProjection();
  me.tileSize_ = MarkerManager.DEFAULT_TILE_SIZE_;

  var mapTypes = map.mapTypes;

  // Find max zoom level
  var mapMaxZoom = 1;
  for (var sType in mapTypes ) {
        try {
    if (typeof map.mapTypes.get(sType) === 'object' && typeof map.mapTypes.get(sType).maxZoom === 'number') {
      var mapTypeMaxZoom = map.mapTypes.get(sType).maxZoom;
      if (mapTypeMaxZoom > mapMaxZoom) {
        mapMaxZoom = mapTypeMaxZoom;
      }
    }
        } catch (e) {}
  }
  
  me.maxZoom_  = opt_opts.maxZoom || 19;

  me.trackMarkers_ = opt_opts.trackMarkers;
  me.show_ = opt_opts.show || true;

  var padding;
  if (typeof opt_opts.borderPadding === 'number') {
    padding = opt_opts.borderPadding;
  } else {
    padding = MarkerManager.DEFAULT_BORDER_PADDING_;
  }
  // The padding in pixels beyond the viewport, where we will pre-load markers.
  me.swPadding_ = new google.maps.Size(-padding, padding);
  me.nePadding_ = new google.maps.Size(padding, -padding);
  me.borderPadding_ = padding;

  me.gridWidth_ = {};

  me.grid_ = {};
  me.grid_[me.maxZoom_] = {};
  me.numMarkers_ = {};
  me.numMarkers_[me.maxZoom_] = 0;


  google.maps.event.addListener(map, 'dragend', function () {
    me.onMapMoveEnd_();
  });
  google.maps.event.addListener(map, 'zoom_changed', function () {
    me.onMapMoveEnd_();
  });



  /**
   * This closure provide easy access to the map.
   * They are used as callbacks, not as methods.
   * @param GMarker marker Marker to be removed from the map
   * @private
   */
  me.removeOverlay_ = function (marker) {
    marker.setMap(null);
    me.shownMarkers_--;
  };

  /**
   * This closure provide easy access to the map.
   * They are used as callbacks, not as methods.
   * @param GMarker marker Marker to be added to the map
   * @private
   */
  me.addOverlay_ = function (marker) {
    if (me.show_) {
      marker.setMap(me.map_);
      me.shownMarkers_++;
    }
  };

  me.resetManager_();
  me.shownMarkers_ = 0;

  me.shownBounds_ = me.getMapGridBounds_();
  
  google.maps.event.trigger(me, 'loaded');
  me.initFuture.complete ();
};

/**
 *  Default tile size used for deviding the map into a grid.
 */
MarkerManager.DEFAULT_TILE_SIZE_ = 1024;

/*
 *  How much extra space to show around the map border so
 *  dragging doesn't result in an empty place.
 */
MarkerManager.DEFAULT_BORDER_PADDING_ = 100;

/**
 *  Default tilesize of single tile world.
 */
MarkerManager.MERCATOR_ZOOM_LEVEL_ZERO_RANGE = 256;


/**
 * Initializes MarkerManager arrays for all zoom levels
 * Called by constructor and by clearAllMarkers
 */
MarkerManager.prototype.resetManager_ = function () {
  var mapWidth = MarkerManager.MERCATOR_ZOOM_LEVEL_ZERO_RANGE;
  for (var zoom = 0; zoom <= this.maxZoom_; ++zoom) {
    this.grid_[zoom] = {};
    this.numMarkers_[zoom] = 0;
    this.gridWidth_[zoom] = Math.ceil(mapWidth / this.tileSize_);
    mapWidth <<= 1;
  }

};

/**
 * Removes all markers in the manager, and
 * removes any visible markers from the map.
 */
MarkerManager.prototype.clearMarkers = function () {
  this.processAll_(this.shownBounds_, this.removeOverlay_);
  this.resetManager_();
};


/**
 * Gets the tile coordinate for a given latlng point.
 *
 * @param {LatLng} latlng The geographical point.
 * @param {Number} zoom The zoom level.
 * @param {google.maps.Size} padding The padding used to shift the pixel coordinate.
 *               Used for expanding a bounds to include an extra padding
 *               of pixels surrounding the bounds.
 * @return {GPoint} The point in tile coordinates.
 *
 */
MarkerManager.prototype.getTilePoint_ = function (latlng, zoom, padding) {

  var pixelPoint = this.projectionHelper_.LatLngToPixel(latlng, zoom);

  var point = new google.maps.Point(
    Math.floor((pixelPoint.x + padding.width) / this.tileSize_),
    Math.floor((pixelPoint.y + padding.height) / this.tileSize_)
  );

  return point;
};


/**
 * Finds the appropriate place to add the marker to the grid.
 * Optimized for speed; does not actually add the marker to the map.
 * Designed for batch-processing thousands of markers.
 *
 * @param {Marker} marker The marker to add.
 * @param {Number} minZoom The minimum zoom for displaying the marker.
 * @param {Number} maxZoom The maximum zoom for displaying the marker.
 */
MarkerManager.prototype.addMarkerBatch_ = function (marker, minZoom, maxZoom) {
  var me = this;

  var mPoint = marker.getPosition();
  marker.MarkerManager_minZoom = minZoom;
  
  
  // Tracking markers is expensive, so we do this only if the
  // user explicitly requested it when creating marker manager.
  if (this.trackMarkers_) {
    google.maps.event.addListener(marker, 'changed', function (a, b, c) {
      me.onMarkerMoved_(a, b, c);
    });
  }

  var gridPoint = this.getTilePoint_(mPoint, maxZoom, new google.maps.Size(0, 0, 0, 0));

  for (var zoom = maxZoom; zoom >= minZoom; zoom--) {
    var cell = this.getGridCellCreate_(gridPoint.x, gridPoint.y, zoom);
    cell.push(marker);

    gridPoint.x = gridPoint.x >> 1;
    gridPoint.y = gridPoint.y >> 1;
  }
};


/**
 * Returns whether or not the given point is visible in the shown bounds. This
 * is a helper method that takes care of the corner case, when shownBounds have
 * negative minX value.
 *
 * @param {Point} point a point on a grid.
 * @return {Boolean} Whether or not the given point is visible in the currently
 * shown bounds.
 */
MarkerManager.prototype.isGridPointVisible_ = function (point) {
  var vertical = this.shownBounds_.minY <= point.y &&
      point.y <= this.shownBounds_.maxY;
  var minX = this.shownBounds_.minX;
  var horizontal = minX <= point.x && point.x <= this.shownBounds_.maxX;
  if (!horizontal && minX < 0) {
    // Shifts the negative part of the rectangle. As point.x is always less
    // than grid width, only test shifted minX .. 0 part of the shown bounds.
    var width = this.gridWidth_[this.shownBounds_.z];
    horizontal = minX + width <= point.x && point.x <= width - 1;
  }
  return vertical && horizontal;
};


/**
 * Reacts to a notification from a marker that it has moved to a new location.
 * It scans the grid all all zoom levels and moves the marker from the old grid
 * location to a new grid location.
 *
 * @param {Marker} marker The marker that moved.
 * @param {LatLng} oldPoint The old position of the marker.
 * @param {LatLng} newPoint The new position of the marker.
 */
MarkerManager.prototype.onMarkerMoved_ = function (marker, oldPoint, newPoint) {
  // NOTE: We do not know the minimum or maximum zoom the marker was
  // added at, so we start at the absolute maximum. Whenever we successfully
  // remove a marker at a given zoom, we add it at the new grid coordinates.
  var zoom = this.maxZoom_;
  var changed = false;
  var oldGrid = this.getTilePoint_(oldPoint, zoom, new google.maps.Size(0, 0, 0, 0));
  var newGrid = this.getTilePoint_(newPoint, zoom, new google.maps.Size(0, 0, 0, 0));
  while (zoom >= 0 && (oldGrid.x !== newGrid.x || oldGrid.y !== newGrid.y)) {
    var cell = this.getGridCellNoCreate_(oldGrid.x, oldGrid.y, zoom);
    if (cell) {
      if (this.removeFromArray_(cell, marker)) {
        this.getGridCellCreate_(newGrid.x, newGrid.y, zoom).push(marker);
      }
    }
    // For the current zoom we also need to update the map. Markers that no
    // longer are visible are removed from the map. Markers that moved into
    // the shown bounds are added to the map. This also lets us keep the count
    // of visible markers up to date.
    if (zoom === this.mapZoom_) {
      if (this.isGridPointVisible_(oldGrid)) {
        if (!this.isGridPointVisible_(newGrid)) {
          this.removeOverlay_(marker);
          changed = true;
        }
      } else {
        if (this.isGridPointVisible_(newGrid)) {
          this.addOverlay_(marker);
          changed = true;
        }
      }
    }
    oldGrid.x = oldGrid.x >> 1;
    oldGrid.y = oldGrid.y >> 1;
    newGrid.x = newGrid.x >> 1;
    newGrid.y = newGrid.y >> 1;
    --zoom;
  }
  if (changed) {
    this.notifyListeners_();
  }
};


/**
 * Removes marker from the manager and from the map
 * (if it's currently visible).
 * @param {GMarker} marker The marker to delete.
 */
MarkerManager.prototype.removeMarker = function (marker) {
  var zoom = this.maxZoom_;
  var changed = false;
  var point = marker.getPosition();
  var grid = this.getTilePoint_(point, zoom, new google.maps.Size(0, 0, 0, 0));
  while (zoom >= 0) {
    var cell = this.getGridCellNoCreate_(grid.x, grid.y, zoom);

    if (cell) {
      this.removeFromArray_(cell, marker);
    }
    // For the current zoom we also need to update the map. Markers that no
    // longer are visible are removed from the map. This also lets us keep the count
    // of visible markers up to date.
    if (zoom === this.mapZoom_) {
      if (this.isGridPointVisible_(grid)) {
        this.removeOverlay_(marker);
        changed = true;
      }
    }
    grid.x = grid.x >> 1;
    grid.y = grid.y >> 1;
    --zoom;
  }
  if (changed) {
    this.notifyListeners_();
  }
  this.numMarkers_[marker.MarkerManager_minZoom]--;
};


/**
 * Add many markers at once.
 * Does not actually update the map, just the internal grid.
 *
 * @param {Array of Marker} markers The markers to add.
 * @param {Number} minZoom The minimum zoom level to display the markers.
 * @param {Number} opt_maxZoom The maximum zoom level to display the markers.
 */
MarkerManager.prototype.addMarkers = function (markers, minZoom, opt_maxZoom) {
  var maxZoom = this.getOptMaxZoom_(opt_maxZoom);
  for (var i = markers.length - 1; i >= 0; i--) {
    this.addMarkerBatch_(markers[i], minZoom, maxZoom);
  }

  this.numMarkers_[minZoom] += markers.length;
};


/**
 * Returns the value of the optional maximum zoom. This method is defined so
 * that we have just one place where optional maximum zoom is calculated.
 *
 * @param {Number} opt_maxZoom The optinal maximum zoom.
 * @return The maximum zoom.
 */
MarkerManager.prototype.getOptMaxZoom_ = function (opt_maxZoom) {
  return opt_maxZoom || this.maxZoom_;
};


/**
 * Calculates the total number of markers potentially visible at a given
 * zoom level.
 *
 * @param {Number} zoom The zoom level to check.
 */
MarkerManager.prototype.getMarkerCount = function (zoom) {
  var total = 0;
  for (var z = 0; z <= zoom; z++) {
    total += this.numMarkers_[z];
  }
  return total;
};

/** 
 * Returns a marker given latitude, longitude and zoom. If the marker does not 
 * exist, the method will return a new marker. If a new marker is created, 
 * it will NOT be added to the manager. 
 * 
 * @param {Number} lat - the latitude of a marker. 
 * @param {Number} lng - the longitude of a marker. 
 * @param {Number} zoom - the zoom level 
 * @return {GMarker} marker - the marker found at lat and lng 
 */ 
MarkerManager.prototype.getMarker = function (lat, lng, zoom) {
  var mPoint = new google.maps.LatLng(lat, lng); 
  var gridPoint = this.getTilePoint_(mPoint, zoom, new google.maps.Size(0, 0, 0, 0));

  var marker = new google.maps.Marker({position: mPoint}); 
    
  var cellArray = this.getGridCellNoCreate_(gridPoint.x, gridPoint.y, zoom);
  if (cellArray !== undefined) {
    for (var i = 0; i < cellArray.length; i++) 
    { 
      if (lat === cellArray[i].getLatLng().lat() && lng === cellArray[i].getLatLng().lng()) {
        marker = cellArray[i]; 
      } 
    } 
  } 
  return marker; 
}; 

/**
 * Add a single marker to the map.
 *
 * @param {Marker} marker The marker to add.
 * @param {Number} minZoom The minimum zoom level to display the marker.
 * @param {Number} opt_maxZoom The maximum zoom level to display the marker.
 */
MarkerManager.prototype.addMarker = function (marker, minZoom, opt_maxZoom) {
  var maxZoom = this.getOptMaxZoom_(opt_maxZoom);
  this.addMarkerBatch_(marker, minZoom, maxZoom);
  var gridPoint = this.getTilePoint_(marker.getPosition(), this.mapZoom_, new google.maps.Size(0, 0, 0, 0));
  if (this.isGridPointVisible_(gridPoint) &&
      minZoom <= this.shownBounds_.z &&
      this.shownBounds_.z <= maxZoom) {
    this.addOverlay_(marker);
    this.notifyListeners_();
  }
  this.numMarkers_[minZoom]++;
};


/**
 * Helper class to create a bounds of INT ranges.
 * @param bounds Array.<Object.<string, number>> Bounds object.
 * @constructor
 */
function GridBounds(bounds) {
  // [sw, ne]
  
  this.minX = Math.min(bounds[0].x, bounds[1].x);
  this.maxX = Math.max(bounds[0].x, bounds[1].x);
  this.minY = Math.min(bounds[0].y, bounds[1].y);
  this.maxY = Math.max(bounds[0].y, bounds[1].y);
      
}

/**
 * Returns true if this bounds equal the given bounds.
 * @param {GridBounds} gridBounds GridBounds The bounds to test.
 * @return {Boolean} This Bounds equals the given GridBounds.
 */
GridBounds.prototype.equals = function (gridBounds) {
  if (this.maxX === gridBounds.maxX && this.maxY === gridBounds.maxY && this.minX === gridBounds.minX && this.minY === gridBounds.minY) {
    return true;
  } else {
    return false;
  }  
};

/**
 * Returns true if this bounds (inclusively) contains the given point.
 * @param {Point} point  The point to test.
 * @return {Boolean} This Bounds contains the given Point.
 */
GridBounds.prototype.containsPoint = function (point) {
  var outer = this;
  return (outer.minX <= point.x && outer.maxX >= point.x && outer.minY <= point.y && outer.maxY >= point.y);
};

/**
 * Get a cell in the grid, creating it first if necessary.
 *
 * Optimization candidate
 *
 * @param {Number} x The x coordinate of the cell.
 * @param {Number} y The y coordinate of the cell.
 * @param {Number} z The z coordinate of the cell.
 * @return {Array} The cell in the array.
 */
MarkerManager.prototype.getGridCellCreate_ = function (x, y, z) {
  var grid = this.grid_[z];
  if (x < 0) {
    x += this.gridWidth_[z];
  }
  var gridCol = grid[x];
  if (!gridCol) {
    gridCol = grid[x] = [];
    return (gridCol[y] = []);
  }
  var gridCell = gridCol[y];
  if (!gridCell) {
    return (gridCol[y] = []);
  }
  return gridCell;
};


/**
 * Get a cell in the grid, returning undefined if it does not exist.
 *
 * NOTE: Optimized for speed -- otherwise could combine with getGridCellCreate_.
 *
 * @param {Number} x The x coordinate of the cell.
 * @param {Number} y The y coordinate of the cell.
 * @param {Number} z The z coordinate of the cell.
 * @return {Array} The cell in the array.
 */
MarkerManager.prototype.getGridCellNoCreate_ = function (x, y, z) {
  var grid = this.grid_[z];
  
  if (x < 0) {
    x += this.gridWidth_[z];
  }
  var gridCol = grid[x];
  return gridCol ? gridCol[y] : undefined;
};


/**
 * Turns at geographical bounds into a grid-space bounds.
 *
 * @param {LatLngBounds} bounds The geographical bounds.
 * @param {Number} zoom The zoom level of the bounds.
 * @param {google.maps.Size} swPadding The padding in pixels to extend beyond the
 * given bounds.
 * @param {google.maps.Size} nePadding The padding in pixels to extend beyond the
 * given bounds.
 * @return {GridBounds} The bounds in grid space.
 */
MarkerManager.prototype.getGridBounds_ = function (bounds, zoom, swPadding, nePadding) {
  zoom = Math.min(zoom, this.maxZoom_);

  var bl = bounds.getSouthWest();
  var tr = bounds.getNorthEast();
  var sw = this.getTilePoint_(bl, zoom, swPadding);

  var ne = this.getTilePoint_(tr, zoom, nePadding);
  var gw = this.gridWidth_[zoom];

  // Crossing the prime meridian requires correction of bounds.
  if (tr.lng() < bl.lng() || ne.x < sw.x) {
    sw.x -= gw;
  }
  if (ne.x - sw.x  + 1 >= gw) {
    // Computed grid bounds are larger than the world; truncate.
    sw.x = 0;
    ne.x = gw - 1;
  }

  var gridBounds = new GridBounds([sw, ne]);
  gridBounds.z = zoom;

  return gridBounds;
};


/**
 * Gets the grid-space bounds for the current map viewport.
 *
 * @return {Bounds} The bounds in grid space.
 */
MarkerManager.prototype.getMapGridBounds_ = function () {
  return this.getGridBounds_(this.map_.getBounds(), this.mapZoom_, this.swPadding_, this.nePadding_);
};


/**
 * Event listener for map:movend.
 * NOTE: Use a timeout so that the user is not blocked
 * from moving the map.
 *
 * Removed this because a a lack of a scopy override/callback function on events. 
 */
MarkerManager.prototype.onMapMoveEnd_ = function () {
  this.objectSetTimeout_(this, this.updateMarkers_, 0);
};


/**
 * Call a function or evaluate an expression after a specified number of
 * milliseconds.
 *
 * Equivalent to the standard window.setTimeout function, but the given
 * function executes as a method of this instance. So the function passed to
 * objectSetTimeout can contain references to this.
 *    objectSetTimeout(this, function () { alert(this.x) }, 1000);
 *
 * @param {Object} object  The target object.
 * @param {Function} command  The command to run.
 * @param {Number} milliseconds  The delay.
 * @return {Boolean}  Success.
 */
MarkerManager.prototype.objectSetTimeout_ = function (object, command, milliseconds) {
  return window.setTimeout(function () {
    command.call(object);
  }, milliseconds);
};


/**
 * Is this layer visible?
 *
 * Returns visibility setting
 *
 * @return {Boolean} Visible
 */
MarkerManager.prototype.visible = function () {
  return this.show_ ? true : false;
};


/**
 * Returns true if the manager is hidden.
 * Otherwise returns false.
 * @return {Boolean} Hidden
 */
MarkerManager.prototype.isHidden = function () {
  return !this.show_;
};


/**
 * Shows the manager if it's currently hidden.
 */
MarkerManager.prototype.show = function () {
  this.show_ = true;
  this.refresh();
};


/**
 * Hides the manager if it's currently visible
 */
MarkerManager.prototype.hide = function () {
  this.show_ = false;
  this.refresh();
};


/**
 * Toggles the visibility of the manager.
 */
MarkerManager.prototype.toggle = function () {
  this.show_ = !this.show_;
  this.refresh();
};


/**
 * Refresh forces the marker-manager into a good state.
 * <ol>
 *   <li>If never before initialized, shows all the markers.</li>
 *   <li>If previously initialized, removes and re-adds all markers.</li>
 * </ol>
 */
MarkerManager.prototype.refresh = function () {
  if (this.shownMarkers_ > 0) {
    this.processAll_(this.shownBounds_, this.removeOverlay_);
  }
  // An extra check on this.show_ to increase performance (no need to processAll_)
  if (this.show_) {
    this.processAll_(this.shownBounds_, this.addOverlay_);
  }
  this.notifyListeners_();
};


/**
 * After the viewport may have changed, add or remove markers as needed.
 */
MarkerManager.prototype.updateMarkers_ = function () {
  this.mapZoom_ = this.map_.getZoom();
  var newBounds = this.getMapGridBounds_();
    
  // If the move does not include new grid sections,
  // we have no work to do:
  if (newBounds.equals(this.shownBounds_) && newBounds.z === this.shownBounds_.z) {
    return;
  }

  if (newBounds.z !== this.shownBounds_.z) {
    this.processAll_(this.shownBounds_, this.removeOverlay_);
    if (this.show_) { // performance
      this.processAll_(newBounds, this.addOverlay_);
    }
  } else {
    // Remove markers:
    this.rectangleDiff_(this.shownBounds_, newBounds, this.removeCellMarkers_);

    // Add markers:
    if (this.show_) { // performance
      this.rectangleDiff_(newBounds, this.shownBounds_, this.addCellMarkers_);
    }
  }
  this.shownBounds_ = newBounds;

  this.notifyListeners_();
};


/**
 * Notify listeners when the state of what is displayed changes.
 */
MarkerManager.prototype.notifyListeners_ = function () {
  google.maps.event.trigger(this, 'changed', this.shownBounds_, this.shownMarkers_);
};


/**
 * Process all markers in the bounds provided, using a callback.
 *
 * @param {Bounds} bounds The bounds in grid space.
 * @param {Function} callback The function to call for each marker.
 */
MarkerManager.prototype.processAll_ = function (bounds, callback) {
  for (var x = bounds.minX; x <= bounds.maxX; x++) {
    for (var y = bounds.minY; y <= bounds.maxY; y++) {
      this.processCellMarkers_(x, y,  bounds.z, callback);
    }
  }
};


/**
 * Process all markers in the grid cell, using a callback.
 *
 * @param {Number} x The x coordinate of the cell.
 * @param {Number} y The y coordinate of the cell.
 * @param {Number} z The z coordinate of the cell.
 * @param {Function} callback The function to call for each marker.
 */
MarkerManager.prototype.processCellMarkers_ = function (x, y, z, callback) {
  var cell = this.getGridCellNoCreate_(x, y, z);
  if (cell) {
    for (var i = cell.length - 1; i >= 0; i--) {
      callback(cell[i]);
    }
  }
};


/**
 * Remove all markers in a grid cell.
 *
 * @param {Number} x The x coordinate of the cell.
 * @param {Number} y The y coordinate of the cell.
 * @param {Number} z The z coordinate of the cell.
 */
MarkerManager.prototype.removeCellMarkers_ = function (x, y, z) {
  this.processCellMarkers_(x, y, z, this.removeOverlay_);
};


/**
 * Add all markers in a grid cell.
 *
 * @param {Number} x The x coordinate of the cell.
 * @param {Number} y The y coordinate of the cell.
 * @param {Number} z The z coordinate of the cell.
 */
MarkerManager.prototype.addCellMarkers_ = function (x, y, z) {
  this.processCellMarkers_(x, y, z, this.addOverlay_);
};


/**
 * Use the rectangleDiffCoords_ function to process all grid cells
 * that are in bounds1 but not bounds2, using a callback, and using
 * the current MarkerManager object as the instance.
 *
 * Pass the z parameter to the callback in addition to x and y.
 *
 * @param {Bounds} bounds1 The bounds of all points we may process.
 * @param {Bounds} bounds2 The bounds of points to exclude.
 * @param {Function} callback The callback function to call
 *                   for each grid coordinate (x, y, z).
 */
MarkerManager.prototype.rectangleDiff_ = function (bounds1, bounds2, callback) {
  var me = this;
  me.rectangleDiffCoords_(bounds1, bounds2, function (x, y) {
    callback.apply(me, [x, y, bounds1.z]);
  });
};


/**
 * Calls the function for all points in bounds1, not in bounds2
 *
 * @param {Bounds} bounds1 The bounds of all points we may process.
 * @param {Bounds} bounds2 The bounds of points to exclude.
 * @param {Function} callback The callback function to call
 *                   for each grid coordinate.
 */
MarkerManager.prototype.rectangleDiffCoords_ = function (bounds1, bounds2, callback) {
  var minX1 = bounds1.minX;
  var minY1 = bounds1.minY;
  var maxX1 = bounds1.maxX;
  var maxY1 = bounds1.maxY;
  var minX2 = bounds2.minX;
  var minY2 = bounds2.minY;
  var maxX2 = bounds2.maxX;
  var maxY2 = bounds2.maxY;

  var x, y;
  for (x = minX1; x <= maxX1; x++) {  // All x in R1
    // All above:
    for (y = minY1; y <= maxY1 && y < minY2; y++) {  // y in R1 above R2
      callback(x, y);
    }
    // All below:
    for (y = Math.max(maxY2 + 1, minY1);  // y in R1 below R2
         y <= maxY1; y++) {
      callback(x, y);
    }
  }

  for (y = Math.max(minY1, minY2);
       y <= Math.min(maxY1, maxY2); y++) {  // All y in R2 and in R1
    // Strictly left:
    for (x = Math.min(maxX1 + 1, minX2) - 1;
         x >= minX1; x--) {  // x in R1 left of R2
      callback(x, y);
    }
    // Strictly right:
    for (x = Math.max(minX1, maxX2 + 1);  // x in R1 right of R2
         x <= maxX1; x++) {
      callback(x, y);
    }
  }
};


/**
 * Removes value from array. O(N).
 *
 * @param {Array} array  The array to modify.
 * @param {any} value  The value to remove.
 * @param {Boolean} opt_notype  Flag to disable type checking in equality.
 * @return {Number}  The number of instances of value that were removed.
 */
MarkerManager.prototype.removeFromArray_ = function (array, value, opt_notype) {
  var shift = 0;
  for (var i = 0; i < array.length; ++i) {
    if (array[i] === value || (opt_notype && array[i] === value)) {
      array.splice(i--, 1);
      shift++;
    }
  }
  return shift;
};







/**
*   Projection overlay helper. Helps in calculating
*   that markers get into the right grid.
*   @constructor
*   @param {Map} map The map to manage.
**/
ProjectionHelperOverlay = function ProjectionHelperOverlay(map) {
  
  this.setMap(map);

  var TILEFACTOR = 8;
  var TILESIDE = 1 << TILEFACTOR;
  var RADIUS = 7;

  this._map = map;
  this._zoom = -1;
  this._X0 =
  this._Y0 =
  this._X1 =
  this._Y1 = -1;

  
}
ProjectionHelperOverlay.prototype = new google.maps.OverlayView();

/**
 *  Helper function to convert Lng to X
 *  @private
 *  @param {float} lng
 **/
ProjectionHelperOverlay.prototype.LngToX_ = function (lng) {
  return (1 + lng / 180);
};

/**
 *  Helper function to convert Lat to Y
 *  @private
 *  @param {float} lat
 **/
ProjectionHelperOverlay.prototype.LatToY_ = function (lat) {
  var sinofphi = Math.sin(lat * Math.PI / 180);
  return (1 - 0.5 / Math.PI * Math.log((1 + sinofphi) / (1 - sinofphi)));
};

/**
*   Old school LatLngToPixel
*   @param {LatLng} latlng google.maps.LatLng object
*   @param {Number} zoom Zoom level
*   @return {position} {x: pixelPositionX, y: pixelPositionY}
**/
ProjectionHelperOverlay.prototype.LatLngToPixel = function (latlng, zoom) {
  var map = this._map;
  var div = map.getProjection().fromLatLngToPoint(latlng);
  var abs = {x: ~~(0.5 + this.LngToX_(latlng.lng()) * (2 << (zoom + 6))), y: ~~(0.5 + this.LatToY_(latlng.lat()) * (2 << (zoom + 6)))};
  return abs;
};


/**
 * Draw function only triggers a ready event for
 * MarkerManager to know projection can proceed to
 * initialize.
 */
ProjectionHelperOverlay.prototype.draw = function () {
  if (!this.ready) {
    this.ready = true;
    google.maps.event.trigger(this, 'ready');
  }
};
    };
var monochrome = monochrome || {};

ImageOverlayLoader = function () {
    
    monochrome.ImageOverlay = function (ptSw, ptNe, image, map, imageSize) {
        
        // Now initialize all properties.
        this.ptSw = ptSw;
        this.ptNe = ptNe;
        this.image_ = image;
        this.imageSize = imageSize;
        
        // We define a property to hold the image's
        // div. We'll actually create this div
        // upon receipt of the add() method so we'll
        // leave it null for now.
        this.div_ = null;
        
        // Explicitly call setMap() on this overlay
        this.setMap(map);
    }
    
    monochrome.ImageOverlay.prototype = new google.maps.OverlayView ();
    
    monochrome.ImageOverlay.prototype.onAdd = function() {
        
        // Note: an overlay's receipt of onAdd() indicates that
        // the map's panes are now available for attaching
        // the overlay to the map via the DOM.
        
        // Create the DIV and set some basic attributes.
        var div = document.createElement('div');
        div.style.border = "none";
        div.style.borderWidth = "0px";
        div.style.position = "absolute";
        
        // Create an IMG element and attach it to the DIV.
        var img = document.createElement("img");
        img.src = this.image_;
        img.style.width = "100%";
        img.style.height = "100%";
        this.imgElement = img;
        div.appendChild(img);
        
        // Set the overlay's div_ property to this DIV
        this.div_ = div;
        
        // We add an overlay to a map via one of the map's panes.
        // We'll add this overlay to the overlayImage pane.
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
    }
    
    monochrome.ImageOverlay.prototype.draw = function() {
        var div = this.div_;
        
        // Size and position the overlay. We use a southwest and northeast
        // position of the overlay to peg it to the correct position and size.
        // We need to retrieve the projection from this overlay to do this.
        var overlayProjection = this.getProjection();
        
        // Retrieve the southwest and northeast coordinates of this overlay
        // in latlngs and convert them to pixels coordinates.
        // We'll use these coordinates to resize the DIV.
        var sw = overlayProjection.fromLatLngToDivPixel(this.ptSw);
        var ne = overlayProjection.fromLatLngToDivPixel(this.ptNe);
        
        var dxO = ne.x - sw.x;
        var dyO = sw.y - ne.y;
        
        if (Math.abs (dxO) > 10000 || Math.abs (dyO) > 10000) {
            div.style.display = "none";
            return;
        }
        div.style.display = "block";
        
        var dxI = this.imageSize.width;
        var dyI = this.imageSize.height;
        
        var r = Math.atan2 (dyO, dxO) - Math.atan2 (dyI, dxI);
        
        var scale = Math.sqrt (dxO * dxO + dyO * dyO) / Math.sqrt (dxI * dxI + dyI * dyI);
        
        // Resize the image's DIV to fit the indicated dimensions.
        div.style.left = sw.x + 'px';
        div.style.top = (sw.y - (scale * this.imageSize.height)) + 'px';
        div.style.width = (scale * this.imageSize.width) + 'px';
        div.style.height = (scale * this.imageSize.height) + 'px';
        
        var transform = "rotate(" + (-r) + "rad)";
        
        div.style.WebkitTransform = transform;
        div.style.MozTransform = transform;
        div.style.transform = transform;
        
        var tOrigin = "0% 100%";
        div.style.transformOrigin = tOrigin;
        div.style.WebkitTransformOrigin = tOrigin;
        div.style.MozTransformOrigin = tOrigin;
    }
    
    monochrome.ImageOverlay.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
    
    monochrome.ImageOverlay.fromReferencePoints = function (map, srcImage, p0, p1, imageSize) {
        var xform = monochrome.ImageOverlay.createImageOverlayTransform (p0, p1, imageSize);
        var sw = xform.transform (0, imageSize.height);
        var ne = xform.transform (imageSize.width, 0);
        
        return new monochrome.ImageOverlay (sw, ne, srcImage, map, imageSize);
    }
    
    monochrome.ImageOverlay.createImageOverlayTransform = function  (p0, p1, image) {
        var lat0 = p0.lat;
        var lon0 = p0.lon;
        
        var lat1 = p1.lat;
        var lon1 = p1.lon;
        
        var width = image.width;
        var height = image.height;
        
        var dlat = lat1 - lat0;
        var dlon = lon1 - lon0;
        
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        
        if (Math.abs (dlat) < 0.0001 && Math.abs (dlon) < 0.0001) {
            throw new Error ("Real-world deltas must be greater than 0.0001.");
        }
        
        if (Math.abs (dx) < 1 && Math.abs (dy) < 1) {
            throw new Error ("Image deltas must be greater than 0.");
        }
        
        var avgLat = (lat0 + dlat / 2);
        
        var r = - (Math.atan2 (-dy, dx) - Math.atan2 (dlat, dlon * Math.cos (avgLat * Math.PI / 180)));
        
        
        var lonpp = undefined;
        if (Math.abs (dlon) > 0.0001) {
            lonpp = dlon / (Math.cos(r)*dx + Math.cos(r+Math.PI/2)*(-dy));
        }
        
        var latpp = undefined;
        if (Math.abs (dlat) > 0.0001) {
            latpp = dlat / (Math.sin(r)*dx + Math.sin(r+Math.PI/2)*(-dy));
        }
        
        if (latpp == undefined) {
            latpp = lonpp * Math.cos (avgLat * Math.PI / 180);
        }
        
        if (lonpp == undefined) {
            lonpp = latpp / Math.cos (avgLat * Math.PI / 180);
        }
        
        var xform = {
            r : r,
            latpp : latpp,
            lonpp : lonpp,
            
            transform : function (x, y) {
                var dxi = x - p0.x;
                var dyi = y - p0.y;
                return new google.maps.LatLng (
                    lat0 + Math.sin(r)*dxi * latpp + Math.sin(r+Math.PI/2)*(-dyi)*latpp,
                    lon0 + Math.cos(r)*dxi * lonpp + Math.cos(r+Math.PI/2)*(-dyi)*lonpp
                );
            }
        }
        return xform;
    };
}
var monochrome = monochrome || {};

var onResize = onResize || [];

monochrome.Map = function (element, rootPrefix) {
    this.element = element;
    this.rootPrefix = rootPrefix;
    element.mmap = this;
}

monochrome.Map.prototype = {
    addPlainTextMarker : function (lat, lon, minZoom, maxZoom, plainText) {
        var text = "<div style=\"text-align:center; margin: 0px; margin-right: 12px; padding:0px; overflow:auto;\">";
        text += "<p style=\"font-weight:bold;\">";
        text += plainText;
        text += "</p>";            
        text += "</div>";
        this.addMarker (lat, lon, minZoom, 21, text);
    },
    
    addTrackMarker : function (lat, lon, name, waypointName, description, mapLink) {
        var text = "<div style='overflow:auto; max-height:120px; padding-right:5pt; margin-right:12px;'>";
        {
            text += "<p style='margin-top:0px; padding-top:0px;'>";
            {
                if (name.length > 0) {
                    text += "<b>" + name + "</b>";
                }
                if (waypointName && waypointName.length > 0) {
                    text += "<br>" + waypointName + "";
                }
            }
            text += "</p>";
            
            if (description && description.length > 0) {
                text += "<p>";
                text += description;
                text += "</p>";
            }
            if (mapLink) {
                text += "<p><a href='/" + mapLink + ".kml'>View in Google Earth</a></p>";
            }
            
        }
        text += "</div>";
        this.addMarker (lat, lon, 0, undefined, text);
    },
    
    addMarker : function (lat, lon, minZoom, maxZoom, infoWindowContent) {
        var llp = new google.maps.LatLng (lat, lon);
        var marker = new google.maps.Marker ({
                title : name,
                position : llp
            });
        
        this.bounds.extend (llp);
        this.markerManager.addMarker (marker, minZoom, maxZoom);
        var that = this;
        if (infoWindowContent) {
            google.maps.event.addListener (marker, "click", function() {
                    that.openInfoWindow(marker, { content : infoWindowContent, maxWidth : 80 * that.element.offsetWidth / 100 });
                });
        }
        return marker;
    },
    
    setCenter : function (lat, lon, zoom) {
        this.gmap.setCenter (new google.maps.LatLng (lat, lon));
        this.gmap.setZoom (zoom);
    },
    
    initialize : function () {
        var mapOptions = {
            center: new google.maps.LatLng(0, 0),
            zoom: 1,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoomControl : true,
            scaleControl : true,
            panControl : true,
            mapTypeControl : true
        };
        this.gmap = new google.maps.Map (this.element, mapOptions);
        this.infoWindow = null;
        this.bounds = new google.maps.LatLngBounds ();
        
        var f = new monochrome.Future ();
        
        var that = this;
        var mapInit = function() {
            that.markerManager = new MarkerManager (that.gmap, { maxZoom : 21 });
            that.markerManager.getInitFuture ().join (function () {
                    onResize.push (function () {
                            that.onResize ();
                        });
                    f.complete ();
                });
        };
        google.maps.event.addListenerOnce (this.gmap, "bounds_changed", mapInit);
        return f;
    },
    
    onResize : function () {
        google.maps.event.trigger(this.gmap, "resize");
    },
    
    formatDistance : function (distanceInMeters) {
        if (distanceInMeters < 1200) {
            return Math.round (distanceInMeters) + "m";
        } else {
            distanceInMeters = Math.round (distanceInMeters / 100) / 10;
            return distanceInMeters + "km";
        }
    },
    
    formatDuration : function (durationInMillis) {
        durationInMillis = durationInMillis / 1000;
        var s = Math.floor (durationInMillis) % 60;
        durationInMillis = durationInMillis / 60;
        var m = Math.floor (durationInMillis) % 60;
        durationInMillis = durationInMillis / 60;
        var h = Math.floor (durationInMillis);
        
        var duration = s + "s";
        if (m > 0 || h > 0) {
            duration = m + "m" + (s < 10 ? "0" : "") + duration;
            if (h > 0) {
                duration = h + "h" + (m < 10 ? "0" : "") + duration;
            }
        }
        return duration;
    },
    
    pad : function (x, places) {
        var s = "" + x;
        while (s.length < places) {
            s = "0" + s;
        }
        return s;
    },
    
    formatTime : function  (base, offset) {
        if (base) {
            var d = new Date (base + offset);
            return d.getFullYear () + "-" + this.pad (d.getMonth () + 1, 2) + "-" + this.pad (d.getDate (), 2) + " " +
            this.pad (d.getHours (), 2) + ":" + this.pad (d.getMinutes (), 2) + ":" + this.pad (d.getSeconds (), 2);
        } else {
            return "";
        }
    },
    
    addTrack : function (track, name, description, mapLink) {
        var polyline = this.addPolyLine (track);
        
        var unit = track.distance < 1200 ? "m" : "km";
        var numVertices = track.line.length / 2;
        
        this.addTrackMarker (polyline.getPath ().getAt (0).lat (), polyline.getPath ().getAt (0).lng (), name, "Start - 0" + unit + " - 0s", description, mapLink);
        this.addTrackMarker (polyline.getPath ().getAt (numVertices - 1).lat (), polyline.getPath ().getAt (numVertices - 1).lng (), name, "End - " + this.formatDistance (track.distance[numVertices - 1]) + " - " + this.formatDuration (track.duration[numVertices - 1]), description, mapLink);
        var that = this;
        
        var llDist = function (lla, llb) {
            var dlat = lla.lat () - llb.lat ();
            var dlon = lla.lng () - llb.lng ();
            return Math.sqrt (dlat * dlat + dlon * dlon);
        };
        
        google.maps.event.addListener (polyline, "click", function (latLon) {
                var nearestVertex = 0;
                var nearestDistance = 6378137 * 4;
                for (var i = 1; i < numVertices; ++i) {
                    var d = llDist (polyline.getPath ().getAt (i), latLon.latLng);
                    if (d < nearestDistance) {
                        nearestDistance = d;
                        nearestVertex = i;
                    }
                }
                var p = polyline.getPath ().getAt (nearestVertex);
                var text = "<div style='overflow:auto; max-height:120px; padding-right:5pt; margin-right:12px;'>";
                text += "<p style='margin-top:0px; padding-top:0px;'>";
                {
                    if (name.length > 0) {
                        text += "<b>" + name + "</b>";
                    }
                    if (track.firstTimestamp) {
                        text += "<br><i>" + that.formatTime(track.firstTimestamp, track.duration[nearestVertex]) + "</i>";
                    }
                    var deltat = nearestVertex > 0 ? (track.duration[nearestVertex] - track.duration[nearestVertex - 1]) : 0;
                    var deltad = nearestVertex > 0 ? (track.distance[nearestVertex] - track.distance[nearestVertex - 1]) : 0;
                    text += "<br>" + that.formatDistance (track.distance[nearestVertex]) + " - " + that.formatDuration (track.duration[nearestVertex]);
                    if (deltat > 0 && deltad > 0) {
                        var mps = deltad / (deltat / 1000.0);
                        var kph = mps * 3600 / 100;
                        kph = Math.round (kph) / 10;
                        text += " - " + kph + " km/h";
                    }
                    text += "</p>";
                    if (description && description.length > 0) {
                        text += "<p>";
                        text += description;
                        text += "</p>";
                    }
                    if (mapLink) {
                        text += "<p><a href='/" + mapLink + ".kml'>View in Google Earth</a></p>";
                    }
                }
                text += "</p>";
                text += "</div>";
                that.openInfoWindow(undefined, { position : p, maxWidth : 90 * (that.element.offsetWidth - 64) / 100, content: text });
            });
        
        google.maps.event.addListener (polyline, "mouseover", function () {
                polyline.setOptions ({strokeOpacity: 0.75});
            });
        
        google.maps.event.addListener (polyline, "mouseout", function () {
                polyline.setOptions ({strokeOpacity: 0.5});
            });
        /*
                        
                entryMapAddMapTrackMarkers (polyline, mgr, '<xsl:value-of select="monochrome:toJSStringLiteral(@name)"/>', '<xsl:value-of select="monochrome:toJSStringLiteral($mapLink)"/>', '<xsl:value-of select="monochrome:toJSStringLiteral(.)"/>');
        */
    },
    
    addPolyLine : function (polyLine) {
        var llPoints = [];
        var line = polyLine.line;
        for (var i = 0; i < line.length; i += 2) {
            var llp = new google.maps.LatLng (line[i + 0], line[i + 1]);
            llPoints.push (llp);
            this.bounds.extend (llp);
        }
        
        var polyLine = new google.maps.Polyline({
                path: llPoints,
                strokeColor: polyLine.color,
                strokeOpacity: 0.5,
                strokeWeight: polyLine.width
            });
        
        polyLine.setMap (this.gmap);
        return polyLine;
    },
    
    closeInfoWindow : function () {
        if (this.infoWindow != null) {
            this.infoWindow.close ();
            this.infoWindow = null;
        }
    },
    
    openInfoWindow : function (marker, options) {
        if (this.infoWindow != null) {
            this.infoWindow.close ();
            this.infoWindow = null;
        }
        this.infoWindow = new google.maps.InfoWindow (options);
        this.infoWindow.open (this.gmap, marker);
    },
    
    addImageOverlayTransform : function (srcImage, imageSize, p0, p1) {
        var io = monochrome.ImageOverlay.fromReferencePoints (this.gmap, srcImage, p0, p1, imageSize);
        this.bounds.extend (io.ptSw);
        this.bounds.extend (io.ptNe);
    },
    
    addImageOverlay : function (srcImage, imageSize, sw, ne) {
        var overlay = new monochrome.ImageOverlay (sw, ne, srcImage, this.gmap, imageSize);
        this.bounds.extend (sw);
        this.bounds.extend (ne);
    },
    
    loadConfiguration : function (path, configId) {
        monochrome.Map.loadConfiguration (path, configId, this);
    },
    
    zoomToFit : function () {
        this.gmap.fitBounds (this.bounds);
        if (this.gmap.getZoom () > 15) {
            this.gmap.setZoom (15);
        }
    },
    
    addImageMarkers : function (markerData) {
        var markers = [];
        for (var i = 0; i < markerData.length; ++i) {
            var md = markerData[i];
            markers.push (this.entryMapCreateMarker (md));
            this.bounds.extend (new google.maps.LatLng (md.pos[0], md.pos[1]));
        }
        
        this.markerManager.addMarkers(markers, 16, 21);
        
        this.entryMapCreateAggregate (markerData, 15, 15, 15);
        this.entryMapCreateAggregate (markerData, 14, 14, 14);
        this.entryMapCreateAggregate (markerData, 12, 11, 13);
        this.entryMapCreateAggregate (markerData, 9, 8, 10);
        this.entryMapCreateAggregate (markerData, 8, 0, 8);
    },
    
    entryMapDistance : function (md1, md2) {
        return (
            Math.abs (md1.pos[0] - md2.pos[0]) +
            Math.abs (md1.pos[1] - md2.pos[1])
        );
    },
    
    ENTRY_MAP_BASE_THRESHOLD : 0.00008,
    
    entryMapMerge : function (md, markerData, _threshold) {
        var threshold = _threshold;
        if (!threshold) {
            threshold = ENTRY_MAP_BASE_THRESHOLD;
        }
        var merged = false;
        for (var i = 0; i < markerData.length; ++i) {
            var md2 = markerData[i];
            if (this.entryMapDistance (md, md2) < threshold) {
                md2.images = md2.images.concat (md.images);
                md2.index = md2.index.concat (md.index);
                md2.icons = md2.icons.concat (md.icons);
                md2.basePath = md2.basePath.concat (md.basePath);
                merged = true;
                break;
            }
        }
        if (!merged) {
            markerData.push ({
                    pos : md.pos,
                    images : md.images,
                    index : md.index,
                    icons : md.icons,
                    basePath : md.basePath
                });
        }
    },
    
    entryMapCreateMarker : function (md) {
        var icon = new google.maps.MarkerImage (this.rootPrefix + md.icons[0], new google.maps.Size (62, 62), new google.maps.Point (0, 0), new google.maps.Point (30, 61));
        var shadow = new google.maps.MarkerImage (md.images.length > 1 ? (this.rootPrefix + "/map-image-shadow-multiple.png") : (this.rootPrefix + "/map-image-shadow.png"),
            new google.maps.Size (120, 62), new google.maps.Point (0, 0), new google.maps.Point (30, 61));
        
        var shape = {
            coords : [ 4,4, 4,57, 26,57, 30,61, 34,57, 57,57, 57,4 ],
            type : "poly"
        }
        var that = this;
        
        var position = new google.maps.LatLng (md.pos[0], md.pos[1]);
        
        var marker = new google.maps.Marker({
                position : position,
                icon : icon,
                shadow : shadow,
                shape : shape});
        
        google.maps.event.addListener (marker, "click", function() {
                var text = '<div style="height: 196px; margin: 0px; margin-right: 12px; padding:0px; overflow-x:hidden; overflow-y: auto;">';
                for (var i = 0; i < md.images.length; ++i) {
                    text += '<table cellspacing="0" cellpadding="0" border="0" width="196" height="196"><tr><td style="text-align:center" valign="center"><a target="_parent" href="' + that.rootPrefix + md.basePath[i] + '.image.' + md.index[i] + '.html"><img class="thumbnail" src="';
                    text += that.rootPrefix + md.images[i];
                    text += '"/></a></td></tr></table>';            
                }
                text += '</div>';
                that.openInfoWindow(marker, { content : text, maxWidth : 240 });
            });
        return marker;
    },
    
    entryMapCreateAggregate : function (markerData, zoom, minZoom, maxZoom) {
        var aggregateMarkers = [];
        var newMarkerData = [];
        var threshold = this.ENTRY_MAP_BASE_THRESHOLD * (Math.pow (2, (17 - zoom)));
        for (var i = 0; i < markerData.length; ++i) {
            this.entryMapMerge (markerData[i], newMarkerData, threshold);
        }
        for (var i = 0; i < newMarkerData.length; ++i) {
            var md = newMarkerData[i];
            aggregateMarkers.push (this.entryMapCreateMarker (md));
        }
        this.markerManager.addMarkers (aggregateMarkers, minZoom, maxZoom);
    }
    
};

monochrome.Map.installFuture = new monochrome.Future ();

monochrome.Map.installed = function () {
    MarkerManagerLoader ();
    ImageOverlayLoader ();
    monochrome.Map.installFuture.complete ();
}

monochrome.Map.isInstalled = false;

monochrome.Map.install = function () {
    if (!monochrome.Map.isInstalled) {
        monochrome.Map.isInstalled = true;
        var s = document.createElement ("script");
        s.type = "text/javascript";
        s.defer = "defer";
        s.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyASYLNlVc9TNKsBN0u5XvviYpmw9NaEiAQ&sensor=false&callback=monochrome.Map.installed";
        document.body.appendChild (s);
    }
    return monochrome.Map.installFuture;
};

monochrome.Map.loadingConfigurations = {};

monochrome.Map.loadConfiguration = function (path, configId, mapInstance) {
    monochrome.Map.loadingConfigurations[configId] = mapInstance;
    
    var s = document.createElement ("script");
    s.type = "text/javascript";
    s.defer = "defer";
    s.src = path;
    document.body.appendChild (s);
}

monochrome.Map.loadedConfiguration = function (configId, configurator) {
    var map = monochrome.Map.loadingConfigurations[configId];
    configurator.configure (map);
    delete monochrome.Map.loadingConfigurations[configId];
    map.zoomToFit ();
}


