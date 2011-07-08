tko.Social = 
  handler:
    defaults:
      lang: 'en'
      count: 'horizontal'
        
    set: ->
      @option ?= 'twitter'
      network = tko.Social.networks[@option]
      
      data = @data()
      data = _.attr((@args.dataIs or network.dataIs),data) if typeof data is 'string'
      parameters = _({}).extend(network.defaults,@args,data)
      delete parameters.dataIs

      {title,height,width} = network.config.call(@,parameters)
      height = "#{height}px"
      width = "#{width}px"
      
      widget = $(@el.find("> .tko-social.#{@option}").get(0) || $('<iframe class="tko-social" allowtransparency="true" frameborder="0" scrolling="no"></iframe>').addClass(@option))
      widget.attr('title', title)
      widget.css({height,width})
      widget.attr('src',"#{network.remoteUrl}?#{_.parameterize(parameters)}")
      
      @el.append(widget)
      
  networks:
    twitter:
      config: (param) ->
        locals = tko.Social.networks.twitter.locals
        local = locals[param.lang] || locals.en
        title = local.title
        [width,height] = local[param.count]
        {title,height,width}
        
      defaults: {}
      dataIs: 'url'
      remoteUrl: "#{_.protocol()}://platform.twitter.com/widgets/tweet_button.html"
              
      locals:
        en:
          title: "Twitter For Websites: Tweet Button"
          vertical: [55, 62]
          horizontal: [110, 20]
          none: [55, 20]

    facebook:
      config: (param) ->
        title = 'facebook like button'
        sizes = tko.Social.networks.facebook.sizes
        layout = if param.layout is 'standard' and param.show_faces then 'faces' else (param.layout || 'standard')
        [width,height] = sizes[layout]
        width = param.width or width
        {title,height,width}
        
      defaults: {}
      dataIs: 'href'
      remoteUrl: 'http://www.facebook.com/plugins/like.php'
      
      sizes:
        faces: [450,80]
        standard: [450,35]
        button_count: [90,20]
        box_count: [55,65]
  
tko.Handlers.social = tko.Social.handler      
