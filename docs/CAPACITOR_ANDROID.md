# Capacitor — Android (APK)

Esta guía convierte tu PWA **Viento Maestro** en una app Android (APK) usando **Capacitor**.

## Requisitos
- Android Studio (SDK 34+)
- Java 17
- Node 20+ y PNPM/NPM/Yarn

## 1) Instalar Capacitor
```bash
pnpm i -D @capacitor/core @capacitor/cli @capacitor/android
# o con npm/yarn
```

## 2) Inicializar Capacitor
```bash
npx cap init "Viento Maestro" com.tuorg.vientomaestro
```
- **App Name:** Viento Maestro
- **App ID:** `com.tuorg.vientomaestro` (ajústalo a tu dominio inverso)

## 3) Exportar web estática (recomendado)
En el proyecto Next.js, exporta a `/out`:
```bash
pnpm run export
```
Configura `capacitor.config.ts` o `.json` para que `webDir` sea `"out"`:
```ts
import { CapacitorConfig } from '@capacitor/cli'
const config: CapacitorConfig = {
  appId: 'com.tuorg.vientomaestro',
  appName: 'Viento Maestro',
  webDir: 'out'
}
export default config
```

## 4) Agregar Android y copiar assets
```bash
npx cap add android
npx cap copy
```

## 5) Abrir Android Studio y ejecutar
```bash
npx cap open android
```
Elige un emulador/dispositivo y corre la app.

## 6) Generar APK (debug por CLI)
```bash
cd android
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

## 7) (Opcional) Servir desde servidor en LAN durante desarrollo
```ts
// capacitor.config.ts
server: { url: "http://192.168.1.100:3000", cleartext: true }
```
Y en `AndroidManifest.xml`:
```xml
<application android:usesCleartextTraffic="true">
```
> Úsalo solo para desarrollo.

## 8) Firma y release
1. Crear keystore:
```bash
keytool -genkey -v -keystore release.keystore -alias vientomaestro -keyalg RSA -keysize 2048 -validity 10000
```
2. `android/gradle.properties`:
```
MYAPP_UPLOAD_STORE_FILE=release.keystore
MYAPP_UPLOAD_KEY_ALIAS=vientomaestro
MYAPP_UPLOAD_STORE_PASSWORD=********
MYAPP_UPLOAD_KEY_PASSWORD=********
```
3. Android Studio → **Build > Generate Signed Bundle/APK**.

## Plugins nativos
Para cámara, archivos, notificaciones push, etc., instala plugins de **@capacitor/** o de terceros según necesidad.
