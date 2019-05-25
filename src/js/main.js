'use-strict';

function openLanding() {
  showNavAndFooter(false);
  $('#main').html(`
      <header class="csf_logo" role="banner">
        <img src="./img/CiclismoSnackFinderLogo.png" alt="ciclismo snack finder image">
      </header>
      <section class="landing">
        LANDING PAGE!!
        <button id="start_button" class="start_button" type="submit">Start</button>  
      </section>
`)

  $('.start_button').click(function () {
    console.log("Start Finding Snacks!!");
    openSearchOption();
  });
}

function openSearchOption (){
  showNavAndFooter(true);

  $('#main').html(`
      <section class="search-option-section">
        <form>
        <div class="option-switchs">
        <div class="switch-row">
          <div class="switch-row-div1">
            <label>java</label>
          </div>
          <div class="switch-row-div2">
            <label class="switch">
              <input type="checkbox">
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
            <input type="checkbox">
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
              <input type="checkbox">
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
            <input type="checkbox">
            <span class="slider round"></span>
          </label>
          </div>
        </div>
        <div class="slider-row">
          <input type="range" min="1" max="100" value="50" class="slider-bar" id="myRange">
        </div>
        <button type="submit">Find Snacks</button>
        </form>  
      </section>
`)
}

function showNavAndFooter (visibile) {
  if(visibile){
    $(".nav").css('display', 'flex');
    $(".nav").css('visibility', 'visible');
    $("footer").css('visibility', 'visible');
  }else {
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

function closeNavPanel () {
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
