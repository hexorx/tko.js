tko = @tko

# Base Observable 
class tko.Observable
  constructor: (@data) ->
    @_callbacks ?= []
    @accessor.debug = @
    @accessor.data = @data
    @accessor.current = @current
    @accessor.trigger = @trigger
    @accessor.subscribe = @subscribe
                
  accessor: (value) => if value? then @set(value) else @get()

  get: => if typeof @data is 'function' then @data.call(@root) else @data
  
  set: (value) =>
    unless _(value).isEqual(@current)
      if typeof @data is 'function' then @data.call(@root,value) else @data = value
      @current = @get()
      @trigger()
    @current
          
  trigger: => callback.fire() for callback in @_callbacks
  
  subscribe: (fn,key) =>
    return unless typeof fn is 'function'
    c = {fn,key}
    c.observable = @
    c.fire = ->
      c.fn((if @key then _.attr(@key,@observable.get()) else @observable.get()),@observable)
    c.destroy = ->
      index = _(@observable._callbacks).indexOf(@)
      @observable._callbacks.splice(index,1) unless index is -1
      undefined
    @_callbacks.push(c); c;

# Observable Array Extentions
tko.Observable.ArrayMixin = {}

tko.Observable.ArrayUnderscore = [
  'forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect'
  'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include'
  'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size'
  'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'
]

_.each tko.Observable.ArrayUnderscore, (method) ->
  tko.Observable.ArrayMixin[method] = ->
    results = _[method].apply(_, [@data].concat(_.toArray(arguments)))
    unless _(@data).isEqual(@current)
      @current = _.clone(@data)
      @trigger()
    results
    
tko.Observable.ArrayMethods = ['push', 'pop', 'unshift', 'shift', 'reverse', 'sort', 'splice']

_.each tko.Observable.ArrayMethods, (method) ->
  tko.Observable.ArrayMixin[method] = ->
    results = Array::[method].apply(@data, _.toArray(arguments))
    unless _(@data).isEqual(@current)
      @current = _.clone(@data)
      @trigger()
    results

tko.Observable.ArrayMixin.add = (value) ->
  if _(@data).indexOf(value) is -1
    @data.push(value)
    @current = _.clone(@data)
    @trigger()
  @data
  
tko.Observable.ArrayMixin.remove = (value) ->
  if typeof value is 'function'
    values = _(@data).select(value)
  values ?= [].concat(value)
  results = _(for value in values
    index = _(@data).indexOf(value)
    @data.splice(index,1) unless index is -1
  ).chain().flatten().compact().value()
  unless _(@data).isEqual(@current)
    @current = _.clone(@data)
    @trigger()
  results  
          
# Observable helpers
tko.observable = (data) -> (new tko.Observable(data)).accessor
tko.observableArray = (data) -> _.extend((new tko.Observable(data)).accessor, tko.Observable.ArrayMixin)
  
  
  
  
  
  
  
  
