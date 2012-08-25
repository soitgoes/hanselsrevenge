/*
  CopyWrite 2012, Martin Murphy martin.murphy@whiteboard-it.com
  http://github.com/soitgoes/hanselsrevenge
  MIT License
  http://opensource.org/licenses/mit-license.php
*/


(function ($) {
  $.fn.hanselsRevenge = function (options) {
    var defaultOptions = {
      maxDepth: 5,
      inheritLandingCrumbs: true,
      cookieOptions: {},
      debug : false
    };
    options = $.extend(defaultOptions, options);
    var debug = options.debug;
    //bind to the click event of selected paths and set up all the stack and cookies
    if (!options.linkSelector && console && console.log)
    {
      console.log("Hansels Revenge: No linkSelector option provided")
      return;
    }

    var breadCrumbContainer = $(this);
    var historyStack = [];
    var historyHash = {};
    var key = "hanselsrevenge";
    //options contain the cookie expiration if given etc.
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
        for (var i = 0; i < historyStack.length; i++){
          historyHash[historyStack[i].link] = null;
        }
        $.cookie(key, JSON.stringify(historyStack), options.cookieOptions); //ensure that the cookie is rewritten
      }
    }
   getHistory();

    var clearHistory = function () {
      $.removeCookie(key, options.cookieOptions);
    };

    var getRelativeUrl = function(absUrl){
         var originPattern = /https?:\/\/.*?(\/.*?)($|\?|#)/;
           var result = originPattern.exec(absUrl);
           if (result){
            return result[1];
           }
           return "/";
    }

    var setupClicks  = function(aTag){      
       if (aTag.href && aTag.href.indexOf("#") !==0){ //jump to anchor not supported by design          
         getHistory();  
        //record the link item to the cookie
          //rewind if page is higher in the stack.
          var relUrl = getRelativeUrl(aTag.href);
          if (historyHash[relUrl] !== null) {
            historyStack.push({ text: null, link: relUrl });
          } else {
            var y = historyStack.length - 1;
            for (; y > 0 && historyStack[y].link != relUrl; y--) { }
            historyStack = historyStack.slice(0, y + 1);
          }
         if (debug){
           console.log("Setting cookie", JSON.stringify(historyStack));
         }
         $.cookie(key, JSON.stringify(historyStack), options.cookieOptions);         
       }
    };
    $("li a" ,breadCrumbContainer).click(
      function(){ setupClicks(this)}
    ); //breadcrumb links get the actions
    $(options.linkSelector).click(
      function(){ setupClicks(this)}
    );

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
  $(".breadcrumbs").hanselsRevenge({ maxDepth: 3, inheritLandingCrumbs: true, linkSelector:"#content a, #nav a" , debug:true}); //example of other options.
})