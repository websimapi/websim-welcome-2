document.getElementById('generateBtn').addEventListener('click', generateCard);

async function getPokemonDescription() {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a creative description for a completely new, unique Pogemon. The name should be original and meaningful, derived from a combination of Latin, Greek, or English root words that relate to the Pogemon's characteristics. For example:
        - "Sylphoon" (from sylph: air spirit + typhoon)
        - "Luminox" (from lumino: light + nox: night)
        - "Dendrovern" (from dendro: tree + vernal: spring)
        
        Be imaginative and original - do not reuse existing Pogemons. Include its type, height, weight, and a brief poetic description of its appearance and behavior. The description should capture the whimsical and magical nature of the Pogemon world. Each response should be different from previous ones.

        interface Response {
          name: string;
          description: string;
          type: string;
          height: string;
          weight: string;
        }

        Example response (generate something completely different):
        {
          "name": "Pyroxian",
          "description": "A mystical fire-psychic Pogemon whose crystalline body channels volcanic energies into mesmerizing displays of mental prowess. Its presence warms the mind as much as the air around it.",
          "type": "Fire/Psychic",
          "height": "1.8m",
          "weight": "45kg"
        }`,
        data: ""
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pogemon description:', error);
    return {
      name: 'Error',
      description: 'Failed to generate Pogemon description',
      type: 'Unknown',
      height: 'Unknown',
      weight: 'Unknown'
    };
  }
}

async function generatePokemonImage(description) {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a unique image URL for a cartoon Pogemon based on this description: "cartoon Pogemon ${description}". Each response should be different and creative. Return a URL to an image that matches the description.

        interface Response {
          imageUrl: string;
        }

        Example response (generate something different):
        {
          "imageUrl": "https://example.com/pogemon-image.jpg"
        }`,
        data: description
      }),
    });
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating Pogemon image:', error);
    return null;
  }
}

async function generateCard() {
  // Remove existing card and submenu if any
  const existingCard = document.querySelector('.card');
  const existingSubmenu = document.querySelector('.submenu');
  if (existingCard) {
    existingCard.remove();
  }
  if (existingSubmenu) {
    existingSubmenu.remove();
  }

  // Create new card with front and back
  const cardContainer = document.getElementById('cardContainer');
  const card = document.createElement('div');
  card.className = 'card';
  
  // Create card inner structure with initial flipped state
  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner flipped';
  
  cardInner.innerHTML = `
    <div class="card-front">
      <h2 class="pokemon-name"></h2>
      <div class="card-image-container"></div>
      <div class="stats-container">
        <div class="type-wrapper"></div>
        <p class="pokemon-stats"></p>
      </div>
      <div class="card-description">
        <p class="pokemon-description"></p>
      </div>
    </div>
    <div class="card-back">
      <div class="card-back-design">
        <svg class="card-back-logo" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
          <circle cx="50" cy="50" r="20" fill="currentColor"/>
          <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div class="card-back-pattern"></div>
      </div>
    </div>
  `;
  
  card.appendChild(cardInner);
  
  // Create submenu but start hidden
  const submenu = document.createElement('div');
  submenu.className = 'submenu hidden';
  
  // Create submenu content with placeholder data
  submenu.innerHTML = `
    <div class="submenu-grid">
      <div class="stat-box">
        <div class="stat-label">Name</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Type</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Height</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Weight</div>
        <div class="stat-value">???</div>
      </div>
    </div>
    <div class="description-box">
      <div class="description-title">Description</div>
      <div class="full-description">Generate a Pogemon to see its description!</div>
    </div>
  `;
  
  cardContainer.appendChild(submenu);

  // Get Pokemon description from LLM
  const pokemonData = await getPokemonDescription();

  // Update submenu content but keep it hidden
  const statValues = submenu.querySelectorAll('.stat-value');
  statValues[0].textContent = pokemonData.name;
  statValues[1].textContent = pokemonData.type;
  statValues[2].textContent = pokemonData.height;
  statValues[3].textContent = pokemonData.weight;
  
  submenu.querySelector('.full-description').textContent = pokemonData.description;

  // Generate image based on description
  const imageUrl = await generatePokemonImage(`cartoon Pogemon ${pokemonData.description}`);
  
  // Move cardData declaration earlier
  const cardData = {
    name: pokemonData.name,
    description: pokemonData.description,
    type: pokemonData.type,
    height: pokemonData.height,
    weight: pokemonData.weight,
    imageUrl: imageUrl
  };

  // After successfully generating image, upload a backup
  if (imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${pokemonData.name}.png`, { type: 'image/png' });
      const backupImageUrl = await websim.upload(file);
      cardData.backupImageUrl = backupImageUrl;
    } catch (error) {
      console.error('Failed to create backup image:', error);
      // Continue without backup URL if upload fails
    }
  }

  // Modify the image creation and load handler
  if (imageUrl) {
    const pokemonImage = document.createElement('img');
    pokemonImage.id = `pokemon-${Date.now()}`; // Unique ID
    pokemonImage.className = 'pokemon-image hidden'; // Add hidden class initially
    pokemonImage.src = imageUrl;
    pokemonImage.alt = `cartoon Pogemon ${pokemonData.description} - ${pokemonData.name} cartoon Pogemon`;
    
    // Add load and error event listeners
    pokemonImage.addEventListener('load', async function() {
      const actualSrc = this.currentSrc || this.src;
      // Only show and save if the source isn't our text string
      if (!actualSrc.includes('cartoon Pogemon')) {
        this.classList.remove('hidden');
        // Update the cardData with the actual resolved URL
        cardData.imageUrl = actualSrc;
        await saveCard(cardData);
      }
    });
    
    pokemonImage.addEventListener('error', function() {
      this.classList.add('hidden');
    });
    
    const imageContainer = card.querySelector('.card-image-container');
    imageContainer.appendChild(pokemonImage);
  }
  
  // Create and append Pokemon info elements
  const nameElement = card.querySelector('.pokemon-name');
  nameElement.textContent = pokemonData.name;
  
  // Create stats container with new compact layout
  const statsContainer = card.querySelector('.stats-container');
  
  const types = pokemonData.type.split('/');
  const typeIcons = types.map(type => {
    const typeDiv = document.createElement('div');
    typeDiv.className = `type-icon ${type.toLowerCase().trim()}`;
    typeDiv.innerHTML = getTypeIcon(type.trim());
    typeDiv.title = type.trim();
    return typeDiv;
  });
  
  const typeWrapper = statsContainer.querySelector('.type-wrapper');
  typeIcons.forEach(icon => typeWrapper.appendChild(icon));

  // Add the gradient classes based on both types
  const primaryType = types[0].toLowerCase().trim();
  const secondaryType = types[1] ? types[1].toLowerCase().trim() : primaryType;
  const cardFront = card.querySelector('.card-front');
  
  // Remove any existing gradient classes
  cardFront.className = 'card-front';
  
  // Create custom gradient style
  const primaryColor = getTypeColor(primaryType);
  const secondaryColor = getTypeColor(secondaryType);
  cardFront.style.background = `linear-gradient(135deg, ${primaryColor}26, ${secondaryColor}26 70%)`;

  const statsElement = statsContainer.querySelector('.pokemon-stats');
  statsElement.textContent = `${pokemonData.height} | ${pokemonData.weight}`;
  
  const descElement = card.querySelector('.pokemon-description');
  descElement.textContent = pokemonData.description;
  
  cardContainer.appendChild(card);

  // Add click handler with submenu toggle
  card.addEventListener('click', (e) => {
    const cardInner = e.currentTarget.querySelector('.card-inner');
    cardInner.classList.toggle('flipped');
    
    // Show/hide submenu based on card flip state
    if (!cardInner.classList.contains('flipped')) {
      setTimeout(() => {
        submenu.classList.remove('hidden');
      }, 400); // Half the flip animation duration
    } else {
      submenu.classList.add('hidden');
    }
  });

  // Add hover effect
  card.addEventListener('mousemove', handleHover);
  card.addEventListener('mouseleave', resetHover);

  // Show card with initial animation
  requestAnimationFrame(() => {
    card.classList.add('show');
  });

  // After successfully generating the card
}

async function loadCardToMain(cardData) {
  // Create a new card with the saved data
  const cardContainer = document.getElementById('cardContainer');
  
  // Remove existing card and submenu
  const existingCard = document.querySelector('.card');
  const existingSubmenu = document.querySelector('.submenu');
  if (existingCard) existingCard.remove();
  if (existingSubmenu) existingSubmenu.remove();

  // Create new card
  const card = document.createElement('div');
  card.className = 'card show';
  
  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner flipped';
  
  // Get type colors for gradient
  const types = cardData.type.split('/');
  const primaryType = types[0].toLowerCase().trim();
  const secondaryType = types[1] ? types[1].toLowerCase().trim() : primaryType;
  const primaryColor = getTypeColor(primaryType);
  const secondaryColor = getTypeColor(secondaryType);
  
  cardInner.innerHTML = `
    <div class="card-front" style="background: linear-gradient(135deg, ${primaryColor}26, ${secondaryColor}26 70%)">
      <h2 class="pokemon-name">${cardData.name}</h2>
      <div class="card-image-container">
        <img class="pokemon-image" src="${cardData.imageUrl}" alt="${cardData.description}">
      </div>
      <div class="stats-container">
        <div class="type-wrapper">
          ${types.map(type => `
            <div class="type-icon ${type.toLowerCase().trim()}" title="${type.trim()}">
              ${getTypeIcon(type.trim())}
            </div>
          `).join('')}
        </div>
        <p class="pokemon-stats">${cardData.height} | ${cardData.weight}</p>
      </div>
      <div class="card-description">
        <p class="pokemon-description">${cardData.description}</p>
      </div>
    </div>
    <div class="card-back">
      <div class="card-back-design">
        <svg class="card-back-logo" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
          <circle cx="50" cy="50" r="20" fill="currentColor"/>
          <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div class="card-back-pattern"></div>
      </div>
    </div>
  `;
  
  card.appendChild(cardInner);
  cardContainer.appendChild(card);

  // Create submenu
  const submenu = document.createElement('div');
  submenu.className = 'submenu hidden';
  
  submenu.innerHTML = `
    <div class="submenu-grid">
      <div class="stat-box">
        <div class="stat-label">Name</div>
        <div class="stat-value">${cardData.name}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Type</div>
        <div class="stat-value">${cardData.type}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Height</div>
        <div class="stat-value">${cardData.height}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Weight</div>
        <div class="stat-value">${cardData.weight}</div>
      </div>
    </div>
    <div class="description-box">
      <div class="description-title">Description</div>
      <div class="full-description">${cardData.description}</div>
    </div>
  `;
  
  cardContainer.appendChild(submenu);
  
  // Add hover effect
  card.addEventListener('mousemove', handleHover);
  card.addEventListener('mouseleave', resetHover);
  
  // Add click handler with submenu toggle and auto-flip after mounting
  card.addEventListener('click', (e) => {
    const cardInner = e.currentTarget.querySelector('.card-inner');
    cardInner.classList.toggle('flipped');
    
    // Show/hide submenu based on card flip state
    if (!cardInner.classList.contains('flipped')) {
      setTimeout(() => {
        submenu.classList.remove('hidden');
      }, 400); // Half the flip animation duration
    } else {
      submenu.classList.add('hidden');
    }
  });

  // Auto flip the card after a short delay
  setTimeout(() => {
    const cardInner = card.querySelector('.card-inner');
    cardInner.classList.remove('flipped');
    setTimeout(() => {
      submenu.classList.remove('hidden');
    }, 400);
  }, 100);
}

function getTypeIcon(type) {
  const icons = {
    'Earth': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 32c-123.7 0-224 100.3-224 224s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm120 80c16.8 0 32.6 3.8 46.8 10.6-16.5 14.9-36.5 28.4-59.2 39.9-2.3-7.2-4.9-14.3-7.8-21.3 7.5-9.5 14.3-19.3 20.2-29.2zM256 432c-97 0-176-79-176-176 0-40.3 13.6-77.3 36.4-107-5.6 12.6-10.4 25.7-14.4 39.3-2.8 9.5-5.2 19.2-7.2 29-6.8 33.7-8.1 68.5-3.9 102.9 4.5 37 14.7 72.7 30.2 106 19.4 41.5 45.8 79.5 78.1 112.3 7.5 7.6 15.3 14.9 23.4 21.9 10.8 9.3 22.1 18 33.9 26-40.8-32.3-71-79.4-81.6-133.6-5.8-29.4-5.3-59.3 1.2-88.4 2.1-9.5 4.9-18.9 8.3-28 12.4-33.1 32.8-63.3 59.7-88.7 5 19.8 12.6 39 22.7 57.1-35.9 28.1-58.8 71.5-58.8 120.1 0 84.8 69.2 154 154 154s154-69.2 154-154c0-84.8-69.2-154-154-154-30.3 0-58.5 8.7-82.2 23.8-3.8-7.7-7.2-15.5-10.3-23.5 27.9-17.7 60.9-27.9 96.1-27.9 97 0 176 79 176 176s-79 176-176 176z"/>
    </svg>`,
    
    'Air': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/>
    </svg>`,
    
    'Sound': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/>
    </svg>`,
    
    'Nature': `<svg viewBox="0 0 512 512">
      <path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/>
    </svg>`,
    
    'Fire': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M328.7 256c-18.7-18.7-49.1-18.7-67.9 0L256 388.7 149.1 281.9c-18.7-18.7-49.1-18.7-67.9 0-18.7 18.7-18.7 49.1 0 67.9l140.5 140.5c9.4 9.4 24.6 9.4 33.9 0l140.5-140.5c18.8 18.8 18.8 49.2 0 67.9-18.8 18.8-49.2 18.8-67.9 0l-140.5-140.5c-9.4-9.4-9.4-24.6 0-33.9L298.1 294.8c18.7 18.7 49.1 18.7 67.9 0 18.7-18.7 18.7-49.1 0-67.9L256 191.3 91.4 129.4c-9.4-9.4-9.4-24.6 0-33.9l140.5-140.5c9.4-9.4 24.6-9.4 33.9 0z"/></svg>`,
    
    'Water': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-41.7 0-96 94.1-96 192 0 53 43 96 96 96s96-43 96-96c0-97.9-54.3-192-96-192zm0 256c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"/></svg>`,
    
    'Grass': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Electric': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M296 160L256 32l-40 128h-88l72 88-40 168 136-120 40-168h-80zm0 168l-40 88 72-88-32-56 32-56-72-88 40 88 32 56-32 56z"/></svg>`,
    
    'Ice': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M384 256c0 70.7-57.3 128-128 128s-128-57.3-128-128 57.3-128 128-128 128 57.3 128 128zm-224 0l96-96 96 96-96 96-96-96zm96-160l96 96-96 96-96-96 96-96z"/></svg>`,
    
    'Fighting': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 64 256 64zm80 160c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80zm-160 0c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80z"/></svg>`,
    
    'Poison': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Ground': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M384 256H128l128-224 128 224zm-256 0l128 224 128-224H128zm256-32l-128-224L128 224h256z"/></svg>`,
    
    'Flying': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 32L128 160l128 128 128-128L256 32zm0 384l-96 96 96 96 96-96L256 32zm0-256l-64 64-64 64 64 64 64-64z"/></svg>`,
    
    'Psychic': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96zm0 256c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm48-96c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z"/></svg>`,
    
    'Bug': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 64 256 64zm80 160c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80zm-160 0c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80z"/></svg>`,
    
    'Rock': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96l-96 96v128l96 96 96-96V192l-96-96zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Ghost': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160v128h320V224c0-88.4-71.6-160-160-160zm0 288l-64-64V192l64-64 64 64v128l-64 64zm32-160c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>`,
    
    'Dragon': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 32L128 160l128 128 128-128L256 32zm0 384l-96 96 96 96 96-96L256 32zm0-256l-64 64-64 64 64 64 64-64z"/></svg>`,
    
    'Dark': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96zm0 256c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm48-96c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z"/></svg>`,
    
    'Steel': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 64 256 64zm80 160c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80zm-160 0c0 44.2-35.8 80-80 80s-80-35.8-80-80 35.8-80 80-80 80 35.8 80 80z"/></svg>`,
    
    'Fairy': `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 64l64 64-64 64-64-64 64-64zm0 384l64-64-64-64-64 64 64 64zm0-192l64 64-64 64-64-64 64-64zm-128-64l64 64-64 64-64-64 64-64zm256 0l64 64-64 64-64-64 64-64z"/></svg>`,
    'Plant': `<svg viewBox="0 0 512 512">
      <defs>
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#388E3C;stop-opacity:1" />
        </linearGradient>
      </defs>
      <g fill="currentColor">
        <path d="M256 48c-12.2 0-24 2.4-35 6.7C258.2 76.8 280 113.7 280 156c0 57.9-47.1 105-105 105-42.3 0-79.2-21.8-101.3-59C69.4 232 67 243.8 67 256c0 104.4 84.6 189 189 189s189-84.6 189-189S360.4 48 256 48z"/>
        <path d="M175 156c0-31.8 11.8-61.2 31.5-84.7C152.3 75.3 112 118.3 112 170c0 28.9 11.7 55.1 30.6 74.1 21-17.6 32.4-43.8 32.4-72.1 0-5.4-.3-10.7-1-15.9"/>
        <path d="M280 156c0 31.8-11.8 61.2-31.5 84.7C302.7 236.7 343 193.7 343 142c0-28.9-11.7-55.1-30.6-74.1-21 17.6-32.4 43.8-32.4 72.1 0 5.4.3 10.7 1 15.9"/>
      </g>
      <circle cx="256" cy="256" r="25" fill="#81C784"/>
      <path d="M256 220c-19.9 0-36 16.1-36 36s16.1 36 36 36 36-16.1 36-36-16.1-36-36-36zm0 52c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z" fill="#4CAF50"/>
    </svg>`,
  };
  
  return icons[type] || `<svg viewBox="0 0 512 512"><path fill="currentColor" d="M256 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160S344.4 96 256 96z"/></svg>`;
}

function getTypeColor(type) {
  const colors = {
    'air': '#B4D4E4',
    'sound': '#9B6B9E', 
    'nature': '#5A9E54',
    'fire': '#FF4422',
    'water': '#3399FF',
    'grass': '#77CC55',
    'electric': '#FFCC33',
    'ice': '#66CCFF',
    'fighting': '#BB5544',
    'poison': '#AA5599',
    'ground': '#DDBB55',
    'flying': '#8899FF',
    'psychic': '#FF5599',
    'bug': '#AABB22',
    'rock': '#BBAA66',
    'ghost': '#6666BB',
    'dragon': '#7766EE',
    'dark': '#775544',
    'steel': '#AAAABB',
    'fairy': '#EE99EE',
    'plant': '#4CAF50',
  };
  
  return colors[type] || '#999999';
}

function handleHover(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const rotateX = (y - centerY) / 20; // Reduced intensity
  const rotateY = -(x - centerX) / 20; // Reduced intensity
  
  card.style.transform = `
    perspective(2000px) 
    rotateX(${rotateX}deg) 
    rotateY(${rotateY}deg) 
    scale3d(1.02, 1.02, 1.02)
  `;
}

function resetHover(e) {
  const card = e.currentTarget;
  card.style.transform = 'perspective(2000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  card.style.transition = 'transform 0.5s ease';
  
  // Remove transition after it's complete
  setTimeout(() => {
    card.style.transition = '';
  }, 500);
}

function createMiniCard(cardData) {
  const miniCard = document.createElement('div');
  miniCard.className = 'mini-card';
  miniCard.dataset.cardId = cardData.id;
  miniCard.cardData = cardData;
  
  const types = cardData.type.split('/');
  const primaryType = types[0].toLowerCase().trim();
  const secondaryType = types[1] ? types[1].toLowerCase().trim() : primaryType;
  const primaryColor = getTypeColor(primaryType);
  const secondaryColor = getTypeColor(secondaryType);
  
  miniCard.innerHTML = `
    <div class="mini-card-inner" style="background: linear-gradient(135deg, ${primaryColor}26, ${secondaryColor}26 70%)">
      <div class="delete-overlay">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
        </svg>
      </div>
      <div class="palace-button" title="Send to PoGePalace">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm3 13v3h-2v-3h2z"/>
        </svg>
      </div>
      <h3 class="mini-card-name">${cardData.name}</h3>
      <div class="mini-card-stats">
        <div class="mini-card-type">
          ${types.map(type => `
            <div class="type-icon ${type.toLowerCase().trim()}" title="${type.trim()}">
              ${getTypeIcon(type.trim())}
            </div>
          `).join('')}
        </div>
        <span class="mini-card-stats-text">${cardData.height} | ${cardData.weight}</span>
      </div>
      <div class="mini-card-image" style="background-image: url('${cardData.imageUrl}')"></div>
      <div class="mini-card-description">${cardData.description}</div>
    </div>
  `;

  miniCard.addEventListener('click', async (e) => {
    const palaceButton = e.target.closest('.palace-button');
    
    if (palaceButton) {
      e.stopPropagation(); // Prevent card load
      try {
        await showPalaceDialog(miniCard.cardData);
      } catch (error) {
        console.error('Failed to send to PoGePalace:', error);
      }
      return;
    }

    // Regular card click behavior
    if (!e.target.closest('.delete-overlay')) {
      loadCardToMain(miniCard.cardData);
      const viewer = document.querySelector('.collection-viewer');
      if (viewer) {
        viewer.classList.add('hidden');
      }
    }
  });

  return miniCard;
}

// Initialize the shared database connection
const pogepalace = new WebsimSocket();

async function sendToPoGePalace(cardData) {
  try {
    // First fetch the image and convert it to a File object
    const response = await fetch(cardData.imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `${cardData.name}.png`, { type: 'image/png' });
    
    // Upload image to websim storage
    const backupImageUrl = await websim.upload(file);
    
    // Update local IndexDB record with backup URL
    if (cardData.id) {
      const transaction = db.transaction(['cards'], 'readwrite');
      const store = transaction.objectStore('cards');
      const request = store.get(cardData.id);
      
      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          record.backupImageUrl = backupImageUrl;
          store.put(record);
        }
      };
    }
    
    // Create a new record in the PoGePalace collection with both URLs
    const pogeRecord = await pogepalace.collection('pogemon').create({
      name: cardData.name,
      description: cardData.description,
      pogetype: cardData.type, 
      height: cardData.height, 
      weight: cardData.weight,
      imageUrl: cardData.imageUrl,
      backupImageUrl: backupImageUrl,
      origin_trainer: pogepalace.party.client.username
    });
    
    return pogeRecord;
  } catch (error) {
    console.error('Error sending to PoGePalace:', error);
    throw error;
  }
}

const initDB = () => {
  const request = indexedDB.open('Pogeflex', 1);
  
  request.onerror = (event) => {
    console.error('Database error:', event.target.error);
  };

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains('cards')) {
      const store = db.createObjectStore('cards', { keyPath: 'id', autoIncrement: true });
      store.createIndex('name', 'name', { unique: false });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    }
  };

  request.onsuccess = (event) => {
    db = event.target.result;
  };
};

const saveCard = async (cardData) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cards'], 'readwrite');
    const store = transaction.objectStore('cards');
    
    // Create a new card object with all the data plus timestamp
    const newCard = {
      name: cardData.name,
      description: cardData.description,
      type: cardData.type, 
      pogetype: cardData.type, 
      height: cardData.height,
      weight: cardData.weight,
      imageUrl: cardData.imageUrl,
      backupImageUrl: cardData.backupImageUrl,  
      timestamp: new Date().getTime()
    };

    const request = store.add(newCard);

    request.onsuccess = () => {
      // Return the newly created card with its ID
      newCard.id = request.result;
      resolve(newCard);
    };
    request.onerror = () => reject(request.error);
  });
};

const getAllCards = async () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cards'], 'readonly');
    const store = transaction.objectStore('cards');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteCard = async (id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['cards'], 'readwrite');
    const store = transaction.objectStore('cards');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

async function showCardDetail(cardData) {
  const modal = document.createElement('div');
  modal.className = 'card-detail-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal">×</button>
      <div class="detail-card">
        <h2>${cardData.name}</h2>
        <div class="detail-card-image" style="background-image: url('${cardData.imageUrl}')"></div>
        <div class="detail-info">
          <p class="detail-type">${cardData.type}</p>
          <p class="detail-stats">${cardData.height} | ${cardData.weight}</p>
          <p class="detail-description">${cardData.description}</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function showCollection() {
  const viewer = document.querySelector('.collection-viewer') || createCollectionViewer();
  const grid = viewer.querySelector('.collection-grid');
  const tabsContainer = viewer.querySelector('.collection-tabs');
  
  try {
    const cards = await getAllCards();
    cards.sort((a, b) => b.timestamp - a.timestamp);
    
    // Get unique types from all cards
    const allTypes = new Set();
    cards.forEach(card => {
      card.type.split('/').forEach(type => {
        allTypes.add(type.trim());
      });
    });
    
    // Create type tabs
    tabsContainer.innerHTML = `
      <button class="type-tab" data-type="all">
        <span>ALL</span>
      </button>
      ${Array.from(allTypes).sort().map(type => `
        <button class="type-tab" data-type="${type}">
          <div class="type-icon ${type.toLowerCase()}">${getTypeIcon(type)}</div>
          <span>${type}</span>
        </button>
      `).join('')}
    `;

    let selectedTypes = new Set();
    let filterMode = 'single'; // 'single', 'or', 'and'
    
    // Add tab click handlers
    const tabs = tabsContainer.querySelectorAll('.type-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const type = tab.dataset.type;
        
        if (e.ctrlKey || e.metaKey) {
          // CTRL/CMD click for AND filter (max 2)
          if (filterMode !== 'and') {
            selectedTypes.clear(); // Clear previous selections
            filterMode = 'and';
          }
          
          if (selectedTypes.has(type)) {
            selectedTypes.delete(type);
          } else if (selectedTypes.size < 2) {
            selectedTypes.add(type);
          }
          
        } else if (e.shiftKey) {
          // SHIFT click for OR filter
          filterMode = 'or';
          if (selectedTypes.has(type)) {
            selectedTypes.delete(type);
          } else {
            selectedTypes.add(type);
          }
          
        } else {
          // Normal click for single filter
          filterMode = 'single';
          selectedTypes.clear();
          selectedTypes.add(type);
        }

        // Update visual state of tabs
        tabs.forEach(t => {
          t.classList.remove('selected-single', 'selected-or', 'selected-and');
          if (selectedTypes.has(t.dataset.type)) {
            t.classList.add(`selected-${filterMode}`);
          }
        });
        
        // Apply filters
        if (type === 'all' && filterMode === 'single') {
          selectedTypes.clear();
        }
        
        displayFilteredCards(cards, Array.from(selectedTypes), filterMode);
      });
    });
    
    // Initial display of all cards
    displayFilteredCards(cards, [], 'single');
    
    viewer.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading collection:', error);
  }
}

function displayFilteredCards(cards, selectedTypes, filterMode) {
  const grid = document.querySelector('.collection-grid');
  grid.innerHTML = '';
  
  let filteredCards;
  
  if (selectedTypes.length === 0 || (selectedTypes.length === 1 && selectedTypes[0] === 'all')) {
    filteredCards = cards;
  } else if (filterMode === 'and') {
    filteredCards = cards.filter(card => 
      selectedTypes.every(type => card.type.includes(type))
    );
  } else { // 'single' or 'or'
    filteredCards = cards.filter(card => 
      selectedTypes.some(type => card.type.includes(type))
    );
  }
  
  if (filteredCards.length === 0) {
    grid.innerHTML = `
      <div class="no-cards-message">
        No Pogemons found matching the selected filters
      </div>
    `;
    return;
  }
  
  filteredCards.forEach(card => {
    const miniCard = createMiniCard(card);
    grid.appendChild(miniCard);
  });
}

async function showPalaceDialog(cardData) {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog palace-dialog';
  dialog.innerHTML = `
    <h3>Send to PoGePalace</h3>
    <p>Would you like to add ${cardData.name} to the PoGePalace?</p>
    <div class="confirm-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="confirm">
        Send to Palace
        <span class="loading-spinner hidden"></span>
      </button>
    </div>
  `;

  document.body.appendChild(dialog);

  try {
    const result = await new Promise((resolve) => {
      const cancelBtn = dialog.querySelector('.cancel');
      const confirmBtn = dialog.querySelector('.confirm');
      const spinner = dialog.querySelector('.loading-spinner');

      cancelBtn.addEventListener('click', () => {
        dialog.remove();
        resolve(false);
      });

      confirmBtn.addEventListener('click', async () => {
        // Show loading state
        confirmBtn.disabled = true;
        spinner.classList.remove('hidden');

        try {
          const result = await sendToPoGePalace(cardData);
          dialog.remove();
          showToast(`${cardData.name} was successfully added to PoGePalace!`);
          resolve(true);
        } catch (error) {
          console.error('Failed to send to PoGePalace:', error);
          showToast('Failed to send to PoGePalace', true);
          // Re-enable button and hide spinner on error
          confirmBtn.disabled = false;
          spinner.classList.add('hidden');
        }
      });
    });

    return result;
  } catch (error) {
    dialog.remove();
    throw error;
  }
}

function setupPrintButton() {
  const printBtn = document.getElementById('printBtn');
  printBtn.addEventListener('click', () => {
    // Add print class to all visible cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.classList.add('print-section');
      
      // Ensure the current visible side is shown in print
      const cardInner = card.querySelector('.card-inner');
      const cardFront = card.querySelector('.card-front');
      const cardBack = card.querySelector('.card-back');
      
      if (cardInner.classList.contains('flipped')) {
        cardBack.style.visibility = 'visible';
        cardFront.style.visibility = 'hidden';
      } else {
        cardFront.style.visibility = 'visible';
        cardBack.style.visibility = 'hidden';
      }
    });

    // Print
    window.print();

    // Remove print classes and restore visibility after printing
    setTimeout(() => {
      cards.forEach(card => {
        card.classList.remove('print-section');
        const cardFront = card.querySelector('.card-front');
        const cardBack = card.querySelector('.card-back');
        cardFront.style.visibility = '';
        cardBack.style.visibility = '';
      });
    }, 100);
  });
}

function createCollectionViewer() {
  const viewer = document.createElement('div');
  viewer.className = 'collection-viewer hidden';
  viewer.innerHTML = `
    <div class="collection-header">
      <div class="collection-header-title">
        <h2>Your PoGeFlex Collection</h2>
        <button class="import-btn" title="Import Collection">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" transform="rotate(180, 12, 12)"/>
          </svg>
        </button>
        <button class="export-btn" title="Export Collection">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>
        <input type="file" class="hidden-file-input" accept=".json">
      </div>
      <div class="collection-header-buttons">
        <button class="delete-mode-toggle" title="Toggle Delete Mode">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
          </svg>
        </button>
        <button class="close-collection">×</button>
      </div>
    </div>
    <div class="collection-tabs">
      <button class="type-tab active" data-type="all">
        <span>ALL</span>
      </button>
    </div>
    <div class="collection-grid"></div>
  `;
  document.body.appendChild(viewer);

  // Add event listeners for the buttons
  const closeBtn = viewer.querySelector('.close-collection');
  const deleteToggle = viewer.querySelector('.delete-mode-toggle');
  const exportBtn = viewer.querySelector('.export-btn');
  const importBtn = viewer.querySelector('.import-btn');
  const fileInput = viewer.querySelector('.hidden-file-input');
  let deleteMode = false;

  closeBtn.addEventListener('click', () => {
    viewer.classList.add('hidden');
    deleteMode = false;
    deleteToggle.classList.remove('active');
    const cards = viewer.querySelectorAll('.mini-card');
    cards.forEach(card => card.classList.remove('delete-mode'));
  });

  deleteToggle.addEventListener('click', () => {
    deleteMode = !deleteMode;
    deleteToggle.classList.toggle('active');
    const cards = viewer.querySelectorAll('.mini-card');
    cards.forEach(card => {
      card.classList.toggle('delete-mode');
      
      // Remove existing click handlers
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
      
      // Add appropriate click handler based on mode
      if (deleteMode) {
        newCard.addEventListener('click', async (e) => {
          e.stopPropagation();
          const cardData = newCard.cardData;
          if (await showConfirmDialog(cardData)) {
            try {
              await deleteCard(cardData.id);
              newCard.remove();
              showToast(`${cardData.name} was released successfully!`);
            } catch (error) {
              console.error('Error deleting card:', error);
              showToast('Failed to release Pogemon', true);
            }
          }
        });
      } else {
        newCard.addEventListener('click', async (e) => {
          const palaceButton = e.target.closest('.palace-button');
          
          if (palaceButton) {
            e.stopPropagation(); // Prevent card load
            try {
              await showPalaceDialog(newCard.cardData);
            } catch (error) {
              console.error('Failed to send to PoGePalace:', error);
            }
            return;
          }

          loadCardToMain(newCard.cardData);
          viewer.classList.add('hidden');
        });
      }
      
      // Preserve the cardData
      newCard.cardData = card.cardData;
    });
  });

  exportBtn.addEventListener('click', async () => {
    try {
      const cards = await getAllCards();
      const exportData = {
        pogeflex: {
          version: 1,
          cards: cards,
          exported_at: new Date().toISOString()
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pogeflex-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('PoGeFlex collection exported successfully!');
    } catch (error) {
      console.error('Error exporting collection:', error);
      showToast('Failed to export collection', true);
    }
  });

  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data structure
      if (!data.pogeflex || !Array.isArray(data.pogeflex.cards)) {
        throw new Error('Invalid file format');
      }

      // Show import options dialog
      const importChoice = await showImportDialog(data.pogeflex.cards.length);
      if (importChoice === null) {
        fileInput.value = '';
        return; // User cancelled
      }

      // Get existing cards to check for duplicates
      const existingCards = await getAllCards();
      let cardsToImport;
      
      if (importChoice === 'skip') {
        // Filter out exact duplicates
        cardsToImport = data.pogeflex.cards.filter(importCard => 
          !existingCards.some(existingCard => 
            existingCard.name === importCard.name &&
            existingCard.description === importCard.description &&
            existingCard.imageUrl === importCard.imageUrl
          )
        );
      } else {
        // Import all cards
        cardsToImport = data.pogeflex.cards;
      }

      // Import the cards
      const importPromises = cardsToImport.map(card => saveCard(card));
      await Promise.all(importPromises);
      
      // Refresh the collection display
      const grid = viewer.querySelector('.collection-grid');
      grid.innerHTML = '';
      await showCollection();

      // Show success message
      const skippedCount = data.pogeflex.cards.length - cardsToImport.length;
      if (importChoice === 'skip' && skippedCount > 0) {
        showToast(`Imported ${cardsToImport.length} cards. Skipped ${skippedCount} duplicate(s).`);
      } else {
        showToast(`Successfully imported ${cardsToImport.length} cards!`);
      }
    } catch (error) {
      console.error('Error importing collection:', error);
      showToast('Failed to import collection: ' + error.message, true);
    }

    // Reset the file input
    fileInput.value = '';
  });

  return viewer;
}

async function showConfirmDialog(cardData) {
  const dialog = document.createElement('div');
  dialog.className = 'confirm-dialog';
  dialog.innerHTML = `
    <h3>Release Pogemon</h3>
    <p>Are you sure you want to release ${cardData.name}?</p>
    <div class="confirm-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="confirm">Release</button>
    </div>
  `;

  document.body.appendChild(dialog);

  const result = await new Promise((resolve) => {
    dialog.querySelector('.cancel').addEventListener('click', () => {
      dialog.remove();
      resolve(false);
    });

    dialog.querySelector('.confirm').addEventListener('click', async () => {
      dialog.remove();
      resolve(true);
    });
  });

  return result;
}

function showImportDialog(totalCards) {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.className = 'import-dialog';
    dialog.innerHTML = `
      <h3>Import Collection</h3>
      <p>About to import ${totalCards} cards.</p>
      <p>How would you like to handle potential duplicates?</p>
      <div class="import-options">
        <label>
          <input type="radio" name="duplicate-handling" value="skip" checked>
          Skip exact duplicates
        </label>
        <label>
          <input type="radio" name="duplicate-handling" value="allow">
          Allow all duplicates
        </label>
      </div>
      <div class="import-dialog-buttons">
        <button class="cancel">Cancel</button>
        <button class="confirm">Import</button>
      </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector('.cancel').addEventListener('click', () => {
      dialog.remove();
      resolve(null);
    });

    dialog.querySelector('.confirm').addEventListener('click', () => {
      const selectedOption = dialog.querySelector('input[name="duplicate-handling"]:checked').value;
      dialog.remove();
      resolve(selectedOption);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDB();
  const initialCard = document.querySelector('.card');
  if (initialCard) {
    initialCard.addEventListener('click', (e) => {
      const cardInner = e.currentTarget.querySelector('.card-inner');
      cardInner.classList.toggle('flipped');
    });
  }
  
  setupPrintButton();

  // Add collection button
  const collectionBtn = document.createElement('button');
  collectionBtn.className = 'collection-btn';
  collectionBtn.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16l-4-4v-6h-4V4h-4v10H4v6h10v2h4zM6 10h12V4H6v6z"/>
    </svg>
  `;
  document.querySelector('.container').appendChild(collectionBtn);

  collectionBtn.addEventListener('click', showCollection);
});

function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after animation
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}