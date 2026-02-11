import config from '../../config.js';

// Simple in-memory cache for serverless environments
class SimpleCache {
    constructor(options = {}) {
        this.cache = new Map();
        this.stdTTL = options.stdTTL || 0;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return undefined;
        if (item.expiry && item.expiry < Date.now()) {
            this.cache.delete(key);
            return undefined;
        }
        return item.value;
    }

    set(key, value, ttl) {
        const timeToLive = ttl || this.stdTTL;
        const expiry = timeToLive > 0 ? Date.now() + (timeToLive * 1000) : null;
        this.cache.set(key, { value, expiry });
        return true;
    }

    del(key) {
        return this.cache.delete(key) ? 1 : 0;
    }

    flushAll() {
        this.cache.clear();
    }

    getStats() {
        return {
            keys: this.cache.size,
            hits: 0,
            misses: 0,
            ksize: 0,
            vsize: 0
        };
    }
}

// Initialize cache with TTL from config
const cache = new SimpleCache({
    stdTTL: config.cacheTTL
});

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {any} Cached value or undefined
 */
export const getCache = (key) => {
    try {
        return cache.get(key);
    } catch (error) {
        console.error(`Cache get error for key ${key}:`, error.message);
        return undefined;
    }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {boolean} Success status
 */
export const setCache = (key, value, ttl) => {
    try {
        return cache.set(key, value, ttl);
    } catch (error) {
        console.error(`Cache set error for key ${key}:`, error.message);
        return false;
    }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {number} Number of deleted entries
 */
export const deleteCache = (key) => {
    try {
        return cache.del(key);
    } catch (error) {
        console.error(`Cache delete error for key ${key}:`, error.message);
        return 0;
    }
};

/**
 * Clear all cache
 */
export const clearCache = () => {
    try {
        cache.flushAll();
    } catch (error) {
        console.error('Cache clear error:', error.message);
    }
};

/**
 * Get cache statistics
 * @returns {object} Cache stats
 */
export const getCacheStats = () => {
    return cache.getStats();
};

export default cache;
