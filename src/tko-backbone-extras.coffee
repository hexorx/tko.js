tko = @tko

tko.Backbone.LocalCache = (key,value) ->
  return false unless localStorage?
  return true unless key?
  if value?
    localStorage.setItem(key, JSON.stringify(value)) ? value
  else
    value = localStorage.getItem(key)
    JSON.parse(value) if value?
    
tko.Backbone.CacheSync = (method, model, success, error) ->  
  store = tko.Backbone.LocalCache
  if store()
    old = {success,error}
    host = location.host

    if collection = model.collection
      collection_url = collection.url?() ? collection.url
      collection_key = host + collection_url
      store(collection_key, false) unless method is 'read'
    
    url = model.url?() ? model.url
    key = host + url
    
    switch method
      when 'read'
        cache = store(key)
        old.success(cache,'cache') if old.success? and cache?
        success = (data,status) ->
          store(key,data)
          old.success(data,status) if old.success?

  Backbone.sync(method, model, success, error)

tko.Backbone.NotifySync = (method, model, success, error) ->
  old = {success,error}
  model.activity(true)
  
  unless (name = model._name)
    success = (data,status) ->
      model.activity(false)
      old.success(data,status)
  else
    switch method
      when 'create'
        new tko.Backbone.NoticeView("Creating #{name} ...")
        success = (data,status) ->
          new tko.Backbone.NoticeView("#{name} Successfully Created")
          model.activity(false)
          old.success(data,status)
      when 'read'
        new tko.Backbone.NoticeView("Loading #{name} ...")
        success = (data,status) ->
          unless status is 'cache'
            new tko.Backbone.NoticeView("#{name} Successfully Loaded")
            model.activity(false)
          old.success(data,status)
      when 'update'
        new tko.Backbone.NoticeView("Updating #{name} ...")
        success = (data,status) ->
          new tko.Backbone.NoticeView("#{name} Successfully Updated")
          model.activity(false)
          old.success(data,status)
      when 'delete'
        new tko.Backbone.NoticeView("Deleting #{name} ...")
        success = (data,status) ->
          new tko.Backbone.NoticeView("#{name} Successfully Deleted")
          model.activity(false)
          old.success(data,status)
    
  error = (data,status) ->
    new tko.Backbone.ErrorView('Something went wrong!!')
    model.activity(false)
    old.error(data,status)
  
  tko.Backbone.CacheSync(method, model, success, error)

  