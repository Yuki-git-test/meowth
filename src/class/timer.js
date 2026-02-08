/**
 * Dynamic countdown timer class
 */
export class CountdownTimer {
    /**
     * 
     * @param {*} duration duration in seconds
     * @param {*} callbacks callbacks at x seconds
     */
    constructor(duration, callbacks = {}) {
      this.duration = duration * 1000; // convert to milliseconds
      this.remainingTime = this.duration;
      this.callbacks = callbacks; // { 0: () => {}, 600: () => {} }
      this.timer = null;
      this.startTime = null;
    }
  
    /**
     * Start the timer
     */
    start() {
      if (this.timer) return; // Prevent multiple timers
  
      this.startTime = Date.now();
  
      this.timer = setInterval(() => {
        const elapsed = Date.now() - this.startTime;
        this.remainingTime = this.duration - elapsed;
  
        if (this.remainingTime <= 0) {
          this.executeCallback(0);
          this.stop();
          return;
        }
  
        this.checkCallbacks();
      }, 1000);
    }
  
    /**
     * Stop the timer
     */
    stop() {
      clearInterval(this.timer);
      this.timer = null;
    }
  
    /**
     * Add more time to the timer
     * @param {*} seconds 
     */
    addTime(seconds) {
      this.duration += seconds * 1000;
    }
  
    /**
     * Check for callback intervals
     */
    checkCallbacks() {
      for (const [timestamp, callback] of Object.entries(this.callbacks)) {
        const targetTime = timestamp * 1000;
        if (this.remainingTime <= targetTime && targetTime <= this.duration) {
          this.executeCallback(timestamp);
          delete this.callbacks[timestamp];
        }
      }
    }
  
    /**
     * Execute a callback at timestamp
     * @param {*} timestamp 
     */
    executeCallback(timestamp) {
      if (this.callbacks[timestamp]) {
        this.callbacks[timestamp]();
      }
    }
  
    /**
     * Get remaining time in seconds
     * @returns 
     */
    getRemainingTime() {
      return Math.max(0, Math.floor(this.remainingTime / 1000));
    }
  }