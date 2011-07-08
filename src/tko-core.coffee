# Underscore Helpers
_.mixin
  parameterize: (parameters) -> _(parameters).map((value,key) -> "#{key}=#{escape(value)}").join('&')
  protocol: -> if (window.location.protocol.match(/s\:$/) or 0) then "https" else "http"
  objectify: (pairs) -> _(pairs).reduce(((memo,pair) -> memo[pair[0]]=pair[1] if pair[0]?; memo;), {})
  sanitize: (string='') -> $.trim(string.replace(/['"{}]/g,'').replace(/\s+/g,' '))    
  attr: (keys,values...) -> _.objectify(_([].concat(keys)).zip(_.flatten(values)))
  
  tokenize: (values=[]) ->
    values = values.split(',') if typeof values is 'string'
    for value in _.compact(values)
      id = name = $.trim(value)
      {id,name}
  
  parse: (string='',listToken,pairToken) ->
    _(string.split(listToken)).chain()
    .map((pair) -> _((pair.match(pairToken) ? []).slice(1)).map((p) -> _.sanitize(p)))
    .compact().objectify().value()

  follow: (context,chain,separator='.') ->
    chain = chain.split(separator) if _.isString(chain)
    chain = _.compact(_.toArray(chain))
    return unless chain and context
    _(chain).reduce (memo, link) ->
      return unless typeof memo is 'object'
      if typeof memo[link] is 'function' then memo[link]() else memo[link]
    , context
    

# JQuery setup
$ = jQuery

# Custom JQuery selector
$.extend $.expr[':'], { tko: (node,i,properties,stack) -> $(node).tko()? }

# JQuery Plugin
$.fn.extend  
  tko: (datum,base) ->
    if datum?
      observing = @data('tko-observing')
      unless observing and datum is @data('tko-datum')
        observed.ignore() for observed in (observing ?= [])
        observing = []
        elements = _.toArray(@find(':tko').not(@find('.tko-scope *')))
        elements.push(@get(0)) if @is(':tko')

        boundTo = (datum[base] ? datum)
        boundToID = (boundTo.id?() ? boundTo.id)

        for el in elements
          observers = []
          observers.push(new tko.Observer(el,key,binding,datum,base)) for key, binding of $(el).tko()
          $(el).data('tko-bound-to', boundTo)
          $(el).data('tko-observers', observers)
          observing = observing.concat(observers)

        @data('tko-bound-to', boundTo).data('tko-id',boundToID)
        @data('tko-observing',observing)
        @data('tko-datum',datum)
      observer.render() for observer in observing
      observing      
    else
      return unless (data = (this.data('tko-bind') || this.data('bind')))?
      this.data('tko-bind', (data = _(data).parse(',',/(.+):(.+)/))) unless typeof(data) is 'object'
      data

# TKO Bindings
tko = if exports? then exports else @tko = {}

class tko.Observer
  constructor: (@el,@key,@binding,@datum={},@base) ->
    @el = $(@el)
    
    @plusTemplate = _.compact((@key.match(/^(\+?)(.*?)(\+?)$/) ? []).slice(1))
    @key = @key.replace(/\+/g,'')

    [@handler,@option] = @key.split('@')
    @altKey = "#{@handler}@"
    @element = _(tko.Handlers[@handler] ? {}).defaults(tko.Handlers.default)
    
    [@chain,@arg] = @binding.split('#')
    @args = _({}).extend((@element.defaults ? {}),_(@arg).parse('|',/(.+)\[(.*)\]/))
    @chain = _(@chain.split('.')).compact()
    @chain.unshift(@base) if @base? and @binding[0] isnt '.'
    @event = @element.events[@key] || @element.events[@altKey]

    @getOriginal()
    @bindEvent()
      
  data: (value) =>
    result = @datum
    [chain...,property] = @chain
    result = _(@datum).follow(chain)
    return unless typeof result is 'object'
    @subscription?.destroy?()
    @subscription = result[property]?.subscribe?(@render)
    if typeof result[property] is 'function' then result[property](value)
    else if value?
      if result[property]? then result[property] = value
      else if typeof result.setter is 'function' then result.setter(_.attr(property,value))
      else result[property] = value
    else result[property] ? result.getter?(property)
    
  stringify: =>
    data = @data()

    if @plusTemplate?.length is 1
      data = @original unless data
      return [data].join('') 
      
    _.map(@plusTemplate, ((part) -> if part is '+' then data else @original), @).join('')
    
  getOriginal: =>
    return if (@original = @el.data('tko')?.originals[@key])?
    @original = @element.get?.call(@)
    @el.data({tko: {originals: _.attr(@key,@original)}}) if @original?
        
  ignore: => @el.unbind(@event, @proxyEvent)
  
  bindEvent: => @el.bind @event, @beforeEvent if @event
  
  beforeEvent: (e,ui) => !!(@doEvent(e,ui) if @element.beforeEvent.call(@,e,ui))
  doEvent: (e,ui) => !!(@afterEvent(e,ui) if (@element[@option] || @element[@event]).call(@,e,ui))
  afterEvent: (e,ui) => !!@element.afterEvent.call(@,e,ui)
  
  render: => @beforeRender()
  
  beforeRender: =>
    @element.beforeSet.call(@)
    setTimeout(@doRender, 0)
    
  doRender: =>
    @element.set.call(@)
    setTimeout(@afterRender, 0)
    
  afterRender: => @element.afterSet.call(@)
    
tko.Handlers =
  default:
    defaults: {}
    events: {}
    get: ->
    set: ->
    beforeSet: ->
    afterSet: ->
    beforeEvent: -> true
    afterEvent: (e,ui) ->
      if e?
        e.stopPropagation() unless !!(@bubble || @args.bubble)
        e.preventDefault() unless !!(@allow_default || @args.allow_default)
        true
      else !!(@bubble || @args.bubble)
  
  # data -> el with + notation
  text:
    get: -> @el.text()
    set: -> @el.text(@stringify())    

  attr: 
    get: -> @el.attr(@option)
    set: -> @el.attr(@option, @stringify())

  # data -> el
  html: { set: -> @el.html(@data() ? '') }
  prop: { set: -> @el.prop(@option, @data()) }
  data: { set: -> @el.data(@option, @data()) }
  css: { set: -> @el.css(@option, @data() ? '') }
  
  class:
    set: ->
      data = @data()
      if @option
        if (@args.if and data is @args.if) or (not @args.if and data)
          @el.addClass(@option)
        else @el.removeClass(@option)
      else
        if data? and data isnt @current_class
          @el.removeClass(@current_class) if @current_class?
          @el.addClass(data)
          @current_class = data

  visible:
    defaults: { hide: 'hide', show: 'show' } 
    set: ->
      data = @data()
      if (@args.if and data is @args.if) or (not @args.if and data)
        @el[@args.show]?()
      else @el[@args.hide]?()

  invisible:
    defaults: { hide: 'hide', show: 'show' } 
    set: ->
      data = @data()
      if (@args.if and data is @args.if) or (not @args.if and data)
        @el[@args.hide]?()
      else @el[@args.show]?()

  enabled:
    set: -> 
      data = @data()
      if (@args.if and data is @args.if) or (not @args.if and data)
        @el.prop('disabled', false)
      else @el.prop('disabled', true)

  disabled:
    set: -> 
      data = @data()
      if (@args.if and data is @args.if) or (not @args.if and data)
        @el.prop('disabled', true)
      else @el.prop('disabled', false)

  validate:
    set: ->
      error = @data()
      @el.data('tko-validation-widget')?.remove()
      if error
        widget = $("<span class='tko-validation'>#{_.last(@chain).replace(/[\_\-]/g,' ')} #{[].concat(error).join(' & ')}</span>")
        @el.data('tko-validation-widget', widget)
        widget.insertAfter(@el)
        setTimeout (-> widget.addClass('visible')), 0
        
  plugin:
    set: ->
      data = @data()
      data = @el.data(@args.default) if @args.default and not data?
      data = @el.data(@args.toggle) if @args.toggle and (data = !!data)
      @el[@option]?(data)
  
  # el -> data 
  click:
    defaults: { message: 'Are you sure?' }
    events: { 'click@': 'click', 'click': 'click' }
    
    beforeEvent: ->
      @bubble = false
      if confirmation = (@el.data('confirmation') || @option is 'confirm')
        confirmation = @args.message unless typeof confirmation is 'string'
        confirm(confirmation)
      else true
      
    click: -> @data() || true      
    toggle: -> @data(!@data()) || true
    confirm: -> @data() || true      
    failover: ->
      if @el.attr('href') then @allow_default = true
      else @data() || true
  
  # bi-directional bindings
  value:
    events: { 'value': 'change', 'value@keyup': 'keyup' }
    change: -> @data(@el.val())
    keyup: -> @data(@el.val())
    set: -> @el.val(@data())    
    
  checked:
    events: { 'checked': 'change'}
    change: (e,ui) -> @data(checked) unless (checked = @el.is(':checked')) is !!@data()
    set: -> (if @data() then @el.attr('checked', true) else @el.removeAttr('checked')).change()
  
  partial:
    defaults: { index: 'position', view: 'view' }
    events: { 'partial@sortable': 'sortchange sortstop' }
    
    afterEvent: (e,ui) ->
      if e.type is 'sortstop'
        data = @data()
        @args.sorting = false 
        data.ordered?() if data.ordered
      true
      
    sortable: (e,ui) ->
      @args.sorting = true
      options = { silent: (@args.silent and e.type isnt 'sortstop') }
      
      @data().reorder?(@element.order.call(@,ui.item), options)
            
    order: (item) ->
      sorting = item.hasClass('ui-sortable-helper')
      ids = for child in @el.children()
        child = $(child)
        if sorting
          continue if child.get(0) is item.get(0)
          child = item if child.hasClass('ui-sortable-placeholder')
        continue unless id = child.data('tko-id')
        id
      _(['id',@args.index]).attr([id,i]) for id, i in ids

    get: -> @el.contents().detach()
    
    set: ->
      return if @args.sorting
      return unless @data()?
      @el.addClass('tko-scope')
      @partialsData = []

      view = @args.view
      prev = false

      partials = for datum in @data().toArray?() || [].concat(@data())
        source = if view then datum[view]?() ? datum[view] else datum
        continue unless source
        @partialsData.push(source)
        source.el
        
      @oldPartials = _(@partials ?= []).without(partials...)
      @partials = partials
            
      $(@oldPartials).detach() if @oldPartials
      @original?.detach?()
      
      if @plusTemplate?.length is 1
        $(if _.isEmpty(@partials) then @original else @partials).appendTo(@el)
      else
        $(if part is '+' and @partials then @partials else @original).appendTo(@el) for part in @plusTemplate
      true
      
    afterSet: -> data.refresh?() for data in (@partialsData || [])
        