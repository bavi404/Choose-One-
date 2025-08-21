/**
 * Enhanced Random Choice Picker - Main Application
 */

import { 
  MIN_CHOICES, 
  MAX_CHOICES, 
  ANIMATION_SPEEDS, 
  DEFAULT_ANIMATION_SPEED,
  LARGE_CHOICE_THRESHOLD,
  INPUT_DEBOUNCE_MS
} from './constants.js';

import { 
  sanitizeText, 
  debounce, 
  randomInt, 
  detectDuplicates, 
  validateChoices,
  generateId,
  formatTimestamp
} from './utils.js';

import { 
  saveRecentSet, 
  listRecentSets, 
  restoreSet, 
  clearRecentSets,
  saveTheme,
  getTheme,
  saveSettings,
  getSettings
} from './storage.js';

// Application state
class ChoicePickerApp {
  constructor() {
    this.currentChoices = [];
    this.isSelecting = false;
    this.animationInterval = null;
    this.highlightedTags = new Set();
    this.history = [];
    
    this.initializeElements();
    this.bindEvents();
    this.loadSavedSettings();
    this.updateRecentChoices();
    this.updateChoiceCounter();
  }

  initializeElements() {
    this.textarea = document.getElementById('textarea');
    this.tagsContainer = document.getElementById('tags');
    this.choiceCount = document.getElementById('choiceCount');
    this.startButton = document.getElementById('startButton');
    this.resetButton = document.getElementById('resetButton');
    this.animationSpeed = document.getElementById('animationSpeed');
    this.multiPickCount = document.getElementById('multiPickCount');
    this.choiceLabel = document.getElementById('choiceLabel');
    this.validationErrors = document.getElementById('validationErrors');
    this.duplicateWarning = document.getElementById('duplicateWarning');
    this.statusMessage = document.getElementById('statusMessage');
    this.recentChoices = document.getElementById('recentChoices');
    this.clearRecent = document.getElementById('clearRecent');
    this.historyList = document.getElementById('historyList');
    this.themeToggle = document.getElementById('themeToggle');
    this.confirmDialog = document.getElementById('confirmDialog');
    this.confirmYes = document.getElementById('confirmYes');
    this.confirmNo = document.getElementById('confirmNo');
    
    this.textarea.focus();
  }

  bindEvents() {
    this.textarea.addEventListener('input', debounce((e) => {
      this.handleInput(e.target.value);
    }, INPUT_DEBOUNCE_MS));

    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.startSelection();
      }
    });

    this.startButton.addEventListener('click', () => this.startSelection());
    this.resetButton.addEventListener('click', () => this.resetAll());
    this.clearRecent.addEventListener('click', () => this.clearRecentChoiceSets());
    
    this.animationSpeed.addEventListener('change', () => this.saveCurrentSettings());
    this.multiPickCount.addEventListener('change', () => this.saveCurrentSettings());
    
    this.recentChoices.addEventListener('change', (e) => {
      if (e.target.value) {
        this.restoreChoiceSet(e.target.value);
      }
    });
    
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    this.confirmYes.addEventListener('click', () => this.confirmLargeSelection());
    this.confirmNo.addEventListener('click', () => this.hideConfirmDialog());
    
    this.tagsContainer.addEventListener('keydown', (e) => this.handleTagKeyboard(e));
    
    this.confirmDialog.addEventListener('click', (e) => {
      if (e.target === this.confirmDialog) {
        this.hideConfirmDialog();
      }
    });
  }

  handleInput(input) {
    try {
      const choices = this.parseChoices(input);
      this.currentChoices = choices;
      
      this.createTags(choices);
      this.updateChoiceCounter();
      this.updateValidationMessages(choices);
      this.updateStartButton();
      
    } catch (error) {
      console.error('Error handling input:', error);
      this.showStatusMessage('Error processing input', 'error');
    }
  }

  parseChoices(input) {
    if (!input || typeof input !== 'string') return [];
    
    return input
      .split(',')
      .map(choice => sanitizeText(choice.trim()))
      .filter(choice => choice.length > 0);
  }

  createTags(choices) {
    this.tagsContainer.innerHTML = '';
    
    if (choices.length === 0) {
      this.tagsContainer.innerHTML = '<div class="empty-state">Enter at least 2 choices to begin</div>';
      return;
    }
    
    const { duplicates } = detectDuplicates(choices);
    
    choices.forEach((choice, index) => {
      const tagEl = document.createElement('span');
      tagEl.classList.add('tag');
      tagEl.textContent = choice;
      tagEl.setAttribute('tabindex', '0');
      tagEl.setAttribute('role', 'button');
      tagEl.setAttribute('aria-label', `Choice ${index + 1}: ${choice}`);
      
      if (duplicates.includes(index)) {
        tagEl.classList.add('duplicate');
        tagEl.setAttribute('aria-label', `${tagEl.getAttribute('aria-label')} (duplicate)`);
      }
      
      this.tagsContainer.appendChild(tagEl);
    });
  }

  updateChoiceCounter() {
    const count = this.currentChoices.length;
    let message = '';
    
    if (count === 0) {
      message = '0 choices available';
    } else if (count === 1) {
      message = '1 choice available (need at least 2)';
    } else {
      message = `${count} choices available`;
    }
    
    this.choiceCount.textContent = message;
  }

  updateValidationMessages(choices) {
    this.validationErrors.hidden = true;
    this.duplicateWarning.hidden = true;
    
    if (choices.length === 0) return;
    
    const validation = validateChoices(choices);
    
    if (!validation.isValid) {
      this.validationErrors.textContent = validation.errors.join('. ');
      this.validationErrors.hidden = false;
    }
    
    const { hasDuplicates } = detectDuplicates(choices);
    if (hasDuplicates) {
      this.duplicateWarning.textContent = 'Duplicate choices detected. Consider removing them for better results.';
      this.duplicateWarning.hidden = false;
    }
  }

  updateStartButton() {
    const isValid = this.currentChoices.length >= MIN_CHOICES && 
                   this.currentChoices.length <= MAX_CHOICES;
    
    this.startButton.disabled = !isValid || this.isSelecting;
    this.startButton.textContent = this.isSelecting ? 'Selecting...' : 'Start Selection';
  }

  startSelection() {
    if (this.isSelecting || this.currentChoices.length < MIN_CHOICES) {
      return;
    }

    if (this.currentChoices.length >= LARGE_CHOICE_THRESHOLD) {
      this.showConfirmDialog();
      return;
    }

    this.performSelection();
  }

  showConfirmDialog() {
    const message = `You have ${this.currentChoices.length} choices. This may take a while. Continue?`;
    document.getElementById('confirmMessage').textContent = message;
    this.confirmDialog.hidden = false;
    this.confirmYes.focus();
  }

  hideConfirmDialog() {
    this.confirmDialog.hidden = true;
  }

  confirmLargeSelection() {
    this.hideConfirmDialog();
    this.performSelection();
  }

  performSelection() {
    try {
      this.isSelecting = true;
      this.updateStartButton();
      
      const speed = this.animationSpeed.value;
      const pickCount = parseInt(this.multiPickCount.value);
      const speedConfig = ANIMATION_SPEEDS[speed];
      
      this.saveCurrentSettings();
      this.animateSelection(speedConfig, pickCount);
      
    } catch (error) {
      console.error('Error during selection:', error);
      this.showStatusMessage('Error during selection', 'error');
      this.isSelecting = false;
      this.updateStartButton();
    }
  }

  animateSelection(speedConfig, pickCount) {
    const tags = Array.from(this.tagsContainer.querySelectorAll('.tag'));
    if (tags.length === 0) return;
    
    let iterations = 0;
    const maxIterations = speedConfig.duration / speedConfig.interval;
    
    this.animationInterval = setInterval(() => {
      this.clearHighlights();
      
      if (pickCount === 1) {
        const randomTag = this.pickRandomTag(tags);
        this.highlightTag(randomTag);
      } else {
        const selectedTags = this.pickMultipleTags(tags, pickCount);
        selectedTags.forEach(tag => this.highlightTag(tag));
      }
      
      iterations++;
      
      if (iterations >= maxIterations) {
        this.finishSelection(tags, pickCount);
      }
    }, speedConfig.interval);
  }

  clearHighlights() {
    this.tagsContainer.querySelectorAll('.tag.highlight').forEach(tag => {
      tag.classList.remove('highlight');
    });
  }

  pickRandomTag(tags) {
    return tags[randomInt(0, tags.length - 1)];
  }

  pickMultipleTags(tags, count) {
    const availableTags = [...tags];
    const selectedTags = [];
    
    for (let i = 0; i < count && availableTags.length > 0; i++) {
      const randomIndex = randomInt(0, availableTags.length - 1);
      selectedTags.push(availableTags[randomIndex]);
      availableTags.splice(randomIndex, 1);
    }
    
    return selectedTags;
  }

  highlightTag(tag) {
    tag.classList.add('highlight');
    this.highlightedTags.add(tag);
  }

  finishSelection(tags, pickCount) {
    clearInterval(this.animationInterval);
    this.animationInterval = null;
    
    this.clearHighlights();
    
    let winners;
    if (pickCount === 1) {
      winners = [this.pickRandomTag(tags)];
    } else {
      winners = this.pickMultipleTags(tags, pickCount);
    }
    
    winners.forEach(tag => {
      tag.classList.add('winner');
      tag.classList.add('highlight');
    });
    
    this.saveToHistory(winners, pickCount);
    this.saveToRecentChoices();
    this.announceResults(winners);
    
    this.isSelecting = false;
    this.updateStartButton();
    
    const winnerText = winners.map(tag => tag.textContent).join(', ');
    this.showStatusMessage(`Selected: ${winnerText}`, 'success');
  }

  saveToHistory(winners, pickCount) {
    const historyItem = {
      id: generateId(),
      timestamp: new Date(),
      winners: winners.map(tag => tag.textContent),
      totalChoices: this.currentChoices.length,
      pickCount: pickCount
    };
    
    this.history.unshift(historyItem);
    
    if (this.history.length > 20) {
      this.history = this.history.slice(0, 20);
    }
    
    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    this.historyList.innerHTML = '';
    
    if (this.history.length === 0) {
      this.historyList.innerHTML = '<div class="empty-state">No selections yet</div>';
      return;
    }
    
    this.history.forEach(item => {
      const historyEl = document.createElement('div');
      historyEl.className = 'history-item';
      
      const timestamp = formatTimestamp(item.timestamp);
      const winners = item.winners.join(', ');
      
      historyEl.innerHTML = `
        <div class="history-timestamp">${timestamp}</div>
        <div class="history-winners">${winners}</div>
      `;
      
      this.historyList.appendChild(historyEl);
    });
  }

  saveToRecentChoices() {
    const label = this.choiceLabel.value.trim();
    saveRecentSet(this.currentChoices, label);
    this.updateRecentChoices();
  }

  updateRecentChoices() {
    const recentSets = listRecentSets();
    const currentValue = this.recentChoices.value;
    
    this.recentChoices.innerHTML = '<option value="">-- Select Recent Set --</option>';
    
    recentSets.forEach(set => {
      const option = document.createElement('option');
      option.value = set.id;
      option.textContent = set.label;
      this.recentChoices.appendChild(option);
    });
    
    if (currentValue && recentSets.find(set => set.id === currentValue)) {
      this.recentChoices.value = currentValue;
    }
  }

  restoreChoiceSet(setId) {
    const choices = restoreSet(setId);
    if (choices) {
      this.currentChoices = choices;
      this.textarea.value = choices.join(', ');
      this.createTags(choices);
      this.updateChoiceCounter();
      this.updateValidationMessages(choices);
      this.updateStartButton();
      this.showStatusMessage('Choice set restored', 'success');
    }
  }

  clearRecentChoiceSets() {
    if (confirm('Are you sure you want to clear all recent choice sets?')) {
      clearRecentSets();
      this.updateRecentChoices();
      this.showStatusMessage('Recent choice sets cleared', 'success');
    }
  }

  resetAll() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    
    this.textarea.value = '';
    this.choiceLabel.value = '';
    
    this.currentChoices = [];
    this.isSelecting = false;
    this.highlightedTags.clear();
    
    this.createTags([]);
    this.updateChoiceCounter();
    this.updateValidationMessages([]);
    this.updateStartButton();
    
    this.clearHighlights();
    
    this.animationSpeed.value = DEFAULT_ANIMATION_SPEED;
    this.multiPickCount.value = '1';
    
    this.textarea.focus();
    
    this.showStatusMessage('All inputs reset', 'success');
  }

  toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'default' ? 'high-contrast' : 'default';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    saveTheme(newTheme);
    
    const themeIcon = this.themeToggle.querySelector('.theme-icon');
    const themeText = this.themeToggle.querySelector('.theme-text');
    
    if (newTheme === 'high-contrast') {
      themeIcon.textContent = '☀️';
      themeText.textContent = 'Default Theme';
    } else {
      themeIcon.textContent = '🌙';
      themeText.textContent = 'High Contrast';
    }
    
    this.showStatusMessage(`Switched to ${newTheme} theme`, 'success');
  }

  loadSavedSettings() {
    const savedTheme = getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (savedTheme === 'high-contrast') {
      const themeIcon = this.themeToggle.querySelector('.theme-icon');
      const themeText = this.themeToggle.querySelector('.theme-text');
      themeIcon.textContent = '☀️';
      themeText.textContent = 'Default Theme';
    }
    
    const settings = getSettings();
    if (settings.animationSpeed) {
      this.animationSpeed.value = settings.animationSpeed;
    }
    if (settings.multiPickCount) {
      this.multiPickCount.value = settings.multiPickCount;
    }
  }

  saveCurrentSettings() {
    const settings = {
      animationSpeed: this.animationSpeed.value,
      multiPickCount: this.multiPickCount.value
    };
    saveSettings(settings);
  }

  handleTagKeyboard(e) {
    const tags = Array.from(this.tagsContainer.querySelectorAll('.tag'));
    const currentIndex = tags.findIndex(tag => tag === document.activeElement);
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tags.length;
        tags[nextIndex].focus();
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ? tags.length - 1 : currentIndex - 1;
        tags[prevIndex].focus();
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (tags[currentIndex]) {
          tags[currentIndex].click();
        }
        break;
        
      case 'Delete':
        e.preventDefault();
        if (tags[currentIndex]) {
          this.removeChoice(currentIndex);
        }
        break;
    }
  }

  removeChoice(index) {
    this.currentChoices.splice(index, 1);
    this.textarea.value = this.currentChoices.join(', ');
    this.createTags(this.currentChoices);
    this.updateChoiceCounter();
    this.updateValidationMessages(this.currentChoices);
    this.updateStartButton();
  }

  announceResults(winners) {
    const winnerText = winners.map(tag => tag.textContent).join(', ');
    const message = `Selection complete. Winners: ${winnerText}`;
    
    this.statusMessage.textContent = message;
    this.statusMessage.hidden = false;
    
    setTimeout(() => {
      this.statusMessage.hidden = true;
    }, 5000);
  }

  showStatusMessage(message, type = 'info') {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message status-${type}`;
    this.statusMessage.hidden = false;
    
    setTimeout(() => {
      this.statusMessage.hidden = true;
    }, 3000);
  }
}

// Error boundary
window.addEventListener('error', (event) => {
  console.error('Application error:', event.error);
  
  const errorBanner = document.createElement('div');
  errorBanner.className = 'error-banner';
  errorBanner.textContent = 'An error occurred. Please refresh the page.';
  errorBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #e74c3c;
    color: white;
    padding: 10px;
    text-align: center;
    z-index: 9999;
  `;
  
  document.body.appendChild(errorBanner);
  
  setTimeout(() => {
    if (errorBanner.parentNode) {
      errorBanner.parentNode.removeChild(errorBanner);
    }
  }, 10000);
});

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  try {
    new ChoicePickerApp();
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});
