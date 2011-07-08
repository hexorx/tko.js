(function() {
  var tko;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  tko = this.tko;
  tko.Observable = (function() {
    function Observable(data) {
      var _ref;
      this.data = data;
      this.subscribe = __bind(this.subscribe, this);;
      this.trigger = __bind(this.trigger, this);;
      this.set = __bind(this.set, this);;
      this.get = __bind(this.get, this);;
      this.accessor = __bind(this.accessor, this);;
      (_ref = this._callbacks) != null ? _ref : this._callbacks = [];
      this.accessor.debug = this;
      this.accessor.data = this.data;
      this.accessor.current = this.current;
      this.accessor.trigger = this.trigger;
      this.accessor.subscribe = this.subscribe;
    }
    Observable.prototype.accessor = function(value) {
      if (value != null) {
        return this.set(value);
      } else {
        return this.get();
      }
    };
    Observable.prototype.get = function() {
      if (typeof this.data === 'function') {
        return this.data.call(this.root);
      } else {
        return this.data;
      }
    };
    Observable.prototype.set = function(value) {
      if (!_(value).isEqual(this.current)) {
        if (typeof this.data === 'function') {
          this.data.call(this.root, value);
        } else {
          this.data = value;
        }
        this.current = this.get();
        this.trigger();
      }
      return this.current;
    };
    Observable.prototype.trigger = function() {
      var callback, _i, _len, _ref, _results;
      _ref = this._callbacks;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback.fire());
      }
      return _results;
    };
    Observable.prototype.subscribe = function(fn, key) {
      var c;
      if (typeof fn !== 'function') {
        return;
      }
      c = {
        fn: fn,
        key: key
      };
      c.observable = this;
      c.fire = function() {
        return c.fn((this.key ? _.attr(this.key, this.observable.get()) : this.observable.get()), this.observable);
      };
      c.destroy = function() {
        var index;
        index = _(this.observable._callbacks).indexOf(this);
        if (index !== -1) {
          this.observable._callbacks.splice(index, 1);
        }
        return;
      };
      this._callbacks.push(c);
      return c;
    };
    return Observable;
  })();
  tko.Observable.ArrayMixin = {};
  tko.Observable.ArrayUnderscore = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size', 'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];
  _.each(tko.Observable.ArrayUnderscore, function(method) {
    return tko.Observable.ArrayMixin[method] = function() {
      var results;
      results = _[method].apply(_, [this.data].concat(_.toArray(arguments)));
      if (!_(this.data).isEqual(this.current)) {
        this.current = _.clone(this.data);
        this.trigger();
      }
      return results;
    };
  });
  tko.Observable.ArrayMethods = ['push', 'pop', 'unshift', 'shift', 'reverse', 'sort', 'splice'];
  _.each(tko.Observable.ArrayMethods, function(method) {
    return tko.Observable.ArrayMixin[method] = function() {
      var results;
      results = Array.prototype[method].apply(this.data, _.toArray(arguments));
      if (!_(this.data).isEqual(this.current)) {
        this.current = _.clone(this.data);
        this.trigger();
      }
      return results;
    };
  });
  tko.Observable.ArrayMixin.add = function(value) {
    if (_(this.data).indexOf(value) === -1) {
      this.data.push(value);
      this.current = _.clone(this.data);
      this.trigger();
    }
    return this.data;
  };
  tko.Observable.ArrayMixin.remove = function(value) {
    var index, results, value, values;
    if (typeof value === 'function') {
      values = _(this.data).select(value);
    }
    values != null ? values : values = [].concat(value);
    results = _((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        index = _(this.data).indexOf(value);
        _results.push(index !== -1 ? this.data.splice(index, 1) : void 0);
      }
      return _results;
    }).call(this)).chain().flatten().compact().value();
    if (!_(this.data).isEqual(this.current)) {
      this.current = _.clone(this.data);
      this.trigger();
    }
    return results;
  };
  tko.observable = function(data) {
    return (new tko.Observable(data)).accessor;
  };
  tko.observableArray = function(data) {
    return _.extend((new tko.Observable(data)).accessor, tko.Observable.ArrayMixin);
  };
}).call(this);
