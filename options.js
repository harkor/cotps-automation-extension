// chrome.storage.local.clear(['options']);

var $form = document.querySelector('form');

getOptions();

document.querySelector('.copyright span.extension-version').innerHTML = chrome.runtime.getManifest().version;

$form.addEventListener('submit', function(e){

  e.preventDefault();

  var $button = this.querySelector('button[type=submit]');
  var datas = new FormData($form);
  options = serialize(datas);
  chrome.storage.local.set({'options': options});
  chrome.storage.local.remove(['refreshStepIndex']);

  $button.innerHTML = 'Saved';
  $notif = document.querySelector('.saved-notif');
  $notif.classList.add('show');

  setTimeout(function(){
    $button.innerHTML = 'Save';
  }, 1000);

  setTimeout(function(){
    
    $notif.classList.remove('show');
    $notif.classList.add('hide');

    setTimeout(function(){
      $notif.classList.remove('hide');
    }, 1000);

  }, 3000);

});

$form.querySelector('.btn-reset').addEventListener('click', function(e){
  
  e.preventDefault();

  chrome.storage.local.remove(['options', 'refreshStepIndex']);

  location.reload();

});


function getOptions(){

  chrome.storage.local.get('options', (data) => {
    console.log(data);
    if(data.options != undefined){
      console.log('options loaded');
      populateForm($form, data.options);
    } else {
      console.log('need to load default options');
      httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = optionsLoaded;
      httpRequest.open('GET', './defaultOptions.json');
      httpRequest.send();
    }  
  });

}

function optionsLoaded(){

  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
      populateForm($form, JSON.parse(httpRequest.response));
    }
  }

}

function populateForm($form, options){  
  for (const [key, value] of Object.entries(options)) {
    var $element = $form.querySelector('#'+key);
    $element.value = value;
  }
}


/*!
 * Serialize all form data into an object
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {FormData} data The FormData object to serialize
 * @return {String}        The serialized form data
 */
function serialize (data) {
	let obj = {};
	for (let [key, value] of data) {
		if (obj[key] !== undefined) {
			if (!Array.isArray(obj[key])) {
				obj[key] = [obj[key]];
			}
			obj[key].push(value);
		} else {
			obj[key] = value;
		}
	}
	return obj;
}
