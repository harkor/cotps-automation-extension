  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === 'are_you_there_content_script?') {
      sendResponse({status: "yes"});
    }
  });

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  let $wrap = document.querySelector('.transaction-wrap');

  let $debugBlock = document.createElement('div');
  
  debugHTML = '';
  debugHTML += '<h1>Script activated</h1>';
  debugHTML += '<ul>';
    debugHTML += '<li class="wallet">Wallet: <span class="value"></span> $</li>';
    debugHTML += '<li class="acceptation">Acceptation: <span class="value"></span> $</li>';
    debugHTML += '<li class="refresh">Next refresh in <span class="value"></span> s</li>';
    // debugHTML += '<li class="total">Total: <span class="value"></span></li>';
  debugHTML += '</ul>';

  $debugBlock.innerHTML = debugHTML;

  $debugBlock.classList.add('debugbar');

  $wrap.appendChild($debugBlock);

  console.log('Script injected');

  var initInterval = setInterval(function(){

    if(isLoading() == false){
      clearInterval(initInterval);
      init();
    }
    
  }, 500);

  async function init(){
    
    console.log('App is loaded');

    document.querySelectorAll('.uni-tabbar-bottom .uni-tabbar__item').forEach(function(item){

      item.addEventListener('click', function(){

        var $page = document.querySelector('uni-page');
        var url = $page.getAttribute('data-page');
        console.log(url);
  
      });

    });

    checkWallet();
    checkAcceptation();

    doOrder();

    // if(canMakeOrder()){
    //   console.log('we can do order and we do it');
    //   doOrder();
    // } else {
    //   console.log('We can\'t do order actually');
    // }

    checkLastOrder();

  }

  function checkWallet(){

    var $wallet = document.querySelector('.division-right .division-num');
    var balance = parseFloat($wallet.innerHTML);

    if(balance < 5){
      $wallet.classList.add('money-too-low');
    } else {
      $wallet.classList.remove('money-too-low');
    }

    console.log('Wallet : ' + balance);

    document.querySelector('.debugbar .wallet .value').innerHTML = balance;

    return balance;

  }

  function checkAcceptation(){

    var $wallet = document.querySelector('.division-left .division-num');
    var balance = parseFloat($wallet.innerHTML);

    console.log('Acceptation : '+balance);

    document.querySelector('.debugbar .acceptation .value').innerHTML = balance;

    return balance;

  }

  function canMakeOrder(){

    var status = false;

    if(checkWallet() > 5){
      status = true;
    } else {
      status = false;
    }

    return status;

  }

  async function doOrder(){

    if(canMakeOrder()){
    
      document.querySelector('.orderBtn').click();
      await sleep(10000);
      document.querySelector('.fui-dialog__inner .buttons uni-button[type=primary]').click();
      await sleep(10000);
      document.querySelector('.fui-wrap__show uni-button[type=primary]').click();

    } else {

      console.log('Refresh in 5 minutes');
      
      var counter = 5 * 60;
      setInterval(function(){
        counter--;
        document.querySelector('.debugbar .refresh .value').innerHTML = counter;

        if(counter == 0){
          location.reload();
        }
      }, 1000);

    }

    await sleep(10000);
    doOrder();

  }

  function isLoading(){

    var isLoading = false;

    var $unitoast = document.querySelectorAll('uni-toast');
    if($unitoast.length > 0){
      $unitoast.forEach(function(item){
        var $unitoastContent = $unitoast[0].querySelector('.uni-toast__content');
        var text = $unitoastContent.innerHTML.trim();
          
        if(text == 'loading'){
          isLoading = true;
        }

      });

    }

    return isLoading;

  }

  function checkLastOrder(){

    var $records = document.querySelectorAll('.record-list');

    if($records.length >= 2){  
      
      var time = document.querySelectorAll('.record-list')[1].querySelector('.time').innerHTML;
      time = time.split(' ');
      date = time[0].split('-');
      time = time[1].split(':');

      var myDate = new Date();
      myDate.setDate(date[1]);
      myDate.setMonth(date[0]-1);
      myDate.setHours(time[0], time[1], 0);

      // console.log(myDate);

    }

  }
