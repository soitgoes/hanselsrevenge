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
      cookieOptions: {}
    };
    options = $.extend(defaultOptions, options);
    var breadCrumbContainer = $(this);
    var historyStack = [];
    var historyHash = {};
    var key = "hanselsrevenge";
    //options contain the cookie expiration if given etc.
    var cookieStack = $.cookie(key);
    var path = window.location.pathname;
    var clearHistory = function () {
      $.removeCookie(key, options.cookieOptions);
    };
    //if the document.referrer does not match the window.location.domain then clear the history
    var originPattern= /(https?:\/\/.*?)(\/|$)/;
    var referrerOrigin= originPattern.exec(document.referrer)[1];
    if (window.location.origin !== referrerOrigin) {
      clearHistory();
    }

    if (cookieStack) {
      historyStack = JSON.parse(cookieStack);
      for (var i = 0; i < historyStack.length; i++) {
        historyHash[historyStack[i].link] = null;
      }
    } else {
      //if there is already content in the breadcrumb don't do anything just initialize with the information in the existing breadcrumb
      if (options.inheritLandingCrumbs) {
        var links = $("li a", breadCrumbContainer);
        links.each(function () {
          historyStack.push({ link: this.href, text: this.innerHTML });
        });
        historyStack.push({ text: document.title, link: path });
        $.cookie(key, JSON.stringify(historyStack), options.cookieOptions);
        return;
      }
    }

    if (historyHash[path] !== null) {
      historyStack.push({ text: document.title, link: path });
    } else {
      var y = historyStack.length - 1;
      for (; y > 0 && historyStack[y].link != path; y--) { }
      historyStack = historyStack.slice(0, y + 1);
    }
    $.cookie(key, JSON.stringify(historyStack), options.cookieOptions);

    breadCrumbContainer.html("");
    historyStack = options.maxDepth > historyStack.length ? historyStack : historyStack.slice(historyStack.length - options.maxDepth);
    for (var i = historyStack.length - 1; i >= 0; i--) {
      var item = historyStack.shift();
      (i == 0) ? breadCrumbContainer.append("<li>" + item.text + "</li>") : breadCrumbContainer.append("<li><a href='" + item.link + "'>" + item.text + "</a></li>");
    }
  };
})(jQuery);

$(function () {
  /*initialize breadcrumbs with a default depth of 3 and inherit the crumbs on the page if there is no cookie*/
  $(".breadcrumbs").hanselsRevenge({ maxDepth: 3, inheritLandingCrumbs: true }); 
})