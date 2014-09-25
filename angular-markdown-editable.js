//----------------------------------------------------------------------------------------------------------------------
// A directive for rendering markdown in AngularJS.
//
// Written by John Lindquist (original author). Modified by Jonathan Rowny (ngModel support).
// Adapted by Christopher S. Case
// Extended even further by Chris Esplin (@deltaepsilon)
//
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
    priority: 1,
    link:  function postLink(scope, element, attrs, model) {
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
        if (val) {
          htmlText = converter.makeHtml(val);
          element.html(htmlText);

          if(callPrettyPrint) {
            prettyPrint();
          } // end if
        }

      };

      if(attrs.ngModel) {
        model.$render = render;
        $timeout(render);
      } // end if

      //Support for contenteditable
      if(attrs.contenteditable === "true" && attrs.ngModel) {
        var LINEBREAK_REGEX = /\n/g,
          BR_REGEX = /<(br|p|div)(\/)?>/g,
          TAG_REGEX = /<.+?>/g,
          NBSP_REGEX = /&nbsp;/g,
          BLOCKQUOTE_REGEX = /&gt;/g,
          OPEN_TAG_REGEX = /```&lt;/g,
          OPEN_TAG_REVERSE_REGEX = /```\</g,
          OPEN_TAG_NEWLINE_REGEX = /```\n&lt;/g,
          OPEN_TAG_NEWLINE_REVERSE_REGEX = /```\n</g,
          TRIPLE_LINEBREAK_REGEX = /\n\n\n/g, // Make sure to scrub triple line breaks... they don't make much sense in MD.
          DOUBLE_SPACE_REGEX = /\s\s/g;

        element.on('focus', function () {
          var text = model.$viewValue;

          if (text) {
            text = text.replace(OPEN_TAG_REVERSE_REGEX, "```&lt;");
            text = text.replace(OPEN_TAG_NEWLINE_REVERSE_REGEX, "```\n&lt;");
            text = text.replace(LINEBREAK_REGEX, "<br/>");
            text = text.replace(DOUBLE_SPACE_REGEX, "&nbsp; ");

            element.html(text);
          }

        });

        element.on('blur', function () {
          var html = element.html();


          html = html.replace(BR_REGEX, "\n");
          html = html.replace(TAG_REGEX, "");
          html = html.replace(NBSP_REGEX, " ");
          html = html.replace(OPEN_TAG_REGEX, "```<");
          html = html.replace(OPEN_TAG_NEWLINE_REGEX, "```\n<");
          html = html.replace(BLOCKQUOTE_REGEX, ">");
          html = html.replace(TRIPLE_LINEBREAK_REGEX, "\n\n");

//          console.log('html', html);

          model.$setViewValue(html);

          $timeout(render);

        });
      }

      render();
    } // end link
  }
}); // end markdown directive

angular.module("angular-markdown-editable").directive('contenteditable', function($timeout) {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function postLink(scope, element, attrs, ctrl) {
      var maxLength = parseInt(attrs.ngMaxlength, 10);

      if (window.getSelection) {
        element.on('focus', function() {
          return $timeout(function() {
            var el, range, selection;
            selection = window.getSelection();
            range = document.createRange();
            el = element[0];

            if (el.firstChild) { // Empty elements will throw errors
              range.setStart(el.firstChild, 0);
              range.setEnd(el.lastChild, el.lastChild.length);
              selection.removeAllRanges();
              return selection.addRange(range);
            }

          });
        });
      }
      element.on('blur', function() {
        return scope.$apply(function() {
          var value = element.attr('value');

          if (value) {
            return ctrl.$setViewValue(value);
          } else {
            return ctrl.$setViewValue(element.text());
          }

        });
      });
      ctrl.$render = function() {
        return element.text(ctrl.$viewValue);
      };
      ctrl.$render();
      return element.on('keydown', function(e) {
        var del, el, esc, ret, tab;
        esc = e.which === 27;
        ret = e.which === 13;
        del = e.which === 8;
        tab = e.which === 9;
        el = angular.element(e.target);
        if (esc) {
          ctrl.$setViewValue(element.text());
          el.blur();
          return e.preventDefault();
        } else if (ret && attrs.oneLine) {
          return e.preventDefault();
        } else if (maxLength && el.text().length >= maxLength && !del && !tab) {
          return e.preventDefault();
        }
      });
    }
  }
});

//----------------------------------------------------------------------------------------------------------------------