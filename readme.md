## css-js-html minification

External online tools used. Some tested NPX-based libraries doesn't work fine with russian, and provide no options to set charset or smth.

Used HTML minifier:
https://htmlminifier.com/

Used JS minifier:
https://minifyjsonline.com/

## OTF font minification

```bash
pip install fonttools brotli # brotli for woff2 converting
pyftsubset .\MV-WEEKEND.otf --text-file=charset.txt --flavor=woff2 --no-hinting --desubroutinize --ignore-missing-unicodes
```