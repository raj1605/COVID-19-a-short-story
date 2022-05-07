(function ($) {
"use strict";
// TOP Menu Sticky
$(window).on('scroll', function () {
	var scroll = $(window).scrollTop();
	if (scroll < 400) {
    $("#sticky-header").removeClass("sticky");
    $('#back-top').fadeIn(500);
	} else {
    $("#sticky-header").addClass("sticky");
    $('#back-top').fadeIn(500);
	}
});


$(document).ready(function(){


// review-active
$('.slider_active').owlCarousel({
  loop:true,
  margin:0,
items:1,
autoplay:true,
navText:['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
  nav:false,
dots:false,
autoplayHoverPause: true,
autoplaySpeed: 800,
  responsive:{
      0:{
          items:1,
          dots:false
      },
      767:{
          items:1,
          dots:false
      },
      992:{
          items:1
      }
  }
});
// review-active
$('.help_slider_active').owlCarousel({
  loop:true,
  margin:30,
  items:1,
  autoplay:true,
  navText:['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
  nav:false,
  dots:false,
  autoplayHoverPause: true,
  autoplaySpeed: 800,
  responsive:{
      0:{
          items:1
      },
      767:{
          items:2
      },
      992:{
          items:2
      },
      1200:{
          items:2
      },
      1500:{
          items:2
      }
  }
});

// for filter
  // init Isotope
  var $grid = $('.grid').isotope({
    itemSelector: '.grid-item',
    percentPosition: true,
    masonry: {
      // use outer width of grid-sizer for columnWidth
      columnWidth: 1
    }
  });

  // filter items on button click
  $('.portfolio-menu').on('click', 'button', function () {
    var filterValue = $(this).attr('data-filter');
    $grid.isotope({ filter: filterValue });
  });

  //for menu active class
  $('.portfolio-menu button').on('click', function (event) {
    $(this).siblings('.active').removeClass('active');
    $(this).addClass('active');
    event.preventDefault();
	});
  
  // wow js
  new WOW().init();

  // counter 
  $('.counter').counterUp({
    delay: 10,
    time: 10000
  });

/* magnificPopup img view */
$('.popup-image').magnificPopup({
	type: 'image',
	gallery: {
	  enabled: true
	}
});

/* magnificPopup img view */
$('.img-pop-up').magnificPopup({
	type: 'image',
	gallery: {
	  enabled: true
	}
});

/* magnificPopup video view */
$('.popup-video').magnificPopup({
	type: 'iframe'
});


  // scrollIt for smoth scroll
  $.scrollIt({
    upKey: 38,             // key code to navigate to the next section
    downKey: 40,           // key code to navigate to the previous section
    easing: 'linear',      // the easing function for animation
    scrollTime: 600,       // how long (in ms) the animation takes
    activeClass: 'active', // class given to the active nav element
    onPageChange: null,    // function(pageIndex) that is called when page is changed
    topOffset: 0           // offste (in px) for fixed top navigation
  });

  // scrollup bottom to top
  $.scrollUp({
    scrollName: 'scrollUp', // Element ID
    topDistance: '4500', // Distance from top before showing element (px)
    topSpeed: 300, // Speed back to top (ms)
    animation: 'fade', // Fade, slide, none
    animationInSpeed: 200, // Animation in speed (ms)
    animationOutSpeed: 200, // Animation out speed (ms)
    scrollText: '<i class="fa fa-angle-double-up"></i>', // Text for element
    activeOverlay: false, // Set CSS color to display scrollUp active point, e.g '#00FFFF'
  });


  // blog-page

  //brand-active
$('.brand-active').owlCarousel({
  loop:true,
  margin:30,
items:1,
autoplay:true,
  nav:false,
dots:false,
autoplayHoverPause: true,
autoplaySpeed: 800,
  responsive:{
      0:{
          items:1,
          nav:false

      },
      767:{
          items:4
      },
      992:{
          items:7
      }
  }
});

// blog-dtails-page

  //project-active
$('.project-active').owlCarousel({
  loop:true,
  margin:30,
items:1,
// autoplay:true,
navText:['<i class="Flaticon flaticon-left-arrow"></i>','<i class="Flaticon flaticon-right-arrow"></i>'],
nav:true,
dots:false,
// autoplayHoverPause: true,
// autoplaySpeed: 800,
  responsive:{
      0:{
          items:1,
          nav:false

      },
      767:{
          items:1,
          nav:false
      },
      992:{
          items:2,
          nav:false
      },
      1200:{
          items:1,
      },
      1501:{
          items:2,
      }
  }
});

if (document.getElementById('default-select')) {
  $('select').niceSelect();
}

  //about-pro-active
$('.details_active').owlCarousel({
  loop:true,
  margin:0,
items:1,
// autoplay:true,
navText:['<i class="ti-angle-left"></i>','<i class="ti-angle-right"></i>'],
nav:true,
dots:false,
// autoplayHoverPause: true,
// autoplaySpeed: 800,
  responsive:{
      0:{
          items:1,
          nav:false

      },
      767:{
          items:1,
          nav:false
      },
      992:{
          items:1,
          nav:false
      },
      1200:{
          items:1,
      }
  }
});

});
//------- Mailchimp js --------//  


})(jQuery);

/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let myMapVis,
    vaccine;

let selectedTimeRange = [];
let selectedState = '';
let selectedCategory = 'absCases';
let selectedDate = "";


// load data using promises
let promisesForCali = [

    // d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),  // not projected -> you need to do it
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"), // already projected -> you can just scale it to ft your browser window
    d3.csv("data/covid_data.csv"),
    d3.csv("data/census_usa.csv"),
    d3.csv("data/dailyCases2.csv"),
    d3.csv("data/sewage_concentration.csv"),
    d3.csv("data/vaccine_mandate_dailycases.csv"),
    d3.csv("data/dailyCases2edited.csv"),
    d3.json("data/cb_2014_us_county_5m.json")
];

Promise.all(promisesForCali)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(dataArray) {

flag  =0
    var cummVacc = 0;
    let parseDate = d3.timeParse("%m/%d/%Y");
    dataArray[5].forEach(entry=>
    {

        entry.Date = parseDate(entry.Date);
        entry["New Cases"] =+ entry["New Cases"];
        entry["Daily Test"] =+ entry["Daily Test"];
        entry["Total Doses"] =+ entry["Total Doses"];

        entry["Dose 1"] =+ entry["Dose 1"];
        //entry["Total Doses"] = +entry["Total Doses"]
        entry["cummulativeVaccine"] = cummVacc + entry["Dose 1"];

        if(flag == 0 && entry["cummulativeVaccine"] >0)
        {
            console.log("prabhas");
            console.log(entry['cummulativeVaccine']);
            console.log(entry.Date);
            flag = 1;
        }
        cummVacc = entry["cummulativeVaccine"];
    })

    dataArray[6].forEach(entry=>
    {
        entry.Date = parseDate(entry.Date);
        entry["NewCases"] =+ entry["NewCases"];

    });



    // log data
    console.log('check out the data', dataArray);

    // TODO - init map
    myMapVis = new MapVis('mapDiv', dataArray[1], dataArray[2], dataArray[0]);


    // init brush
    daily_cases_timeline = new BrushVis('brushDiv', dataArray[3]);


    daily_cases_tests = new CasesTest('testingAndCases', dataArray[5]);

    vaccine = new Vaccine("vaccinatedPopulation", dataArray[5]);

    county = new CountyVis("mandateMap", dataArray[7], dataArray[5] );

    combinet = new CombineTimelines("new-demo-id");


}
