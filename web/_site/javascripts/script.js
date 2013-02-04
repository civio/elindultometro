// Custom scripts goes here
(function() {
    // Initialize carousel
    carouselInit();

    // Affix
    affixInit();
})();


// Function to animate the height of carousel in case of slides with different heights
function carouselInit() {
    var carousel = $('#myCarousel'),
        defaultHeight = carousel.find('.active').height();

    // setting the default height
    carousel.css('min-height', defaultHeight);

    // animate the container height on any slider transitiom
    carousel.bind('slid', function() {
        var itemheight = carousel.find('.active').height();

        carousel.css('min-height', itemheight);
        carousel.animate({
            height: itemheight
        }, 50 );
    });
}

function affixInit() {
    $('.docs-sidebar-nav').affix({
        offset: {
            top: 0,
            bottom:360
        }
    });
}

function message( type, title, content, duration ) {
    var messageHTML = '<div class="alert alert-' + type + '">'
                      + '<button type="button" class="close" data-dismiss="alert">×</button>'
                      + '<strong>' + title + '</strong> '
                      + content
                      + '</div>';

    var message = $(messageHTML).hide();

    $('#messages').append(message);

    message.fadeIn();

      // Increase compatibility with unnamed functions
    setTimeout(function() {
        message.fadeOut();
    }, duration);  // will work with every browser
}
;
