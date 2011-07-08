# Punch your project in the UI with tko.js

In its basic form tko.js is a jquery plugin that lets you glue html elements to a javascript model. The API is based on knockout.js but with a focus on binding elements to data while you continue using awesome frameworks you already love like backbone.js. To keep the separation of concerns clear tko.js uses a json like object syntax that maps elements to functions or getters/setters while keeping the actual code out of your html.

## Requirements

- [JQuery (tested on 1.6.1)](http://jquery.com/)
- [Underscore.js](http://documentcloud.github.com/underscore)

## Install

Tko.js is composed of several modules so you can pick and choose what parts you want to use. In a bare minimum setup you would include the following files at the top of you single page app:

- Requirements (JQuery and Underscore.js)
- tko-core

## Usage

You tell your html what data you want it to be wired to by using the data-bind attribute. The normal format is:

    <input id="basic" data-bind="handler: function, handler2: function2"> 
    <input id="complex" data-bind="handler@option: function#arg1[val]|arg2[val]"> 
    
After you have the bindings added to your html you call $(selector).tko(data) to initialize. And now an example.

#### HTML

    <div class="post">
      <h2 class="title" data-bind="text: title"></h2>
      <div class="content" data-bind="html: content"></div>
    </div>

#### Javascript

    var post = { title: 'hi', content: 'fubar' };
    $('.post').tko(post);

## Observables

The tko-observable module provides a simple tko.observable function that in turn returns a getter/setter function that tko.js will automatically subscribe to and keep your html in sync as soon as a change is made.

    var x = tko.observable('fubar');
    x(); // -> 'fubar'
    x('baz'); // -> 'baz'

## Observable Arrays

Also included with the tko-observable module is tko.observableArray. An observable array works the same as a normal observable but gives you the standard array functions plus the underscore array functions baked right in.

    var x = tko.observableArray([]);
    x(); // -> []
    x.push('fubar'); // -> 1
    x(); // -> ['fubar']

## Bindings

Bindings control the interaction between your html and your data.

### Todo

Details on what bindings are currently available and how to use them is coming soon.

## Adapters

To use tko.js with other micro frameworks you may want to extend the framework or tko.js itself to provide a seamless experience. This is done through adapters included after including tko-core.

### Backbone.js

The only adapter currently supported is for backbone.js. To use this adapter you simply include tko-backbone after including tko-core.

## Plugins

Extra features and binding handlers that don't belong in tko-core are added with plugins.

### Tko-Social

The tko-social plugin makes it easy to add twitter and facebook like buttons to your page. You use it like so:

#### HTML

    <div class='networks'>
      <p class='social twitter' data-bind="social@twitter: twitter#count[vertical]"></p>
      <p class='social facebook' data-bind="social@facebook: facebook#layout[box_count]"></p>
    </div>
    
#### Javascript

    var networks = {
      twitter: {
        text: 'This is awesome!',
        url: 'tkojs.com'
      },
      facebook: {
        api_id: 'xxxxxxxxxxxxx',
        href: 'tkojs.com'
      }
    };
    
    $('.networks').tko(networks);
    
## Note on Patches/Pull Requests

- Fork the project.
- Make your feature addition or bug fix.
- Add tests for it. This is important so I don't break it in a
  future version unintentionally.
- Commit, do not mess with rakefile, version, or history.
  (if you want to have your own version, that is fine but
   bump version in a commit by itself I can ignore when I pull)
- Send me a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2011 Cracker Snack Inc. See LICENSE for details.

