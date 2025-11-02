// Word Learning Game - Main Application Logic
// Storage uses browser localStorage for user progress tracking

// ==================== Configuration ====================
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const STORAGE_KEY = 'wordLearningProgress';

// ==================== Data Structures ====================
let allWords = [];
let currentMode = null; // 'learn' or 'practice'
let currentLevel = null;
let currentWordIndex = 0;
let sessionWords = [];

// ==================== Local Storage Manager ====================
class ProgressManager {
    constructor() {
        this.data = this.load();
    }

    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            currentLearnLevel: 'A1',
            knownWords: [], // Array of word strings
            newWords: [], // Words marked as "new" - need review
            levelProgress: {
                A1: { total: 0, known: 0 },
                A2: { total: 0, known: 0 },
                B1: { total: 0, known: 0 },
                B2: { total: 0, known: 0 },
                C1: { total: 0, known: 0 },
                C2: { total: 0, known: 0 }
            }
        };
    }

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    markKnown(word) {
        if (!this.data.knownWords.includes(word)) {
            this.data.knownWords.push(word);
        }
        // Remove from newWords if it was there
        this.data.newWords = this.data.newWords.filter(w => w !== word);
        this.save();
    }

    markNew(word) {
        if (!this.data.newWords.includes(word)) {
            this.data.newWords.push(word);
        }
        this.save();
    }

    isKnown(word) {
        return this.data.knownWords.includes(word);
    }

    isNew(word) {
        return this.data.newWords.includes(word);
    }

    updateLevelProgress(level, total, known) {
        this.data.levelProgress[level] = { total, known };
        this.save();
    }

    canProgressToNextLevel(level) {
        const progress = this.data.levelProgress[level];
        return progress.known === progress.total && progress.total > 0;
    }

    advanceLevel() {
        const currentIndex = LEVELS.indexOf(this.data.currentLearnLevel);
        if (currentIndex < LEVELS.length - 1) {
            this.data.currentLearnLevel = LEVELS[currentIndex + 1];
            this.save();
        }
    }

    reset() {
        localStorage.removeItem(STORAGE_KEY);
        this.data = this.load();
    }

    getStats() {
        const totalKnown = this.data.knownWords.length;
        const totalNew = this.data.newWords.length;
        const currentLevel = this.data.currentLearnLevel;
        const levelProgress = this.data.levelProgress;
        
        return {
            totalKnown,
            totalNew,
            currentLevel,
            levelProgress
        };
    }
}

const progressManager = new ProgressManager();

// ==================== Data Loading ====================
async function loadWords() {
    try {
        const response = await fetch('words_with_examples.json');
        allWords = await response.json();
        console.log(`Loaded ${allWords.length} words`);
        initializeLevelProgress();
    } catch (error) {
        console.error('Error loading words:', error);
        alert('Error loading word data. Please refresh the page.');
    }
}

function initializeLevelProgress() {
    LEVELS.forEach(level => {
        const levelWords = allWords.filter(w => w.level === level);
        const knownCount = levelWords.filter(w => progressManager.isKnown(w.word)).length;
        progressManager.updateLevelProgress(level, levelWords.length, knownCount);
    });
}

// ==================== Screen Management ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showModeSelection() {
    showScreen('mode-selection');
    updateProgressHeader();
}

function showPracticeSelection() {
    showScreen('practice-selection');
    renderLevelGrid();
}

function renderLevelGrid() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';
    
    LEVELS.forEach(level => {
        const levelWords = allWords.filter(w => w.level === level);
        const progress = progressManager.data.levelProgress[level];
        
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.innerHTML = `
            <div style="font-size: 1.5em; margin-bottom: 5px;">${level}</div>
            <div style="font-size: 0.8em; color: #666;">${progress.known}/${progress.total}</div>
        `;
        btn.onclick = () => startPracticeMode(level);
        grid.appendChild(btn);
    });
}

// ==================== Learn Mode ====================
function startLearnMode() {
    currentMode = 'learn';
    currentLevel = progressManager.data.currentLearnLevel;
    
    // Get all words for current level
    let levelWords = allWords.filter(w => w.level === currentLevel);
    
    // Filter: show unknown words and words marked as "new"
    sessionWords = levelWords.filter(w => 
        !progressManager.isKnown(w.word) || progressManager.isNew(w.word)
    );
    
    // If all words are known, check if we can advance
    if (sessionWords.length === 0) {
        if (progressManager.canProgressToNextLevel(currentLevel)) {
            const currentIndex = LEVELS.indexOf(currentLevel);
            if (currentIndex < LEVELS.length - 1) {
                const nextLevel = LEVELS[currentIndex + 1];
                if (confirm(`🎉 Congratulations! You've completed ${currentLevel}!\n\nMove to ${nextLevel}?`)) {
                    progressManager.advanceLevel();
                    startLearnMode(); // Restart with new level
                    return;
                }
            } else {
                alert('🎊 Amazing! You\'ve completed all levels!');
                showModeSelection();
                return;
            }
        } else {
            alert(`✅ No new words in ${currentLevel}. Try Practice Mode to review!`);
            showModeSelection();
            return;
        }
    }
    
    currentWordIndex = 0;
    showScreen('learning-screen');
    displayCurrentWord();
}

// ==================== Practice Mode ====================
function startPracticeMode(level) {
    currentMode = 'practice';
    currentLevel = level;
    
    // Get all words for selected level, shuffle them
    let levelWords = allWords.filter(w => w.level === level);
    sessionWords = shuffleArray([...levelWords]);
    
    if (sessionWords.length === 0) {
        alert(`No words available for ${level}`);
        return;
    }
    
    currentWordIndex = 0;
    showScreen('learning-screen');
    displayCurrentWord();
}

// ==================== Word Display ====================
function displayCurrentWord() {
    if (currentWordIndex >= sessionWords.length) {
        endSession();
        return;
    }
    
    const word = sessionWords[currentWordIndex];
    
    document.getElementById('word-display').textContent = word.word;
    document.getElementById('word-level').textContent = word.level;
    document.getElementById('word-meaning').textContent = word.meaning || 'No meaning available';
    document.getElementById('word-example').textContent = word.sample_sentence || 'No example available';
    
    document.getElementById('word-counter').textContent = 
        `${currentWordIndex + 1}/${sessionWords.length}`;
    
    updateProgressHeader();
}

function updateProgressHeader() {
    const stats = progressManager.getStats();
    document.getElementById('current-level').textContent = 
        `Level: ${stats.currentLevel}`;
    document.getElementById('progress-stats').textContent = 
        `Known: ${stats.totalKnown} | Review: ${stats.totalNew}`;
}

// ==================== Button Actions ====================
function markAsKnown() {
    const word = sessionWords[currentWordIndex];
    progressManager.markKnown(word.word);
    
    // Update level progress
    const levelWords = allWords.filter(w => w.level === word.level);
    const knownCount = levelWords.filter(w => progressManager.isKnown(w.word)).length;
    progressManager.updateLevelProgress(word.level, levelWords.length, knownCount);
    
    nextWord();
}

function markAsNew() {
    const word = sessionWords[currentWordIndex];
    progressManager.markNew(word.word);
    nextWord();
}

function nextWord() {
    currentWordIndex++;
    displayCurrentWord();
}

function endSession() {
    const message = currentMode === 'learn' 
        ? `🎉 Great job! You've reviewed all words in ${currentLevel}!\n\nWhat would you like to do next?`
        : `💪 Practice session complete!\n\nYou reviewed ${sessionWords.length} words from ${currentLevel}.`;
    
    alert(message);
    showModeSelection();
}

function exitToModeSelection() {
    if (confirm('Exit current session? Your progress is saved.')) {
        showModeSelection();
    }
}

// ==================== Statistics ====================
function showStats() {
    const stats = progressManager.getStats();
    const statsContent = document.getElementById('stats-content');
    
    let html = `
        <div class="stat-item">
            <h3>Current Learning Level</h3>
            <div class="stat-number">${stats.currentLevel}</div>
        </div>
        
        <div class="stat-item">
            <h3>Total Words Known</h3>
            <div class="stat-number">${stats.totalKnown}</div>
        </div>
        
        <div class="stat-item">
            <h3>Words Marked for Review</h3>
            <div class="stat-number">${stats.totalNew}</div>
        </div>
        
        <h3 style="margin-top: 30px; color: #667eea;">Progress by Level</h3>
    `;
    
    LEVELS.forEach(level => {
        const progress = stats.levelProgress[level];
        const percentage = progress.total > 0 
            ? Math.round((progress.known / progress.total) * 100) 
            : 0;
        
        html += `
            <div class="stat-item">
                <h3>${level}</h3>
                <p>${progress.known} / ${progress.total} words (${percentage}%)</p>
                <div style="background: #e0e0e0; height: 8px; border-radius: 4px; margin-top: 8px;">
                    <div style="background: #667eea; height: 100%; width: ${percentage}%; border-radius: 4px; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
    });
    
    statsContent.innerHTML = html;
    showScreen('stats-screen');
}

function resetProgress() {
    if (confirm('⚠️ Are you sure you want to reset ALL progress?\n\nThis cannot be undone!')) {
        if (confirm('Really sure? This will delete all your learned words and progress.')) {
            progressManager.reset();
            initializeLevelProgress();
            alert('✅ Progress reset successfully!');
            showModeSelection();
        }
    }
}

// ==================== Utility Functions ====================
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', async () => {
    await loadWords();
    showModeSelection();
});
