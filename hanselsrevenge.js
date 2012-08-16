/*
  CopyWrite 2012, Martin Murphy martin.murphy@whiteboard-it.com
  http://github.com/soitgoes/hanselsrevenge
  MIT License
  http://opensource.org/licenses/mit-license.php
*/

(function ($) {
  $.fn.hanselsRevenge = function (options) {
    var breadCrumbContainer = $(this);
    var historyStack = [];
    var historyHash = {};
    //options contain the cookie expiration if given etc.
    var cookieStack = $.cookie("hanselsrevenge::Stack");
    if (cookieStack) {
      historyStack = JSON.parse(cookieStack);
      for (var i = 0; i < historyStack.length; i++) {
        historyHash[historyStack[i].link] = null;
      }
    }
    var path = window.location.pathname;
    if (historyHash[path] !== null) {
      historyStack.push({ text: document.title, link: path });
    } else {
      var y = historyStack.length - 1;
      for (; y > 0 && historyStack[y].link != path; y--) {
        console.log(y);
      }
      historyStack = historyStack.slice(0, y + 1);
    }
    $.cookie("hanselsrevenge::Stack", JSON.stringify(historyStack));
    var maxLinks = 3;
    breadCrumbContainer.html("");
    historyStack = maxLinks > historyStack.length ? historyStack :  historyStack.slice(historyStack.length - maxLinks);
    for (var i = historyStack.length-1; i >=0; i--) {
      var item = historyStack.shift(); 
      (i == 0) ? breadCrumbContainer.append("<li>" + item.text + "</li>") : breadCrumbContainer.append("<li><a href='" + item.link + "'>" + item.text + "</a></li>");
    }
  };
})(jQuery);

$(function () {
  $(".breadcrumbs").hanselsRevenge();
})