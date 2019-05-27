'use-strict';
const apiKey = 'AIzaSyC1knVPVY4pBlBJQM4Z7NiSOnBNipufoD0'
const searchGeoLocationUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
const searchPlacesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

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

  function getLocationCoords(query) {

    if (query["near-me"]) {
      let html5GeoLocationPromise = new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(function (position) {
          resolve(
            {
              "lat": position.coords.latitude,
              "lng": position.coords.longitude
            });
        });
      })

      html5GeoLocationPromise.then(geography => {

        query['geography'] = geography;
        openResultListPage(query);

      })
    } else {

      let geography = {};

      fetch(buildGeoLocationUrl(query)).then(response => {

        return response.json();

      }).then(responseJson => {

        let lat = responseJson.results[0].geometry.location.lat;
        let lng = responseJson.results[0].geometry.location.lng;

        geography['lat'] = lat;
        geography['lng'] = lng;

        query['geography'] = geography;
        openResultListPage(query);

      }).catch(err => {
        console.log(err);
      });

    }
  }

  function buildPlaceUrl(query) {
    const location = query['geography'].lat+','+query['geography'].lng;
    const params = {
      location: location,
      radius: query['snack-range'],
      type: 'restaurant',
      keyword:'street tacos', // TODO: make this dynamic
      key: apiKey
    }

    const queryString = formatQueryParams(params);
    const url = searchPlacesUrl + '?' + queryString;

    return 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=1500&type=restaurant&keyword=cruise&key=AIzaSyC1knVPVY4pBlBJQM4Z7NiSOnBNipufoD0';
  }


  function buildGeoLocationUrl(query) {
    const params = {
      address: query['atl-location-address'],
      key: apiKey
    }
    const queryString = formatQueryParams(params);
    const url = searchGeoLocationUrl + '?' + queryString;

    return url;
  }

  function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
  }

  function openResultListPage(query) {
    $('#main').html(

      `<div id="map">

       </div>`
    )

    const latlng = new google.maps.LatLng(query['geography'].lat, query['geography'].lng);

    map = new google.maps.Map(document.getElementById('map'), {
      center: latlng,
      zoom: 13
    });

    


    let request = {
      location: latlng,
      radius: 2000,
      types: ['street tacos']
    }

    let service =  new google.maps.places.PlacesService(map);
    service.nearbySearch(request, placesCallback)

    //initialize();
  }

  function placesCallback (results, status){

    if(status == google.maps.places.PlacesServiceStatus.OK){
      for (let i = 0; i < results.length; i++){
        createMarker(results[i]);
      }
    }
  }

  function createMarker (place){
    let placeLoc = place.geometry.location;
    let marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });
  }

  function openSearchOption() {
    showNavAndFooter(true);

    $('#main').html(`
      <section class="search-option-section">
        <form id="find-snacks" method="get">
        <div class="option-switchs">
        <div class="switch-row">
          <div class="switch-row-div1">
            <label>coffee</label>
          </div>
          <div class="switch-row-div2">
            <label class="switch">
              <input id="coffee" type="checkbox">
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
            <input id="near-me" type="checkbox">
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
            <input id="alt-location" type="checkbox">
            <span class="slider round"></span>
          </label>
          </div>
        </div>  
        <div class="location">
          <input id="atl-location-address"class="other-location-value" type="text" placeholder="   enter address" required>
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
    $('#near-me').click(function () {
      if (this.checked) {
        toggleLocationOption("nearon");
      } else {
        toggleLocationOption("nearoff");
      }
    });

    // for selecting a location somewhere else
    $('#alt-location').click(function () {
      if (this.checked) {
        toggleLocationOption("otheron");
      } else {
        toggleLocationOption("otheroff");
      }
    });

    $('#find-snacks').submit(function (event) {
      event.preventDefault()
      buildSearchQueryParams();
    });

  }

  function buildSearchQueryParams() {

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

      } else if (input.type === "range" || input.type === "text") {

        key = input.id;
        value = input.value;
        query[key] = value;

      }

    });

    getLocationCoords(query);

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
