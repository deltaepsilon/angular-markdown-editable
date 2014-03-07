//----------------------------------------------------------------------------------------------------------------------
// A directive for rendering markdown in AngularJS.
//
// Written by John Lindquist (original author). Modified by Jonathan Rowny (ngModel support).
// Adapted by Christopher S. Case
//
// Taken from: http://blog.angularjs.org/2012/05/custom-components-part-1.html
//
// @module angular.markdown.js
//----------------------------------------------------------------------------------------------------------------------

angular.module("angular-markdown-editable", []).directive('markdownEditable', function($timeout) {
  var converter = new Showdown.converter();

  return {
    restrict: 'A',
    require: '?ngModel',
    link:  function(scope, element, attrs, model)
    {
      // Check for extensions
      var extAttr = attrs.extensions;
      var callPrettyPrint = false;
      if(extAttr) {
        var extensions = [];

        // Convert the comma separated string into a list.
        extAttr.split(',').forEach(function(val)
        {
          // Strip any whitespace from the beginning or end.
          extensions.push(val.replace(/^\s+|\s+$/g, ''));
        });

        if(extensions.indexOf('prettify') >= 0)
        {
          callPrettyPrint = true;
        } // end if

        // Create a new converter.
        converter = new Showdown.converter({extensions: extensions});
      } // end if

      // Check for option to strip whitespace
      var stripWS = attrs.strip;
      if(String(stripWS).toLowerCase() == 'true') {
        stripWS = true;
      } else {
        stripWS = false;
      } // end if

      // Check for option to translate line breaks
      var lineBreaks = attrs.lineBreaks;
      if (String(lineBreaks).toLowerCase() == 'true') {
        lineBreaks = true;
      } else {
        lineBreaks = false;
      } // end if

      var render = function() {
        var htmlText = "";
        var val = "";

        // Check to see if we're using a model.
        if(attrs.ngModel) {
          if (model.$modelValue) {
            val = model.$modelValue;
          } // end if
        } else {
          val = element.text();
        } // end if

        if(stripWS) {
          val = val.replace(/^[ /t]+/g, '').replace(/\n[ /t]+/g, '\n');
        } // end stripWS

        if (lineBreaks) {
          val = val.replace(/&#10;/g, '\n');
        } // end lineBreaks

        // Compile the markdown, and set it.
        htmlText = converter.makeHtml(val);
        element.html(htmlText);

        if(callPrettyPrint) {
          prettyPrint();
        } // end if
      };

      if(attrs.ngModel) {
        scope.$watch(attrs.ngModel, render);
      } // end if

      //Support for contenteditable
      if(attrs.contenteditable === "true" && attrs.ngModel) {
        var LINEBREAK_REGEX = /\n/g,
          BR_REGEX = /<br(\/)?>/g,
          DIV_REGEX = /<div>/g,
          TAG_REGEX = /<.+?>/g,
          TRIPLE_LINEBREAK_REGEX = /\n\n\n/g; // Make sure to scrub triple line breaks... they don't make much sense in MD.

        element.on('focus', function () {
          var text = scope[attrs.ngModel];
          text = text.replace(LINEBREAK_REGEX, "<br/>");
          element.html(text);
        });

        element.on('blur', function () {
          var html = element.html();

          html = html.replace(BR_REGEX, "\n");
          html = html.replace(DIV_REGEX, "\n");
          html = html.replace(TAG_REGEX, "");
          html = html.replace(TRIPLE_LINEBREAK_REGEX, "\n\n");

          scope[attrs.ngModel] = html;
          model.$modelValue = html;
          model.$viewValue = html;

          $timeout(render);
        });
      }

      render();
    } // end link
  }
}); // end markdown directive

//----------------------------------------------------------------------------------------------------------------------