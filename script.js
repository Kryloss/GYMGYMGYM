// Training Tracker Application
class TrainingTracker {
    constructor() {
        this.currentTraining = null;
        this.exercises = [];
        this.savedTrainings = this.loadSavedTrainings();
        this.draggedElement = null;
        this.dragPlaceholder = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.loadDefaultTraining();
        this.renderExercises();
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
