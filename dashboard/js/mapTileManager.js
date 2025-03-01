class MapTileManager {
    constructor(azureMapInstance, options = {}) {
        this.map = azureMapInstance;
        this.tileCache = new Map();
        this.cacheSize = 0;
        this.MAX_CACHE_SIZE = options.maxCacheSize || 500;
        this.CACHE_EXPIRY = options.cacheExpiry || (30 * 60 * 1000); // 30 minutes default
    }

    setupTileCachingListeners() {
        this.map.events.add('render', () => this.optimizeTileLoading());

        this.map.events.add('move', () => this.manageTileCache());
        this.map.events.add('zoom', () => this.manageTileCache());
    }

    optimizeTileLoading() {
        const visibleTiles = this.getVisibleTiles();
        visibleTiles.forEach(tile => {
            const tileKey = `${tile.zoom}_${tile.x}_${tile.y}`;

            if (!this.tileCache.has(tileKey)) {
                this.fetchTileFromServerCache(tileKey);
            }
        });
    }

    async fetchTileFromServerCache(tileKey) {
        try {
            const response = await fetch(`/geofence/tile/${tileKey.replace('_', '/')}`);

            if (response.ok) {
                const tileBlob = await response.blob();
                this.cacheTile(tileKey, tileBlob);
            }
        } catch (error) {
            console.error('Tile fetch error:', error);
        }
    }

    cacheTile(tileKey, tileBlob) {
        if (this.cacheSize >= this.MAX_CACHE_SIZE) {
            this.evictOldestTile();
        }

        this.tileCache.set(tileKey, {
            blob: tileBlob,
            timestamp: Date.now()
        });
        this.cacheSize++;
    }

    evictOldestTile() {
        let oldestKey = null;
        let oldestTimestamp = Infinity;

        for (const [key, value] of this.tileCache.entries()) {
            if (value.timestamp < oldestTimestamp) {
                oldestKey = key;
                oldestTimestamp = value.timestamp;
            }
        }

        if (oldestKey) {
            this.tileCache.delete(oldestKey);
            this.cacheSize--;
        }
    }

    manageTileCache() {
        const currentTime = Date.now();

        for (const [key, value] of this.tileCache.entries()) {
            if (currentTime - value.timestamp > this.CACHE_EXPIRY) {
                this.tileCache.delete(key);
                this.cacheSize--;
            }
        }
    }

    getVisibleTiles() {
        try {
            const camera = this.map.getCamera();
            const rawBounds = camera.bounds;
            const zoom = Math.floor(camera.zoom);

            if (!rawBounds || zoom < 0) {
                console.warn("Invalid map bounds or zoom level.");
                return [];
            }

            const { west: minLon, south: minLat, east: maxLon, north: maxLat } = this.arrayToBounds(rawBounds);

            if ([minLon, minLat, maxLon, maxLat].some(coord => coord === undefined)) {
                console.warn("Invalid bounds values:", rawBounds);
                return [];
            }

            return this.calculateTileRange({ minLon, minLat, maxLon, maxLat }, zoom);
        } catch (error) {
            console.error("Error in getVisibleTiles:", error);
            return [];
        }
    }

    calculateTileRange(bounds, zoom) {
        try {
            const { minLon, minLat, maxLon, maxLat } = bounds;

            const minTile = this.latLngToTile(minLat, minLon, zoom);
            const maxTile = this.latLngToTile(maxLat, maxLon, zoom);

            const startX = Math.min(minTile.x, maxTile.x);
            const endX = Math.max(minTile.x, maxTile.x);
            const startY = Math.min(minTile.y, maxTile.y);
            const endY = Math.max(minTile.y, maxTile.y);

            const tiles = [];
            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    tiles.push({ zoom, x, y });
                }
            }

            return tiles;
        } catch (error) {
            console.error("Error in calculateTileRange:", error);
            return [];
        }
    }

    latLngToTile(lat, lon, zoom) {
        try {
            const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
            const y = Math.floor(
                ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
                Math.pow(2, zoom)
            );

            return { x, y };
        } catch (error) {
            console.error("Error in latLngToTile:", error);
            return { x: 0, y: 0 };
        }
    }

    arrayToBounds(boundsArray) {
        if (!Array.isArray(boundsArray) || boundsArray.length !== 4) {
            throw new Error("Invalid bounds array. Expected [west, south, east, north].");
        }
        return {
            west: boundsArray[0],
            south: boundsArray[1],
            east: boundsArray[2],
            north: boundsArray[3]
        };
    }
}
