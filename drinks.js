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
  person.name = prompt("Vinsamlegast skráið inn nafn á leikmann");
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
  var id = $(this).data('id');
  data.drinkers.removeAt(id);
  localStorage.setItem('drinkers', JSON.stringify(data));
  renderList();
}

function addBeer (e) {
  var id = $(this).data('id');
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
  var rendered = Mustache.render(template, data);
  $('#drinkers').html(rendered);

  var totalBeers = 0;

  data.drinkers.forEach(function(person){
    totalBeers = totalBeers + parseInt(person.beerCount);
  });

  var totalRendered = Mustache.render(totalTemplate, {beers: totalBeers*10});
  $('#total').html(totalRendered);
}

function sendList () {
  var totalBeers = 0;
  data.drinkers.forEach(function(person){
    totalBeers = totalBeers + parseInt(person.beerCount);
  });

  var date = new Date();

  var emailBody = Mustache.render(emailTemplate, {totalAmount: totalBeers*10, drinkers: data.drinkers, date: date});
  console.log(emailBody);

  var link = "mailto:" + "?subject="+encodeURIComponent("Drykkja: " + date) + "&body=" + encodeURIComponent(emailBody);
  console.log(link);
  window.location.href = link;  
}




function setup () {
  template = $('#person').html();
  Mustache.parse(template);
  totalTemplate = $('#totalTemplate').html();
  Mustache.parse(totalTemplate);
  emailTemplate = $('#emailTemplate').html();
  Mustache.parse(emailTemplate);

  data = JSON.parse(localStorage.getItem('drinkers'));
  renderList();

  $(document).on('click', '#addPerson', addPerson);
  $(document).on('click', '.beerme', addBeer);
  $(document).on('click', '.deleteme', removePerson);
  $(document).on('click', '#resetList', resetList);
  $(document).on('click', '#sendList', sendList);
}

Zepto(function($){
  setup();
})
