/*
  CopyWrite 2012, Martin Murphy martin.murphy@whiteboard-it.com
  http://github.com/soitgoes/hanselsrevenge
  MIT License
  http://opensource.org/licenses/mit-license.php
*/
jQuery.extend( jQuery.fn, {
    // Name of our method & one argument (the parent selector)
    hasParent: function(p) {
        return jQuery(p).find(this).length > 0;
    }
});
var getRelativeUrl = function(absUrl){
  var originPattern = /https?:\/\/.*?(\/.*?)($|\?|#)/;
  var result = originPattern.exec(absUrl);
  if (result){
    return result[1];
  }
   return "/";
}
var getTitle = function(options){
  var retVal;
  if (document.title) {
    // Document title can infact contain JavaScript vulnerabilities,
    // therefore we convert the html to text through an element inorder not
    // to trigger the JavaScript.
    var title = $('<title>').text(document.title);
    retVal = title.get(0).innerHTML;
  }else{
    var path = document.location.pathname;
    if (path[path.length-1] === '/'){
      path = path.substring(0, path.length -1); //remove trailing slash
    }
    retVal = path.split('/').pop();
  
  }
  if (options.ellipsisLongCrumbs){
    if (retVal.length > 30){
      retVal = retVal.substring(0, 30) + "...";    
    }
  }
  return retVal;
}
function BreadCrumbTrail(options){
  var defaultOptions = {
      breadCrumbSelector: "",
      maxDepth: 5,
      ellipsisLongCrumbs:false, 
      inheritLandingCrumbs: true,
      allowURIQuery : false,
      cookieOptions: {
        path: "/"
      },
      debug: false,
      titleCallback: null

    };
  this.options = jQuery.extend(defaultOptions, options);
  this.trail = [];
  this.links = {};

  this.push = function(crumb){
      if (!this.links[crumb.link]){
        this.trail.push(crumb);
      }else{
        this.rewindToUrl(crumb.link);
        //rebuild if there is a change in title
        for (var i = 0 ; i < this.trail.length ; i++){
          if (this.trail[i].link === getRelativeUrl(document.location.href)){
            this.trail[i].text =  crumb.text;
          }
        }  
      }
      this.links[crumb.link] = crumb.text;  
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
      this.links[trail[i].link] = trail[i].text;
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
    var cookieKey = (options && options.cookieKey) ? options.cookieKey : "hanselsrevenge";
    // If the library is called by $.fn.hanselsRevenge, then the library
    // expects the option.breadCrumbSelector to be passed. Otherwise use the
    // standard $(selector).hanselsRevenge();
    if (!this.selector) {
      var bcContainer = $(options.breadCrumbSelector);
    }
    else {
      var bcContainer = this;
    }
    // $(window).resize(setTimeout(600, function() {
    //     ellipses1 = $(":nth-child(2)", bcContainer)
    //     if (ellipses1.length > 1){
    //       console.log("resize")
    //     }
    //     if ($("a:hidden", bcContainer).length >0) {ellipses1.show()} else {ellipses1.hide()}    
    // }))
    bcContainer.addClass("btn-group btn-breadcrumb");
    options = breadCrumb.options;

    if (options.minWidthHide){
      window.onresize = function(arg){
        var w = $(document).width();
        var minWidth = parseInt(options.minWidthHide);
        if (!minWidth){ console.error("Couldn't parse minWidthHide")}
        if (w <= minWidth){
          bcContainer.hide();
        }else{
          bcContainer.show();
        }
      }
    }
   
    var log = function(mesg) {
      if (options.debug && typeof console !== "undefined" && console.log) {
        console.log(mesg);
      }
    }

    if (options.debug && bcContainer.length < 1) {
      log("No breadcrumbs found for: " + options.breadCrumbSelector);
    }

    var getOrigin = function(absUrl){
      var originPattern = /(https?:\/\/.*?)(\/|$)/;
      var result = originPattern.exec(absUrl);
      if (result && result.length > 0){
        return result[1];
      }
      return "";
    }


    $("a").click(function(){
      //external links clear the cookie
      if (this.href && (getOrigin(this.href) !== document.location.protocol + "//" + document.location.host
        || $(this).hasParent(options.resetContainer) 
        || (options.resetPattern !==undefined) ? this.href.match(options.resetPattern) : false)
      ){
        log("clearing breadcrumb trail");
        $.removeCookie(cookieKey, options.cookieOptions);
      }
    })
   
    var val = $.cookie(cookieKey);
    if (!val){
      if (options.inheritLandingCrumbs){
        //read the crumbs
        $("a", bcContainer).each(function(){
          breadCrumb.push({link:getRelativeUrl(this.href), text: this.innerHTML});
        })
        var last = $("a:last-child", bcContainer);
        if (last){
          breadCrumb.push({link:document.location.pathname, text: last[0].innerHTML});
        }
      }else{
        breadCrumb.init(options.defaultTrail || []);
      }
    }else{
      try {
        breadCrumb.init(JSON.parse(val));    
      }catch (err){
        breadCrumb.init([]);
      }
    }
    path = document.location.pathname;
    if (options.allowURIQuery) {
     path += document.location.search + document.location.hash;
    }
    var titleFx = getTitle;
    if (typeof breadCrumb.options.titleCallback == "function") {
      titleFx = breadCrumb.options.titleCallback;
    }

    breadCrumb.push({link:path, text:titleFx(options)});
    if (breadCrumb.trail.length > 0){
      $.cookie(cookieKey, JSON.stringify(breadCrumb.trail), options.cookieOptions);
      if (bcContainer.length > 0){
        bcContainer.html("");
        var depth = breadCrumb.trail.length > options.maxDepth ? options.maxDepth  : breadCrumb.trail.length;
         var totalWidth = 0;
        for (var i = depth-1; i >= 0; i--) {
          var item =  breadCrumb.trail.pop();
          item.text = breadCrumb.links[item.link];
          var domEl = (i == 0) ? $("<a href='/' class='btn btn-default'><div>" + item.text + "</div></a>") : $("<a class='btn btn-default' href='" + item.link + "'><div>" + item.text + "</div></a>");   
          bcContainer.prepend(domEl);
          totalWidth += domEl.width();
          var containerWidth =bcContainer.parent().width();       
       }
      }
    }
  };
})(jQuery);
