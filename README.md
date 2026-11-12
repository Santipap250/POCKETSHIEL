# OBIX POCKETSHIELD v1.0.0

เครื่องมือความปลอดภัยที่ทำงานในเบราว์เซอร์ของผู้ใช้ทั้งหมด ติดตั้งเป็น PWA ได้ ไม่มี Backend ไม่มีบัญชี ไม่มี API Key

## เครื่องมือ
รหัสผ่าน/Passphrase · AES-256-GCM (ข้อความ+ไฟล์) · SHA-256/384/512 · ตรวจลิงก์ · JWT Inspector · Security Headers · Dev Tools (Base64, URL, HTML entity, JSON, UUID, Token, Timestamp, สี, เปรียบเทียบข้อความ) · Safe Cyber Lab (SQLi, XSS จำลอง)

## รันในเครื่อง
```
npm test                    # Unit tests (Node 18+)
npx serve .                 # หรือ python3 -m http.server 8080
```
ไม่มีขั้นตอน build เป็นเว็บไซต์ Static ล้วน (ไม่ต้อง `npm install`) ต้องเปิดผ่าน http(s) ไม่ใช่ file:// เพื่อให้ Service Worker ทำงาน

## วางบน GitHub
1. สร้าง Repository ใหม่ (ว่างเปล่า) บน github.com
2. แตกไฟล์ ZIP แล้วอัปโหลดไฟล์ทั้งหมด หรือใช้ `git init && git add . && git commit -m "v1.0.0" && git branch -M main && git remote add origin <URL> && git push -u origin main`

## Deploy บน Vercel
1. เข้า vercel.com แล้วล็อกอินด้วย GitHub → **Add New… → Project**
2. เลือก Repository นี้ → **Import**
3. Framework Preset: **Other** · Build Command: เว้นว่าง · Output Directory: เว้นว่าง (ใช้ root)
4. ไม่ต้องตั้ง Environment Variables → กด **Deploy**
5. เปิดโดเมน `*.vercel.app` ที่ได้ ทุกครั้งที่ Push เข้า `main` Vercel จะ Deploy ใหม่อัตโนมัติ
`vercel.json` ตั้ง CSP และ Security Headers ให้แล้ว

## ติดตั้งเป็นแอป
- **Android (Chrome):** เมนู ⋮ → ติดตั้งแอป / เพิ่มลงหน้าจอหลัก
- **iPhone (Safari):** ปุ่มแชร์ → เพิ่มไปยังหน้าจอโฮม
- **Desktop (Chrome/Edge):** ไอคอนติดตั้งที่แถบที่อยู่

## ความเป็นส่วนตัวและข้อจำกัด
- ไม่ส่ง/เก็บรหัสผ่าน คีย์ ไฟล์ หรือ URL ไม่มี Tracking ไม่เรียก Third-party
- ผลตรวจลิงก์เป็นการประเมินเบื้องต้นตามกฎ ไม่ใช่การรับรองว่าปลอดภัย
- JWT Inspector ถอดรหัสเท่านั้น ไม่ตรวจลายเซ็น
- ลืมรหัสผ่านไฟล์ `.obx` แล้วกู้คืนไม่ได้
- แอปนี้ไม่สแกนอุปกรณ์ ไฟล์ระบบ หรือมัลแวร์ และไม่ใช่ซอฟต์แวร์ป้องกันไวรัส
- Safe Cyber Lab เป็นการจำลองในแอป ไม่ส่ง Payload ออกไปที่ใด

## ข้อจำกัดของเวอร์ชันนี้
ยังไม่มี: QR Generator, Cookie/Auth/Password Lab, แปลภาษาอังกฤษเฉพาะเมนูและหน้าแรก (หน้าเครื่องมือยังเป็นภาษาไทย) · สแกน QR ใช้ BarcodeDetector ของ Chrome Android ยังไม่ได้ทดสอบกับกล้องจริง

License: MIT
