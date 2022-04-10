// Disable multiple injection on same tab
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text === 'are_you_there_content_script?') {
    sendResponse({status: "yes"});
  }
});

// chrome.storage.local.clear(['refreshStepIndex']);

class COTPSBot {

  constructor(){

    var parent = this;

    this.$wrap = document.querySelector('.transaction-wrap');
    this.$debugBlock;
    this.wallets = {};
    this.counterInterval;
    this.currentUrl;
    this.refreshStepIndex;
    this.nextRefreshStepIndex;

    this.refreshSteps = [
      100 * 60, // 1h40
      10 * 60, // 10 min
      5 * 60, // 5 min
      2 * 60, // 2 min
    ];

    this.createDebugbar();

    this.setMinWallet(5);
    this.setWallet(0);
    this.setTransaction(0);
    this.setTotal(0);
    
    // Check when loading is over
    this.initInterval = setInterval(function(){

      if(parent.isLoading() == false){
        clearInterval(parent.initInterval);
        parent.init();
      }
      
    }, 500);

  }

  createDebugbar(){

    this.$debugBlock = document.createElement('div');

    var debugHTML = '';

    debugHTML += '<h1>Bot</h1>';

    debugHTML += '<ul>';
      debugHTML += '<li class="wallet">Wallet: <span class="value">?</span>$</li>';
      debugHTML += '<li class="transaction">In transaction: <span class="value">?</span>$</li>';
      debugHTML += '<li class="total">Total: <span class="value">?</span>$</li>';
    debugHTML += '</ul>';

    debugHTML += '<ul>';
      debugHTML += '<li class="minWallet">Minimum balance to make order(s): <span class="value">?</span>$</li>';
    debugHTML += '</ul>';

    debugHTML += '<ul>';
      debugHTML += '<li class="refresh">Refresh in <span class="value">?</span> seconds</li>';
    debugHTML += '</ul>';

    this.$debugBlock.classList.add('debugbar');
    this.$debugBlock.innerHTML = debugHTML;

    // Add result to wrapper
    this.$wrap.appendChild(this.$debugBlock);

  }

  init(){

    var parent = this;

    console.log('App is loaded');

    document.querySelectorAll('.uni-tabbar-bottom .uni-tabbar__item').forEach(function(item){

      item.addEventListener('click', function(){

        var $page = document.querySelector('uni-page');
        this.url = $page.getAttribute('data-page');
  
      });

    });

    var wallets = this.checkWallets();
    this.setMinWallet( (wallets.total * 1) - 5 ); // Do order only if we have receive 90% of our total

    chrome.storage.local.get(['refreshStepIndex'], function(result) {

      if(result.refreshStepIndex == undefined){
        result.refreshStepIndex = 0;
      }

      parent.setRefreshStepIndex(result.refreshStepIndex);    
      parent.doOrder(); // Try to make order on load
    
    });

  }

  isLoading(){

    var status = false;

    var $unitoast = document.querySelectorAll('uni-toast');
    if($unitoast.length > 0){
      $unitoast.forEach(function(item){
        var $unitoastContent = $unitoast[0].querySelector('.uni-toast__content');
        var text = $unitoastContent.innerHTML.trim();
          
        if(text == 'loading'){
          status = true;
        }

      });

    }

    return status;

  }

  checkWallets(){

    // Wallet
    var $wallet = document.querySelector('.division-right .division-num');
    var walletBalance = parseFloat($wallet.innerHTML);
    this.setWallet(walletBalance);

    if(walletBalance < this.minimumWallet){
      $wallet.classList.add('money-too-low');
    } else {
      $wallet.classList.remove('money-too-low');
    }

    // Transaction
    var $transaction = document.querySelector('.division-left .division-num');
    var transactionBalance = parseFloat($transaction.innerHTML);
    this.setTransaction(transactionBalance)

    // Total
    var $total = document.querySelector('.money-num');
    var totalBalance = parseFloat($total.innerHTML);
    this.setTotal(totalBalance);

    return this.wallets;

  }

  canMakeOrder(){

    var status = false;

    if(this.checkWallets().wallet > this.minimumWallet){
      status = true;
    } else {
      status = false;
    }

    return status;

  }

  async doOrder(){

    var parent = this;

    console.log(this.refreshStepIndex);


    if(this.canMakeOrder()){

      chrome.storage.local.clear(['refreshStepIndex']);
      this.setRefreshStepIndex(0);

      this.setMinWallet(5);
    
      document.querySelector('.orderBtn').click();
      await sleep(10000);
      document.querySelector('.fui-dialog__inner .buttons uni-button[type=primary]').click();
      await sleep(10000);
      document.querySelector('.fui-wrap__show uni-button[type=primary]').click();

      await sleep(10000);
      this.doOrder();

    } else {

      var nextRefreshStepIndex = this.refreshStepIndex + 1;
  
      if(this.refreshSteps[nextRefreshStepIndex] == undefined){
        nextRefreshStepIndex = this.refreshSteps.length-1;
      }

      this.saveRefreshStepIndex(nextRefreshStepIndex);
      
      var counter = this.refreshSteps[this.refreshStepIndex];
      this.counterInterval = setInterval(function(){
        counter--;
        document.querySelector('.debugbar .refresh .value').innerHTML = counter;

        if(counter <= 0){
          location.reload();
        }
      }, 1000);

    }

  }

  // WIP
  checkLastOrder(){

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

    }

  }

  setMinWallet(value){
    this.minimumWallet = value;
    this.$debugBlock.querySelector('.minWallet .value').innerHTML = value;
  }

  setWallet(value){
    this.wallets.wallet = value;
    this.$debugBlock.querySelector('.wallet .value').innerHTML = value;
  }

  setTransaction(value){
    this.wallets.in_transaction = value;
    this.$debugBlock.querySelector('.transaction .value').innerHTML = value;
  }

  setTotal(value){
    this.wallets.total = value;
    this.$debugBlock.querySelector('.total .value').innerHTML = value;
  }

  setRefreshStepIndex(value){
    this.refreshStepIndex = value;
  }

  saveRefreshStepIndex(value){
    chrome.storage.local.set({'refreshStepIndex': value});
  }

}

console.log('Bot injected');

new COTPSBot;

const sleep = ms => new Promise(r => setTimeout(r, ms));
