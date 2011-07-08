(function() {
  tko.Social = {
    handler: {
      defaults: {
        lang: 'en',
        count: 'horizontal'
      },
      set: function() {
        var data, height, network, parameters, title, widget, width, _ref, _ref2;
        (_ref = this.option) != null ? _ref : this.option = 'twitter';
        network = tko.Social.networks[this.option];
        data = this.data();
        if (typeof data === 'string') {
          data = _.attr(this.args.dataIs || network.dataIs, data);
        }
        parameters = _({}).extend(network.defaults, this.args, data);
        delete parameters.dataIs;
        _ref2 = network.config.call(this, parameters), title = _ref2.title, height = _ref2.height, width = _ref2.width;
        height = "" + height + "px";
        width = "" + width + "px";
        widget = $(this.el.find("> .tko-social." + this.option).get(0) || $('<iframe class="tko-social" allowtransparency="true" frameborder="0" scrolling="no"></iframe>').addClass(this.option));
        widget.attr('title', title);
        widget.css({
          height: height,
          width: width
        });
        widget.attr('src', "" + network.remoteUrl + "?" + (_.parameterize(parameters)));
        return this.el.append(widget);
      }
    },
    networks: {
      twitter: {
        config: function(param) {
          var height, local, locals, title, width, _ref;
          locals = tko.Social.networks.twitter.locals;
          local = locals[param.lang] || locals.en;
          title = local.title;
          _ref = local[param.count], width = _ref[0], height = _ref[1];
          return {
            title: title,
            height: height,
            width: width
          };
        },
        defaults: {},
        dataIs: 'url',
        remoteUrl: "" + (_.protocol()) + "://platform.twitter.com/widgets/tweet_button.html",
        locals: {
          en: {
            title: "Twitter For Websites: Tweet Button",
            vertical: [55, 62],
            horizontal: [110, 20],
            none: [55, 20]
          }
        }
      },
      facebook: {
        config: function(param) {
          var height, layout, sizes, title, width, _ref;
          title = 'facebook like button';
          sizes = tko.Social.networks.facebook.sizes;
          layout = param.layout === 'standard' && param.show_faces ? 'faces' : param.layout || 'standard';
          _ref = sizes[layout], width = _ref[0], height = _ref[1];
          width = param.width || width;
          return {
            title: title,
            height: height,
            width: width
          };
        },
        defaults: {},
        dataIs: 'href',
        remoteUrl: 'http://www.facebook.com/plugins/like.php',
        sizes: {
          faces: [450, 80],
          standard: [450, 35],
          button_count: [90, 20],
          box_count: [55, 65]
        }
      }
    }
  };
  tko.Handlers.social = tko.Social.handler;
}).call(this);
