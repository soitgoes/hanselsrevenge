/*
  CopyWrite 2012, Martin Murphy martin.murphy@whiteboard-it.com
  http://github.com/soitgoes/hanselsrevenge
  MIT License
  http://opensource.org/licenses/mit-license.php
*/
jQuery.extend( jQuery.fn, {
    // Name of our method & one argument (the parent selector)
    hasParent: function(p) {
        return $(p).find(this).length > 0;
    }
});

function BreadCrumbTrail(options){
  var defaultOptions = {
      breadCrumbSelector:".breadcrumbs",
      maxDepth: 5,
      inheritLandingCrumbs: true,
      cookieOptions: {},
      debug : false
    };
  this.options = $.extend(defaultOptions, options);
  this.trail = [];    
  this.links = {};
  
  this.push = function(crumb){
      if (this.links[crumb.link] !== true){
        this.trail.push(crumb);
        this.links[crumb.link] = true;
      }else{
        this.rewindToUrl(crumb.link);
      }
      if (this.trail.length > 3){
        //this.trail = this.trail.slice(0,3);
      }
  }
  this.pop = function(){
    var crumb = this.trail.pop();
    this.links[crumb.link] = undefined;
    return crumb;
  }
  this.init = function(trail){
    this.trail = trail;
    for (var i=0; i< trail.length; i++){
      this.links[trail[i].link] = true;
    }
  }
  
  this.rewindToUrl = function(relUrl){
    var y = this.trail.length - 1;
    for (; y >= 0 && this.trail[y].link != relUrl; y--) { }
    this.trail = y===0 ? [this.trail[0]] :  this.trail.slice(0, y + 1);    
  }
  
}
(function ($) {  
  $.fn.hanselsRevenge = function (options) {
    var breadCrumb = new BreadCrumbTrail(options);
    var bcContainer = $(options.breadCrumbSelector);
    var cookieKey = "hanselsrevenge";


    var log = function(mesg){
      if (console && console.log && options.debug){
        console.log(mesg);
      }
    }
    
    if (options.debug && bcContainer.length < 1){
      console.log("No breadcrumbs found for: " + options.breadCrumbSelector);
    }

    var getOrigin = function(absUrl){
      var originPattern = /(https?:\/\/.*?)(\/|$)/;
      var result = originPattern.exec(absUrl);
      if (result && result.length > 0){
        return result[1];
      }
      return "";
    }

    var getRelativeUrl = function(absUrl){
      var originPattern = /https?:\/\/.*?(\/.*?)($|\?|#)/;
      var result = originPattern.exec(absUrl);
      if (result){
        return result[1];
      }
       return "/";
    }
    $("a").click(function(){
      //external links clear the cookie
      if (this.href && (getOrigin(this.href) !== document.location.origin 
        || $(this).hasParent(options.resetContainer) 
        || (options.resetPattern !==undefined) ? this.href.match(options.resetPattern) : false)
      ){
        log("clearing breadcrumb trail");
        $.removeCookie(cookieKey, options.cookieOptions);      
      }
    })

    var val = $.cookie(cookieKey);
    if (val === null){
      if (options.inheritLandingCrumbs){
        //read the crumbs
        $("li a", bcContainer).each(function(){
          breadCrumb.push({link:getRelativeUrl(this.href), text: this.innerHTML});
        })
        var last = $("li:last-child", bcContainer);
        if (last){
          breadCrumb.push({link:document.location.pathname, text: last[0].innerHTML});
        }        
      }
    }else{
      breadCrumb.init(JSON.parse(val));
    }
    breadCrumb.push({link:document.location.pathname, text:document.title});
    if (breadCrumb.trail.length > 0){
      $.cookie(cookieKey, JSON.stringify(breadCrumb.trail), options.cookieOptions);
      if (bcContainer.length > 0){
        bcContainer.html("");
        var depth = breadCrumb.trail.length > options.maxDepth ? options.maxDepth  : breadCrumb.trail.length;
        for (var i = depth-1; i >= 0; i--) {
              var item =  breadCrumb.trail.shift();
              (i == 0) ? bcContainer.append("<li>" + item.text + "</li>") : bcContainer.append("<li><a href='" + item.link + "'>" + item.text + "</a></li>");
        }
      }            
    }
  };
})(jQuery);

var breadCrumbSelector = ".breadcrumbs";
$(breadCrumbSelector).ready(function(){
  /*initialize breadcrumbs with a default depth of 3 and inherit the crumbs on the page if there is no cookie*/
  //$(".breadcrumbs").hanselsRevenge(); 
  // cookieOptions:{path:"/"}
 // $.fn.hanselsRevenge({breadCrumbSelector:breadCrumbSelector, maxDepth: 5, inheritLandingCrumbs: true, resetContainer:$("#content"), resetPattern: /(.*?)bread(.*?)/ , debug:true})
  $.fn.hanselsRevenge({breadCrumbSelector:breadCrumbSelector, maxDepth: 5})
})