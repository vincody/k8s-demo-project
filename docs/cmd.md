**Nhóm lệnh CƠ BẢN kubenetes**

* sudo kubectl get svc -- Coi port đang dùng hiện tại của kubenet

* sudo kubectl scale deployment web-demo-deployment --replicas=10 -- demo scaling (mở rộng tức thì mà không cần chỉnh sửa file config)
* sudo kubectl scale deployment web-demo-deployment --replicas=6
* sudo kubectl scale deployment web-demo-deployment --replicas=3

* sudo kubectl delete pod <tên pod> (--all nếu muốn xóa hết) -- delete

* sudo kubectl get pod <-w> thêm tham số watch nếu cần theo dỗi biến động các pod

* kubectl rollout undo (trong trường hợp bị lỗi rollback để ver trước)
* sudo kubectl get pod <tenpod> -o jsonpath='{.spec.containers[0].image}' -- kiem tra xem dang chay v may
----------------------------------------------------------------------------------------------------------------------------------
**Nhóm lệnh Triển khai (Infrastructure as Code)**
Đây là các lệnh dùng để biến các file YAML của bạn thành hệ thống thực tế.

* sudo kubectl apply -f <tên-file.yaml>: Triển khai hoặc cập nhật một file cụ thể (ví dụ: sudo kubectl apply -f deployment.yaml).

* sudo kubectl apply -f .: Lệnh "lười" cực kỳ hiệu quả. Chạy tất cả các file .yaml có trong thư mục hiện tại theo đúng thứ tự.

* sudo kubectl delete -f .: Thu dọn chiến trường. Xóa toàn bộ những gì bạn đã tạo ra từ các file YAML trong thư mục.
------------------------------------------------------------------------------------------------------------------------------------
**Nhóm lệnh Giám sát (Quan sát hệ thống)**
Dùng để kiểm tra xem hệ thống có đang hoạt động đúng như thiết kế không.

* sudo kubectl get nodes: Kiểm tra trạng thái của các máy chủ (Worker/Master). Ở đồ án này, bạn sẽ thấy con Ubuntu của mình hiện chữ Ready.

* sudo kubectl get pods: Xem danh sách các Pod đang chạy.

Mẹo demo: Thêm đuôi -w (watch) thành sudo kubectl get pods -w để xem các Pod thay đổi trạng thái theo thời gian thực (rất ngầu khi demo).

* sudo kubectl get svc: Xem danh sách Service và các Port đang mở (chính là lệnh để bạn tìm ra số 30001 đang trỏ vào đâu).

* sudo kubectl get all: Lệnh tổng quát, hiển thị toàn bộ Pod, Service, Deployment đang có trong không gian làm việc.
--------------------------------------------------------------------------------------------------------------------------------
**Nhóm lệnh Bắt bệnh (Troubleshooting)**
Khi có sự cố (như Pod báo lỗi, web không vào được), đây là 2 lệnh "cứu cánh" để bạn tìm ra nguyên nhân:

* sudo kubectl describe pod <tên-pod-bị-lỗi>: In ra toàn bộ lịch sử vòng đời của Pod đó. (Ví dụ: Nếu cấu hình sai tên Image, cuối bảng log này sẽ báo lỗi ErrImagePull).

* sudo kubectl logs <tên-pod>: Xem log của ứng dụng bên trong. Nó sẽ in ra các dòng console.log từ file index.js của bạn.

 -----------------------------------------------------------------------------------------------------------------------------------
Nhóm lệnh "Ăn điểm" (Dùng lúc thuyết trình Demo)
Đây là những lệnh can thiệp trực tiếp vào hệ thống đang chạy để show các tính năng độc quyền của K8s.

**Demo Tự phục hồi (Self-healing):**
* sudo kubectl delete pod <copy-tên-một-pod-đang-chạy-vào-đây>
(Hệ thống sẽ ngay lập tức phát hiện thiếu 1 bản sao và tự tạo cái mới).

**Demo Cập nhật cuốn chiếu (Rolling Update):**
* sudo kubectl set image deployment/web-demo-deployment web-container=vinhh26/k8s-demo-web:v2
(Cập nhật phiên bản web từ v1 lên v2 mà không làm gián đoạn dịch vụ).

**Demo Mở rộng tức thời (Scaling):*8
* sudo kubectl scale deployment web-demo-deployment --replicas=10
(Tăng số lượng Pod từ 3 lên 10 ngay lập tức để chịu tải).

**Demo "Quay xe" (Rollback):**
* sudo kubectl rollout undo deployment/web-demo-deployment
(Nếu lỡ tay update bản v2 bị lỗi bug, gõ lệnh này hệ thống sẽ tự động khôi phục về bản v1 an toàn ngay lập tức).
----------------------------------------------------------------------------------------------------------------------------------
**Lệnh số 1: "Chui" hẳn vào bên trong Pod (Cực kỳ chuyên nghiệp)**

Lệnh: sudo kubectl exec -it <tên-pod> -- /bin/sh

Khi nào dùng: Khi bạn muốn chui trực tiếp vào cái "thùng hàng" đang chạy để gõ lệnh Linux (ví dụ kiểm tra xem trong thư mục code có file index.js không, hay thử ping ra ngoài internet từ bên trong Pod). Lệnh này thể hiện trình độ Troubleshoot cực cao. Muốn thoát ra thì gõ exit.

**Lệnh số 2: Xem lịch sử cập nhật trước khi "Quay xe"**

Lệnh: sudo kubectl rollout history deployment/web-demo-deployment

Khi nào dùng: Ở trên bạn đã có lệnh rollout undo để quay về bản cũ. Nhưng thực tế, trước khi quay về, quản trị viên luôn phải gõ lệnh history này để xem mình đã từng up những bản v1, v2, v3 nào, tránh việc rollback nhầm phiên bản.

**Lệnh số 3: Tắt Service, mở "cửa ngách" (Cứu cánh lúc Demo lỗi)**

Lệnh: sudo kubectl port-forward pod/<tên-pod> 8080:3000

Khi nào dùng: Giả sử lúc lên thuyết trình, file service.yaml của bạn tự nhiên bị lỗi, gõ cổng 30001 web không lên. Thay vì cuống cuồng tìm lỗi, bạn gõ lệnh này để đục một lỗ trực tiếp từ máy Ubuntu thẳng vào Pod qua cổng 8080. Sau đó mở trình duyệt gõ IP-Ubuntu:8080. Đây gọi là kỹ năng Bypass (đi vòng) rất thực tế khi xử lý sự cố.
-----------------------------------------------------------------------------------------------------------------------------------
Cần phải bật docker desktop
**Nhóm lệnh Build (Đóng gói)**
  docker build -t <username>/<tên-image>:<tag> <đường-dẫn>
  Ví dụ: docker build -t vinhh26/k8s-demo-web:v1 ./src
* -t: Đặt tên (tag) cho image.

* v1: Phiên bản (nên đánh số để quản lý Rolling Update).
* ./src: Thư mục chứa file Dockerfile.
----------------------------------------------------------------------------------------------------------------------------------
**Nhóm lệnh Push (Đưa lên kho)**
Sau khi build xong, image vẫn chỉ nằm ở máy Windows. Bạn cần đẩy nó lên Cloud để Ubuntu có thể kéo về.

* docker push <username>/<tên-image>:<tag>

Ví dụ: docker push vinhh26/k8s-demo-web:v1

Lưu ý: Tên image khi push phải y hệt tên lúc bạn build ở bước trên.
**Nhóm lệnh bổ trợ (Dọn dẹp & Kiểm tra)**
Vì Docker Desktop rất tốn ổ cứng và RAM, bạn nên biết các lệnh này để "dọn rác":

* docker ps: Xem các container đang chạy (nếu bạn chạy thử trên Windows).

* docker stop <container-id>: Dừng một container đang chạy.

* docker rm <container-id>: Xóa một container.

* docker rmi <image-id>: Xóa một image cũ để giải phóng dung lượng ổ cứng.

* docker system prune: Lệnh "tổng vệ sinh" - xóa sạch các container đã dừng và image thừa không dùng đến.
----------------------------------------------------------------------------------------------------------------------------------
**Nhóm lệnh Kiểm thử & Khắc phục lỗi (Test & Troubleshoot)**
1. docker images (Hoặc docker image ls)

Tác dụng: Liệt kê tất cả các Image đang có trên máy bạn.

Khi nào dùng: Vừa gõ lệnh docker build xong, bạn gõ lệnh này để kiểm tra xem Image vinhh26/k8s-demo-web:v1 đã thực sự được tạo ra chưa, dung lượng bao nhiêu.
2. docker run (Lệnh quan trọng để chạy thử)

Tác dụng: Chạy thử cái Image bạn vừa build thành một Container ngay trên Windows.

* Cú pháp: docker run -d -p 3000:3000 --name test-web <tên-image>

* Ví dụ: docker run -d -p 3000:3000 --name test-web vinhh26/k8s-demo-web:v1

-d: Chạy ngầm (không chiếm Terminal).

-p 3000:3000: Nối cổng 3000 của máy Windows vào cổng 3000 của Container.

Cách test: Chạy xong, mở Chrome gõ localhost:3000. Nếu web hiện lên màu xanh mượt mà, lúc đó bạn mới tự tin gõ docker push.
3. docker logs <container-id> (Bắt bệnh code lỗi)

Tác dụng: Xem các dòng chữ (log) mà ứng dụng in ra bên trong Container.

Khi nào dùng: Giả sử bạn chạy lệnh docker run ở trên, nhưng vào localhost:3000 web lại báo lỗi sập. Bạn gõ docker logs test-web để xem Node.js đang chửi thề dòng code nào bị sai (ví dụ: thiếu thư viện, gõ sai biến).
4. docker login (Đừng quên cái này)

Tác dụng: Đăng nhập vào Docker Hub.

Lưu ý: Bạn chỉ cần gõ 1 lần duy nhất, nhưng nên ghi vào note. Nếu không có lệnh này, lệnh docker push của bạn sẽ bị báo lỗi Access Denied ngay.

**Tóm lại quy trình chuẩn chỉnh của bạn sẽ là:**

1. Code xong -> 2. docker build -> 3. docker images (xem có chưa) -> 4. docker run (chạy thử xem web sống không) -> 5. docker stop & docker rm (xóa cái chạy thử đi cho nhẹ máy) -> 6. docker push (đẩy lên mạng cho K8s dùng).