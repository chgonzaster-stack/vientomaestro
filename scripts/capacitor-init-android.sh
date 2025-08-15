#!/usr/bin/env bash
set -euo pipefail

APP_NAME="Viento Maestro"
APP_ID="com.tuorg.vientomaestro"

echo "==> Instalando dependencias de Capacitor..."
pnpm i -D @capacitor/core @capacitor/cli @capacitor/android || npm i -D @capacitor/core @capacitor/cli @capacitor/android

echo "==> Inicializando Capacitor..."
npx cap init "$APP_NAME" "$APP_ID" --web-dir=out

echo "==> Exportando Next a /out ..."
pnpm run export || npm run export || yarn export

echo "==> Añadiendo plataforma Android..."
npx cap add android

echo '==> Copiando assets web a la app nativa...'
npx cap copy

echo "==> Abriendo Android Studio..."
npx cap open android

echo "Listo. Compila desde Android Studio o ejecuta: cd android && ./gradlew assembleDebug"
