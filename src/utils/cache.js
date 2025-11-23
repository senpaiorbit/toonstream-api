import NodeCache from 'node-cache';
import config from '../../config.js';

// Initialize cache with TTL from config
const cache = new NodeCache({
    stdTTL: config.cacheTTL,
    checkperiod: 600,
    useClones: false
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
