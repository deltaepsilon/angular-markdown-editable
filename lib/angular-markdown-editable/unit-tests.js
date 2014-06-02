'use strict';

describe('Directive: markdownEditable', function () {
  var element,
    scope,
    timeout;

  beforeEach(module('angular-markdown-editable'));

  beforeEach(inject(function ($rootScope, $compile, $timeout) {
    timeout = $timeout;
    scope = $rootScope.$new();
    scope.markdownText = "# This is an h1. \n## This is an h2. \n- This is a line item\n- This is a second line item\n\nThis is a new paragraph\n\n# Another h1";
    element = angular.element('<div id="markdown-area" ng-model="markdownText" markdown-editable contenteditable="true">{{ markdownText }}</div>');
    element = $compile(element)(scope);
    scope.$digest();

  }));

  it('should do an initial parse to html', function () {
    expect(element.html().match(/thisisanh1/).length).toBe(1);
  });

  it('should parse to markdown on focus', function () {
    element.triggerHandler('focus');
    scope.$digest();

    expect(element.html().match(/# This is an h1/).length).toBe(1);
  });

  it('should parse back to markdown after a focus and a blur', function () {
    element.triggerHandler('focus');

    scope.$digest();

    element.triggerHandler('blur');
    timeout.flush();

    expect(element.html().match(/thisisanh1/).length).toBe(1);
  });

  it('should support model changes', function () {
    scope.markdownText = "# a lot simpler";

    scope.$digest();

    expect(element.html().match(/alotsimpler/).length).toBe(1);
  });

  it('should propagate changes made in the markdown state to the parsed html', function () {
    element.triggerHandler('focus');
    scope.$digest();

    element.text('# a lot simpler');
    scope.$digest();

    expect(element.html().match(/# a lot simpler/).length).toBe(1);

    element.triggerHandler('blur');
    timeout.flush();

    expect(element.html().match(/alotsimpler/).length).toBe(1);
    expect(scope.markdownText).toBe('# a lot simpler');
  });

  it('should respect crazy whitespace', function () {
    scope.markdownText = "&nbsp; &nbsp; This is a code block \n&nbsp; &nbsp; And so is this \n\nBut this is not a code block.";
    scope.$digest();

//    alert(element.html());
    expect(element.html().match('<p>&nbsp; &nbsp; This is a code block').length).toBe(1);

    element.triggerHandler('focus');
    timeout.flush();

    expect(element.html().match('<p>&nbsp; &nbsp; This is a code block').length).toBe(1);

    element.triggerHandler('blur');
    timeout.flush();

    expect(element.html().match('<pre><code>This is a code block').length).toBe(1);

  });

});