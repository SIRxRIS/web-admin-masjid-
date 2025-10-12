# API Documentation - Laporan Jumat Public Endpoints

Dokumentasi ini menjelaskan API endpoints yang tersedia untuk mengakses data laporan Jumat dari project landing page eksternal.

## Base URL
```
https://your-domain.com/api/public
```

## Authentication
Semua endpoint di bawah `/api/public` tidak memerlukan autentikasi dan dapat diakses secara publik.

## Endpoints

### 1. Get Public Reports
Mengambil daftar laporan Jumat yang bersifat publik.

**Endpoint:** `GET /laporan-jumat`

**Query Parameters:**
- `limit` (optional): Jumlah laporan yang diambil (default: 10, max: 50)
- `offset` (optional): Offset untuk pagination (default: 0)
- `startDate` (optional): Tanggal mulai filter (format: YYYY-MM-DD)
- `endDate` (optional): Tanggal akhir filter (format: YYYY-MM-DD)

**Example Request:**
```bash
GET /api/public/laporan-jumat?limit=5&offset=0
GET /api/public/laporan-jumat?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tanggalLaporan": "2024-01-05",
      "fileName": "laporan-jumat-2024-01-05.pdf",
      "fileUrl": "https://supabase-url/storage/v1/object/public/laporan-jumat/...",
      "saldoKasJumatLalu": 1500000,
      "kotakAmalJumat": 250000,
      "totalSumbangan": 500000,
      "totalPengeluaran": 200000,
      "saldoKasHariIni": 2050000,
      "kasBsi": 1000000,
      "kasBankSulselbar": 800000,
      "kasTunai": 250000,
      "khatib": "Ustadz Ahmad",
      "muadzdzin": "Muhammad Ali",
      "imam": "Ustadz Budi",
      "ketuaPengurus": "Muhammad Arifin, SE",
      "bendahara": "Lalu Budiaksa",
      "createdAt": "2024-01-05T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

### 2. Get Specific Report
Mengambil detail laporan Jumat berdasarkan ID.

**Endpoint:** `GET /laporan-jumat/{id}`

**Path Parameters:**
- `id`: UUID dari laporan

**Example Request:**
```bash
GET /api/public/laporan-jumat/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "tanggalLaporan": "2024-01-05",
    "fileName": "laporan-jumat-2024-01-05.pdf",
    "fileUrl": "https://supabase-url/storage/v1/object/public/laporan-jumat/...",
    "saldoKasJumatLalu": 1500000,
    "kotakAmalJumat": 250000,
    "totalSumbangan": 500000,
    "totalPengeluaran": 200000,
    "saldoKasHariIni": 2050000,
    "kasBsi": 1000000,
    "kasBankSulselbar": 800000,
    "kasTunai": 250000,
    "khatib": "Ustadz Ahmad",
    "muadzdzin": "Muhammad Ali",
    "imam": "Ustadz Budi",
    "ketuaPengurus": "Muhammad Arifin, SE",
    "bendahara": "Lalu Budiaksa",
    "createdAt": "2024-01-05T10:30:00Z"
  }
}
```

### 3. Get Statistics
Mengambil statistik laporan Jumat untuk tahun tertentu.

**Endpoint:** `GET /laporan-jumat/stats`

**Query Parameters:**
- `year` (optional): Tahun untuk statistik (default: tahun saat ini)

**Example Request:**
```bash
GET /api/public/laporan-jumat/stats?year=2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "totalReports": 52,
    "publicReports": 45,
    "totalSumbangan": 26000000,
    "totalPengeluaran": 15000000,
    "averageSaldo": 2100000,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

## Error Responses

Semua endpoint dapat mengembalikan error response dengan format berikut:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `404`: Resource not found
- `500`: Internal server error

## CORS Support

Semua public endpoints mendukung CORS dengan konfigurasi berikut:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Usage Examples

### JavaScript/TypeScript
```typescript
// Fetch latest reports
const response = await fetch('https://your-domain.com/api/public/laporan-jumat?limit=5');
const data = await response.json();

if (data.success) {
  console.log('Reports:', data.data);
}

// Fetch specific report
const reportResponse = await fetch(`https://your-domain.com/api/public/laporan-jumat/${reportId}`);
const reportData = await reportResponse.json();

if (reportData.success) {
  console.log('Report:', reportData.data);
}

// Fetch statistics
const statsResponse = await fetch('https://your-domain.com/api/public/laporan-jumat/stats?year=2024');
const statsData = await statsResponse.json();

if (statsData.success) {
  console.log('Statistics:', statsData.data);
}
```

### React Hook Example
```typescript
import { useState, useEffect } from 'react';

interface LaporanJumat {
  id: string;
  tanggalLaporan: string;
  fileName: string;
  fileUrl: string;
  // ... other fields
}

export function useLaporanJumat(limit = 10) {
  const [reports, setReports] = useState<LaporanJumat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch(`https://your-domain.com/api/public/laporan-jumat?limit=${limit}`);
        const data = await response.json();
        
        if (data.success) {
          setReports(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [limit]);

  return { reports, loading, error };
}
```

## Notes

1. Semua tanggal menggunakan format ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
2. Semua nilai mata uang dalam Rupiah (IDR) tanpa desimal
3. File URL mengarah langsung ke Supabase Storage dan dapat diakses publik
4. Hanya laporan dengan `is_public: true` yang dapat diakses melalui API ini
5. API ini read-only, tidak ada endpoint untuk create/update/delete