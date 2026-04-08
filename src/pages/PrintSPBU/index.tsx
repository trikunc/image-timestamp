import { useState, useMemo, useRef } from "react";

const fuelPrices: any = {
  PERTALITE: 10000,
  PERTAMAX: 12300,
};

export default function PrintSPBU() {
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    datetime: "2026-03-10T07:56",
    receiptNo: "1180",
    pumpNo: "11",
    grade: "PERTALITE",
    volume: 5,
    vehicleNo: "AD4512NQ",
  });

  const formatDateTimeParts = (value: string) => {
    if (!value) return { date: "", time: "" };

    const d = new Date(value);

    const date = `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;

    const time = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;

    return { date, time };
  };

  const { date, time } = formatDateTimeParts(form.datetime);

  console.log("Current Form State:", form);

  const unitPrice = useMemo(() => {
    return fuelPrices[form.grade];
  }, [form.grade]);

  const amount = useMemo(() => {
    return form.volume * unitPrice;
  }, [form.volume, unitPrice]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "volume" ? parseFloat(value) || 0 : value,
    }));
  };

  const isAndroid = () => /android/i.test(navigator.userAgent);

  const handlePrint = () => {
    if (!printRef.current) return;

    // ✅ ANDROID (RAWBT)
    if (isAndroid()) {
      const WIDTH = 32;

      const formatLine = (left: string, right: string) => {
        const space = WIDTH - left.length - right.length;
        return left + " ".repeat(space > 0 ? space : 1) + right;
      };

      const centerText = (text: string) => {
        const pad = Math.floor((WIDTH - text.length) / 2);
        return " ".repeat(pad > 0 ? pad : 0) + text;
      };

      const leftText = (text: string) => text; // biar konsisten

      // const spacer = (lines = 1) => "\n".repeat(lines);

      const rawText = `
${leftText('\n')}
\x1B\x21\x30
${centerText('PERTAMINA "PASTI PAS"')}
\x1B\x21\x00
${leftText('SPBU 44.552.11')}
${leftText('JL. KYAI MOJO 52 YOGYAKARTA')}
${leftText('TELP. 0274-523871')}
${leftText('\n')}
${formatLine(date, time)}
${leftText(`Receipt No. : ${form.receiptNo}`)}
${leftText('\n')}
${formatLine("Pump No.", form.pumpNo)}
${formatLine("Grade", form.grade)}
${formatLine("Volume(L)", form.volume.toFixed(2))}
${formatLine("Unit Price(Rp./L)", unitPrice.toString())}
${formatLine("Amount", amount.toString())}
${leftText('\n')}
${formatLine("Vehicle No.", form.vehicleNo)}
${leftText('\n')}
${leftText('PREMIUM UNTUK GOLTIDAK MAMPU')}
${leftText('MARI GUNAKAN BBM NON SUBSIDI')}
${leftText('TERIMA KASIH DAN SELAMAT JALAN')}
${leftText('\n')}
`.trim();

      const encoded = encodeURIComponent(rawText);
      window.location.href = `rawbt:${encoded}`;
      return;
    }

    // ✅ BROWSER PRINT
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=350,height=600");

    printWindow!.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @media print {
              body {
                margin: 0;
                width: 80mm;
                font-size: 14px;
                font-family: monospace;
              }
              .receipt {
                padding: 10px;
              }
              .center {
                text-align: center;
              }
              .row {
                display: flex;
                justify-content: space-between;
              }
              hr {
                border: none;
                border-top: 1px dashed black;
                margin: 6px 0;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="receipt">${printContents}</div>
        </body>
      </html>
    `);

    printWindow!.document.close();
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Fuel Receipt Generator</h2>

      {/* FORM */}
      <div style={{ maxWidth: 400 }}>
        <input
          type="datetime-local"
          name="datetime"
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          type="text"
          name="receiptNo"
          placeholder="Receipt No"
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          type="text"
          name="pumpNo"
          value={form.pumpNo}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <select
          name="grade"
          value={form.grade}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10 }}
        >
          <option value="PERTALITE">PERTALITE</option>
          <option value="PERTAMAX">PERTAMAX</option>
        </select>

        <input
          type="number"
          name="volume"
          placeholder="Volume (L)"
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          type="text"
          value={`Unit Price: ${unitPrice}`}
          disabled
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          type="text"
          value={`Amount: ${amount}`}
          disabled
          style={{ width: "100%", marginBottom: 10 }}
        />

        <input
          type="text"
          name="vehicleNo"
          placeholder="Vehicle No"
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <button onClick={handlePrint} style={{ width: "100%", padding: 10 }}>
          PRINT
        </button>
      </div>

      {/* PREVIEW STRUK */}
      <div
        ref={printRef}
        style={{
          marginTop: 30,
          width: 300,
          padding: 10,
          border: "1px solid #000",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center", fontSize: 20 }}>PERTAMINA "PASTI PAS"</div>
        <div style={{ textAlign: "left", fontSize: 14, }}>
          <div>SPBU 44.552.11</div>
          <div>JL. KYAI MOJO 52 YOGYAKARTA</div>
          <div>TELP. 0274-523871</div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span>{date}</span>
            <span>{time}</span>
          </div>
          <div style={{ display: "flex", fontSize: 14 }}>
            <span>{`Receipt No. : `}{form.receiptNo}</span>
          </div>
        </div>


        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span>Pump No.</span>
            <span>{form.pumpNo}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span>Grade</span>
            <span>{form.grade}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span>Volume(L)</span>
            <span>{form.volume.toFixed(2)}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span>Unit Price(Rp./L)</span>
            <span>{unitPrice}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <b>Amount</b>
            <b>{amount}</b>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <div>
            Vehicle No.
          </div>
          <div>
            {form.vehicleNo}
          </div>
        </div>

        <div style={{ textAlign: "left", fontSize: 14, }}>
          <div>PREMIUM UNTUK GOLTIDAK MAMPU</div>
          <div>MARI GUNAKAN BBM NON SUBSIDI</div>
          <div>TERIMA KASIH DAN SELAMAT JALAN</div>
        </div>
      </div>
    </div>
  );
}