# Dijital Davetiye - İlk Prototip

Mobil öncelikli, sade ve profesyonel bir düğün davetiyesi prototipidir.

## Çalıştırma

`index.html` dosyasını doğrudan açabilir veya bu klasörde basit bir yerel sunucu
çalıştırabilirsiniz:

```powershell
python -m http.server 4173
```

Ardından `http://localhost:4173` adresini açın.

## Hazır özellikler

- Mobil ve masaüstü uyumlu premium arayüz
- Katılım formu ve koşullu misafir alanları
- Demo yanıtının tarayıcıda saklanması
- Canlı geri sayım
- `.ics` takvim dosyası
- Harita bağlantısı
- Mobil paylaşım ve bağlantı kopyalama
- Klavye kullanımı ve azaltılmış hareket desteği

## Üretime geçerken

Demo içindeki `localStorage` yerine güvenli bir API ve veritabanı kullanılmalıdır.
Önerilen temel mimari: Next.js, PostgreSQL, işlem e-postaları, yönetim paneli,
tek kullanımlık davetli bağlantıları ve KVKK uyumlu açık rıza/metinleri.
