"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryCache = void 0;
class MemoryCache {
    constructor() {
        this.cache = new Map();
    }
    set(key, data, ttlMs) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttlMs,
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
}
exports.memoryCache = new MemoryCache();
