(function() {
  var tko;
  tko = this.tko;
  tko.Backbone.LocalCache = function(key, value) {
    var _ref;
    if (typeof localStorage == "undefined" || localStorage === null) {
      return false;
    }
    if (key == null) {
      return true;
    }
    if (value != null) {
      return (_ref = localStorage.setItem(key, JSON.stringify(value))) != null ? _ref : value;
    } else {
      value = localStorage.getItem(key);
      if (value != null) {
        return JSON.parse(value);
      }
    }
  };
  tko.Backbone.CacheSync = function(method, model, success, error) {
    var cache, collection, collection_key, collection_url, host, key, old, store, url, _ref, _ref2;
    store = tko.Backbone.LocalCache;
    if (store()) {
      old = {
        success: success,
        error: error
      };
      host = location.host;
      if (collection = model.collection) {
        collection_url = (_ref = typeof collection.url == "function" ? collection.url() : void 0) != null ? _ref : collection.url;
        collection_key = host + collection_url;
        if (method !== 'read') {
          store(collection_key, false);
        }
      }
      url = (_ref2 = typeof model.url == "function" ? model.url() : void 0) != null ? _ref2 : model.url;
      key = host + url;
      switch (method) {
        case 'read':
          cache = store(key);
          if ((old.success != null) && (cache != null)) {
            old.success(cache, 'cache');
          }
          success = function(data, status) {
            store(key, data);
            if (old.success != null) {
              return old.success(data, status);
            }
          };
      }
    }
    return Backbone.sync(method, model, success, error);
  };
  tko.Backbone.NotifySync = function(method, model, success, error) {
    var name, old;
    old = {
      success: success,
      error: error
    };
    model.activity(true);
    if (!(name = model._name)) {
      success = function(data, status) {
        model.activity(false);
        return old.success(data, status);
      };
    } else {
      switch (method) {
        case 'create':
          new tko.Backbone.NoticeView("Creating " + name + " ...");
          success = function(data, status) {
            new tko.Backbone.NoticeView("" + name + " Successfully Created");
            model.activity(false);
            return old.success(data, status);
          };
          break;
        case 'read':
          new tko.Backbone.NoticeView("Loading " + name + " ...");
          success = function(data, status) {
            if (status !== 'cache') {
              new tko.Backbone.NoticeView("" + name + " Successfully Loaded");
              model.activity(false);
            }
            return old.success(data, status);
          };
          break;
        case 'update':
          new tko.Backbone.NoticeView("Updating " + name + " ...");
          success = function(data, status) {
            new tko.Backbone.NoticeView("" + name + " Successfully Updated");
            model.activity(false);
            return old.success(data, status);
          };
          break;
        case 'delete':
          new tko.Backbone.NoticeView("Deleting " + name + " ...");
          success = function(data, status) {
            new tko.Backbone.NoticeView("" + name + " Successfully Deleted");
            model.activity(false);
            return old.success(data, status);
          };
      }
    }
    error = function(data, status) {
      new tko.Backbone.ErrorView('Something went wrong!!');
      model.activity(false);
      return old.error(data, status);
    };
    return tko.Backbone.CacheSync(method, model, success, error);
  };
}).call(this);
