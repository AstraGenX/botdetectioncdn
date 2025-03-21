(() => {
    let botFlags = {
        linearMovement: false,
        rapidScroll: false,
        abnormalKeystrokes: false,
        vpnDetected: false,
        multipleFlags: false
    };

    let movementData = [];
    let lastScrollTime = 0;
    let lastKeyTime = 0;
    
    // Use a worker for intensive calculations
    let workerCode = `
        self.onmessage = function(event) {
            let { type, data } = event.data;

            if (type === "analyzeMovement") {
                let straightLineMoves = 0;
                for (let i = 1; i < data.length; i++) {
                    let dx = Math.abs(data[i].x - data[i - 1].x);
                    let dy = Math.abs(data[i].y - data[i - 1].y);
                    if ((dx === 0 || dy === 0 || dx / dy > 10 || dy / dx > 10) && dx + dy > 2) {
                        straightLineMoves++;
                    }
                }
                if (straightLineMoves > 3) postMessage({ type: "linearMovement", detected: true });
            }
        };
    `;
    
    let workerBlob = new Blob([workerCode], { type: "application/javascript" });
    let botWorker = new Worker(URL.createObjectURL(workerBlob));

    botWorker.onmessage = (event) => {
        if (event.data.type === "linearMovement" && event.data.detected) {
            botFlags.linearMovement = true;
            checkBot();
        }
    };

    // Optimized Mouse Movement Detection
    document.addEventListener("mousemove", (event) => {
        movementData.push({ x: event.clientX, y: event.clientY });
        if (movementData.length > 5) {
            botWorker.postMessage({ type: "analyzeMovement", data: movementData });
            movementData = []; // Reset data
        }
    });

    // Optimized Scroll Detection
    document.addEventListener("scroll", () => {
        let now = performance.now();
        if (now - lastScrollTime < 50) {
            botFlags.rapidScroll = true;
            checkBot();
        }
        lastScrollTime = now;
    });

    // Optimized Keystroke Detection
    document.addEventListener("keydown", () => {
        let now = performance.now();
        if (lastKeyTime !== 0) {
            let interval = now - lastKeyTime;
            if (interval < 30) { 
                botFlags.abnormalKeystrokes = true;
                checkBot();
            }
        }
        lastKeyTime = now;
    });

    // VPN Detection via External API
    async function detectVPN() {
        try {
            let res = await fetch("https://api.ipify.org?format=json");
            let { ip } = await res.json();
            
            let vpnCheck = await fetch(`https://vpnapi.io/api/${ip}?key=YOUR_VPNAPI_KEY`);
            let vpnData = await vpnCheck.json();

            if (vpnData.security.vpn || vpnData.security.proxy) {
                botFlags.vpnDetected = true;
                checkBot();
            }
        } catch (error) {
            console.error("VPN detection failed", error);
        }
    }
    detectVPN();

    // Final bot evaluation and alert
    function checkBot() {
        let activeFlags = Object.entries(botFlags).filter(([_, value]) => value);
        if (activeFlags.length >= 2) {
            botFlags.multipleFlags = true;
            alert(`🚨 Bot detected! Suspicious activity:\n${activeFlags.map(f => `- ${f[0]}`).join("\n")}`);
        }
    }
})();
