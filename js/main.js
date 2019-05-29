'use-strict';
const apiKey = 'AIzaSyDcyjJ1zUoocLCv9OMS5LCf-CKxPDOkHes'
const searchGeoLocationUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
let centerOfSearchLocation = '';

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

    $('#start-button').click(function () {
      console.log("Start Finding Snacks!!");
      openSearchOptions();

    });

  }

  // get coords for the user current location using html5 geolocation
  // or get coords for a user-provided location
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
        centerOfSearchLocation = geography['lat']+','+geography['lng'];

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
        centerOfSearchLocation = geography[lat]+','+geography[lng];

        openResultListPage(query);

      }).catch(err => {
        console.log(err);
      });
    }
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

    // create unordered list container
    $('#main').html(
      `<div id="map">

       </div>

       <div>
          <ul id="results-list">
            <!-- 
              the list items will be filled in
              after by the placesListCallback()
              function that return data from
              the Google places api               
             -->
          </ul> 
       </div>
       
    <!-- Modal
     modal is hidden until user clicks
     on results list for more details.
    -->
      <div id="myModal" class="snack-modal">
          <!-- Modal content -->
      </div>
    <!-- Modal -->
`
    )

    const latlng = new google.maps.LatLng(query['geography'].lat, query['geography'].lng);

    map = new google.maps.Map(document.getElementById('map'), {
      center: latlng,
      zoom: 12,
      mapTypeId: 'terrain',
      disableDefaultUI: true
    });

    const keywordArr = buildKeyWordList(query);
    const range = convertRangeToMeters(query['snack-range']);

    let request = {
      location: latlng,
      radius: range,
      keyword: keywordArr,
      types: ['restaurants']
    }

    let placesService = new google.maps.places.PlacesService(map);
    placesService.nearbySearch(request, placesListCallback)

  }

  // takes results from Google places and builds
  // list items for results list
  function placesListCallback(results, status) {

    //let distanceService = new google.maps.DistanceMatrixService();

    if (status == google.maps.places.PlacesServiceStatus.OK) {
      let resultList = results.map(r => {
        createMarker(r);

        return `
          <li class="list-item open-modal" data-placeid=${r.place_id}>
          <div class="list-item-desc">
            <h4>${r.name}</h4>
            <hr>
            <p>${r.vicinity}</p>
          </div>
          <div class="list-item-img"></div>
          </li>
          `
      }).join("\n");

      $('#results-list').html(resultList);
    }

    $('.open-modal').click(function (item) {
      console.log("Open Modal!!");
      openModal(item);

    });
  }



  // opens detail modal when user clicks
  // on an item in the results list
  function openModal(item) {

    let placeId = item.currentTarget.attributes[1].value;

    let request = {
      placeId: placeId,
      fields: ['name',
               'rating',
               'icon',
               'website',
               'formatted_address',
               'formatted_phone_number',
               'reviews',
               'geometry']
    }

    let service = new google.maps.places.PlacesService(map);
    service.getDetails(request, placesDetailCallback)

  }

  function placesDetailCallback(place, status) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {

      //let modal = document.getElementById("myModal");
      let span = document.getElementsByClassName("close")[0];

      $('#myModal').css('display', 'block');

      let resultsHtml = `
       
       <div class="modal-content">
          <div class="modal-header">
            <img src="./img/CiclismoSnackFinderLogo.png" alt="ciclismo snack finder image">            
            <!--<span class="close-modal">&times;</span>-->
          </div>
          <div class="modal-body">
            <h2>${place.name}</h2>
            <div >
              <p><a href="${place.website}" target="_blank">website</a></p>
              <p>${place.formatted_phone_number}</p>
              <p>${place.formatted_address}</p>
            </div>
          </div>
          <div class="modal-footer">
            <form id="directions-form">
            <div>
              <input type="radio" id="walking" name="travel-mode" value="walking"
                     checked>
              <label for="walking">walking</label>
            </div>
           
            <div>
              <input type="radio" id="bicycling" name="travel-mode" value="bicycling">
              <label for="bicycling">bicycling</label>
            </div>
            
            <div>
              <input type="radio" id="transit" name="travel-mode" value="transit">
              <label for="transit">transit</label>
            </div>
            
             <div>
              <input type="radio" id="driving" name="travel-mode" value="driving">
              <label for="driving">driving</label>
            </div>
            <button id="directions-button" class="directions-button" type="submit">directions</button>
           </form>
            <button id="close-modal-button" class="close-modal-button" type="submit">close</button>
          </div>
        </div>
       `

      $('#myModal').html(resultsHtml);
    }

    $('#close-modal-button').click(function () {
      $('#myModal').css('display', 'none');
      console.log("Close Modal!!");
    });

    $(window).click(function (e) {
      if (event.target == myModal) {
        $('#myModal').css('display', 'none');
        console.log("Close Modal!!");
      }
    });


    //let oLatLng = 42.3421593+','+-71.0584656;
    let oLatLng = centerOfSearchLocation;
    let dLatLng = place.geometry.location.lat()+","+place.geometry.location.lng();

    $('#directions-button').click({origin: oLatLng,
                                   destination: dLatLng},function (event) {
        event.preventDefault();
        console.log("Get Directions!!");

        getDirectionsUrl(event);
    });

  }

  function getDirectionsUrl(e){
    let mode = $("input[name='travel-mode']:checked").val();
    const params = {
      api: 1,
      origin: e.data.origin,
      destination: e.data.destination,
      travelmode: mode
    }

    const queryString = formatQueryParams(params);
    const url = 'https://www.google.com/maps/dir/' + '?' + queryString;


      if( (navigator.platform.indexOf("iPhone") != -1)
        || (navigator.platform.indexOf("iPod") != -1)
        || (navigator.platform.indexOf("iPad") != -1))
      {
        window.open("maps://maps.google.com/maps?daddr=lat,long&amp;ll=");
      }
      else (navigator.platform.indexOf("Win32") != -1)
      {
        // Boston 42.3601, -71.0589
        // Cambridge 42.3736, -71.1097
        window.open(url);
      }

    $('#myModal').css('display', 'none');
    console.log("Close Modal!!");

    }


  function convertRangeToMeters(range) {
    return range * 1609;
  }

  function buildKeyWordList(query) {
    let keyword = ['']

    if (query.coffee) {
      let coffee = ['artisan', 'General', 'roaster', 'coffee', 'cold', 'brew', 'cafe'];
      //let coffee = ['general store'];
      keyword = keyword.concat(coffee);
    } else if (query.bakery) {
      let bakery = ['artisan', 'baker', 'bakery', 'cafe'];
      keyword = keyword.concat(bakery);
    } else if (query.tacos) {
      let tacos = ['street', 'taco', 'tacos', 'street tacos'];
      keyword = keyword.concat(tacos);
    } else if (query.beer) {
      let beer = ['microbrew', 'beer', 'brewery'];
      keyword = keyword.concat(beer);
    }
    console.log("Keywords: " + keyword);
    return keyword;
  }

  function createMarker(place) {
    let placeLoc = place.geometry.location;
    let marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });
  }

  function openSearchOptions() {
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
              <input type="range" min="0" max="20" value = "2" step="1" class="slider-bar" id="snack-range">
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
          <input id="atl-location-address"class="other-location-value" type="text" placeholder=" enter address" required>
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
      event.preventDefault();
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