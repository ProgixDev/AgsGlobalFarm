#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./app.json').expo.version")
GITHUB_SHA=$(git rev-parse --short HEAD)
APK_NAME="ags-globalfarm-v${VERSION}-${GITHUB_SHA}.apk"
RELEASES_DIR="./releases"

echo "Building release APK v${VERSION} (${GITHUB_SHA})..."

# 1. Generate native Android project
bunx expo prebuild --platform android

# 2. Build release APK
cd android
./gradlew assembleRelease
cd ..

# 3. Copy APK to releases/
mkdir -p "$RELEASES_DIR"
APK_SOURCE="android/app/build/outputs/apk/release/app-release.apk"

if [[ ! -f "$APK_SOURCE" ]]; then
  echo "Error: APK not found at $APK_SOURCE" >&2
  exit 1
fi

cp "$APK_SOURCE" "${RELEASES_DIR}/${APK_NAME}"
echo "APK saved to ${RELEASES_DIR}/${APK_NAME}"
