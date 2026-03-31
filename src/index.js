import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as k8s from '@kubernetes/client-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Cấu hình để Express tin tưởng các header từ Proxy (giúp lấy đúng IP người dùng trong K8s)
app.set('trust proxy', true);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// --- BỘ NHỚ LƯU TRỮ RATE LIMIT TẠM THỜI ---
const loginAttempts = {}; 

const kc = new k8s.KubeConfig();
try {
    kc.loadFromCluster();
} catch (e) {
    kc.loadFromDefault();
}
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// 1. Tuyến đường cho trang Login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// 2. API xác thực mật khẩu có RATE LIMIT (Tối đa 5 lần)
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    
    // Lấy IP: ưu tiên lấy từ header 'x-forwarded-for' do K8s Service chuyển tới
    const clientIp = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    const securePassword = process.env.ADMIN_PASSWORD || "admin123"; 

    console.log(`[Login Attempt] IP: ${clientIp} đang thử đăng nhập...`);

    // Kiểm tra xem IP này có đang bị khóa không
    if (loginAttempts[clientIp] && loginAttempts[clientIp].attempts >= 5) {
        const lockoutTime = 15 * 60 * 1000; // Khóa 15 phút
        const timePassed = Date.now() - loginAttempts[clientIp].lastAttempt;

        if (timePassed < lockoutTime) {
            const timeLeft = Math.ceil((lockoutTime - timePassed) / 1000 / 60);
            return res.status(429).json({ 
                success: false, 
                message: `Bạn đã nhập sai quá nhiều. Thử lại sau ${timeLeft} phút!` 
            });
        } else {
            // Hết thời gian phạt thì reset để người dùng thử lại
            loginAttempts[clientIp].attempts = 0;
        }
    }

    if (password === securePassword) {
        // Đăng nhập đúng: Xóa lịch sử vi phạm của IP này
        delete loginAttempts[clientIp];
        console.log(`[Success] IP: ${clientIp} đã đăng nhập thành công.`);
        res.json({ success: true });
    } else {
        // Đăng nhập sai: Ghi nhận và tăng số lần đếm
        if (!loginAttempts[clientIp]) {
            loginAttempts[clientIp] = { attempts: 1, lastAttempt: Date.now() };
        } else {
            loginAttempts[clientIp].attempts++;
            loginAttempts[clientIp].lastAttempt = Date.now();
        }

        const remaining = 5 - loginAttempts[clientIp].attempts;
        console.log(`[Failed] IP: ${clientIp} sai mật khẩu. Còn ${remaining} lần.`);

        res.status(401).json({ 
            success: false, 
            message: remaining > 0 ? `Sai mật khẩu! Bạn còn ${remaining} lần thử.` : "Bạn đã bị khóa do nhập sai quá 5 lần!" 
        });
    }
});

// 3. API lấy dữ liệu Cluster
app.get('/api/data', async (req, res) => {
    try {
        const [podsRes, nodesRes, svcRes] = await Promise.all([
            k8sApi.listNamespacedPod({ namespace: 'default' }),
            k8sApi.listNode(),
            k8sApi.listNamespacedService({ namespace: 'default' })
        ]);

        const pods = podsRes.items.map(p => ({
            name: p.metadata.name,
            status: p.status.phase,
            ip: p.status.podIP || 'N/A',
            restarts: p.status.containerStatuses ? p.status.containerStatuses[0].restartCount : 0
        }));

        const nodes = nodesRes.items.map(n => ({
            name: n.metadata.name,
            status: n.status.conditions.find(c => c.type === 'Ready').status === 'True' ? 'Ready' : 'Not Ready',
            cpu: n.status.capacity.cpu,
            ram: n.status.capacity.memory
        }));

        res.json({
            stats: { pods: pods.length, nodes: nodes.length, services: svcRes.items.length },
            pods: pods,
            nodes: nodes,
            servingPod: process.env.HOSTNAME || 'Local-Machine'
        });
    } catch (err) {
        console.error("K8s API Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => console.log(`Server v9.1 (Rate Limit) đang chạy tại port ${port}`));