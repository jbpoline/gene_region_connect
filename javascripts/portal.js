

// NOTE you have to configure this!
var _pEXTERNAL_ASSETS = "http://www.brain-map.org/external_assets";
document.writeln("<script src='" + _pEXTERNAL_ASSETS + "/javascripts/appConfig.js'><\/script>");


//v1.7
// Flash Player Version Detection
// Detect Client Browser type
// Copyright 2005-2007 Adobe Systems Incorporated.  All rights reserved.
var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;

function ControlVersion()
{
	var version;
	var axo;
	var e;

	// NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry

	try {
		// version will be set for 7.X or greater players
		axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
		version = axo.GetVariable("$version");
	} catch (e) {
	}

	if (!version)
	{
		try {
			// version will be set for 6.X players only
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");

			// installed player is some revision of 6.0
			// GetVariable("$version") crashes for versions 6.0.22 through 6.0.29,
			// so we have to be careful.

			// default to the first public version
			version = "WIN 6,0,21,0";

			// throws if AllowScripAccess does not exist (introduced in 6.0r47)
			axo.AllowScriptAccess = "always";

			// safe to call for 6.0r47 or greater
			version = axo.GetVariable("$version");

		} catch (e) {
		}
	}

	if (!version)
	{
		try {
			// version will be set for 4.X or 5.X player
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
			version = axo.GetVariable("$version");
		} catch (e) {
		}
	}

	if (!version)
	{
		try {
			// version will be set for 3.X player
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
			version = "WIN 3,0,18,0";
		} catch (e) {
		}
	}

	if (!version)
	{
		try {
			// version will be set for 2.X player
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			version = "WIN 2,0,0,11";
		} catch (e) {
			version = -1;
		}
	}

	return version;
}

// JavaScript helper required to detect Flash Player PlugIn version information
function GetSwfVer(){
	// NS/Opera version >= 3 check for Flash plugin in plugin array
	var flashVer = -1;

	if (navigator.plugins != null && navigator.plugins.length > 0) {
		if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
			var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
			var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
			var descArray = flashDescription.split(" ");
			var tempArrayMajor = descArray[2].split(".");
			var versionMajor = tempArrayMajor[0];
			var versionMinor = tempArrayMajor[1];
			var versionRevision = descArray[3];
			if (versionRevision == "") {
				versionRevision = descArray[4];
			}
			if (versionRevision[0] == "d") {
				versionRevision = versionRevision.substring(1);
			} else if (versionRevision[0] == "r") {
				versionRevision = versionRevision.substring(1);
				if (versionRevision.indexOf("d") > 0) {
					versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
				}
			}
			var flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
		}
	}
	// MSN/WebTV 2.6 supports Flash 4
	else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
	// WebTV 2.5 supports Flash 3
	else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
	// older WebTV supports Flash 2
	else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
	else if ( isIE && isWin && !isOpera ) {
		flashVer = ControlVersion();
	}
	return flashVer;
}

// When called with reqMajorVer, reqMinorVer, reqRevision returns true if that version or greater is available
function DetectFlashVer(reqMajorVer, reqMinorVer, reqRevision)
{
	versionStr = GetSwfVer();
	if (versionStr == -1 ) {
		return false;
	} else if (versionStr != 0) {
		if(isIE && isWin && !isOpera) {
			// Given "WIN 2,0,0,11"
			tempArray         = versionStr.split(" "); 	// ["WIN", "2,0,0,11"]
			tempString        = tempArray[1];			// "2,0,0,11"
			versionArray      = tempString.split(",");	// ['2', '0', '0', '11']
		} else {
			versionArray      = versionStr.split(".");
		}
		var versionMajor      = versionArray[0];
		var versionMinor      = versionArray[1];
		var versionRevision   = versionArray[2];

        	// is the major.revision >= requested major.revision AND the minor version >= requested minor
		if (versionMajor > parseFloat(reqMajorVer)) {
			return true;
		} else if (versionMajor == parseFloat(reqMajorVer)) {
			if (versionMinor > parseFloat(reqMinorVer))
				return true;
			else if (versionMinor == parseFloat(reqMinorVer)) {
				if (versionRevision >= parseFloat(reqRevision))
					return true;
			}
		}
		return false;
	}
}
// END Flash Player Version Detection
/////////////////////////////////////

var _pBrowserSupport = {

  // initialize with an object containing keys & values for browser names & versions as in:
  // {webkit:'531.0', msie:'8.0', mozilla:'1.9.2'}
  //
  // this.supported means the current browser has version >= the minumum_list,
  // this.not_supported means the current browser is in the minumum_list and
  // has vesion less than that given.
  //
  // NOTE that both supported & not_supported may legitimately be false, if the
  // current browser is not in the list.
  initialize: function(minimum_list) {

    var userAgent = navigator.userAgent.toLowerCase();
    this.minimum_list = minimum_list ? minimum_list : {};

    this.version = (userAgent.match( /.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/ ) || [])[1];

    this.webkit = /webkit/.test( userAgent );
    this.opera = /opera/.test( userAgent );
    this.msie = /msie/.test( userAgent ) && !/opera/.test( userAgent );
    this.mozilla = /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent );
    this.chrome = /chrome/.test( userAgent );

    this.ie_compat_version = this.version;
    if(this.msie && /trident\/4/.test(userAgent)) 
	this.version = '8.0';
    else if(this.msie && /trident\/5/.test(userAgent)) 
	this.version = '9.0';

    this.extended_version = this._version_to_number(this.version);

    this.name = this.chrome ? 'chrome' : this.webkit ? 'webkit' : this.opera ? 'opera' : this.msie ? 'msie' : this.mozilla ? 'mozilla' : 'unknown';
    this.supported = this._is_supported(this.minimum_list);
    this.not_supported = this._is_not_supported(this.minimum_list);

    this.cookies = this._cookie_check();
    this.supported_flash = this._flash_check();
    this.flash_version = this._flash_version();
  },

  _is_not_supported: function(list) {

    for(var key in list) {
        if(key == this.name) {
            var supported_version = this._version_to_number(list[key]);

            if(supported_version.major > this.extended_version.major)
                return(true);

            if((supported_version.major == this.extended_version.major)
                &&
              (supported_version.minor > this.extended_version.minor))
                return(true);

            if((supported_version.major == this.extended_version.major)
                &&
              (supported_version.minor == this.extended_version.minor)
                &&
              (supported_version.build > this.extended_version.build))
                return(true);
        }
    }
    return(false);
  },

  _is_supported: function(list) {
    for(var key in list) {
        if(key == this.name) {
            var supported_version = this._version_to_number(list[key]);

            if((supported_version.major == this.extended_version.major)
                &&
              (supported_version.minor == this.extended_version.minor)
                &&
              (supported_version.build <= this.extended_version.build))
                return(true);

            if((supported_version.major == this.extended_version.major)
                &&
              (supported_version.minor <= this.extended_version.minor))
                return(true);

            if(supported_version.major <= this.extended_version.major)
                return(true);
        }
    }
    return(false);
  },

  _version_to_number: function(version) {

    var version_components = version ? version.split('.') : [0];
    var ret = {};

    ret.major = parseInt(version_components[0]);
    ret.minor = version_components.length > 1 ? parseInt(version_components[1]) : 0;
    ret.build = version_components.length > 2 ? parseInt(version_components[2]) : 0;
    return(ret);
  },

  _cookie_check:function() {

      var tmpcookie = new Date();
      var chkcookie = (tmpcookie.getTime() + '');
      document.cookie = "chkcookie=" + chkcookie + "; path=/";
      if (document.cookie.indexOf(chkcookie,0) < 0)
        return(false);

      return(true);
  },

  _flash_check:function() {

	if(!flashVersion || !flashVersion.length >= 3)
		return(false);

	if(!DetectFlashVer)
		return(false);

	return(DetectFlashVer(flashVersion[0], flashVersion[1], flashVersion[2]));
  },

  _flash_version: function() {

	if(!GetSwfVer)
	    return('unknown');

	return(GetSwfVer());
  }

};




function _pSiteWarning() {

        this.warn_box = null;
        this.warn_content = '';
	this.warning_present = false;

	this.show_flash_warning = function() {

		if(!_pBrowserSupport.supported_flash) {

			var flash_ver = flashVersion ? 'Flash version ' + flashVersion.join('.') + ' or higher' : 'A more recent version of Flash';
			var warn_list = document.getElementById('_pWarnList');

			if(warn_list) {
	    			var li = document.createElement('li');
	    			li.style.cssText = 'margin-left:22px;';
				li.innerHTML = flash_ver + " is required.";
	    			warn_list.appendChild(li);
			} else {
				var msg = "<br/>This site requires " + flash_ver;
				msg += "<br/>Some content may not function properly.";
				add_warning(msg);
			}
		}
	}

	this.show_stats = function() {
		
		var msg = "Browser name: " + _pBrowserSupport.name;
		msg += "<br/>Version: " + _pBrowserSupport.version;
		msg += "<br/>IE compat version: " + _pBrowserSupport.ie_compat_version;
		msg += "<br/>Cookies enabled: " + _pBrowserSupport.cookies;
		msg += "<br/>Flash version: " + _pBrowserSupport.flash_version;
		add_warning(msg);
	}


	var _self = this;

	function create_warning_box() {

	    _self.warn_box = document.createElement('div');
	    _self.warn_box.setAttribute('id', 'version_warning_container');
	    _self.warn_box.style.cssText = 'width:480px; height:74px; border:1px solid #f00; position:absolute; top:8px; left:260px;background-color:#fee;padding:6px;color:#c00';
	    document.body.appendChild(_self.warn_box);
	}

	function add_warning(msg) {

	    if(!_self.warn_box)
		create_warning_box();

	    // warn some other way?
	    if(!_self.warn_box)
                return;

	    _self.warn_content += msg;
	    _self.warn_box.innerHTML = _self.warn_content;
	}

	function show_warning(browser_info) {

		var msg = "Your web browser does not meet one or more of the system requirements for this site:<ul id='_pWarnList' style='padding:0px; margin:0px;'>";

		if(!browser_info.supported)
			msg += "<li style='margin-left:22px;'>Your browser version is not supported.</li>";
		if(!browser_info.cookies)
			msg += "<li style='margin-left:22px;'>Your browser is configured to not allow cookies.</li>";
		msg += "</ul>";

		if(!browser_info.supported || !browser_info.cookies) {

			// if the legacy warning is already present, hide it.
			var old_warn = document.getElementById('js_cookie_check');
			if(old_warn)
				old_warn.style.cssText = "display:none";

			msg += "<div style='margin-top:4px;'>To see the minimum requirements for this site click <a href='javascript:_pShowSysReqs();'>here</a>.</div>";
			_self.warning_present = true;
			add_warning(msg);
		}
	}

	function init() {

		_pBrowserSupport.initialize(_pSUPPORTED_BROWSERS);
		var url = document.URL;

		if(url.indexOf('show_browser_stats') >= 0)
			_self.show_stats();
		else		
			show_warning(_pBrowserSupport);
        }

        init();
}

var _pSiteWarnings = null;
function _pShowFlashWarning() {


	if(!_pSiteWarnings)
		_pSiteWarnings = new _pSiteWarning();

	if(_pSiteWarnings)
		_pSiteWarnings.show_flash_warning();
}

function _pShowSysReqs() {

	var reqs_win = window.open('', '_blank', 'width=460,height=400,status=0,scrollbars=0,titlebar=0,location=0');
	reqs_win.document.writeln("<script src='" + _pEXTERNAL_ASSETS + "/javascripts/browserVersions.js'><\/script>");
}

if(window.addEventListener)
    window.addEventListener('load', function() { if(!_pSiteWarnings) _pSiteWarnings = new _pSiteWarning(); }, false);
else if(window.attachEvent)
    window.attachEvent('onload', function() { if(!_pSiteWarnings) _pSiteWarnings = new _pSiteWarning(); });


/*
 * JavaScript used by the ABA Portal, includes an appended section from "anylinkmenu.js",
 * included here for ease of configuration. Part of the anylinkmenu code has been hacked
 * to allow different <a target> value to be used for each menu item. Search for 
 *  "getmenuHTML" to find hacked function. Search for "AnyLink JS Drop Down Menu" to find
 * the start of the appended section of anylinkmenu code.
 *
 * Configuration of the Portal app is done by setting values of the four arrays,
 * _pTabNames, _pTabLinks, _pMoreProjectsMenu, _pFooterLinks
 *
 * Note on IE browser support - needed to put in a hack in _pGetPosOffset() for IE versions > v5
 * browers. May need to tweak hack for future versions of IE.
 */

//********************************************
//******** define constants for site search ********
//********************************************
var _pSiteSearchUrl = "http://www.brain-map.org/search/index.html?query=";
var _pSiteSearchButton = "pSiteSearchButton";
var _pSiteSearchTextInput = "pSiteSearchTextInput";

//*****************************************************************
 //****** define all tab names, this determines            ********
 //****** what is displayed as tab text                    ********
 //****** (index is tab CSS ID)                            ********
 //****** Note: order of appearance of main menu items is  ********
 //****** determined in portalHeader.js                    ********
 //****************************************************************
var _pTabNames = new Object();
_pTabNames["pHome"]                  = "Home";
_pTabNames["pMouseBrain"]            = "Mouse Brain";
_pTabNames["pDevelopingMouseBrain"]  = "Developing Mouse Brain";
_pTabNames["pHuman"]                 = "Human Brain";
_pTabNames["pMouseConnectivity"]     = "Mouse Connectivity";
_pTabNames["pMoreProjects"]          = "More";
_pTabNames["pDevelopingHumanBrain"]  = "Developing Human Brain";    // drop down menu item tab
_pTabNames["pSleep"]                 = "Sleep";                     // drop down menu item tab
_pTabNames["pMouseDiversity"]        = "Mouse Diversity";           // drop down menu item tab
_pTabNames["pNonHumanPrimate"]       = "Non-Human Primate";         // drop down menu item tab
_pTabNames["pMouseSpinalCord"]       = "Mouse Spinal Cord";         // drop down menu item tab
_pTabNames["pGlioblastoma"]          = "Glioblastoma";              // drop down menu item tab


 //*************************************
 //****** define tab link urls  ********
 //****** (index is tab CSS ID) ********
 //*************************************
 var _pTabLinks = new Object();
 _pTabLinks["pHome"]                    = "http://www.brain-map.org/";
 _pTabLinks["pMouseBrain"]              = "http://mouse.brain-map.org/";
 _pTabLinks["pMouseSpinalCord"]         = "http://mousespinal.brain-map.org/";
 _pTabLinks["pDevelopingMouseBrain"]    = "http://developingmouse.brain-map.org/";
 _pTabLinks["pHuman"]                   = "http://human.brain-map.org/";
 _pTabLinks["pDevelopingHumanBrain"]    = "http://www.brainspan.org/";
 _pTabLinks["pMoreProjects"]            = "http://www.brain-map.org/";
 _pTabLinks["pSleep"]                   = "http://sleep.alleninstitute.org/";
 _pTabLinks["pMouseConnectivity"]       = "http://connectivity.brain-map.org/";
 _pTabLinks["pMouseDiversity"]          = "http://mousediversity.alleninstitute.org/";
 _pTabLinks["pNonHumanPrimate"]         = "http://www.blueprintnhpatlas.org/";
 _pTabLinks["pGlioblastoma"]            = "http://glioblastoma.alleninstitute.org/";

 //**************************************************************************
 //****** define the "More Projects" drop down menu items and links  ********
 //****** 'items' property has array of values: name, link, target   ********
 //****** The 'target' value is optional, can be '_blank', '_self'   ********
 //**************************************************************************
var _pMoreProjectsMenu = {divclass:'pDropDownMenu', inlinestyle:'', linktarget:'_self'};
_pMoreProjectsMenu.items=[
  [_pTabNames["pDevelopingHumanBrain"], _pTabLinks["pDevelopingHumanBrain"], "_blank"],
  [_pTabNames["pGlioblastoma"], _pTabLinks["pGlioblastoma"]],
  [_pTabNames["pNonHumanPrimate"], _pTabLinks["pNonHumanPrimate"], "_blank"],
  [_pTabNames["pMouseSpinalCord"], _pTabLinks["pMouseSpinalCord"]],
  [_pTabNames["pMouseDiversity"], _pTabLinks["pMouseDiversity"]],
  [_pTabNames["pSleep"], _pTabLinks["pSleep"]]
];

 //****************************************
 //****** define the header links *********
 //****************************************
 var _pHeaderLinks = new Object();
 _pHeaderLinks["Publications"] = "http://alleninstitute.org/science/publications/index.html";
 _pHeaderLinks["ContactUs"] = "http://alleninstitute.org/contact_us/index.html";
 _pHeaderLinks["Help"] = "http://yahoo.com";

 //****************************************
 //****** define the footer links *********
 //****************************************
 var _pFooterLinks = new Object();
 _pFooterLinks["PrivacyPolicy"] = "http://www.alleninstitute.org/Media/policies/privacy_policy_content.html";
 _pFooterLinks["TermsOfUse"] = "http://www.alleninstitute.org/Media/policies/terms_of_use_content.html";
 _pFooterLinks["CitationPolicy"] = "http://www.alleninstitute.org/Media/policies/citation_policy_content.html";
 _pFooterLinks["About"] = "http://www.alleninstitute.org/about_us/overview.html";
 _pFooterLinks["ContactUs"] = "http://www.alleninstitute.org/contact_us/index.html";

/*
 * Checks to ensure global javascript vars _pImagePath, _pMoreProjectsId, _pTabId are defined,
 * then uses _pTabId to select the designated project tab.
 *
 * This function needs to be called directly from the host HTML page, in response to a JavaScript "onload"
 * event.
 *
 * Valid values of _pTabId are:
 *   pHome, pMouseBrain, pMouseSpinalCord, pDevelopingMouseBrain, pHumanBrain, pMoreProjects, pSleep, etc.
 */
function _pPortalOnLoad() {
    // ***** use javascript vars defined on main HTML page: _pTabId, _pMoreProjectsId, _pImagePath ********
    // ***** Note: pImagePath must end in a "/" ********

    var error;
    var theTab;

    // validate _pImagePath
    try {
        if (_pImagePath) {
            if (_pImagePath.charAt(_pImagePath.length-1) != "/") {throw "noSlash";}
        }
        else if (_pImagePath == undefined) {throw "undefined";}
        else if (_pImagePath == "") {throw "emptyString";}
    }
    catch(error) {
        if (error == "noSlash") {alert("Javascript var _pImagePath needs to be terminated with a '/'");}
        else if (error == "emptyString") {alert("Javascript var _pImagePath is an empty String");}
        else {alert("Javascript var _pImagePath is undeclared or undefined");}
        return;
    }

    // validate _pMoreProjectsId
    try {
        if (_pMoreProjectsId) {
            // do nothing, it has a value
        }
        else if (_pMoreProjectsId == undefined) {throw "undefined";}
        else if (_pMoreProjectsId == "") {throw "emptyString";}
     }
     catch(error) {
        if (error == "emptyString") {alert("Javascript var _pMoreProjectsId is an empty String");}
        else {alert("Javascript var _pMoreProjectsId is undeclared or undefined");}
        return;
     }

    // validate _pMoreProjectsId
    try {
        if (_pTabId) {
            var tabName = _pTabNames[_pTabId];
            theTab = _pSetSelectedTab(_pTabId, "pTabSelected", tabName);
            if (theTab == null) {throw "null";}
        }
        else if (_pTabId == undefined) {throw "undefined";}
        else if (_pTabId == "") {throw "emptyString";}
     }
     catch(error) {
        if (error == "null") {alert("Element for menu item _pTabId = " + _pTabId + " was not found in the DOM");}
        else if (error == "emptyString") {alert("Javascript var _pTabId is an empty String");}
        else {alert("_pTabId is undeclared or undefined");}
        return;
     }
}

/* swap the selected class for the unselected(default) class,
 * delete the hyperlink (since were are already at the link destination),
 * and restore the tab text by creating a new text node
 * Returns a reference to the tab Element; if the tag does not exist, it returns null
 */
function _pSetSelectedTab(tabId, selectedTabClass, tabName) {
    var tab = document.getElementById(tabId);
    if (tab !== null) {
      tab.className = selectedTabClass;
  
      // Selected tab's background image is set here
      tab.style.background = "url(" + _pImagePath + "tab_blue.gif)";
  
      /* if the tab is one of the primary menu items (except for "More"), then
       * remove the tab's <a href>; the selected tab should not have an active link
       * Note 1: the tab's name text is part of the tag node, so we have to replace the
       *         anchor node with a new text node
       * Note 2: "menuanchorclass" is defined by AnyLink JS Drop Down Menu v2.0
       */
      var anchorTags = tab.getElementsByTagName("a");
      if (anchorTags.length > 0) {
          if (anchorTags[0].className !== "menuanchorclass") {
          var newText = document.createTextNode(tabName);
          tab.replaceChild(newText, anchorTags[0]);
        }
      }
  
      // if the "More" tab has one of its menu items as the selected tab, we have to:
      // 1) insert an id (menuanchorid) into the <a> tag to ensure link style changes,
      // 2) swap the blue triangle with the white triangle
      if (tabId == _pMoreProjectsId) {
          if (anchorTags.length > 0) {
            anchorTags[0].setAttribute("id", "menuanchorlink");
          }
          var imgTags = tab.getElementsByTagName("img");
          if (imgTags.length > 0) {
              imgTags[0].setAttribute("src", _pImagePath + "arrow_on.gif");
          }
      }
    }
    
    return tab;
}

/* turn "More Projects" triangle green on mouseover */
function _pTriangleMouseOver() {
    if (document.images)
        document._pTriangle.src = _pImagePath + "arrow_over.gif";
}

/* restore "More Projects" triangle image on mouseout */
function _pTriangleMouseOut() {
    if (document.images) {
        if (_pTabId == _pMoreProjectsId) {
            // white triangle (tab selected)
            document._pTriangle.src = _pImagePath + "arrow_on.gif";
        }
        else {
            // blue triangle (tab unselected)
            document._pTriangle.src = _pImagePath + "arrow_off.gif";
        }
    }
}

/* build Site Search URL and open page */
function doSiteSearch() {
    var queryString;
    var searchInput = document.getElementById(_pSiteSearchTextInput);

    if (searchInput != null) {
        queryString = searchInput.value;
    }

    if ((queryString != null) && (queryString.length > 0)) {
        location.href = _pSiteSearchUrl + encodeURIComponent(queryString);
    }
    else {
        alert("Please specify one or more search terms.");
    }

}

/*********************************************************************************************************
** AnyLink JS Drop Down Menu v2.0- (c) Dynamic Drive DHTML code library: http://www.dynamicdrive.com
** Script Download/ instructions page: http://www.dynamicdrive.com/dynamicindex1/dropmenuindex.htm
** January 29th, 2009: Script Creation date

**May 22nd, 09': v2.1
	1) Automatically adds a "selectedanchor" CSS class to the currrently selected anchor link
	2) For image anchor links, the custom HTML attributes "data-image" and "data-overimage" can be inserted to set the anchor's default and over images.

**June 1st, 09': v2.2
	1) Script now runs automatically after DOM has loaded. anylinkmenu.init) can now be called in the HEAD section

**May 23rd, 10': v2.21: Fixes script not firing in IE when inside a frame page

**June 28th, 11': v2.3: Menu updated to work properly in popular mobile devices such as iPad/iPhone and Android tablets.

NOTE: AllenInstitute hack added to getmenuHTML (2011-08-10)
********************************************************************************************************/
if (typeof dd_domreadycheck=="undefined") //global variable to detect if DOM is ready
	var dd_domreadycheck=false

var anylinkmenu={

menusmap: {},
preloadimages: [],
effects: {delayhide: 200, shadow:{enabled:true, opacity:0.3, depth: [5, 5]}, fade:{enabled:true, duration:500}}, //customize menu effects

dimensions: {},
ismobile:navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i) != null, //boolean check for popular mobile browsers

getoffset:function(what, offsettype){
	return (what.offsetParent)? what[offsettype]+this.getoffset(what.offsetParent, offsettype) : what[offsettype]
},

getoffsetof:function(el){
	el._offsets={left:this.getoffset(el, "offsetLeft"), top:this.getoffset(el, "offsetTop"), h: el.offsetHeight}
},

getdimensions:function(menu){
	this.dimensions={anchorw:menu.anchorobj.offsetWidth, anchorh:menu.anchorobj.offsetHeight,
		docwidth:(window.innerWidth ||this.standardbody.clientWidth)-20,
		docheight:(window.innerHeight ||this.standardbody.clientHeight)-15,
		docscrollx:window.pageXOffset || this.standardbody.scrollLeft,
		docscrolly:window.pageYOffset || this.standardbody.scrollTop
	}
	if (!this.dimensions.dropmenuw){
		this.dimensions.dropmenuw=menu.dropmenu.offsetWidth
		this.dimensions.dropmenuh=menu.dropmenu.offsetHeight
	}
},

isContained:function(m, e){
	var e=window.event || e
	var c=e.relatedTarget || ((e.type=="mouseover")? e.fromElement : e.toElement)
	while (c && c!=m)try {c=c.parentNode} catch(e){c=m}
	if (c==m)
		return true
	else
		return false
},

setopacity:function(el, value){
	el.style.opacity=value
	if (typeof el.style.opacity!="string"){ //if it's not a string (ie: number instead), it means property not supported
		el.style.MozOpacity=value
		if (document.all && typeof el.style.filter=="string"){
			el.style.filter="progid:DXImageTransform.Microsoft.alpha(opacity="+ value*100 +")"
		}
	}
},

showmenu:function(menuid){
	var menu=anylinkmenu.menusmap[menuid]
	clearTimeout(menu.hidetimer)
	this.getoffsetof(menu.anchorobj)
	this.getdimensions(menu)
	var posx=menu.anchorobj._offsets.left + (menu.orientation=="lr"? this.dimensions.anchorw : 0) //base x pos
	var posy=menu.anchorobj._offsets.top+this.dimensions.anchorh - (menu.orientation=="lr"? this.dimensions.anchorh : 0)//base y pos
	if (posx+this.dimensions.dropmenuw+this.effects.shadow.depth[0]>this.dimensions.docscrollx+this.dimensions.docwidth){ //drop left instead?
		posx=posx-this.dimensions.dropmenuw + (menu.orientation=="lr"? -this.dimensions.anchorw : this.dimensions.anchorw)
	}
	if (posy+this.dimensions.dropmenuh>this.dimensions.docscrolly+this.dimensions.docheight){  //drop up instead?
		posy=Math.max(posy-this.dimensions.dropmenuh - (menu.orientation=="lr"? -this.dimensions.anchorh : this.dimensions.anchorh), this.dimensions.docscrolly) //position above anchor or window's top edge
	}
	if (this.effects.fade.enabled){
		this.setopacity(menu.dropmenu, 0) //set opacity to 0 so menu appears hidden initially
		if (this.effects.shadow.enabled)
			this.setopacity(menu.shadow, 0) //set opacity to 0 so shadow appears hidden initially
	}
	menu.dropmenu.setcss({left:posx+'px', top:posy+'px', visibility:'visible'})
	if (this.effects.shadow.enabled){
		//menu.shadow.setcss({width: menu.dropmenu.offsetWidth+"px", height:menu.dropmenu.offsetHeight+"px"})
		menu.shadow.setcss({left:posx+anylinkmenu.effects.shadow.depth[0]+'px', top:posy+anylinkmenu.effects.shadow.depth[1]+'px', visibility:'visible'})
	}
	if (this.effects.fade.enabled){
		clearInterval(menu.animatetimer)
		menu.curanimatedegree=0
		menu.starttime=new Date().getTime() //get time just before animation is run
		menu.animatetimer=setInterval(function(){anylinkmenu.revealmenu(menuid)}, 20)
	}
},

revealmenu:function(menuid){
	var menu=anylinkmenu.menusmap[menuid]
	var elapsed=new Date().getTime()-menu.starttime //get time animation has run
	if (elapsed<this.effects.fade.duration){
		this.setopacity(menu.dropmenu, menu.curanimatedegree)
		if (this.effects.shadow.enabled)
			this.setopacity(menu.shadow, menu.curanimatedegree*this.effects.shadow.opacity)
	}
	else{
		clearInterval(menu.animatetimer)
		this.setopacity(menu.dropmenu, 1)
		menu.dropmenu.style.filter=""
	}
	menu.curanimatedegree=(1-Math.cos((elapsed/this.effects.fade.duration)*Math.PI)) / 2
},

setcss:function(param){
	for (prop in param){
		this.style[prop]=param[prop]
	}
},

setcssclass:function(el, targetclass, action){
	var needle=new RegExp("(^|\\s+)"+targetclass+"($|\\s+)", "ig")
	if (action=="check")
		return needle.test(el.className)
	else if (action=="remove")
		el.className=el.className.replace(needle, "")
	else if (action=="add" && !needle.test(el.className))
		el.className+=" "+targetclass
},

hidemenu:function(menuid){
	var menu=anylinkmenu.menusmap[menuid]
	clearInterval(menu.animatetimer)
	menu.dropmenu.setcss({visibility:'hidden', left:0, top:0})
	menu.shadow.setcss({visibility:'hidden', left:0, top:0})
},

getElementsByClass:function(targetclass){
	if (document.querySelectorAll)
		return document.querySelectorAll("."+targetclass)
	else{
		var classnameRE=new RegExp("(^|\\s+)"+targetclass+"($|\\s+)", "i") //regular expression to screen for classname
		var pieces=[]
		var alltags=document.all? document.all : document.getElementsByTagName("*")
		for (var i=0; i<alltags.length; i++){
			if (typeof alltags[i].className=="string" && alltags[i].className.search(classnameRE)!=-1)
				pieces[pieces.length]=alltags[i]
		}
		return pieces
	}
},

addDiv:function(divid, divclass, inlinestyle){
	var el=document.createElement("div")
	if (divid)
		el.id=divid
	el.className=divclass
	if (inlinestyle!="" && typeof el.style.cssText=="string")
		el.style.cssText=inlinestyle
	else if (inlinestyle!="")
		el.setAttribute('style', inlinestyle)
	document.body.appendChild(el)
	return el
},

//!!! AllenInstitute hack added to allow individual <a target> attribute assignment for _blank, _self
getmenuHTML:function(menuobj){
	var menucontent=[];
	var frag="";
	var target = "";
	var arg2 = "";
	for (var i=0; i<menuobj.items.length; i++){
	  arg2 = menuobj.items[i][2];
	  if (arg2 == "_blank" || arg2 == "_self") {
	    target = arg2;
	  }
	  else {
	    target = menuobj.linktarget;
	  }
		frag+='<li><a href="' + menuobj.items[i][1] + '" target="' + target + '">' + menuobj.items[i][0] + '</a></li>\n';
		if (menuobj.items[i][2]=="efc" || i==menuobj.items.length-1){
			menucontent.push(frag);
			frag="";
		}
	}
	if (typeof menuobj.cols=="undefined")
		return '<ul>\n' + menucontent.join('') + '\n</ul>'
	else{
		frag=""
		for (var i=0; i<menucontent.length; i++){
			frag+='<div class="' + menuobj.cols.divclass + '" style="' + menuobj.cols.inlinestyle + '">\n<ul>\n' + menucontent[i] + '</ul>\n</div>\n'
		}
		return frag
	}
},

addEvent:function(targetarr, functionref, tasktype){
	if (targetarr.length>0){
		var target=targetarr.shift()
		if (target.addEventListener)
			target.addEventListener(tasktype, functionref, false)
		else if (target.attachEvent)
			target.attachEvent('on'+tasktype, function(){return functionref.call(target, window.event)})
		this.addEvent(targetarr, functionref, tasktype)
	}
},

domready:function(functionref){ //based on code from the jQuery library
	if (dd_domreadycheck){
		functionref()
		return
	}
	// Mozilla, Opera and webkit nightlies currently support this event
	if (document.addEventListener) {
		// Use the handy event callback
		document.addEventListener("DOMContentLoaded", function(){
			document.removeEventListener("DOMContentLoaded", arguments.callee, false )
			functionref();
			dd_domreadycheck=true
		}, false )
	}
	else if (document.attachEvent){
		// If IE and not an iframe
		// continually check to see if the document is ready
		if ( document.documentElement.doScroll && window == window.top) (function(){
			if (dd_domreadycheck) return
			try{
				// If IE is used, use the trick by Diego Perini
				// http://javascript.nwbox.com/IEContentLoaded/
				document.documentElement.doScroll("left")
			}catch(error){
				setTimeout( arguments.callee, 0)
				return;
			}
			//and execute any waiting functions
			functionref();
			dd_domreadycheck=true
		})();
	}
	if (document.attachEvent && parent.length>0) //account for page being in IFRAME, in which above doesn't fire in IE
		this.addEvent([window], function(){functionref()}, "load");
},

addState:function(anchorobj, state){
	if (anchorobj.getAttribute('data-image')){
		var imgobj=(anchorobj.tagName=="IMG")? anchorobj : anchorobj.getElementsByTagName('img')[0]
		if (imgobj){
			imgobj.src=(state=="add")? anchorobj.getAttribute('data-overimage') : anchorobj.getAttribute('data-image')
		}
	}
	else
		anylinkmenu.setcssclass(anchorobj, "selectedanchor", state)
},

addState:function(anchorobj, state){
	if (anchorobj.getAttribute('data-image')){
		var imgobj=(anchorobj.tagName=="IMG")? anchorobj : anchorobj.getElementsByTagName('img')[0]
		if (imgobj){
			imgobj.src=(state=="add")? anchorobj.getAttribute('data-overimage') : anchorobj.getAttribute('data-image')
		}
	}
	else
		anylinkmenu.setcssclass(anchorobj, "selectedanchor", state)
},

setupmenu:function(targetclass, anchorobj, pos){
	this.standardbody=(document.compatMode=="CSS1Compat")? document.documentElement : document.body
	var relattr=anchorobj.getAttribute("rel")
	dropmenuid=relattr.replace(/\[(\w+)\]/, '')
	var dropmenuvar=window[dropmenuid]
	var dropmenu=this.addDiv(null, dropmenuvar.divclass, dropmenuvar.inlinestyle) //create and add main sub menu DIV
	dropmenu.innerHTML=this.getmenuHTML(dropmenuvar)
	var menu=this.menusmap[targetclass+pos]={
		id: targetclass+pos,
		anchorobj: anchorobj,	
		dropmenu: dropmenu,
		revealtype: (relattr.length!=dropmenuid.length && RegExp.$1=="click") || anylinkmenu.ismobile ? "click" : "mouseover",
		orientation: anchorobj.getAttribute("rev")=="lr"? "lr" : "ud",
		shadow: this.addDiv(null, "anylinkshadow", null) //create and add corresponding shadow
	}
	menu.anchorobj._internalID=targetclass+pos
	menu.anchorobj._isanchor=true
	menu.dropmenu._internalID=targetclass+pos
	menu.shadow._internalID=targetclass+pos
	menu.dropmenu.setcss=this.setcss
	menu.shadow.setcss=this.setcss
	menu.shadow.setcss({width: menu.dropmenu.offsetWidth+"px", height:menu.dropmenu.offsetHeight+"px"})
	this.setopacity(menu.shadow, this.effects.shadow.opacity)
	this.addEvent([menu.anchorobj, menu.dropmenu, menu.shadow], function(e){ //MOUSEOVER event for anchor, dropmenu, shadow
		var menu=anylinkmenu.menusmap[this._internalID]
		if (this._isanchor && menu.revealtype=="mouseover" && !anylinkmenu.isContained(this, e)){ //event for anchor
			anylinkmenu.showmenu(menu.id)
			anylinkmenu.addState(this, "add")
		}
		else if (typeof this._isanchor=="undefined"){ //event for drop down menu and shadow
			clearTimeout(menu.hidetimer)
		}
	}, "mouseover")
	this.addEvent([menu.anchorobj, menu.dropmenu, menu.shadow], function(e){ //MOUSEOUT event for anchor, dropmenu, shadow
		if (!anylinkmenu.isContained(this, e)){
			var menu=anylinkmenu.menusmap[this._internalID]
			menu.hidetimer=setTimeout(function(){
				anylinkmenu.addState(menu.anchorobj, "remove")
				anylinkmenu.hidemenu(menu.id)
			}, anylinkmenu.effects.delayhide)
		}
	}, "mouseout")
	this.addEvent([menu.anchorobj, menu.dropmenu], function(e){ //CLICK event for anchor, dropmenu
		var menu=anylinkmenu.menusmap[this._internalID]
		if ( this._isanchor && menu.revealtype=="click"){
			if (menu.dropmenu.style.visibility=="visible")
				anylinkmenu.hidemenu(menu.id)
			else{
				anylinkmenu.addState(this, "add")
				anylinkmenu.showmenu(menu.id)
			}
			if (e.preventDefault)
				e.preventDefault()
			return false
		}
		else
			menu.hidetimer=setTimeout(function(){anylinkmenu.hidemenu(menu.id)}, anylinkmenu.effects.delayhide)
	}, "click")
},

init:function(targetclass){
	this.domready(function(){anylinkmenu.trueinit(targetclass)})
},

trueinit:function(targetclass){
	var anchors=this.getElementsByClass(targetclass)
	var preloadimages=this.preloadimages
	for (var i=0; i<anchors.length; i++){
		if (anchors[i].getAttribute('data-image')){ //preload anchor image?
			preloadimages[preloadimages.length]=new Image()
			preloadimages[preloadimages.length-1].src=anchors[i].getAttribute('data-image')
		}
		if (anchors[i].getAttribute('data-overimage')){ //preload anchor image?
			preloadimages[preloadimages.length]=new Image()
			preloadimages[preloadimages.length-1].src=anchors[i].getAttribute('data-overimage')
		}
		this.setupmenu(targetclass, anchors[i], i)
	}
}

}
