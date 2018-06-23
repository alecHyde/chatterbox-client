// YOUR CODE HERE:

// app function - class... store fetching and posting functionality. makes a new object every time a fetch or get is called

// init - method on the app class that fetches the data

// app behavior - should send, fetch, control chatroom behavior, and respond to events (add freinds and send messages)


class App {
  constructor() {
    this.server = 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/';
    this.friends = [];
    this.refer = this;
    this.message = {
      username: window.location.search.split('=')[window.location.search.split('=').length - 1],
      objectId: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      text: undefined,
      roomname: 'lobby'
    };
  }
  
  init() {
    var thisApp = this;
    $(document).ready(function() {
      $('#refreshButton').on('click', () => {
        console.log(thisApp);
        thisApp.refresh();
      });
      
      thisApp.handleSubmit();
      
      thisApp.handleUsernameClick();
      
    })
    
  }
  
  send(message) {
    this.message = message;
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
      type: 'POST',
      data: JSON.stringify(this.message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  }
  
  fetch() {
    // $.get('http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/', objectKeys,
    //   function(data) {
    //     console.log(data.results);
    //     filterPost(data.results, 'lobby', originalLength);
    //   });
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/',
      type: 'GET',
      data: {order: '-createdAt', limit: 200},
      dataType: 'json',
      contentType: 'application/json',
      success: (data) => {
        console.log(data.results);
        this.filterPost(data.results, 'lobby');
        this.init();
      },
      error: (data) => {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to request message', data);
      }
    });
    
  }
  
  renderMessage(message, currentRoomOnPage) {
    currentRoomOnPage = currentRoomOnPage || 'lobby'
    this.composeMessage(this.translatePost(message), currentRoomOnPage)
  }
  
  renderRoom(room) {
    if (!$('#roomSelect')) {
      var rooms = document.createElement('div');
      rooms.id = 'roomSelect';
      $('#chats').append(rooms);
    }
    var newRoom = document.createElement('div');
    newRoom.id = room;
    $('#roomSelect').append(newRoom);
  }
  
  clearMessages() {
    $('#chats').empty();
  }
  
  handleUsernameClick() {
    var thisApp = this;
    return $('a').on('click', function(event) {
      if (thisApp.friends.indexOf($(this).data('username')) <= -1) {
        thisApp.friends.push($(this).data('username'));
      }
      var div = $('#chats').children();
      for (var i = 0; i < div.length; i++) {
        if ($(div[i]).children()[0].className.includes($(this).data('username'))) {
          $($(div[i]).children()[1]).addClass(' boldFriends');
        }
      }
    });
  }
  
  handleSubmit() {
    var thisApp = this;
    return $('#submitButton').on('click', function(event) {
      thisApp.message.text = $('#inputArea').val();
      thisApp.send(thisApp.message);
      thisApp.refresh();
      event.preventDefault();
    });
    
  }
  
  refresh() {
    this.clearMessages();
    this.fetch();
    // $.ajax({
    //   // This is the url you should use to communicate with the parse API server.
    //   url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/',
    //   type: 'GET',
    //   dataType: 'json',
    //   contentType: 'application/json',
    //   success: function (data) {
    //     console.log(data.results);
    //     filterPost(data.results, 'lobby', originalLength);
    //     originalLength = data.results.length;
    //   },
    //   error: function (data) {
    //     // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
    //     console.error('chatterbox: Failed to request message', data);
    //   }
    // });
  }
  
  escapeString(str) {
    if (str != undefined) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    } else {
      return 'Don\'t give me null value you sucker';
    }
  };
  
  isFriend(name) {
    // returns a boolean
    if (this.friends.indexOf(name) === -1) {
      return false;
    } else {
      return true;
    }
  }
  
  
  filterPost(dataArray, room) {
    // iterate over the data array
    var safeDataArray = [];
    for (var i = 0; i < dataArray.length; i++) {
      var safeObj = this.translatePost(dataArray[i]);
      safeDataArray.push(safeObj);
    }
    for (var j = 0; j < safeDataArray.length; j++) {
      this.composeMessage(safeDataArray[j], room);
    }  
    //// create a new object for each item in the array
    //// pass information to the new object through the escape string function
    //// decide which room collection array the message should be sent to
    // get from another helper function  
    // use new object to create the messages
  }
  
  translatePost(untranslatedObj) {
    var newObj = {};
    for (var key in untranslatedObj) {
      newObj[key] = this.escapeString(untranslatedObj[key]);
    }
    return newObj;
  }
  
  composeMessage(escapedObj, currentRoomOnPage) {
    // use key value pairs from object to create a message for the feed
    // include message, time created (decide if necessary later), username
    // push the message to the site
    var message = escapedObj.text;
    var username = escapedObj.username;
    var room = escapedObj.roomname;
    var friendBool = this.isFriend(username);
    
    if (currentRoomOnPage === 'lobby' || room === currentRoomOnPage) {
      var node = document.createElement("div");
      node.className += 'node';
      // add message to div as p
      var paragraph = document.createElement('p');
      // add username to div as h5
      var usernameHeader = document.createElement('a');
      
      if (friendBool) {
        // make message bold using an additional class
        paragraph.className += 'boldFriends';
      }
      paragraph.append(message);
      node.append(paragraph);
      usernameHeader.prepend(username);
      usernameHeader.append(': ');
      $(usernameHeader).attr("href", "#");
      $(usernameHeader).data('username', username);
      usernameHeader.className += username;
      usernameHeader.className += ' usernameHeader';
      node.prepend(usernameHeader);
      // add the node to the chats div
      $('#chats').append(node);
    } 
  }
}

var app = new App();

// var message = {
//   objectId: undefined,
//   username: 'shawndrost',
//   createdAt: undefined,
//   updatedAt: undefined,
//   text: 'trololo',
//   roomname: '4chan'
// };

// var escapeString = function(str) {
//   return str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
// };

// // make a click event that adds username to array when that username is clicked
// var friends = [ ];

app.init();
app.fetch();

// $(document).ready(function() {
  
//   var fetchData = function() {
//     objectKeys = {order: '-createdAt', limit: 200};
//     // $.get('http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/', objectKeys,
//     //   function(data) {
//     //     console.log(data.results);
//     //     filterPost(data.results, 'lobby', originalLength);
//     //   });
//   };
  
  
//   var originalLength = 0;
//   // $.ajax({
//   //   // This is the url you should use to communicate with the parse API server.
//   //   url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
//   //   type: 'GET',
//   //   dataType: 'json',
//   //   contentType: 'application/json',
//   //   success: function (data) {
//   //     console.log(data.results);
//   //     filterPost(data.results, 'lobby', originalLength);
//   //     originalLength = data.results.length;
//   //   },
//   //   error: function (data) {
//   //     // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//   //     console.error('chatterbox: Failed to request message', data);
//   //   }
//   // });
//   // display message received from the parse server
//   //// ajax request
//   ////// pass the data to the helper function which will append the data to the dom
//   //// create rooms?
//   ////// filter data and decide if it should be displayed at the current chat board
//   //// button to refresh and run ajax request
//   ////// or setInterval to automatically run the ajax request to update the dom if new data is available
  
//   // trigger when page is first loaded or when user press refresh button
//   //// make new object with all text for each component filtered through the escapeString helper function.  
//   //// use information to make message object (with some info from the object, but not all info) and prepend to the chat div
//   $('#refreshButton').on('click', function() {
    
    
//     $.ajax({
//       // This is the url you should use to communicate with the parse API server.
//       url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages/',
//       type: 'GET',
//       dataType: 'json',
//       contentType: 'application/json',
//       success: function (data) {
//         console.log(data.results);
//         filterPost(data.results, 'lobby', originalLength);
//         originalLength = data.results.length;
//       },
//       error: function (data) {
//         // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//         console.error('chatterbox: Failed to request message', data);
//       }
//     });
//   });
  
  
  // var isFriend = function(name) {
  //   // returns a boolean
  //   if (friends.indexOf(name) === -1) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // };
  
  
  // var filterPost = function(dataArray, room, originalLength) {
    
  //   // iterate over the data array
  //   var safeDataArray = [];
  //   for (var i = originalLength; i < dataArray.length; i++) {
  //     var safeObj = translatePost(dataArray[i]);
  //     safeDataArray.push(safeObj);
  //   }
    
  //   for (var j = 0; j < safeDataArray.length; j++) {
  //     composeMessage(safeDataArray[j], room);
  //   }  
  //   //// create a new object for each item in the array
  //   //// pass information to the new object through the escape string function
  //   //// decide which room collection array the message should be sent to
    
  //   // get from another helper function  
  //   // use new object to create the messages
  // };
  
  // var translatePost = function(untranslatedObj) {
  //   var newObj = {};
  //   for (var key in untranslatedObj) {
  //     newObj[key] = escapeString(untranslatedObj[key]);
  //   }
  //   return newObj;
  // };
  
  // var composeMessage = function(escapedObj, currentRoomOnPage) {
  //   // use key value pairs from object to create a message for the feed
  //   // include message, time created (decide if necessary later), username
  //   // push the message to the site
  //   var message = escapedObj.text;
  //   var username = escapedObj.username;
  //   var room = escapedObj.roomname;
  //   var friendBool = isFriend(username);
    
  //   if (currentRoomOnPage === 'lobby' || room === currentRoomOnPage) {
  //     var node = document.createElement("div");
  //     node.className += 'node';
  //     // add message to div as p
  //     var paragraph = document.createElement('p');
  //     // add username to div as h5
  //     var usernameHeader = document.createElement('h3');
      
  //     if (friendBool) {
  //       // make message bold using an additional class
  //       paragraph.className += 'boldFriends';
  //     }
  //     paragraph.append(message);
  //     node.append(paragraph);
  //     usernameHeader.prepend(username);
  //     usernameHeader.append(': ');
  //     node.prepend(usernameHeader);
  //     // add the node to the chats div
  //     $('#chats').prepend(node);
  //   } 
  // };
  
  
        
        
//   // post messages to the server
//   //// submit button is pressed
//   ////// if text box has input
//   //////// post
//   $('#submitButton').on('click', function(event) {
//     console.log($('#inputArea').val());
//     event.preventDefault();
//   });
  
  
  
  
  
  
  
//   fetchData();
  
//   // when the message is typed into the text box and submit button is pressed.
  // $.ajax({
  //   // This is the url you should use to communicate with the parse API server.
  //   url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
  //   type: 'POST',
  //   data: JSON.stringify(message),
  //   contentType: 'application/json',
  //   success: function (data) {
  //     console.log('chatterbox: Message sent');
  //   },
  //   error: function (data) {
  //     // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
  //     console.error('chatterbox: Failed to send message', data);
  //   }
  // });
//   // // setInterval or refresh button
//   // $.ajax({
//   //   // This is the url you should use to communicate with the parse API server.
//   //   url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
//   //   type: 'GET',
//   //   dataType: 'json',
//   //   contentType: 'application/json',
//   //   success: function (data) {
//   //     console.log(data);
//   //   },
//   //   error: function (data) {
//   //     // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//   //     console.error('chatterbox: Failed to request message', data);
//   //   }
//   // });
// });
