(function ($) {
  Drupal.OpenSourceryLightbox = Drupal.OpenSourceryLightbox || {};

  Drupal.OpenSourceryLightbox.eventhandlerHashChange = function (event) {
    var link = $.bbq.getState('lightbox');
    if (!link || link.length === 0) {
      if ($('#fancybox-content').length !== 0) {
        $.fancybox.close();
      }
      return;
    }

    // If we don't call this first, fancybox doesn't init itself properly when
    // we're triggered from loading page with a hash value
    $.fancybox.init();
    $('a.lightbox[href$="' + link + '"]')
      .fancybox({
        type: 'ajax',
        href: Drupal.settings.basePath + 'lightbox?path=' + link,
        padding: 15,
        scrolling: 'no',
        overlayColor: '#000',
        onComplete: function () {
          var context = '#fancybox-content';
          // Activate JS behaviors within the new content
          Drupal.attachBehaviors(context);
          var widest = 0;
          $('img, object', context).filter(function (index) {
            width = $(this).width();
            widest = width > widest ? width : widest;
          });
          if (widest > $(context).width()) {
            $('#fancybox-wrap').width(widest + 30 + 'px');
            $('#fancybox-content, #fancybox-content article').width(widest + 'px');
            $('.node', context).width(widest + 'px');
          }
          // Hack: Don't call resize right away; if we do, it does nothing.
          setTimeout(function() { $.fancybox.resize(); }, 150);
        },
        onClosed: function () {
          window.location.hash = '';
          $('a.lightbox').unbind('click');
        }
      }).trigger('click');
  };

  /**
   * Behaviors.
   */
  Drupal.behaviors.OpenSourceryLightbox = {
    attach: function (context, settings) {
      // Set up lightbox links.
      var location = window.location.href.substr(0, window.location.href.indexOf(window.location.hash));

      // Don't modify links *already* in a lightbox
      if (context != '#fancybox-content') {
        $('a.lightbox', context).attr('href', function(index, attr) {
          return location + '#lightbox=' + attr.replace(settings.basePath, '');
        });
      }

      // Bind our hashchange callback (only once)
      if (context == document) {
        $(window)
          .bind('hashchange.opensourcery-lightbox', $.proxy(Drupal.OpenSourceryLightbox, 'eventhandlerHashChange'))
          .triggerHandler('hashchange.opensourcery-lightbox');
      }
    }
  }
}(jQuery));
