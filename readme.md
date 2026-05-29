## Сайт-справочник

Код статичного сайта-справочника настольных игр для клуба настольных и настольно-ролевых игр "пикник".

Неминифицированный код можно найти в папке `other/minify`.

## css-js-html minification

JS minified with terser:
```bash
npm install terser -g
```
```bash
terser ./other/minify/render.js --output ./components/render.js --mangle
terser ./other/minify/requests.js --output ./components/requests.js --mangle
terser ./other/minify/filters.js --output ./components/filters.js --mangle
terser ./other/minify/categories.js --output ./components/categories.js --mangle
```

CSS minified with minify:
```bash
npx minify ./other/minify/reset.css > ./components/reset.css
npx minify ./other/minify/index.css > ./components/index.css
npx minify ./other/minify/filters.css > ./components/filters.css
```

HTML minified with online tool:
https://htmlminifier.com/

## OTF font minification

```bash
pip install fonttools brotli # brotli for woff2 converting
pyftsubset .\MV-WEEKEND.otf --text-file=charset.txt --flavor=woff2 --no-hinting --desubroutinize --ignore-missing-unicodes
```
