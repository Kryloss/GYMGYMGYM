// Training Tracker Application
class TrainingTracker {
    constructor() {
        this.currentTraining = null;
        this.exercises = [];
        this.savedTrainings = this.loadSavedTrainings();
        this.draggedElement = null;
        this.dragPlaceholder = null;

        // Nutrition data
        this.foods = [];
        this.savedFoods = this.loadSavedFoods();

        // Progress tracking
        this.currentDate = new Date();
        this.selectedDate = new Date();

        // Settings
        this.settings = this.loadSettings();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.loadDefaultTraining();
        this.renderExercises();

        // Initialize new features
        this.applySettings();
        this.renderCalendar();

        // Load today's data
        this.loadTodaysData();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });

        // Training management
        document.getElementById('edit-training-btn').addEventListener('click', () => this.openTrainingModal());
        document.getElementById('close-training-modal').addEventListener('click', () => this.closeTrainingModal());
        document.getElementById('create-new-training').addEventListener('click', () => this.createNewTraining());

        // Exercise management
        document.getElementById('add-exercise-btn').addEventListener('click', () => this.openExerciseModal());
        document.getElementById('close-exercise-modal').addEventListener('click', () => this.closeExerciseModal());
        document.getElementById('cancel-exercise').addEventListener('click', () => this.closeExerciseModal());
        document.getElementById('exercise-form').addEventListener('submit', (e) => this.handleExerciseSubmit(e));

        // Training name editing
        document.getElementById('training-name').addEventListener('blur', (e) => this.saveTrainingName(e.target.textContent));
        document.getElementById('training-name').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.target.blur();
            }
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettingsModal());
        document.getElementById('close-settings-modal').addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings').addEventListener('click', () => this.resetSettings());

        // Nutrition
        document.getElementById('add-food-btn').addEventListener('click', () => this.openFoodModal());
        document.getElementById('close-food-modal').addEventListener('click', () => this.closeFoodModal());
        document.getElementById('cancel-food').addEventListener('click', () => this.closeFoodModal());
        document.getElementById('food-form').addEventListener('submit', (e) => this.handleFoodSubmit(e));
        document.getElementById('quick-add-food').addEventListener('click', () => this.openQuickAddModal());
        document.getElementById('close-quick-add-modal').addEventListener('click', () => this.closeQuickAddModal());

        // Progress
        document.getElementById('prev-month').addEventListener('click', () => this.previousMonth());
        document.getElementById('next-month').addEventListener('click', () => this.nextMonth());
        document.getElementById('close-day-summary-modal').addEventListener('click', () => this.closeDaySummaryModal());
    }

    // Tab Management
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Add smooth transition
        const activeContent = document.getElementById(`${tabName}-tab`);
        activeContent.style.animation = 'none';
        activeContent.offsetHeight; // Trigger reflow
        activeContent.style.animation = 'fadeIn 0.3s ease-in-out';

        // Handle tab-specific initialization
        if (tabName === 'nutrition') {
            this.updateNutritionDate();
            this.loadTodaysFoods();
        } else if (tabName === 'progress') {
            this.renderCalendar();
        }
    }

    // Date Management
    updateCurrentDate() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
    }

    updateNutritionDate() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        document.getElementById('nutrition-date').textContent = now.toLocaleDateString('en-US', options);
    }

    // Training Management
    openTrainingModal() {
        document.getElementById('training-modal').classList.add('active');
        this.renderSavedTrainings();
    }

    closeTrainingModal() {
        document.getElementById('training-modal').classList.remove('active');
    }

    createNewTraining() {
        const trainingName = prompt('Enter training name:');
        if (trainingName && trainingName.trim()) {
            this.currentTraining = {
                name: trainingName.trim(),
                exercises: [],
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            this.exercises = [];
            this.updateTrainingName(trainingName.trim());
            this.renderExercises();
            this.saveTraining();
            this.closeTrainingModal();
        }
    }

    loadDefaultTraining() {
        if (this.savedTrainings.length > 0) {
            // Load the most recent training
            const mostRecent = this.savedTrainings[0];
            this.currentTraining = mostRecent;
            this.exercises = [...mostRecent.exercises];
            this.updateTrainingName(mostRecent.name);
        } else {
            // Create default training
            this.currentTraining = {
                name: 'My Training',
                exercises: [],
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
        }
    }

    updateTrainingName(name) {
        document.getElementById('training-name').textContent = name;
        if (this.currentTraining) {
            this.currentTraining.name = name;
            this.currentTraining.lastModified = new Date().toISOString();
        }
    }

    saveTrainingName(name) {
        if (name && name.trim() && this.currentTraining) {
            this.currentTraining.name = name.trim();
            this.currentTraining.lastModified = new Date().toISOString();
            this.saveTraining();
        }
    }

    renderSavedTrainings() {
        const container = document.getElementById('saved-trainings-list');
        if (this.savedTrainings.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No saved trainings yet</p>';
            return;
        }

        container.innerHTML = this.savedTrainings.map(training => `
            <div class="saved-training-item" data-training-id="${training.createdAt}">
                <div class="saved-training-name">${training.name}</div>
                <div class="saved-training-date">${new Date(training.lastModified).toLocaleDateString()}</div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.saved-training-item').forEach(item => {
            item.addEventListener('click', () => this.loadTraining(item.dataset.trainingId));
        });
    }

    loadTraining(trainingId) {
        const training = this.savedTrainings.find(t => t.createdAt === trainingId);
        if (training) {
            this.currentTraining = { ...training };
            this.exercises = [...training.exercises];
            this.updateTrainingName(training.name);
            this.renderExercises();
            this.closeTrainingModal();
        }
    }

    saveTraining() {
        if (this.currentTraining) {
            this.currentTraining.exercises = [...this.exercises];
            this.currentTraining.lastModified = new Date().toISOString();

            // Remove existing training with same name
            this.savedTrainings = this.savedTrainings.filter(t => t.name !== this.currentTraining.name);

            // Add current training
            this.savedTrainings.unshift(this.currentTraining);

            // Keep only last 10 trainings
            this.savedTrainings = this.savedTrainings.slice(0, 10);

            localStorage.setItem('savedTrainings', JSON.stringify(this.savedTrainings));
        }

        // Also save daily exercises
        this.saveDailyExercises();
    }

    saveDailyExercises() {
        const today = new Date().toDateString();
        const dailyExercises = {
            date: today,
            exercises: [...this.exercises]
        };

        const allDailyExercises = JSON.parse(localStorage.getItem('dailyExercises') || '{}');
        allDailyExercises[today] = dailyExercises;
        localStorage.setItem('dailyExercises', JSON.stringify(allDailyExercises));
    }

    loadSavedTrainings() {
        try {
            const saved = localStorage.getItem('savedTrainings');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading saved trainings:', error);
            return [];
        }
    }

    // Exercise Management
    openExerciseModal() {
        document.getElementById('exercise-modal').classList.add('active');
        document.getElementById('exercise-form').reset();
    }

    closeExerciseModal() {
        document.getElementById('exercise-modal').classList.remove('active');
    }

    handleExerciseSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const exercise = {
            id: Date.now().toString(),
            name: formData.get('exercise-name'),
            sets: parseInt(formData.get('exercise-sets')),
            reps: parseInt(formData.get('exercise-reps')),
            weight: formData.get('exercise-weight') ? parseFloat(formData.get('exercise-weight')) : null,
            note: formData.get('exercise-note') || null,
            createdAt: new Date().toISOString()
        };

        this.addExercise(exercise);
        this.closeExerciseModal();
        e.target.reset();
    }

    addExercise(exercise) {
        this.exercises.push(exercise);
        this.renderExercises();
        this.saveTraining();
        this.animateNewExercise(exercise.id);
    }

    deleteExercise(exerciseId) {
        const index = this.exercises.findIndex(e => e.id === exerciseId);
        if (index > -1) {
            const exerciseElement = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
            exerciseElement.style.animation = 'slideOut 0.3s ease-in-out';

            setTimeout(() => {
                this.exercises.splice(index, 1);
                this.renderExercises();
                this.saveTraining();
            }, 300);
        }
    }

    editExercise(exerciseId) {
        const exercise = this.exercises.find(e => e.id === exerciseId);
        if (exercise) {
            // Populate form with exercise data
            document.getElementById('exercise-name').value = exercise.name;
            document.getElementById('exercise-sets').value = exercise.sets;
            document.getElementById('exercise-reps').value = exercise.reps;
            document.getElementById('exercise-weight').value = exercise.weight || '';
            document.getElementById('exercise-note').value = exercise.note || '';

            // Change form to edit mode
            const form = document.getElementById('exercise-form');
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Exercise';

            // Store exercise ID for editing
            form.dataset.editId = exerciseId;

            // Change form submit handler
            form.onsubmit = (e) => this.handleExerciseEdit(e);

            this.openExerciseModal();
        }
    }

    handleExerciseEdit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const exerciseId = e.target.dataset.editId;
        const exerciseIndex = this.exercises.findIndex(e => e.id === exerciseId);

        if (exerciseIndex > -1) {
            this.exercises[exerciseIndex] = {
                ...this.exercises[exerciseIndex],
                name: formData.get('exercise-name'),
                sets: parseInt(formData.get('exercise-sets')),
                reps: parseInt(formData.get('exercise-reps')),
                weight: formData.get('exercise-weight') ? parseFloat(formData.get('exercise-weight')) : null,
                note: formData.get('exercise-note') || null,
                lastModified: new Date().toISOString()
            };

            this.renderExercises();
            this.saveTraining();
            this.closeExerciseModal();

            // Reset form to add mode
            this.resetExerciseForm();
        }
    }

    resetExerciseForm() {
        const form = document.getElementById('exercise-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add Exercise';
        delete form.dataset.editId;
        form.onsubmit = (e) => this.handleExerciseSubmit(e);
        form.reset();
    }

    renderExercises() {
        const container = document.getElementById('exercise-blocks');

        if (this.exercises.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dumbbell"></i>
                    <h3>No exercises yet</h3>
                    <p>Add your first exercise to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.exercises.map(exercise => this.createExerciseHTML(exercise)).join('');

        // Add event listeners to new elements
        this.addExerciseEventListeners();

        // Setup drag and drop
        this.setupDragAndDrop();
    }

    createExerciseHTML(exercise) {
        return `
            <div class="exercise-block" data-exercise-id="${exercise.id}" draggable="true">
                <div class="exercise-header">
                    <div class="exercise-title">${exercise.name}</div>
                    <div class="exercise-actions">
                        <button class="action-btn edit-exercise" title="Edit Exercise">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-exercise" title="Delete Exercise">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="exercise-details">
                    <div class="detail-item">
                        <div class="detail-label">Sets</div>
                        <div class="detail-value">${exercise.sets}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Reps</div>
                        <div class="detail-value">${exercise.reps}</div>
                    </div>
                    ${exercise.weight ? `
                        <div class="detail-item">
                            <div class="detail-label">Weight</div>
                            <div class="detail-value">${exercise.weight} kg</div>
                        </div>
                    ` : ''}
                </div>
                ${exercise.note ? `
                    <div class="exercise-note">${exercise.note}</div>
                ` : ''}
            </div>
        `;
    }

    addExerciseEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-exercise').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exerciseId = e.target.closest('.exercise-block').dataset.exerciseId;
                this.editExercise(exerciseId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-exercise').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exerciseId = e.target.closest('.exercise-block').dataset.exerciseId;
                if (confirm('Are you sure you want to delete this exercise?')) {
                    this.deleteExercise(exerciseId);
                }
            });
        });
    }

    // Drag and Drop
    setupDragAndDrop() {
        const exerciseBlocks = document.querySelectorAll('.exercise-block');

        exerciseBlocks.forEach(block => {
            block.addEventListener('dragstart', (e) => this.handleDragStart(e));
            block.addEventListener('dragend', (e) => this.handleDragEnd(e));
            block.addEventListener('dragover', (e) => this.handleDragOver(e));
            block.addEventListener('drop', (e) => this.handleDrop(e));
            block.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            block.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;

        // Remove placeholder
        if (this.dragPlaceholder) {
            this.dragPlaceholder.remove();
            this.dragPlaceholder = null;
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        const target = e.target.closest('.exercise-block');
        if (target && target !== this.draggedElement) {
            target.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const target = e.target.closest('.exercise-block');
        if (target) {
            target.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const target = e.target.closest('.exercise-block');

        if (target && this.draggedElement && target !== this.draggedElement) {
            const draggedId = this.draggedElement.dataset.exerciseId;
            const targetId = target.dataset.exerciseId;

            // Reorder exercises array
            const draggedIndex = this.exercises.findIndex(ex => ex.id === draggedId);
            const targetIndex = this.exercises.findIndex(ex => ex.id === targetId);

            if (draggedIndex > -1 && targetIndex > -1) {
                const [draggedExercise] = this.exercises.splice(draggedIndex, 1);
                this.exercises.splice(targetIndex, 0, draggedExercise);

                // Re-render to update order
                this.renderExercises();
                this.saveTraining();
            }
        }

        // Clean up
        document.querySelectorAll('.exercise-block').forEach(block => {
            block.classList.remove('drag-over');
        });
    }

    // Animations
    animateNewExercise(exerciseId) {
        const exerciseElement = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
        if (exerciseElement) {
            exerciseElement.style.animation = 'slideIn 0.5s ease-out';
            setTimeout(() => {
                exerciseElement.style.animation = '';
            }, 500);
        }
    }

    // Nutrition Management
    openFoodModal() {
        document.getElementById('food-modal').classList.add('active');
        document.getElementById('food-form').reset();
    }

    closeFoodModal() {
        document.getElementById('food-modal').classList.remove('active');
    }

    openQuickAddModal() {
        document.getElementById('quick-add-modal').classList.add('active');
        this.renderQuickAddFoods();
    }

    closeQuickAddModal() {
        document.getElementById('quick-add-modal').classList.remove('active');
    }

    handleFoodSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const food = {
            id: Date.now().toString(),
            name: formData.get('food-name'),
            calories: formData.get('food-calories') ? parseFloat(formData.get('food-calories')) : null,
            protein: formData.get('food-protein') ? parseFloat(formData.get('food-protein')) : null,
            carbs: formData.get('food-carbs') ? parseFloat(formData.get('food-carbs')) : null,
            fats: formData.get('food-fats') ? parseFloat(formData.get('food-fats')) : null,
            note: formData.get('food-note') || null,
            createdAt: new Date().toISOString()
        };

        this.addFood(food);
        this.closeFoodModal();
        e.target.reset();
    }

    addFood(food) {
        this.foods.push(food);
        this.renderFoods();
        this.saveFoods();
        this.animateNewFood(food.id);

        // Save to quick add foods if it has macros
        if (food.calories || food.protein || food.carbs || food.fats) {
            this.saveToQuickAddFoods(food);
        }
    }

    deleteFood(foodId) {
        const index = this.foods.findIndex(f => f.id === foodId);
        if (index > -1) {
            const foodElement = document.querySelector(`[data-food-id="${foodId}"]`);
            foodElement.style.animation = 'slideOut 0.3s ease-in-out';

            setTimeout(() => {
                this.foods.splice(index, 1);
                this.renderFoods();
                this.saveFoods();
            }, 300);
        }
    }

    renderFoods() {
        const container = document.getElementById('food-blocks');

        if (this.foods.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>No foods logged yet</h3>
                    <p>Add your first food item to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.foods.map(food => this.createFoodHTML(food)).join('');
        this.addFoodEventListeners();
        this.setupFoodDragAndDrop();
    }

    createFoodHTML(food) {
        return `
            <div class="food-block" data-food-id="${food.id}" draggable="true">
                <div class="food-header">
                    <div class="food-title">${food.name}</div>
                    <div class="food-actions">
                        <button class="action-btn delete-food" title="Delete Food">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="food-details">
                    ${food.calories ? `
                        <div class="detail-item">
                            <div class="detail-label">Calories</div>
                            <div class="detail-value">${food.calories}</div>
                        </div>
                    ` : ''}
                    ${food.protein ? `
                        <div class="detail-item">
                            <div class="detail-label">Protein</div>
                            <div class="detail-value">${food.protein}g</div>
                        </div>
                    ` : ''}
                    ${food.carbs ? `
                        <div class="detail-item">
                            <div class="detail-label">Carbs</div>
                            <div class="detail-value">${food.carbs}g</div>
                        </div>
                    ` : ''}
                    ${food.fats ? `
                        <div class="detail-item">
                            <div class="detail-label">Fats</div>
                            <div class="detail-value">${food.fats}g</div>
                        </div>
                    ` : ''}
                </div>
                ${food.note ? `
                    <div class="food-note">${food.note}</div>
                ` : ''}
            </div>
        `;
    }

    addFoodEventListeners() {
        document.querySelectorAll('.delete-food').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const foodId = e.target.closest('.food-block').dataset.foodId;
                if (confirm('Are you sure you want to delete this food item?')) {
                    this.deleteFood(foodId);
                }
            });
        });
    }

    setupFoodDragAndDrop() {
        const foodBlocks = document.querySelectorAll('.food-block');

        foodBlocks.forEach(block => {
            block.addEventListener('dragstart', (e) => this.handleFoodDragStart(e));
            block.addEventListener('dragend', (e) => this.handleFoodDragEnd(e));
            block.addEventListener('dragover', (e) => this.handleFoodDragOver(e));
            block.addEventListener('drop', (e) => this.handleFoodDrop(e));
            block.addEventListener('dragenter', (e) => this.handleFoodDragEnter(e));
            block.addEventListener('dragleave', (e) => this.handleFoodDragLeave(e));
        });
    }

    handleFoodDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    handleFoodDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
    }

    handleFoodDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleFoodDragEnter(e) {
        e.preventDefault();
        const target = e.target.closest('.food-block');
        if (target && target !== this.draggedElement) {
            target.classList.add('drag-over');
        }
    }

    handleFoodDragLeave(e) {
        const target = e.target.closest('.food-block');
        if (target) {
            target.classList.remove('drag-over');
        }
    }

    handleFoodDrop(e) {
        e.preventDefault();
        const target = e.target.closest('.food-block');

        if (target && this.draggedElement && target !== this.draggedElement) {
            const draggedId = this.draggedElement.dataset.foodId;
            const targetId = target.dataset.foodId;

            const draggedIndex = this.foods.findIndex(f => f.id === draggedId);
            const targetIndex = this.foods.findIndex(f => f.id === targetId);

            if (draggedIndex > -1 && targetIndex > -1) {
                const [draggedFood] = this.foods.splice(draggedIndex, 1);
                this.foods.splice(targetIndex, 0, draggedFood);

                this.renderFoods();
                this.saveFoods();
            }
        }

        document.querySelectorAll('.food-block').forEach(block => {
            block.classList.remove('drag-over');
        });
    }

    animateNewFood(foodId) {
        const foodElement = document.querySelector(`[data-food-id="${foodId}"]`);
        if (foodElement) {
            foodElement.style.animation = 'slideIn 0.5s ease-out';
            setTimeout(() => {
                foodElement.style.animation = '';
            }, 500);
        }
    }

    renderQuickAddFoods() {
        const container = document.getElementById('quick-add-foods-list');

        if (this.savedFoods.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No saved foods yet</p>';
            return;
        }

        container.innerHTML = this.savedFoods.map(food => `
            <div class="quick-add-food-item" data-food-id="${food.id}">
                <div class="quick-add-food-name">${food.name}</div>
                <div class="quick-add-food-macros">
                    ${food.calories ? `${food.calories} cal` : ''}
                    ${food.protein ? ` • ${food.protein}g protein` : ''}
                    ${food.carbs ? ` • ${food.carbs}g carbs` : ''}
                    ${food.fats ? ` • ${food.fats}g fats` : ''}
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.quick-add-food-item').forEach(item => {
            item.addEventListener('click', () => this.quickAddFood(item.dataset.foodId));
        });
    }

    quickAddFood(foodId) {
        const savedFood = this.savedFoods.find(f => f.id === foodId);
        if (savedFood) {
            const newFood = {
                ...savedFood,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            this.addFood(newFood);
            this.closeQuickAddModal();
        }
    }

    saveToQuickAddFoods(food) {
        // Remove existing food with same name
        this.savedFoods = this.savedFoods.filter(f => f.name !== food.name);

        // Add new food
        this.savedFoods.unshift(food);

        // Keep only last 20 foods
        this.savedFoods = this.savedFoods.slice(0, 20);

        localStorage.setItem('savedFoods', JSON.stringify(this.savedFoods));
    }

    saveFoods() {
        const today = new Date().toDateString();
        const dailyFoods = {
            date: today,
            foods: [...this.foods]
        };

        const allDailyFoods = JSON.parse(localStorage.getItem('dailyFoods') || '{}');
        allDailyFoods[today] = dailyFoods;
        localStorage.setItem('dailyFoods', JSON.stringify(allDailyFoods));
    }

    loadSavedFoods() {
        try {
            const saved = localStorage.getItem('savedFoods');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading saved foods:', error);
            return [];
        }
    }

    loadTodaysData() {
        this.loadTodaysFoods();
        this.loadTodaysExercises();
    }

    loadTodaysFoods() {
        const today = new Date().toDateString();
        const dailyFoods = JSON.parse(localStorage.getItem('dailyFoods') || '{}');
        this.foods = dailyFoods[today] ? dailyFoods[today].foods : [];
        this.renderFoods();
    }

    loadTodaysExercises() {
        const today = new Date().toDateString();
        const dailyExercises = JSON.parse(localStorage.getItem('dailyExercises') || '{}');
        this.exercises = dailyExercises[today] ? dailyExercises[today].exercises : [];
        this.renderExercises();
    }

    // Progress Tab Management
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    renderCalendar() {
        const monthYear = this.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
        document.getElementById('current-month').textContent = monthYear;

        const calendarGrid = document.getElementById('calendar-grid');
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let calendarHTML = '';

        // Add day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });

        // Add calendar days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const isCurrentMonth = currentDate.getMonth() === this.currentDate.getMonth();
            const isToday = currentDate.toDateString() === new Date().toDateString();
            const hasData = this.hasDayData(currentDate);

            let dayClass = 'calendar-day';
            if (!isCurrentMonth) dayClass += ' other-month';
            if (isToday) dayClass += ' today';
            if (hasData) dayClass += ' has-data';

            calendarHTML += `
                <div class="${dayClass}" data-date="${currentDate.toDateString()}">
                    <div class="day-number">${currentDate.getDate()}</div>
                    ${hasData ? this.getDayIndicators(currentDate) : ''}
                </div>
            `;
        }

        calendarGrid.innerHTML = calendarHTML;
        this.addCalendarEventListeners();
    }

    hasDayData(date) {
        const dateString = date.toDateString();
        const dailyFoods = JSON.parse(localStorage.getItem('dailyFoods') || '{}');
        const dailyExercises = JSON.parse(localStorage.getItem('dailyExercises') || '{}');

        return dailyFoods[dateString] || dailyExercises[dateString];
    }

    getDayIndicators(date) {
        const dateString = date.toDateString();
        const dailyFoods = JSON.parse(localStorage.getItem('dailyFoods') || '{}');
        const dailyExercises = JSON.parse(localStorage.getItem('dailyExercises') || '{}');

        let indicators = '<div class="day-indicators">';
        if (dailyExercises[dateString]) {
            indicators += '<div class="day-indicator training"></div>';
        }
        if (dailyFoods[dateString]) {
            indicators += '<div class="day-indicator nutrition"></div>';
        }
        indicators += '</div>';

        return indicators;
    }

    addCalendarEventListeners() {
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', (e) => {
                const dateString = e.currentTarget.dataset.date;
                if (dateString) {
                    this.showDaySummary(new Date(dateString));
                }
            });
        });
    }

    showDaySummary(date) {
        this.selectedDate = date;
        const dateString = date.toDateString();
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.getElementById('day-summary-title').textContent = formattedDate;

        // Load training data
        const dailyExercises = JSON.parse(localStorage.getItem('dailyExercises') || '{}');
        const exercises = dailyExercises[dateString] || [];

        // Load nutrition data
        const dailyFoods = JSON.parse(localStorage.getItem('dailyFoods') || '{}');
        const foods = dailyFoods[dateString] || [];

        this.renderTrainingSummary(exercises);
        this.renderNutritionSummary(foods);

        document.getElementById('day-summary-modal').classList.add('active');
    }

    renderTrainingSummary(exercises) {
        const container = document.getElementById('training-summary');

        if (exercises.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No training data for this day</p>';
            return;
        }

        container.innerHTML = exercises.map(exercise => `
            <div style="margin-bottom: 12px; padding: 12px; background: var(--surface); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <strong>${exercise.name}</strong><br>
                ${exercise.sets} sets × ${exercise.reps} reps
                ${exercise.weight ? ` • ${exercise.weight} kg` : ''}
                ${exercise.note ? `<br><em>${exercise.note}</em>` : ''}
            </div>
        `).join('');
    }

    renderNutritionSummary(foods) {
        const container = document.getElementById('nutrition-summary');

        if (foods.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No nutrition data for this day</p>';
            return;
        }

        const totalCalories = foods.reduce((sum, food) => sum + (food.calories || 0), 0);
        const totalProtein = foods.reduce((sum, food) => sum + (food.protein || 0), 0);
        const totalCarbs = foods.reduce((sum, food) => sum + (food.carbs || 0), 0);
        const totalFats = foods.reduce((sum, food) => sum + (food.fats || 0), 0);

        container.innerHTML = `
            <div style="margin-bottom: 16px; padding: 12px; background: var(--surface); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <strong>Daily Totals:</strong><br>
                Calories: ${totalCalories} | Protein: ${totalProtein}g | Carbs: ${totalCarbs}g | Fats: ${totalFats}g
            </div>
            ${foods.map(food => `
                <div style="margin-bottom: 8px; padding: 8px; background: var(--surface); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    <strong>${food.name}</strong>
                    ${food.calories ? ` • ${food.calories} cal` : ''}
                    ${food.note ? `<br><em>${food.note}</em>` : ''}
                </div>
            `).join('')}
        `;
    }

    // Settings Management
    openSettingsModal() {
        document.getElementById('settings-modal').classList.add('active');
        this.loadSettingsToForm();
    }

    closeSettingsModal() {
        document.getElementById('settings-modal').classList.remove('active');
    }

    closeDaySummaryModal() {
        document.getElementById('day-summary-modal').classList.remove('active');
    }

    loadSettingsToForm() {
        document.getElementById('theme-toggle').checked = this.settings.darkMode || false;
        document.getElementById('block-size').value = this.settings.blockSize || 'medium';
        document.getElementById('font-size').value = this.settings.fontSize || 'medium';
    }

    saveSettings() {
        this.settings = {
            darkMode: document.getElementById('theme-toggle').checked,
            blockSize: document.getElementById('block-size').value,
            fontSize: document.getElementById('font-size').value
        };

        localStorage.setItem('appSettings', JSON.stringify(this.settings));
        this.applySettings();
        this.closeSettingsModal();
    }

    resetSettings() {
        this.settings = {
            darkMode: false,
            blockSize: 'medium',
            fontSize: 'medium'
        };

        localStorage.setItem('appSettings', JSON.stringify(this.settings));
        this.applySettings();
        this.loadSettingsToForm();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('appSettings');
            return saved ? JSON.parse(saved) : {
                darkMode: false,
                blockSize: 'medium',
                fontSize: 'medium'
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                darkMode: false,
                blockSize: 'medium',
                fontSize: 'medium'
            };
        }
    }

    applySettings() {
        // Apply theme
        if (this.settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Apply block size
        document.documentElement.style.setProperty('--block-size', this.getBlockSizeValue());

        // Apply font size
        document.documentElement.style.setProperty('--font-size', this.getFontSizeValue());
    }

    getBlockSizeValue() {
        switch (this.settings.blockSize) {
            case 'small': return '16px';
            case 'large': return '24px';
            default: return '20px';
        }
    }

    getFontSizeValue() {
        switch (this.settings.fontSize) {
            case 'small': return '14px';
            case 'large': return '18px';
            default: return '16px';
        }
    }

    // Utility Methods
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
}

// Add CSS for slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { 
            opacity: 1; 
            transform: translateX(0); 
        }
        to { 
            opacity: 0; 
            transform: translateX(100px); 
        }
    }
    
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary);
    }
    
    .empty-state i {
        font-size: 48px;
        color: var(--primary-purple);
        margin-bottom: 24px;
    }
    
    .empty-state h3 {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--text-primary);
    }
    
    .empty-state p {
        font-size: 16px;
        line-height: 1.6;
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TrainingTracker();
});
