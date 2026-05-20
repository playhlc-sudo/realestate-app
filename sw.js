// Service Worker for 부동산 원리 이해 앱
// 최소 구성: 앱 셸 캐싱 (오프라인에서도 첫 로딩 가능)

const CACHE_NAME = 'realestate-app-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 설치: 앱 셸 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 활성화: 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch: 앱 셸은 캐시 우선, API 호출은 네트워크 우선 (캐시 안 함)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 공공데이터 API와 CORS 프록시는 캐싱하지 않음 (항상 네트워크)
  if (
    url.hostname.includes('data.go.kr') ||
    url.hostname.includes('apis.data.go.kr') ||
    url.hostname.includes('corsproxy') ||
    url.hostname.includes('allorigins')
  ) {
    return; // 기본 네트워크 처리
  }

  // 앱 셸: 캐시 우선, 실패 시 네트워크
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
