/**
 * Rollback queue class
 */
export class AuctionRollbackQueue {
  constructor(limit) {
    this.limit = limit;
    this.queue = [];
  }

  // Push new bid with bidder object to the start of the queue
  push(bidder, bid) {
    this.queue.unshift({ bidder: bidder, bid: bid });
    if (this.queue.length > this.limit) {
      this.queue.pop(); // Remove the oldest bid
    }
  }

  // Get the latest bid without removing it
  read() {
    return this.queue.length ? this.queue[0] : null;
  }

  // Rollback the latest bid and return the next one
  rollback() {
    if (this.queue.length <= 1) return null; // Cannot rollback if only one bid left
    this.queue.shift();
    return this.read();
  }
}