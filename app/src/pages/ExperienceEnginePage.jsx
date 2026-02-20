import { useState, useEffect } from "react";

export default function ExperienceEnginePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/experience-engine")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateSetting = async (key, value) => {
    setSaving(true);
    try {
      const res = await fetch("/api/experience-engine", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
      }
    } catch (_) {}
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Se încarcă...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">🎭 Experience Engine</h1>
      <p className="text-gray-400 mb-6">Mood Music · Smart Lighting · Ambient Control · Smart Signage</p>
      {saving && <div className="mb-4 text-sm text-blue-400">Se salvează...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4">🎵 Mood-Based Music</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Mood Activ</label>
              <div className="flex gap-2 flex-wrap">
                {["energetic", "relaxed", "romantic", "upbeat", "ambient"].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => updateSetting("musicMood", mood)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      data?.musicMood === mood
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {mood === "energetic" ? "⚡" : mood === "relaxed" ? "😌" : mood === "romantic" ? "❤️" : mood === "upbeat" ? "🎉" : "🌊"} {mood}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Volum: {data?.musicVolume ?? 50}%</label>
              <input
                type="range" min={0} max={100} value={data?.musicVolume ?? 50}
                onChange={(e) => updateSetting("musicVolume", Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-sm">
              <div className="text-gray-400">Cântec curent</div>
              <div className="font-semibold mt-1">{data?.currentTrack ?? "—"}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4">💡 Smart Lighting</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Scenă Activă</label>
              <div className="flex gap-2 flex-wrap">
                {["bright", "dim", "candlelight", "party", "morning"].map((scene) => (
                  <button
                    key={scene}
                    onClick={() => updateSetting("lightScene", scene)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      data?.lightScene === scene
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {scene === "bright" ? "☀️" : scene === "dim" ? "🌙" : scene === "candlelight" ? "🕯️" : scene === "party" ? "🎊" : "🌅"} {scene}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Intensitate: {data?.lightIntensity ?? 70}%</label>
              <input
                type="range" min={0} max={100} value={data?.lightIntensity ?? 70}
                onChange={(e) => updateSetting("lightIntensity", Number(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Temperatură culoare</label>
              <div className="flex items-center gap-3">
                <span className="text-orange-300 text-sm">Cald</span>
                <input
                  type="range" min={2700} max={6500} value={data?.colorTemp ?? 4000}
                  onChange={(e) => updateSetting("colorTemp", Number(e.target.value))}
                  className="flex-1 accent-orange-400"
                />
                <span className="text-blue-300 text-sm">Rece</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4">🌡️ Ambient Control</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Temperatură Setpoint</span>
              <div className="flex items-center gap-3">
                <button onClick={() => updateSetting("temperature", (data?.temperature ?? 22) - 0.5)}
                  className="w-8 h-8 bg-blue-700 hover:bg-blue-600 rounded-lg flex items-center justify-center font-bold">−</button>
                <span className="font-bold text-xl w-16 text-center">{data?.temperature ?? 22}°C</span>
                <button onClick={() => updateSetting("temperature", (data?.temperature ?? 22) + 0.5)}
                  className="w-8 h-8 bg-red-700 hover:bg-red-600 rounded-lg flex items-center justify-center font-bold">+</button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Peak Hour Acoustic: {data?.acousticMode ?? "normal"}</label>
              <div className="flex gap-2">
                {["quiet", "normal", "loud"].map((m) => (
                  <button key={m}
                    onClick={() => updateSetting("acousticMode", m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${data?.acousticMode === m ? "bg-green-700 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                  >{m === "quiet" ? "🤫 Quiet" : m === "normal" ? "🔊 Normal" : "🎉 Loud"}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4">📺 Smart Signage Engine</h2>
          <div className="space-y-3">
            {(data?.signageScreens ?? []).map((screen) => (
              <div key={screen.id} className="bg-gray-700/40 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{screen.name}</div>
                  <div className="text-xs text-gray-400">{screen.location} · {screen.currentContent}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${screen.online ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                  {screen.online ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
