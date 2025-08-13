// Demo Data for Training Tracker
// This file contains sample exercises to demonstrate the app's capabilities

const demoExercises = [
    {
        id: "demo-1",
        name: "Bench Press",
        sets: 4,
        reps: 8,
        weight: 80,
        note: "Focus on controlled descent and explosive push",
        createdAt: new Date().toISOString()
    },
    {
        id: "demo-2",
        name: "Squats",
        sets: 3,
        reps: 12,
        weight: 100,
        note: "Keep chest up, knees in line with toes",
        createdAt: new Date().toISOString()
    },
    {
        id: "demo-3",
        name: "Deadlifts",
        sets: 3,
        reps: 6,
        weight: 120,
        note: "Maintain straight back, drive through heels",
        createdAt: new Date().toISOString()
    },
    {
        id: "demo-4",
        name: "Pull-ups",
        sets: 3,
        reps: 10,
        weight: null,
        note: "Full range of motion, controlled movement",
        createdAt: new Date().toISOString()
    },
    {
        id: "demo-5",
        name: "Overhead Press",
        sets: 4,
        reps: 8,
        weight: 60,
        note: "Keep core tight, press straight up",
        createdAt: new Date().toISOString()
    }
];

const demoTraining = {
    name: "Full Body Workout",
    exercises: demoExercises,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
};

// Function to load demo data (uncomment to use)
function loadDemoData() {
    if (typeof TrainingTracker !== 'undefined') {
        // This would be called after the TrainingTracker class is loaded
        console.log('Demo data loaded successfully!');
        console.log('Sample exercises:', demoExercises);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { demoExercises, demoTraining, loadDemoData };
}
