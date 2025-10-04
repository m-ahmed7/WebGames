//declaring suits and values in array
var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
var values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var deck = new Array();
var players = new Array();
var currentPlayer = 0;

// Game statistics
var handnumber = 0;
var currentBet = 0;
var playerChips = 1000;
var totalWins = 0;
var totalLosses = 0;
var totalDraws = 0;
var gameInProgress = false;

// initialize deck of cards with all 52 cards
function createDeck() {
    deck = new Array();
    for (var i = 0; i < values.length; i++) {
        for (var x = 0; x < suits.length; x++) {
            var scores = parseInt(values[i]);
            if (values[i] == "J" || values[i] == "Q" || values[i] == "K")
                scores = 10;
            if (values[i] == "A")
                scores = 11;
            var card = { Value: values[i], Suit: suits[x], Scores: scores };
            deck.push(card);
        }
    }
}

// initializing players
function createPlayers(num, defaultName) {
    players = new Array();
    for (var i = 1; i <= num; i++) {
        var hand = new Array();
        var playerName = (i === 1) ? defaultName : 'The House';
        var player = { Name: playerName, ID: i, Points: 0, Hand: hand };
        players.push(player);
    }
}

function createPlayersUI() {
    document.getElementById('players').innerHTML = '';
    for (var i = 0; i < players.length; i++) {
        var div_player = document.createElement('div');
        var div_playerid = document.createElement('div');
        var div_hand = document.createElement('div');
        var div_points = document.createElement('div');
        div_points.className = 'points';
        div_points.id = 'points_' + i;
        div_player.id = 'player_' + i;
        div_player.className = 'player';
        div_hand.id = 'hand_' + i;
        div_playerid.innerHTML = players[i].Name;
        div_player.appendChild(div_playerid);
        div_player.appendChild(div_hand);
        div_player.appendChild(div_points);
        document.getElementById('players').appendChild(div_player);
    }
}

//shuffling all the cards in the deck as they were initialized orderly
function shuffle() {
    for (var i = 0; i < 500; i++) {
        var location1 = Math.floor((Math.random() * deck.length));
        var location2 = Math.floor((Math.random() * deck.length));
        var tmp = deck[location1];
        deck[location1] = deck[location2];
        deck[location2] = tmp;
    }
}

// Place bet function
function placeBet(amount) {
    if (gameInProgress) {
        alert('Finish the current hand first!');
        return;
    }
    
    if (playerChips < amount) {
        alert('Not enough chips! You have ' + playerChips + ' chips.');
        return;
    }
    
    currentBet = amount;
    playerChips -= amount;
    updateChipsDisplay();
    
    // Disable bet buttons and enable game buttons
    disableBetButtons(true);
    enableGameButtons(true);
    
    var username = getCurrentUsername();
    startblackjack(username);
}

// function called when clicked deal (starts game)
function begin() {
    if (!gameInProgress) {
        alert('Please place a bet first!');
        return;
    }
}

// starts the game calling other functions
function startblackjack(username) {
    document.getElementById("status").style.display = "none";
    gameInProgress = true;
    currentPlayer = 0;
    createDeck();
    shuffle();
    createPlayers(2, username);
    createPlayersUI();
    dealHands();
    document.getElementById('player_' + currentPlayer).classList.add('active');
    handnumber = handnumber + 1;
    document.getElementById('hn').innerHTML = handnumber;
    
    // Update bet display
    document.getElementById('currentBet').innerHTML = currentBet;
}

// deals cards 2 to each player
function dealHands() {
    for (var i = 0; i < 2; i++) {
        for (var x = 0; x < players.length; x++) {
            var card = deck.pop();
            players[x].Hand.push(card);
            renderCard(card, x);
            updatePoints();
        }
    }
    updateDeck();
    
    // Check for blackjack
    if (players[0].Points === 21) {
        if (players[1].Points === 21) {
            endGame('push');
        } else {
            endGame('blackjack');
        }
    }
}

function renderCard(card, player) {
    var hand = document.getElementById('hand_' + player);
    hand.appendChild(getCardUI(card));
}

// card design
function getCardUI(card) {
    var el = document.createElement('div');
    var icon = '';
    var color = '';
    
    if (card.Suit == 'Hearts') {
        icon = '♥';
        color = 'red';
    } else if (card.Suit == 'Spades') {
        icon = '♠';
        color = 'black';
    } else if (card.Suit == 'Diamonds') {
        icon = '♦';
        color = 'red';
    } else {
        icon = '♣';
        color = 'black';
    }
    
    el.className = 'card';
    el.style.color = color;
    el.innerHTML = card.Value + '<br/>' + icon;
    return el;
}

// returns the number of points that a player has in hand
function getPoints(player) {
    var points = 0;
    var aces = 0;
    
    for (var i = 0; i < players[player].Hand.length; i++) {
        points += players[player].Hand[i].Scores;
        if (players[player].Hand[i].Value === 'A') {
            aces++;
        }
    }
    
    // Adjust for aces if bust
    while (points > 21 && aces > 0) {
        points -= 10;
        aces--;
    }
    
    players[player].Points = points;
    return points;
}

function updatePoints() {
    for (var i = 0; i < players.length; i++) {
        getPoints(i);
        document.getElementById('points_' + i).innerHTML = players[i].Points;
    }
}

// deals another card to the player
function hitMe() {
    if (!gameInProgress) {
        alert('Please place a bet to start a new hand!');
        return;
    }
    
    var card = deck.pop();
    players[currentPlayer].Hand.push(card);
    renderCard(card, currentPlayer);
    updatePoints();
    updateDeck();
    check();
}

// ends your turn
function stay() {
    if (!gameInProgress) {
        alert('Please place a bet to start a new hand!');
        return;
    }
    
    if (currentPlayer != players.length - 1) {
        document.getElementById('player_' + currentPlayer).classList.remove('active');
        currentPlayer += 1;
        document.getElementById('player_' + currentPlayer).classList.add('active');
        
        // House AI logic - hits until 18 or higher
        while (players[1].Points < 18) {
            var card = deck.pop();
            players[1].Hand.push(card);
            renderCard(card, 1);
            updatePoints();
            updateDeck();
            
            if (players[1].Points >= 18) {
                break;
            }
        }
    }
    
    // Determine winner
    determineWinner();
}

// Determine the winner
function determineWinner() {
    var playerScore = players[0].Points;
    var houseScore = players[1].Points;
    
    if (houseScore > 21) {
        endGame('housebusted');
    } else if (playerScore > houseScore) {
        endGame('win');
    } else if (houseScore > playerScore) {
        endGame('loss');
    } else {
        endGame('push');
    }
}

// outputs result of the hand
function endGame(result) {
    gameInProgress = false;
    var message = '';
    var winAmount = 0;
    
    switch(result) {
        case 'blackjack':
            message = '🎉 BLACKJACK! You win ' + (currentBet * 2.5) + ' chips!';
            winAmount = currentBet * 2.5;
            playerChips += currentBet + winAmount;
            totalWins++;
            break;
        case 'win':
            message = '🎊 You Win! You won ' + (currentBet * 2) + ' chips!';
            winAmount = currentBet * 2;
            playerChips += winAmount;
            totalWins++;
            break;
        case 'housebusted':
            message = '💥 The House Busted! You win ' + (currentBet * 2) + ' chips!';
            winAmount = currentBet * 2;
            playerChips += winAmount;
            totalWins++;
            break;
        case 'loss':
            message = '😞 The House Wins. You lost ' + currentBet + ' chips.';
            totalLosses++;
            break;
        case 'playerbusted':
            message = '💀 You Busted! You lost ' + currentBet + ' chips.';
            totalLosses++;
            break;
        case 'push':
            message = '🤝 Push! Your bet of ' + currentBet + ' chips is returned.';
            playerChips += currentBet;
            totalDraws++;
            break;
    }
    
    document.getElementById('status').innerHTML = message;
    document.getElementById("status").style.display = "inline-block";
    
    // Update displays
    updateChipsDisplay();
    updateStats();
    
    // Save player data
    savePlayerData();
    
    // Enable bet buttons for next round
    disableBetButtons(false);
    enableGameButtons(false);
    
    // Check if player is out of chips
    if (playerChips <= 0) {
        setTimeout(function() {
            alert('You are out of chips! Game Over.');
            window.location.href = 'index.html';
        }, 2000);
    }
}

// checks if score is above 21 to end game
function check() {
    if (players[currentPlayer].Points > 21) {
        endGame('playerbusted');
    }
}

function updateDeck() {
    document.getElementById('deckcount').innerHTML = deck.length;
}

function updateChipsDisplay() {
    document.getElementById('playerChips').innerHTML = playerChips;
}

function updateStats() {
    document.getElementById('totalWins').innerHTML = totalWins;
    document.getElementById('totalLosses').innerHTML = totalLosses;
    document.getElementById('totalDraws').innerHTML = totalDraws;
}

function disableBetButtons(disable) {
    var buttons = document.querySelectorAll('.bet-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = disable;
        if (disable) {
            buttons[i].style.opacity = '0.5';
            buttons[i].style.cursor = 'not-allowed';
        } else {
            buttons[i].style.opacity = '1';
            buttons[i].style.cursor = 'pointer';
        }
    }
}

function enableGameButtons(enable) {
    document.getElementById('hitBtn').disabled = !enable;
    document.getElementById('stayBtn').disabled = !enable;
    
    if (enable) {
        document.getElementById('hitBtn').style.opacity = '1';
        document.getElementById('stayBtn').style.opacity = '1';
    } else {
        document.getElementById('hitBtn').style.opacity = '0.5';
        document.getElementById('stayBtn').style.opacity = '0.5';
    }
}

// Get current logged in username
function getCurrentUsername() {
    var urlParams = new URLSearchParams(window.location.search);
    var username = urlParams.get('username');
    
    if (!username) {
        var storedData = localStorage.getItem("userData");
        if (storedData) {
            var parsed = JSON.parse(storedData);
            username = parsed.username;
        } else {
            username = "Guest";
        }
    }
    
    return username;
}

window.addEventListener('load', function () {
    createDeck();
    shuffle();
    
    // Display username if on game page
    var displayElement = document.getElementById('displayUsername');
    if (displayElement) {
        var username = getCurrentUsername();
        displayElement.textContent = username;
        loadPlayerData(username);
    }
    
    // Disable game buttons initially
    if (document.getElementById('hitBtn')) {
        enableGameButtons(false);
    }
});

// Save player data
function savePlayerData() {
    var username = getCurrentUsername();
    var playerData = {
        username: username,
        chips: playerChips,
        hands: handnumber,
        wins: totalWins,
        losses: totalLosses,
        draws: totalDraws
    };
    localStorage.setItem('player_' + username, JSON.stringify(playerData));
}

// Load player data
function loadPlayerData(username) {
    var data = localStorage.getItem('player_' + username);
    if (data) {
        var parsed = JSON.parse(data);
        playerChips = parsed.chips || 1000;
        handnumber = parsed.hands || 0;
        totalWins = parsed.wins || 0;
        totalLosses = parsed.losses || 0;
        totalDraws = parsed.draws || 0;
        
        updateChipsDisplay();
        updateStats();
        document.getElementById('hn').innerHTML = handnumber;
    }
}

// storing registration details and validating when logging in
function register() {
    var email = document.getElementById('email').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var passcheck = document.getElementById('repassword').value;
    var color = document.getElementById('color').value;
    
    if ((email != "") && (username != "") && (password != "") && (color != "")) {
        // password validation
        var passPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
        if (!passPattern.test(password)) {
            alert("Password must contain at least one number, one uppercase, one lowercase letter, and be at least 6 characters long.");
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            alert("Please enter a valid email address");
            return;
        }
        if (password != passcheck) {
            alert('Passwords Do Not Match');
            return;
        }
        
        //creating an object to store details
        var regDetails = {
            username: username,
            password: password,
            email: email,
            color: color
        };
        
        // Store user details
        var userDataStr = JSON.stringify(regDetails);
        localStorage.setItem("userData_" + username, userDataStr);
        
        // Initialize player with 1000 chips
        var playerData = {
            username: username,
            chips: 1000,
            hands: 0,
            wins: 0,
            losses: 0,
            draws: 0
        };
        localStorage.setItem('player_' + username, JSON.stringify(playerData));
        
        alert('Registration successful! You received 1000 chips!');
        window.location.href = 'index.html';
    } else {
        alert('Fill in all Details');
    }
}

//check for details to allow log in
function login() {
    var loginUsername = document.getElementById('loginUsername').value;
    var loginPassword = document.getElementById('loginPassword').value;
    
    var storedData = localStorage.getItem("userData_" + loginUsername);
    
    if (storedData) {
        var storedDetails = JSON.parse(storedData);
        var holdUsername = storedDetails.username;
        var holdPassword = storedDetails.password;
        
        if (loginUsername == holdUsername && loginPassword == holdPassword) {
            window.location.href = "game.html?username=" + encodeURIComponent(holdUsername);
        } else {
            alert('Invalid username or password');
        }
    } else {
        alert('No user found with this username. Please register first.');
    }
}

// Update leaderboard
function updateLeaderboard() {
    if (document.body.id === "userScoresPage") {
        var leaderboardArray = [];
        
        // Get all player data from localStorage
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key.startsWith('player_')) {
                var data = JSON.parse(localStorage.getItem(key));
                leaderboardArray.push([data.username, data.chips, data.wins, data.losses]);
            }
        }
        
        if (leaderboardArray.length > 0) {
            // Sort by chips descending
            leaderboardArray.sort(function(a, b) {
                return b[1] - a[1];
            });
            
            var table = document.createElement('table');
            var headerRow = table.insertRow(0);
            headerRow.innerHTML = '<th>Rank</th><th>Username</th><th>Chips</th><th>Wins</th><th>Losses</th>';
            
            for (var i = 0; i < leaderboardArray.length; i++) {
                var row = table.insertRow();
                row.innerHTML = '<td>' + (i + 1) + '</td><td>' + leaderboardArray[i][0] + '</td><td>' + leaderboardArray[i][1] + '</td><td>' + leaderboardArray[i][2] + '</td><td>' + leaderboardArray[i][3] + '</td>';
            }
            
            document.body.appendChild(table);
        } else {
            document.body.innerHTML += '<p style="text-align:center; color: #d4af37; font-size: 1.5em; margin-top: 50px;">No players yet. Register and play!</p>';
        }
    }
}

// to clear the leaderboard data
function clearLeaderboard() {
    if (confirm('Are you sure you want to clear all player data? This cannot be undone!')) {
        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);
            if (key.startsWith('player_')) {
                localStorage.removeItem(key);
            }
        }
        location.reload();
    }
}