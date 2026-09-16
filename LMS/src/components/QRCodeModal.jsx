import React, { useRef } from "react";

export const QRCodeModal = ({ equipment, item, isOpen, onClose }) => {
  const printRef = useRef(null);
  const targetItem = equipment || item;

  if (!isOpen || !targetItem) return null;

  const qrPayload = JSON.stringify({
    assetId: targetItem._id || "N/A",
    name: targetItem.EquipmentName || "Equipment",
    status: targetItem.Status || "Available",
    qty: targetItem.Quantity || 0,
    system: "LMS-Asset-Tag"
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&format=svg&data=${encodeURIComponent(
    qrPayload
  )}`;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print asset tags.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Tag - ${targetItem.EquipmentName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f8fafc;
            }
            .asset-tag {
              border: 2px dashed #0f172a;
              border-radius: 12px;
              padding: 24px;
              width: 320px;
              background: #ffffff;
              text-align: center;
            }
            .title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
            .subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 16px; }
            .qr-img { width: 180px; height: 180px; margin: 0 auto 16px auto; }
            .meta { font-size: 12px; color: #334155; line-height: 1.5; text-align: left; background: #f1f5f9; padding: 10px; border-radius: 6px; }
            .meta div { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="asset-tag">
            <div class="title">LAB ASSET TAG</div>
            <div class="subtitle">Lab Management System</div>
            <img class="qr-img" src="${qrImageUrl}" alt="QR Code" />
            <div class="meta">
              <div><strong>Asset:</strong> <span>${targetItem.EquipmentName}</span></div>
              <div><strong>ID:</strong> <span style="font-family: monospace;">${(targetItem._id || "").slice(-8)}</span></div>
              <div><strong>Quantity:</strong> <span>${targetItem.Quantity}</span></div>
              <div><strong>Status:</strong> <span>${targetItem.Status || "Available"}</span></div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `QR_${targetItem.EquipmentName.replace(/\s+/g, "_")}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <div className="lms-modal-backdrop" onClick={onClose}>
      <div className="lms-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="lms-modal-header d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-qr-code text-primary fs-5"></i>
            <div>
              <h6 className="mb-0 fw-bold">{targetItem.EquipmentName}</h6>
              <small className="text-muted">Asset ID: {(targetItem._id || "").slice(-8).toUpperCase()}</small>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>

        <div className="lms-modal-body text-center p-4" ref={printRef}>
          <div className="qr-badge-preview p-3 mx-auto rounded-3 mb-3 bg-white border d-inline-block">
            <img
              src={qrImageUrl}
              alt="Asset QR Code"
              className="qr-code-display mb-2 rounded"
              style={{ width: "180px", height: "180px" }}
            />
            <div className="asset-details text-start p-2.5 rounded-2 mt-2" style={{ backgroundColor: "#f1f5f9", color: "#0f172a" }}>
              <div className="d-flex justify-content-between mb-1">
                <span className="small" style={{ color: "#475569" }}>Asset Name:</span>
                <span className="fw-bold small" style={{ color: "#0f172a" }}>{targetItem.EquipmentName}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="small" style={{ color: "#475569" }}>Inventory Qty:</span>
                <span className="badge bg-primary">{targetItem.Quantity} units</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="small" style={{ color: "#475569" }}>Status:</span>
                <span className="badge bg-success-subtle text-success">{targetItem.Status || "Available"}</span>
              </div>
            </div>
          </div>
          <p className="text-muted small px-2 mb-0">
            Scan with any device camera or scanner to view live inventory status.
          </p>
        </div>

        <div className="lms-modal-footer d-flex justify-content-end gap-2 p-3 border-top">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={handleDownload}>
            <i className="bi bi-download"></i> Download SVG
          </button>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={handlePrint}>
            <i className="bi bi-printer"></i> Print Tag
          </button>
        </div>
      </div>
    </div>
  );
};
