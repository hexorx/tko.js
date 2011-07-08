(function() {
  var tko, _base, _ref, _ref2;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  tko = this.tko;
  (_ref = tko.Backbone) != null ? _ref : tko.Backbone = {};
  (_ref2 = (_base = tko.Backbone).helpers) != null ? _ref2 : _base.helpers = {};
  tko.globalActivity = tko.observable(false);
  tko.globalActivityList = tko.observableArray([]);
  tko.globalActivityList.subscribe(__bind(function(value) {
    return tko.globalActivity(!_.isEmpty(value));
  }, this));
  tko.Backbone.View = (function() {
    __extends(View, Backbone.View);
    View.prototype.helpers = tko.Backbone.helpers;
    View.prototype.watch = {
      'model': 'change'
    };
    function View(options) {
      if (options == null) {
        options = {};
      }
      this.stopWatching = __bind(this.stopWatching, this);;
      this.startWatching = __bind(this.startWatching, this);;
      this.helper = __bind(this.helper, this);;
      this.observe = __bind(this.observe, this);;
      this.refresh = __bind(this.refresh, this);;
      this.render = __bind(this.render, this);;
      if (this.bindAll) {
        this.helpers.bind_all.call(this, this.bindAll);
      }
      View.__super__.constructor.call(this, options);
      this.startWatching();
    }
    View.prototype.render = function() {
      $(this.el).append(this.template);
      return this.observe(this.model, false);
    };
    View.prototype.setup = function() {};
    View.prototype.reload = function() {};
    View.prototype.refresh = function(model, reload) {
      if (reload == null) {
        reload = true;
      }
      this.observing = $(this.el).tko(this, 'model');
      if (reload) {
        _.defer(this.reload);
      }
      return this;
    };
    View.prototype.observe = function(model, reload) {
      if (reload == null) {
        reload = true;
      }
      if (!(this.model != null) || ((model != null) && model !== this.model)) {
        this.stopWatching();
        this.model = model;
        this.startWatching();
      }
      return this.refresh(this.model, reload);
    };
    View.prototype.helper = function() {
      var args, helper, _ref, _ref2;
      helper = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return (_ref = this.helpers) != null ? (_ref2 = _ref[helper]) != null ? typeof _ref2.apply == "function" ? _ref2.apply(this, args) : void 0 : void 0 : void 0;
    };
    View.prototype.startWatching = function() {
      var event, events, observed, _ref, _results;
      _ref = this.watch;
      _results = [];
      for (observed in _ref) {
        events = _ref[observed];
        _results.push((function() {
          var _i, _len, _ref, _ref2, _results;
          _ref = [].concat(events);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            event = _ref[_i];
            _results.push((_ref2 = _(this).follow(observed)) != null ? typeof _ref2.bind == "function" ? _ref2.bind(event, this.refresh) : void 0 : void 0);
          }
          return _results;
        }).call(this));
      }
      return _results;
    };
    View.prototype.stopWatching = function() {
      var event, events, observed, _ref, _results;
      _ref = this.watch;
      _results = [];
      for (observed in _ref) {
        events = _ref[observed];
        _results.push((function() {
          var _i, _len, _ref, _ref2, _results;
          _ref = [].concat(events);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            event = _ref[_i];
            _results.push((_ref2 = _(this).follow(observed)) != null ? typeof _ref2.unbind == "function" ? _ref2.unbind(event, this.refresh) : void 0 : void 0);
          }
          return _results;
        }).call(this));
      }
      return _results;
    };
    return View;
  })();
  tko.Backbone.Model = (function() {
    __extends(Model, Backbone.Model);
    Model.prototype.helpers = tko.Backbone.helpers;
    Model.prototype.globalActivityList = tko.globalActivityList;
    Model.prototype.globalActivity = tko.globalActivity;
    Model.prototype.bindAll = 'fetch';
    Model.prototype.views = {};
    function Model(attributes, options) {
      var name, view, _ref, _ref2, _ref3, _ref4;
      if (options == null) {
        options = {};
      }
      this.setter = __bind(this.setter, this);;
      this.getter = __bind(this.getter, this);;
      this.buildEmbedded = __bind(this.buildEmbedded, this);;
      this.bindChildActivity = __bind(this.bindChildActivity, this);;
      if (this.bindAll) {
        this.helpers.bind_all.call(this, this.bindAll);
      }
      (_ref = this.parent) != null ? _ref : this.parent = (_ref2 = options != null ? options.parent : void 0) != null ? _ref2 : options != null ? (_ref3 = options.collection) != null ? _ref3.parent : void 0 : void 0;
      this.collection = options != null ? options.collection : void 0;
      this.activity = tko.observable(false);
      this.activity.subscribe(__bind(function(value) {
        if (value) {
          return this.globalActivityList.add(this);
        } else {
          return this.globalActivityList.remove(this);
        }
      }, this));
      this.childActivity = tko.observable(false);
      this.childActivityList = tko.observableArray([]);
      this.childActivityList.subscribe(__bind(function(value) {
        return this.childActivity(!_.isEmpty(value));
      }, this));
      this.activitySubscriptions = {};
      this.bindChildActivity({
        parent: this.parent,
        collection: this.collection
      });
      this.bind('change', this.buildEmbedded);
      this.buildEmbedded(attributes, {
        silent: true
      });
      Model.__super__.constructor.call(this, attributes, options);
      _ref4 = this.views;
      for (name in _ref4) {
        view = _ref4[name];
        this[name] = new view({
          model: this
        });
      }
    }
    Model.prototype.bindChildActivity = function(listeners) {
      var key, listener, _ref, _results;
      if (listeners == null) {
        listeners = {};
      }
      _results = [];
      for (key in listeners) {
        listener = listeners[key];
        if ((_ref = this.activitySubscriptions[key]) != null) {
          _ref.destroy();
        }
        _results.push(listener && (listener.childActivityList != null) ? (listener.childActivityList.remove(this), this.activitySubscriptions[key] = this.helpers.notify_of_activity.call(this, listener)) : void 0);
      }
      return _results;
    };
    Model.prototype.buildEmbedded = function(attrs, options) {
      var attr, builder, data, embedded, get, unset, _base, _base2, _ref, _results;
      if (attrs == null) {
        attrs = {};
      }
      if (options == null) {
        options = {};
      }
      if (!(embedded = typeof this.embed == "function" ? this.embed() : void 0)) {
        return;
      }
      if (attrs instanceof Backbone.Model) {
        get = this.helpers.get_attr;
        unset = this.helpers.unset_attr;
      } else {
        get = this.helpers.get_prop;
        unset = this.helpers.unset_prop;
      }
      _results = [];
      for (attr in embedded) {
        builder = embedded[attr];
        data = get.call(attrs, attr);
        if (this[attr] != null) {
          (_ref = typeof (_base = this[attr]).refresh == "function" ? _base.refresh(data, options) : void 0) != null ? _ref : typeof (_base2 = this[attr]).set == "function" ? _base2.set(data, options) : void 0;
        } else {
          this[attr] = new builder(data, {
            parent: this
          });
        }
        _results.push(unset.call(attrs, attr, {
          silent: true
        }));
      }
      return _results;
    };
    Model.prototype.getter = function(attr) {
      return this.get(attr);
    };
    Model.prototype.setter = function(attrs, options) {
      return this.set(attrs, options);
    };
    return Model;
  })();
  tko.Backbone.Collection = (function() {
    __extends(Collection, Backbone.Collection);
    Collection.prototype.helpers = tko.Backbone.helpers;
    Collection.prototype.globalActivityList = tko.globalActivityList;
    Collection.prototype.globalActivity = tko.globalActivity;
    Collection.prototype.bindAll = 'fetch';
    'refresh';
    function Collection(models, options) {
      if (options == null) {
        options = {};
      }
      this.save = __bind(this.save, this);;
      this.ordered = __bind(this.ordered, this);;
      this.reorder = __bind(this.reorder, this);;
      if (this.bindAll) {
        this.helpers.bind_all.call(this, this.bindAll);
      }
      this.parent = options != null ? options.parent : void 0;
      this.activity = tko.observable(false);
      this.activity.subscribe(__bind(function(value) {
        if (value) {
          return this.globalActivityList.add(this);
        } else {
          return this.globalActivityList.remove(this);
        }
      }, this));
      this.childActivity = tko.observable(false);
      this.childActivityList = tko.observableArray([]);
      this.childActivityList.subscribe(__bind(function(value) {
        return this.childActivity(!_.isEmpty(value));
      }, this));
      Collection.__super__.constructor.call(this, models, options);
    }
    Collection.prototype.reorder = function(models, options) {
      var model, _i, _len, _ref;
      for (_i = 0, _len = models.length; _i < _len; _i++) {
        model = models[_i];
        if ((_ref = this.get(model)) != null) {
          _ref.set(model, options);
        }
      }
      return this.sort(options);
    };
    Collection.prototype.ordered = function() {
      return this.trigger('ordered', this);
    };
    Collection.prototype.save = function() {
      return this.invoke('save');
    };
    return Collection;
  })();
  tko.Backbone.NoticeView = (function() {
    function NoticeView() {
      this.render = __bind(this.render, this);;
      this.initialize = __bind(this.initialize, this);;      NoticeView.__super__.constructor.apply(this, arguments);
    }
    __extends(NoticeView, Backbone.View);
    NoticeView.prototype.className = 'success';
    NoticeView.prototype.defaultMessage = '';
    NoticeView.prototype.displayContainer = '#tko-notices';
    NoticeView.prototype.displayLength = 5000;
    NoticeView.prototype.showEffect = [400];
    NoticeView.prototype.hideEffect = [
      400, function() {
        return $(this).remove();
      }
    ];
    NoticeView.prototype.initialize = function(message) {
      return this.render(message);
    };
    NoticeView.prototype.render = function(message) {
      var _ref, _ref2;
      if (message == null) {
        message = this.defaultMessage;
      }
      (_ref = (_ref2 = $(this.el).html(message).hide().appendTo($(this.displayContainer))).slideDown.apply(_ref2, this.showEffect).delay(this.displayLength)).slideUp.apply(_ref, this.hideEffect);
      return this;
    };
    return NoticeView;
  })();
  tko.Backbone.ErrorView = (function() {
    function ErrorView() {
      ErrorView.__super__.constructor.apply(this, arguments);
    }
    __extends(ErrorView, tko.Backbone.NoticeView);
    ErrorView.prototype.className = 'error';
    ErrorView.prototype.defaultMessage = 'Uh oh! Something went wrong. Please try again.';
    return ErrorView;
  })();
}).call(this);
