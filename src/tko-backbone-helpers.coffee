tko = @tko
tko.Backbone ?= {}
tko.Backbone.helpers ?= {}

tko.Backbone.helpers =
  iphoneStyle: ->
    @$(':checkbox').iphoneStyle()
    @$('.iPhoneCheckLabelOn').width(20)
    @$('.iPhoneCheckLabelOff').width(30)
    @$(':checkbox').each ->
      checkbox = $(@).data('iphoneStyle')
      return unless checkbox?

      checkbox.optionallyResize('handle')
      checkbox.optionallyResize('container')
      checkbox.initialPosition()
      
  bind_all: (functions...) -> _.bindAll.apply(@,[@].concat(functions))
      
  get_attr: (key, source=@) -> source.get(key)
  set_attr: (key, value, source=@) -> source.set(_(key).attr(value))
  unset_attr: (key, options={}, source=@) -> source.unset(key,options)

  get_prop: (key, source=@) -> source[key]
  set_prop: (key, value, source=@) -> source[key] = value
  unset_prop: (key, options={}, source=@) -> delete source[key]
  
  notify_of_activity: (listener) ->
    @activity.subscribe (value) => 
      if value then listener.childActivityList.add(@)
      else listener.childActivityList.remove(@)    
    
    

