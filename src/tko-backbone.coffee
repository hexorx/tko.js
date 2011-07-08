tko = @tko
tko.Backbone ?= {}
tko.Backbone.helpers ?= {}

tko.globalActivity = tko.observable(false)
tko.globalActivityList = tko.observableArray([])
tko.globalActivityList.subscribe (value) => tko.globalActivity(not _.isEmpty(value))

class tko.Backbone.View extends Backbone.View
  helpers: tko.Backbone.helpers
  watch: { 'model': 'change' }
  
  constructor: (options={}) ->
    @helpers.bind_all.call(@,@bindAll) if @bindAll
    super(options)
    @startWatching()
  
  render: =>
    $(@el).append(@template)
    @observe(@model,false)

  setup: ->

  reload: ->
    
  refresh: (model,reload=true) =>
    @observing = $(@el).tko(@,'model')
    _.defer(@reload) if reload
    @
    
  observe: (model,reload=true) =>
    if not @model? or (model? and model isnt @model)
      @stopWatching()
      @model = model 
      @startWatching()
    @refresh(@model,reload)

  helper: (helper, args...) => @helpers?[helper]?.apply?(@,args)
    
  startWatching: => _(@).follow(observed)?.bind?(event,@refresh) for event in [].concat(events) for observed, events of @watch
  stopWatching: => _(@).follow(observed)?.unbind?(event,@refresh) for event in [].concat(events) for observed, events of @watch
      
class tko.Backbone.Model extends Backbone.Model
  helpers: tko.Backbone.helpers
  globalActivityList: tko.globalActivityList
  globalActivity: tko.globalActivity
  bindAll: 'fetch'
  views: {}
  
  constructor: (attributes, options={}) ->
    @helpers.bind_all.call(@,@bindAll) if @bindAll
    
    @parent ?= options?.parent ? options?.collection?.parent
    @collection = options?.collection
    
    @activity = tko.observable(false)
    @activity.subscribe (value) => if value then @globalActivityList.add(@) else @globalActivityList.remove(@)

    @childActivity = tko.observable(false)
    @childActivityList = tko.observableArray([])
    @childActivityList.subscribe (value) => @childActivity(not _.isEmpty(value))
    
    @activitySubscriptions = {}
    @bindChildActivity
      parent: @parent
      collection: @collection
    
    @bind('change', @buildEmbedded)
    @buildEmbedded(attributes, {silent: true})
    
    super(attributes, options)
    
    @[name] = new view({model: @}) for name, view of @views
    
  bindChildActivity: (listeners={}) =>
    for key, listener of listeners
      @activitySubscriptions[key]?.destroy()
      if listener and listener.childActivityList?
        listener.childActivityList.remove(@)
        @activitySubscriptions[key] = @helpers.notify_of_activity.call(@,listener)
  
  buildEmbedded: (attrs={}, options={}) =>
    return unless embedded = @embed?()

    if attrs instanceof Backbone.Model
      get = @helpers.get_attr
      unset = @helpers.unset_attr
    else
      get = @helpers.get_prop
      unset = @helpers.unset_prop
    
    for attr, builder of embedded
      data = get.call(attrs, attr)
      if @[attr]? then @[attr].refresh?(data,options) ? @[attr].set?(data,options)
      else @[attr] = new builder(data, { parent: @ })
        
      unset.call(attrs, attr, {silent: true})
    
  getter: (attr) => @get(attr)
  setter: (attrs, options) => @set(attrs, options)
      
class tko.Backbone.Collection extends Backbone.Collection
  helpers: tko.Backbone.helpers
  globalActivityList: tko.globalActivityList
  globalActivity: tko.globalActivity
  bindAll: 'fetch', 'refresh'
  
  constructor: (models, options={}) ->
    @helpers.bind_all.call(@,@bindAll) if @bindAll
    
    @parent = options?.parent    
    @activity = tko.observable(false)
    @activity.subscribe (value) => if value then @globalActivityList.add(@) else @globalActivityList.remove(@)
    
    @childActivity = tko.observable(false)
    @childActivityList = tko.observableArray([])
    @childActivityList.subscribe (value) => @childActivity(not _.isEmpty(value))
    
    super(models, options)
    
  reorder: (models,options) =>
    @get(model)?.set(model,options) for model in models
    @sort(options)
    
  ordered: => @trigger('ordered', @)
    
  save: => @invoke('save')
    
class tko.Backbone.NoticeView extends Backbone.View
  className: 'success'

  defaultMessage: ''
  displayContainer: '#tko-notices'
  displayLength: 5000
  
  showEffect: [400]  
  hideEffect: [400, -> $(@).remove()]

  initialize: (message) => @render(message)

  render: (message=@defaultMessage) =>
    $(@el)
    .html(message)
    .hide()
    .appendTo($(@displayContainer))
    .slideDown(@showEffect...)
    .delay(@displayLength)
    .slideUp(@hideEffect...)
    @
    
class tko.Backbone.ErrorView extends tko.Backbone.NoticeView
  className: 'error'
  defaultMessage: 'Uh oh! Something went wrong. Please try again.'
    