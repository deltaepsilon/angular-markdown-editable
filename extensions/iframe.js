//
//  iframe support
//  <iframe src=""></iframe>
//


(function(){

  var iframe = function(converter) {
    return [
      { type: 'lang',
        regex: '(<|&lt;)iframe.+(<|&lt;)\\/iframe>',
        replace: function(match, name, uri) {
          return match.replace(/&lt;/g, "<");

        }
      }
    ];
  };

  // Client-side export
  if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.iframe = iframe; }
  // Server-side export
  if (typeof module !== 'undefined') module.exports = iframe;

}());
