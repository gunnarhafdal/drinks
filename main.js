Array.prototype.removeAt = function(id) {
    for (var item in this) {
        if (this[item].id == id) {
            this.splice(item, 1);
            return true;
        }
    }
    return false;
}

var m = µ;

var data = {drinkers: []}, template, totalTemplate, emailTemplate;

if(!localStorage.drinkers){
  localStorage.setItem('drinkers', JSON.stringify(data));
}

function addPerson(e){
  var person = {}
  person.name = prompt("Vinsamlegast skráið inn nafn á leikmann", "");
  if (person.name == null) {
    return false;
  }
  person.beerCount = 0;
  person.practiceBeerCount = 0;
  
  if (data.drinkers.length === 0) {
    person.id = 0;
  } else {
    person.id = parseInt(data.drinkers[data.drinkers.length-1].id) + 1;
  }

  data.drinkers.push(person);
  localStorage.setItem('drinkers', JSON.stringify(data));
  renderList();
}

function removePerson (e) {
  if (!confirm('Ertu viss að þú viljir eyða út þessum leikmanni?')) {
    m('.menu-wrapper').addClass('hide');
    return false;
  }
  var id = e.target.getAttribute("data-id");
  data.drinkers.removeAt(id);
  localStorage.setItem('drinkers', JSON.stringify(data));
  renderList();
  m('.menu-wrapper').addClass('hide');
}

function renamePerson (e) {
  var newName = prompt('Nýtt nafn leikmanns', '');
  if(newName !== null){
    var id = e.target.getAttribute("data-id");
    data.drinkers.forEach(function(person){
      if (person.id == id) {
        person.name = newName;
        localStorage.setItem('drinkers', JSON.stringify(data));
        renderList();
      }
    });
  }
  m('.menu-wrapper').addClass('hide');
  return true;
}

function addBeer (e) {
  var id = e.target.getAttribute("data-id");
  data.drinkers.forEach(function(person){
    if (person.id == id) {
      person.beerCount = parseInt(person.beerCount) + 1;
      person.practiceBeerCount = parseInt(person.practiceBeerCount) + 1;
      localStorage.setItem('drinkers', JSON.stringify(data));
      renderList();
      return true;
    }
  });
}

function removeBeer (e) {
  var id = e.target.getAttribute("data-id");
  data.drinkers.forEach(function(person){
    if (person.id == id) {
      person.beerCount = parseInt(person.beerCount) - 1;
      person.practiceBeerCount = parseInt(person.practiceBeerCount) - 1;
      localStorage.setItem('drinkers', JSON.stringify(data));
      renderList();
      return true;
    }
  });
}

function resetList (e) {
  if (!confirm('Ertu viss?')) {
    return false;
  }
  data.drinkers.forEach(function(person){
    person.beerCount = 0;  
    person.practiceBeerCount = 0;  
  });
  localStorage.setItem('drinkers', JSON.stringify(data));
  renderList();
}

function resetPracticeList (e) {
  if (!confirm('Ertu viss?')) {
    return false;
  }
  data.drinkers.forEach(function(person){ 
    person.practiceBeerCount = 0;  
  });
  localStorage.setItem('drinkers', JSON.stringify(data));
  renderList();
}

function renderList () {  
  var rendered = Mustache.render(template, data);
  document.querySelector('#drinkers').innerHTML = rendered;

  var totalBeers = 0;
  data.drinkers.forEach(function(person){
    totalBeers = totalBeers + parseInt(person.beerCount);
  });

  var totalRendered = Mustache.render(totalTemplate, {beers: totalBeers*10});
  document.querySelector('#total').innerHTML = totalRendered;

  // then we add them again
  m('.beerup').on('click', addBeer);
  m('.beerdown').on('click', removeBeer);
  m('.delete').on('click', removePerson);
  m('.rename').on('click', renamePerson);
  m('.js-menu').on('click', function(e) {
    console.log(this);
    var wrapper = this.querySelector('.menu-wrapper');

    if (wrapper.classList.contains('hide')) {
      m('.menu-wrapper').addClass('hide');
      m('body').addClass('show-overlay');
      wrapper.classList.remove('hide');
    } else{
      wrapper.classList.add('hide');
      m('body').removeClass('show-overlay');
    };

    
  });

}

function sendList () {
  var totalBeers = 0;
  data.drinkers.forEach(function(person){
    totalBeers = totalBeers + parseInt(person.beerCount);
  });

  var view = {
    totalAmount: totalBeers*10,
    drinkers: data.drinkers, 
    date: date,
    debt: function(){
      var price = this.beerCount * 10;
      return price+"kr";
    },
    beerText: function() {
      return  (this.beerCount % 10 !== 1 || this.beerCount % 100 === 11) ? "bjóra" : "bjór";
    }
  };

  var date = new Date();
  var emailBody = Mustache.render(emailTemplate, view);
  
  var link = "mailto:" + "?subject="+encodeURIComponent("Drykkja: " + date) + "&body=" + encodeURIComponent(emailBody);
  window.location.href = link;  
}

function setup () {
  template = document.querySelector('#person').innerHTML;
  Mustache.parse(template);
  totalTemplate = document.querySelector('#totalTemplate').innerHTML;
  Mustache.parse(totalTemplate);
  emailTemplate = document.querySelector('#emailTemplate').innerHTML;
  Mustache.parse(emailTemplate);

  data = JSON.parse(localStorage.getItem('drinkers'));
  renderList();

  m('#addPerson').on('click', addPerson);
  m('#resetList').on('click', resetList);
  m('#resetPracticeList').on('click', resetPracticeList);
  m('#sendList').on('click', sendList);

  m('.js-overlay').on('click', function(e){
    m('.menu-wrapper').addClass('hide');
    m('body').removeClass('show-overlay');
  });
  FastClick.attach(document.body);
}

function handleAppCache() {
  /**
   * Here is the simplified version. Courtesy of Mike Koss.
   * 
   * See, http://labnote.beedesk.com/the-pitfalls-of-html5-applicationcache
   */
  if (applicationCache == undefined) {
    return;
  }
  
  if (applicationCache.status == applicationCache.UPDATEREADY) {
    applicationCache.swapCache();
    location.reload();
    return;
  }
  
  applicationCache.addEventListener('updateready', handleAppCache, false);
}

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
handleAppCache();
ready(setup);
