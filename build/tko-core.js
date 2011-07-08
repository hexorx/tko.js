(function() {
  var $, tko;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _.mixin({
    parameterize: function(parameters) {
      return _(parameters).map(function(value, key) {
        return "" + key + "=" + (escape(value));
      }).join('&');
    },
    protocol: function() {
      if (window.location.protocol.match(/s\:$/) || 0) {
        return "https";
      } else {
        return "http";
      }
    },
    objectify: function(pairs) {
      return _(pairs).reduce((function(memo, pair) {
        if (pair[0] != null) {
          memo[pair[0]] = pair[1];
        }
        return memo;
      }), {});
    },
    sanitize: function(string) {
      if (string == null) {
        string = '';
      }
      return $.trim(string.replace(/['"{}]/g, '').replace(/\s+/g, ' '));
    },
    attr: function() {
      var keys, values;
      keys = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return _.objectify(_([].concat(keys)).zip(_.flatten(values)));
    },
    tokenize: function(values) {
      var id, name, value, _i, _len, _ref, _results;
      if (values == null) {
        values = [];
      }
      if (typeof values === 'string') {
        values = values.split(',');
      }
      _ref = _.compact(values);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        value = _ref[_i];
        id = name = $.trim(value);
        _results.push({
          id: id,
          name: name
        });
      }
      return _results;
    },
    parse: function(string, listToken, pairToken) {
      if (string == null) {
        string = '';
      }
      return _(string.split(listToken)).chain().map(function(pair) {
        var _ref;
        return _(((_ref = pair.match(pairToken)) != null ? _ref : []).slice(1)).map(function(p) {
          return _.sanitize(p);
        });
      }).compact().objectify().value();
    },
    follow: function(context, chain, separator) {
      if (separator == null) {
        separator = '.';
      }
      if (_.isString(chain)) {
        chain = chain.split(separator);
      }
      chain = _.compact(_.toArray(chain));
      if (!(chain && context)) {
        return;
      }
      return _(chain).reduce(function(memo, link) {
        if (typeof memo !== 'object') {
          return;
        }
        if (typeof memo[link] === 'function') {
          return memo[link]();
        } else {
          return memo[link];
        }
      }, context);
    }
  });
  $ = jQuery;
  $.extend($.expr[':'], {
    tko: function(node, i, properties, stack) {
      return $(node).tko() != null;
    }
  });
  $.fn.extend({
    tko: function(datum, base) {
      var binding, boundTo, boundToID, data, el, elements, key, observed, observer, observers, observing, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
      if (datum != null) {
        observing = this.data('tko-observing');
        if (!(observing && datum === this.data('tko-datum'))) {
          _ref = (observing != null ? observing : observing = []);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            observed = _ref[_i];
            observed.ignore();
          }
          observing = [];
          elements = _.toArray(this.find(':tko').not(this.find('.tko-scope *')));
          if (this.is(':tko')) {
            elements.push(this.get(0));
          }
          boundTo = (_ref2 = datum[base]) != null ? _ref2 : datum;
          boundToID = (_ref3 = typeof boundTo.id == "function" ? boundTo.id() : void 0) != null ? _ref3 : boundTo.id;
          for (_j = 0, _len2 = elements.length; _j < _len2; _j++) {
            el = elements[_j];
            observers = [];
            _ref4 = $(el).tko();
            for (key in _ref4) {
              binding = _ref4[key];
              observers.push(new tko.Observer(el, key, binding, datum, base));
            }
            $(el).data('tko-bound-to', boundTo);
            $(el).data('tko-observers', observers);
            observing = observing.concat(observers);
          }
          this.data('tko-bound-to', boundTo).data('tko-id', boundToID);
          this.data('tko-observing', observing);
          this.data('tko-datum', datum);
        }
        for (_k = 0, _len3 = observing.length; _k < _len3; _k++) {
          observer = observing[_k];
          observer.render();
        }
        return observing;
      } else {
        if ((data = this.data('tko-bind') || this.data('bind')) == null) {
          return;
        }
        if (typeof data !== 'object') {
          this.data('tko-bind', (data = _(data).parse(',', /(.+):(.+)/)));
        }
        return data;
      }
    }
  });
  tko = typeof exports != "undefined" && exports !== null ? exports : this.tko = {};
  tko.Observer = (function() {
    function Observer(el, key, binding, datum, base) {
      var _ref, _ref2, _ref3, _ref4, _ref5;
      this.el = el;
      this.key = key;
      this.binding = binding;
      this.datum = datum != null ? datum : {};
      this.base = base;
      this.afterRender = __bind(this.afterRender, this);;
      this.doRender = __bind(this.doRender, this);;
      this.beforeRender = __bind(this.beforeRender, this);;
      this.render = __bind(this.render, this);;
      this.afterEvent = __bind(this.afterEvent, this);;
      this.doEvent = __bind(this.doEvent, this);;
      this.beforeEvent = __bind(this.beforeEvent, this);;
      this.bindEvent = __bind(this.bindEvent, this);;
      this.ignore = __bind(this.ignore, this);;
      this.getOriginal = __bind(this.getOriginal, this);;
      this.stringify = __bind(this.stringify, this);;
      this.data = __bind(this.data, this);;
      this.el = $(this.el);
      this.plusTemplate = _.compact(((_ref = this.key.match(/^(\+?)(.*?)(\+?)$/)) != null ? _ref : []).slice(1));
      this.key = this.key.replace(/\+/g, '');
      _ref2 = this.key.split('@'), this.handler = _ref2[0], this.option = _ref2[1];
      this.altKey = "" + this.handler + "@";
      this.element = _((_ref3 = tko.Handlers[this.handler]) != null ? _ref3 : {}).defaults(tko.Handlers["default"]);
      _ref4 = this.binding.split('#'), this.chain = _ref4[0], this.arg = _ref4[1];
      this.args = _({}).extend((_ref5 = this.element.defaults) != null ? _ref5 : {}, _(this.arg).parse('|', /(.+)\[(.*)\]/));
      this.chain = _(this.chain.split('.')).compact();
      if ((this.base != null) && this.binding[0] !== '.') {
        this.chain.unshift(this.base);
      }
      this.event = this.element.events[this.key] || this.element.events[this.altKey];
      this.getOriginal();
      this.bindEvent();
    }
    Observer.prototype.data = function(value) {
      var chain, property, result, _i, _ref, _ref2, _ref3, _ref4;
      result = this.datum;
      _ref = this.chain, chain = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), property = _ref[_i++];
      result = _(this.datum).follow(chain);
      if (typeof result !== 'object') {
        return;
      }
      if ((_ref2 = this.subscription) != null) {
        if (typeof _ref2.destroy == "function") {
          _ref2.destroy();
        }
      }
      this.subscription = (_ref3 = result[property]) != null ? typeof _ref3.subscribe == "function" ? _ref3.subscribe(this.render) : void 0 : void 0;
      if (typeof result[property] === 'function') {
        return result[property](value);
      } else if (value != null) {
        if (result[property] != null) {
          return result[property] = value;
        } else if (typeof result.setter === 'function') {
          return result.setter(_.attr(property, value));
        } else {
          return result[property] = value;
        }
      } else {
        return (_ref4 = result[property]) != null ? _ref4 : typeof result.getter == "function" ? result.getter(property) : void 0;
      }
    };
    Observer.prototype.stringify = function() {
      var data, _ref;
      data = this.data();
      if (((_ref = this.plusTemplate) != null ? _ref.length : void 0) === 1) {
        if (!data) {
          data = this.original;
        }
        return [data].join('');
      }
      return _.map(this.plusTemplate, (function(part) {
        if (part === '+') {
          return data;
        } else {
          return this.original;
        }
      }), this).join('');
    };
    Observer.prototype.getOriginal = function() {
      var _ref, _ref2;
      if ((this.original = (_ref = this.el.data('tko')) != null ? _ref.originals[this.key] : void 0) != null) {
        return;
      }
      this.original = (_ref2 = this.element.get) != null ? _ref2.call(this) : void 0;
      if (this.original != null) {
        return this.el.data({
          tko: {
            originals: _.attr(this.key, this.original)
          }
        });
      }
    };
    Observer.prototype.ignore = function() {
      return this.el.unbind(this.event, this.proxyEvent);
    };
    Observer.prototype.bindEvent = function() {
      if (this.event) {
        return this.el.bind(this.event, this.beforeEvent);
      }
    };
    Observer.prototype.beforeEvent = function(e, ui) {
      return !!(this.element.beforeEvent.call(this, e, ui) ? this.doEvent(e, ui) : void 0);
    };
    Observer.prototype.doEvent = function(e, ui) {
      return !!((this.element[this.option] || this.element[this.event]).call(this, e, ui) ? this.afterEvent(e, ui) : void 0);
    };
    Observer.prototype.afterEvent = function(e, ui) {
      return !!this.element.afterEvent.call(this, e, ui);
    };
    Observer.prototype.render = function() {
      return this.beforeRender();
    };
    Observer.prototype.beforeRender = function() {
      this.element.beforeSet.call(this);
      return setTimeout(this.doRender, 0);
    };
    Observer.prototype.doRender = function() {
      this.element.set.call(this);
      return setTimeout(this.afterRender, 0);
    };
    Observer.prototype.afterRender = function() {
      return this.element.afterSet.call(this);
    };
    return Observer;
  })();
  tko.Handlers = {
    "default": {
      defaults: {},
      events: {},
      get: function() {},
      set: function() {},
      beforeSet: function() {},
      afterSet: function() {},
      beforeEvent: function() {
        return true;
      },
      afterEvent: function(e, ui) {
        if (e != null) {
          if (!(this.bubble || this.args.bubble)) {
            e.stopPropagation();
          }
          if (!(this.allow_default || this.args.allow_default)) {
            e.preventDefault();
          }
          return true;
        } else {
          return !!(this.bubble || this.args.bubble);
        }
      }
    },
    text: {
      get: function() {
        return this.el.text();
      },
      set: function() {
        return this.el.text(this.stringify());
      }
    },
    attr: {
      get: function() {
        return this.el.attr(this.option);
      },
      set: function() {
        return this.el.attr(this.option, this.stringify());
      }
    },
    html: {
      set: function() {
        var _ref;
        return this.el.html((_ref = this.data()) != null ? _ref : '');
      }
    },
    prop: {
      set: function() {
        return this.el.prop(this.option, this.data());
      }
    },
    data: {
      set: function() {
        return this.el.data(this.option, this.data());
      }
    },
    css: {
      set: function() {
        var _ref;
        return this.el.css(this.option, (_ref = this.data()) != null ? _ref : '');
      }
    },
    "class": {
      set: function() {
        var data;
        data = this.data();
        if (this.option) {
          if ((this.args["if"] && data === this.args["if"]) || (!this.args["if"] && data)) {
            return this.el.addClass(this.option);
          } else {
            return this.el.removeClass(this.option);
          }
        } else {
          if ((data != null) && data !== this.current_class) {
            if (this.current_class != null) {
              this.el.removeClass(this.current_class);
            }
            this.el.addClass(data);
            return this.current_class = data;
          }
        }
      }
    },
    visible: {
      defaults: {
        hide: 'hide',
        show: 'show'
      },
      set: function() {
        var data, _base, _base2, _name, _name2;
        data = this.data();
        if ((this.args["if"] && data === this.args["if"]) || (!this.args["if"] && data)) {
          return typeof (_base = this.el)[_name = this.args.show] == "function" ? _base[_name]() : void 0;
        } else {
          return typeof (_base2 = this.el)[_name2 = this.args.hide] == "function" ? _base2[_name2]() : void 0;
        }
      }
    },
    invisible: {
      defaults: {
        hide: 'hide',
        show: 'show'
      },
      set: function() {
        var data, _base, _base2, _name, _name2;
        data = this.data();
        if ((this.args["if"] && data === this.args["if"]) || (!this.args["if"] && data)) {
          return typeof (_base = this.el)[_name = this.args.hide] == "function" ? _base[_name]() : void 0;
        } else {
          return typeof (_base2 = this.el)[_name2 = this.args.show] == "function" ? _base2[_name2]() : void 0;
        }
      }
    },
    enabled: {
      set: function() {
        var data;
        data = this.data();
        if ((this.args["if"] && data === this.args["if"]) || (!this.args["if"] && data)) {
          return this.el.prop('disabled', false);
        } else {
          return this.el.prop('disabled', true);
        }
      }
    },
    disabled: {
      set: function() {
        var data;
        data = this.data();
        if ((this.args["if"] && data === this.args["if"]) || (!this.args["if"] && data)) {
          return this.el.prop('disabled', true);
        } else {
          return this.el.prop('disabled', false);
        }
      }
    },
    validate: {
      set: function() {
        var error, widget, _ref;
        error = this.data();
        if ((_ref = this.el.data('tko-validation-widget')) != null) {
          _ref.remove();
        }
        if (error) {
          widget = $("<span class='tko-validation'>" + (_.last(this.chain).replace(/[\_\-]/g, ' ')) + " " + ([].concat(error).join(' & ')) + "</span>");
          this.el.data('tko-validation-widget', widget);
          widget.insertAfter(this.el);
          return setTimeout((function() {
            return widget.addClass('visible');
          }), 0);
        }
      }
    },
    plugin: {
      set: function() {
        var data, _base, _name;
        data = this.data();
        if (this.args["default"] && !(data != null)) {
          data = this.el.data(this.args["default"]);
        }
        if (this.args.toggle && (data = !!data)) {
          data = this.el.data(this.args.toggle);
        }
        return typeof (_base = this.el)[_name = this.option] == "function" ? _base[_name](data) : void 0;
      }
    },
    click: {
      defaults: {
        message: 'Are you sure?'
      },
      events: {
        'click@': 'click',
        'click': 'click'
      },
      beforeEvent: function() {
        var confirmation;
        this.bubble = false;
        if (confirmation = this.el.data('confirmation') || this.option === 'confirm') {
          if (typeof confirmation !== 'string') {
            confirmation = this.args.message;
          }
          return confirm(confirmation);
        } else {
          return true;
        }
      },
      click: function() {
        return this.data() || true;
      },
      toggle: function() {
        return this.data(!this.data()) || true;
      },
      confirm: function() {
        return this.data() || true;
      },
      failover: function() {
        if (this.el.attr('href')) {
          return this.allow_default = true;
        } else {
          return this.data() || true;
        }
      }
    },
    value: {
      events: {
        'value': 'change',
        'value@keyup': 'keyup'
      },
      change: function() {
        return this.data(this.el.val());
      },
      keyup: function() {
        return this.data(this.el.val());
      },
      set: function() {
        return this.el.val(this.data());
      }
    },
    checked: {
      events: {
        'checked': 'change'
      },
      change: function(e, ui) {
        var checked;
        if ((checked = this.el.is(':checked')) !== !!this.data()) {
          return this.data(checked);
        }
      },
      set: function() {
        return (this.data() ? this.el.attr('checked', true) : this.el.removeAttr('checked')).change();
      }
    },
    partial: {
      defaults: {
        index: 'position',
        view: 'view'
      },
      events: {
        'partial@sortable': 'sortchange sortstop'
      },
      afterEvent: function(e, ui) {
        var data;
        if (e.type === 'sortstop') {
          data = this.data();
          this.args.sorting = false;
          if (data.ordered) {
            if (typeof data.ordered == "function") {
              data.ordered();
            }
          }
        }
        return true;
      },
      sortable: function(e, ui) {
        var options, _base;
        this.args.sorting = true;
        options = {
          silent: this.args.silent && e.type !== 'sortstop'
        };
        return typeof (_base = this.data()).reorder == "function" ? _base.reorder(this.element.order.call(this, ui.item), options) : void 0;
      },
      order: function(item) {
        var child, i, id, ids, sorting, _len, _results;
        sorting = item.hasClass('ui-sortable-helper');
        ids = (function() {
          var _i, _len, _ref, _results;
          _ref = this.el.children();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            child = $(child);
            if (sorting) {
              if (child.get(0) === item.get(0)) {
                continue;
              }
              if (child.hasClass('ui-sortable-placeholder')) {
                child = item;
              }
            }
            if (!(id = child.data('tko-id'))) {
              continue;
            }
            _results.push(id);
          }
          return _results;
        }).call(this);
        _results = [];
        for (i = 0, _len = ids.length; i < _len; i++) {
          id = ids[i];
          _results.push(_(['id', this.args.index]).attr([id, i]));
        }
        return _results;
      },
      get: function() {
        return this.el.contents().detach();
      },
      set: function() {
        var datum, part, partials, prev, source, view, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5;
        if (this.args.sorting) {
          return;
        }
        if (this.data() == null) {
          return;
        }
        this.el.addClass('tko-scope');
        this.partialsData = [];
        view = this.args.view;
        prev = false;
        partials = (function() {
          var _base, _i, _len, _ref, _ref2, _results;
          _ref = (typeof (_base = this.data()).toArray == "function" ? _base.toArray() : void 0) || [].concat(this.data());
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            datum = _ref[_i];
            source = view ? (_ref2 = typeof datum[view] == "function" ? datum[view]() : void 0) != null ? _ref2 : datum[view] : datum;
            if (!source) {
              continue;
            }
            this.partialsData.push(source);
            _results.push(source.el);
          }
          return _results;
        }).call(this);
        this.oldPartials = (_ref = _((_ref2 = this.partials) != null ? _ref2 : this.partials = [])).without.apply(_ref, partials);
        this.partials = partials;
        if (this.oldPartials) {
          $(this.oldPartials).detach();
        }
        if ((_ref3 = this.original) != null) {
          if (typeof _ref3.detach == "function") {
            _ref3.detach();
          }
        }
        if (((_ref4 = this.plusTemplate) != null ? _ref4.length : void 0) === 1) {
          $(_.isEmpty(this.partials) ? this.original : this.partials).appendTo(this.el);
        } else {
          _ref5 = this.plusTemplate;
          for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
            part = _ref5[_i];
            $(part === '+' && this.partials ? this.partials : this.original).appendTo(this.el);
          }
        }
        return true;
      },
      afterSet: function() {
        var data, _i, _len, _ref, _results;
        _ref = this.partialsData || [];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          data = _ref[_i];
          _results.push(typeof data.refresh == "function" ? data.refresh() : void 0);
        }
        return _results;
      }
    }
  };
}).call(this);
