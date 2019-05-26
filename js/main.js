'use-strict';

$(document).ready(function () {

  function openLanding() {
    showNavAndFooter(false);
    $('#main').html(`
      <header class="csf_logo" role="banner">
        <img src="./img/CiclismoSnackFinderLogo.png" alt="ciclismo snack finder image">
      </header>
      <section class="landing">
        <button id="start-button" class="start-button" type="submit">Start</button>  
      </section>
`)

    $('.start-button').click(function () {
      console.log("Start Finding Snacks!!");
      openSearchOption();
    });
  }

  function openResultListPage(query) {
    console.log(query);

    $('#main').html(`
          
          <div class="results">
          <pre>
            ${JSON.stringify(query, undefined, 2)}
          </pre>
          </div>
    
    `)

  }

  function openSearchOption() {
    showNavAndFooter(true);

    $('#main').html(`
      <section class="search-option-section">
        <form id="find-snacks" method="get">
        <div class="option-switchs">
        <div class="switch-row">
          <div class="switch-row-div1">
            <label>java</label>
          </div>
          <div class="switch-row-div2">
            <label class="switch">
              <input id="java" type="checkbox">
              <span class="slider round"></span>
            </label>
          </div>
        </div> 
        <div class="switch-row">
          <div class="switch-row-div1">
            <label>bakery</label>
          </div>
          <div class="switch-row-div2">
          <label class="switch">
            <input id="bakery" type="checkbox">
            <span class="slider round"></span>
          </label>
          </div>
        </div>
        <div class="switch-row">
           <div class="switch-row-div1">
            <label>tacos</label>
           </div>
           <div class="switch-row-div2">
             <label class="switch">
              <input id="tacos" type="checkbox">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
        <div class="switch-row">
          <div class="switch-row-div1">
          <label>beer</label> 
          </div>
          <div class="switch-row-div2">
          <label class="switch">
            <input id="beer" type="checkbox">
            <span class="slider round"></span>
          </label>
          </div>
        </div>
        <div class="slider-row">
            <div>
              <label for="snack-range">distance:</label><br>
              <span  class="snack-range-value"></span>   
            </div>
            <div>
              <input type="range" min="0" max="20" value = "4" step="2" class="slider-bar" id="snack-range">
            </div>    
        </div>
        <div>
          <div class="switch-row near-me">
          <div class="switch-row-div1">
          <label>Near Me</label> 
          </div>
          <div class="switch-row-div2">
          <label class="switch">
            <input id="nearme-checkbox" type="checkbox">
            <span class="slider round"></span>
          </label>
          </div>
        </div>
        <div class="switch-row other-location">
          <div class="switch-row-div1">
          <label>location</label> 
          </div>
          <div class="switch-row-div2">
          <label class="switch">
            <input id="location-checkbox" type="checkbox">
            <span class="slider round"></span>
          </label>
          </div>
        </div>  
        <div class="location">
          <input class="other-location-value" type="text" placeholder="   enter address" required>
        </div>
        </div>
          <button class="find-snacks-button" type="submit">Find Snacks</button>
        </form>  
      </section>
`)

    setUpOptionsEvents();
  }

  function setUpOptionsEvents() {

    // for distance range slider
    $('#snack-range').on('change', function () {
      // $(this).next($('.snack-range-label')).html(this.value);
      $('.snack-range-value').text(this.value);
    });

    // for selecting location near me
    $('#nearme-checkbox').click(function () {
      if (this.checked) {
        toggleLocationOption("nearon");
      } else {
        toggleLocationOption("nearoff");
      }
    });

    // for selecting a location somewhere else
    $('#location-checkbox').click(function () {
      if (this.checked) {
        toggleLocationOption("otheron");
      } else {
        toggleLocationOption("otheroff");
      }
    });

    $('#find-snacks').submit(function (event) {
      event.preventDefault()
      findSnacks();
    });

  }

  function findSnacks() {
    const forms = document.querySelectorAll('#find-snacks');
    const form = forms[0];

    let query = {};

    [...form.elements].forEach((input) => {
      let key = '';
      let value = '';

      if (input.type === "checkbox") {
        key = input.id;
        value = input.checked;
        query[key] = value;

        if (input.id === "nearme-checkbox" && input.checked) {

          console.log("Nearme Location: " + getGeoLocation());
          key = 'nearme';
          value = getGeoLocation();
          query[key] = value;

        } else if (input.id === "location-checkbox" && input.checked) {

          let address = $('.other-location-value').val();
          key = 'other';
          query[key] = address;
        }
      } else if (input.type === "range") {

        key = input.id;
        value = input.value;
        query[key] = value;
      }

    });

    openResultListPage(query);

  }

  function getGeoLocation(address = null) {
    let geoLocation = "";

    if (address === null) {

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          geoLocation = "lat:" + position.coords.latitude + ", lon: " + position.coords.longitude;
        });

      } else {
        geoLocation = "Geolocation is not supported by this browser.";
      }

    } else {
      geoLocation = address;
    }

    return geoLocation;
  }


  function toggleLocationOption(set) {

    if (set === "nearon") {

      $('.other-location').hide("fast");
      $('.other-location-value').attr('required', false);

    } else if (set === "nearoff") {

      $('.other-location').show("fast");

    } else if (set === "otheron") {

      $('.near-me').hide("fast");
      $('.other-location').show("fast");
      // $('.other-location-value').show("fast");
      $('.other-location-value').css('visibility', 'visible');
      $('.other-location-value').css('display', 'block');
      $('.other-location-value').attr('required', true);
      $('.other-location-value').val("");

    } else if (set === "otheroff") {

      $('.other-location-value').hide("fast");
      $('.near-me').show("fast");

    }
  }

  function showNavAndFooter(visibile) {
    if (visibile) {
      $(".nav").css('display', 'flex');
      $(".nav").css('visibility', 'visible');
      $("footer").css('visibility', 'visible');
    } else {
      $(".nav").css('display', 'none');
      $(".nav").css('visibility', 'hidden');
      $("footer").css('visibility', 'hidden');
    }
  }

  function toggleNavPanel() {
    if ($(".nav_panel").is(":hidden")) {
      // open the panel
      $(".nav_panel").slideDown("fast");
      $(".nav_panel").css('display', 'flex');
      $(".nav_panel").css('flex-direction', 'column');
    } else {
      $(".nav_panel").slideUp("fast");
    }
  }

  function closeNavPanel() {
    $('.nav_panel').slideUp('fast');
  }

  function createNavigationClickHandlers() {
    $('#nav_panel_home').click(function () {
      closeNavPanel();
      openLanding();
      console.log("NavPanel-Clicked Home");
    });

    $('#nav_panel_favorites').click(function () {
      closeNavPanel();
      console.log("NavPanel-Clicked Favorites");
    });

    $('#nav_panel_about').click(function () {
      closeNavPanel();
      console.log("NavPanel-Clicked About");
    });

    $('#nav_bar_home').click(function () {
      openLanding();
      console.log("NavBar-Clicked Home");
    });

    $('#nav_bar_favorites').click(function () {
      console.log("NavBar-Clicked Favorites");
    });

    $('#nav_bar_about').click(function () {
      console.log("NavBar-Clicked About");
    });

    $('.fa-bars').click(function () {
      toggleNavPanel();
    });
  }

  function startSite() {
    // createNavSocialClickHandlers();
    createNavigationClickHandlers()
    openLanding();
  }

  $(startSite());

});
