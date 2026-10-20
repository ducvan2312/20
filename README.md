# Quà 20/10 cho Huyền Xinh gái ♥ Đức Văn

Website tĩnh (HTML + CSS + JavaScript thuần). Không cần backend, API key hay bước build.

## Cách hoạt động
- Giữa màn hình là **quả cầu 3D**: 24 ảnh (6 ảnh lặp lại) và 34 trái tim quay quanh chữ **20/10 – Huyền Xinh gái**, phía trước lớn và rõ, phía sau nhỏ và mờ. Lúc vào trang quả cầu nở bung ra; kéo chuột hoặc vuốt ngang để xoay.
- Chữ nền "Chồng yêu / Đức Văn / Huyền Xinh gái" chạy chậm phía sau, tim rơi nhẹ như tuyết.
- Nút **"Ấn vào đây để xem tiếp"**: bấm lần 1 mở **lá thư** to, bấm lần 2 hiện **bó hoa hồng 20/10**.
- Bó hoa: cuống mọc lên, từng bông hồng **nở dần từng lớp cánh**, kèm hoa nở bung và **mưa cánh hoa** rơi trên toàn màn hình.
- Trong bó hoa có nút **"Ấn vào đây để xem tiếp"**: mở màn hình **trái tim ghép từ chữ "yêu em / Yêu Em / YÊU EM / Huyền Xinh gái"**. Viền tim hiện dần trước, rồi lấp đầy bên trong, chữ nhấp nháy nhẹ, cuối cùng hiện dòng chữ giữa tim. (Chuyển từ code Pygame, đã đổi sang màu hồng.)
- Luồng đầy đủ: lời chúc → bó hoa 20/10 → trái tim chữ. Đóng bằng nút **Đóng ×** hoặc phím Esc; sau đó bấm nút chính để xem lại bó hoa.
- Nhạc **tự phát khi vào web** (không có nút bật/tắt). Trình duyệt thường chặn âm thanh tự phát, nên nếu chưa nghe thấy gì thì nhạc sẽ bắt đầu ngay khi người xem chạm hoặc bấm vào trang lần đầu tiên.

## Nhạc nền
- Nhạc mặc định: **`audio/unstoppable-aylex.mp3`** (bài *Unstoppable* của Aylex, nén 128 kbps còn khoảng 3 MB). Bài này thuộc kho nhạc miễn phí **Free To Use**; điều kiện sử dụng là phải ghi nguồn nên trang đã có dòng ghi nguồn nhỏ ở cuối. Đừng xóa dòng đó (thẻ `<p class="credit">` trong `index.html`). Bạn nên xem lại điều khoản mới nhất tại freetouse.com.
- Nhạc tự phát và lặp lại liên tục.
- Nếu thiếu file, web dùng giai điệu nhẹ tự tạo bằng Web Audio.
- Thư mục `audio/` còn có `nhac-nhe-lang-man.mp3`: bản piano nhẹ do Claude tự soạn, không vướng bản quyền. Muốn dùng bản này, sửa `AUDIO_SRC` trong `script.js`.
- Muốn dùng bài khác: chép file mp3 vào `audio/` rồi sửa `AUDIO_SRC`, `AUDIO_START`, `AUDIO_END` (đoạn lặp, tính bằng giây) trong `script.js`.

## Cấu trúc thư mục

```
huyen-2010/
├── index.html
├── style.css
├── script.js
├── audio/
│   ├── unstoppable-aylex.mp3   ← nhạc nền mặc định
│   └── nhac-nhe-lang-man.mp3   ← bản piano dự phòng
├── images/
│   ├── p1.jpg … p6.jpg   ← 6 ảnh trong vòng tròn
└── README.md             (không bắt buộc khi deploy)
```

Tên file đều viết thường. Phải giữ nguyên thư mục `images/` cạnh `index.html`.

## Chạy thử trên máy tính

**VS Code + Live Server:** mở thư mục `huyen-2010`, chuột phải `index.html` → *Open with Live Server*.

**Hoặc Python:**
```
cd huyen-2010
python -m http.server 8000
```
rồi mở `http://localhost:8000`.

## Đổi ảnh
Chép ảnh mới đè lên `images/p1.jpg` … `p6.jpg` (nên là ảnh vuông, khoảng 360×360 px, chụp rõ mặt ở giữa). Không cần sửa code.

## Đổi nội dung
- Lời chúc: đoạn `<div class="wish-card">` trong `index.html`.
- Chữ nền chạy: thuộc tính `data-text` của các thẻ `.mq-track` trong `index.html`.
- Màu sắc: các biến ở đầu `style.css`.
- Số ảnh/tim trên quả cầu: `NP` (ảnh) và `ND` (tim) trong hàm `buildGlobe` của `script.js`; tốc độ quay là số `0.24` trong hàm `gFrame`.
- Chữ trong trái tim: trong `script.js` sửa `H_WORDS` (các từ), `H_COLORS` (màu hồng) và `H_CENTER` (chữ giữa tim). Muốn tim đầy hơn, tăng số `160` (viền) và `130` (bên trong) trong hàm `buildHeart`.

## Deploy miễn phí lên Cloudflare Pages
1. Đăng nhập https://dash.cloudflare.com (tài khoản miễn phí).
2. Vào **Workers & Pages** → **Create** → tab **Pages** → **Upload assets**.
3. Đặt tên dự án (ví dụ `huyen-2010`) → tạo dự án.
4. Kéo thả **cả thư mục `huyen-2010`** (gồm `index.html`, `style.css`, `script.js`, `images/`). `index.html` phải nằm ở gốc nội dung tải lên.
5. Bấm **Deploy**. Cloudflare cho bạn đường link dạng `tên-dự-án.pages.dev` để gửi cho Huyền Xinh gái.

**Cập nhật sau này:** sửa file trên máy → vào dự án → **Create new deployment** → tải lại cả thư mục → Deploy. Link giữ nguyên.

**Lưu ý riêng tư:** link `.pages.dev` là công khai, ai có link đều mở được và thấy ảnh. Chỉ gửi link cho người bạn muốn, và đặt tên dự án khó đoán.

## Ghi chú kỹ thuật
- Tim rơi và pháo hoa vẽ bằng Canvas, giới hạn số lượng hạt để chạy mượt trên điện thoại.
- Hệ điều hành bật "Giảm chuyển động" thì tim rơi và pháo hoa tự tắt.
- Nếu ảnh không tải được, ô ảnh tự đổi sang nền gradient kèm biểu tượng hoa.
- Phông chữ lấy từ Google Fonts; khi offline sẽ dùng phông thay thế.
