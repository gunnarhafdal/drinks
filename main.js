var Mustache = require('mustache');
Array.prototype.removeAt = function(id) {
    for (var item in this) {
        if (this[item].id == id) {
            this.splice(item, 1);
            return true;
        }
    }
    return false;
}

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
    return false;
  }
  var id = this.getAttribute("data-id");
  data.drinkers.removeAt(id);
  localStorage.setItem('drinkers', JSON.stringify(data));
  renderList();
}

function addBeer (e) {
  var id = this.getAttribute("data-id");
  data.drinkers.forEach(function(person){
    if (person.id == id) {
      person.beerCount = parseInt(person.beerCount) + 1;
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
  });
  localStorage.setItem('drinkers', JSON.stringify(data));
  renderList();
}

function renderList () {
  // first we remove all event listeners on the buttons
  var beerme = document.querySelectorAll('.beerme');
  var deleteme = document.querySelectorAll('.deleteme');
  if (beerme.length > 0) {
    for (var i = 0; i < beerme.length; i++) {
      beerme[i].removeEventListener('click', addBeer);
    };
  }
  if (deleteme.length > 0) {
    for (var i = 0; i < deleteme.length; i++) {
      deleteme[i].removeEventListener('click', removePerson);
    };
  }

  var rendered = Mustache.render(template, data);
  document.querySelector('#drinkers').innerHTML = rendered;

  var totalBeers = 0;
  data.drinkers.forEach(function(person){
    totalBeers = totalBeers + parseInt(person.beerCount);
  });

  var totalRendered = Mustache.render(totalTemplate, {beers: totalBeers*10});
  document.querySelector('#total').innerHTML = totalRendered;

  // then we add them again
  beerme = document.querySelectorAll('.beerme');
  deleteme = document.querySelectorAll('.deleteme');
  if (beerme.length > 0) {
    for (var i = 0; i < beerme.length; i++) {
      beerme[i].addEventListener('click', addBeer);
    };
  }
  if (deleteme.length > 0) {
    for (var i = 0; i < deleteme.length; i++) {
      deleteme[i].addEventListener('click', removePerson);
    };
  }
}

function sendList () {
  var totalBeers = 0;
  data.drinkers.forEach(function(person){
    totalBeers = totalBeers + parseInt(person.beerCount);
  });

  var date = new Date();
  var emailBody = Mustache.render(emailTemplate, {totalAmount: totalBeers*10, drinkers: data.drinkers, date: date});
  
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

  document.querySelector('#addPerson').addEventListener('click', addPerson);
  document.querySelector('#resetList').addEventListener('click', resetList);
  document.querySelector('#sendList').addEventListener('click', sendList);
}

function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
ready(setup);
