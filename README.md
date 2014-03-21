angular-markdown-editable
=========================

Markdown is awesome. ContentEditable is awesome. How about we display the parsed markdown, but let users edit the base markdown on focus?

### Usage

You'll need to use three directives to make full use of this module.

```ng-model``` is required, and ```contenteditable="true"``` should be there to activate both native contentEditable functionality as well as the additional ```contenteditable``` directive included in this module, which wires up ```ngModel``` to ```contenteditable``` changes.

Finally, add ```markdown-editable``` to have markdown parsed as html in non-focused states and parsed as text in focused states. A typical implementation looks like this:

```
<div id="markdown-area" ng-model="markdownText" markdown-editable contenteditable="true">{{ markdownText }}</div>
```

where ```$scope.markdownText = "# This is an h1. \n## This is an h2. \n- This is a line item\n- This is a second line item\n\nThis is a new paragraph\n\n# Another h1";```... or any valid markdown text that you like.

### Testing

1. Install dependencies with ```bower install``` and ```npm install```.
2. Make sure you have grunt-cli... ```npm install -g grunt-cli```.
3. Run tests with ```grunt test```.