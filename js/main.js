'use-strict';

// This API key is for demo purposes only and will be disabled
// after the app is checked into the version control system
const apiKey = 'AIzaSyDcyjJ1zUoocLCv9OMS5LCf-CKxPDOkHes'
const searchGeoLocationUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
const distanceService = new google.maps.DistanceMatrixService();
let centerOfSearchLocation = '';

$(document).ready(function () {

  function openLanding() {
    showNavAndFooter(false);
    $('#main').html(`
      <header class="csf_logo" role="banner">
        <img class="ciclismo-img" src="./img/orange-logo.png" alt="ciclismo image">
        <img class="snack-finder-img" src="./img/snackfinder.png" alt="snack finder image">
      </header>
      <section class="landing">
        <button id="start-button" class="start-button" type="submit">start</button>  
        <button id="start-about" class="start-button" type="submit">about</button>  
      </section> 
       <!-- Modal
     modal is hidden until user clicks
     on results list for more details.
    -->
      <div id="myModal" class="snack-modal">
          <!-- Modal content -->
      </div>
    <!-- Modal -->     
`)

    $('#start-button').click(function () {
      console.log("Start Finding Snacks!!");
      openSearchOptions();
    });

    $('#start-about').click(function () {
      console.log("Start Finding Snacks!!");
      let item = 'about';
      openModal(item);
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
        centerOfSearchLocation = geography['lat'] + ',' + geography['lng'];

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
        centerOfSearchLocation = lat + ',' + lng;

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

    const mode = $("input[name='snack-mode']:checked").val();

    let icon = '';

    if (mode === 'beer') {
      icon = `<img class="snack-img"  src="./img/beer.svg">`
    } else if (mode === 'coffee') {
      icon = `<img class="snack-img"  src="./img/coffee.svg">`
    } else if (mode === 'bakery') {
      icon = `<img class="snack-img"  src="./img/muffin.svg">`
    } else if (mode === 'tacos') {
      icon = `<img class="snack-img"  src="./img/taco.svg">`
    }

    // create unordered list container
    $('#main').html(
      `  <div id="map"></div>
          <div>
          <div class="search-feedback">
            <label class="results-feedback">${icon}<i class="fas fa-2x"></i></label>
            <div class="feedback-space"></div>
            <button id="new-search" class="new-search-button" type="submit">new search<i class="fas fa-arrow-circle-right fa-2x"></i></button>
          </div>
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
      zoom: 13,
      mapTypeId: 'terrain',
      zoomControl: true,
      disableDefaultUI: true
    });

    const keywordArr = buildKeyWordList(query);
    const range = convertMilesToMeterforRange(query['snack-range']);

// 0: "liquor_store"​​
// 1: "grocery_or_supermarket"
// 2: "cafe"
// 3: "food"
// 4: "store"
// 5: "point_of_interest"
// 6: "establishment"

    let request = {
      location: latlng,
      radius: range,
      keyword: keywordArr,
      types: ['restaurants', 'bakery', 'cafe', 'grocery_or_supermarket', 'bicycle_store']
    }

    let placesService = new google.maps.places.PlacesService(map);
    placesService.nearbySearch(request, placesListCallback)

    $('#new-search').click(function ({}) {
      openSearchOptions();
    });

  }

  // takes results from Google places and builds
  // list items for results list
  function placesListCallback(results, status) {

    let destinationGeometry = [];

    if (status == google.maps.places.PlacesServiceStatus.OK) {

      createCLSMarker(centerOfSearchLocation);

      let resultList = results.map(r => {

        // this will add  maker on the map
        // to represent the location of the place
        createPlaceMarker(r);

        // add geometery so later we can make a call to the dist matrix service
        destinationGeometry.push({
          'lat': r.geometry.location.lat(),
          'lng': r.geometry.location.lng()
        });

        return `
          <li class="list-item open-modal" data-placeid="${r.place_id}" data-dist="na">
          <div class="list-item-desc">
            <div class="place-name"><h4>${r.name}</h4></div>
            <div class="place-address">${r.vicinity}</div>
          </div>
          <div class="dist-rate">
            <div class="dist-matix-value">na</div>
            <div class="rating">    
                ${createRatingStars(r.rating)}  
            </div>
          </div>
          </li>
          `

      }).join("\n");

      $('#results-list').html(resultList);


    } else if (status === 'ZERO_RESULTS') {

      $('.results-feedback').find('i').addClass('fa-question');

      let noResults = `
                    <li class="list-item">
                      <div class="list-item-no-results">
                      <p>Sorry. It looks like there were no results.</p>
                    </div>
                    </li>
                        `
      $('#results-list').html(noResults);

    }

    getDistance(destinationGeometry);

  }

  function getDistance(destinations) {

    let geo = centerOfSearchLocation.split(',');
    let LatLng = new google.maps.LatLng(geo[0].valueOf(), geo[1].valueOf());
    let origins = [LatLng];
    let distRequest = {
      origins: origins,
      destinations: destinations,
      travelMode: 'WALKING'
    }
    // call service to see how far away the place is
    distanceService.getDistanceMatrix(distRequest, distMatixCallBack);
  }

  // after reciving results from dist matrix
  // update the distance for each place
  function distMatixCallBack(result, status) {

    for (let i = 0; i < result.destinationAddresses.length; i++) {

      let addressTokens = result.destinationAddresses[i].split(',');
      let dist = convertKilometersToMiles(result.rows[0].elements[i].distance.value);

      console.log(addressTokens[0] + ', ' + dist + '  mi.');

      $('li').each(function () {

        let tokens = $(this).find('div.place-address').text().split(',');
        if (tokens[0] === addressTokens[0]) {

          $(this).find('div.dist-matix-value').text(dist+ ' mi');
          $(this).attr('data-dist',dist);

        }
      });
    }

    // sort the result list
    $("#results-list").each(function(){
      $(this).html(

        $(this).children('li').sort(function(a, b){

          return ($(b).attr('data-dist')) < ($(a).attr('data-dist')) ? 1 : -1;

        }));
    });

    $('.open-modal').click(function (item) {
      console.log("Open Modal!!");
      openModal(item);
    });

  }

  // opens detail modal when user clicks
  // on an item in the results list
  function openModal(item) {

    if (item === 'about') {

      $('#myModal').css('display', 'block');

      let resultsHtml = `
       
       <div class="modal-about-content">
          <div class="modal-header">
            <img src="./img/nav-logo-orange.png" alt="ciclismo snack finder image">            
            <!--<span class="close-modal">&times;</span>-->
          </div>
          <div class="modal-body">
            <hr>
            <h3>What is Ciclismo Snack Finder?</h3>
            <br>
            <p>Snacks are a quintessential part of cycling culture. Grabbing a pre-ride coffee, mid-ride scone, or post-ride tacos and beer can often be just as important as the ride itself.</p>
            <br>
            <p>Snack finder's goal is to help locate quality snacks to fill this essential need. This is done by leveraging Google's APIs along with specific keywords to target independent style establishments with artisan coffee, micro brews, or street tacos.</p>
            <br>
            <p>Thanks and let me know what you think.<i class="email fas fa-envelope fa-lg"></i></p>  
          </div>
          <div class="modal-footer">
            <button id="close-modal-button" class="close-modal-button" type="submit">close</button>
          </div>
        </div>
       `

      $('#myModal').html(resultsHtml);

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

      $('.email').click(function () {
        window.open('mailto:td3studios@gmail.com?subject=Ciclismo Snack Finder', 'emailWindow');
      });

    } else {

      let placeId = item.currentTarget.attributes[1].value;
      //let placeId = 'ChIJM0vre7fs44kRkpRi0I7uzmQ';

      let request = {
        placeId: placeId,
        fields: ['name',
          'type',
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
  }

  function placesDetailCallback(place, status) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {

      let span = document.getElementsByClassName("close")[0];

      $('#myModal').css('display', 'block');

      let resultsHtml = `
       
       <section class="modal-directions-content">
          <div class="modal-header">
            <img src="./img/nav-logo-orange.png" alt="ciclismo snack finder image">            
            <!--<span class="close-modal">&times;</span>-->
          </div>
          <div class="modal-direction-body">
            <h2><a href="${place.website}" target="_blank">${place.name}</a></h2>
            <div >
              <p>${place.formatted_phone_number}</p>
              <br>
              <p>${place.formatted_address}</p>
            </div>
            <br>
            <hr>
            <br>
          </div>
            <form id="modal-directions-form">
                        
              <div class="mode-radio-button">
                <div>
                  <label for="walking"><i class="fas fa-walking fa-2x"></i></label>
                </div>
                <div>
                  <label class="switch">
                    <input type="radio" id="walking" name="travel-mode" value="walking" checked>
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>
                            
              <div class="mode-radio-button">
                <div>  
                  <label for="bicycling"><i class="fas fa-bicycle fa-2x"></i></label>
                </div>
                <div>
                  <label class="switch">
                  <input type="radio" id="bicycling" name="travel-mode" value="bicycling">
                  <span class="slider round"></span>
                  </label>
                </div>
              </div>
              
               <div class="mode-radio-button">
                <div>  
                  <label for="transit"><i class="fas fa-subway fa-2x"></i></label>
                </div>
                <div>
                  <label class="switch">
                  <input type="radio" id="transit" name="travel-mode" value="transit">
                  <span class="slider round"></span>
                  </label>
                </div>
              </div>
                                                       
              <div class="mode-radio-button">
                <div> 
                  <label for="driving"><i class="fas fa-car fa-2x"></i></label>
                </div>
                <div>
                  <label class="switch">
                  <input type="radio" id="driving" name="travel-mode" value="driving">
                  <span class="slider round"></span>
                  </label>        
                </div>
              </div>
            
           </form>
           <div class="modal-direction-footer">
            <button id="directions-button" class="directions-button" type="submit">directions</button>
            <button id="close-modal-button" class="close-modal-button" type="submit">close</button>
            </div>
       </section>
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

    let oLatLng = centerOfSearchLocation;
    let dLatLng = place.geometry.location.lat() + "," + place.geometry.location.lng();

    $('#directions-button').click({
      origin: oLatLng,
      destination: dLatLng
    }, function (event) {
      event.preventDefault();
      console.log("Get Directions!!");

      getDirectionsUrl(event);
    });

  }

  function getDirectionsUrl(e) {
    let mode = $("input[name='travel-mode']:checked").val();
    const params = {
      api: 1,
      origin: e.data.origin,
      destination: e.data.destination,
      travelmode: mode
    }

    const queryString = formatQueryParams(params);
    const url = 'https://www.google.com/maps/dir/' + '?' + queryString;


    if ((navigator.platform.indexOf("iPhone") != -1)
      || (navigator.platform.indexOf("iPod") != -1)
      || (navigator.platform.indexOf("iPad") != -1)) {
      window.open("maps://maps.google.com/maps?" + queryString);
    }
    else (navigator.platform.indexOf("Win32") != -1)
    {
      window.open(url);
    }

    $('#myModal').css('display', 'none');
    console.log("Close Modal!!");
  }


  function convertMilesToMeterforRange(range) {
    return range * 1609;
  }

  function convertKilometersToMiles(dist) {
    let d = dist * 0.0006213709999975145;
    return d.toFixed(2);
  }

  function buildKeyWordList(query) {
    let keyword = []

    if (query.coffee) {
      keyword = ['artisan', 'roasters', 'coffee', 'cafe'];
    } else if (query.bakery) {
      keyword = ['artisan', 'baker', 'bakery', 'cafe', 'pastry'];
    } else if (query.tacos) {
      keyword = ['street', 'taco', 'tacos', 'street tacos'];
    } else if (query.beer) {
      keyword = ['microbrew', 'beer', 'brewery', 'brewing', 'craft'];
    }
    console.log("Keywords: " + keyword);
    return keyword;
  }

  // create marker for center of user search location
  function createCLSMarker(user) {
    const loc = user.split(',');
    const latlng = new google.maps.LatLng(loc[0],loc[1]);

    let marker = new google.maps.Marker({
      map: map,
      position: latlng,
      title: 'You are here!',
      icon: './img/csfflag_2.png'
    });
  }

  // create marker so place can be identified on the map
  function createPlaceMarker(place) {
    let placeLoc = place.geometry.location;

    let marker = new google.maps.Marker({
      map: map,
      position: placeLoc,
      title:place.name
    });
  }

  function createRatingStars (rating){
    const solidIcon = `<i class="fas fa-star"></i>`;
    const halfIcon = `<i class="fas fa-star-half-alt"></i>`
    const emptyIcon = `<i class="far fa-star"></i>`;
    const ratingTxt = ''+rating;

    let r = ratingTxt.split('.');
    const solid = r[0].valueOf();
    let half =  (r[1]) ? r[1].valueOf() : 0;


    let itemHtml = ``;
    let counter = 1;

    while (counter <= 5){

      if (counter <= solid){
        itemHtml = itemHtml + solidIcon;
        counter++;
      }else if (counter <= 5 && (half != null && half >= 5)){
        itemHtml = itemHtml + halfIcon;
        half = 0;
        counter++;
      } else {
        itemHtml = itemHtml + emptyIcon;
        counter++;
      }
    }
    return itemHtml;
  }

  function openSearchOptions() {
    showNavAndFooter(true);

    $('#main').html(`
      <section class="search-option-section">
        <form id="find-snacks" method="get">
        <div class="option-switchs">
        
        <div class="top-options-spacer"></div>
        
          <div class="switch-row">
            <div class="switch-row-div1">
              <label><img class="snack-img" src="./img/coffee.svg"></label>
            </div>
            <div class="switch-row-div2">
              <label class="switch">
                <input id="coffee"  type="radio" name="snack-mode" value="coffee" checked>
                <span class="slider round"></span>
              </label>
            </div>
          </div> 
        
          <div class="switch-row">
            <div class="switch-row-div1">
              <label><img class="snack-img"  src="./img/muffin.svg"></label>
            </div>
            <div class="switch-row-div2">
            <label class="switch">
              <input id="bakery"   type="radio" name="snack-mode" value="bakery">
              <span class="slider round"></span>
            </label>
            </div>
          </div>
        
          <div class="switch-row">
             <div class="switch-row-div1">
              <label><img class="snack-img"  src="./img/taco.svg"></label>
             </div>
             <div class="switch-row-div2">
               <label class="switch">
                <input id="tacos" type="radio" name="snack-mode" value="tacos">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        
          <div class="switch-row">
            <div class="switch-row-div1">
              <label><img class="snack-img"  src="./img/beer.svg"></i></label> 
            </div>
            <div class="switch-row-div2">
            <label class="switch">
              <input id="beer" type="radio" name="snack-mode" value="beer">
              <span class="slider round"></span>
            </label>
            </div>
          </div>
          <div class="options-spacer"></div>
          <div class="slider-row">
            <label for="snack-range"><span  class="snack-range-value">1</span> mile radius from:</label>   
            <input type="range" min="0" max="20" value = "1" step="1" class="slider-bar" id="snack-range">      
          </div>
        <div class="options-spacer"></div>
        <div class="alert"></div>
          <div class="switch-row near-me">
            <div class="switch-row-div1">
              <label>current location</label> 
            </div>
            <div class="switch-row-div2">
              <label class="switch">
              <input id="near-me" type="checkbox" required>
             <span class="slider round"></span>
            </label>
            </div>
          </div>
          
        <div class="switch-row other-location">
          <div class="switch-row-div1">
            <label>alt-location</label> 
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
         
        </form>
         <button class="find-snacks-button" type="submit">Find Snacks</button>  
      </section>
     <!-- Modal
     modal is hidden until user clicks
     on results list for more details.
    -->
      <div id="myModal" class="snack-modal">
          <!-- Modal content -->
      </div>
    <!-- Modal -->
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


    $('#near-me').on('invalid', function (event) {
      console.log('must select a location option');
      $('.alert').text('Please select a location option');
    })
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

    let key = $("input[name='snack-mode']:checked").val();

    query[key] = true;

    getLocationCoords(query);

  }

  function toggleLocationOption(set) {

    if (set === "nearon") {

      $('.alert').text('');
      $('.other-location').hide("fast");
      $('.other-location-value').attr('required', false);

    } else if (set === "nearoff") {

      $('.other-location').show("fast");

    } else if (set === "otheron") {

      $('.alert').text('');
      $('.near-me').hide("fast");
      $('#near-me').attr('required', false);
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
      console.log("Open About Modal!!");

      let item = 'about';
      openModal(item);
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
      console.log("Open About Modal!!");

      let item = 'about';
      openModal(item);
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

})
;
