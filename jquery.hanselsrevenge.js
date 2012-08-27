/*
  CopyWrite 2012, Martin Murphy martin.murphy@whiteboard-it.com
  http://github.com/soitgoes/hanselsrevenge
  MIT License
  http://opensource.org/licenses/mit-license.php
*/
jQuery.extend( jQuery.fn, {
    // Name of our method & one argument (the parent selector)
    hasParent: function(p) {
        // Returns a subset of items using jQuery.filter
        return this.filter(function(){
            // Return truthy/falsey based on presence in parent
            return $(p).find(this).length;
        });
    }
});

(function ($) {
  $.fn.hanselsRevenge = function (options) {
    var defaultOptions = {
      maxDepth: 5,
      inheritLandingCrumbs: true,
      cookieOptions: {},
      containerSelector:"html",
      debug : false
    };
    var containerClick = false;
    options = $.extend(defaultOptions, options);
    var debug = options.debug;
    //bind to the click event of selected paths and set up all the stack and cookies
    

    var breadCrumbContainer = $(this);
    var historyStack = [];
    var historyHash = {};
    var key = "hanselsrevenge";
    //options contain the cookie expiration if given etc.
    var clearHistory = function () {
      $.removeCookie(key, options.cookieOptions);
    };
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

    if (document.location.origin != getOrigin(document.referrer)){ //changing protocols or coming in from another site then the trial should be cleared.
      if (debug) {console.log("Origin change detected, clearing history");}
      clearHistory();
    }

    var rewindHistoryTo = function(relUrl){
        var y = historyStack.length - 1;
        for (; y >= 0 && historyStack[y].link != relUrl; y--) { }
        historyStack = y===0 ? [historyStack[0]] :  historyStack.slice(0, y + 1);
    };
    var getHistory = function(){
       var cookieStack = $.cookie(key);
      if (cookieStack){
        var stringToParse = cookieStack;
        historyStack =  JSON.parse(stringToParse);
        if (debug){
          console.log("JSON parse cookieStack", JSON.stringify(historyStack));  
        }
        //find the null entry in the history stack where the url matches
        for (var i = historyStack.length - 1; i >= 0; i--) {
            if (historyStack[i].text == null && historyStack[i].link ===document.location.pathname){
              historyStack[i].text = document.title;
            }
        }

        //rewind if necessary
        rewindHistoryTo(document.location.pathname);
 
        for (var i = 0; i < historyStack.length; i++){
          historyHash[historyStack[i].link] = null;
        }
        $.cookie(key, JSON.stringify(historyStack), options.cookieOptions); //ensure that the cookie is rewritten
      }
    }
   getHistory();
  

   
   
    //refactor so that all other links (that aren't a anchor jump to blow away the cache)
    var setupClicks  = function(aTag){      
         
       if (aTag.href && aTag.href.indexOf("#") !==0){ //jump to anchor not supported by design          
         //if a has a parent of the selector or is in the breadcrumb container do this
         if ($(aTag).hasParent(options.containerSelector) || $(aTag).hasParent(breadCrumbContainer.data('selector'))){
           containerClick = true;
           var origin = getOrigin(aTag.href);
           if (origin === document.location.origin){
             getHistory();  
            //record the link item to the cookie
              //rewind if page is higher in the stack.
              var relUrl = getRelativeUrl(aTag.href);
              if (historyHash[relUrl] !== null) {
                historyStack.push({ text: null, link: relUrl });
              } else {
                rewindHistoryTo(relUrl);
              }
             if (debug){
               console.log("Setting cookie", JSON.stringify(historyStack));
             }
             $.cookie(key, JSON.stringify(historyStack), options.cookieOptions);                    
           }else{        
              if (debug) {console.log("Leaving the site: " + aTag.href);}
              clearHistory(); //if you click a link which leaves the site then the history should start over.
           }
         }else{
            if (debug) {console.log("Clicking a non-tracked link: " + aTag.href);}
            clearHistory(); //All other link reset the breadcrumbs.           
         }        
       }
    };
    $("a").click(
      function(){ setupClicks(this)}
    ); //breadcrumb links get the actions
    
     //content selectors specified get the action.

    if (historyStack.length > 0){ //we have information
      //write breadcrumbs from cookie
      breadCrumbContainer.html("");
      //if (debug){ console.log("before maxDepth adjustment: ", JSON.stringify(historyStack)); }
      historyStack = (options.maxDepth >= historyStack.length) ? historyStack : historyStack.slice(historyStack.length - options.maxDepth);
      // if (debug) { console.log("after maxDepth adjustment: " , JSON.stringify(historyStack)); } 
      for (var i = historyStack.length - 1; i >= 0; i--) {
        var item = historyStack.shift();
        (i == 0) ? breadCrumbContainer.append("<li>" + item.text + "</li>") : breadCrumbContainer.append("<li><a href='" + item.link + "'>" + item.text + "</a></li>");
      }
    }else{
      if (options.inheritLandingCrumbs) {
          
          var links = $("li a", breadCrumbContainer);
          links.each(function () {
            historyStack.push({ link: this.href, text: this.innerHTML });
          });
          var path = document.location.pathname;
          historyStack.push({ text: document.title, link: path });
          if (debug)
          {
            console.log("Reading breadcrumbs off the page", JSON.stringify(historyStack));
          }
          //TODO:  Ensure that the historyStack never exceeds 50 items
          if (historyStack.length > 50) {
            historyStack = historyStack.slice(0, 50);
          }
          if (debug){
            console.log("Writing Cookie", JSON.stringify(historyStack));
          }
          $.cookie(key, JSON.stringify(historyStack), options.cookieOptions);
          return; //nothing to do after we record the stack on first hit           
      }
    }
  };
})(jQuery);

$(function () {
  /*initialize breadcrumbs with a default depth of 3 and inherit the crumbs on the page if there is no cookie*/
  //$(".breadcrumbs").hanselsRevenge(); 
  // cookieOptions:{path:"/"}
  $(".breadcrumbs").hanselsRevenge({ maxDepth: 5, inheritLandingCrumbs: true, containerSelector:"#content, #nav" , debug:true}); //example of other options.
})