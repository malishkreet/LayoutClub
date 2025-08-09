import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'js/[name]-[hash].js',      // JS в папку js
                chunkFileNames: 'js/[name]-[hash].js',      // чанки JS в папку js
                assetFileNames: (assetInfo) => {
                    // картинки — в img, стили — в css, шрифты — в fonts
                    const ext = path.extname(assetInfo.name);
                    if (/\.(gif|jpe?g|png|svg|webp|avif)$/i.test(ext)) {
                        return 'img/[name]-[hash][extname]';
                    }
                    if (/\.css$/i.test(ext)) {
                        return 'css/[name]-[hash][extname]';
                    }
                    if (/\.(woff2?|ttf|otf|eot)$/i.test(ext)) {
                        return 'fonts/[name]-[hash][extname]';
                    }
                    // по умолчанию в assets
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
});