import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import "./App.css";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

type LatLng = {
  lat: number;
  lng: number;
};

type Orientation = "portrait" | "landscape";

export default function App() {
  const captureRef = useRef<HTMLDivElement | null>(null);

  const [image, setImage] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [address, setAddress] = useState("");

  const [embedInput, setEmbedInput] = useState("");
  const [location, setLocation] = useState<LatLng | null>(null);

  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  /* =========================
     FONT CONFIG
     ========================= */
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("normal");
  const [fontSize, setFontSize] = useState(18);
  const [fontColor, setFontColor] = useState("#ffffff");

  /* =========================
     MAP CONFIG
     ========================= */
  const [mapWidth, setMapWidth] = useState(180);
  const [mapHeight, setMapHeight] = useState(180);
  const [mapZoom, setMapZoom] = useState(16);

  /* =========================
     STATIC MAP URL
     ========================= */
  const staticMapUrl = location
    ? `https://maps.googleapis.com/maps/api/staticmap
        ?center=${location.lat},${location.lng}
        &zoom=${mapZoom}
        &size=${mapWidth}x${mapHeight}
        &scale=2
        &maptype=roadmap
        &markers=color:red|${location.lat},${location.lng}
        &key=${GOOGLE_API_KEY}`.replace(/\s/g, "")
    : null;

  /* =========================
     HANDLERS
     ========================= */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalFile(file);
  };

  const cropImage = (file: File, orientation: Orientation) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const imgW = img.width;
      const imgH = img.height;

      const targetRatio = orientation === "portrait" ? 3 / 4 : 4 / 3;

      let cropW = imgW;
      let cropH = imgH;

      if (imgW / imgH > targetRatio) {
        cropH = imgH;
        cropW = imgH * targetRatio;
      } else {
        cropW = imgW;
        cropH = imgW / targetRatio;
      }

      const cropX = (imgW - cropW) / 2;
      const cropY = (imgH - cropH) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          setImage(URL.createObjectURL(blob));
        },
        "image/jpeg",
        0.95,
      );
    };
  };

  const handleEmbedChange = (value: string) => {
    setEmbedInput(value);
    const parsed = extractLatLngFromEmbed(value);
    if (parsed) setLocation(parsed);
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;

    const canvas = await html2canvas(captureRef.current, {
      useCORS: true,
      backgroundColor: null,
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = "capture.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  /* =========================
     AUTO FETCH ADDRESS
     ========================= */

  useEffect(() => {
    if (originalFile) {
      cropImage(originalFile, orientation);
    }
  }, [originalFile, orientation]);

  useEffect(() => {
    if (!location) return;

    const fetchAddress = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${GOOGLE_API_KEY}`,
        );
        const data = await res.json();

        if (data.results?.length) {
          setAddress(data.results[0].formatted_address.replace(/,\s*/g, "\n"));
        }
      } catch (err) {
        console.error("Geocode error", err);
      }
    };

    fetchAddress();
  }, [location]);

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {!image && (
          <div className="bg-white p-6 rounded-xl shadow flex items-center justify-center">
            <label className="cursor-pointer flex gap-3 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="px-4 py-2 bg-black text-white rounded">
                Upload Image
              </span>
            </label>
          </div>
        )}

        {image && (
          <div className="flex flex-col gap-4">
            <div
              ref={captureRef}
              className={`relative bg-black w-full mx-auto overflow-hidden ${orientation === "portrait"
                ? "aspect-[3/4] max-w-[420px]"
                : "aspect-[4/3] max-w-[640px]"
                }`}
            >
              <img
                src={image}
                alt="preview"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* TEXT */}
              <div
                className="absolute bottom-3 right-3 text-right text-stroke"
                style={{
                  color: fontColor,
                  fontWeight,
                  fontSize: `${fontSize}px`,
                }}
              >
                {dateTime && (
                  <div>
                    {new Date(dateTime).toLocaleString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </div>
                )}
                <pre className="whitespace-pre-line leading-tight">
                  {address}
                </pre>
              </div>

              {/* MAP */}
              {staticMapUrl && (
                <div
                  className="absolute bottom-0 left-0 shadow-lg rounded overflow-hidden"
                  style={{
                    width: mapWidth,
                    height: mapHeight,
                  }}
                >
                  <img
                    src={staticMapUrl}
                    alt="map"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    style={{
                      opacity: 0.75,
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-green-600 text-white rounded shadow"
            >
              Download Screenshot
            </button>
          </div>
        )}

        {/* CONTROLS */}
        <div className="bg-white p-6 rounded-xl shadow space-y-6">
          <div>
            <h3 className="font-semibold mb-2">🖼️ Image Orientation</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setOrientation("portrait")}
                className={`px-4 py-2 rounded border ${orientation === "portrait"
                  ? "bg-black text-white"
                  : "bg-white"
                  }`}
              >
                Portrait (3:4)
              </button>

              <button
                onClick={() => setOrientation("landscape")}
                className={`px-4 py-2 rounded border ${orientation === "landscape"
                  ? "bg-black text-white"
                  : "bg-white"
                  }`}
              >
                Landscape (4:3)
              </button>
            </div>
          </div>
          {/* GMAP */}
          <div>
            <h3 className="font-semibold mb-2">📍 GMap Location</h3>
            <textarea
              rows={4}
              value={embedInput}
              onChange={(e) => handleEmbedChange(e.target.value)}
              placeholder="Paste Google Maps link or embed iframe here"
              className="w-full border px-3 py-2 rounded font-mono text-sm"
            />
          </div>

          {/* DATETIME */}
          <div>
            <h3 className="font-semibold mb-2">🕒 Date & Time</h3>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              step="1"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* TEXT STYLE */}
          <div>
            <h3 className="font-semibold mb-2">🎨 Location Text Style</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={fontWeight}
                onChange={(e) =>
                  setFontWeight(e.target.value as "normal" | "bold")
                }
                className="border px-3 py-2 rounded"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>

              <input
                type="number"
                min={8}
                max={32}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="border px-3 py-2 rounded"
              />

              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="h-10 w-full border rounded"
              />
            </div>
          </div>

          {/* MAP SIZE */}
          <div>
            <h3 className="font-semibold mb-2">🗺️ Map Size</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="number"
                min={80}
                max={400}
                value={mapWidth}
                onChange={(e) => setMapWidth(Number(e.target.value))}
                className="border px-3 py-2 rounded"
                placeholder="Width (px)"
              />

              <input
                type="number"
                min={80}
                max={400}
                value={mapHeight}
                onChange={(e) => setMapHeight(Number(e.target.value))}
                className="border px-3 py-2 rounded"
                placeholder="Height (px)"
              />

              <input
                type="range"
                min={10}
                max={20}
                value={mapZoom}
                onChange={(e) => setMapZoom(Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Zoom: {mapZoom}</p>
          </div>

          {/* ADDRESS */}
          <div>
            <h3 className="font-semibold mb-2">📄 Location</h3>
            <textarea
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border px-3 py-2 rounded bg-gray-100 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   EMBED PARSER
   ========================= */
function extractLatLngFromEmbed(input: string): LatLng | null {
  const matches = [...input.matchAll(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/g)];
  if (!matches.length) return null;

  const last = matches[matches.length - 1];
  return {
    lat: parseFloat(last[1]),
    lng: parseFloat(last[2]),
  };
}
