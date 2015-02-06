# Hansels Revenge (jquery.hanselsrevenge)

Hansel is a breadcrumb helper which operates in the true fashion of how the fairy tale intended and gives the user a history which does not require them to use their backbutton.

See a demo of how it works.  http://whiteboard-it.com/hanselsrevenge/default.htm

## Installation

Hansel's Revenge is now on bower

	bower install hanselsrevenge

Preferably, you would have a gulp package setup to minify and combine your javascript into a package.  However if you don't you can add the references manually.

Include the following script references

	<script src="bower_components/jquery/dist/jquery.js" type="text/javascript"></script>
	<script src="bower_components/bootstrap/dist/js/bootstrap.js"></script>
	<script src="bower_components/jquery.cookie/jquery.cookie.js" type="text/javascript"></script>
	<!--[if lt IE 9]>
	<script type="text/javascript" src="bower_components/json2/json2.js"></script>
	<![endif]-->
	<script src="jquery.hanselsrevenge.js" type="text/javascript"></script>
 


Have a Breadcrumb structure which resembles the following on the page.  
If inheritBreadCrumbs is set to true then this will default the breadCrumb trail to this path.
	
	<ul class="breadcrumbs"><li><a href="/path/to/landing/crumb">Home</a></li></ul>

That's it in order to get the default functionality.

If you would like to explore some of the other options available to hansels then have a look at the bottom of jquery.hanselsrevenge.js 

	var breadCrumbSelector = ".breadcrumbs";
	$(breadCrumbSelector).ready(function(){
	  $.fn.hanselsRevenge({breadCrumbSelector:breadCrumbSelector, maxDepth: 5, debug:false, cookieOptions:{path:"/"}})
	})
	

You can change the options available there or remove that section and make the call to hanselsRevenge on your page with whatever options you like.

* __maxDepth__ is the maximum displayed depth that a cookie path can go
* __inheritLandingCrumbs__ when true accepts the starting path implied by the unordered list that is on the page at load time.	When false if the current page is the landing page then it will begin the path there.
* __defaultTrail__ is an array with the default trail.  *only applies if inherit is false*
* __cookieOptions__ will accept any option that the $.cookie project can accept in their $.cookie options parameter.	For more information on this have a look at this project.	 https://github.com/carhartl/jquery-cookie/

## Support

* Tested and working in all modern browsers and IE 6+
* *if you don't care about supportting ie < 8 you can remove the json2 ref*

## Special Thanks To

* json2 by Douglas Crockford https://github.com/douglascrockford/JSON-js/
* jquery.cookie by Klaus Hartl https://github.com/carhartl/jquery-cookie


## MIT License

http://www.opensource.org/licenses/mit-license.php

## Author

Martin Murphy 
http://whiteboard-it.com