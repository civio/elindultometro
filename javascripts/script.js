// Custom scripts goes here
(function() {
    // Initialize carousel
    carouselInit();

    // Portfolio filters function
    portfolioFilters();

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


// Function to style the map in the contact page, change lat and lng vars to create your own map
function mapInit() {
    // Create an array of styles.
    var styles =   [
        {
            stylers: [
                { saturation: -100 }
            ]
        },{
            featureType: 'road',
            elementType: 'geometry',
            stylers: [
                { lightness: 100 },
                { visibility: 'simplified' }
            ]
        },{
            featureType: 'road',
            elementType: 'labels',
            stylers: [
                { visibility: 'off' }
            ]
            }
        ],
        // put your locations lat and long here
        lat = 51.607,
        lng = -0.12248,

        // Create a new StyledMapType object, passing it the array of styles,
        // as well as the name to be displayed on the map type control.
        styledMap = new google.maps.StyledMapType(styles,
            {name: 'Styled Map'}),

        // Create a map object, and include the MapTypeId to add
        // to the map type control.
        mapOptions = {
            zoom: 14,
            scrollwheel: false,
            center: new google.maps.LatLng( lat, lng ),
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP]
            }
        },
        map = new google.maps.Map(document.getElementById('map'),
            mapOptions),
        charlotte = new google.maps.LatLng( lat, lng ),

        marker = new google.maps.Marker({
                                        position: charlotte,
                                        map: map,
                                        title: "Hello World!"
                                    });


        //Associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');
}

function portfolioFilters() {
    var filters = $('.thumbnail-filters');

    filters.on('click', 'a', function(e) {
        var active = $(this),
            portfolio = filters.next();
            activeClass = active.data('filter');


        filters.find('a').removeClass('active');
        active.addClass('active');

        if ( activeClass == 'all') {
            portfolio.find('li').removeClass('inactive');
        } else {
            portfolio.find('li').removeClass('inactive').not('.filter-' + activeClass ).addClass('inactive');
        }


        e.preventDefault();
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

function setupLoginForm() {
    $('#email').tooltip( {
        title: 'Invalid email address',
        placement: 'right',
        trigger: 'manual'
    });

    $('#password').tooltip( {
        title: 'You must enter a password',
        placement: 'right',
        trigger: 'manual'
    });

    $('#login-form').submit( function() {
        var validForm = true;
        // validate email
        if( validateEmail( $('#email').val() ) == false ) {
            $('#email').tooltip('show');
            validForm = false;
        }
        else {
            $('#email').tooltip('hide');
        }
        // check for password
        if( $('#password').val() == '' ) {
            $('#password').tooltip('show');
            validForm = false;
        }
        else {
            $('#password').tooltip('hide');
        }

        if( validForm ) {
            message( 'error', 'Ooops', "Access Denied", 3000 );
        }
        return false;
    });
}

function setupResetForm() {
    $('#email').tooltip( {
        title: 'Invalid email address',
        placement: 'right',
        trigger: 'manual'
    });

    $('#reset-form').submit( function() {
        // validate email
        if( validateEmail( $('#email').val() ) == false ) {
            $('#email').tooltip('show');
        }
        else {
            $('#email').tooltip('hide');
            message( 'success', 'Check your mailbox', "We have reset your password", 3000 );
        }

        return false;
    });
}

function setupSignupForm() {
    $('#email').tooltip( {
        title: 'Invalid email address',
        placement: 'right',
        trigger: 'manual'
    });

    $('#password, #password-confirm').tooltip( {
        title: 'You must enter a password',
        placement: 'right',
        trigger: 'manual'
    });

    $('#signup-form').submit( function() {
        var validForm = true;
        // validate email
        if( validateEmail( $('#email').val() ) == false ) {
            $('#email').tooltip('show');
            validForm = false;
        }
        else {
            $('#email').tooltip('hide');
        }
        // check for password
        if( $('#password').val() == '' ) {
            $('#password').tooltip('show');
            validForm = false;
        }
        else {
            $('#password').tooltip('hide');
        }

        if( $('#password-confirm').val() == '' ) {
            $('#password-confirm').tooltip('show');
            validForm = false;
        }
        else {
            $('#password-confirm').tooltip('hide');
        }

        if( $('#password-confirm').val() != $('#password').val() ) {
            message( 'error', 'Passwords dont match', "You must enter the same password.", 3000 );
            validForm = false;
        }

        if( validForm ) {
            message( 'success', 'Thanks', "You have signed up please confirm your account.", 3000 );
        }
        return false;
    });
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
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
