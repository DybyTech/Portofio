// Éléments du DOM
const board = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');
const modeSelector = document.getElementById('mode');
const levelSelector = document.getElementById('level');
const restartButton = document.getElementById('restart');
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');
const congrats = document.getElementById('congrats');
const congratsMessage = document.getElementById('congrats-message');
const newGameButton = document.getElementById('new-game');

// Variables du jeu
let selectedPiece = null;
let currentPlayer = 2; // 1: noir, 2: rouge
let gameMode = 'ai';
let gameLevel = 'easy';
let mustCapture = false;
let lastCapturePos = null;
let aiPlaying = false;

// Plateau initial
const initialBoard = [
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0]
];

// Initialisation du jeu
function initGame() {
  createBoard();
  updateTurnIndicator();
  addEventListeners();
}

// Création du plateau
function createBoard() {
  board.innerHTML = '';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if ((row + col) % 2 === 0) cell.classList.add('white');
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      const pieceValue = initialBoard[row][col];
      if (pieceValue !== 0) {
        const piece = document.createElement('div');
        piece.className = 'piece';
        piece.classList.add(pieceValue === 1 ? 'player1' : 'player2');
        piece.dataset.player = pieceValue;
        piece.dataset.king = 'false';
        cell.appendChild(piece);
      }
      
      cell.addEventListener('click', () => handleCellClick(row, col));
      board.appendChild(cell);
    }
  }
}

// Gestion du clic sur une case
function handleCellClick(row, col) {
  if (gameMode === 'ai' && currentPlayer === 1) return;
  if (aiPlaying) return;
  
  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  const piece = cell.querySelector('.piece');
  
  // Si on clique sur une pièce du joueur courant
  if (piece && parseInt(piece.dataset.player) === currentPlayer) {
    selectPiece(piece);
  } 
  // Si on a sélectionné une pièce et qu'on clique sur une case vide
  else if (selectedPiece && !piece) {
    const fromRow = parseInt(selectedPiece.parentElement.dataset.row);
    const fromCol = parseInt(selectedPiece.parentElement.dataset.col);
    
    if (isValidMove(fromRow, fromCol, row, col)) {
      movePiece(fromRow, fromCol, row, col);
      
      // Vérifier si on peut capturer à nouveau
      const isKing = selectedPiece.dataset.king === 'true';
      if (mustCapture && canCaptureAgain(row, col, isKing)) {
        lastCapturePos = {row, col};
      } else {
        endTurn();
      }
    }
  }
}

// Sélectionner une pièce
function selectPiece(piece) {
  // Désélectionner la pièce précédente
  if (selectedPiece) {
    selectedPiece.classList.remove('selected');
  }
  
  selectedPiece = piece;
  selectedPiece.classList.add('selected');
  
  // Vérifier les captures obligatoires
  const fromRow = parseInt(piece.parentElement.dataset.row);
  const fromCol = parseInt(piece.parentElement.dataset.col);
  mustCapture = getCaptureMoves(fromRow, fromCol).length > 0;
  
  // Surligner les mouvements possibles
  highlightValidMoves(fromRow, fromCol);
}

// Surligner les cases valides
function highlightValidMoves(fromRow, fromCol) {
  // Effacer les surlignages précédents
  document.querySelectorAll('.cell.highlight').forEach(cell => {
    cell.classList.remove('highlight');
  });
  
  const moves = mustCapture ? 
    getCaptureMoves(fromRow, fromCol) : 
    getSimpleMoves(fromRow, fromCol);
  
  moves.forEach(move => {
    const cell = document.querySelector(`.cell[data-row="${move.toRow}"][data-col="${move.toCol}"]`);
    cell.classList.add('highlight');
  });
}

// Obtenir les mouvements simples
function getSimpleMoves(fromRow, fromCol) {
  const piece = document.querySelector(`.cell[data-row="${fromRow}"][data-col="${fromCol}"] .piece`);
  if (!piece) return [];
  
  const player = parseInt(piece.dataset.player);
  const isKing = piece.dataset.king === 'true';
  const moves = [];
  
  // Directions possibles
  const directions = isKing ? 
    [{row: -1, col: -1}, {row: -1, col: 1}, {row: 1, col: -1}, {row: 1, col: 1}] :
    (player === 1 ? 
      [{row: 1, col: -1}, {row: 1, col: 1}] : 
      [{row: -1, col: -1}, {row: -1, col: 1}]);
  
  for (const dir of directions) {
    const toRow = fromRow + dir.row;
    const toCol = fromCol + dir.col;
    
    if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) {
      const cell = document.querySelector(`.cell[data-row="${toRow}"][data-col="${toCol}"]`);
      if (!cell.querySelector('.piece')) {
        moves.push({toRow, toCol});
      }
    }
  }
  
  return moves;
}

// Obtenir les captures possibles
function getCaptureMoves(fromRow, fromCol) {
  const piece = document.querySelector(`.cell[data-row="${fromRow}"][data-col="${fromCol}"] .piece`);
  if (!piece) return [];
  
  const player = parseInt(piece.dataset.player);
  const isKing = piece.dataset.king === 'true';
  const moves = [];
  
  // Directions possibles
  const directions = isKing ? 
    [{row: -1, col: -1}, {row: -1, col: 1}, {row: 1, col: -1}, {row: 1, col: 1}] :
    (player === 1 ? 
      [{row: 1, col: -1}, {row: 1, col: 1}] : 
      [{row: -1, col: -1}, {row: -1, col: 1}]);
  
  for (const dir of directions) {
    // Case adjacente
    const adjRow = fromRow + dir.row;
    const adjCol = fromCol + dir.col;
    
    if (adjRow >= 0 && adjRow < 8 && adjCol >= 0 && adjCol < 8) {
      const adjCell = document.querySelector(`.cell[data-row="${adjRow}"][data-col="${adjCol}"]`);
      const adjPiece = adjCell.querySelector('.piece');
      
      // Si case adjacente a une pièce ennemie
      if (adjPiece && parseInt(adjPiece.dataset.player) !== player) {
        // Case après la pièce ennemie
        const jumpRow = adjRow + dir.row;
        const jumpCol = adjCol + dir.col;
        
        if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
          const jumpCell = document.querySelector(`.cell[data-row="${jumpRow}"][data-col="${jumpCol}"]`);
          
          // Si case de saut est vide
          if (!jumpCell.querySelector('.piece')) {
            moves.push({
              toRow: jumpRow, 
              toCol: jumpCol,
              capturedRow: adjRow,
              capturedCol: adjCol
            });
          }
        }
      }
    }
  }
  
  return moves;
}

// Vérifier si un mouvement est valide
function isValidMove(fromRow, fromCol, toRow, toCol) {
  const piece = document.querySelector(`.cell[data-row="${fromRow}"][data-col="${fromCol}"] .piece`);
  const player = parseInt(piece.dataset.player);
  const isKing = piece.dataset.king === 'true';
  
  // Vérifier si c'est une capture obligatoire
  const allCaptureMoves = getAllCaptureMoves(player);
  if (allCaptureMoves.length > 0) {
    const isCaptureMove = allCaptureMoves.some(move => 
      move.fromRow === fromRow && 
      move.fromCol === fromCol && 
      move.toRow === toRow && 
      move.toCol === toCol
    );
    if (!isCaptureMove) return false;
  }
  
  // Vérifier les mouvements simples si pas de capture obligatoire
  const simpleMoves = getSimpleMoves(fromRow, fromCol);
  const isSimpleMove = simpleMoves.some(move => 
    move.toRow === toRow && move.toCol === toCol
  );
  
  return isSimpleMove || allCaptureMoves.some(move => 
    move.toRow === toRow && move.toCol === toCol
  );
}

// Obtenir toutes les captures possibles pour un joueur
function getAllCaptureMoves(player) {
  const pieces = document.querySelectorAll(player === 1 ? '.piece.player1' : '.piece.player2');
  const captureMoves = [];
  
  pieces.forEach(piece => {
    const fromRow = parseInt(piece.parentElement.dataset.row);
    const fromCol = parseInt(piece.parentElement.dataset.col);
    const moves = getCaptureMoves(fromRow, fromCol);
    
    moves.forEach(move => {
      captureMoves.push({
        fromRow, fromCol,
        toRow: move.toRow,
        toCol: move.toCol,
        capturedRow: move.capturedRow,
        capturedCol: move.capturedCol
      });
    });
  });
  
  return captureMoves;
}

// Déplacer une pièce
function movePiece(fromRow, fromCol, toRow, toCol) {
  const fromCell = document.querySelector(`.cell[data-row="${fromRow}"][data-col="${fromCol}"]`);
  const toCell = document.querySelector(`.cell[data-row="${toRow}"][data-col="${toCol}"]`);
  const piece = fromCell.querySelector('.piece');
  
  // Vérifier si c'est une capture
  const captureMoves = getCaptureMoves(fromRow, fromCol);
  const captureMove = captureMoves.find(move => 
    move.toRow === toRow && move.toCol === toCol
  );
  
  if (captureMove) {
    // Supprimer la pièce capturée
    const capturedCell = document.querySelector(
      `.cell[data-row="${captureMove.capturedRow}"][data-col="${captureMove.capturedCol}"]`
    );
    capturedCell.removeChild(capturedCell.querySelector('.piece'));
    mustCapture = true;
  }
  
  // Déplacer la pièce
  toCell.appendChild(piece);
  
  // Promotion en dame
  if ((currentPlayer === 1 && toRow === 7) || (currentPlayer === 2 && toRow === 0)) {
    piece.dataset.king = 'true';
    piece.classList.add('king');
  }
  
  checkWin();
}

// Vérifier si on peut capturer à nouveau
function canCaptureAgain(row, col, isKing) {
  return getCaptureMoves(row, col).length > 0;
}

// Fin du tour
function endTurn() {
  if (selectedPiece) {
    selectedPiece.classList.remove('selected');
    selectedPiece = null;
  }
  mustCapture = false;
  lastCapturePos = null;
  
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateTurnIndicator();
  
  if (gameMode === 'ai' && currentPlayer === 1) {
    aiPlaying = true;
    setTimeout(playAI, 500);
  } else {
    aiPlaying = false;
  }
}

// Jouer l'IA
function playAI() {
  // Priorité aux captures
  const captureMoves = getAllCaptureMoves(1);
  
  if (captureMoves.length > 0) {
    const move = gameLevel === 'easy' ? 
      captureMoves[Math.floor(Math.random() * captureMoves.length)] :
      findBestCaptureMove(captureMoves);
    
    const piece = document.querySelector(`.cell[data-row="${move.fromRow}"][data-col="${move.fromCol}"] .piece`);
    selectPiece(piece);
    
    setTimeout(() => {
      movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
      
      // Vérifier si on peut capturer à nouveau
      const isKing = document.querySelector(
        `.cell[data-row="${move.toRow}"][data-col="${move.toCol}"] .piece`
      ).dataset.king === 'true';
      
      if (canCaptureAgain(move.toRow, move.toCol, isKing)) {
        setTimeout(playAI, 500);
      } else {
        endTurn();
      }
    }, 500);
  } 
  
  // Sinon, mouvement simple
  else {
    const pieces = document.querySelectorAll('.piece.player1');
    const validPieces = [];
    
    pieces.forEach(piece => {
      const fromRow = parseInt(piece.parentElement.dataset.row);
      const fromCol = parseInt(piece.parentElement.dataset.col);
      if (getSimpleMoves(fromRow, fromCol).length > 0) {
        validPieces.push({piece, fromRow, fromCol});
      }
    });
    
    if (validPieces.length > 0) {
      const randomIndex = Math.floor(Math.random() * validPieces.length);
      const {piece, fromRow, fromCol} = validPieces[randomIndex];
      const moves = getSimpleMoves(fromRow, fromCol);
      const move = moves[Math.floor(Math.random() * moves.length)];
      
      selectPiece(piece);
      
      setTimeout(() => {
        movePiece(fromRow, fromCol, move.toRow, move.toCol);
        endTurn();
      }, 500);
    } else {
      // Aucun mouvement possible
      checkWin();
      endTurn();
    }
  }
}

// Trouver la meilleure capture pour l'IA
function findBestCaptureMove(captureMoves) {
  // Priorité 1: Captures qui mènent à une promotion
  const promotionMoves = captureMoves.filter(move => 
    move.toRow === 7 || (document.querySelector(`.cell[data-row="${move.fromRow}"][data-col="${move.fromCol}"] .piece`).dataset.king === 'true')
  );
  
  if (promotionMoves.length > 0) {
    return promotionMoves[0];
  }
  
  // Priorité 2: Captures qui capturent une dame
  const kingCaptureMoves = captureMoves.filter(move => {
    const capturedPiece = document.querySelector(`.cell[data-row="${move.capturedRow}"][data-col="${move.capturedCol}"] .piece`);
    return capturedPiece && capturedPiece.dataset.king === 'true';
  });
  
  if (kingCaptureMoves.length > 0) {
    return kingCaptureMoves[0];
  }
  
  // Sinon, capture aléatoire
  return captureMoves[Math.floor(Math.random() * captureMoves.length)];
}

// Vérifier la victoire
function checkWin() {
  const player1Pieces = document.querySelectorAll('.piece.player1').length;
  const player2Pieces = document.querySelectorAll('.piece.player2').length;
  
  if (player1Pieces === 0) {
    showCongrats("Le joueur rouge a gagné !");
  } else if (player2Pieces === 0) {
    showCongrats("Le joueur noir a gagné !");
  }
}

// Afficher le message de victoire
function showCongrats(message) {
  congratsMessage.textContent = message;
  congrats.style.display = 'block';
}

// Cacher le message de victoire
function hideCongrats() {
  congrats.style.display = 'none';
}

// Mettre à jour l'indicateur de tour
function updateTurnIndicator() {
  turnIndicator.textContent = currentPlayer === 2 ? 
    'Tour du joueur rouge' : 
    'Tour du joueur noir';
}

// Ajouter les écouteurs d'événements
function addEventListeners() {
  // Menu hamburger
  hamburger.addEventListener('click', () => {
    menu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
  
  // Sélecteur de mode
  modeSelector.addEventListener('change', (e) => {
    gameMode = e.target.value;
    resetGame();
  });
  
  // Sélecteur de niveau
  levelSelector.addEventListener('change', (e) => {
    gameLevel = e.target.value;
  });
  
  // Boutons
  restartButton.addEventListener('click', resetGame);
  newGameButton.addEventListener('click', resetGame);
}

// Reset le jeu
function resetGame() {
  createBoard();
  currentPlayer = 2;
  selectedPiece = null;
  mustCapture = false;
  lastCapturePos = null;
  aiPlaying = false;
  updateTurnIndicator();
  hideCongrats();
}

// Start le jeu
initGame();