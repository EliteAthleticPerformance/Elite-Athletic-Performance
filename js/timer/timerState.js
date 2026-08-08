// ========================================
// TIMER STATE
// Single source of truth for timer runtime
// ========================================

const TIMER_PHASES = window.TIMER_PHASES;

window.TimerState = {

    // ========================================
    // CORE TIMER ENGINE
    // ========================================

    timer: null,
    nextTickTime: null,
    isRunning: false,

    // ========================================
    // RUNTIME CLOCK
    // ========================================

    timeLeft: 0,
    totalSeconds: 0,
    originalTotalSeconds: 0,
    classStartTime: null,
    
    // ========================================
    // WORKOUT POSITION
    // ========================================

    currentPhase: TIMER_PHASES.IDLE,
    currentSet: 1,
    displaySetNumber: 1,
    rotationCount: 0,
    
    // ========================================
    // WORKOUT CONFIGURATION
    // ========================================

    classBlockLength: null,
    dressOutDuration: null,
    dynamicStretchDuration: null,
    breakDuration: null,
    cooldownDuration: null,

    sheetWorkDuration: null,
    sheetRotateDuration: null,
    
    // ========================================
    // WORKOUT DATA
    // ========================================

    workoutData: [],
    timelineData: [],
    
    // ========================================
    // AUDIO
    // ========================================

    audioCtx: null,
    selectedVoice: null,
    lastCountdownSpoken: null,
    dressWarningSpoken: false,

 
    // ========================================
    // AUTO SCHEDULER
    // ========================================

    autoStartTimer: null,
    lastAutoStartMinute: null,
    lastStartTime: null,
    todayOnlyMode: false,
    forceDateString: null,

    // ========================================
    // COACH SYNC
    // ========================================

    controlAction: null,
    controlTimestamp: null,
    controlPhase: null,
    controlSet: null,
    controlRotation: null,
    lastControlSignature: null,

    // ========================================
    // THEME
    // ========================================

    globalTheme: null

};