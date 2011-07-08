(function() {
  var tko, _base, _ref, _ref2;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  tko = this.tko;
  (_ref = tko.Backbone) != null ? _ref : tko.Backbone = {};
  (_ref2 = (_base = tko.Backbone).helpers) != null ? _ref2 : _base.helpers = {};
  tko.Backbone.helpers = {
    iphoneStyle: function() {
      this.$(':checkbox').iphoneStyle();
      this.$('.iPhoneCheckLabelOn').width(20);
      this.$('.iPhoneCheckLabelOff').width(30);
      return this.$(':checkbox').each(function() {
        var checkbox;
        checkbox = $(this).data('iphoneStyle');
        if (checkbox == null) {
          return;
        }
        checkbox.optionallyResize('handle');
        checkbox.optionallyResize('container');
        return checkbox.initialPosition();
      });
    },
    bind_all: function() {
      var functions;
      functions = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return _.bindAll.apply(this, [this].concat(functions));
    },
    get_attr: function(key, source) {
      if (source == null) {
        source = this;
      }
      return source.get(key);
    },
    set_attr: function(key, value, source) {
      if (source == null) {
        source = this;
      }
      return source.set(_(key).attr(value));
    },
    unset_attr: function(key, options, source) {
      if (options == null) {
        options = {};
      }
      if (source == null) {
        source = this;
      }
      return source.unset(key, options);
    },
    get_prop: function(key, source) {
      if (source == null) {
        source = this;
      }
      return source[key];
    },
    set_prop: function(key, value, source) {
      if (source == null) {
        source = this;
      }
      return source[key] = value;
    },
    unset_prop: function(key, options, source) {
      if (options == null) {
        options = {};
      }
      if (source == null) {
        source = this;
      }
      return delete source[key];
    },
    notify_of_activity: function(listener) {
      return this.activity.subscribe(__bind(function(value) {
        if (value) {
          return listener.childActivityList.add(this);
        } else {
          return listener.childActivityList.remove(this);
        }
      }, this));
    }
  };
}).call(this);
