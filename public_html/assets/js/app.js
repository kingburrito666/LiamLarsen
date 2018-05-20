let page = 'home';
let homedir = '~/llarsen17';

$('body').css('overflow-y', 'scroll');

$('.center-card .nav a').mouseenter(function() {
    if(page === 'home') {
        $('#'+this.getAttribute('data-target')+'-background').addClass('visible');
        $('.backgrounds').addClass('visible');
        $('.center-card').addClass('dark');
        $('.footer').addClass('dark');
    }
});

$('.center-card .nav a').mouseleave(function() {
    if(page === 'home') {
        $('#'+this.getAttribute('data-target')+'-background').removeClass('visible');
        $('.backgrounds').removeClass('visible');
        $('.center-card').removeClass('dark');
        $('.footer').removeClass('dark');
    }
});

let transitionTimers = [];

let PAGE_FADE_TRANSITION_TIME = 250;
let HOME_PAGE_TRANSITION_TIME = 1000;

function loadPage(nextPage) {
    let oldPage = page;
    page = nextPage;

    let onMobile = $(window).width() < 786;

    // Don't do anything if we aren't going anywhere
    if(oldPage === nextPage) return;

    // Stop transitions currently in progress
    for(let i=0; i<transitionTimers.length; i++) {
        clearTimeout(transitionTimers[i]);
    }
    transitionTimers = [];

    function contentDivFadeIn(div) {
        // This function is used to fade in #content .page divs. The divs first
        // need to be displayed (i.e. display:block), and then the .show class
        // needs to be added so that they fade in.

        div.show();

        if(!onMobile) {
            // We need to use a timeout because if we add the .page class immediately
            // after making the div visible, then the browser skips the opacity fade.
            setTimeout(function() { div.addClass('show'); }, 5);
        } else {
            div.addClass('show');
        }
    }

    function useFirstLoadAnimation() {
        // This function should be called when transitioning from the home page so
        // that the first load animations (content div fades in and pans up) are
        // used.
        $('#content').addClass('firstload');
        // We need to clear the firstload class after the page transition is
        // complete. Otherwise, if we go back to the home page and then click a
        // different page, the firstload class won't be newly introduced (since it
        // was already there) and the new content won't drift up.
        transitionTimers.push(setTimeout(function() {
            $('#content').removeClass('firstload');
        }, HOME_PAGE_TRANSITION_TIME));
    }

    if(oldPage === 'home') {
        // We are transitioning in from the home page
        $('body').removeClass('on-home').addClass('on-content');
        $('.content-container').append($('.footer'));
        $('.content-container').show();
        transitionTimers.push(setTimeout(function() {
            $('.home-page-container').hide();
        }, HOME_PAGE_TRANSITION_TIME));
        $('.center-card').removeClass('return').addClass('transition');
        $('.backgrounds').addClass('small');
        $('.footer').removeClass('dark');
        $('.nav.top').removeClass('hidden');
        $('.banner').removeClass('hidden');
        // Hide the homepage text once it has transitioned out (or immediately
        // on mobile, on which there are no transitions enabled)
        if(onMobile) $('.center-container').hide();
        else transitionTimers.push(setTimeout(function(){
            $('.center-container').hide();
        }, HOME_PAGE_TRANSITION_TIME - PAGE_FADE_TRANSITION_TIME));
    }

    if(nextPage === 'home') {
        // We are transitioning back to the home page
        $('body').removeClass('on-content').addClass('on-home');
        $('.home-page-container').append($('.footer'));
        $('.home-page-container').show();
        transitionTimers.push(setTimeout(function() {
            $('.content-container').hide();
        }, HOME_PAGE_TRANSITION_TIME));
        $('.center-container').show();
        $('.center-card').removeClass('transition').addClass('return');
        $('.backgrounds').removeClass('small');
        $('.footer').addClass('dark');
        $('.center-card').removeClass('dark');
        $('.nav.top').addClass('hidden');
        $('.banner').addClass('hidden');
        $('#'+oldPage+'-page').removeClass('show');
    }

    // Update navbar
    $('.nav.top a').removeClass('selected');
    if(nextPage !== 'home')
        $('.nav.top .nav-link[data-target="'+nextPage+'"]').addClass('selected');

    // Update background
    $('#'+oldPage+'-background').removeClass('visible');
    if(nextPage === 'home') {
        $('.backgrounds').removeClass('visible');
    } else {
        $('.backgrounds').addClass('visible');
        $('#'+nextPage+'-background').addClass('visible');
    }

    // Update banner text
    $('.banner .content #'+oldPage+'-desc').removeClass('show');
    if(nextPage === 'home')
        $('.banner .content #'+oldPage+'-action').hide();
    else
        $('.banner .content #'+nextPage+'-desc').addClass('show');
    if(oldPage === 'home') {
        $('.banner .content #'+page+'-action').css('display', 'inline-block');
    } else if(nextPage !== 'home') {
        if(!onMobile) {
            // We need to make the old text "flip" out and the new text flip in
            $('.banner .content #'+oldPage+'-action').addClass('exiting');
            $('.banner .content #'+nextPage+'-action').addClass('entering');
            transitionTimers.push(setTimeout(function(){
                $('.banner .content #'+oldPage+'-action').removeClass('exiting').css('display', 'none');
                $('.banner .content #'+nextPage+'-action').css('display', 'inline-block');
            }, 150));
            transitionTimers.push(setTimeout(function() {
                $('.banner .content #'+nextPage+'-action').removeClass('entering');
            }, 200));
        }
        else {
            $('.banner .content #'+oldPage+'-action').hide();
            $('.banner .content #'+page+'-action').css('display', 'inline-block');
        }
    }

    // We're going to another page, so we hide the current one
    $('#'+oldPage+'-page').removeClass('show');
    if(!onMobile) {
        // Remove the page from the flow once it transitions out
        transitionTimers.push(setTimeout(function() { $('#'+oldPage+'-page').hide(); }, PAGE_FADE_TRANSITION_TIME));
    }
    else {
        // We don't have transitions so we can remove the div immediately
        $('#'+oldPage+'-page').hide();
    }

    // If we are transitioning to some child page (not the home page), we
    // either need to load the new content or display the appropriate already-
    // loaded content

    if(nextPage !== 'home') {
        // If we don't have an existing .page div for this page, we need to
        // create it and load the new content
        if(!$('#'+nextPage+'-page').length) {
            var startTime = new Date();
            var newPageDiv = $('<div>', {id: nextPage+'-page', class: 'page'}).hide();
            $('#content').append(newPageDiv);
            $('#content .loading-spinner').addClass('show');
            newPageDiv.load('partials/'+nextPage+'.html', function() {
                $('#content .loading-spinner').removeClass('show');
                // Wait until the previous page fades out (if we're on a
                // fast connection and this page loaded before the other
                // one finished fading out)
                var loadTimeElapsed = Number(new Date() - startTime);
                var fadeDelay = loadTimeElapsed >= PAGE_FADE_TRANSITION_TIME
                    ? 1
                    : PAGE_FADE_TRANSITION_TIME - loadTimeElapsed;
                transitionTimers.push(setTimeout(function() {
                    // If we're coming in from the home page, add the
                    // firstload class so that the new content "drifts" up
                    // when displayed
                    if(oldPage === 'home' && !onMobile) {
                        useFirstLoadAnimation();
                    }
                    // Make the new page fade in
                    contentDivFadeIn(newPageDiv);
                }, fadeDelay));
            });
        } else {
            // If we're coming in from the home page, add the firstload class
            // so that the new content "drifts" up and in when displayed
            if(oldPage === 'home' && !onMobile) {
                useFirstLoadAnimation();
                $('#'+nextPage+'-page').show().addClass('show');
            } else {
                // We want to show the new page after the old page has faded
                // out
                transitionTimers.push(setTimeout(function() {
                    contentDivFadeIn($('#'+nextPage+'-page'));
                }, PAGE_FADE_TRANSITION_TIME));
            }
        }
    }
}

function slideshow(classname) {
    var myIndex = 0;
    carousel();

    function carousel() {
        var i;
        var x = $('.logo .'+classname);
        // var x = document.getElementsByClassName(".project-card .logo .slide_logo");
        for (i = 0; i < x.length; i++) {
            $(x[i]).fadeOut(1000);
            x[i].style.display = "none";
        }
        myIndex++;
        if (myIndex > x.length) {
            myIndex = 1
        }
        //x[myIndex - 1].style.display = "block";
        $(x[myIndex - 1]).fadeIn(300);
        setTimeout(carousel, 3500); // ms
    }
}

$(window).resize(function() {
    if(page !== 'home') {
        // Pages are stored in .page divs, which are absolutely positioned
        // inside of #content. Since they're absolutely positioned and take up
        // no space in the flow, when the page reflows we need to manually
        // adjust #content's height to match its visible child div
        $('#content').css('height', $('#'+page+'-page').height() + 'px');
    }
});

$('.nav-link').click(function() {
    loadPage(this.getAttribute('data-target'));

    // Pushstate:
    history.pushState({}, '', $(this).attr('href'));
    return false;
});

$(window).on('popstate', function() {
    // loadPage(location.pathname.substring(1));
    if (location.pathname.substring(1) !== '') {
        loadPage(location.pathname.substring(1));
    } else {
        loadPage('home');
    }
});


$(document).ready(function() {
    if (location.pathname.substring(1) !== '' && !(page === 'home')) {
        loadPage(location.pathname.substring(1));
    } else {
        loadPage('home');
    }
    // Preload partials
     // for (let pageName of ['software', 'gd', 'other']) {
     //     var newPageDiv = $('<div>', {id: pageName+'-page', class: 'page'}).hide();
     //     $('#content').append(newPageDiv);
     //     newPageDiv.load('partials/'+pageName+'.html');
     // }
});

function preload(pageName) {
    if(!$('#'+pageName+'-page').length) {
        var newPageDiv = $('<div>', {id: pageName+'-page', class: 'page'}).hide();
        $('#content').append(newPageDiv);
        newPageDiv.load('partials/'+pageName+'.html');
    }
}
