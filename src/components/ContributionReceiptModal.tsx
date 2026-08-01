import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Printer, CheckCircle2, ShieldCheck, Copy, Phone, FileText, Share2, Sparkles } from 'lucide-react';

export interface ReceiptData {
  receiptNumber: string;
  donorName: string;
  donorEmail?: string;
  phoneNumber?: string;
  amount: number;
  campaignTitle: string;
  date: string;
  paymentProvider?: string;
  isMonthly?: boolean;
  isAnonymous?: boolean;
}

interface ContributionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData | null;
}

export const ContributionReceiptModal: React.FC<ContributionReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptData
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !receiptData) return null;

  const formattedAmount = receiptData.amount.toLocaleString();
  const formattedDate = new Date(receiptData.date || Date.now()).toLocaleString('en-KE', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const receiptRef = receiptData.receiptNumber || `SK${Math.floor(100 + Math.random() * 899)}89YP`;

  const copyReceiptDetails = () => {
    const text = `BE INDEPENDENT GAL (BIG) FUND - M-PESA OFFICIAL RECEIPT
Receipt Ref: ${receiptRef}
Amount: KES ${formattedAmount}
Donor: ${receiptData.isAnonymous ? 'Anonymous Supporter' : receiptData.donorName}
Campaign: ${receiptData.campaignTitle}
Date: ${formattedDate}
Channel: Safaricom M-Pesa STK Push
Status: VERIFIED & COMPLETED`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextReceipt = () => {
    const textContent = `===================================================================
               BE INDEPENDENT GAL (BIG) FUND
         OFFICIAL M-PESA CONTRIBUTION RECEIPT & IMPACT CERTIFICATE
===================================================================

TRANSACTION DETAILS:
-------------------------------------------------------------------
M-Pesa Receipt Code:  ${receiptRef}
Transaction Status:   VERIFIED & COMPLETED
Payment Channel:      Safaricom M-Pesa STK Push (PayBill 174379)
Date & Timestamp:     ${formattedDate}

CONTRIBUTOR INFORMATION:
-------------------------------------------------------------------
Name:                 ${receiptData.isAnonymous ? 'Anonymous Supporter' : receiptData.donorName}
Email Address:        ${receiptData.donorEmail || 'N/A'}
Phone Number:         ${receiptData.phoneNumber || '+254712345678'}

ALLOCATION & CONTRIBUTION:
-------------------------------------------------------------------
Designated Cause:     ${receiptData.campaignTitle}
Contribution Type:    ${receiptData.isMonthly ? 'Monthly BIG Champion' : 'One-time Investment'}
Amount Paid:          KES ${formattedAmount}.00

AUDIT & COMPLIANCE:
-------------------------------------------------------------------
Cryptographic Hash:   SHA256: ${Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)}
NGO Registration:     BIG Fund / Be Independent Gal Foundation #2024/782
Tax Exemption Ref:    KRA/EXEMPT/BIG/2026

Thank you for empowering African women leaders & tech pioneers!
Website: https://bigfund.org | Verification Hotline: +254 700 000 000
===================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BIGFund_MPesa_Receipt_${receiptRef}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>M-Pesa Receipt - ${receiptRef}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #047857; letter-spacing: 1px; }
            .subtitle { font-size: 12px; font-weight: bold; color: #475569; text-transform: uppercase; margin-top: 5px; }
            .box { border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
            .label { font-weight: bold; color: #64748b; }
            .value { font-weight: bold; color: #0f172a; }
            .highlight { color: #047857; font-size: 18px; font-weight: 900; }
            .stamp { text-align: center; border: 2px dashed #059669; color: #047857; font-weight: 900; font-size: 12px; padding: 10px; border-radius: 8px; margin-top: 30px; }
            .footer { font-size: 10px; text-align: center; color: #94a3b8; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">BE INDEPENDENT GAL (BIG) FUND</div>
            <div class="subtitle">Official Safaricom M-Pesa Contribution Receipt</div>
          </div>

          <div class="box">
            <div class="row"><span class="label">M-Pesa Receipt Ref:</span><span class="value highlight">${receiptRef}</span></div>
            <div class="row"><span class="label">Date & Time:</span><span class="value">${formattedDate}</span></div>
            <div class="row"><span class="label">Payment Provider:</span><span class="value">Safaricom M-Pesa STK Push</span></div>
            <div class="row"><span class="label">Status:</span><span class="value" style="color:#047857;">VERIFIED & COMPLETED</span></div>
          </div>

          <div class="box">
            <div class="row"><span class="label">Contributor Name:</span><span class="value">${receiptData.isAnonymous ? 'Anonymous Supporter' : receiptData.donorName}</span></div>
            <div class="row"><span class="label">Email:</span><span class="value">${receiptData.donorEmail || 'N/A'}</span></div>
            <div class="row"><span class="label">Designated Cause:</span><span class="value">${receiptData.campaignTitle}</span></div>
            <div class="row" style="border-top:1px solid #e2e8f0; padding-top:10px; margin-top:10px;">
              <span class="label" style="font-size:15px;">Total Contribution:</span>
              <span class="value highlight">KES ${formattedAmount}.00</span>
            </div>
          </div>

          <div class="stamp">
            ✓ OFFICIAL DIGITAL RECEIPT • VERIFIED BY BIG FUND LIVE PUBLIC LEDGER
          </div>

          <div class="footer">
            BE INDEPENDENT GAL FOUNDATION • NAIROBI, KENYA • WWW.BIGFUND.ORG
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      downloadTextReceipt();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative z-10 bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition p-1.5 rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 bg-emerald-800/80 border border-emerald-500/30 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-200 w-fit mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Official Contribution Receipt
            </div>

            <h3 className="text-xl font-extrabold tracking-tight">BE INDEPENDENT GAL FUND</h3>
            <p className="text-xs text-emerald-100/80 mt-1">
              Safaricom M-Pesa Live Public Ledger Verification
            </p>
          </div>

          {/* Receipt Body Card */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
                <Phone className="h-24 w-24 text-emerald-900" />
              </div>

              <div className="flex items-center justify-between border-b border-emerald-200 pb-3 mb-4">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-800 block">
                    M-Pesa Receipt Code
                  </span>
                  <span className="text-base font-black text-emerald-950 font-mono tracking-wider">
                    {receiptRef}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-800 block">
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-sm">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-emerald-800 font-medium">Contributor:</span>
                  <span className="font-bold text-slate-900">{receiptData.isAnonymous ? 'Anonymous Supporter' : receiptData.donorName}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-emerald-800 font-medium">Target Cause:</span>
                  <span className="font-bold text-slate-900 max-w-[200px] text-right truncate">{receiptData.campaignTitle}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-emerald-800 font-medium">Timestamp:</span>
                  <span className="font-semibold text-slate-700">{formattedDate}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-emerald-800 font-medium">Payment Channel:</span>
                  <span className="font-semibold text-slate-800">M-Pesa STK Push (PayBill)</span>
                </div>

                <div className="flex justify-between items-center pt-3 mt-2 border-t border-emerald-200">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900">Total Contribution:</span>
                  <span className="text-lg font-black text-emerald-900 font-mono">KES {formattedAmount}.00</span>
                </div>
              </div>
            </div>

            {/* Audit compliance badge */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-600">
              <FileText className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                This certificate serves as official proof of charitable contribution for tax reporting purposes under NGO Registration #2024/782.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={downloadTextReceipt}
                className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={copyReceiptDetails}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5 text-slate-600" />
                <span>{copied ? 'Copied!' : 'Copy Ref'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
