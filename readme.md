Расширение работает на странице: https://myshows.me/profile/

# Установка

Установить расширение https://www.tampermonkey.net/
В расширении создать новый скрипт и вставить содержимое userscript.js
Указать в SERVER_API_PATH адрес сервера в формате https://domain.name/api

# Настройка сервера:

Необходимо поставить socks5 прокси сервер и прописать настройки в .env файл
RUTRACKER_USERNAME=
RUTRACKER_PASSWORD=
PROXY_HOST=
PROXY_USERNAME=
PROXY_PASSWORD=
PROXY_PORT=1080

Установить зависимостей npm install && npm run build
Запуск npm start
